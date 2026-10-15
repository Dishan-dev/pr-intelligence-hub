
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  CRITERIA, TASK_STATUSES, TEAMS, addDays, starterTasks, validDate, weekEnd, weekStart,
  type PrCriterion, type PrTeam, type PrTaskStatus,
} from "@/lib/pr-planner/domain";
import { plannerSession } from "@/lib/pr-planner/session";

const route = "/team-planner";
const textValue = (data: FormData, key: string, max: number) =>
  String(data.get(key) ?? "").trim().slice(0, max);
const validTeam = (value: string): value is PrTeam => TEAMS.includes(value as PrTeam);
const validCriterion = (value: string): value is PrCriterion => CRITERIA.includes(value as PrCriterion);
const validStatus = (value: string): value is PrTaskStatus => TASK_STATUSES.includes(value as PrTaskStatus);
const note = (code: string, planId?: string) =>
  route + "?notice=" + encodeURIComponent(code) + (planId ? "&plan=" + encodeURIComponent(planId) : "");

async function requireSession() {
  const { supabase, user } = await plannerSession();
  if (!user) redirect("/auth/login");
  return { supabase, ownerId: user.id };
}

export async function addPlannerMember(formData: FormData) {
  const { supabase, ownerId } = await requireSession();
  const name = textValue(formData, "name", 120);
  const team = textValue(formData, "team", 24);
  if (!name || !validTeam(team)) redirect(note("invalid_member"));
  const { error } = await supabase.from("pr_team_members").insert({
    owner_id: ownerId, name, team,
  });
  if (error) redirect(note("save_failed"));
  revalidatePath(route);
  redirect(note("member_added"));
}

export async function togglePlannerMember(formData: FormData) {
  const { supabase, ownerId } = await requireSession();
  const id = textValue(formData, "id", 70);
  const next = textValue(formData, "active", 8) === "true";
  const { error } = await supabase.from("pr_team_members")
    .update({ is_active: next }).eq("id", id).eq("owner_id", ownerId);
  if (error) redirect(note("save_failed"));
  revalidatePath(route);
  redirect(note("member_updated"));
}

export async function createPlannerPlan(formData: FormData) {
  const { supabase, ownerId } = await requireSession();
  const name = textValue(formData, "name", 150);
  const start = textValue(formData, "starts_on", 10);
  if (!name || !validDate(start)) redirect(note("invalid_plan"));
  const { data: plan, error: planError } = await supabase
    .from("pr_work_plans").insert({ owner_id: ownerId, name, starts_on: start, weeks_count: 4 })
    .select("id").single();
  if (planError || !plan) redirect(note("save_failed"));

  const { data: roster, error: rosterError } = await supabase
    .from("pr_team_members")
    .select("id,team").eq("owner_id", ownerId).eq("is_active", true).order("created_at");
  if (rosterError) {
    await supabase.from("pr_work_plans").delete().eq("id", plan.id).eq("owner_id", ownerId);
    redirect(note("save_failed"));
  }
  const membersByTeam = {
    internal: (roster ?? []).filter((m) => m.team === "internal"),
    external: (roster ?? []).filter((m) => m.team === "external"),
    campaign: (roster ?? []).filter((m) => m.team === "campaign"),
  };
  const tasks = starterTasks(start);
  const rowCounts = { internal: 0, external: 0, campaign: 0 };
  const rows = tasks.map((task) => {
    const list = membersByTeam[task.team];
    const order = rowCounts[task.team]++;
    return {
      ...task,
      plan_id: plan.id,
      member_id: list.length ? list[order % list.length].id : null,
      status: list.length ? "assigned" : "backlog",
    };
  });
  const { error: taskError } = await supabase.from("pr_plan_tasks").insert(rows);
  if (taskError) {
    await supabase.from("pr_work_plans").delete().eq("id", plan.id).eq("owner_id", ownerId);
    redirect(note("save_failed"));
  }
  revalidatePath(route);
  redirect(note("plan_created", plan.id));
}

