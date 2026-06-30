# Database Bootstrap

## Recommendation

Yes, **Neon Postgres** is a good fit for this repo.

It already fits the current direction well:

- PostgreSQL-based app
- Vercel deployment target
- small internal tool with low early operational overhead
- Drizzle ORM already in place
- familiar provider from your other site

For this CRM, Neon is the default recommended hosted database unless a later constraint changes that.

## Why Neon Works Here

- easy to pair with Vercel
- managed Postgres without extra infrastructure work
- appropriate for an internal CRM MVP
- straightforward `DATABASE_URL` setup for local and deployed environments
- good fit for migration-based schema management

## Recommended Setup

Use:

- **Neon** for the main hosted CRM database
- **local Postgres** only when you want isolated scratch work or a separate destructive sandbox

Keep this CRM on its **own** Neon database rather than sharing the personal site database.

## Acceptable Alternatives

Reasonable alternatives if needed later:

- local Postgres via Docker or Postgres.app
- Supabase Postgres
- another managed Postgres provider

None of those are necessary right now if Neon is already working well for you.

## Bootstrap Flow

1. Create a dedicated Neon database for `arcadeghosts-crm`.
2. Put its connection string in local `.env.local` as `DATABASE_URL`.
3. Add the same `DATABASE_URL` in Vercel for deployed environments.
4. Generate migrations from the schema:

```bash
npm run db:generate
```

5. Apply migrations:

```bash
npm run db:migrate
```

6. Use `db:push` only for short-lived prototype situations when migration history does not matter.

## Scripts

- `npm run db:generate`
  Generate SQL migrations from `src/db/schema.ts`
- `npm run db:migrate`
  Apply generated migrations from `drizzle/`
- `npm run db:push`
  Push the current schema directly to a database

## Near-Term Recommendation

The next practical database steps are:

1. generate the first migration
2. point `DATABASE_URL` at a dedicated Neon database
3. apply the migration
4. start building CRUD against the real schema
