# Indigo Storefront Editor — Research & Implementation Plan

## Executive Summary

Replace the removed custom-built editor with **Puck** (`@puckeditor/core`) — the leading open-source React visual editor (12.3K GitHub stars, MIT license). Puck provides drag-and-drop, inline editing, AI page generation, rich text fields, and a plugin system out of the box. Indigo already has 19 block components, a block type system (605 lines), a layout service with Supabase persistence, and template presets — all of which map directly to Puck's architecture.

---

## 1. Why Puck

### Competitive Analysis

| Framework | Stars | React-native | Nested blocks | Inline editing | AI generation | Active (2026) |
|-----------|-------|-------------|---------------|----------------|---------------|---------------|
| **Puck** | 12.3K | ✅ React component | ✅ DropZone | ✅ richtext field | ✅ Puck AI (beta) | ✅ v0.21 (Jan 2026) |
| Craft.js | 7.5K | ✅ React | ✅ Canvas | ❌ Manual | ❌ | ⚠️ Slow updates |
| GrapesJS | 22K | ❌ Vanilla JS | ✅ | ✅ | ❌ | ✅ But not React-native |
| Builder.io | SaaS | ✅ SDK | ✅ | ✅ | ✅ | ✅ But vendor lock-in |

### Why Puck wins for Indigo

1. **React-first** — It's a React component. Drops into Next.js App Router with zero friction.
2. **Use YOUR components** — Puck renders whatever React components you give it. Indigo's 19 existing blocks become Puck components with a config object.
3. **No vendor lock-in** — Self-hosted, MIT license. Data is JSON you own.
4. **Tailwind v4 compatible** — Official guide for Puck + Tailwind v4 integration.
5. **Built-in rich text** — TipTap-based `richtext` field with inline `contentEditable` support. Replaces our deleted `EditableRichText`.
6. **AI page generation** — Puck AI (beta) generates pages from your component config. Replaces our deleted `generate-page.ts`.
7. **Plugin system** — Plugin Rail for custom sidebar panels (SEO, analytics, etc.).
8. **Active development** — v0.21 released Jan 2026 with major features.

---

## 2. Architecture: How Puck Maps to Indigo

### What Indigo already has (keep)

| Asset | Path | Puck equivalent |
|-------|------|-----------------|
| 19 block components | `src/components/store/blocks/` | Puck `config.components` render functions |
| Block type system | `src/types/blocks.ts` (605 lines) | Puck `Config<Props>` type |
| Block registry | `src/components/store/blocks/registry.ts` | Puck `config.components` |
| Template presets | `src/components/store/blocks/templates/` | Puck initial `data` |
| Layout service | `src/features/store/layout-service.ts` | Puck `onPublish` callback → Supabase |
| BlockRenderer | `src/components/store/blocks/block-renderer.tsx` | Puck `<Render>` component |
| Draft/publish flow | `saveDraft()`, `publishLayout()` | Puck `onPublish` + custom draft logic |
| Responsive visibility | `responsive-block-wrapper.tsx` | Puck viewports + custom wrapper |

### What Puck replaces (deleted)

| Deleted code | Puck replacement |
|-------------|-----------------|
| `src/app/(editor)/` — custom editor UI | `<Puck>` component |
| `src/features/editor/` — 110 files of custom DnD, state, panels | Puck core (DnD, state, sidebar, fields) |
| `EditableText` / `EditableRichText` — inline editing | Puck `richtext` field with `contentEditable: true` |
| `editable-block-wrapper.tsx` — selection/hover/action bar | Puck built-in selection + `ActionBar` override |
| `command-palette.tsx` (editor) | Puck plugin or override |
| `settings-panel.tsx` — field editing sidebar | Puck Fields plugin (built-in) |
| `layers-panel-toolbar.tsx` — outline/layers | Puck Outline plugin (built-in) |
| `block-palette.tsx` — component drawer | Puck Blocks plugin (built-in) |
| `save-button.tsx` — publish flow | Puck `onPublish` prop |
| `ai-generation-dialog.tsx` | Puck AI `generate()` API |
| `global-styles/` — theme editor | Puck metadata + custom plugin |
| `clipboard.ts` — copy/paste | Puck built-in (0.21+) |
| `communication.ts` — postMessage iframe | Not needed — Puck renders in-app, not iframe |

