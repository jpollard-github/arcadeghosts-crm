# Testing Notes

This note captures the testing setup decisions and recommendations discussed before implementing automated tests.

## Current direction

Recommended testing stack:

- `vitest` for unit tests around helpers, internal logic, import normalization, scoring, and similar non-UI code
- Playwright for end-to-end coverage of the Phase 1 CRM flows
- screenshots disabled by default for faster Playwright runs
- a separate dedicated database for e2e tests

## Why use a separate test database

The safest approach is to split database usage into three lanes:

- `Production DB`
  real app data only
- `Preview/Dev DB`
  non-production app data for normal review and development
- `E2E Test DB`
  disposable database used only by Playwright

Why this is preferred:

- avoids polluting real records
- avoids risky cleanup logic against production-like data
- makes Playwright cleanup deterministic
- keeps automated tests independent from day-to-day manual usage

## Environment variable plan

Recommended variables:

- `DATABASE_URL`
  the app's normal database connection for production, preview, and local dev
- `E2E_TEST_DATABASE_URL`
  a separate database used only by automated tests
- `E2E_CAPTURE_SCREENSHOTS`
  default `false` so e2e runs stay fast

Recommended local `.env.local` shape:

```env
DATABASE_URL=postgres://...your-local-or-preview-dev-db...
E2E_TEST_DATABASE_URL=postgres://...your-dedicated-e2e-test-db...
E2E_CAPTURE_SCREENSHOTS=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Recommended `.env.example` additions:

```env
# App database for normal local/dev usage
DATABASE_URL=

# Dedicated disposable database for Playwright e2e tests
E2E_TEST_DATABASE_URL=

# Default false for fastest test runs
E2E_CAPTURE_SCREENSHOTS=false

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Vercel environment recommendation

Recommended database lane setup:

- `Production`
  `DATABASE_URL` points at the production database
- `Preview`
  `DATABASE_URL` points at a safe preview/dev database
- `Development`
  `DATABASE_URL` points at a safe preview/dev database unless local-only DB is preferred

Recommended test env setup:

- `Preview`
  `E2E_TEST_DATABASE_URL` points at dedicated test DB
- `Development`
  `E2E_TEST_DATABASE_URL` points at dedicated test DB
- `Production`
  do not set `E2E_TEST_DATABASE_URL` unless there is a very specific reason

Recommended screenshot env setup:

- `Preview`
  `E2E_CAPTURE_SCREENSHOTS=false`
- `Development`
  `E2E_CAPTURE_SCREENSHOTS=false`

## Data strategy for tests

Recommended direction:

- do not use the real workbook in `private/` for automated tests
- use static `.ts` fixtures for most seeded data
- later add one fake `.xlsx` fixture in the test tree specifically for import-flow coverage

Suggested layout:

- `tests/unit/fixtures/*.ts`
- `tests/e2e/fixtures/*.ts`
- `tests/e2e/fixtures/imports/*.xlsx`

Why:

- versioned and reproducible
- no dependency on private real-world data
- easy to run locally and in CI
- safer cleanup

## What we decided not to do

Not recommended right now:

- using `[local-workbook-import]` alone as an automated test cleanup strategy
- adding a `test` boolean field to every table just to support cleanup
- relying on the real local workbook for automated tests

## Later documentation placement

Best long-term split:

- keep `docs/crm-todo.md` high-level
- keep exact testing setup steps in durable docs such as:
  `docs/testing-notes.md`
  `docs/testing-strategy.md`
  or a future `docs/test-db-setup.md`

Suggested TODO phrasing later:

- set up separate preview/dev/test DBs and test env vars
- add `vitest` and Playwright scaffolding
- add static test fixtures and fake XLSX import fixtures
