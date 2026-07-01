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
import { createContact } from "@/server/actions/crm";
import { getContactsPageData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = getSingleSearchParam(resolvedSearchParams.q) ?? "";
  const { companyOptions, contactList, databaseReady } = await getContactsPageData({ q });

  return (
    <>
      <PageIntro
        eyebrow="Contacts"
        title="Track real people, not just accounts"
        description="Contacts are now stored in the database and linked to companies. This first pass is focused on fast intake, not a polished directory or detail workflow yet."
      />
      <div className="crm-toolbar">
        <form className="crm-filter-form">
          <div className="crm-filter-row">
            <FormField label="Search contacts">
              <FormInput
                name="q"
                defaultValue={q}
                placeholder="Name, company, title, email, phone..."
              />
            </FormField>
          </div>
          <div className="crm-filter-actions">
            <SecondaryButton label="Apply filters" />
            {q && (
              <Link href="/contacts" className="crm-inline-link">
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>
      <TwoColumn>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Contact list</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database not configured"
              body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using contacts in the live CRM."
            />
          ) : contactList.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              body="Create contacts after you have at least one company record. This keeps people linked to the right business from the start."
            />
          ) : (
            <div className="crm-record-list">
              {contactList.map((contact) => (
                <article key={contact.id} className="crm-record-item">
                  <strong>
                    <Link href={`/contacts/${contact.id}`} className="crm-list-link">
                      {contact.fullName ?? [contact.firstName, contact.lastName].filter(Boolean).join(" ")}
                    </Link>
                  </strong>
                  <p style={{ margin: "0.35rem 0", color: "var(--muted)" }}>
                    {contact.company.name}
                    {contact.title ? ` · ${contact.title}` : ""}
                  </p>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    {contact.email ?? "No email yet"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3 style={{ marginTop: 0 }}>Add contact</h3>
          {!databaseReady ? (
            <EmptyState
              title="Database setup needed"
              body="This form will unlock once the deployment has a valid DATABASE_URL or Vercel Postgres URL."
            />
          ) : companyOptions.length === 0 ? (
            <EmptyState
              title="Add a company first"
              body="Contacts belong to a company, so create the company record before adding people."
            />
          ) : (
            <form action={createContact} className="crm-form">
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
              <FormField label="Full name">
                <FormInput name="fullName" required />
              </FormField>
              <FormField label="Title">
                <FormInput name="title" />
              </FormField>
              <FormField label="Email">
                <FormInput name="email" type="email" />
              </FormField>
              <FormField label="Phone">
                <FormInput name="phone" />
              </FormField>
              <FormField label="Preferred contact method">
                <FormInput name="preferredContactMethod" placeholder="Email, phone, LinkedIn..." />
              </FormField>
              <FormField label="LinkedIn URL">
                <FormInput name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." />
              </FormField>
              <label className="crm-checkbox-row">
                <input name="isPrimary" type="checkbox" />
                <span>Primary contact for this company</span>
              </label>
              <FormField label="Notes">
                <FormTextarea name="notes" />
              </FormField>
              <StackActions>
                <SubmitButton label="Create contact" />
              </StackActions>
            </form>
          )}
        </Surface>
      </TwoColumn>
    </>
  );
}
