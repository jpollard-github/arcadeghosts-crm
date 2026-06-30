# Auth Strategy

## Goal

ArcadeGhosts CRM needs stronger authentication than a hand-rolled cookie login.

This app will hold:

- lead and contact data
- proposal and project context
- internal notes
- future integration tokens and references

That makes custom cookie auth a poor long-term fit even if the app begins as single-user and private.

## Recommendation

Use **Clerk** as the default authentication service for the first real protected version of the CRM.

Why Clerk is the current best fit:

- strong managed auth for a Next.js App Router app
- better default security posture than custom cookies or ad hoc session logic
- fast setup for sign-in, session handling, and route protection
- works well with Vercel deployment
- gives a path from single-user private access to small-team internal access later
- avoids spending early product time inventing auth infrastructure

## Why Not Custom Cookie Auth

Do not build a custom username/password plus cookie session layer for this project.

Reasons:

- easy to get session security wrong
- adds password handling and reset flow burden
- creates avoidable CSRF/session hardening work
- distracts from actual CRM product work
- becomes harder to trust once integration secrets and real contact data exist

## Current Decision

Recommended path:

1. Use Clerk.
2. Start with simple protected internal access.
3. Protect all CRM routes and API routes except health or explicitly public routes.
4. Keep authorization simple at first: one trusted internal user or a very small allowlist.
5. Add richer roles only when real workflow needs appear.

## Acceptable Alternatives

If Clerk becomes a bad fit, acceptable second choices are:

- Auth0
- Descope

These are still preferable to custom auth for this repo.

## MVP Auth Shape

Initial auth scope should be intentionally narrow:

- sign-in required for all CRM routes
- sign-in required for all non-public API routes
- single-user or tiny internal team access
- no public sign-up
- no multi-tenant org model yet
- no custom role matrix yet

## What To Implement Later

When auth implementation begins, add:

- provider setup in app layout
- protected route middleware/proxy
- sign-in route
- server-side session checks for route handlers and actions
- internal access policy notes

Then follow with:

- audit of integration-secret access paths
- basic user attribution on notes/interactions/tasks if needed
- role decisions only when there is a second real operator

## What Not To Build Yet

- public self-serve signup
- complex RBAC
- client portal auth
- organization switching
- custom password storage
- custom session infrastructure

## Revisit Trigger

Revisit this decision if:

- ArcadeGhosts CRM expands beyond internal use
- client-facing access is added
- a compliance-sensitive workflow appears
- Clerk pricing or constraints become a real issue
