import { PageIntro } from "@/components/crm/page-intro";
import {
  EmptyState,
  FormField,
  FormInput,
  FormRow,
  FormSelect,
  FormTextarea,
  StackActions,
  SubmitButton,
  Surface,
  TwoColumn,
} from "@/components/crm/record-ui";
import { createLead } from "@/server/actions/crm";
import { getLeadsPageData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

const leadStatusOptions = [
  "new",
  "researching",
  "ready_to_contact",
  "contacted",
  "follow_up_1",
  "follow_up_2",
  "discovery_scheduled",
  "discovery_complete",
  "proposal_sent",
  "won",
  "lost",
  "nurture",
  "do_not_contact",
] as const;

export default async function LeadsPage() {
  const { companyOptions, contactOptions, leadList } = await getLeadsPageData();

  return (
    <>
      <PageIntro
        eyebrow="Leads"
        title="Research, qualify, and move prospects forward"
        description="Leads are now stored in the real database. This first Phase 1 version emphasizes clear intake and queue-ready fields before adding richer lead detail pages."
      />
      <TwoColumn>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Lead list</h3>
          {leadList.length === 0 ? (
            <EmptyState
              title="No leads yet"
              body="Once a company exists, create a lead record for research, outreach, and follow-up tracking."
            />
          ) : (
            <div className="crm-record-list">
              {leadList.map((lead) => (
                <article key={lead.id} className="crm-record-item">
                  <strong>{lead.company.name}</strong>
                  <p style={{ margin: "0.35rem 0", color: "var(--muted)" }}>
                    {lead.status}
                    {lead.contact?.fullName ? ` · ${lead.contact.fullName}` : ""}
                  </p>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {lead.nextAction ?? lead.suggestedFirstOffer ?? "No next action yet"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Add lead</h3>
          {companyOptions.length === 0 ? (
            <EmptyState
              title="Add a company first"
              body="Leads belong to a company record, so create the company before building lead workflow around it."
            />
          ) : (
            <form action={createLead} className="crm-form">
              <FormField label="Company">
                <FormSelect name="companyId" required defaultValue="">
                  <option value="" disabled>
                    Select a company
                  </option>
                  {companyOptions.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Primary contact">
                <FormSelect name="contactId" defaultValue="">
                  <option value="">No contact yet</option>
                  {contactOptions.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName ?? "Unnamed contact"} · {contact.company.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Lead source">
                <FormInput name="source" placeholder="Spreadsheet, referral, website, LinkedIn..." />
              </FormField>
              <FormRow>
                <FormField label="Status">
                  <FormSelect name="status" defaultValue="new">
                    {leadStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>
                <FormField label="Estimated fit">
                  <FormInput name="estimatedFit" placeholder="High / Medium / Low" />
                </FormField>
              </FormRow>
              <FormField label="Operational pain signal">
                <FormTextarea name="operationalPainSignal" />
              </FormField>
              <FormField label="Likely workflow problem">
                <FormTextarea name="likelyWorkflowProblem" />
              </FormField>
              <FormField label="Specific outreach angle">
                <FormTextarea name="specificOutreachAngle" />
              </FormField>
              <FormField label="Suggested first offer">
                <FormTextarea name="suggestedFirstOffer" />
              </FormField>
              <FormField label="Next action">
                <FormInput name="nextAction" placeholder="Research contact, send first email..." />
              </FormField>
              <FormField label="Follow-up date">
                <FormInput name="followUpDate" type="date" />
              </FormField>
              <label className="crm-checkbox-row">
                <input name="doNotContact" type="checkbox" />
                <span>Do not contact</span>
              </label>
              <StackActions>
                <SubmitButton label="Create lead" />
              </StackActions>
            </form>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
