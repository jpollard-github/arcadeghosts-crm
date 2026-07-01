# Manual Review Checklist

Use this checklist to manually verify the CRM features that are already built and to get a grounded feel for how the product currently works in the browser.

## Before you start

- [ ] Run the app locally with `npm run dev`.
- [ ] Confirm the app loads at `http://localhost:3000`.
- [ ] Confirm the database is configured and reachable.
- [ ] If you want to test the local-only workbook import flow, confirm `private/triad_prospects_enriched_outreach_tracker.xlsx` exists locally.

### Optional quick first pass

Use this shorter pass if you want a fast confidence check before doing the full walkthrough.

- [ ] Open `/` and verify the dashboard renders without obvious layout or data issues.
- [ ] Create one company, one contact, and one lead.
- [ ] Confirm the lead shows up in `/leads`, including priority queue or list visibility.
- [ ] Open the lead detail page and verify outreach status, follow-up date, and related sections render.
- [ ] Create one interaction, one follow-up, and one task tied to that lead.
- [ ] Confirm those records appear on their own pages and on the lead detail page.
- [ ] Open `/imports`, review the bundled demo preview, import the demo rows, and confirm they appear in `/companies` or `/leads`.
- [ ] Clear the bundled demo rows and confirm they are removed.
- [ ] If the local workbook exists, import local workbook rows, confirm they appear, then use `Clear local workbook rows` to remove them.
- [ ] Create one proposal and one project and confirm both lists render the new records correctly.

## General app shell and UI

- [ ] Verify the main nav renders and you can reach:
  `Dashboard`, `Companies`, `Contacts`, `Leads`, `Interactions`, `Follow-ups`, `Tasks`, `Imports`, `Proposals`, `Projects`, and `Settings`.
- [ ] Confirm the active nav item is visually distinct on each page.
- [ ] Check that page intros, cards, lists, and forms feel visually consistent.
- [ ] Resize to a narrow mobile width and confirm the app remains usable:
  navigation wraps cleanly, cards do not overflow, forms remain readable, and primary actions are still reachable.

## Dashboard

- [ ] Open `/` and confirm the summary cards render.
- [ ] Confirm recent companies, recent leads, upcoming follow-ups, and open tasks sections load without layout issues.
- [ ] If there is data, verify the counts feel plausible relative to the records visible elsewhere.
- [ ] If the database is intentionally unavailable, verify the dashboard shows the database warning state cleanly.

## Companies

- [ ] Open `/companies`.
- [ ] Create a company with realistic values for name, website, industry, business type, city, and state.
- [ ] Confirm the new company appears in the list.
- [ ] Use search to find it by name.
- [ ] Open the company detail page and verify:
  contacts, leads, interactions, proposals, and projects sections render without errors.

## Contacts

- [ ] Open `/contacts`.
- [ ] Create a contact linked to the company you created.
- [ ] Confirm the contact appears in the list with company context.
- [ ] Use search to find it by name, title, or company.
- [ ] Open the contact detail page and verify linked company, leads, and interactions render correctly.

## Leads

- [ ] Open `/leads`.
- [ ] Create a lead for the company/contact you created.
- [ ] Set values for:
  status, outreach status, estimated fit, pain signal, workflow problem, outreach angle, suggested first offer, next action, and follow-up date.
- [ ] Confirm the lead appears in the main lead list.
- [ ] Confirm the lead appears in the priority queue when its data suggests it should.
- [ ] Verify the outreach status is visible in the queue and list.
- [ ] Use filters for:
  search text, lead status, and outreach status.
- [ ] Confirm `Clear filters` resets the view.
- [ ] Open the lead detail page and verify:
  qualification fields, workflow status, outreach status, follow-up date, interactions, follow-ups, and tasks all render.

## Weekly stale review

