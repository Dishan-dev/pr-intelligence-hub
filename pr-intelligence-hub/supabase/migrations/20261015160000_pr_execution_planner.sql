-- Four-week PR execution planner. Stored per authenticated workspace owner.
create table public.pr_team_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  team text not null check (team in ('internal', 'external', 'campaign')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pr_work_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 150),
  starts_on date not null,
  weeks_count smallint not null default 4 check (weeks_count = 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pr_plan_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.pr_work_plans(id) on delete cascade,
  member_id uuid references public.pr_team_members(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text not null default '',
  team text not null check (team in ('internal', 'external', 'campaign')),
  target_criterion text not null check (target_criterion in (
    'strategic_alliances', 'press_releases', 'external_representations',
    'university_relations', 'pr_campaigns'
  )),
  week_number smallint not null check (week_number between 1 and 4),
  starts_on date not null,
  due_on date not null,
  status text not null default 'backlog' check (status in (
    'backlog', 'assigned', 'in_progress', 'waiting', 'completed'
  )),
  evidence_url text check (evidence_url is null or char_length(evidence_url) <= 2000),
  outcome_notes text not null default '',
  verification_status text not null default 'unreviewed' check (verification_status in ('unreviewed','verified','not_qualifying')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pr_task_date_order check (due_on >= starts_on)
);

create index pr_team_members_owner_team_idx on public.pr_team_members(owner_id, team);
create index pr_work_plans_owner_created_idx on public.pr_work_plans(owner_id, created_at desc);
create index pr_plan_tasks_plan_week_idx on public.pr_plan_tasks(plan_id, week_number, due_on);

create trigger pr_team_members_updated before update on public.pr_team_members
for each row execute function public.set_updated_at();
create trigger pr_work_plans_updated before update on public.pr_work_plans
for each row execute function public.set_updated_at();
create trigger pr_plan_tasks_updated before update on public.pr_plan_tasks
for each row execute function public.set_updated_at();

alter table public.pr_team_members enable row level security;
alter table public.pr_work_plans enable row level security;
alter table public.pr_plan_tasks enable row level security;

create policy "Planner owner manages roster" on public.pr_team_members
for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "Planner owner manages plans" on public.pr_work_plans
for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "Planner owner manages tasks" on public.pr_plan_tasks
for all to authenticated
using (exists (
  select 1 from public.pr_work_plans p
  where p.id = plan_id and p.owner_id = (select auth.uid())
))
with check (
  exists (
    select 1 from public.pr_work_plans p
    where p.id = plan_id and p.owner_id = (select auth.uid())
  )
  and (member_id is null or exists (
    select 1 from public.pr_team_members m
    where m.id = member_id
      and m.owner_id = (select auth.uid())
      and m.team = pr_plan_tasks.team
  ))
);

grant select, insert, update, delete on public.pr_team_members to authenticated;
grant select, insert, update, delete on public.pr_work_plans to authenticated;
grant select, insert, update, delete on public.pr_plan_tasks to authenticated;
notify pgrst, 'reload schema';
