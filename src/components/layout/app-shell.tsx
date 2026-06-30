"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <main>
        <header className="app-shell__header">
          <div className="app-shell__brand">
            <div className="app-shell__brand-mark" aria-hidden="true">
              AG
            </div>
            <div>
              <p className="app-shell__eyebrow">ArcadeGhosts Internal OS</p>
              <h1 className="app-shell__title">ArcadeGhosts CRM</h1>
            </div>
          </div>
          <nav className="app-shell__nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="app-shell__nav-link"
                data-active={pathname === item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="app-shell__content">{children}</div>
      </main>
    </div>
  );
}
