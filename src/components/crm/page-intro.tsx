type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section
      style={{
        padding: "1.5rem",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        background: "var(--surface)",
        boxShadow: "var(--shadow)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontSize: "0.8rem",
        }}
      >
        {eyebrow}
      </p>
      <h2 style={{ margin: "0.5rem 0 0.75rem", fontSize: "1.8rem" }}>{title}</h2>
      <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>{description}</p>
    </section>
  );
}
