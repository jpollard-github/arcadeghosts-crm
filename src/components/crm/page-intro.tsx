type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="crm-page-intro">
      <p className="crm-page-intro__eyebrow">{eyebrow}</p>
      <h2 className="crm-page-intro__title">{title}</h2>
      <p className="crm-page-intro__description">{description}</p>
    </section>
  );
}
