import { PageIntro } from "@/components/crm/page-intro";
import { SectionCard, SectionGrid } from "@/components/crm/section-grid";
import { getDashboardData } from "@/server/services/crm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  return (
    <>
      <PageIntro
        eyebrow="Dashboard"
        title="Run the consulting pipeline from one place"
        description="This dashboard is the future control room for ArcadeGhosts lead research, outreach, discovery, proposals, project handoff, and follow-up. The first version stays intentionally light while the underlying data model grows into a durable internal system."
      />
      <SectionGrid>
        <SectionCard
          title={`${dashboard.leadCount} leads`}
          body="Track researched prospects, readiness to contact, follow-up rhythm, and next action without juggling separate spreadsheets and notes."
        />
        <SectionCard
          title={`${dashboard.companyCount} companies`}
          body="Company records are the long-lived anchor for lead history, proposals, projects, and future payments."
        />
        <SectionCard
          title={`${dashboard.contactCount} contacts`}
          body="Contacts tie specific people to each company so outreach and follow-up stay grounded in real relationships."
        />
        <SectionCard
          title={`${dashboard.followUpCount} follow-ups`}
          body="Follow-ups stay explicit in the data model so the CRM can eventually drive a true next-action queue."
        />
      </SectionGrid>
      {!dashboard.databaseReady && (
        <section className="crm-card-grid">
          <SectionCard
            title="Database not configured"
            body="Set DATABASE_URL in Vercel, or connect a Vercel Postgres or Neon integration that provides POSTGRES_URL, before using live CRM records."
          />
        </section>
      )}
      <section
        className="crm-card-grid"
      >
        <SectionCard
          title="Recent companies"
          body={
            dashboard.recentCompanies.length > 0
              ? "Newest company records in the CRM."
              : "No companies yet. Add the first business record from the Companies page."
          }
        >
          {dashboard.recentCompanies.length > 0 && (
            <ul style={{ margin: "0.9rem 0 0", paddingLeft: "1.1rem" }}>
              {dashboard.recentCompanies.map((company) => (
                <li key={company.id} style={{ marginBottom: "0.45rem" }}>
                  {company.name}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard
          title="Recent leads"
          body={
            dashboard.recentLeads.length > 0
              ? "Latest lead records with company context."
              : "No leads yet. Create one once a company or contact is ready for outreach tracking."
          }
        >
          {dashboard.recentLeads.length > 0 && (
            <ul style={{ margin: "0.9rem 0 0", paddingLeft: "1.1rem" }}>
              {dashboard.recentLeads.map((lead) => (
                <li key={lead.id} style={{ marginBottom: "0.45rem" }}>
                  {lead.company.name} · {lead.status}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </section>
    </>
  );
}
