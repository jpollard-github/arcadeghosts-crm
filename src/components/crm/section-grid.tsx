import { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  body: string;
}>;

export function SectionGrid({ children }: PropsWithChildren) {
  return <section className="crm-section-grid">{children}</section>;
}

export function SectionCard({ title, body, children }: SectionCardProps) {
  return (
    <article className="crm-card">
      <h3 className="crm-card__title">{title}</h3>
      <p className="crm-card__body" style={{ margin: 0 }}>
        {body}
      </p>
      {children}
    </article>
  );
}