### Key architectural difference

The old editor used an **iframe** to render the storefront preview, communicating via `postMessage`. Puck renders components **directly in the editor canvas** — no iframe, no message passing. This eliminates an entire class of bugs and complexity.

---

## 3. Data Model Mapping

### Current Indigo block data (PageLayout)

```typescript
interface PageLayout {
  blocks: StoreBlock[]
  globalStyles?: GlobalStyleSettings
}

interface StoreBlock {
  id: string
  type: BlockType
  variant?: string
  order: number
  visible: boolean
  settings: Record<string, any>
  children?: StoreBlock[]
  responsiveOverrides?: ResponsiveOverrides
  responsiveVisibility?: ResponsiveVisibility
}
```

### Puck data format

```typescript
interface Data {
  root: { props: Record<string, any> }
  content: ComponentData[]  // top-level blocks
  zones?: Record<string, ComponentData[]>  // nested blocks (DropZones)
}

interface ComponentData {
  type: string
  props: Record<string, any>
}
```

### Migration strategy

Write a **bidirectional adapter**:
- `indigoToPuck(layout: PageLayout): PuckData` — for loading into editor
- `puckToIndigo(data: PuckData): PageLayout` — for saving to Supabase

This keeps the existing Supabase schema and `BlockRenderer` unchanged. The storefront continues to read `PageLayout` format. Only the editor works with Puck's format.

---

## 4. Implementation Plan

### Phase 1: Core Editor (Week 1)

**Goal:** Puck editor renders existing blocks, saves to Supabase.

```
src/app/(editor)/
├── layout.tsx                    → Editor layout (auth guard)
└── storefront/
    ├── page.tsx                  → Server component (fetch layout)
    ├── editor-client.tsx         → <Puck> with config
    └── puck-config.ts            → Map Indigo blocks → Puck components
```

**Tasks:**
1. `npm install @puckeditor/core`
2. Create `puck-config.ts` — map each of the 19 blocks to Puck `ComponentConfig`
3. Create data adapters (`indigoToPuck`, `puckToIndigo`)
4. Wire `onPublish` to existing `saveLayout()` / `publishLayout()`
5. Add editor route with auth guard
6. Re-add sidebar link to `/storefront`

**Key file: `puck-config.ts`**
```typescript
import type { Config } from "@puckeditor/core"
import { HeroBlock } from "@/components/store/blocks/hero"
import { HeaderBlock } from "@/components/store/blocks/header"
// ... all 19 blocks

type Props = {
  Hero: { headline: string; subheadline: string; variant: HeroVariant; /* ... */ }
  Header: { storeName: string; variant: HeaderVariant; /* ... */ }
  // ... all block props from existing settings
}

export const config: Config<Props> = {
  categories: {
    layout: { title: "Layout", components: ["Header", "Footer", "Section", "Columns"] },
    content: { title: "Content", components: ["Hero", "RichText", "Image", "Button", "Video", "FAQ", "Gallery"] },
    commerce: { title: "Commerce", components: ["ProductGrid", "FeaturedProduct", "PromoBanner"] },
    social: { title: "Social Proof", components: ["Testimonials", "TrustSignals", "Newsletter"] },
  },
  components: {
    Hero: {
      fields: {
        headline: { type: "text" },
        subheadline: { type: "textarea" },
        variant: {
          type: "select",
          options: [
            { value: "full-width", label: "Full Width" },
            { value: "split", label: "Split" },
            { value: "video", label: "Video" },
            { value: "minimal-text", label: "Minimal" },
            { value: "product-showcase", label: "Product Showcase" },
          ],
        },
        ctaText: { type: "text" },
        ctaLink: { type: "text" },
        backgroundImage: { type: "text" }, // TODO: custom image picker field
      },
      defaultProps: {
        headline: "Welcome to our store",
        subheadline: "Discover amazing products",
        variant: "full-width",
        ctaText: "Shop Now",
        ctaLink: "/products",
      },
      render: (props) => <HeroBlock block={propsToStoreBlock("hero", props)} />,
    },
    // ... repeat for all 19 blocks
  },
}
```

### Phase 2: Rich Text & Inline Editing (Week 2)

1. Replace `EditableText` stub with Puck's `richtext` field + `contentEditable: true`
2. Configure TipTap extensions for each rich text field
3. Add custom image picker field (Puck `custom` field → Indigo media library)
4. Add product picker field (Puck `external` field → Supabase products query)

