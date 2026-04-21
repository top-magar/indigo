# Database Conventions

Rules for any code touching `src/db/schema/` or writing queries.

## Tenant Isolation

- EVERY query must filter by `tenantId`. No exceptions.
- Use `requireUser()` from `src/lib/auth.ts` to get `{ id, tenantId, email, role }`.
- For editor queries: `getTenant()` helper in `lib/queries.ts`.
- Verify ownership through parent chain (page → project → tenant).

## Schema Conventions

- Tables in `src/db/schema/*.ts` using Drizzle `pgTable`.
- Export from `src/db/schema/index.ts`.
- Always include: `id` (uuid, defaultRandom), `created_at`, `updated_at` (timestamptz, defaultNow).
- Use `text()` for strings, `jsonb()` for structured data, `boolean()` with `.default(false)`.
- Foreign keys: `.references(() => parent.id, { onDelete: "cascade" })`.

## Migrations

- File: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- Use `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` for safety.
- Push: `npx supabase db push`
- Always provide explicit timestamps on INSERT if column defaults might not exist.

## Server Actions

- `'use server'` directive at top of file.
- Wrap `JSON.parse()` in try/catch.
- Return structured errors, never throw with internal details.
- Use `revalidatePath()` after mutations that affect dashboard pages.

## Known Issues

- `editor_projects.data` is legacy — pages now stored in `editor_pages.data`.
- Some old projects have `tenantId: "default"` — these are test data.
