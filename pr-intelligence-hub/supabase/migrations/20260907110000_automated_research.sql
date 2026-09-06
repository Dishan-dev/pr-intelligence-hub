create table public.research_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'partial')),
  triggered_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  horizon_start date not null,
  horizon_end date not null,
  candidate_count integer not null default 0 check (candidate_count >= 0),
  inserted_count integer not null default 0 check (inserted_count >= 0),
  duplicate_count integer not null default 0 check (duplicate_count >= 0),
  rejected_count integer not null default 0 check (rejected_count >= 0),
  error_message text,
  created_at timestamptz not null default now(),
  check (horizon_end >= horizon_start)
);

create table public.discovery_sources (
  id uuid primary key default gen_random_uuid(),
  discovered_opportunity_id uuid not null references public.discovered_opportunities(id) on delete cascade,
  url text not null,
  source_name text,
  source_type text not null default 'supporting' check (source_type in ('primary', 'supporting')),
  created_at timestamptz not null default now(),
  unique (discovered_opportunity_id, url)
);

create index research_runs_status_idx on public.research_runs (status);
create index research_runs_triggered_by_idx on public.research_runs (triggered_by);
create index research_runs_created_at_idx on public.research_runs (created_at desc);
create index discovery_sources_discovery_id_idx on public.discovery_sources (discovered_opportunity_id);
create index discovery_sources_url_idx on public.discovery_sources (url);

alter table public.research_runs enable row level security;
alter table public.discovery_sources enable row level security;

create policy "Authenticated users can manage research runs"
on public.research_runs for all to authenticated using (true) with check (true);

create policy "Authenticated users can manage discovery sources"
on public.discovery_sources for all to authenticated using (true) with check (true);

notify pgrst, 'reload schema';
