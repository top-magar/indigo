---
name: store-block
description: Create storefront blocks for the Indigo visual editor. Use when building new drag-and-drop blocks like hero sections, product grids, galleries, testimonials, or any customer-facing storefront component.
---

# Store Block Builder

Build storefront blocks for Indigo's visual editor. Blocks are tenant-themed, responsive, and editable via drag-and-drop.

**Stack**: React + Tailwind CSS v4 + OKLCH theming via `--ds-brand-hue`

## Block Architecture

```
src/components/store/blocks/{block-name}/
├── index.tsx              → Block component (renders content)
├── block-config.ts        → Field definitions for the editor
└── block-preview.tsx      → Optional: thumbnail preview
```

## Registration

Register in `src/components/store/blocks/registry.ts`:
```tsx
export const blockRegistry = {
  "block-name": {
    component: lazy(() => import("./block-name")),
    label: "Block Name",
    category: "content", // content | commerce | media | layout
    icon: LayoutIcon,
    defaultProps: { /* initial values */ },
  },
};
```

Add field definitions in `src/features/editor/fields/block-fields.ts`.

## Existing Blocks (19)
hero, header, footer, product-grid, featured-product, gallery, image,
columns, button, faq, newsletter, promotional-banner, + 7 more

## Theming

Blocks inherit the tenant's theme via CSS variables:
- `--ds-brand-hue` (0-360) → Rotates entire accent system
- All OKLCH tokens auto-adapt to the tenant's brand
- Dark/light mode handled by token system

## Design Rules
- Mobile-first responsive (stack on small screens)
- Product imagery as hero — minimal decoration
- Touch targets ≥44px
- Use semantic tokens, never hardcoded colors
- Support `prefers-reduced-motion`

## Field Types for Editor
```tsx
// Text field
{ type: "text", key: "heading", label: "Heading", default: "Welcome" }
// Image field
{ type: "image", key: "backgroundImage", label: "Background" }
// Select field
{ type: "select", key: "layout", label: "Layout", options: ["grid", "list"] }
// Color field (uses brand scale)
{ type: "color", key: "accentColor", label: "Accent" }
// Range field
{ type: "range", key: "columns", label: "Columns", min: 1, max: 6 }
```
