import { createClient } from "@/lib/supabase/server";

export interface ResearchRun { id: string; status: "pending" | "running" | "completed" | "failed" | "partial"; startedAt: string | null; completedAt: string | null; candidateCount: number; insertedCount: number; duplicateCount: number; rejectedCount: number; errorMessage: string | null; }
export async function getLatestResearchRun(): Promise<ResearchRun | null> {
  const supabase = await createClient(); const { data } = await supabase.from("research_runs").select("id, status, started_at, completed_at, candidate_count, inserted_count, duplicate_count, rejected_count, error_message").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null; const row = data as unknown as Record<string, string | number | null>;
  return { id: row.id as string, status: row.status as ResearchRun["status"], startedAt: row.started_at as string | null, completedAt: row.completed_at as string | null, candidateCount: row.candidate_count as number, insertedCount: row.inserted_count as number, duplicateCount: row.duplicate_count as number, rejectedCount: row.rejected_count as number, errorMessage: row.error_message as string | null };
}
