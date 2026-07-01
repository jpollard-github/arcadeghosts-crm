import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/crm/page-intro";
import { EmptyState, Surface } from "@/components/crm/record-ui";
import { getCompanyDetailData } from "@/server/services/crm";

type CompanyDetailPageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { companyId } = await params;
  const { company, databaseReady } = await getCompanyDetailData(companyId);

  if (!databaseReady) {
    return (
      <>
        <PageIntro
          eyebrow="Company detail"
          title="Company detail needs database setup"
          description="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using company detail pages in the live CRM."
        />
        <div className="crm-detail-grid">
          <Surface>
            <EmptyState
              title="Database not configured"
              body="This detail page will unlock once the deployment has a valid database connection."
            />
          </Surface>
        </div>
      </>
    );
  }

  if (!company) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow="Company detail"
        title={company.name}
        description={
          company.notes ??
          "This detail page brings company context, people, leads, and recent interactions into one working view."
        }
      />
      <div className="crm-detail-grid">
        <Surface>
          <h3>Overview</h3>
          <div className="crm-metric-grid">
            <div className="crm-meta-block">
              <span className="crm-meta-label">Status</span>
              <span className="crm-meta-value">{company.status}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Industry</span>
              <span className="crm-meta-value">{company.industry ?? "Not set"}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Business type</span>
              <span className="crm-meta-value">{company.businessType ?? "Not set"}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Location</span>
              <span className="crm-meta-value">
                {[company.city, company.state].filter(Boolean).join(", ") || "Not set"}
              </span>
            </div>
          </div>
          {company.website && (
            <p style={{ marginTop: "1rem" }}>
              <a href={company.website} className="crm-inline-link" target="_blank" rel="noreferrer">
                {company.website}
              </a>
            </p>
          )}
          {company.notes && <p className="crm-subtle-text">{company.notes}</p>}
        </Surface>
        <Surface>
          <h3>Activity snapshot</h3>
          <div className="crm-metric-grid">
            <div className="crm-meta-block">
              <span className="crm-meta-label">Contacts</span>
              <span className="crm-meta-value">{company.contacts.length}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Leads</span>
              <span className="crm-meta-value">{company.leads.length}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Interactions</span>
              <span className="crm-meta-value">{company.interactions.length}</span>
            </div>
            <div className="crm-meta-block">
              <span className="crm-meta-label">Projects</span>
              <span className="crm-meta-value">{company.projects.length}</span>
            </div>
          </div>
        </Surface>
      </div>
      <div className="crm-detail-grid">
        <Surface>
          <h3>Contacts</h3>
          {company.contacts.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              body="Add contacts from the Contacts page to anchor this company to real people."
            />
          ) : (
            <div className="crm-record-list">
              {company.contacts.map((contact) => (
                <article key={contact.id} className="crm-record-item">
                  <strong>
                    <Link href={`/contacts/${contact.id}`} className="crm-list-link">
                      {contact.fullName ?? [contact.firstName, contact.lastName].filter(Boolean).join(" ")}
                    </Link>
                  </strong>
                  <p className="crm-subtle-text">
                    {contact.title ?? "Title not set"}
                    {contact.email ? ` · ${contact.email}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Leads</h3>
          {company.leads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              body="Create a lead when this company is ready for outreach or active qualification."
            />
          ) : (
            <div className="crm-record-list">
              {company.leads.map((lead) => (
                <article key={lead.id} className="crm-record-item">
                  <strong>
                    <Link href={`/leads/${lead.id}`} className="crm-list-link">
                      {lead.status}
                    </Link>
                  </strong>
                  <p className="crm-subtle-text">
                    {lead.contact?.fullName ?? "No contact yet"}
                    {lead.nextAction ? ` · ${lead.nextAction}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
      </div>
      <div className="crm-detail-grid">
        <Surface>
          <h3>Recent interactions</h3>
          {company.interactions.length === 0 ? (
            <EmptyState
              title="No interactions yet"
              body="Use the Interactions page to start building the outreach and conversation timeline."
            />
          ) : (
            <div className="crm-record-list">
              {company.interactions.slice(0, 6).map((interaction) => (
                <article key={interaction.id} className="crm-record-item">
                  <strong>{interaction.summary}</strong>
                  <p className="crm-subtle-text">
                    {interaction.type} · {interaction.direction}
                    {interaction.contact?.fullName ? ` · ${interaction.contact.fullName}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h3>Proposals and projects</h3>
          <p className="crm-subtle-text">
            {company.proposals.length} proposals · {company.projects.length} projects
          </p>
        </Surface>
      </div>
    </>
  );
}
