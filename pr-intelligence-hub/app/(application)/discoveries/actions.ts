"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DISCOVERY_STATUSES, type DiscoveryStatus } from "@/lib/domain/discovery";
import { createClient } from "@/lib/supabase/server";

async function authenticatedClient() { return createClient(); }
function validStatus(value: FormDataEntryValue | null): value is DiscoveryStatus { return typeof value === "string" && DISCOVERY_STATUSES.includes(value as DiscoveryStatus); }
function id(formData: FormData) { const value = formData.get("id"); return typeof value === "string" ? value : null; }
function refresh(id: string) { revalidatePath("/discoveries"); revalidatePath(`/discoveries/${id}`); }

export async function setDiscoveryStatus(formData: FormData) {
  const discoveryId = id(formData); const status = formData.get("status");
  if (!discoveryId || !validStatus(status) || status === "approved") return;
  const supabase = await authenticatedClient();
  await supabase.from("discovered_opportunities").update({ discovery_status: status, reviewed_at: status === "ai_found_needs_review" || status === "reviewing" || status === "possible_duplicate" ? null : new Date().toISOString() }).eq("id", discoveryId);
  refresh(discoveryId);
}

export async function approveDiscovery(formData: FormData) {
  const discoveryId = id(formData); if (!discoveryId) return;
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("approve_discovered_opportunity", { p_discovery_id: discoveryId });
  if (error || !data) redirect(`/discoveries/${discoveryId}?approval=failed`);
  refresh(discoveryId);
  redirect(`/discoveries/${discoveryId}`);
}
