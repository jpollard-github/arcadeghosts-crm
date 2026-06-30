import { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  body: string;
}>;

export function SectionGrid({ children }: PropsWithChildren) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginTop: "1.25rem",
      }}
    >
      {children}
    </section>
  );
}

export function SectionCard({ title, body, children }: SectionCardProps) {
  return (
    <article
      style={{
        padding: "1.2rem",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        background: "var(--surface-strong)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "0.65rem" }}>{title}</h3>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55 }}>{body}</p>
      {children}
    </article>
  );
}
