# Weekly External Opportunity Research

## Purpose and scope

This module adds a weekly, review-first research workflow for AIESEC in University of Moratuwa. It finds public Sri Lankan opportunities for external representation, speaking, youth collaboration, media, volunteering, and OGX stalls.

It may search and prepare records. It must never contact an organisation, submit an application, publish content, or send an email or DM. Outreach is a human action prepared from templates only.

Every discovered record starts as **AI Found – Needs Review**. A reviewer can approve, reject, assign an owner, or prepare outreach. Approval promotes the discovery into the existing opportunity pipeline.

## Existing foundation

The app already provides:

- Next.js App Router, TypeScript, Supabase Auth and PostgreSQL.
- `discovered_opportunities`, `discovery_sources`, and `research_runs` migrations.
- A Discoveries inbox with manual research, filtering, review states, approval, and promotion into `opportunities`.
- Tavily public-web evidence retrieval, Gemini structured extraction, five existing scoring dimensions, and URL/exact-title duplicate checks.
- An Excel operating model with a Source Registry, Bot Config, Live Opportunities fields, and outreach templates.

The initial implementation should extend these primitives instead of creating a parallel bot or a second opportunity pipeline.

## Target architecture

```text
Weekly scheduler (Supabase Cron + Edge Function)
  -> authenticated internal research endpoint
  -> run lock + monthly budget gate
  -> enabled source/query configuration
  -> public-source search/fetch adapters
  -> evidence normalisation and extraction
  -> validation, classification, relevance scoring
  -> canonical duplicate detection
  -> discoveries + evidence + usage ledger
  -> weekly summary and urgent-deadline view
  -> human review: approve / reject / assign / prepare outreach
```

### Scheduler and execution

- Default schedule: Monday 06:00 Asia/Colombo, stored as a configurable schedule. The first production schedule should use Supabase Cron to invoke a Supabase Edge Function; this keeps the schedule and its execution history close to the database.
- The worker calls an internal, authenticated research service. It must use a unique weekly-run key and a database advisory/row lock so retries or concurrent invocations cannot create two runs.
- Break the run into bounded source/query batches. Persist progress after each batch so a partial failure is visible and resumable.
- Manual runs stay available to authenticated users, but use the same worker, lock, budget gate, audit records, and deduplication as scheduled runs.

### Source governance

Only configured, enabled, public sources can be searched. Source records hold a display name, base URL, domain allow-list, source category, query keywords, enabled flag, frequency, priority, owner, and last/next check timestamps.

Global queries are separate, editable records. Each holds query text, opportunity focus, enabled flag, locale/country, priority, and an optional source/domain scope. Seed the configuration from the tracker’s `Source Registry` and `Bot Config`; do not hard-code the current `RESEARCH_THEMES` list as the source of truth.

Phase 1 should prefer official public pages of government, UN/development, universities, NGOs, media organisations, professional bodies, youth networks, and organiser/event pages. Search-result pages are discovery evidence, not sufficient proof when an event page or official announcement is available.

### Processing pipeline

1. Create a research run with its schedule/manual trigger and selected configuration snapshot.
2. Reserve worst-case budget before each external call. Stop cleanly before exceeding the monthly cap.
3. Retrieve a small, bounded set of public evidence per enabled query/source.
4. Extract only from that evidence. Treat page content as untrusted data, never instructions.
5. Validate fields and dates. Unknown values remain null; no inferred contact details or dates.
6. Classify opportunities as `external_representation`, `speaking`, `youth_collaboration`, `media`, `volunteering`, `ogx_stall`, or `other`. A record may have a primary type plus tags.
7. Compute a transparent 0–100 relevance score and store a score breakdown/version.
8. Canonicalize URLs and compare against existing discoveries, approved opportunities, and other candidates in the same run. Quarantine likely duplicates for audit rather than silently treating them as new.
9. Insert accepted records with status `ai_found_needs_review`, their evidence records, and the measured API usage.
10. Produce a summary containing new records, duplicates, failures, spend, and deadlines due within the configurable urgent window (default: 14 days).

### Extraction contract

Each candidate must preserve:

- event name and organiser;
- event date and application/registration deadline;
- venue/location and expected audience/audience profile;
- contact name, contact email/route, and other public contact details when explicitly present;
- source URL, event URL where distinct, source name, and evidence excerpt/provenance;
- primary opportunity type plus tags;
- relevance score, score version, explanation, and confidence;
- fields relevant to OGX stalls: stall availability, cost/currency, and exhibitor terms where published.

Only source-backed fields may be displayed as facts. `source_url` should point to the evidence page, and every source-backed record needs at least one evidence row.

### Scoring

Retain the current five 0–100 dimensions for continuity:

- AIESEC relevance 30%
- visibility potential 25%
- networking value 20%
- stakeholder value 15%
- feasibility 10%

