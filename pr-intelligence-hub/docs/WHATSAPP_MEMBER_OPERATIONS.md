# WhatsApp member attribution and operational checks

This feature does not require Meta setup until end-to-end webhook testing.

## Register a submitting member
Using a privileged Supabase SQL editor, insert a mapping using digits-only international phone format (no leading +):
```sql
insert into public.whatsapp_member_links (phone_number, member_name)
values ('947XXXXXXXX', 'Example Member')
on conflict (phone_number) do update set member_name = excluded.member_name;
```
Do not put real member phone numbers into Git, issue comments, screenshots or public logs. Get members' consent before linking their numbers.

## Review intake activity
```sql
select processing_status, count(*) from public.whatsapp_intake_messages group by processing_status;
```

## Submission attribution
```sql
select coalesce(m.member_name, 'Unlinked member') as member,
       count(*) filter (where i.processing_status = 'processed') as submitted,
       count(*) filter (where d.discovery_status = 'approved') as approved
from public.whatsapp_intake_messages i
left join public.whatsapp_member_links m on m.phone_number = i.sender_phone
left join public.discovered_opportunities d on d.id = i.discovery_id
group by coalesce(m.member_name, 'Unlinked member')
order by approved desc, submitted desc;
```
A duplicate is not credited as a new submission. This query is intended for trusted admins, not a public dashboard. It counts approval state at query time.

## Operational limits
Do not share phone numbers or original WhatsApp messages with general users. Define a retention schedule and access policy before using real member data.
