# Block Builder Architecture Specification

## Overview

The Block Builder is a simplified, constrained storefront editor that prioritizes ease of use over flexibility. Unlike the full Visual Editor, it focuses on **selection over creation** — merchants pick from pre-designed block variants rather than designing from scratch.

**Design Philosophy:**
- Selection over creation — merchants pick from curated variants
- Smart defaults — every variant looks good out-of-the-box
- Data-driven — blocks pull from store data (products, reviews)
- Mobile-first — all variants are responsive by default
- Brand-aware — variants adapt to store's color scheme

---

## Architecture Comparison

### Block Builder (Tier 1 - Free)
```
┌─────────────────────────────────────────────────────────────┐
│  Simple 2-Panel Layout                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌────────────────────────────────────┐   │
│  │              │  │                                    │   │
│  │  Block List  │  │         Live Preview               │   │
│  │  (Sortable)  │  │         (Read-only)                │   │
│  │              │  │                                    │   │
│  │  + Add Block │  │                                    │   │
│  │              │  │                                    │   │
│  └──────────────┘  └────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Visual Editor (Tier 2 - Pro) [Disabled]
```
┌─────────────────────────────────────────────────────────────┐
│  Complex 3-Panel Layout with Advanced Features               │
├──────────┬────────────────────────────────────┬─────────────┤
│  Layers  │       Interactive Preview          │  Settings   │
│  Panel   │       (Direct manipulation)        │   Panel     │
└──────────┴────────────────────────────────────┴─────────────┘
```

---

## Data Model

### Block JSON Structure (EditorJS-inspired)

```typescript
interface BlockBuilderDocument {
  version: "1.0"
  time: number // Unix timestamp
  blocks: BuilderBlock[]
  metadata: {
    storeId: string
    tenantId: string
    status: "draft" | "published"
    lastPublishedAt?: string
  }
}

interface BuilderBlock {
  id: string                    // UUID
  type: BlockType               // "hero" | "product-grid" | etc.
  variant: string               // "full-width" | "split" | etc.
  data: Record<string, unknown> // Block-specific settings
  order: number                 // Position in list
  visible: boolean              // Show/hide toggle
}
```

### Example Document

```json
{
  "version": "1.0",
  "time": 1704672000000,
  "blocks": [
    {
      "id": "block_abc123",
      "type": "header",
      "variant": "classic",
      "data": {
        "logo": "/logo.png",
        "navLinks": [
          { "label": "Shop", "href": "/products" },
          { "label": "About", "href": "/about" }
        ],
        "showSearch": true,
        "sticky": true
      },
      "order": 0,
      "visible": true
    },
    {
      "id": "block_def456",
      "type": "hero",
      "variant": "full-width",
      "data": {
        "headline": "Summer Collection",
        "subheadline": "Discover our latest arrivals",
        "primaryCtaText": "Shop Now",
        "primaryCtaLink": "/collections/summer",
        "backgroundImage": "/hero-summer.jpg",
        "overlayOpacity": 40
      },
      "order": 1,
      "visible": true
    },
    {
      "id": "block_ghi789",
      "type": "product-grid",
      "variant": "standard",
      "data": {
        "collectionId": "col_summer2024",
        "productsToShow": 8,
        "columns": 4,
        "showPrices": true,
        "showQuickAdd": true
      },
      "order": 2,
      "visible": true
    }
  ],
  "metadata": {
    "storeId": "store_xyz",
    "tenantId": "tenant_123",
    "status": "draft"
  }
}
```

---

## Component Architecture

### Directory Structure

```
src/features/block-builder/
├── index.ts                      # Public exports
├── types.ts                      # TypeScript definitions
│
├── store/
│   └── builder-store.ts          # Zustand store (simplified)
│
├── components/
│   ├── block-builder.tsx         # Main orchestrator
│   ├── block-list/
│   │   ├── block-list.tsx        # Sortable block list
│   │   ├── block-list-item.tsx   # Individual block row
│   │   └── add-block-button.tsx  # Add new block trigger
│   │
│   ├── block-picker/
│   │   ├── block-picker.tsx      # Block type selection modal
│   │   ├── block-category.tsx    # Category grouping
│   │   └── variant-picker.tsx    # Variant selection grid
│   │
│   ├── block-settings/
│   │   ├── settings-panel.tsx    # Settings sheet/drawer
│   │   ├── settings-form.tsx     # Auto-generated form
│   │   └── field-renderers/      # Field type components
│   │       ├── text-field.tsx
│   │       ├── image-field.tsx
│   │       ├── select-field.tsx
│   │       ├── toggle-field.tsx
│   │       ├── color-field.tsx
│   │       ├── product-picker.tsx
│   │       └── collection-picker.tsx
│   │
│   ├── preview/
│   │   ├── preview-frame.tsx     # Preview container
│   │   └── viewport-switcher.tsx # Desktop/Tablet/Mobile
│   │
│   └── header/
│       ├── builder-header.tsx    # Top toolbar
│       └── publish-button.tsx    # Save/Publish actions
│
├── hooks/
│   ├── use-builder-store.ts      # Store hook
│   ├── use-block-actions.ts      # Block CRUD operations
│   └── use-autosave.ts           # Autosave logic
│
└── utils/
    ├── block-defaults.ts         # Default settings per block type
    ├── block-validation.ts       # Validate block data
    └── block-serialization.ts    # JSON serialization
