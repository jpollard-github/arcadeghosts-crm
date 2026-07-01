# ArcadeGhosts CRM TODO

## Current Notes

- Git repo sync is complete for this local project.
- A sample leads `.xlsx` file now exists in `private/` as a local reference during internal coding and import workflow work.
- Sister repo: `~/repos/personal` owns the main ArcadeGhosts site and public/admin website workflows.
- Sister repo: `~/repos/brand-kit` owns branding and collateral generation workflows.
- This CRM should reference those repos where useful without duplicating their main function or source content.

## Next Recommended Implementation Phase

Focus next on:

1. import and enrichment workflow
2. lead priority queue and stale-lead review
3. richer dashboard views and outreach workflow
4. auth implementation using a managed provider such as Clerk
5. email and outreach workflow
6. denser mobile utility patterns for real data screens
7. testing and demo-data workflow

## Mobile Workstream

Use [`docs/MOBILE-GUARDRAILS.md`](docs/MOBILE-GUARDRAILS.md) and [`docs/MOBILE-TODO.md`](docs/MOBILE-TODO.md) as the standing reference for UI work. Mobile is part of definition of done for future CRM pages, forms, lists, navigation, and review packets.

## Theme Direction

Use [`docs/THEME.md`](docs/THEME.md) as the standing reference for CRM styling. The current direction is a polished private CRM with a subtle ArcadeGhosts accent, not a public-site look and not a sepia/antique card system.

## Testing Direction

Use [`docs/testing-strategy.md`](docs/testing-strategy.md) as the standing reference for unit testing, Playwright coverage, and mock-data environment strategy.

## Review packet workflow

- [x] Add CRM review packet script
- [x] Add npm script
- [x] Add `docs/review-packets.md`
- [x] Generate first packet
- [x] Add packet `MANIFEST.md` orientation file
- [x] Add `reports/ai-context.md`
- [x] Review schema/docs/screenshots
- [x] Use packet before major architecture changes
- [x] Use packet before outreach/import milestones
- [x] Fix packet-relative screenshot paths
- [x] Ensure `docs/review-packets.md` is included in packets
- [x] Ensure `--include-script` copies the packet script
- [x] Add richer AI context summary
- [x] Add packet sensitive-file warnings
- [ ] Expand `reports/ai-context.md` later with git/change summaries if it becomes useful
- [ ] Consider adding changed-files-since-last-packet summary
- [x] Add mobile review section to packet guidance

## Phase 0 — Repo foundation

- [x] Initialize Next.js app
- [x] Add TypeScript, linting, and basic scripts
- [x] Add environment validation
- [x] Add docs folder
- [x] Add example data folder
- [x] Add README
- [x] Add `.gitignore`
- [x] Add initial Drizzle schema
- [x] Add placeholder integration clients
- [x] Sync local project to git repo
- [x] Add local private sample leads workbook for reference
- [x] Note sister repo boundaries in project docs
- [x] Add auth strategy decision notes
- [x] Add first migration and local database bootstrap notes
- [x] Generate first Drizzle migration files
- [x] Add Drizzle relations helpers if useful
- [x] Add indexes for lead status, follow-up date, company/contact lookup, and do-not-contact filtering
- [x] Apply the first migration against a dedicated Neon database
- [x] Verify the live Vercel project has database env vars present
- [ ] Add Preview or dev-specific Neon database strategy instead of relying on production data
- [ ] Add first mock/demo seed and cleanup strategy notes

## Phase 1 — Core CRM

- [x] CRM visual theme course correction
- [x] Companies
- [x] Contacts
- [x] Leads
- [x] Interactions
- [x] Follow-ups
- [x] Tasks
- [x] Basic dashboard
- [x] Lead detail page
- [x] Company detail page
- [x] Contact detail page
- [x] Filters and search
- [ ] Make the eventual mobile CRM UI denser and more utility-focused once real data exists
  Nav should not dominate the first viewport, headings can be slightly smaller on mobile, and internal-tool pages should prioritize quick scanning.

