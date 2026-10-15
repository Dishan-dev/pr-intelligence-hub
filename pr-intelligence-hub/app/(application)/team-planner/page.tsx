
import Link from "next/link";
import { CalendarRange, Plus, Users } from "lucide-react";
import { addPlannerMember, createPlannerPlan, togglePlannerMember } from "./actions";
import { PlannerBoard } from "./planner-board";
import { TEAM_LABELS, TEAMS, addDays, shortDate, type PrMember, type PrPlan, type PrTask, starterTasks } from "@/lib/pr-planner/domain";
import { plannerSession } from "@/lib/pr-planner/session";

export const metadata = { title: "Team Planner" };
export const dynamic = "force-dynamic";
type SearchParams = Promise<{ plan?: string; notice?: string }>;
const notices: Record<string, string> = {
  member_added: "Team member added.", member_updated: "Member availability updated.",
  plan_created: "Four-week plan and starter tasks created.",
  task_added: "New task added.", task_updated: "Task changes saved.",
  invalid_member: "Enter a member name and valid team.",
  invalid_plan: "Enter a plan name and valid starting date.",
  invalid_task: "Check task fields, member assignment and deadline.",
  invalid_evidence: "Evidence must be an HTTP or HTTPS URL.",
  save_failed: "Could not save. Check the database migration and retry.",
};
const field = "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500";
const button = "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400";
function nextMonday() {
  const parts = new Intl.DateTimeFormat("en-US", {timeZone:"Asia/Colombo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const get = (type:string) => parts.find((p)=>p.type===type)?.value ?? "";
  const day = get("year")+"-"+get("month")+"-"+get("day");
  const dayOfWeek = new Date(day+"T00:00:00Z").getUTCDay();
  return addDays(day, ((8-dayOfWeek)%7)||7);
}
export default async function TeamPlannerPage({searchParams}:{searchParams:SearchParams}) {
  const {supabase,user} = await plannerSession();
  if (!user) return <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
    <h1 className="text-2xl font-semibold text-white">Sign in to use Team Planner</h1>
    <p className="mt-2 text-sm text-slate-400">Your roster and plans are stored privately for your account.</p>
    <Link href="/auth/login" className={button+" mt-4"}>Sign in</Link>
  </section>;
  const query = await searchParams;
  const [memberResult,planResult] = await Promise.all([
    supabase.from("pr_team_members").select("id,name,team,is_active").eq("owner_id",user.id).order("created_at"),
    supabase.from("pr_work_plans").select("id,name,starts_on,weeks_count").eq("owner_id",user.id).order("created_at",{ascending:false}).limit(30),
  ]);
  if (memberResult.error || planResult.error) return <section className="space-y-4">
    <h1 className="text-3xl font-semibold">Team Planner</h1>
    <div role="alert" className="rounded-xl border border-amber-800 bg-slate-900 p-6 text-sm text-slate-300">
      <strong className="text-white">Planner database is not ready.</strong>
      <p className="mt-2">Apply the new PR execution planner Supabase migration before using this feature.</p>
      <p className="mt-2 text-xs text-slate-500">Database code: {memberResult.error?.code ?? planResult.error?.code ?? "unknown"}</p>
    </div>
  </section>;
  const members=(memberResult.data??[]) as PrMember[];
  const plans=(planResult.data??[]) as PrPlan[];
  const selected=plans.find((p)=>p.id===query.plan)??plans[0]??null;
  const taskResult=selected?await supabase.from("pr_plan_tasks")
    .select("id,plan_id,title,description,team,target_criterion,member_id,week_number,starts_on,due_on,status,evidence_url,outcome_notes")
    .eq("plan_id",selected.id).order("week_number").order("due_on").limit(500)
    :{data:[],error:null};
  const tasks=(taskResult.data??[]) as PrTask[];
  return <section className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">PR operations · Team execution</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Team Planner</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Plan weekly initiatives, assign members and track progress. Completed tasks do not automatically count as achieved PR criteria.</p>
      </div>
      <span className="inline-flex items-center gap-2 text-xs text-slate-400"><Users className="size-4 text-emerald-400"/>{members.filter((m)=>m.is_active).length} active members</span>
    </header>
    {query.notice && notices[query.notice] && <p role="status" className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">{notices[query.notice]}</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      <details open={members.length===0} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-white">Member roster <span className="font-normal text-slate-500">({members.length})</span></summary>
        <p className="mt-3 text-xs text-slate-400">Add real member names before creating a cycle to auto-assign tasks.</p>
        <form action={addPlannerMember} className="mt-4 flex flex-wrap items-end gap-2">
          <label className="min-w-36 flex-1 text-xs text-slate-400">Member name<input name="name" required maxLength={120} className={field} placeholder="Full name"/></label>
          <label className="min-w-36 text-xs text-slate-400">Team<select name="team" className={field}>{TEAMS.map((t)=><option key={t} value={t}>{TEAM_LABELS[t]}</option>)}</select></label>
          <button type="submit" className={button}><Plus className="size-4"/> Add</button>
        </form>
        <div className="mt-4 space-y-3">
          {TEAMS.map((team)=><div key={team}><p className="mb-2 text-xs font-medium text-slate-500">{TEAM_LABELS[team]}</p>
            <div className="flex flex-wrap gap-2">{members.filter((m)=>m.team===team).map((member)=><form key={member.id} action={togglePlannerMember} className="flex items-center gap-2 rounded-lg border border-slate-700 px-2 py-1.5 text-xs">
              <span className={member.is_active?"text-white":"text-slate-500 line-through"}>{member.name}</span>
              <input type="hidden" name="id" value={member.id}/><input type="hidden" name="active" value={member.is_active?"false":"true"}/>
              <button type="submit" className="text-emerald-400">{member.is_active?"Pause":"Restore"}</button>
            </form>)}{members.every((m)=>m.team!==team)&&<span className="text-xs text-slate-600">No members yet</span>}</div>
          </div>)}
        </div>
      </details>
      <details open={plans.length===0} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-white">Create a four-week cycle</summary>
        <p className="mt-3 text-xs leading-5 text-slate-400">Generate 40 editable starter tasks: eight Internal and External PR tasks plus two campaign tasks per week. Matching active members are assigned automatically.</p>
        <form action={createPlannerPlan} className="mt-4 space-y-3">
          <label className="block text-xs text-slate-400">Cycle title<input name="name" maxLength={150} required className={field} defaultValue="PR Execution Cycle — October 2026"/></label>
          <label className="block text-xs text-slate-400">Week 1 starts<input name="starts_on" type="date" required className={field} defaultValue={nextMonday()}/></label>
          <button type="submit" className={button}><CalendarRange className="size-4"/>Create cycle</button>
        </form>
      </details>
    </div>
    {selected?<>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Selected cycle</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{selected.name}</h2>
          <p className="mt-1 text-xs text-slate-400">{shortDate(selected.starts_on)} – {shortDate(addDays(selected.starts_on,27))}</p></div>
      </div>
      {plans.length>1&&<nav aria-label="Available planning cycles" className="flex flex-wrap gap-2">
        {plans.map((plan)=><Link key={plan.id} href={"/team-planner?plan="+encodeURIComponent(plan.id)}
          className={"rounded-lg border px-3 py-2 text-xs "+(plan.id===selected.id?"border-emerald-600 text-emerald-400":"border-slate-700 text-slate-400 hover:text-white")}>
          {plan.name} · {shortDate(plan.starts_on)}</Link>)}
      </nav>}
      {taskResult.error?<p className="text-sm text-rose-400" role="alert">Unable to load tasks ({taskResult.error.code}). Check the migration.</p>:<PlannerBoard plan={selected} tasks={tasks} members={members}/>}
    </>:<div className="space-y-4">
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-7">
        <h2 className="text-lg font-semibold text-white">Sample week — ready to preview</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">These ten example tasks show the 19–25 October workflow. Add your team roster and create a plan above to save and assign them.</p>
      </div>
      <PlannerBoard
        preview
        plan={{id:"sample",name:"Sample PR cycle",starts_on:"2026-10-19",weeks_count:4}}
        tasks={starterTasks("2026-10-19").map((task,i)=>({id:"sample-"+i,plan_id:"sample",member_id:null,evidence_url:null,outcome_notes:"",...task}))}
        members={[]}
      />
    </div>}
  </section>;
}
