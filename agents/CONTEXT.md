# Indigo — Shared Agent Context

## Stack
- Next.js 16.1 (Turbopack), React 19, TypeScript strict
- Craft.js for visual page editor
- Zustand 5 for client stores (save-store, command-store, overlay-store)
- Supabase (Postgres + Auth + Realtime + Storage)
- Drizzle ORM for schema, raw Supabase client for queries
- Tailwind CSS 4, shadcn/ui components
- Inngest for background workflows

## Editor Architecture
```
src/features/editor/
├── actions/       — server actions (page CRUD, block locks, image upload)
├── blocks/        — 27 visual blocks (hero, text, image, columns, etc.)
├── canvas/        — render-node, overlays, floating toolbar, device frame
├── controls/      — reusable field controls (color picker, spacing, etc.)
├── hooks/         — client hooks (zoom, panels, theme, permissions, etc.)
├── lib/           — pure utils (grid tokens, theme-to-vars, scroll, coords)
├── panels/        — left/right panel content (settings, tree, SEO, a11y)
├── stores/        — zustand stores + event bus
├── components/    — shell chrome (editor-shell, top-bar, shortcuts)
├── editor-context.tsx
├── resolver.ts    — Craft.js block resolver
└── editor-theme.css
```

## Known Patterns
- `verifyTenantOwnership(tenantId)` — every server action starts with this
- `useEditor((state) => primitives)` — return flat primitives, never objects (causes infinite re-render)
- `useSaveStore(s => s.field)` — individual selectors, never `useSaveStore(s => ({ a: s.a, b: s.b }))`
- Blocks define `.craft = { displayName, props, rules, related: { settings } }`
- `SectionWrapper` — shared wrapper for section-level blocks (padding, background, responsive)
- `editorEmit("event")` / `editorOn("event", handler)` — event bus for decoupling
- `audit(tenantId, action, userId, entityId, extra)` — fire-and-forget audit logging
- CSS `:hover` on render-node instead of Craft.js `isHovered` (perf optimization)

## Known Recurring Bugs
1. **Circular node refs** — Craft.js tree gets cycles. Any recursive walk needs `visited` set.
2. **Zustand selector infinite loop** — returning new objects from selectors triggers re-render loop.
3. **Hydration mismatch** — `React.lazy` + `Suspense` in SSR'd client components. Use `next/dynamic` with `ssr: false`.
4. **JSON.stringify on circular objects** — `_responsive` overrides can contain circular refs. Always try/catch.
5. **Maximum call stack** — caused by #1 or #4. Check breadcrumb parent walk, section tree, render-node.

## Auth Flow
- `requireUser()` → returns `{ id, email, tenantId, role, fullName, avatarUrl }`
- `verifyTenantOwnership(tenantId)` → returns user, throws if tenant mismatch
- Roles: owner (full), admin (full), editor (edit/save, no publish/delete), viewer (read-only)
- `EditorPermissionsProvider` wraps the editor, `useEditorPermissions()` reads role

## DB Tables (editor-relevant)
- `store_layouts` — draft_blocks, blocks (published), theme_overrides, status, publish_at
- `layout_versions` — immutable snapshots on publish
- `block_locks` — per-block collaborative locks (60s TTL)
- `editor_sessions` — presence tracking
- `audit_logs` — entity-level change tracking with old/new values
- `page_templates` — saved page templates
- `tenants` — settings includes globalHeader/globalFooter JSON
