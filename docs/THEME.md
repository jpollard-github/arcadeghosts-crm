# CRM Theme Direction

ArcadeGhosts CRM should feel like a polished private business tool with a subtle ArcadeGhosts accent, not like the public site and not like a decorative branded microsite.

## Design Goal

- calm, credible, modern internal-tool UI
- readable, fast-scanning, and useful
- restrained personality
- subtle teal or ghost-accent moments
- durable enough for real consulting and client operations work

## What To Avoid

- sepia, parchment, antique-card, or scrapbook vibes
- novelty-first styling
- overly decorative serif-heavy treatment
- public-site neon drama or entertainment-first motion
- oversized chrome that pushes useful CRM content below the fold

## Token Guidance

Keep theme colors centralized in `src/app/globals.css`.

- `--bg` and related background tokens should stay cool and neutral
- surfaces should look like modern app panels, not paper cards
- accent color should stay in the teal/mint/cyan family
- shadows should be restrained and soft
- focus states should be crisp and visible
- danger, warning, and success tokens should exist even if lightly used at first

## UI Usage Guidance

- Use accent color to guide action and state, not to decorate everything
- Prefer clean sans-serif typography for CRM scanning
- Keep cards compact and structured
- Make nav feel like application navigation, not marketing navigation
- If personality is added, keep it to a small badge, hover accent, icon, or subtle motif

## Mobile Implication

Theme work must not undo mobile safety. Any visual tightening should preserve:

- clean stacking
- readable forms
- usable tap targets
- no accidental horizontal overflow
- a more useful first viewport than the previous pass