export async function addPlannerTask(formData: FormData) {
  const { supabase, ownerId } = await requireSession();
  const planId = textValue(formData, "plan_id", 70);
  const title = textValue(formData, "title", 200);
  const description = textValue(formData, "description", 2000);
  const team = textValue(formData, "team", 24);
  const criterion = textValue(formData, "target_criterion", 60);
  const week = Number(textValue(formData, "week_number", 1));
  const memberId = textValue(formData, "member_id", 70);
  const { data: plan } = await supabase.from("pr_work_plans")
    .select("id, starts_on").eq("id", planId).eq("owner_id", ownerId).maybeSingle();
  if (!plan || !title || !validTeam(team) || !validCriterion(criterion) ||
      !Number.isInteger(week) || week < 1 || week > 4) {
    redirect(note("invalid_task", planId));
  }
  if (memberId) {
    const { data: member } = await supabase.from("pr_team_members")
      .select("id").eq("id", memberId).eq("owner_id", ownerId).eq("team", team).eq("is_active", true).maybeSingle();
    if (!member) redirect(note("invalid_task", planId));
  }
  const startsOn = weekStart(plan.starts_on, week);
  const dueOn = textValue(formData, "due_on", 10) || addDays(startsOn, 4);
  if (!validDate(dueOn) || dueOn < startsOn || dueOn > weekEnd(plan.starts_on, week)) {
    redirect(note("invalid_task", planId));
  }
  const { error } = await supabase.from("pr_plan_tasks").insert({
    plan_id: planId, title, description, team, target_criterion: criterion,
    week_number: week, starts_on: startsOn, due_on: dueOn,
    member_id: memberId || null, status: memberId ? "assigned" : "backlog",
  });
  if (error) redirect(note("save_failed", planId));
  revalidatePath(route);
  redirect(note("task_added", planId));
}

export async function updatePlannerTask(formData: FormData) {
  const { supabase, ownerId } = await requireSession();
  const planId = textValue(formData, "plan_id", 70);
  const id = textValue(formData, "task_id", 70);
  const status = textValue(formData, "status", 32);
  const memberId = textValue(formData, "member_id", 70);
  const evidence = textValue(formData, "evidence_url", 2000);
  const outcome = textValue(formData, "outcome_notes", 2000);
  const review = textValue(formData, "verification_status", 24);
  const title = textValue(formData, "title", 200);
  const description = textValue(formData, "description", 2000);
  const criterion = textValue(formData, "target_criterion", 60);
  const dueOn = textValue(formData, "due_on", 10);
  const { data: task } = await supabase.from("pr_plan_tasks")
    .select("id,team,starts_on,week_number").eq("id", id).eq("plan_id", planId).maybeSingle();
  const { data: plan } = await supabase.from("pr_work_plans")
    .select("id,starts_on").eq("id", planId).eq("owner_id", ownerId).maybeSingle();
  if (!plan || !task || !title || !validCriterion(criterion) || !validStatus(status) ||
      !validDate(dueOn) || dueOn < task.starts_on || dueOn > weekEnd(plan.starts_on, task.week_number) ||
      !["unreviewed", "verified", "not_qualifying"].includes(review)) {
    redirect(note("invalid_task", planId));
  }
  if (memberId) {
    const { data: member } = await supabase.from("pr_team_members")
      .select("id").eq("id", memberId).eq("owner_id", ownerId).eq("team", task.team).maybeSingle();
    if (!member) redirect(note("invalid_task", planId));
  }
  if (evidence) {
    try {
      const url = new URL(evidence);
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
    } catch { redirect(note("invalid_evidence", planId)); }
  }
  if (review === "verified" && (!evidence || status !== "completed")) {
    redirect(note("verification_requires_evidence", planId));
  }
  const { error } = await supabase.from("pr_plan_tasks")
    .update({
      title, description, target_criterion: criterion, due_on: dueOn,
      member_id: memberId || null,
      status: !memberId && status === "assigned" ? "backlog" : memberId && status === "backlog" ? "assigned" : status,
      evidence_url: evidence || null,
      outcome_notes: outcome, verification_status: review === "verified" ? "verified" : review,
    }).eq("id", id).eq("plan_id", planId);
  if (error) redirect(note("save_failed", planId));
  revalidatePath(route);
  redirect(note("task_updated", planId));
}
