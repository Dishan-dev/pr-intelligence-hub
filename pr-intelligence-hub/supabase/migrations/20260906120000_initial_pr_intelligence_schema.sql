create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  website text,
  organization_type text check (organization_type in (
    'company', 'ngo', 'university', 'government', 'media', 'professional_body',
    'youth_organization', 'other'
  )),
  industry text,
  description text,
  linkedin_url text,
  location text,
  relationship_status text not null default 'prospect' check (relationship_status in (
    'prospect', 'active', 'dormant', 'former'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  category text check (category in (
    'conference', 'youth_forum', 'corporate_event', 'university_event', 'ngo_event',
    'government_event', 'sdg_event', 'networking_event', 'workshop', 'panel_discussion',
    'competition', 'media_opportunity', 'partnership_opportunity', 'stall_exhibition', 'other'
  )),
  representation_type text check (representation_type in (
    'speaking', 'non_speaking', 'panel', 'networking', 'media', 'partnership',
    'stall_booth', 'competition'
  )),
  event_date date,
  application_deadline date,
  location text,
  event_url text,
  source text,
  source_url text,
  status text not null default 'discovered' check (status in (
    'discovered', 'researching', 'qualified', 'applying', 'applied', 'confirmed',
    'attended', 'rejected', 'missed', 'archived'
  )),
  relevance_score smallint check (relevance_score between 0 and 100),
  visibility_score smallint check (visibility_score between 0 and 100),
  networking_score smallint check (networking_score between 0 and 100),
  stakeholder_value_score smallint check (stakeholder_value_score between 0 and 100),
  feasibility_score smallint check (feasibility_score between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organizations_relationship_status_idx on public.organizations (relationship_status);
create index organizations_organization_type_idx on public.organizations (organization_type);
create index opportunities_organization_id_idx on public.opportunities (organization_id);
create index opportunities_status_idx on public.opportunities (status);
create index opportunities_category_idx on public.opportunities (category);
create index opportunities_event_date_idx on public.opportunities (event_date);
create index opportunities_application_deadline_idx on public.opportunities (application_deadline);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.opportunities enable row level security;

create policy "Authenticated users can manage organizations"
on public.organizations
for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage opportunities"
on public.opportunities
for all
to authenticated
using (true)
with check (true);
