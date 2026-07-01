# Testing Strategy

ArcadeGhosts CRM should add testing in layers that match the product stage:

## Unit Testing

Use `vitest` for logic that is worth protecting without a browser:

- query/filter helpers
- lead scoring logic
- import normalization and enrichment mapping
- data formatting helpers
- mock-data seed helpers
- route-independent service helpers where practical

Avoid writing shallow unit tests around simple JSX markup that changes frequently without much business risk.

## E2E Testing

Use Playwright for flows that matter across routing, forms, and database-backed behavior:

- create company
- create contact
- create lead
- create interaction
- create follow-up
- create task
- create proposal
- create project
- filter/search flows
- key detail-page navigation

As import and outreach workflows mature, add Playwright coverage for:

- importing demo leads
- dedupe behavior
- lead queue behavior
- outreach draft creation

## Mock Data Strategy

Preferred approach:

- production database for real data only
- preview database for deployed review/testing work
- local dev database for day-to-day feature work

Do not rely on production plus a loose “we’ll delete test rows later” workflow.

If we need seeded demo records in shared non-production environments, they should be:

- created by a script
- clearly tagged as demo/test data
- easy to delete in one pass

## Current Recommendation

Because Vercel Preview is already available, the safest next step is:

1. create a separate preview/dev Neon database or branch
2. point Vercel Preview env vars at that non-production database
3. keep Production env vars pointed at the real production database
4. later add seed and cleanup scripts for demo/test data in non-production environments

## Why Not Just Tag Everything In Production?

Tagging records as test data can help with cleanup, but it is not enough on its own because:

- production analytics get polluted
- real and fake records can get mixed into dashboards and workflows
- destructive cleanup becomes riskier
- accidental email/outreach behavior becomes more dangerous

Record tagging is useful inside preview/dev databases, not as the primary safety boundary.

## Future Implementation Tasks

- add `vitest` and the first unit tests
- add a demo/test seed script
- add a cleanup script for tagged demo/test data
- decide whether tagging should use a dedicated field, a shared metadata column, or dedicated seed tables
- add Playwright flows for CRUD and filter coverage
