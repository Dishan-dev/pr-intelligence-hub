alter table public.discovered_opportunities
  drop constraint if exists discovered_opportunities_discovery_status_check;

alter table public.discovered_opportunities
  add constraint discovered_opportunities_discovery_status_check check (discovery_status in (
    'ai_found_needs_review', 'new', 'reviewing', 'approved', 'rejected',
    'duplicate', 'possible_duplicate', 'expired'
  )),
  add column if not exists opportunity_type text check (opportunity_type in (
    'external_representation', 'speaking', 'youth_collaboration', 'media',
    'volunteering', 'ogx_stall', 'other'
  )),
  add column if not exists opportunity_tags text[] not null default '{}',
  add column if not exists organizer_contact_name text,
  add column if not exists organizer_contact_route text,
  add column if not exists expected_audience text,
  add column if not exists audience_profile text,
  add column if not exists ogx_stall_available boolean,
  add column if not exists stall_cost numeric(12, 2),
  add column if not exists stall_cost_currency text,
  add column if not exists stall_terms text,
  add column if not exists score_version text not null default 'v1',
  add column if not exists score_breakdown jsonb not null default '{}'::jsonb,
  add column if not exists confidence smallint check (confidence between 0 and 100),
  add column if not exists canonical_source_url text,
  add column if not exists duplicate_fingerprint text,
  add column if not exists duplicate_of_id uuid references public.discovered_opportunities(id) on delete set null,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists assigned_at timestamptz;

update public.discovered_opportunities
set discovery_status = 'ai_found_needs_review'
where discovery_status = 'new';

alter table public.research_runs
  add column if not exists run_key text,
  add column if not exists trigger_type text not null default 'manual' check (trigger_type in ('manual', 'scheduled')),
  add column if not exists configuration_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists budget_reserved_usd numeric(12, 4) not null default 0,
  add column if not exists actual_cost_usd numeric(12, 4) not null default 0,
  add column if not exists summary jsonb not null default '{}'::jsonb;

create unique index if not exists research_runs_run_key_unique_idx
  on public.research_runs (run_key) where run_key is not null;

alter table public.discovery_sources
  add column if not exists canonical_url text,
  add column if not exists evidence_excerpt text,
  add column if not exists evidence_hash text,
  add column if not exists retrieved_at timestamptz not null default now();

create table if not exists public.research_source_configs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  base_url text not null,
  allowed_domain text not null,
  source_category text,
  search_keywords text not null default '',
  enabled boolean not null default true,
  priority smallint not null default 100 check (priority between 0 and 1000),
  monitoring_frequency text not null default 'weekly' check (monitoring_frequency in ('weekly', 'manual')),
  owner_id uuid references auth.users(id) on delete set null,
  last_checked_at timestamptz,
  next_check_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (allowed_domain)
);

create table if not exists public.research_query_configs (
  id uuid primary key default gen_random_uuid(),
  query_text text not null check (char_length(trim(query_text)) > 0),
  opportunity_focus text not null default 'external_representation',
  enabled boolean not null default true,
  country_code text not null default 'LK',
  priority smallint not null default 100 check (priority between 0 and 1000),
  source_config_id uuid references public.research_source_configs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (query_text, source_config_id)
);

