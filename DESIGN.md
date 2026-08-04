# Indigo Merchant Workbench

## Direction

The storefront is the visual focus. Editor chrome is a quiet, precise operational frame built from Indigo's existing semantic tokens. Blueprint language appears only where it communicates measurement or state: rulers, selection geometry, spacing overlays, responsive boundaries, and publication validation.

This is a merchant workbench, not a graphics application. Default controls use commerce language and complete tasks in a predictable left-to-right workflow.

## Information Architecture

- **Top bar:** site and page breadcrumb, save state, undo and redo, viewport, preview, presence, and Publish.
- **Left navigator:** global header, pages, current page sections, global footer, and Add section.
- **Canvas:** the real storefront shell with navigation, catalog, currency, and interactive commerce states.
- **Right inspector:** Content, Layout, Style, and Advanced.
- **Command palette:** pages, sections, viewport changes, editor actions, preview, validation, and publishing.
- **Publish flow:** checklist first, then one explicit publication action. History and rollback live beside publication status.

## Visual System

- Use the repository's background, foreground, muted, border, primary, destructive, sidebar, and focus-ring tokens.
- Use `text-lg font-semibold tracking-tight` for major compact titles and restrained 12–14px type for working controls.
- Minimum interactive target is 32px in dense desktop chrome and 44px in compact/touch mode.
- Containers use `rounded-lg`; controls use `rounded-md`.
- No decorative shadows, gradients, glass effects, nested cards, or ornamental color fields.
- Canvas boundary and active selection may use a subtle shadow or outline when needed to communicate spatial depth.
- Icons come from Lucide and icon-only controls always have an accessible name and tooltip.

## Interaction Rules

- Designed sections are the default insertion unit. Basic elements and advanced positioning stay available but secondary.
- Every drag action has an equivalent keyboard or menu action.
- Save state is explicit: Saved, Saving, Unsaved changes, or Couldn't save with Retry.
- Publishing cannot begin while local revisions are unacknowledged.
- Responsive controls use `desktop`, `tablet`, and `mobile` consistently in data and UI.
- Motion is brief and functional. Reduced-motion mode removes canvas transitions and animated insertion feedback.
- Focus remains visible throughout panels, dialogs, command menus, and the canvas tree.

## Compact Mode

Below 1280px, the canvas becomes a storefront preview and advanced layout manipulation is disabled with a clear status message. Merchants can still change content, reorder sections, save, validate, and publish.

## Content Voice

Use direct merchant language: Add section, Connect collection, Store navigation, Preview store, Check before publishing, Publish changes, Restore this version. Avoid internal implementation terms such as nodes, JSON, schema, hydration, or CSS in default controls.
