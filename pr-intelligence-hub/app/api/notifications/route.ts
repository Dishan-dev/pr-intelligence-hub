import { NextResponse } from "next/server";

import { sendGoogleChatNotification } from "@/lib/notifications/google-chat";
import { createClient } from "@/lib/supabase/server";

type NotificationRequest = {
  kind: "media" | "club";
  name: string;
  details?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as Partial<NotificationRequest>;
  if (!body.name || (body.kind !== "media" && body.kind !== "club")) {
    return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 });
  }

  const label = body.kind === "media" ? "Media opportunity" : "Club or society lead";
  const sent = await sendGoogleChatNotification(
    `CS PR HUB: New ${label} added\n\n${body.name}${body.details ? `\n${body.details}` : ""}`,
  );
  return NextResponse.json({ sent });
}
