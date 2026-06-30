# Integrations

## OpenAI

- Purpose
  Support company research summaries, outreach drafting, discovery synthesis, and proposal assistance.
- Expected environment variables
  `OPENAI_API_KEY`
- MVP scope
  Manual-trigger research and drafting helpers with human review.
- Later scope
  Weekly summaries, lead prioritization suggestions, and assistant workflows.
- Security concerns
  Do not send sensitive client or regulated data without an explicit policy decision.

## Resend

- Purpose
  Send outbound outreach and store delivery metadata.
- Expected environment variables
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- MVP scope
  Draft and send lightweight outbound email from CRM records.
- Later scope
  Template management, scheduling, and reply-aware workflows.
- Security concerns
  Verify sender domains, rate limits, and audit what messages were generated versus actually sent.

## Google Drive

- Purpose
  Reference proposal docs, discovery notes, exports, and project folders.
- Expected environment variables
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- MVP scope
  Link existing Drive folders and documents from CRM records.
- Later scope
  Create folders automatically, upload exports, and attach generated documents.
- Security concerns
  Keep scopes narrow and avoid broad Drive access when read-only references are enough.

## Google Calendar

- Purpose
  Schedule and reference discovery calls.
- Expected environment variables
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- MVP scope
  Store event references and optionally create discovery events.
- Later scope
  Two-way sync, reminders, and follow-up task creation.
- Security concerns
  Avoid broad calendar write access until the workflow is stable.

## Google Contacts

- Purpose
  Check whether a contact already exists in Google and optionally link references.
- Expected environment variables
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- MVP scope
  Lookup and reference existing contacts.
- Later scope
  Create or update contact records from CRM events.
- Security concerns
  Keep CRM data authoritative unless there is a clear sync strategy.

## Stripe

- Purpose
  Track customer IDs, payment references, and later invoice links.
- Expected environment variables
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- MVP scope
  Store customer references on projects only.
- Later scope
  Payment status, invoice links, and revenue reporting.
- Security concerns
  Never store unnecessary payment data locally; prefer reference IDs and webhook-driven updates.

## GitHub

- Purpose
  Link projects to repos and later surface implementation references.
- Expected environment variables
  `GITHUB_TOKEN`
- MVP scope
  Store repo URLs and optionally verify accessibility.
- Later scope
  Repo creation helpers, issue links, milestone references, and project handoff notes.
- Security concerns
  Use least-privilege tokens and separate internal project repos from public showcase assets.

## MCP

- Purpose
  Expose selected CRM data and actions safely to AI assistants and automation workflows later.
- Expected environment variables
  No fixed MVP env vars yet.
- MVP scope
  Planning only.
- Later scope
  Read-only lead summaries, task creation, controlled document lookup, and assistant-safe actions.
- Security concerns
  Define strong permission boundaries, auditability, and explicit write controls before exposing real data.
