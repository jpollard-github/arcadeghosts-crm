# Review Packets

Use the CRM review packet script to generate a local bundle for Codex, ChatGPT, or human review.

Generated packets are written to `review-packets/`, which is gitignored.

## What A Packet Includes

- key source files
- CRM docs
- config files
- schema copies
- optional reports
- checks output
- screenshots when Playwright and a runnable app are available
- a generated `REVIEW.md` guide

## Commands

```bash
npm run crm:review-packet
npm run crm:review-packet -- --skip-screenshots
npm run crm:review-packet -- --focus leads --skip-tests
npm run crm:review-packet -- --screenshot-base-url http://127.0.0.1:3000 --mobile --viewport-only
npm run crm:review-packet -- --include docs/crm-todo.md,src/db/schema.ts --note "Review schema and todo alignment"
```

## Notes

- The packet script is designed for local review and milestone snapshots.
- It does not include `.env`, `.env.local`, or private lead files by default.
- It does not copy files from `private/` except `private/README.md` unless you explicitly pass `--include`.
- If you intentionally include files from `private/`, or files that look like real lead or contact exports, the packet will warn about that in `PACKET-INFO.txt` and `REVIEW.md`.
- Use review packets before major architecture changes, before import workflow milestones, and when you want a clean outside review of the CRM state.
