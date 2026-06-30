import { PageIntro } from "@/components/crm/page-intro";
import { PlaceholderDetails } from "@/components/crm/placeholder-details";

export default function InteractionsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Interactions"
        title="Capture every touchpoint and outcome"
        description="Interactions will log outbound and inbound activity across email, calls, forms, and meetings so follow-ups, discovery prep, and proposal timing are based on real history."
      />
      <PlaceholderDetails
        primaryTitle="What belongs here"
        primaryBody="Outbound emails, inbound replies, discovery calls, and manual notes should all land in one timeline so follow-up decisions come from real operational history."
        secondaryTitle="Next implementation step"
        secondaryBody="Start with interaction records plus lightweight filters by company, contact, lead, direction, and date before adding richer timeline tooling."
      />
    </>
  );
}
