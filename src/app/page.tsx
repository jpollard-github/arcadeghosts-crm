import { PageIntro } from "@/components/crm/page-intro";
import { SectionCard, SectionGrid } from "@/components/crm/section-grid";

export default function DashboardPage() {
  return (
    <>
      <PageIntro
        eyebrow="Dashboard"
        title="Run the consulting pipeline from one place"
        description="This dashboard is the future control room for ArcadeGhosts lead research, outreach, discovery, proposals, project handoff, and follow-up. The first version stays intentionally light while the underlying data model grows into a durable internal system."
      />
      <SectionGrid>
        <SectionCard
          title="Lead pipeline"
          body="Track researched prospects, readiness to contact, follow-up rhythm, and next action without juggling separate spreadsheets and notes."
        />
        <SectionCard
          title="Client operations"
          body="Link companies, contacts, proposals, projects, documents, and task history so each engagement has one working narrative."
        />
        <SectionCard
          title="AI assistance"
          body="Prepare for company research notes, outreach drafting, discovery summaries, and proposal support after core CRUD is stable."
        />
        <SectionCard
          title="Integrations"
          body="Keep space ready for Google, Stripe, GitHub, and outbound email connections without forcing them into the MVP before they are needed."
        />
      </SectionGrid>
    </>
  );
}
