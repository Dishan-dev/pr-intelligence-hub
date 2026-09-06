create table public.discovered_opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  organization_name text,
  organization_id uuid references public.organizations(id) on delete set null,
  description text,
  category text check (category in ('conference', 'youth_forum', 'corporate_event', 'university_event', 'ngo_event', 'government_event', 'sdg_event', 'networking_event', 'workshop', 'panel_discussion', 'competition', 'media_opportunity', 'partnership_opportunity', 'stall_exhibition', 'other')),
  representation_type text check (representation_type in ('speaking', 'non_speaking', 'panel', 'networking', 'media', 'partnership', 'stall_booth', 'competition')),
  event_date date,
  application_deadline date,
  location text,
  event_url text,
  source_name text,
  source_url text,
  relevance_score smallint check (relevance_score between 0 and 100),
  visibility_score smallint check (visibility_score between 0 and 100),
  networking_score smallint check (networking_score between 0 and 100),
  stakeholder_value_score smallint check (stakeholder_value_score between 0 and 100),
  feasibility_score smallint check (feasibility_score between 0 and 100),
  recommendation_summary text,
  research_notes text,
  discovery_status text not null default 'new' check (discovery_status in ('new', 'reviewing', 'approved', 'rejected', 'duplicate', 'expired')),
  discovered_at timestamptz not null default now(),
  reviewed_at timestamptz,
  approved_opportunity_id uuid references public.opportunities(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (approved_opportunity_id is null or discovery_status = 'approved')
);

create index discovered_opportunities_status_idx on public.discovered_opportunities (discovery_status);
create index discovered_opportunities_event_date_idx on public.discovered_opportunities (event_date);
create index discovered_opportunities_application_deadline_idx on public.discovered_opportunities (application_deadline);
create index discovered_opportunities_organization_id_idx on public.discovered_opportunities (organization_id);
create index discovered_opportunities_discovered_at_idx on public.discovered_opportunities (discovered_at desc);

create trigger discovered_opportunities_set_updated_at
before update on public.discovered_opportunities
for each row execute function public.set_updated_at();

alter table public.discovered_opportunities enable row level security;

create policy "Authenticated users can manage discovered opportunities"
on public.discovered_opportunities
for all to authenticated
using (true)
with check (true);

create function public.approve_discovered_opportunity(p_discovery_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  discovery public.discovered_opportunities;
  matched_organization_id uuid;
  created_opportunity_id uuid;
begin
  select * into discovery
  from public.discovered_opportunities
  where id = p_discovery_id
  for update;

  if not found then
    raise exception 'Discovery not found';
  end if;

  if discovery.approved_opportunity_id is not null or discovery.discovery_status = 'approved' then
    raise exception 'Discovery has already been approved';
  end if;

  if discovery.discovery_status not in ('new', 'reviewing') then
    raise exception 'Only new or reviewing discoveries can be approved';
  end if;

  matched_organization_id := discovery.organization_id;
  if matched_organization_id is null and nullif(trim(discovery.organization_name), '') is not null then
    select id into matched_organization_id
    from public.organizations
    where lower(trim(name)) = lower(trim(discovery.organization_name))
    order by created_at asc
    limit 1;

    if matched_organization_id is null then
      insert into public.organizations (name, relationship_status)
      values (trim(discovery.organization_name), 'prospect')
      returning id into matched_organization_id;
    end if;
  end if;

  insert into public.opportunities (
    organization_id, title, description, category, representation_type, event_date,
    application_deadline, location, event_url, source, source_url, status,
    relevance_score, visibility_score, networking_score, stakeholder_value_score,
    feasibility_score, notes
  ) values (
    matched_organization_id, discovery.title, discovery.description, discovery.category,
    discovery.representation_type, discovery.event_date, discovery.application_deadline,
    discovery.location, discovery.event_url, discovery.source_name, discovery.source_url,
    'discovered', discovery.relevance_score, discovery.visibility_score,
    discovery.networking_score, discovery.stakeholder_value_score, discovery.feasibility_score,
    discovery.research_notes
  ) returning id into created_opportunity_id;

  update public.discovered_opportunities
  set discovery_status = 'approved', reviewed_at = now(), organization_id = matched_organization_id,
      approved_opportunity_id = created_opportunity_id
  where id = p_discovery_id;

  return created_opportunity_id;
end;
$$;

revoke all on function public.approve_discovered_opportunity(uuid) from public;
grant execute on function public.approve_discovered_opportunity(uuid) to authenticated;

notify pgrst, 'reload schema';