```

---

## State Management

### Simplified Zustand Store

```typescript
interface BuilderState {
  // Document
  document: BlockBuilderDocument | null
  isDirty: boolean
  
  // UI State
  selectedBlockId: string | null
  isSettingsOpen: boolean
  isBlockPickerOpen: boolean
  viewport: "desktop" | "tablet" | "mobile"
  
  // Save State
  saveStatus: "idle" | "saving" | "saved" | "error"
  lastSavedAt: Date | null
}

interface BuilderActions {
  // Document
  loadDocument: (doc: BlockBuilderDocument) => void
  
  // Block CRUD
  addBlock: (type: BlockType, variant: string, afterId?: string) => void
  updateBlock: (id: string, data: Partial<BuilderBlock>) => void
  removeBlock: (id: string) => void
  reorderBlocks: (activeId: string, overId: string) => void
  duplicateBlock: (id: string) => void
  toggleBlockVisibility: (id: string) => void
  
  // Selection
  selectBlock: (id: string | null) => void
  
  // UI
  openSettings: () => void
  closeSettings: () => void
  openBlockPicker: (afterId?: string) => void
  closeBlockPicker: () => void
  setViewport: (viewport: "desktop" | "tablet" | "mobile") => void
  
  // Persistence
  save: () => Promise<void>
  publish: () => Promise<void>
}
```

---

## UI Components

### 1. Block List (Left Panel)

Simple sortable list showing all blocks:

```
┌─────────────────────────────────┐
│  🏠 Header                   ⋮  │  ← Drag handle, settings menu
├─────────────────────────────────┤
│  🖼️ Hero Section             ⋮  │
├─────────────────────────────────┤
│  📦 Product Grid             ⋮  │
├─────────────────────────────────┤
│  ⭐ Testimonials             ⋮  │
├─────────────────────────────────┤
│  📧 Newsletter               ⋮  │
├─────────────────────────────────┤
│  📋 Footer                   ⋮  │
├─────────────────────────────────┤
│                                 │
│      [+ Add Block]              │
│                                 │
└─────────────────────────────────┘
```

**Features:**
- Drag-and-drop reordering (dnd-kit)
- Click to select and open settings
- Context menu: Edit, Duplicate, Hide, Delete
- Visual indicator for hidden blocks
- Add block button at bottom

### 2. Block Picker Modal

Category-based block selection:

```
┌─────────────────────────────────────────────────────────────┐
│  Add Block                                              ✕   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layout                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │ Header  │ │ Footer  │ │ Section │                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
│                                                             │
│  Content                                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  Hero   │ │Testimon.│ │  Trust  │ │  FAQ    │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  Commerce                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │Featured │ │ Product │ │  Promo  │                       │
│  │ Product │ │  Grid   │ │ Banner  │                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
│                                                             │
│  Engagement                                                 │
│  ┌─────────┐                                               │
│  │Newslett.│                                               │
│  └─────────┘                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Variant Picker (After Block Type Selection)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back    Choose Hero Style                            ✕   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │                   │  │                   │              │
│  │   [Full-Width]    │  │   [Split Layout]  │              │
│  │                   │  │                   │              │
│  │  Full viewport    │  │  50/50 image      │              │
│  │  background       │  │  and content      │              │
│  └───────────────────┘  └───────────────────┘              │
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │                   │  │                   │              │
│  │  [Minimal Text]   │  │ [Product Showcase]│              │
│  │                   │  │                   │              │
│  │  Large typography │  │  Hero with        │              │
│  │  no image         │  │  featured product │              │
│  └───────────────────┘  └───────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Settings Panel (Sheet/Drawer)

```
┌─────────────────────────────────────────────────────────────┐
│  Hero Section Settings                                  ✕   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Variant                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Full-Width Image                              ▼     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Content                                                    │
│                                                             │
│  Headline                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Summer Collection                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Subheadline                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Discover our latest arrivals                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Button Text                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Shop Now                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Button Link                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ /collections/summer                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Background                                                 │
│                                                             │
│  Image                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Upload Image]  or  [Choose from Media]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Overlay Opacity                                            │
│  ○────────────●──────────────────────────────────○  40%    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Duplicate Block]                    [Delete Block]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Block Schema Definition

Each block type defines its configurable fields:

```typescript
interface BlockFieldSchema {
  id: string
  type: "text" | "textarea" | "richtext" | "number" | "select" | 
        "toggle" | "color" | "image" | "product" | "collection" | 
        "link" | "array"
  label: string
  description?: string
  required?: boolean
  default?: unknown
  placeholder?: string
  // Type-specific options
  options?: { value: string; label: string }[]  // for select
  min?: number                                   // for number
  max?: number                                   // for number
  arrayItemSchema?: BlockFieldSchema[]          // for array
}