## Phase 2 — Lead enrichment workflow

- [x] Import real XLSX workbook rows from `private/` through an explicit local-only workflow
- [x] Add bundled demo CSV import route and preview screen
- [x] Add import staging shape for enriched workbook rows
- [x] Add enrichment fields
- [x] Add durable lead scoring model beyond the first heuristic queue
- [x] Add priority queue
- [x] Add verification date
- [x] Add source URL tracking
- [x] Add outreach status
- [x] Add do-not-contact flag
- [x] Add first-pass dedupe rules for companies and contacts during import
- [x] Add weekly review view for stale leads
- [x] Add explicit import field-mapping notes for the private enriched workbook tabs

## Phase 3 — AI assistance

- [ ] OpenAI integration
- [ ] AI company research summaries
- [ ] AI outreach angle generation
- [ ] AI first-message drafts
- [ ] AI follow-up drafts
- [ ] AI discovery call summary
- [ ] AI proposal outline generation
- [ ] AI next-action suggestions
- [ ] AI research note source verification prompts

## Phase 4 — Google integrations

- [ ] Google Drive folder linking
- [ ] Google Drive document references
- [ ] Google Calendar discovery call scheduling
- [ ] Google Contacts lookup/reference
- [ ] OAuth planning and security notes
- [ ] Import path from spreadsheet and Drive exports

## Phase 5 — Email and outreach

- [ ] Resend integration
- [ ] Email template storage
- [ ] Draft outreach messages
- [ ] Outreach review queue
- [ ] Outreach message records wired to lead detail pages
- [ ] Log sent emails
- [ ] Follow-up reminders
- [ ] Bounce/reply handling later
- [ ] Contact form outreach tracking

## Phase 6 — Proposals and projects

- [x] Proposal records
- [ ] Proposal templates
- [x] Project records
- [ ] Convert won proposal to project
- [x] Project task tracking
- [ ] GitHub repo link tracking
- [ ] Drive folder tracking
- [ ] Discovery call to proposal workflow
- [ ] Add references to Brand Kit collateral outputs without copying generator logic into this repo

## Phase 6.2 — Testing and demo-data workflow

- [ ] Add `vitest`
- [ ] Add first unit tests for query helpers, scoring, and import normalization
- [ ] Add Playwright CRUD coverage for companies, contacts, leads, interactions, follow-ups, tasks, proposals, and projects
- [ ] Add Playwright filter/search coverage
- [ ] Add non-production demo seed script
- [ ] Add cleanup script for demo/test data
- [ ] Decide whether demo/test tagging needs a dedicated field or metadata strategy
- [ ] Use preview database data for e2e and review loops, not production data

## Phase 6.5 — Cross-repo coordination

- [ ] Define how CRM records link to `~/repos/personal` content or Work With Me funnel pages
- [ ] Define how proposals and client docs link to `~/repos/brand-kit` generated collateral
- [ ] Decide whether CRM should store URLs, slugs, repo paths, or lightweight metadata only
- [ ] Avoid duplicating website content management or brand asset source files here

## Phase 7 — Payments

- [ ] Stripe customer references
- [ ] Stripe invoice/payment links
- [ ] Payment status tracking
- [ ] Project value reporting
- [ ] Proposal-to-revenue conversion reporting

## Phase 8 — MCP support

- [ ] Define MCP use cases
- [ ] Expose CRM resources safely
- [ ] Add local MCP server prototype
- [ ] Support AI assistant workflows
- [ ] Add permission boundaries
- [ ] Define audit logging expectations

## Phase 9 — Productization

- [ ] Dogfood internally
- [ ] Create demo data
- [ ] Create screenshots
- [ ] Create case-study style writeup
- [ ] Decide whether this becomes a reusable client template
- [ ] Identify what needs to become multi-tenant versus remain ArcadeGhosts-specific
