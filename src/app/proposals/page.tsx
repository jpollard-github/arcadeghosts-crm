import Link from "next/link";
import { PageIntro } from "@/components/crm/page-intro";
import {
  EmptyState,
  FormField,
  FormInput,
  FormSelect,
  SecondaryButton,
  StackActions,
  SubmitButton,
  Surface,
  TwoColumn,
} from "@/components/crm/record-ui";
import { getSingleSearchParam } from "@/lib/query";
import { createProposal } from "@/server/actions/crm";
import { getProposalsPageData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

const proposalStatusOptions = [
  "draft",
  "sent",
  "viewed",
  "negotiating",
  "won",
  "lost",
  "expired",
] as const;

function formatCurrency(cents: number | null) {
  if (!cents) {
    return "Value not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = getSingleSearchParam(resolvedSearchParams.q) ?? "";
  const status = getSingleSearchParam(resolvedSearchParams.status) ?? "";

  const { companyOptions, leadOptions, proposalList, databaseReady } = await getProposalsPageData({
    q,
    status,
  });

  return (
    <>
      <PageIntro
        eyebrow="Proposals"
        title="Turn qualified leads into scoped offers"
        description="Proposals now have a real workflow. Track draft-to-sent status, estimated value, source lead context, and the path toward eventual project handoff."
      />
      <div className="crm-toolbar">
        <form className="crm-filter-form">
          <div className="crm-filter-row">
            <FormField label="Search proposals">
              <FormInput name="q" defaultValue={q} placeholder="Title, company, contact..." />
            </FormField>
            <FormField label="Status">
              <FormSelect name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {proposalStatusOptions.map((option) => (
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
              <Link href="/proposals" className="crm-inline-link">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>
      <TwoColumn>
        <Surface>
          <h3>Proposal list</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database not configured"
              body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using proposals in the live CRM."
            />
          ) : proposalList.length === 0 ? (
            <EmptyState
              title="No proposals yet"
              body="Once a lead becomes serious, create a proposal record so pricing, status, and handoff no longer live only in documents."
            />
          ) : (
            <div className="crm-list-stack">
              {proposalList.map((proposal) => (
                <article key={proposal.id} className="crm-list-card">
                  <div className="crm-stack-actions">
                    <span className="crm-badge">{proposal.status}</span>
                  </div>
                  <h4>{proposal.title}</h4>
                  <p>
                    {proposal.company.name}
                    {proposal.lead?.contact?.fullName ? ` · ${proposal.lead.contact.fullName}` : ""}
                  </p>
                  <p className="crm-subtle-text">{formatCurrency(proposal.estimatedValueCents)}</p>
                  {proposal.proposalUrl && (
                    <p>
                      <a
                        href={proposal.proposalUrl}
                        className="crm-inline-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open proposal
                      </a>
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Add proposal</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database setup needed"
              body="This form will unlock once the deployment has a valid DATABASE_URL or Vercel Postgres URL."
            />
          ) : companyOptions.length === 0 ? (
            <EmptyState
              title="Add a company first"
              body="Proposals need company context, so create a company before turning discovery work into a scoped offer."
            />
          ) : (
            <form action={createProposal} className="crm-form">
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
              <FormField label="Title">
                <FormInput name="title" required placeholder="Operations dashboard proposal..." />
              </FormField>
              <FormField label="Status">
                <FormSelect name="status" defaultValue="draft">
                  {proposalStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Estimated value (cents)">
                <FormInput name="estimatedValueCents" type="number" min="0" step="1" />
              </FormField>
              <FormField label="Proposal URL">
                <FormInput name="proposalUrl" type="url" placeholder="https://..." />
              </FormField>
              <FormField label="Sent at">
                <FormInput name="sentAt" type="datetime-local" />
              </FormField>
              <StackActions>
                <SubmitButton label="Create proposal" />
              </StackActions>
            </form>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
