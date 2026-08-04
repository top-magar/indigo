---
version: 1
slug: "route-editor"
primary_target: "route:/editor"
related_targets: ["src/features/editor/editor.tsx", "src/app/editor/page.tsx"]
---

# Editor Surface Brief

## User And Job

A merchant is building or maintaining a live storefront. They need to understand site structure, edit content, connect real commerce data, confirm responsive behavior, and publish safely without learning a professional design tool.

## Primary Workflow

Choose template -> Add sections -> Edit content -> Connect catalog -> Style -> Preview -> Validate -> Publish -> Roll back.

## Required First View

- A restrained top bar with site/page identity, save state, undo/redo, viewport, preview, presence, and Publish.
- A left site navigator showing global header, pages, current-page sections, and global footer.
- A visually dominant storefront canvas.
- A content-first inspector with Layout, Style, and Advanced as progressive disclosure.
- A prominent Add section command opening a searchable, keyboard-operable library.

## States To Design

- Loading and migration fallback.
- Saved, unsaved, saving, failed save, retrying, and revision conflict.
- Empty page, demonstration catalog, and connected catalog.
- Lease acquired, another editor present, lease expired, and takeover requested.
- Validation ready, warnings, blocked publication, publishing, published, and rollback.
- Desktop authoring and compact preview/edit mode.

## Accessibility

All icon controls have names and tooltips. Panel tabs, menus, dialogs, trees, reordering, insertion, deletion, preview, validation, and publish are keyboard operable. Status changes use polite live regions. Focus is visible and restored after overlays close. Motion honors `prefers-reduced-motion`.

## Visual Boundary

Use Indigo semantic tokens and existing shadcn primitives. Blueprint details are limited to measurement and validation. Avoid marketing composition, decorative cards, gradients, glass, and visual noise that competes with the storefront.
