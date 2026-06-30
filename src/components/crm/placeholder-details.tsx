import { SectionCard, SectionGrid } from "@/components/crm/section-grid";

type PlaceholderDetailsProps = {
  primaryTitle: string;
  primaryBody: string;
  secondaryTitle: string;
  secondaryBody: string;
};

export function PlaceholderDetails({
  primaryTitle,
  primaryBody,
  secondaryTitle,
  secondaryBody,
}: PlaceholderDetailsProps) {
  return (
    <SectionGrid>
      <SectionCard title={primaryTitle} body={primaryBody} />
      <SectionCard title={secondaryTitle} body={secondaryBody} />
    </SectionGrid>
  );
}
