import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/crm/page-intro";
import { EmptyState, Surface } from "@/components/crm/record-ui";
import { getContactDetailData } from "@/server/services/crm";

type ContactDetailPageProps = {
  params: Promise<{
    contactId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { contactId } = await params;
  const { contact, databaseReady } = await getContactDetailData(contactId);

  if (!databaseReady) {
    return (
      <>
        <PageIntro
          eyebrow="Contact detail"
          title="Contact detail needs database setup"
          description="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using contact detail pages in the live CRM."
        />
        <Surface>
          <EmptyState
            title="Database not configured"
            body="This detail page will unlock once the deployment has a valid database connection."
          />
        </Surface>
      </>
    );
  }

  if (!contact) {
    notFound();
  }

  const contactTitle =
    contact.fullName ??
    ([contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Contact");

  return (
    <>
      <PageIntro
        eyebrow="Contact detail"
        title={contactTitle}
        description={
          contact.notes ??
          "This detail page keeps the person-level view grounded in company context, lead history, and interaction history."
        }
      />
      <div className="crm-detail-grid">
        <Surface>
          <h3>Overview</h3>
          <div className="crm-metric-grid">
            <div className="crm-meta-block">
              <span className="crm-meta-label">Company</span>
              <span className="crm-meta-value">
                <Link href={`/companies/${contact.companyId}`} className="crm-inline-link">
                  {contact.company.name}
                </Link>
              </span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Title</span>
              <span className="crm-meta-value">{contact.title ?? "Not set"}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Email</span>
              <span className="crm-meta-value">{contact.email ?? "Not set"}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Preferred method</span>
              <span className="crm-meta-value">{contact.preferredContactMethod ?? "Not set"}</span>
            </div>
          </div>
        </Surface>
        <Surface>
          <h3>Activity snapshot</h3>
          <div className="crm-metric-grid">
            <div className="crm-meta-block">
              <span className="crm-meta-label">Leads</span>
              <span className="crm-meta-value">{contact.leads.length}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Interactions</span>
              <span className="crm-meta-value">{contact.interactions.length}</span>
            </div>
          </div>
        </Surface>
      </div>
      <div className="crm-detail-grid">
        <Surface>
          <h3>Leads</h3>
          {contact.leads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              body="Once outreach starts, link or create a lead so this contact has explicit pipeline context."
            />
          ) : (
            <div className="crm-record-list">
              {contact.leads.map((lead) => (
                <article key={lead.id} className="crm-record-item">
                  <strong>
                    <Link href={`/leads/${lead.id}`} className="crm-list-link">
                      {lead.company.name}
                    </Link>
                  </strong>
                  <p className="crm-subtle-text">
                    {lead.status} · {lead.followUps.length} follow-ups
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Interactions</h3>
          {contact.interactions.length === 0 ? (
            <EmptyState
              title="No interactions yet"
              body="Log outreach and replies on the Interactions page to build a real communication history."
            />
          ) : (
            <div className="crm-record-list">
              {contact.interactions.map((interaction) => (
                <article key={interaction.id} className="crm-record-item">
                  <strong>{interaction.summary}</strong>
                  <p className="crm-subtle-text">
                    {interaction.type} · {interaction.direction}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
      </div>
    </>
  );
}
