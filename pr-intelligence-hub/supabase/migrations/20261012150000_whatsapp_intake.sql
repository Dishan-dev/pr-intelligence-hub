create table public.whatsapp_intake_messages (
  id uuid primary key default gen_random_uuid(),
  provider_message_id text not null unique,
  sender_phone text not null,
  message_text text not null,
  processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')),
  discovery_id uuid references public.discovered_opportunities(id) on delete set null,
  error_detail text,
  created_at timestamptz not null default now()
);
create index whatsapp_intake_messages_created_at_idx on public.whatsapp_intake_messages(created_at desc);
alter table public.whatsapp_intake_messages enable row level security;
-- Webhook writes through the server-side service role only. Do not expose message bodies to ordinary members.
create table public.whatsapp_member_links (
  phone_number text primary key,
  member_name text not null,
  member_user_id uuid,
  created_at timestamptz not null default now()
);
alter table public.whatsapp_member_links enable row level security;
create index whatsapp_intake_messages_sender_idx on public.whatsapp_intake_messages(sender_phone);
