import { PageIntro } from "@/components/crm/page-intro";

export default function SettingsPage() {
  return (
    <PageIntro
      eyebrow="Settings"
      title="Configure infrastructure and integrations"
      description="Settings is where environment readiness, integration status, workflow defaults, and eventually account-level controls will live for this private internal system."
    />
  );
}
