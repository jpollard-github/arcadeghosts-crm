import { PageIntro } from "@/components/crm/page-intro";
import { PlaceholderDetails } from "@/components/crm/placeholder-details";

export default function SettingsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Settings"
        title="Configure infrastructure and integrations"
        description="Settings is where environment readiness, integration status, workflow defaults, and eventually account-level controls will live for this private internal system."
      />
      <PlaceholderDetails
        primaryTitle="What belongs here"
        primaryBody="This area should surface environment readiness, integration health, operational defaults, and the current auth posture for the internal CRM."
        secondaryTitle="Next implementation step"
        secondaryBody="Keep settings lean at first: database health, integration placeholders, and basic environment checks are enough until real team workflows land."
      />
    </>
  );
}
