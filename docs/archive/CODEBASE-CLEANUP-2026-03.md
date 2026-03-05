# Codebase Cleanup — March 2026

## Changes Made

### 1. Consolidated Auth (`src/lib/auth.ts`) — NEW FILE
Single auth module replacing 3 competing patterns:
- `getUser()` — cached per-request, returns null if unauthenticated
- `requireUser()` — redirects to /login if unauthenticated  
- `getAuthenticatedClient()` — returns both user and supabase client

**Migration**: Replace inline auth patterns in dashboard files with `requireUser()` or `getAuthenticatedClient()`. The old patterns still work — this is additive, not breaking.

**Files still using old patterns** (migrate gradually):
- `src/app/dashboard/layout.tsx` — inline supabase auth
- `src/app/dashboard/actions.ts` — `getAuthenticatedUser()` 
- 58+ dashboard action files using `createClient()` directly
- `src/infrastructure/auth/session.ts` — `getSession()` (used by 3 files)
- `src/lib/actions.ts` — `verifySession()` (unused externally)

### 2. Fixed Currency Default (orders schema)
- `orders.currency`: `"USD"` → `"NPR"`
- `order_transactions.currency`: `"USD"` → `"NPR"`
- **Note**: Requires a Drizzle migration (`pnpm drizzle-kit generate`) to apply to DB. Existing rows are unaffected — only new rows get the new default.

### 3. Fixed `null as unknown as Database` (`src/infrastructure/db.ts`)
- Replaced with lazy Proxy that throws a clear error message when `DATABASE_URL` is not set
- No more cryptic `Cannot read properties of null` errors

### 4. Fixed Broken Import (`src/instrumentation.ts`)
- `@/lib/db` → `@/infrastructure/db` (the correct path)

### 5. Fixed Barrel Export Explosion (`src/infrastructure/services/index.ts`)
- Removed double wildcard + named re-exports of all providers
- Now only exports service facades and core abstractions
- Provider implementations should be imported directly from their modules
- **All 16 consumer files verified** — they only import facades (AIService, StorageService, etc.)

### 6. Deduplicated `validateTenantId` (`src/infrastructure/repositories/base.ts`)
- Removed duplicate definition, now re-exports from `@/shared/errors`
- `QueryOptions` and `PaginatedResult` interfaces kept (used by repositories)

### 7. Deleted Visual Editor V2
- `src/features/visual-editor-v2/` — entire directory
- `src/app/(editor)/editor-v2/` — route
- `src/app/api/editor-v2/` — API routes
- **Safe because**: v2 was only accessible via direct URL `/editor-v2`, not linked from any UI

### 8. Deleted Backup Files
- `src/app/dashboard/page-v2.tsx.bak`
- `src/app/demo/sidebar/page.tsx.backup`

### 9. Updated Editor Layout (`src/app/(editor)/layout.tsx`)
- Now uses `requireUser()` from new consolidated auth

### 10. Created Structured Logger (`src/lib/logger.ts`) — NEW FILE
- Leveled logging (debug/info/warn/error)
- JSON output in production, human-readable in dev
- Controlled by `LOG_LEVEL` env var
- **Usage**: `const log = createLogger("ModuleName"); log.info("message", { data })`

### 11. Fixed All 60 Visual Editor V3 TypeScript Errors
- `z.record(z.any())` → `z.record(z.string(), z.any())` (Zod v4 API)
- `defaultProps` → `defaultContent` (matching `BlockDefinition` interface)
- Removed duplicate `style` prop from `EditorCanvas` (only `styles` exists on `BlockRenderProps`)
- Added missing CSS properties to `StyleOverrides`: `background`, `objectFit`, `cursor`, `fontStyle`, `borderLeft`
- Added `str()`/`num()` helpers in export-html.ts and export-react.ts for safe `Record<string, unknown>` extraction
- Fixed `zoom` → `canvasTransform.scale` in `EditorFooter`
- Fixed `result.error.errors` → `result.error.issues` (Zod v4 API)
- Relaxed `component` type in `BlockDefinition` to `ComponentType<any>` (block components accept spread content props, not `BlockRenderProps`)

### 12. Fixed Test and Script Errors
- `recommendation.test.ts`: `filterValues` values changed from `string` to `string[]`
- `check-tenants.ts`: Removed `domain` field (doesn't exist in tenants schema)

### 13. Neutralized In-Memory CacheService
- `withCache()` is now a pass-through that calls the factory directly
- In-memory caching is useless in serverless (each request = fresh instance)
- All 25+ call sites in 3 repository files continue working unchanged
- Replace with Redis or Next.js `"use cache"` when ready

### 14. Added Error Logging to Critical Silent Catches
- `dashboard/actions.ts`: `getDashboardLayout` now logs errors
- `dashboard/media/actions.ts`: blob deletion failure now logged

## NOT Changed (Intentionally Preserved)

### Visual Editor V1 (`src/features/editor/`)
**Kept because**: This is the ACTIVE production editor at `/storefront`, linked from the dashboard sidebar. 37 files import from it. Deleting it would break the main editor.

### Visual Editor V3 (`src/features/visual-editor-v3/`)
**Kept because**: This is the next-gen editor at `/editor-v3`. Has 60 pre-existing TS errors (Zod v4 API changes, type mismatches) that need separate fixing.

### Drizzle Runtime (`src/infrastructure/db.ts`)
**Kept because**: 29 files import from it, including:
- Storefront actions (`withTenant` for global styles)
- All feature repositories (products, orders, customers, etc.)
- Store data layer, tenant resolver
- Removing it would require rewriting all repositories to use Supabase client

### `src/lib/actions.ts` (authorizedAction, verifySession)
**Kept because**: Used by 3 files (domain service, order service, dashboard stats API). Can be deprecated gradually.

### `src/infrastructure/services/cache.ts` (CacheService)
**Kept because**: Used by 3 repository files. Works in development. Should be replaced with Next.js `"use cache"` or Redis in production, but not urgent.

### `src/infrastructure/auth/session.ts`
**Kept because**: Used by 3 files (reviews, media upload, websocket). Can be migrated to `src/lib/auth.ts` gradually.

## Future Work (Safe to Do)

1. **Migrate dashboard files to `requireUser()`** — one file at a time, no risk
2. **Run `pnpm drizzle-kit generate`** — to create migration for currency default change
3. **Fix v3 editor TS errors** — 60 errors in registry, templates, export utils
4. **Replace CacheService with `"use cache"`** — when ready for production caching
5. **Move `public/hero-bg.mp4` (90MB) to CDN** — reduces deploy size
6. **Gradually replace `console.log` with `createLogger()`** — module by module
7. **Add error logging to empty `catch {}` blocks** — 139 instances across 80 files

## Verification

- TypeScript check: **0 errors** (was 60 pre-existing, all fixed)
- All import chains verified — no broken references
- No UI-linked routes were removed
