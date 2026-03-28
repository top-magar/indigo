# Indigo Storefront Editor — Craft.js Architecture Spec

## Research Summary

### Craft.js Core Concepts (v0.2.12, latest stable)
- **`<Editor>`** — context provider, holds all state. Props: `resolver` (component map), `enabled`, `onRender`, `onNodesChange`, `indicator`
- **`<Frame>`** — editable canvas area. Accepts `json` prop to load serialized state
- **`<Element>`** — defines Nodes. `canvas` prop makes it droppable. `is` prop sets component type. `id` required inside user components
- **`useNode()`** — hook inside user components. Provides `connectors.connect`, `connectors.drag`, `actions.setProp`, state collector
- **`useEditor()`** — hook for editor UI. Provides `connectors.create` (toolbox drag), `actions` (delete, deserialize, setOptions), `query` (serialize, node helpers)
- **Related Components** — `Component.craft.related.settings` renders in settings panel. Shares same Node context via `useNode()`
- **Serialization** — `query.serialize()` → JSON string. `actions.deserialize(json)` to load. `<Frame json={json}>` for initial load
- **Rules** — `canDrag`, `canDrop`, `canMoveIn`, `canMoveOut` per component via `Component.craft.rules`
- **Layers** — `@craftjs/layers` package for Photoshop-like layer panel

### React 19 Compatibility
- `@craftjs/core` v0.2.12 lists `react: "^16.8.0 || ^17.0.0 || ^18.0.0"` as peer dep
- Our project uses React 19.2.3 — **may need `--legacy-peer-deps` or `overrides`**
- Craft.js uses `react-dnd` internally which has React 19 support
- Last published: Feb 2025. No official React 19 support yet but community reports it works

### Shopify Editor UX Patterns (what we're targeting)
1. **Left sidebar** — page structure tree (sections/blocks), drag handle to reorder, expand/collapse
2. **Center canvas** — live preview of the page, click to select, inline text editing
3. **Right panel** — settings for selected section/block (appears on selection)
4. **Top bar** — viewport switcher (desktop/tablet/mobile), undo/redo, save/publish, preview link
5. **Section model** — sections are top-level, blocks are nested inside sections. Max 25 sections per page
6. **Add section** — "Add section" button opens a categorized picker modal
7. **Block reordering** — drag handle in sidebar tree, NOT on canvas (Shopify approach)
8. **Inline editing** — click text on canvas to edit directly (contentEditable)

