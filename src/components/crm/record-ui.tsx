import { PropsWithChildren } from "react";

export function Surface({ children }: PropsWithChildren) {
  return <section className="crm-surface">{children}</section>;
}

export function TwoColumn({ children }: PropsWithChildren) {
  return <section className="crm-two-column">{children}</section>;
}

export function FormRow({ children }: PropsWithChildren) {
  return <div className="crm-form-row">{children}</div>;
}

export function StackActions({ children }: PropsWithChildren) {
  return <div className="crm-stack-actions">{children}</div>;
}

export function FormField({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className="crm-form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        ...(props.style ?? {}),
      }}
      className="crm-form-control"
    />
  );
}

export function FormTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      style={{
        ...(props.style ?? {}),
      }}
      className="crm-form-control crm-form-control--textarea"
    />
  );
}

export function FormSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      style={{
        ...(props.style ?? {}),
      }}
      className="crm-form-control"
    />
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <button type="submit" className="crm-submit-button">
      {label}
    </button>
  );
}

export function SecondaryButton({
  label,
  type = "submit",
}: {
  label: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button type={type} className="crm-secondary-button">
      {label}
    </button>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="crm-empty-state">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ marginBottom: 0, color: "var(--muted)", lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
