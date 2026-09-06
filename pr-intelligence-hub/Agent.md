# AGENTS.md

Read PROJECT.md before making architectural or product decisions.

## Working principles

- Work incrementally.
- Do not implement features outside the requested phase.
- Do not introduce unnecessary dependencies.
- Prefer maintainable straightforward code over abstractions.
- Use TypeScript strictly.
- Follow Next.js App Router conventions.
- Use Supabase for persistence and authentication.
- Database schema changes must use Supabase migrations.
- Never commit secrets.
- Never expose service-role credentials client-side.
- Keep business logic separate from presentation code.

## Before modifying code

Inspect:
- existing project structure
- package.json
- relevant database migrations
- existing components
- existing types

Do not assume files or APIs exist.

## After modifying code

Run the appropriate checks:

npm run lint
npm run build

Fix errors introduced by your changes.

## Database

Use PostgreSQL/Supabase conventions.

Enable Row Level Security where appropriate.

Use foreign keys and useful constraints.

Avoid storing information that can reliably be derived from another field unless
there is a clear reason.

Use timestamptz for timestamps.

Use UUID primary keys unless another strategy is already established.

## Product context

PROJECT.md defines product behavior and scope.
Do not independently expand the product beyond it.