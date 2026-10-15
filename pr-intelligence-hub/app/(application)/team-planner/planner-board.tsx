"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, CircleDashed, Clock3, Filter, Plus, Search, UserRound, X } from "lucide-react";

import { addPlannerTask, updatePlannerTask } from "./actions";
import {
  CRITERIA, CRITERION_LABELS, STATUS_LABELS, TASK_STATUSES, TEAM_LABELS, TEAMS,
  addDays, shortDate, weekEnd, weekStart,
  type PrCriterion, type PrMember, type PrPlan, type PrTask, type PrTeam,
} from "@/lib/pr-planner/domain";

type Props = { plan: PrPlan; tasks: PrTask[]; members: PrMember[]; preview?: boolean };
const input = "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-500";
const primary = "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400";
const secondary = "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700";
const label = "block space-y-1.5 text-xs font-medium text-slate-400";
const teamAccent: Record<PrTeam, string> = {
  internal: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  external: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  campaign: "border-violet-500/30 bg-violet-500/10 text-violet-300",
};
const statusStyle: Record<string, string> = {
  backlog: "border-slate-700 bg-slate-800 text-slate-300",
  assigned: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  in_progress: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  waiting: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

export function PlannerBoard({plan,tasks,members,preview=false}:Props) {
  const [week,setWeek] = useState(1);
  const [team,setTeam] = useState<PrTeam|"all">("all");
  const [assignee,setAssignee] = useState("all");
  const [search,setSearch] = useState("");
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [showCreate,setShowCreate] = useState(false);
  const [newTeam,setNewTeam] = useState<PrTeam>("internal");
  const editorRef=useRef<HTMLDivElement|null>(null);

  const selected = tasks.find((t)=>t.id===selectedId)??null;
  const names=useMemo(()=>new Map(members.map((m)=>[m.id,m.name])),[members]);
  const filtered=useMemo(()=>tasks.filter((t)=>{
    return t.week_number===week &&
      (team==="all"||t.team===team) &&
      (assignee==="all"||(assignee==="unassigned"? !t.member_id:t.member_id===assignee)) &&
      (!search||[t.title,t.description,t.target_criterion,names.get(t.member_id??"")??""].join(" ").toLowerCase().includes(search.toLowerCase()));
  }),[tasks,week,team,assignee,search,names]);
  const weekly=tasks.filter((t)=>t.week_number===week);
  const complete=weekly.filter((t)=>t.status==="completed").length;
  const awaiting=weekly.filter((t)=>t.status==="waiting").length;
  const assigned=weekly.filter((t)=>Boolean(t.member_id)).length;
  useEffect(()=>{setSelectedId(null);setShowCreate(false)},[week]);
  useEffect(()=>{
    if ((selected||showCreate)&&editorRef.current&&window.matchMedia("(max-width: 1023px)").matches) {
      editorRef.current.scrollIntoView({behavior:"smooth",block:"start"});
    }
  },[selected,showCreate]);

  const optionMembers=(targetTeam:PrTeam)=>members.filter((m)=>m.team===targetTeam&&(m.is_active||m.id===selected?.member_id));
  const weekStartDate=weekStart(plan.starts_on,week);

  return <div className="space-y-5">
    {preview && <p className="rounded-lg border border-amber-800/70 bg-amber-950/20 px-4 py-3 text-sm text-amber-200" role="status">
      Sample cycle · 19 October–15 November 2026. The example tasks are not saved or assigned to real members. Add your roster and create a cycle above to activate editing.
    </p>}

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="group" aria-label="Choose planning week">
      {[1,2,3,4].map((w)=>{
        const total=tasks.filter((t)=>t.week_number===w).length;
        const done=tasks.filter((t)=>t.week_number===w&&t.status==="completed").length;
        return <button key={w} type="button" onClick={()=>setWeek(w)}
          aria-pressed={week===w} className={"rounded-xl border px-4 py-3 text-left transition "+(week===w?"border-emerald-500/60 bg-emerald-500/10":"border-slate-800 bg-slate-900/70 hover:border-slate-600")}>
          <div className="flex items-center justify-between gap-2"><span className={"text-xs font-semibold "+(week===w?"text-emerald-400":"text-slate-400")}>WEEK 0{w}</span><span className="text-xs text-slate-500">{done}/{total} done</span></div>
          <p className="mt-2 text-sm font-semibold text-slate-100">{shortDate(weekStart(plan.starts_on,w))} – {shortDate(weekEnd(plan.starts_on,w))}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:total?100*done/total+"%":"0%"}}/></div>
        </button>;
      })}
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <Stat icon={<CircleDashed className="size-4"/>} name="Tasks this week" value={weekly.length}/>
      <Stat icon={<UserRound className="size-4"/>} name="Assigned" value={assigned}/>
      <Stat icon={<CheckCircle2 className="size-4"/>} name="Completed" value={complete}/>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-lg font-semibold text-white">Week {week} assignments</h3>
        <p className="mt-1 text-xs text-slate-400">{shortDate(weekStartDate)} – {shortDate(weekEnd(plan.starts_on,week))} · {awaiting} waiting for responses</p></div>
      {!preview&&<button className={primary} type="button" onClick={()=>{setSelectedId(null);setShowCreate(true)}}><Plus className="size-4"/> New task</button>}
    </div>
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-500"/>
        <input aria-label="Search tasks" placeholder="Search assignments..." className={input+" pl-9"} value={search} onChange={(e)=>setSearch(e.target.value)}/>
      </div>
      <label className="sr-only" htmlFor="planner-team-filter">Filter by team</label>
      <select id="planner-team-filter" value={team} onChange={(e)=>setTeam(e.target.value as PrTeam|"all")} className={input}>
        <option value="all">All teams</option>{TEAMS.map((t)=><option key={t} value={t}>{TEAM_LABELS[t]}</option>)}
      </select>
      <label className="sr-only" htmlFor="planner-person-filter">Filter by member</label>
      <select id="planner-person-filter" className={input} value={assignee} onChange={(e)=>setAssignee(e.target.value)}>
        <option value="all">All members</option><option value="unassigned">Unassigned</option>
        {members.map((m)=><option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
    </div>

    <div className={"grid items-start gap-4 "+(!preview&&(showCreate||selected)?"lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.78fr)]":"")}>
      <div className="grid min-w-0 gap-3 md:grid-cols-2">
        {filtered.length===0&&<div className="col-span-full rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
          <Filter className="mx-auto size-7 text-slate-500"/><p className="mt-2 text-sm text-slate-300">No tasks match the current filters.</p>
        </div>}
        {filtered.map((task)=>{
          const overdue=task.status!=="completed"&&task.due_on<new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Colombo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
          return <article key={task.id} className={"min-w-0 rounded-xl border bg-slate-900/70 p-4 transition "+(selectedId===task.id?"border-emerald-500":"border-slate-800 hover:border-slate-600")}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={"rounded-md border px-2 py-1 text-[11px] font-semibold "+teamAccent[task.team]}>{TEAM_LABELS[task.team]}</span>
              <span className={"rounded-md border px-2 py-1 text-[11px] "+statusStyle[task.status]}>{STATUS_LABELS[task.status]}</span>
            </div>
            <h4 className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-white">{task.title}</h4>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{task.description}</p>
            <div className="mt-3 border-t border-slate-800 pt-3">
              <p className="text-[11px] text-slate-500">{CRITERION_LABELS[task.target_criterion]}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300"><UserRound className="size-3.5 text-slate-500"/>{names.get(task.member_id??"")??"Unassigned"}</span>
                <span className={"flex items-center gap-1.5 "+(overdue?"text-rose-400":"text-slate-400")}><CalendarDays className="size-3.5"/>{shortDate(task.due_on)}</span>
              </div>
            </div>
            {!preview&&<button type="button" className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:border-emerald-500/60 hover:text-emerald-400"
              onClick={()=>{setShowCreate(false);setSelectedId(task.id)}}>Open / edit assignment</button>}
          </article>;
        })}
      </div>
      {!preview&&(showCreate||selected)&&<div ref={editorRef} className="min-w-0 rounded-xl border border-emerald-500/20 bg-slate-900 p-4 lg:sticky lg:top-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400">Task management</p>
            <h4 className="mt-1 text-base font-semibold text-white">{showCreate?"Create assignment":"Edit assignment"}</h4></div>
          <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800" aria-label="Close task editor" onClick={()=>{setShowCreate(false);setSelectedId(null)}}><X className="size-4"/></button>
        </div>
        {showCreate?
          <form key={"new-"+week} action={addPlannerTask} className="space-y-3">
            <input type="hidden" name="plan_id" value={plan.id}/><input type="hidden" name="week_number" value={week}/>
            <label className={label}>Task title<input required name="title" maxLength={200} className={input} placeholder="e.g. Pitch one student leadership story"/></label>
            <label className={label}>Description<textarea name="description" rows={3} maxLength={2000} className={input} placeholder="Expected deliverable and next steps"/></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={label}>Team<select name="team" value={newTeam} onChange={(e)=>setNewTeam(e.target.value as PrTeam)} className={input}>{TEAMS.map((t)=><option key={t} value={t}>{TEAM_LABELS[t]}</option>)}</select></label>
              <label className={label}>Assignee<select name="member_id" className={input} defaultValue="" key={newTeam}>
                <option value="">Unassigned</option>{optionMembers(newTeam).filter((m)=>m.is_active).map((m)=><option value={m.id} key={m.id}>{m.name}</option>)}
              </select></label>
            </div>
            <label className={label}>Potential PR criterion<select name="target_criterion" className={input}>{CRITERIA.map((c)=><option key={c} value={c}>{CRITERION_LABELS[c]}</option>)}</select></label>
            <label className={label}>Due date<input type="date" required name="due_on" min={weekStartDate} max={weekEnd(plan.starts_on,week)} defaultValue={addDays(weekStartDate,4)} className={input}/></label>
            <button className={primary+" w-full"} type="submit"><Plus className="size-4"/> Add task</button>
          </form>
        :selected&&
          <form key={selected.id} action={updatePlannerTask} className="space-y-3">
            <input type="hidden" name="plan_id" value={plan.id}/><input type="hidden" name="task_id" value={selected.id}/>
            <label className={label}>Task title<input name="title" required maxLength={200} defaultValue={selected.title} className={input}/></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={label}>Assigned member<select name="member_id" defaultValue={selected.member_id??""} className={input}>
                <option value="">Unassigned</option>{optionMembers(selected.team).map((m)=><option key={m.id} value={m.id}>{m.name}{m.is_active?"":" (paused)"}</option>)}
              </select></label>
              <label className={label}>Status<select name="status" defaultValue={selected.status} className={input}>
                {TASK_STATUSES.map((s)=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select></label>
            </div>
            <label className={label}>Potential PR criterion<select name="target_criterion" defaultValue={selected.target_criterion} className={input}>
              {CRITERIA.map((c)=><option key={c} value={c}>{CRITERION_LABELS[c]}</option>)}
            </select></label>
            <label className={label}>Due date<input type="date" name="due_on" required className={input} min={selected.starts_on} max={weekEnd(plan.starts_on,selected.week_number)} defaultValue={selected.due_on}/></label>
            <label className={label}>Evidence link<input type="url" name="evidence_url" maxLength={2000} placeholder="https://..." defaultValue={selected.evidence_url??""} className={input}/></label>
            <label className={label}>Outcome / follow-up notes<textarea rows={4} name="outcome_notes" maxLength={2000} defaultValue={selected.outcome_notes} className={input}/></label>
            <p className="text-xs leading-5 text-slate-500">Marking a task completed records delivery only. Confirmed PR achievement counts require separate review of the official criteria and evidence.</p>
            <button type="submit" className={primary+" w-full"}><CheckCircle2 className="size-4"/> Save changes</button>
          </form>}
      </div>}
    </div>
  </div>;
}
function Stat({icon,name,value}:{icon:React.ReactNode;name:string;value:number}) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
    <span className="grid size-9 place-items-center rounded-lg bg-slate-800 text-slate-400">{icon}</span>
    <div><p className="text-xs text-slate-500">{name}</p><p className="text-xl font-bold text-white">{value}</p></div>
  </div>;
}