Add a versioned deterministic scorer before any optional AI-assisted scoring. Inputs should include the target geography, youth/university audience, representation/speaking/collaboration/volunteering/media/OGX fit, event scale, deadline feasibility, cost, and source quality. The AI may propose a score rationale, but server logic computes and persists the final score. The review UI shows the breakdown and lets a human override it with an audit reason.

### Deduplication

Use three levels, in order:

1. Exact canonical URL match across primary/event/supporting URLs.
2. Stable fingerprint: normalized title + organiser + event date (or deadline when no event date) + primary type.
3. Similarity review: normalized title/organiser and nearby dates. Do not auto-merge a similarity-only match; mark it `possible_duplicate` for a reviewer.

Canonicalisation removes tracking parameters, normalizes host casing/trailing slashes, and follows only a bounded, safe redirect policy. Add unique indexes where deterministic keys make that safe; retain all raw URLs for provenance.

## Database design

### Amend existing tables

`discovered_opportunities` should gain `workflow_status` (or migrate/rename `discovery_status` values) so `ai_found_needs_review` is explicit. Add primary opportunity type, tags, organiser contact fields, audience fields, OGX stall fields, score version/breakdown, confidence, canonical/fingerprint keys, duplicate disposition/reference, assigned user, outreach preparation fields, and source-quality metadata.

`research_runs` should gain `run_key`, trigger type, configuration version/snapshot, scheduled time, worker version, budget reservation/actual cost, usage counts by provider, summary status, and an error detail payload. A unique `(run_key)` prevents repeat scheduled runs.

`discovery_sources` should gain canonical URL, evidence excerpt/hash, retrieval timestamp, source-config reference, and optional HTTP/cache metadata. Do not store full scraped pages unless retention, privacy, and provider terms are explicitly decided.

### New tables

| Table | Purpose |
| --- | --- |
| `research_source_configs` | Approved monitored public sources and domain rules. |
| `research_query_configs` | Configurable weekly search queries and focus/type. |
| `research_budget_configs` | Monthly cap, currency, per-provider guardrails, and urgent-deadline window. |
| `research_usage_ledger` | One row per API request/batch with provider, model/operation, units, estimated/actual USD cost, and run. |
| `research_run_items` | Candidate-level disposition (`inserted`, `duplicate`, `invalid`, `budget_skipped`) for auditability. |
| `opportunity_assignments` | Assignee and assignment history; permits future roles without coupling to one user field. |
| `outreach_drafts` | Human-editable draft from a template. Contains no send mechanism. |
| `weekly_research_summaries` | Immutable weekly roll-up and urgent-deadline snapshot. |

All tables need UUID keys, `timestamptz` audit columns, foreign keys, indexes on status/date/run/configuration keys, and RLS policies at least as restrictive as existing authenticated-user policies. Before production, replace broad authenticated write policies with role-aware permissions for config, review, and run operations.

## UX and workflow

- **Discoveries inbox:** default filter is `AI Found – Needs Review`; shows type, organiser, deadline, score, evidence quality, duplicate flag, and assignment.
- **Discovery detail:** displays only source-backed fields, evidence links, extracted contact route, score breakdown, and comparison when a possible duplicate exists.
- **Review actions:** approve to the official pipeline, reject with a reason, mark duplicate, assign a reviewer/owner, or prepare an outreach draft.
- **Outreach draft:** chooses a local template and merges approved fields into an editable draft. It provides copy/download only. No send button, mail API, queued message, or automatic follow-up exists in this module.
- **Configuration:** authorised users manage source and query lists, weekly schedule, score thresholds, urgent window, and monthly budget.
- **Summary:** dashboard/inbox summary gives new review items, high-score items, urgent deadlines, duplicates, failures, and actual/estimated monthly spend. Notifications, if later requested, should link to the summary and never contact an external organiser.

## Integrations and cost posture

| Integration | Role | Cost posture | Decision |
| --- | --- | --- | --- |
| Supabase PostgreSQL/Auth | Existing persistence, RLS, audit data | Existing project plan | Keep. |
| Supabase Cron + Edge Functions | Preferred weekly scheduling and worker | Depends on Supabase plan/usage | Recommended; one weekly job is a small, controllable workload. |
| Tavily Search API | Existing public-web discovery | Free tier and paid/credit-based options | Keep as an adapter; measure credits per call and cap before calls. |
| Gemini API | Existing structured extraction/optional rationale | Free and paid tiers, token-based paid usage | Keep as an adapter; track model/tokens/cost and use a strict response schema. |
| Direct approved-source fetcher | Official-page confirmation where permitted | Usually no API fee, but must respect robots, terms, rate limits | Add only after source governance and legal/terms review. |
| Vercel Cron | Alternative scheduler if deployment ownership requires it | Plan/usage dependent | Do not use concurrently with Supabase Cron. It uses UTC and requires locking/idempotency. |
| Email, WhatsApp, LinkedIn APIs | External communication | Often paid or approval-bound | Explicitly out of scope. Do not integrate. |

