import { PageIntro } from "@/components/crm/page-intro";
import {
  EmptyState,
  FormField,
  FormInput,
  FormRow,
  FormTextarea,
  StackActions,
  SubmitButton,
  Surface,
  TwoColumn,
} from "@/components/crm/record-ui";
import { createCompany } from "@/server/actions/crm";
import { getCompaniesPageData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const { companyList, databaseReady } = await getCompaniesPageData();

  return (
    <>
      <PageIntro
        eyebrow="Companies"
        title="Store durable context about each business"
        description="Companies are now backed by the real database. This first Phase 1 pass focuses on adding and reviewing account-level records before deeper detail pages exist."
      />
      <TwoColumn>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Company list</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database not configured"
              body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using companies in the live CRM."
            />
          ) : companyList.length === 0 ? (
            <EmptyState
              title="No companies yet"
              body="Add the first company record so leads, contacts, and proposals have a real anchor in the CRM."
            />
          ) : (
            <div className="crm-record-list">
              {companyList.map((company) => (
                <article key={company.id} className="crm-record-item">
                  <strong>{company.name}</strong>
                  <p style={{ margin: "0.35rem 0", color: "var(--muted)" }}>
                    {company.industry ?? "Industry TBD"} · {company.status}
                  </p>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {company.contacts.length} contacts · {company.leads.length} leads
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Add company</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database setup needed"
              body="This form will unlock once the deployment has a valid DATABASE_URL or Vercel Postgres URL."
            />
          ) : (
            <form action={createCompany} className="crm-form">
              <FormField label="Name">
                <FormInput name="name" required />
              </FormField>
              <FormField label="Website">
                <FormInput name="website" type="url" placeholder="https://example.com" />
              </FormField>
              <FormField label="Industry">
                <FormInput name="industry" />
              </FormField>
              <FormField label="Business type">
                <FormInput name="businessType" />
              </FormField>
              <FormRow>
                <FormField label="City">
                  <FormInput name="city" />
                </FormField>
                <FormField label="State">
                  <FormInput name="state" />
                </FormField>
              </FormRow>
              <FormField label="Notes">
                <FormTextarea name="notes" />
              </FormField>
              <StackActions>
                <SubmitButton label="Create company" />
              </StackActions>
            </form>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
