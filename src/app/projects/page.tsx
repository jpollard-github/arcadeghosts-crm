import { PageIntro } from "@/components/crm/page-intro";
import { PlaceholderDetails } from "@/components/crm/placeholder-details";

export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Projects"
        title="Manage active client work after the sale"
        description="Projects will connect the won proposal to tasks, GitHub repos, Drive folders, delivery notes, and later Stripe references so the CRM can run ArcadeGhosts end to end."
      />
      <PlaceholderDetails
        primaryTitle="What belongs here"
        primaryBody="Projects should hold the operational handoff: scope, repo links, Drive context, tasks, notes, delivery status, and client follow-through."
        secondaryTitle="Next implementation step"
        secondaryBody="Once proposals exist, add project creation from won work plus a minimal task list before layering on richer delivery workflows."
      />
    </>
  );
}