Provider pricing and limits change. The app must not rely on a hard-coded price sheet: administrators set conservative per-operation estimates, the ledger records the estimate/actual returned by a provider where available, and the worker stops before the configured monthly limit. Tavily currently documents a free monthly-credit tier and pay-as-you-go credits; Gemini documents free and paid tiers. Verify the current plan at configuration time.

## Affected code areas

| Area | Change in implementation phase |
| --- | --- |
| `supabase/migrations/` | Add configuration, usage, summary, assignment/draft tables; status/data migrations; RLS, indexes, RPCs. |
| `lib/domain/discovery.ts` and `lib/domain/opportunity.ts` | Add workflow/type/status data contracts and labels. |
| `lib/research/profile.ts` | Replace fixed profile/theme constants with database-backed configuration. |
| `lib/research/tavily.ts` | Query/source-aware adapter plus measured usage and allow-list handling. |
| `lib/research/gemini.ts`, `candidate.ts`, `response.ts` | Expanded extraction schema, strict grounding, classification and score rationale. |
| `lib/research/duplicate.ts` | Canonical URL, deterministic fingerprint, and possible-duplicate logic. |
| `lib/research/service.ts` | Durable batch orchestration, idempotency, budget gate, ledger, and summary creation. |
| `lib/data/discoveries.ts`, `lib/data/research-runs.ts` | Config, summary, assignment, and evidence query functions. |
| `app/(application)/discoveries/` | Weekly inbox/detail, review actions, manual-run visibility. |
| New `app/(application)/research-settings/` | Source/query/budget/schedule management for authorised users. |
| New `app/api/internal/research/weekly/route.ts` or Edge Function | Secured scheduler entry point. |
| `components/` | Score/evidence/duplicate/assignment/outreach-draft UI. |
| `app/(application)/dashboard/page.tsx` | Weekly summary and urgent-deadline widgets. |
| `.env.example` | Cron secret and server-only provider configuration, never actual secrets. |
| `docs/OPPORTUNITY_BOT_SPEC.md` | This durable design and the agreed decisions. |

## Implementation phases

1. **Schema and safety:** approve this specification; migrate statuses/config/usage tables; seed source and query configuration from the tracker; add RLS and audit/index constraints.
2. **Reliable research core:** refactor the existing manual run onto configured inputs, strict extraction, deterministic scoring, canonical deduplication, and usage/budget enforcement. Test failure, boundary, retry, and duplicate cases.
3. **Weekly automation:** add one secure scheduler, idempotency lock, bounded batches, run observability, and weekly summary. Start in dry-run mode before enabling writes.
4. **Review workflow:** add assignment, possible-duplicate review, status transitions, and outreach-draft preparation. Keep the no-contact guard testable.
5. **Operational hardening:** add role-aware access, retention/terms decisions, source health monitoring, reconciliation dashboards, alerting for failures/budget/urgent deadlines, and acceptance testing with a curated set of Sri Lankan sources.

## Acceptance criteria

- A single weekly scheduled run executes once for its weekly key, is observable, and cannot overlap a manual or retry run.
- Disabled or unapproved sources/queries generate no external requests.
- Each accepted record has source URL(s), a primary type, a deterministic relevance score, and workflow status `AI Found – Needs Review`.
- Known URL/fingerprint duplicates are not reinserted; likely matches require human review.
- The worker stops before the monthly budget is exceeded, with an auditable ledger and summary.
- The weekly summary reports new items, urgent deadlines, duplicates, failures, and spend.
- Approve, reject, assign, and draft outreach work through authenticated, auditable UI actions.
- Automated external contact is technically impossible within this module: there are no send integrations, background delivery jobs, or credentials for them.

## Open decisions for architecture review

1. Which users/roles may edit sources, budgets, schedules, and score weights?
2. Should the weekly schedule stay Monday 06:00 Sri Lanka time from the tracker, and should manual runs consume the same monthly budget?
3. Is a Vercel deployment required, or should Supabase Cron + Edge Functions own scheduling?
4. Which approved source categories/domains are in the first seed list, and are social platforms excluded from phase 1?
5. What is the first monthly USD cap and urgent-deadline window?
6. What retention period is acceptable for evidence excerpts and API-usage audit records?

## Deployment checklist

1. Apply the `20260913120000_weekly_opportunity_research.sql` migration.
2. Configure server-only `SUPABASE_SERVICE_ROLE_KEY` and a random `CRON_SECRET`; never expose either through `NEXT_PUBLIC_` variables.
3. In Supabase Cron, schedule one Monday 00:30 UTC HTTP `POST` to `/api/internal/research/weekly` with `Authorization: Bearer <CRON_SECRET>`. This corresponds to 06:00 Asia/Colombo.
4. Confirm the endpoint produces one `research_runs` row with a `weekly:YYYY-MM-DD` key. Retrying the same week must return `already_completed`.
5. Keep provider keys server-only, review the initial approved sources, and run a manual test before enabling the scheduler.
