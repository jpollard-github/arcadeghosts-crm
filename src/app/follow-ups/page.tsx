import Link from "next/link";
import { PageIntro } from "@/components/crm/page-intro";
import {
  EmptyState,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  SecondaryButton,
  StackActions,
  SubmitButton,
  Surface,
  TwoColumn,
} from "@/components/crm/record-ui";
import { getSingleSearchParam } from "@/lib/query";
import { createFollowUp } from "@/server/actions/crm";
import { getFollowUpsPageData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

const followUpStatusOptions = ["pending", "scheduled", "completed", "skipped"] as const;

function getDefaultDueDate() {
  return new Date().toISOString().slice(0, 16);
}

function formatDueDate(value: Date | string) {
  return new Date(value).toLocaleString();
}

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = getSingleSearchParam(resolvedSearchParams.q) ?? "";
  const status = getSingleSearchParam(resolvedSearchParams.status) ?? "";

  const { leadOptions, followUpList, databaseReady } = await getFollowUpsPageData({
    q,
    status,
  });

  return (
    <>
      <PageIntro
        eyebrow="Follow-ups"
        title="Keep next-touch commitments explicit"
        description="Follow-ups are now their own workflow instead of living only inside notes. Use them to track what needs to happen next, when it is due, and which lead it belongs to."
      />
      <div className="crm-toolbar">
        <form className="crm-filter-form">
          <div className="crm-filter-row">
            <FormField label="Search follow-ups">
              <FormInput
                name="q"
                defaultValue={q}
                placeholder="Lead, company, contact, notes..."
              />
            </FormField>
            <FormField label="Status">
              <FormSelect name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {followUpStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </div>
          <div className="crm-filter-actions">
            <SecondaryButton label="Apply filters" />
            {(q || status) && (
              <Link href="/follow-ups" className="crm-inline-link">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>
      <TwoColumn>
        <Surface>
          <h3>Follow-up queue</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database not configured"
              body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using follow-ups in the live CRM."
            />
          ) : followUpList.length === 0 ? (
            <EmptyState
              title="No follow-ups yet"
              body="Add the first scheduled follow-up so the CRM starts reflecting actual outreach rhythm and next actions."
            />
          ) : (
            <div className="crm-list-stack">
              {followUpList.map((followUp) => (
                <article key={followUp.id} className="crm-list-card">
                  <div className="crm-stack-actions">
                    <span className="crm-badge">{followUp.status}</span>
                  </div>
                  <h4>
                    <Link href={`/leads/${followUp.leadId}`} className="crm-list-link">
                      {followUp.lead.company.name}
                    </Link>
                  </h4>
                  <p className="crm-subtle-text">{formatDueDate(followUp.dueDate)}</p>
                  <p>
                    {followUp.lead.contact?.fullName ?? "No contact yet"}
                    {followUp.lead.nextAction ? ` · ${followUp.lead.nextAction}` : ""}
                  </p>
                  {followUp.notes && <p className="crm-subtle-text">{followUp.notes}</p>}
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Add follow-up</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database setup needed"
              body="This form will unlock once the deployment has a valid DATABASE_URL or Vercel Postgres URL."
            />
          ) : leadOptions.length === 0 ? (
            <EmptyState
              title="Add a lead first"
              body="Follow-ups are attached to lead records, so create or import a lead before adding the next-touch workflow."
            />
          ) : (
            <form action={createFollowUp} className="crm-form">
              <FormField label="Lead">
                <FormSelect name="leadId" required defaultValue="">
                  <option value="" disabled>
                    Select a lead
                  </option>
                  {leadOptions.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.company.name}
                      {lead.contact?.fullName ? ` · ${lead.contact.fullName}` : ""}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Due date">
                <FormInput
                  name="dueDate"
                  type="datetime-local"
                  defaultValue={getDefaultDueDate()}
                  required
                />
              </FormField>
              <FormField label="Status">
                <FormSelect name="status" defaultValue="pending">
                  {followUpStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Notes">
                <FormTextarea
                  name="notes"
                  placeholder="Send second email, call the office, prep discovery follow-up..."
                />
              </FormField>
              <StackActions>
                <SubmitButton label="Create follow-up" />
              </StackActions>
            </form>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
