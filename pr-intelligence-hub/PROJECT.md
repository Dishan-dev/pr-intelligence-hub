# CS PR HUB

## Product

CS PR HUB is an internal Public Relations outreach and planning workspace and
external representation management system initially designed for an AIESEC local
committee.

The product exists to solve a recurring operational problem:

PR teams do not have a systematic way to discover, evaluate, organize, assign,
and track external representation opportunities.

These opportunities include:

- conferences
- youth forums
- corporate events
- university events
- NGO events
- government events
- SDG-related events
- networking events
- workshops
- panel discussions
- competitions
- media opportunities
- partnership opportunities
- stalls and exhibitions

The long-term product should continuously discover relevant opportunities,
evaluate them, and surface the best ones to PR teams.

However, autonomous discovery is NOT part of the initial MVP.

---

# MVP Goal

The first MVP must enable a PR team to manually manage the entire external
representation opportunity pipeline.

The core flow is:

Discover Opportunity
→ Save Opportunity
→ Evaluate Opportunity
→ Prioritize Opportunity
→ Assign / Act
→ Track Status
→ Attend
→ Record Outcome / Evidence

---

# Primary Entities

## Organizations

Organizations represent external stakeholders.

Examples:

- companies
- NGOs
- universities
- government institutions
- media organizations
- professional bodies
- youth organizations

An organization may have multiple opportunities.

Important information:

- name
- website
- organization type
- industry
- description
- location
- LinkedIn
- relationship status
- notes

---

## Opportunities

Opportunities are the central entity in the application.

Important information:

- title
- organization
- description
- category
- representation type
- event date
- application deadline
- location
- source URL
- event URL
- source
- status
- priority
- notes

Representation types may include:

- Speaking
- Non-speaking
- Panel
- Networking
- Media
- Partnership
- Stall / Booth
- Competition

Opportunity statuses:

- Discovered
- Researching
- Qualified
- Applying
- Applied
- Confirmed
- Attended
- Rejected
- Missed
- Archived

---

# Opportunity Evaluation

Every opportunity should eventually be evaluated using:

- AIESEC relevance
- visibility potential
- networking value
- stakeholder value
- feasibility

Each dimension is scored from 0 to 100.

Overall score:

overallScore =
    relevance * 0.30 +
    visibility * 0.25 +
    networking * 0.20 +
    stakeholderValue * 0.15 +
    feasibility * 0.10

Priority:

0-39   = Low
40-59  = Medium
60-79  = High
80-100 = Critical

The application should calculate overall score and priority rather than asking
users to manually calculate them.

---

# Core MVP Screens

## Dashboard

Show:

- upcoming opportunities
- critical/high priority opportunities
- deadlines approaching
- confirmed representations
- recently added opportunities

## Opportunities

Provide a table/list containing:

- opportunity
- organization
- category
- event date
- deadline
- score
- priority
- status

Allow filtering by:

- status
- category
- priority
- representation type
- date

## Opportunity Detail

Show the complete opportunity record.

Allow:

- editing
- status updates
- scoring
- notes
- organization viewing

## Organizations

Show external stakeholders and their relationship history.

---

# Later Features

The architecture should allow these features later but they should NOT be
implemented during the first MVP unless explicitly requested:

- AI web research
- automated opportunity discovery
- website monitoring
- LinkedIn/event discovery
- automatic scoring
- contact discovery
- email outreach
- deadline notifications
- scheduled research agents
- analytics
- evidence storage
- external representation reporting
- MCP integrations
- multi-agent workflows

---

# Technical Direction

Frontend:
- Next.js
- App Router
- TypeScript
- Tailwind CSS

Backend:
- Supabase
- PostgreSQL
- Supabase Auth

Hosting:
- Vercel

Database changes must be represented as migrations.

Prefer server components where appropriate.

Do not expose privileged Supabase credentials in the browser.

Use strong TypeScript typing.

Keep business logic separate from UI components.

Do not over-engineer the MVP.

---

# UI Direction

The product should feel like a modern internal intelligence / CRM product.

Avoid:
- overly colorful dashboards
- gradients everywhere
- excessive cards
- generic admin-template appearance

Prefer:
- strong information hierarchy
- neutral backgrounds
- compact tables
- clean typography
- restrained accent color
- clear status badges
- useful whitespace
- professional B2B SaaS appearance

The application should prioritize operational usefulness over decoration.

---

# Development Principle

Build incrementally.

For every feature:

1. understand existing architecture
2. implement the smallest coherent feature
3. validate types
4. run lint/build/tests where relevant
5. fix errors before considering the task complete

Never implement future phases merely because they are described in this file.