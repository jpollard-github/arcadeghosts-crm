import Link from "next/link";
import { PageIntro } from "@/components/crm/page-intro";
import {
  EmptyState,
  FormField,
  FormInput,
  FormRow,
  FormSelect,
  FormTextarea,
  SecondaryButton,
  StackActions,
  SubmitButton,
  Surface,
  TwoColumn,
} from "@/components/crm/record-ui";
import { getSingleSearchParam } from "@/lib/query";
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

const outreachStatusOptions = [
  "not_started",
  "draft_ready",
  "draft",
  "scheduled",
  "sent",
  "follow_up_due",
  "delivered",
  "replied",
  "bounced",
  "cancelled",
  "do_not_contact",
] as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = getSingleSearchParam(resolvedSearchParams.q) ?? "";
  const status = getSingleSearchParam(resolvedSearchParams.status) ?? "";
  const outreachStatus = getSingleSearchParam(resolvedSearchParams.outreachStatus) ?? "";
  const {
    companyOptions,
    contactOptions,
    leadList,
    priorityQueue,
    staleLeadReview,
    databaseReady,
  } = await getLeadsPageData({
    q,
    status,
    outreachStatus,
  });

  return (
    <>
      <PageIntro
        eyebrow="Leads"
        title="Research, qualify, and move prospects forward"
        description="Leads are now stored in the real database. This first Phase 1 version emphasizes clear intake and queue-ready fields before adding richer lead detail pages."
      />
      <div className="crm-toolbar">
        <form className="crm-filter-form">
          <div className="crm-filter-row">
            <FormField label="Search leads">
              <FormInput
                name="q"
                defaultValue={q}
                placeholder="Company, contact, pain signal, next action..."
              />
            </FormField>
            <FormField label="Status">
              <FormSelect name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {leadStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Outreach">
              <FormSelect name="outreachStatus" defaultValue={outreachStatus}>
                <option value="">All outreach states</option>
                {outreachStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </div>
          <div className="crm-filter-actions">
            <SecondaryButton label="Apply filters" />
            {(q || status || outreachStatus) && (
              <Link href="/leads" className="crm-inline-link">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>
      <TwoColumn>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Priority queue</h3>
          {!databaseReady ? (
            <EmptyState
              title="Priority queue needs database setup"
              body="Once the database is configured, this queue will surface the next best leads to work based on fit, priority, follow-up timing, and do-not-contact state."
            />
          ) : priorityQueue.length === 0 ? (
            <EmptyState
              title="No queue candidates yet"
              body="Imported or manually enriched leads will start surfacing here once they have enough context to prioritize."
            />
          ) : (
            <div className="crm-record-list" style={{ marginBottom: "1rem" }}>
              {priorityQueue.map((lead) => (
                <article key={lead.id} className="crm-record-item">
                  <strong>
                    <Link href={`/leads/${lead.id}`} className="crm-list-link">
                      {lead.company.name}
                    </Link>
                  </strong>
                  <p style={{ margin: "0.35rem 0", color: "var(--muted)" }}>
                    {lead.status}
                    {` · outreach ${lead.outreachStatus}`}
                    {lead.company.priorityScore ? ` · priority ${lead.company.priorityScore}` : ""}
                    {lead.company.fitScore ? ` · fit ${lead.company.fitScore}` : ""}
                  </p>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {lead.nextAction ?? "No next action yet"}
                  </p>
                </article>
              ))}
            </div>
          )}
          <h3>Weekly stale review</h3>
          {!databaseReady ? (
            <EmptyState
              title="Weekly review needs database setup"
              body="Once the database is configured, this review will surface leads that need fresh verification, a next action, or overdue follow-up attention."
            />
          ) : staleLeadReview.length === 0 ? (
            <EmptyState
              title="No stale leads in this view"
              body={
                q || status || outreachStatus
                  ? "The current filters do not show any neglected leads."
                  : "Active leads are staying fresh enough to avoid the weekly review list right now."
              }
            />
          ) : (
            <div className="crm-record-list" style={{ marginBottom: "1rem" }}>
              {staleLeadReview.map((lead) => (
                <article key={`stale-${lead.id}`} className="crm-record-item">
                  <strong>
                    <Link href={`/leads/${lead.id}`} className="crm-list-link">
                      {lead.company.name}
                    </Link>
                  </strong>
                  <p style={{ margin: "0.35rem 0", color: "var(--muted)" }}>
                    {lead.status}
                    {` · outreach ${lead.outreachStatus}`}
                    {lead.contact?.fullName ? ` · ${lead.contact.fullName}` : ""}
                  </p>
                  <p style={{ margin: "0 0 0.45rem", color: "var(--muted)" }}>
                    {lead.nextAction ?? "No next action set"}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1rem", color: "var(--muted)" }}>
                    {lead.reasons.map((reason) => (
                      <li key={`${lead.id}-${reason}`}>{reason}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
          <h3 style={{ marginTop: 0 }}>Lead list</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database not configured"
              body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using leads in the live CRM."
            />
          ) : leadList.length === 0 ? (
            <EmptyState
              title="No leads yet"
              body="Once a company exists, create a lead record for research, outreach, and follow-up tracking."
            />
          ) : (
            <div className="crm-record-list">
              {leadList.map((lead) => (
                <article key={lead.id} className="crm-record-item">
                  <strong>
                    <Link href={`/leads/${lead.id}`} className="crm-list-link">
                      {lead.company.name}
                    </Link>
                  </strong>
                  <p style={{ margin: "0.35rem 0", color: "var(--muted)" }}>
                    {lead.status}
                    {` · outreach ${lead.outreachStatus}`}
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
          {!databaseReady ? (
            <EmptyState
              title="Database setup needed"
              body="This form will unlock once the deployment has a valid DATABASE_URL or Vercel Postgres URL."
            />
          ) : companyOptions.length === 0 ? (
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
                <FormField label="Outreach status">
                  <FormSelect name="outreachStatus" defaultValue="not_started">
                    {outreachStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </FormSelect>
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
