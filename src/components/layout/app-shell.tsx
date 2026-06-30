import Link from "next/link";
import { PropsWithChildren } from "react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/companies", label: "Companies" },
  { href: "/contacts", label: "Contacts" },
  { href: "/interactions", label: "Interactions" },
  { href: "/proposals", label: "Proposals" },
  { href: "/projects", label: "Projects" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem 0 3rem",
      }}
    >
      <main>
        <header
          style={{
            display: "grid",
            gap: "1rem",
            padding: "1.5rem",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            background: "var(--surface)",
            boxShadow: "var(--shadow)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "var(--muted)",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              ArcadeGhosts Internal OS
            </p>
            <h1 style={{ margin: "0.35rem 0 0", fontSize: "2rem" }}>
              ArcadeGhosts CRM
            </h1>
          </div>
          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "0.65rem 0.9rem",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background: item.href === "/" ? "var(--accent-soft)" : "var(--surface-strong)",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div style={{ paddingTop: "1.5rem" }}>{children}</div>
      </main>
    </div>
  );
}
