# Architecture

## High-Level App Purpose

ArcadeGhosts CRM is a private internal system for running the full ArcadeGhosts client pipeline:

- lead research
- qualification
- outreach
- discovery
- proposals
- projects
- documents
- later payments and AI-supported operations

The first version should feel like a serious internal tool, not a toy CRM, while still staying small enough to ship and evolve quickly.

## App Layers

Suggested layers:

- `src/app`
  App Router routes, layouts, and route handlers
- `src/components`
  shared layout and CRM UI building blocks
- `src/db`
  Drizzle schema and database wiring
- `src/lib`
  environment validation, API clients, scoring helpers, and integration adapters
- `src/server`
  server actions and orchestration services as real workflows are added
- `src/types`
  shared domain types when schema types alone are not enough
- `docs`
  operating docs and product notes
- `examples`
  fake data only
- `private`
  local-only sensitive files, ignored by git

## Data Model Summary

Core records:

- companies
- contacts
- leads
- lead_sources
- interactions
- follow_ups
- discovery_calls
- proposals
- projects
- tasks
- documents
- integrations
- ai_research_notes
- outreach_messages

This model is designed so a lead can mature into a proposal, then a project, without losing research and outreach context.

## Integrations Overview

Planned integrations:

- OpenAI for research and drafting assistance
- Resend for outbound email
- Google Drive for document references
- Google Calendar for discovery scheduling
- Google Contacts for contact lookup or reference
- Stripe for customer and payment references later
- GitHub for project/repo linkage
- MCP support later for safe AI-facing access

MVP rule: keep integrations as adapters until the product proves the workflow.

## Security Considerations

- Do not commit real lead or client exports to source control.
- Keep real spreadsheets and sensitive files in `private/` locally or in Google Drive.
- Treat medical and wellness workflows as non-clinical unless compliance is intentionally addressed.
- Use OAuth carefully for Google access and limit scopes aggressively.
- Keep AI prompts and outputs reviewable; do not allow unverified generated data to overwrite source truth.
- Assume this starts as single-user or tightly restricted internal access.

## Deployment Notes

- Primary target is Vercel.
- Back the app with PostgreSQL.
- Keep environment variables in Vercel and local `.env.local`, never in committed files.
- Add auth before exposing the app beyond a trusted internal environment.
- Health checks and integration status should remain lightweight.

## What Not To Build Yet

- multi-tenant permissions
- complex automation builders
- generalized CRM customization
- inbound email sync
- full invoicing workflows
- document storage inside the repo
- heavy analytics before there is meaningful usage data

The right first version is a small internal tool with a clean schema and clear extension points.
