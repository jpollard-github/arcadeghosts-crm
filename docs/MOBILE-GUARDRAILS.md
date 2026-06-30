# Mobile Guardrails

Mobile is part of the definition of done for ArcadeGhosts CRM UI work.

## Core Rule

Every new page, section, form, list, card grid, modal, nav change, action bar, and review packet should preserve mobile usability without needing a separate reminder.

## Required Checks

- Check every new UI change at mobile widths before calling it done.
- Test at `390px`, `414px`, `430px`, and a normal desktop width.
- Confirm the page does not introduce accidental horizontal scrolling.
- Confirm primary actions remain visible and reachable without covering important content.
- Confirm typography still scans cleanly on phone screens.

## Layout Rules

- Prefer responsive shared primitives over page-specific media query patches.
- Avoid fixed widths that can overflow cards, forms, drawers, or nav.
- Add `min-width: 0` to grid and flex children when content can grow.
- Let grids collapse naturally to one column on smaller widths.
- Keep the first mobile viewport focused on the most useful information, not oversized chrome.

## Forms

- Forms must stack cleanly on small screens.
- Two-column field rows need a one-column fallback.
- Inputs, selects, textareas, checkboxes, and buttons should keep usable tap targets.
- Long labels, placeholder text, and validation copy should wrap instead of overflow.

## Tables And Lists

- Every table needs a mobile strategy before it ships.
- Prefer card/list fallbacks for CRM records when horizontal tables would become cramped.
- If horizontal scrolling is truly necessary, it must be intentional, bounded, and still readable.

## Navigation And Actions

- Navigation should wrap or collapse before it crowds the viewport.
- Sticky or fixed controls must not cover form fields, list content, or bottom safe areas.
- Action groups should stack or wrap naturally on phones.

## Modals, Drawers, And Panels

- Modal and drawer content must fit small heights and respect safe areas.
- Critical actions must remain reachable without trapping content behind fixed footers.
- Avoid wide side panels as the only way to complete a task on mobile.

## Review Packets

- Review packets should include a dedicated mobile review section.
- Mobile screenshot output should be treated as part of normal packet review.
- Known mobile issues should be called out directly instead of buried in generic notes.

## Operating Expectation

When adding future CRM UI, assume mobile review is mandatory and automatic.
