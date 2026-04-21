# Editor Patterns

Rules for any code touching `src/features/editor/`.

## Data Model

- `editor_projects` = a site (1 per tenant). Has `header_data`, `footer_data`, `nav_config`, `theme_config`.
- `editor_pages` = pages within a site. Has `data` (JSONB element tree), SEO fields, `published_html`.
- Element tree: `El = { id, type, name, styles, content }`. Content is `Record<string,string>` (leaf) or `El[]` (container).

## Stores

- `document-store.ts` — elements, history, dirty flag. Zustand.
- `editor-store.ts` — selection, hover, zoom, device, preview. Zustand.
- `provider.tsx` — compatibility bridge. `useEditor()` returns both stores + context props.
- Never import stores directly in components. Use `useEditor()`.

## Element Registry

- Self-registering: `register({ type, name, icon, color, group, isContainer, factory })` in `core/registry/elements/*.ts`.
- Renderers in `core/registry/renderers.tsx`. Leaf elements need a renderer. Containers render via `recursive.tsx`.
- Groups must be listed in `componentGroups()` order array in `core/registry/index.ts`.

## Drag/Resize Pattern

- During drag: dispatch `UPDATE_ELEMENT_LIVE` (no history push).
- On release: dispatch `COMMIT_HISTORY` (pushes to undo stack).
- All handle deltas must divide by zoom factor.

## Server Actions

- All in `lib/queries.ts` with `'use server'` directive.
- Every query scoped by `tenantId` via `getTenant()` → `requireUser()`.
- `savePage()` saves element data to `editor_pages`. Does NOT update page name.
- `publishPage()` generates HTML for ALL pages, injects header/footer/theme, resolves `#page:slug` links.

## HTML Export

- `export/html.ts` — `generateHTML()` + `downloadHTML()`.
- All user content escaped via `esc()` function. No raw interpolation.
- `embed` type disabled (returns empty string) — XSS vector.
- CSS values sanitized in `cssify()`.

## Bugs We've Fixed (Don't Reintroduce)

- `savePage` must NOT set `name` on editor_pages — it overwrites renamed pages.
- Auto-save must read fresh state from `useDocumentStore.getState()` inside the timeout, not from closure.
- `dirty` state lives in document-store, not local useState.
- Upload validates MIME type allowlist + 5MB size limit.
- Published pages need CSP `script-src: 'none'` + `X-Frame-Options: SAMEORIGIN`.

## Component Rules

- Factory `type` MUST match the registered `type`. Never emit `type: 'container'` from a `type: 'hero'` registration.
- All leaf content in export must use `esc()`. Including the default fallback.
- Renderers that parse JSON must use try/catch.
- Container components (isContainer: true) don't need renderers or export cases — they render via recursive fallback.
- Use fluid widths (`width: '100%'`) not hardcoded px. Let parent grid control sizing.
- Theme CSS values must be sanitized before interpolation into `<style>` tags.
- Semantic HTML in export: navbar→`<nav>`, header→`<header>`, footer→`<footer>`, section→`<section>`, form→`<form>`.
