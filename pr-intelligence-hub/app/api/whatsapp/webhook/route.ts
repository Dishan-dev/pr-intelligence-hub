import { NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/whatsapp/verify";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractWhatsAppOpportunity } from "@/lib/whatsapp/extract";
import { findDuplicateDiscovery } from "@/lib/whatsapp/deduplicate";
import { sendGoogleChatNotification } from "@/lib/notifications/google-chat";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && process.env.WHATSAPP_VERIFY_TOKEN && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Forbidden", { status: 403 });
}

type IncomingMessage = { id?: string; from?: string; type?: string; text?: { body?: string } };
type WebhookPayload = { entry?: Array<{ changes?: Array<{ value?: { messages?: IncomingMessage[] } }> }> };

async function processMessage(message: IncomingMessage) {
  if (!message.id || !message.from || message.type !== "text" || !message.text?.body) return;
  const db = createAdminClient();
  const { error: receiptError } = await db.from("whatsapp_intake_messages").insert({
    provider_message_id: message.id,
    sender_phone: message.from,
    message_text: message.text.body.slice(0, 12000),
  });
  if (receiptError) {
    if (receiptError.code === "23505") return;
    throw receiptError;
  }
  try {
    const opportunity = await extractWhatsAppOpportunity(message.text.body);
    if (!opportunity) {
      await db.from("whatsapp_intake_messages").update({ processing_status: "ignored" }).eq("provider_message_id", message.id);
      return;
    }
    const { data: existing, error: lookupError } = await db.from("discovered_opportunities")
      .select("id,title,organization_name,event_date,event_url,source_url").order("created_at", { ascending: false }).limit(500);
    if (lookupError) throw lookupError;
    const duplicate = findDuplicateDiscovery(opportunity, existing ?? []);
    if (duplicate) {
      await db.from("whatsapp_intake_messages").update({ processing_status: "ignored", discovery_id: duplicate.id }).eq("provider_message_id", message.id);
      return;
    }
    const { data: member } = await db.from("whatsapp_member_links").select("member_name,member_user_id").eq("phone_number", message.from).maybeSingle();
    const { data: discovery, error: insertError } = await db.from("discovered_opportunities").insert({
      title: opportunity.title,
      organization_name: opportunity.organizationName,
      description: opportunity.description,
      category: opportunity.category,
      representation_type: opportunity.representationType,
      event_date: opportunity.eventDate,
      application_deadline: opportunity.applicationDeadline,
      location: opportunity.location,
      event_url: opportunity.eventUrl,
      source_name: "WhatsApp member submission",
      source_url: opportunity.eventUrl,
      discovery_status: "new",
      research_notes: `Submitted via WhatsApp by ${member?.member_name ?? "Unlinked member"} (${message.from}). Original message ID: ${message.id}. Review all extracted facts before approval.`,
    }).select("id").single();
    if (insertError) throw insertError;
    await db.from("whatsapp_intake_messages").update({ processing_status: "processed", discovery_id: discovery.id }).eq("provider_message_id", message.id);
    await sendGoogleChatNotification(`CS PR HUB: WhatsApp opportunity awaiting review: ${opportunity.title}. Submitted by ${member?.member_name ?? "unlinked number"}.`);
  } catch (error) {
    await db.from("whatsapp_intake_messages").update({
      processing_status: "failed",
      error_detail: error instanceof Error ? error.message.slice(0, 500) : "Unknown processing failure",
    }).eq("provider_message_id", message.id);
    throw error;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!verifyMetaSignature(body, request.headers.get("x-hub-signature-256"), process.env.META_APP_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let payload: WebhookPayload;
  try { payload = JSON.parse(body) as WebhookPayload; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const message of change.value?.messages ?? []) await processMessage(message);
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook processing failed", error);
    return NextResponse.json({ error: "Processing failed; inspect server logs" }, { status: 500 });
  }
}