### Phase 3: Draft/Publish & Persistence (Week 2)

1. Wire Puck `onPublish` → `publishLayout()` (existing)
2. Add auto-save draft on change (Puck `onChange` → `saveDraft()`)
3. Add publish/discard UI in Puck header (Puck `headerActions` override)
4. Version history via Supabase (existing `draft_blocks` / `blocks` columns)

### Phase 4: AI Page Generation (Week 3)

1. Sign up for Puck AI beta (cloud service)
2. Configure `@puckeditor/ai` with Indigo's component config
3. Add AI generation button to editor header
4. OR: Use headless `generate()` API with own LLM (Anthropic/OpenAI) for self-hosted AI

### Phase 5: Custom Plugins (Week 3-4)

1. **SEO Plugin** — Plugin Rail panel for meta title, description, OG image
2. **Theme Plugin** — Plugin Rail panel for brand color (hue rotation), font selection
3. **Responsive Preview** — Custom viewports matching Indigo breakpoints (375, 768, 1024, 1440)
4. **Product Data Plugin** — External field that queries Supabase for products, collections

### Phase 6: Polish (Week 4)

1. Mobile editor experience (Puck 0.21 has mobile Plugin Rail)
2. Keyboard shortcuts (delete/backspace built-in, add custom)
3. Undo/redo (Puck built-in)
4. Template gallery (load Puck `data` from template presets)
5. Performance testing with 50+ blocks

---

## 5. File Structure (Final)

```
src/app/(editor)/
├── layout.tsx                      → Auth guard + editor shell
└── storefront/
    ├── page.tsx                    → Server: fetch layout, render EditorClient
    └── editor-client.tsx           → Client: <Puck> with config + overrides

src/features/editor/
├── puck-config.ts                  → Component config (maps 19 blocks)
├── puck-adapters.ts                → indigoToPuck() / puckToIndigo()
├── puck-overrides.ts               → Header actions, action bar customization
├── fields/
│   ├── image-picker.tsx            → Custom field: media library integration
│   └── product-picker.tsx          → Custom field: product/collection selector
└── plugins/
    ├── seo-plugin.tsx              → SEO metadata panel
    └── theme-plugin.tsx            → Brand color/font panel
```

---

## 6. Dependencies

```bash
npm install @puckeditor/core
# Optional:
npm install @puckeditor/plugin-heading-analyzer  # SEO heading structure
```

That's it. Puck has zero peer dependencies beyond React. TipTap (for rich text) is bundled inside Puck.

---

## 7. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Puck data format differs from Indigo's | Medium | Bidirectional adapter keeps Supabase schema unchanged |
| Tailwind dynamic classes in editor | Medium | Use predefined class options (select fields) + safelist.txt for dynamic values |
| Puck AI is cloud-only (beta) | Low | Can use headless `generate()` with own LLM, or defer AI to later |
| Block variants (5 hero variants, etc.) | Medium | Map variant to Puck `select` field, render correct sub-component |
| Existing storefront pages break | None | `BlockRenderer` and `PageLayout` format unchanged — adapter handles conversion |
| Performance with many blocks | Low | Puck uses virtualization, React.memo. Test with 50+ blocks in Phase 6 |

---

## 8. References

- [Puck docs](https://puckeditor.com/docs) — Official documentation
- [Puck + Tailwind v4 guide](https://puckeditor.com/blog/how-to-build-a-react-page-builder-puck-and-tailwind-4) — Integration tutorial
- [Puck 0.21 changelog](https://puckeditor.com/blog/puck-021) — AI, rich text, plugin rail
- [Puck AI overview](https://puckeditor.com/docs/ai/overview) — AI page generation docs
- [Puck Next.js recipe](https://github.com/puckeditor/puck/tree/main/recipes/next) — App Router starter
- [Puck GitHub](https://github.com/puckeditor/puck) — Source code, 12.3K stars
- `src/types/blocks.ts` — Existing Indigo block type system (605 lines, 19 block types)
- `src/components/store/blocks/` — Existing 19 block components with variants
- `src/features/store/layout-service.ts` — Existing Supabase persistence layer
- `design-system/indigo/MASTER.md` — Indigo design tokens and patterns
