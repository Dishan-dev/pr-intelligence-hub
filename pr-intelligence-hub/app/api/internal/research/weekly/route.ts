import { NextResponse } from "next/server";
import { researchHorizon } from "@/lib/research/profile";
import { executeResearchRun } from "@/lib/research/service";
import { researchFailureMessage } from "@/lib/research/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendGoogleChatNotification } from "@/lib/notifications/google-chat";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

function scheduleKey(now = new Date()) {
  return `scheduled:${now.toISOString().slice(0, 10)}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const horizon = researchHorizon();
  const runKey = scheduleKey();
  let { data: run, error } = await supabase.from("research_runs").insert({ run_key: runKey, trigger_type: "scheduled", status: "pending", horizon_start: horizon.start, horizon_end: horizon.end }).select("id").single();
  if (error?.code === "23505") {
    const { data: existing } = await supabase.from("research_runs").select("id, status").eq("run_key", runKey).single();
    if (!existing) return NextResponse.json({ error: "Unable to retrieve the scheduled research run." }, { status: 500 });
    if (existing.status === "completed" || existing.status === "partial") return NextResponse.json({ status: "already_completed", runKey });
    if (existing.status === "running") return NextResponse.json({ status: "in_progress", runKey });
    const { data: resumed, error: resumeError } = await supabase.from("research_runs").update({ status: "pending", started_at: null, completed_at: null, error_message: null }).eq("id", existing.id).select("id").single();
    if (resumeError || !resumed) return NextResponse.json({ error: "Unable to resume the scheduled research run." }, { status: 500 });
    run = resumed;
    error = null;
  }
  if (error || !run) return NextResponse.json({ error: "Unable to create the scheduled research run." }, { status: 500 });
  try {
    const summary = await executeResearchRun(supabase, run.id, horizon);
    if (summary.newOpportunities > 0) {
      await sendGoogleChatNotification(
        `CS PR HUB: ${summary.newOpportunities} new discoveries added\n\nReview them in the Discoveries inbox: ${process.env.NEXT_PUBLIC_APP_URL ?? "your CS PR HUB workspace"}`,
      );
    }
    return NextResponse.json({ status: "completed", runId: run.id, runKey });
  } catch (researchError) {
    const message = researchFailureMessage(researchError);
    await supabase.from("research_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: message }).eq("id", run.id);
    return NextResponse.json({ status: "failed", runId: run.id, message }, { status: 500 });
  }
}