### Wix Editor Patterns (aspirational features)
1. **Pixel-perfect positioning** — absolute positioning within sections (we won't do this — too complex)
2. **Flexbox/Grid controls** — visual layout controls (Phase 3+)
3. **Design panel** — per-element styling (colors, fonts, spacing, effects)
4. **Responsive breakpoints** — separate layouts per viewport

## Architecture Decision

### Editor Shell Layout
```
┌─────────────────────────────────────────────────────┐
│ TopBar: [← Back] [Undo] [Redo] [Desktop|Tablet|Mobile] [Save Draft] [Publish] │
├──────────┬──────────────────────────┬───────────────┤
│ Sidebar  │                          │ Settings      │
│ (240px)  │     Canvas (iframe)      │ Panel (300px) │
│          │                          │               │
│ Sections │   Live preview of page   │ Props for     │
│ tree +   │   with selection chrome  │ selected      │
│ Add btn  │                          │ component     │
│          │                          │               │
├──────────┴──────────────────────────┴───────────────┤
```

### Why NOT iframe for Phase 1
Craft.js doesn't natively support iframe rendering (open issue #16 since 2020). The `onRender` prop wraps elements but stays in the same DOM. We'll render directly in the page (like Craft.js examples) and add iframe isolation in a later phase if needed.

### Component Architecture

```
src/
├── app/(editor)/
│   ├── layout.tsx                    → Auth guard + editor chrome (TopBar)
│   └── storefront/
│       ├── page.tsx                  → Server: fetch layout from Supabase
│       └── editor-client.tsx         → Client: <Editor> + <Frame> + sidebar + settings
│
├── features/editor/
│   ├── components/
│   │   ├── editor-shell.tsx          → Main layout: sidebar | canvas | settings panel
│   │   ├── top-bar.tsx               → Undo/redo, viewport, save/publish
│   │   ├── sidebar/
│   │   │   ├── section-tree.tsx      → Draggable section/block tree (like Shopify left panel)
│   │   │   └── add-section.tsx       → "Add section" button + categorized picker
│   │   ├── settings-panel.tsx        → Renders selected component's .craft.related.settings
│   │   ├── canvas-wrapper.tsx        → Wraps <Frame>, handles selection chrome via onRender
│   │   └── render-node.tsx           → onRender wrapper: selection outline, hover, action bar
│   │
│   ├── blocks/                       → Craft.js user components (NEW — built from scratch)
│   │   ├── text.tsx                  → Inline editable text (contentEditable + useNode)
│   │   ├── image.tsx                 → Image with upload/URL picker
│   │   ├── button.tsx                → CTA button with link
│   │   ├── container.tsx             → Droppable section wrapper (Canvas node)
│   │   ├── columns.tsx               → Multi-column layout (2-4 cols)
│   │   ├── hero.tsx                  → Hero section (variants: full-width, split, minimal)
│   │   ├── header.tsx                → Store header/nav
│   │   ├── footer.tsx                → Store footer
│   │   ├── product-grid.tsx          → Product listing grid
│   │   ├── featured-product.tsx      → Single product spotlight
│   │   ├── testimonials.tsx          → Customer reviews
│   │   ├── trust-signals.tsx         → Trust badges/icons
│   │   ├── newsletter.tsx            → Email signup
│   │   ├── promo-banner.tsx          → Promotional banner with countdown
│   │   ├── faq.tsx                   → FAQ accordion
│   │   ├── video.tsx                 → Video embed
│   │   ├── gallery.tsx               → Image gallery
│   │   ├── contact-info.tsx          → Contact details + map
│   │   ├── rich-text.tsx             → Rich text with TipTap
│   │   └── _shared/
│   │       ├── block-wrapper.tsx     → Common wrapper: connect + drag + selection state
│   │       ├── settings-controls.tsx → Reusable settings UI (color picker, select, slider, etc.)
│   │       └── types.ts             → Shared block prop types
│   │
│   ├── serialization.ts             → Craft.js JSON ↔ Supabase StoreBlock[] adapter
│   ├── actions.ts                    → Server actions: saveDraft, publish
│   └── resolver.ts                   → Component resolver map for <Editor>
│
├── types/blocks.ts                   → Block type definitions (rebuilt for Craft.js)
```

### Data Flow

```
Supabase (store_layouts table)
  ↓ getLayoutForEditing()
  ↓ returns StoreBlock[] (or empty)
  ↓
Server Component (page.tsx)
  ↓ passes blocks to client
  ↓
EditorClient
  ↓ converts StoreBlock[] → Craft.js JSON (or renders default <Frame> children)
  ↓
<Editor resolver={...}>
  <Frame json={craftJson}>
    ... rendered blocks ...
  </Frame>
</Editor>
  ↓
On Save: query.serialize() → deserialize to StoreBlock[] → saveDraft()
On Publish: saveDraft() then publishLayout()
On Load: <Frame json={craftJson}> hydrates from saved state
```

### Serialization Strategy
Craft.js `query.serialize()` produces its own JSON format (node tree with types, props, parent/child refs). We have two options:

**Option A: Store Craft.js JSON directly** ← CHOSEN
- Store the raw Craft.js serialized JSON in `draft_blocks` / `blocks` columns
- Simpler, no conversion layer needed
- The `StoreBlock[]` type becomes the Craft.js serialized format
- Live storefront renderer reads the same JSON and uses `<Render>` or a custom renderer

**Option B: Convert between formats**
- More complex, but decouples storage from editor framework
- Would need bidirectional adapter (like we had with Puck)
- Only worth it if we might switch editors again

### Block Implementation Pattern

Every block follows this pattern:

```tsx
// features/editor/blocks/text.tsx
"use client"
import { useNode, useEditor } from "@craftjs/core"

// 1. The component (renders in canvas)
export const TextBlock = ({ text, fontSize, color, alignment }) => {
  const { connectors: { connect, drag }, isSelected, actions: { setProp } } = useNode((node) => ({
    isSelected: node.events.selected,
  }))

  return (
    <div ref={(ref) => connect(drag(ref))}>
      <p
        contentEditable={isSelected}
        onBlur={(e) => setProp((props) => props.text = e.target.innerText)}
        style={{ fontSize, color, textAlign: alignment }}
      >
        {text}
      </p>
    </div>
  )
}

// 2. Settings panel (renders in right sidebar when selected)
const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div>
      <label>Font Size</label>
      <input type="range" value={props.fontSize} onChange={(e) => setProp(p => p.fontSize = +e.target.value)} />
      <label>Color</label>
      <input type="color" value={props.color} onChange={(e) => setProp(p => p.color = e.target.value)} />
    </div>
  )
}

// 3. Static config
TextBlock.craft = {
  displayName: "Text",
  props: { text: "Edit me", fontSize: 16, color: "#000", alignment: "left" },
  related: { settings: TextSettings },
  rules: { canDrag: () => true },
}
```

### Selection Chrome (onRender)

Craft.js `<Editor onRender={RenderNode}>` wraps every user element. We use this to add:
- Blue outline on hover
- Blue outline + resize handles on select
- Floating action bar (move up/down, duplicate, delete) on select
- Component name badge on hover

```tsx
const RenderNode = ({ render }) => {
  const { id } = useNode()
  const { isHovered, isSelected, node } = useNode((node) => ({
    isHovered: node.events.hovered,
    isSelected: node.events.selected,
    node: node,
  }))

  return (
    <div className={cn(
      "relative",
      isHovered && "outline outline-2 outline-primary/50",
      isSelected && "outline outline-2 outline-primary",
    )}>
      {isSelected && <ActionBar nodeId={id} />}
      {isHovered && !isSelected && <NodeBadge name={node.data.displayName} />}
      {render}
    </div>
  )
}
```

## Build Phases

### Phase 1 — Foundation (current)
- Install `@craftjs/core`
- Editor shell: TopBar + Sidebar + Canvas + Settings Panel (all shadcn/tailwind)
- 3 starter blocks: TextBlock, ImageBlock, ButtonBlock
- Drag from sidebar → canvas
- Click to select → settings panel shows
- Save/load via Craft.js serialize/deserialize + Supabase
- Selection chrome via onRender

### Phase 2 — Core Blocks
- Container (droppable section)
- Columns (2-4 col layout)
- Hero (3 variants)
- Header + Footer
- Rich Text (TipTap inline)

### Phase 3 — Commerce Blocks
- Product Grid (connects to Supabase products)
- Featured Product
- Promo Banner + Countdown
- Newsletter signup

### Phase 4 — Content Blocks
- Testimonials
- Trust Signals
- FAQ
- Video
- Gallery
- Contact Info

### Phase 5 — Polish
- Viewport switcher (desktop/tablet/mobile)
- Undo/redo UI
- Keyboard shortcuts (del, ctrl+z, ctrl+c)
- Block templates/presets
- @craftjs/layers panel
- Live storefront renderer (reads Craft.js JSON, renders without editor)

### Phase 6 — Advanced
- Media library integration (existing Indigo media)
- Product/collection picker fields
- Theme panel (brand colors, fonts)
- SEO panel
- Performance optimization