- [ ] On `/leads`, review the `Weekly stale review` section.
- [ ] Confirm stale leads show meaningful reasons such as overdue follow-up, missing next action, stale verification, or inactivity.
- [ ] If your current data should not produce stale leads, confirm the empty state message is sensible.
- [ ] Apply filters and confirm the stale review section respects them.

## Interactions

- [ ] Open `/interactions`.
- [ ] Create at least one interaction tied to a company and lead.
- [ ] Test one outbound interaction such as an email or call note.
- [ ] Confirm the interaction appears in the interactions list.
- [ ] Use filters/search to find it by summary, type, direction, company, or contact.
- [ ] Return to the lead detail page and verify the interaction appears there.

## Follow-ups

- [ ] Open `/follow-ups`.
- [ ] Create a follow-up for an existing lead.
- [ ] Confirm it appears in the follow-up list.
- [ ] Filter by status and search text.
- [ ] Verify the follow-up also appears on the lead detail page.
- [ ] Confirm upcoming follow-up information is reflected on the dashboard if the due date is near-term.

## Tasks

- [ ] Open `/tasks`.
- [ ] Create a task linked to a lead.
- [ ] Confirm it appears in the task list with the correct status.
- [ ] Filter/search for it.
- [ ] Verify it appears on the lead detail page.

## Imports: bundled demo flow

- [ ] Open `/imports`.
- [ ] Confirm the bundled demo import summary renders:
  rows, high priority, ready to contact, do not contact, and industry mix.
- [ ] Review the normalized demo preview cards and confirm the imported shape looks reasonable.
- [ ] Click `Import bundled demo rows`.
- [ ] Open `/companies`, `/contacts`, and `/leads` and confirm demo records were created.
- [ ] Check that demo-imported records participate in lead queue, stale review, and search/filter behavior.
- [ ] Return to `/imports` and click `Clear bundled demo rows`.
- [ ] Confirm the demo rows are removed.

## Imports: local workbook flow

- [ ] If the local workbook exists, confirm `/imports` shows the local-only workbook section.
- [ ] Verify the workbook tab list appears and that `Master Prospects` is clearly treated as the canonical import sheet.
- [ ] Review the local normalized preview cards and confirm they match expectations from the workbook.
- [ ] Click `Import local workbook rows`.
- [ ] Confirm imported companies, contacts, and leads appear in their respective pages.
- [ ] Spot-check dedupe behavior by importing again and confirming it does not create obvious duplicates for the same company/contact/lead combination.
- [ ] Verify imported leads carry sensible derived status and outreach status values.
- [ ] Click `Clear local workbook rows` and confirm those imported rows are removed.

## Proposals

- [ ] Open `/proposals`.
- [ ] Create a proposal linked to an existing company and optionally a lead.
- [ ] Confirm it appears in the proposal list with the correct status.
- [ ] Filter/search for it.

## Projects

- [ ] Open `/projects`.
- [ ] Create a project linked to an existing company and optionally a proposal.
- [ ] Confirm it appears in the project list with status and related company context.
- [ ] Filter/search for it.
- [ ] If you created project-linked tasks, confirm the relationship still feels coherent.

## Detail-page navigation sanity check

- [ ] Navigate from company list to company detail.
- [ ] Navigate from contact list to contact detail.
- [ ] Navigate from lead list to lead detail.
- [ ] Use inline links between related records where available and confirm they land on the expected pages.

## Empty states and guardrails

- [ ] Visit a page with no records in a category and confirm the empty state message is understandable.
- [ ] If possible, temporarily test with a missing database configuration and confirm pages fail gracefully instead of crashing.
- [ ] Confirm import messaging clearly distinguishes demo-safe data from local-only real workbook data.

## Manual notes

- [ ] Keep a short list of anything that feels confusing, misleading, too sparse, or too visually heavy.
- [ ] Note any places where data relationships seem unclear across company, contact, lead, proposal, and project records.
- [ ] Note any Phase 3 AI ideas that become obvious while using the current lead workflow.
