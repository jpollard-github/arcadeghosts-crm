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
import { createInteraction } from "@/server/actions/crm";
import { getInteractionsPageData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

const interactionTypeOptions = [
  "email",
  "call",
  "meeting",
  "linkedin",
  "website_form",
  "note",
] as const;

const interactionDirectionOptions = ["outbound", "inbound", "internal"] as const;

function getDefaultOccurredAt() {
  return new Date().toISOString().slice(0, 16);
}

function formatOccurredAt(value: Date | string) {
  return new Date(value).toLocaleString();
}

export default async function InteractionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = getSingleSearchParam(resolvedSearchParams.q) ?? "";
  const type = getSingleSearchParam(resolvedSearchParams.type) ?? "";
  const direction = getSingleSearchParam(resolvedSearchParams.direction) ?? "";

  const { companyOptions, contactOptions, leadOptions, interactionList, databaseReady } =
    await getInteractionsPageData({
      q,
      type,
      direction,
    });

  return (
    <>
      <PageIntro
        eyebrow="Interactions"
        title="Capture every touchpoint and outcome"
        description="Interactions now have a real workflow. Log emails, calls, meetings, LinkedIn touches, and internal notes so follow-up and proposal timing come from actual conversation history."
      />
      <div className="crm-toolbar">
        <form className="crm-filter-form">
          <div className="crm-filter-row">
            <FormField label="Search interactions">
              <FormInput
                name="q"
                defaultValue={q}
                placeholder="Summary, notes, company, contact..."
              />
            </FormField>
            <FormField label="Type">
              <FormSelect name="type" defaultValue={type}>
                <option value="">All types</option>
                {interactionTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Direction">
              <FormSelect name="direction" defaultValue={direction}>
                <option value="">All directions</option>
                {interactionDirectionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </div>
          <div className="crm-filter-actions">
            <SecondaryButton label="Apply filters" />
            {(q || type || direction) && (
              <Link href="/interactions" className="crm-inline-link">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>
      <TwoColumn>
        <Surface>
          <h3>Interaction log</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database not configured"
              body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using interactions in the live CRM."
            />
          ) : interactionList.length === 0 ? (
            <EmptyState
              title="No interactions yet"
              body="Log the first outreach touch, discovery note, or reply so the CRM starts building a durable communication timeline."
            />
          ) : (
            <div className="crm-list-stack">
              {interactionList.map((interaction) => (
                <article key={interaction.id} className="crm-list-card">
                  <div className="crm-stack-actions">
                    <span className="crm-badge">{interaction.type}</span>
                    <span className="crm-badge crm-badge--muted">{interaction.direction}</span>
                  </div>
                  <h4>{interaction.summary}</h4>
                  <p className="crm-subtle-text">{formatOccurredAt(interaction.occurredAt)}</p>
                  <p>
                    <Link href={`/companies/${interaction.companyId}`} className="crm-inline-link">
                      {interaction.company.name}
                    </Link>
                    {interaction.contact && (
                      <>
                        {" · "}
                        <Link
                          href={`/contacts/${interaction.contactId}`}
                          className="crm-inline-link"
                        >
                          {interaction.contact.fullName ?? "Contact"}
                        </Link>
                      </>
                    )}
                    {interaction.lead && (
                      <>
                        {" · "}
                        <Link href={`/leads/${interaction.leadId}`} className="crm-inline-link">
                          Lead record
                        </Link>
                      </>
                    )}
                  </p>
                  {interaction.body && <p className="crm-subtle-text">{interaction.body}</p>}
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Add interaction</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database setup needed"
              body="This form will unlock once the deployment has a valid DATABASE_URL or Vercel Postgres URL."
            />
          ) : companyOptions.length === 0 ? (
            <EmptyState
              title="Add a company first"
              body="Interactions need company context, so create at least one company before logging outreach or call history."
            />
          ) : (
            <form action={createInteraction} className="crm-form">
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
              <FormField label="Contact">
                <FormSelect name="contactId" defaultValue="">
                  <option value="">No contact selected</option>
                  {contactOptions.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName ?? "Unnamed contact"} · {contact.company.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Lead">
                <FormSelect name="leadId" defaultValue="">
                  <option value="">No lead selected</option>
                  {leadOptions.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.company.name}
                      {lead.contact?.fullName ? ` · ${lead.contact.fullName}` : ""}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Type">
                <FormSelect name="type" defaultValue="email">
                  {interactionTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Direction">
                <FormSelect name="direction" defaultValue="outbound">
                  {interactionDirectionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Occurred at">
                <FormInput
                  name="occurredAt"
                  type="datetime-local"
                  defaultValue={getDefaultOccurredAt()}
                  required
                />
              </FormField>
              <FormField label="Summary">
                <FormInput name="summary" required placeholder="Sent first outreach email..." />
              </FormField>
              <FormField label="Body or notes">
                <FormTextarea name="body" />
              </FormField>
              <StackActions>
                <SubmitButton label="Log interaction" />
              </StackActions>
            </form>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
