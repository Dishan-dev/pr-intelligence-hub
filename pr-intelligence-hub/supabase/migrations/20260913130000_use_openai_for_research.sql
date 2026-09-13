alter table public.research_usage_ledger
  drop constraint if exists research_usage_ledger_provider_check;

alter table public.research_usage_ledger
  add constraint research_usage_ledger_provider_check
  check (provider in ('tavily', 'gemini', 'openai'));
