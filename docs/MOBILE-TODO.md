# ArcadeGhosts CRM Mobile TODO

This document is the durable mobile backlog for the CRM. Use it as the default reference for future UI work so mobile readiness stays built into the process.

## Phase 1 — Audit current mobile behavior

- [x] Review all current CRM routes at `390px`, `414px`, `430px`, and desktop
- [x] Confirm there is no obvious accidental horizontal viewport overflow on current routes
- [x] Note that the header/nav still crowds more of the first mobile viewport than an eventual denser CRM shell should
- [x] Check page intro cards for wrapping, spacing, and heading scale
- [x] Check dashboard cards for stacking, scan speed, and comfortable spacing
- [x] Check current form screens for cramped fields, labels, and action buttons
- [x] Check empty states and loading states at mobile widths
- [x] Check safe-area behavior on iPhone-style devices

## Phase 2 — Fix obvious layout problems

- [x] Make shared two-column content collapse to one column on smaller widths
- [x] Make current multi-field form rows stack on phones
- [x] Reduce the chance of header/nav overflow with wrapping and smaller mobile spacing
- [x] Add shared protections against body/page horizontal overflow
- [x] Tighten mobile heading scale enough for the current pre-data screens
- [x] Trim top-level shell chrome so the first viewport is more useful than the previous pass

## Phase 3 — Harden shared layout primitives

- [x] Add shared responsive page shell behavior
- [x] Add shared responsive card-grid behavior
- [x] Add shared stackable form-row primitive
- [x] Add shared stackable action-group primitive
- [x] Add shared checkbox row treatment with better tap comfort
- [x] Course-correct the visual theme before deeper CRM pages compound the old style
- [ ] Add a reusable mobile-safe toolbar/action bar pattern for data-heavy screens
- [ ] Add shared empty-state and loading-state spacing rules

## Phase 4 — Protect forms, tables, cards, modals, nav, and action bars

- [ ] Define the mobile strategy for future CRM tables before table-heavy screens ship
- [ ] Create card/list fallbacks for dense lead, company, and contact record views
- [ ] Add guidance for sticky filters, sticky save bars, and bottom actions
- [ ] Define modal and drawer sizing rules for forms and details
- [x] Keep current buttons and tap targets comfortably usable on phones
- [ ] Keep card content scannable when real CRM metadata gets denser
- [ ] Ensure nav/sidebar/header patterns do not dominate the first viewport once more routes and filters land

## Phase 5 — Review packet and screenshot validation workflow

- [x] Add mobile review expectations to the review packet workflow
- [x] Include mobile screenshots in packet generation when requested
- [x] Add a dedicated mobile review section to packet guidance
- [ ] Add clearer issue capture for known mobile problems in packet follow-ups
- [ ] Consider adding automatic overflow detection if it becomes worth the complexity

## Phase 6 — Ongoing rules for future CRM changes

- [ ] Treat mobile as part of definition of done for every new CRM UI change
- [ ] Review new forms at phone widths before marking a TODO complete
- [ ] Review new list/table views with a mobile scanning strategy before shipping
- [ ] Review sticky/fixed controls for safe-area and content-obscuring issues
- [ ] Keep internal-tool mobile UI utility-focused once real data density increases
- [ ] Re-run a mobile review packet before major UI or architecture milestones

## Current Known Direction

- [ ] Make the eventual mobile CRM UI denser and more utility-focused once real data exists

Notes:
`nav` should not dominate the first viewport, headings can be slightly smaller on mobile, and internal-tool pages should prioritize quick scanning once lists, tables, filters, and real operational workflows are present.

Current audit result:
The current dashboard, companies, contacts, leads, interactions, proposals, projects, and settings routes are usable on mobile after the shared layout fixes. The theme has also been course-corrected toward a calmer internal-tool UI before deeper CRM pages land.

New concerns from the theme pass:
- The current shell is noticeably better than before, but real-data screens may still need a denser nav or compact header mode.
- As soon as filters, detail panels, and table-like record views arrive, we should revisit card density and action-bar behavior on phone screens.
- Follow-ups, tasks, and the new detail pages should be included in the next explicit mobile screenshot review packet now that they are no longer placeholders.
