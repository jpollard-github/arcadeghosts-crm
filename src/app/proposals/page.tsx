import { PageIntro } from "@/components/crm/page-intro";
import { PlaceholderDetails } from "@/components/crm/placeholder-details";

export default function ProposalsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Proposals"
        title="Turn qualified leads into scoped offers"
        description="Proposals will bridge discovery and delivery: tracking scope, price, sent date, status, follow-up timing, and the eventual handoff into a live project."
      />
      <PlaceholderDetails
        primaryTitle="What belongs here"
        primaryBody="Proposal records should connect discovery outcomes to a concrete offer, estimated value, delivery approach, and follow-up sequence."
        secondaryTitle="Next implementation step"
        secondaryBody="Add proposal records first, then lightweight conversion actions so a won proposal can become a project without re-entering company context."
      />
    </>
  );
}
