# Review Packets

Use the CRM review packet script to generate a local bundle for Codex, ChatGPT, or human review.

Generated packets are written to `review-packets/`, which is gitignored.

## Why They Exist

Review packets give you a self-contained snapshot of the CRM at a moment in time:

- source
- docs
- schema
- checks
- screenshots
- reviewer guidance

They are useful for milestone reviews, architecture check-ins, and handing a clean artifact to another AI or collaborator.

## What A Packet Includes

- key source files
- CRM docs
- config files
- schema copies
- optional reports
- checks output
- screenshots when Playwright and a runnable app are available
- a root `MANIFEST.md` for quick orientation
- a lightweight `reports/ai-context.md` summary for AI review
- a generated `REVIEW.md` guide

## Commands

```bash
npm run crm:review-packet
npm run crm:review-packet -- --mobile --viewport-only
npm run crm:review-packet -- --skip-screenshots
npm run crm:review-packet -- --focus leads
npm run crm:review-packet -- --include docs/crm-todo.md,src/db/schema.ts
npm run crm:review-packet -- --include-script
```

## ZIPs Vs Local Folders

- Use ZIPs when handing a packet to ChatGPT or archiving a milestone.
- Use `latest-crm-review/` when browsing locally or comparing the most recent packet contents quickly.
- Keep the live repo as the main working environment for Codex and implementation work.

## Notes

- The packet script is designed for local review and milestone snapshots.
- It does not include `.env`, `.env.local`, or private lead files by default.
- It does not copy files from `private/` except `private/README.md` unless you explicitly pass `--include`.
- If you intentionally include files from `private/`, or files that look like real lead or contact exports, the packet will warn about that in `PACKET-INFO.txt` and `REVIEW.md`.
- Do not include real lead spreadsheets, exports, or contact data unless you intentionally want a private local-only packet for internal review.
- Use review packets before major architecture changes, before import workflow milestones, and when you want a clean outside review of the CRM state.
