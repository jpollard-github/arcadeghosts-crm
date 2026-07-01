# ArcadeGhosts CRM

ArcadeGhosts CRM is the internal operating system for running ArcadeGhosts lead generation, outreach, discovery, proposals, projects, and later invoicing. It starts as a focused private CRM for a small consulting practice and is structured to become a future case study and reusable client-tool pattern.

## Why It Exists

- Replace scattered spreadsheets, notes, and ad hoc context with one durable workflow.
- Turn lead research into actionable outreach, proposals, and project handoff.
- Dogfood the kind of internal tools ArcadeGhosts builds for small businesses.
- Keep real prospect and client data out of the codebase by default.

## Sister Repos

- `~/repos/personal`
  The main `arcadeghosts.org` website for personal publishing, portfolio, and lightweight public/admin site workflows.
- `~/repos/brand-kit`
  The brand and collateral generation system for ArcadeGhosts assets such as business cards, proposal covers, letterhead, and related client-facing materials.

This CRM should reference those repos when useful, but should not duplicate their core responsibilities.

## Tech Stack

- Next.js 16
- TypeScript
- App Router
- Drizzle ORM
- PostgreSQL
- Zod environment validation
- OpenAI
- Resend
- Stripe
- Google APIs
- Octokit

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in the values you need.

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

- `npm run dev` starts the local dev server.
- `npm run build` builds the app for production.
- `npm run start` runs the production build locally.
- `npm run lint` runs the Next.js ESLint configuration.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run db:generate` generates Drizzle migrations.
- `npm run db:migrate` applies generated Drizzle migrations.
- `npm run db:push` pushes schema changes to the configured database.

## Review Packets

Use `npm run crm:review-packet` to generate a local review bundle with docs, source, checks, and screenshots.

Generated packets are written to `review-packets/`, which is gitignored.

For UI changes, treat mobile review as part of the normal packet workflow rather than an optional afterthought.

## Health Checks

- `GET /api/health` returns a lightweight app health response.
- `GET /api/health/db` performs a real database round-trip so you can confirm Neon/Postgres is wired up end to end.

## Demo Import Workflow

Use `/imports` to preview and load bundled fake enriched lead rows into the CRM. This route is meant to validate the shape of the future enrichment workflow without importing the real workbook from `private/`.

If `private/triad_prospects_enriched_outreach_tracker.xlsx` exists locally, `/imports` also unlocks an explicit local-only workbook import flow that reads the canonical `Master Prospects` sheet from disk. See [`docs/import-workbook-mapping.md`](docs/import-workbook-mapping.md) for the field mapping and sheet rules.

## Docs Map

- [`docs/leads.md`](docs/leads.md) lead generation operating manual
- [`docs/crm-todo.md`](docs/crm-todo.md) phased product and process backlog
- [`docs/architecture.md`](docs/architecture.md) app structure and build boundaries
- [`docs/auth-strategy.md`](docs/auth-strategy.md) authentication direction and provider recommendation
- [`docs/database-bootstrap.md`](docs/database-bootstrap.md) database provider and migration/bootstrap workflow
- [`docs/data-model.md`](docs/data-model.md) entity and lifecycle design notes
- [`docs/integrations.md`](docs/integrations.md) integration scope, env vars, and security notes
- [`docs/example-leads.md`](docs/example-leads.md) fake lead examples for demos and development
- [`docs/import-workbook-mapping.md`](docs/import-workbook-mapping.md) canonical sheet and field mapping for the private enriched workbook
- [`docs/review-packets.md`](docs/review-packets.md) review packet workflow and usage notes
- [`docs/THEME.md`](docs/THEME.md) CRM design direction and theme token usage
- [`docs/testing-strategy.md`](docs/testing-strategy.md) unit, e2e, and mock-data testing direction
- [`docs/MOBILE-GUARDRAILS.md`](docs/MOBILE-GUARDRAILS.md) repo-wide mobile rules for future UI work
- [`docs/MOBILE-TODO.md`](docs/MOBILE-TODO.md) durable mobile backlog and review checklist

## Current Status

This repo is the first production-oriented scaffold. It includes:

- a working Next.js App Router shell
- starter CRM routes
- a demo-safe import preview and seed flow
- initial Drizzle schema
- integration client placeholders
- documentation and fake example data

Boundaries for now:

- website content, public funnels, and site admin stay in `~/repos/personal`
- branding systems and collateral generators stay in `~/repos/brand-kit`
- lead, contact, proposal, project, and internal operations workflows live here

## Data Safety

Do not commit real lead lists, exports, contact data, proposal docs, or sensitive client files unless they are intentionally sanitized and explicitly meant for source control. Use `private/` locally or Google Drive for real operational data.
