# Private Workbook Import Mapping

This note defines how the local workbook in `private/triad_prospects_enriched_outreach_tracker.xlsx` maps into the CRM import workflow.

## Canonical sheet

Use `Master Prospects` as the only sheet imported into the CRM.

Why:

- it already carries the cross-category combined row set
- it includes the `Category` column needed to preserve the workbook grouping
- importing both `Master Prospects` and the category tabs would create duplicate rows

The category tabs remain reference tabs only:

- `manufacturers_operations`
- `medical_wellness`
- `professional_services`
- `property_trades`
- `nonprofits`

## Field mapping

- `Company` -> company name
- `Website` -> company website
- `Category` -> imported row category fallback and CRM business grouping context
- `Business Type` -> company industry/business type when present
- `Contact Person` -> contact full name
- `Title` -> contact title
- `Contact Role` -> contact title fallback when `Title` is blank
- `Public Email/Contact` -> contact email or public contact field
- `Phone` -> contact phone
- `LinkedIn Profile` -> contact LinkedIn URL
- `Best Contact Method` -> contact preferred contact method
- `Source` -> lead source
- `Operational Pain Signal` -> lead operational pain signal
- `Likely Workflow Problem` -> lead likely workflow problem
- `Specific Outreach Angle` -> lead specific outreach angle
- `Suggested First Offer` -> lead suggested first offer
- `Estimated Fit` -> lead estimated fit
- `Warm Intro Possible` -> lead warm intro flag
- `First Message Status` -> used to derive initial lead status, next action, and lead outreach status
- `Follow-up Date` -> lead follow-up date
- `Last Contacted` -> used to derive contacted status
- `Response Status` -> used to derive replied or bounced outreach state
- `Outcome` -> used to derive won/lost state
- `Do Not Contact` -> lead do-not-contact flag
- `Verification Date` -> lead verification date
- `Source URLs` -> lead source URL list
- `Notes` -> import note suffix

## Import behavior

- The app only exposes this import flow when the workbook exists locally in `private/`.
- Imported companies and contacts are tagged with `[local-workbook-import]` in notes.
- Existing company/contact dedupe rules still apply during import.
- Lead dedupe still keys off company, optional contact, and specific outreach angle.
- The workflow is intentionally local-only and is not meant to depend on deployed filesystem access.