create table if not exists public.research_budget_configs (
  id uuid primary key default gen_random_uuid(),
  active boolean not null default true,
  monthly_limit_usd numeric(12, 2) not null default 3 check (monthly_limit_usd >= 0),
  max_search_calls_per_run integer not null default 30 check (max_search_calls_per_run between 1 and 100),
  urgent_deadline_days integer not null default 14 check (urgent_deadline_days between 1 and 90),
  tavily_search_estimate_usd numeric(12, 4) not null default 0.008 check (tavily_search_estimate_usd >= 0),
  gemini_extraction_estimate_usd numeric(12, 4) not null default 0.01 check (gemini_extraction_estimate_usd >= 0),
  run_day_of_week smallint not null default 1 check (run_day_of_week between 0 and 6),
  run_time_local time not null default '06:00',
  timezone text not null default 'Asia/Colombo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.research_budget_configs (active)
select true
where not exists (select 1 from public.research_budget_configs where active);

insert into public.research_query_configs (query_text, opportunity_focus)
values
  ('Sri Lanka youth conference forum summit upcoming registration', 'external_representation'),
  ('Sri Lanka call for speakers youth university event', 'speaking'),
  ('Sri Lanka youth collaboration partnership opportunity', 'youth_collaboration'),
  ('Sri Lanka media interview podcast youth opportunity', 'media'),
  ('Sri Lanka volunteer event university students', 'volunteering'),
  ('Sri Lanka education exhibition exhibitor stall registration', 'ogx_stall'),
  ('Sri Lanka NGO youth programme applications', 'youth_collaboration'),
  ('Sri Lanka SDG event upcoming youth', 'external_representation'),
  ('Colombo technology conference upcoming', 'external_representation')
on conflict (query_text, source_config_id) do nothing;

insert into public.research_source_configs (name, base_url, allowed_domain, source_category, search_keywords, priority)
values
  ('National Youth Services Council', 'https://nysc.lk/', 'nysc.lk', 'government', 'youth forums leadership programmes national youth events panels', 10),
  ('UN Sri Lanka', 'https://srilanka.un.org/', 'srilanka.un.org', 'un_development', 'youth consultations SDG events observances volunteering', 20),
  ('UNDP Sri Lanka', 'https://www.undp.org/srilanka', 'undp.org', 'un_development', 'youth innovation climate entrepreneurship SDGs', 30),
  ('ICTA Sri Lanka', 'https://www.icta.lk/', 'icta.lk', 'government', 'technology innovation startup events demo days', 40),
  ('Sri Lanka Foundation Institute', 'https://slfi.lk/', 'slfi.lk', 'government', 'leadership forums training civic education workshops', 50)
on conflict (allowed_domain) do nothing;

create table if not exists public.research_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  research_run_id uuid not null references public.research_runs(id) on delete cascade,
  provider text not null check (provider in ('tavily', 'gemini')),
  operation text not null,
  model text,
  units numeric(14, 4),
  estimated_cost_usd numeric(12, 4) not null default 0 check (estimated_cost_usd >= 0),
  actual_cost_usd numeric(12, 4),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.research_run_items (
  id uuid primary key default gen_random_uuid(),
  research_run_id uuid not null references public.research_runs(id) on delete cascade,
  candidate_fingerprint text,
  disposition text not null check (disposition in ('inserted', 'duplicate', 'possible_duplicate', 'invalid', 'budget_skipped')),
  discovered_opportunity_id uuid references public.discovered_opportunities(id) on delete set null,
  duplicate_of_id uuid references public.discovered_opportunities(id) on delete set null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_assignments (
  id uuid primary key default gen_random_uuid(),
  discovered_opportunity_id uuid not null references public.discovered_opportunities(id) on delete cascade,
  assigned_to uuid references auth.users(id) on delete set null,
  assigned_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  discovered_opportunity_id uuid not null references public.discovered_opportunities(id) on delete cascade,
  subject text,
  body text not null,
  template_key text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_research_summaries (
  id uuid primary key default gen_random_uuid(),
  research_run_id uuid not null unique references public.research_runs(id) on delete cascade,
  week_start date not null,
  new_opportunity_count integer not null default 0,
  duplicate_count integer not null default 0,
  possible_duplicate_count integer not null default 0,
  urgent_deadline_count integer not null default 0,
  failure_count integer not null default 0,
  estimated_cost_usd numeric(12, 4) not null default 0,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discovered_opportunities_review_idx on public.discovered_opportunities (discovery_status, application_deadline);
create index if not exists discovered_opportunities_fingerprint_idx on public.discovered_opportunities (duplicate_fingerprint);
create index if not exists research_source_configs_enabled_idx on public.research_source_configs (enabled, priority);
create index if not exists research_query_configs_enabled_idx on public.research_query_configs (enabled, priority);
create index if not exists research_usage_ledger_run_idx on public.research_usage_ledger (research_run_id, created_at);
create index if not exists research_usage_ledger_month_idx on public.research_usage_ledger (created_at);
create index if not exists research_run_items_run_idx on public.research_run_items (research_run_id, disposition);
create index if not exists opportunity_assignments_discovery_idx on public.opportunity_assignments (discovered_opportunity_id, created_at desc);
create index if not exists outreach_drafts_discovery_idx on public.outreach_drafts (discovered_opportunity_id, updated_at desc);

drop trigger if exists research_source_configs_set_updated_at on public.research_source_configs;
drop trigger if exists research_query_configs_set_updated_at on public.research_query_configs;
drop trigger if exists research_budget_configs_set_updated_at on public.research_budget_configs;
drop trigger if exists outreach_drafts_set_updated_at on public.outreach_drafts;

create trigger research_source_configs_set_updated_at before update on public.research_source_configs for each row execute function public.set_updated_at();
create trigger research_query_configs_set_updated_at before update on public.research_query_configs for each row execute function public.set_updated_at();
create trigger research_budget_configs_set_updated_at before update on public.research_budget_configs for each row execute function public.set_updated_at();
create trigger outreach_drafts_set_updated_at before update on public.outreach_drafts for each row execute function public.set_updated_at();

alter table public.research_source_configs enable row level security;
alter table public.research_query_configs enable row level security;
alter table public.research_budget_configs enable row level security;
alter table public.research_usage_ledger enable row level security;
alter table public.research_run_items enable row level security;
alter table public.opportunity_assignments enable row level security;
alter table public.outreach_drafts enable row level security;
alter table public.weekly_research_summaries enable row level security;

drop policy if exists "Authenticated users can manage research source configuration" on public.research_source_configs;
drop policy if exists "Authenticated users can manage research query configuration" on public.research_query_configs;
drop policy if exists "Authenticated users can manage research budget configuration" on public.research_budget_configs;
drop policy if exists "Authenticated users can manage research usage" on public.research_usage_ledger;
drop policy if exists "Authenticated users can manage research run items" on public.research_run_items;
drop policy if exists "Authenticated users can manage opportunity assignments" on public.opportunity_assignments;
drop policy if exists "Authenticated users can manage outreach drafts" on public.outreach_drafts;
drop policy if exists "Authenticated users can manage weekly research summaries" on public.weekly_research_summaries;

create policy "Authenticated users can manage research source configuration" on public.research_source_configs for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage research query configuration" on public.research_query_configs for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage research budget configuration" on public.research_budget_configs for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage research usage" on public.research_usage_ledger for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage research run items" on public.research_run_items for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage opportunity assignments" on public.opportunity_assignments for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage outreach drafts" on public.outreach_drafts for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage weekly research summaries" on public.weekly_research_summaries for all to authenticated using (true) with check (true);

create or replace function public.approve_discovered_opportunity(p_discovery_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  discovery public.discovered_opportunities;
  matched_organization_id uuid;
  created_opportunity_id uuid;
begin
  select * into discovery from public.discovered_opportunities where id = p_discovery_id for update;
  if not found then raise exception 'Discovery not found'; end if;
  if discovery.approved_opportunity_id is not null or discovery.discovery_status = 'approved' then raise exception 'Discovery has already been approved'; end if;
  if discovery.discovery_status not in ('ai_found_needs_review', 'reviewing') then raise exception 'Only reviewable discoveries can be approved'; end if;
  matched_organization_id := discovery.organization_id;
  if matched_organization_id is null and nullif(trim(discovery.organization_name), '') is not null then
    select id into matched_organization_id from public.organizations where lower(trim(name)) = lower(trim(discovery.organization_name)) order by created_at asc limit 1;
    if matched_organization_id is null then insert into public.organizations (name, relationship_status) values (trim(discovery.organization_name), 'prospect') returning id into matched_organization_id; end if;
  end if;
  insert into public.opportunities (organization_id, title, description, category, representation_type, event_date, application_deadline, location, event_url, source, source_url, status, relevance_score, visibility_score, networking_score, stakeholder_value_score, feasibility_score, notes)
  values (matched_organization_id, discovery.title, discovery.description, discovery.category, discovery.representation_type, discovery.event_date, discovery.application_deadline, discovery.location, discovery.event_url, discovery.source_name, discovery.source_url, 'discovered', discovery.relevance_score, discovery.visibility_score, discovery.networking_score, discovery.stakeholder_value_score, discovery.feasibility_score, discovery.research_notes)
  returning id into created_opportunity_id;
  update public.discovered_opportunities set discovery_status = 'approved', reviewed_at = now(), organization_id = matched_organization_id, approved_opportunity_id = created_opportunity_id where id = p_discovery_id;
  return created_opportunity_id;
end;
$$;

notify pgrst, 'reload schema';