interface BlockSchema {
  type: BlockType
  name: string
  description: string
  icon: string
  category: "layout" | "content" | "commerce" | "engagement"
  variants: {
    id: string
    name: string
    description: string
    thumbnail: string
  }[]
  fields: {
    [groupName: string]: BlockFieldSchema[]
  }
}
```

### Example: Hero Block Schema

```typescript
const heroSchema: BlockSchema = {
  type: "hero",
  name: "Hero Section",
  description: "First impression, value proposition",
  icon: "Image01Icon",
  category: "content",
  variants: [
    { id: "full-width", name: "Full-Width Image", description: "Full viewport background", thumbnail: "/variants/hero-fullwidth.png" },
    { id: "split", name: "Split Layout", description: "50/50 image and content", thumbnail: "/variants/hero-split.png" },
    { id: "minimal-text", name: "Minimal Text", description: "Large typography, no image", thumbnail: "/variants/hero-minimal.png" },
    { id: "product-showcase", name: "Product Showcase", description: "Hero with featured product", thumbnail: "/variants/hero-product.png" },
  ],
  fields: {
    content: [
      { id: "headline", type: "text", label: "Headline", required: true, default: "Welcome to Our Store", placeholder: "Enter headline..." },
      { id: "subheadline", type: "textarea", label: "Subheadline", default: "Discover amazing products" },
      { id: "primaryCtaText", type: "text", label: "Button Text", default: "Shop Now" },
      { id: "primaryCtaLink", type: "link", label: "Button Link", default: "/products" },
      { id: "secondaryCtaText", type: "text", label: "Secondary Button (optional)" },
      { id: "secondaryCtaLink", type: "link", label: "Secondary Link" },
    ],
    background: [
      { id: "backgroundImage", type: "image", label: "Background Image" },
      { id: "overlayOpacity", type: "number", label: "Overlay Opacity", min: 0, max: 100, default: 40 },
    ],
    layout: [
      { id: "textAlignment", type: "select", label: "Text Alignment", options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ], default: "center" },
      { id: "height", type: "select", label: "Height", options: [
        { value: "full", label: "Full Screen" },
        { value: "large", label: "Large (80vh)" },
        { value: "medium", label: "Medium (60vh)" },
      ], default: "large" },
    ],
  },
}
```

---

## Key Differences from Visual Editor

| Feature | Block Builder | Visual Editor |
|---------|---------------|---------------|
| Layout | 2-panel (list + preview) | 3-panel (layers + preview + settings) |
| Editing | Form-based settings | Direct manipulation + forms |
| Drag & Drop | List reordering only | Canvas positioning |
| Nesting | Flat list (no nesting) | Full container nesting |
| Custom CSS | ❌ Not available | ✅ Per-block CSS |
| Animations | ❌ Not available | ✅ Animation controls |
| Multi-select | ❌ Not available | ✅ Bulk operations |
| Undo/Redo | ❌ Not available | ✅ 50-step history |
| Smart Guides | ❌ Not available | ✅ Alignment guides |
| Keyboard Shortcuts | Basic (save, delete) | Full shortcut system |
| Complexity | Low | High |
| Target User | Merchants | Designers/Developers |

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create `src/features/block-builder/` directory structure
- [ ] Implement simplified Zustand store
- [ ] Create block schema definitions
- [ ] Build settings field renderers

### Phase 2: UI Components (Week 2)
- [ ] Block list with drag-and-drop
- [ ] Block picker modal
- [ ] Variant picker
- [ ] Settings panel/drawer

### Phase 3: Preview & Persistence (Week 3)
- [ ] Preview frame with viewport switching
- [ ] Server actions for save/publish
- [ ] Autosave functionality
- [ ] Loading states and error handling

### Phase 4: Polish & Testing (Week 4)
- [ ] Responsive design
- [ ] Accessibility audit
- [ ] E2E tests
- [ ] Documentation

---

## Migration Path

### Reusable from Visual Editor
- Block components (`src/components/store/blocks/*`)
- Block registry (`src/components/store/blocks/registry.ts`)
- Block types (`src/types/blocks.ts`)
- Server actions (save/publish)

### New Implementation Required
- Simplified store (no history, no multi-select)
- 2-panel layout
- Block picker UI
- Settings panel UI
- Field renderers

### Disabled Features
- Layers panel
- Smart guides
- Multi-select
- Undo/redo
- Custom CSS
- Animations
- Keyboard shortcuts (except basics)

---

## References

- [EditorJS Architecture](https://editorjs.io/base-concepts/) - Block-based JSON output
- [Shopify Section Blocks](https://shopify.dev/docs/storefronts/themes/architecture/blocks/section-blocks) - Schema-driven blocks
- [Notion Data Model](https://www.notion.so/blog/data-model-behind-notion) - Everything is a block
- [WordPress Gutenberg](https://developer.wordpress.org/block-editor/) - React-based block editor
- [dnd-kit](https://dndkit.com/) - Drag and drop for React
