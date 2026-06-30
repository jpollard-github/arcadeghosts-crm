# ArcadeGhosts CRM TODO

## Current Notes

- Git repo sync is complete for this local project.
- A sample leads `.xlsx` file now exists in `private/` as a local reference during internal coding and import workflow work.
- Sister repo: `~/repos/personal` owns the main ArcadeGhosts site and public/admin website workflows.
- Sister repo: `~/repos/brand-kit` owns branding and collateral generation workflows.
- This CRM should reference those repos where useful without duplicating their main function or source content.

## Next Recommended Implementation Phase

Focus next on:

1. connect a dedicated Neon database and apply the first migration
2. core CRUD for companies, contacts, leads
3. importing sample/demo leads
4. lead priority queue
5. auth implementation using a managed provider such as Clerk

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
- [ ] Add Drizzle relations helpers if useful
- [ ] Add indexes for lead status, follow-up date, company/contact lookup, and do-not-contact filtering
- [ ] Apply the first migration against a dedicated Neon database

## Phase 1 — Core CRM

- [ ] Companies
- [ ] Contacts
- [ ] Leads
- [ ] Interactions
- [ ] Follow-ups
- [ ] Tasks
- [ ] Basic dashboard
- [ ] Lead detail page
- [ ] Company detail page
- [ ] Contact detail page
- [ ] Filters and search
- [ ] Make the eventual mobile CRM UI denser and more utility-focused once real data exists
  nav should not dominate the first viewport, headings can be slightly smaller on mobile, and internal-tool pages should prioritize quick scanning

## Phase 2 — Lead enrichment workflow

- [ ] Import sample CSV/XLSX
- [ ] Add enrichment fields
- [ ] Add lead scoring
- [ ] Add priority queue
- [ ] Add verification date
- [ ] Add source URL tracking
- [ ] Add outreach status
- [ ] Add do-not-contact flag
- [ ] Add dedupe rules for companies and contacts
- [ ] Add weekly review view for stale leads

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
- [ ] Log sent emails
- [ ] Follow-up reminders
- [ ] Bounce/reply handling later
- [ ] Contact form outreach tracking

## Phase 6 — Proposals and projects

- [ ] Proposal records
- [ ] Proposal templates
- [ ] Convert won proposal to project
- [ ] Project task tracking
- [ ] GitHub repo link tracking
- [ ] Drive folder tracking
- [ ] Discovery call to proposal workflow
- [ ] Add references to Brand Kit collateral outputs without copying generator logic into this repo

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
