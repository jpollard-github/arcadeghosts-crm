# Data Model

## Entities

- `companies`
  The account-level business record and long-term anchor for work.
- `contacts`
  Named people associated with a company.
- `lead_sources`
  Reusable categorization for where leads came from.
- `leads`
  Qualification and outreach-focused records tied to company context.
- `interactions`
  Logged contact attempts, replies, calls, meetings, and notes.
- `follow_ups`
  Concrete future actions for lead progression.
- `discovery_calls`
  Structured discovery context before proposal work.
- `proposals`
  Scoped commercial offers tied to a company and optionally a lead.
- `projects`
  Active or planned delivery work after a proposal is won.
- `tasks`
  Operational tasks tied to a lead or project.
- `documents`
  References to Drive files or local paths, not raw file contents.
- `integrations`
  Configuration and status records for external systems.
- `ai_research_notes`
  Structured AI-generated research summaries and sources.
- `outreach_messages`
  Drafted or sent messages tied to a lead.

## Relationships

- A company has many contacts.
- A company has many leads.
- A lead may reference one primary contact.
- A lead may have many interactions, follow-ups, AI research notes, and outreach messages.
- A company may have many discovery calls, proposals, projects, and documents.
- A proposal may convert into one project.
- A project may have many tasks and documents.
- Tasks may belong to a lead or a project depending on the workflow stage.

## Status Values

Recommended company statuses:

- `prospect`
- `active`
- `inactive`
- `won`
- `lost`
- `archived`

Recommended lead statuses:

- `new`
- `researching`
- `ready_to_contact`
- `contacted`
- `follow_up_1`
- `follow_up_2`
- `discovery_scheduled`
- `discovery_complete`
- `proposal_sent`
- `won`
- `lost`
- `nurture`
- `do_not_contact`

Recommended lead outreach statuses:

- `not_started`
- `draft_ready`
- `draft`
- `scheduled`
- `sent`
- `follow_up_due`
- `delivered`
- `replied`
- `bounced`
- `cancelled`
- `do_not_contact`

Recommended proposal statuses:

- `draft`
- `sent`
- `viewed`
- `negotiating`
- `won`
- `lost`
- `expired`

Recommended project statuses:

- `draft`
- `planned`
- `active`
- `paused`
- `completed`
- `cancelled`

## Lead Lifecycle

1. Create or import company and lead.
2. Enrich with verified public context.
3. Score for fit, confidence, and priority.
4. Move to `ready_to_contact`.
5. Send outreach and log interaction.
6. Create follow-ups as needed.
7. Move to discovery or proposal if the lead engages.
8. Close as `won`, `lost`, `nurture`, or `do_not_contact`.

## Proposal Lifecycle

1. Draft proposal from discovery context.
2. Send proposal and record the sent date.
3. Track review, negotiation, and follow-up.
4. Mark as `won`, `lost`, or `expired`.
5. Convert won proposals into projects.

## Project Lifecycle

1. Create project from a won proposal.
2. Attach GitHub, Drive, and delivery references.
3. Manage tasks and notes through active delivery.
4. Mark completed or cancelled.
5. Later connect project outcome to referrals, case-study notes, and payments.
