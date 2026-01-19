# Indigo Visual Editor - Detailed Analysis

## Executive Summary

The Indigo Visual Editor is a sophisticated, real-time storefront builder designed for e-commerce customization. It follows a **WYSIWYG (What You See Is What You Get)** approach similar to Shopify's Online Store Editor, prioritizing visual feedback and immediate preview over form-based content management.

**Key Differentiator**: Unlike traditional CMS editors (PayloadCMS, Sanity), Indigo renders blocks directly in the editor's React tree without iframe isolation, enabling instant updates and eliminating postMessage synchronization overhead.

---

## Architecture Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| State Management | **Zustand** | Client-side reactive state with selectors |
| Immutable Updates | **Immer** | Safe nested state mutations |
| Drag & Drop | **dnd-kit** | Accessible, performant reordering |
| UI Components | **shadcn/ui** | Consistent design system |
| Icons | **Hugeicons** | Modern icon library |
| Framework | **Next.js 16** | App Router with Cache Components |

### File Structure

```
src/
├── app/(editor)/storefront/
│   ├── visual-editor.tsx          # Main orchestrator component
│   ├── loading.tsx                # Loading skeleton
│   ├── actions.ts                 # Server actions (save, publish)
│   └── components/
│       ├── inline-preview.tsx     # Direct block rendering (primary)
│       ├── live-preview.tsx       # Iframe fallback mode
│       ├── layers-panel.tsx       # Block tree navigation
│       ├── settings-panel.tsx     # Block configuration
│       ├── editor-header.tsx      # Toolbar & actions
│       ├── command-palette.tsx    # ⌘K quick actions
│       ├── block-palette.tsx      # Add block dialog
│       └── focus-preview.tsx      # Single block isolation
│
├── lib/editor/
│   ├── store.ts                   # Zustand store (1256 lines)
│   ├── types.ts                   # TypeScript definitions
│   ├── autosave.ts               # Autosave service
│   ├── clipboard.ts              # System clipboard integration
│   ├── guides.ts                 # Smart alignment guides
│   ├── communication.ts          # iframe postMessage (legacy)
│   ├── fields/                   # Dynamic field system
│   └── hooks/
│       ├── use-autosave.ts       # Autosave hook
│       ├── use-block-clipboard.ts # Copy/paste hook
│       └── use-block-resize.ts   # Resize capabilities
│
└── components/store/blocks/       # Block implementations
    ├── registry.ts               # Block type registry
    ├── header.tsx, hero.tsx...   # Individual blocks
    └── block-action-bar.tsx      # Hover action toolbar
```

---

## State Management

### Zustand Store Architecture

The editor uses a single Zustand store (`useEditorStore`) with ~1256 lines of state and actions, organized into logical sections:

```typescript
interface EditorState {
  // Core block state
  blocks: StoreBlock[]
  selectedBlockId: string | null
  selectedBlockIds: string[]        // Multi-select support
  hoveredBlockId: string | null
  isDirty: boolean
  
  // History (undo/redo)
  history: {
    past: StoreBlock[][]           // Max 50 snapshots
    future: StoreBlock[][]
  }
  
  // Editor modes
  editorMode: 'edit' | 'preview'
  viewport: 'mobile' | 'tablet' | 'desktop'
  focusMode: FocusModeState | null
  
  // Drag & drop
  activeDragId: string | null
  overBlockId: string | null
  activeGuides: Guide[]            // Smart alignment
  snappingEnabled: boolean
  
  // Autosave
  autosaveStatus: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  lastAutosaveAt: Date | null
  
  // Clipboard
  clipboardBlock: ClipboardBlockState | null
  copiedStyles: CopiedStyles | null
  
  // Inline editing
  inlineEdit: InlineEditState | null
}
```

### Key Store Actions

| Category | Actions |
|----------|---------|
| **Selection** | `selectBlock`, `selectBlocks`, `addToSelection`, `toggleSelection`, `clearSelection`, `selectAll` |
| **Block CRUD** | `addBlock`, `addBlockByType`, `removeBlock`, `duplicateBlock`, `updateBlock`, `updateBlockSettings` |
| **Reordering** | `moveBlock`, `moveSelectedBlocks` |
| **History** | `undo`, `redo` (50-step limit) |
| **Clipboard** | `copyBlock`, `pasteBlock`, `copyBlockStyles`, `pasteBlockStyles` |
| **Visibility** | `toggleBlockVisibility`, `toggleBlockLock` |
| **Grouping** | `groupSelectedBlocks`, `ungroupBlock` |
| **Nested Blocks** | `addBlockToContainer`, `moveBlockToContainer`, `removeBlockFromContainer` |
| **Responsive** | `setBlockResponsiveVisibility`, `setBlockCustomClass` |

### Selector Pattern

The store exports memoized selectors for performance:

```typescript
// Basic selectors
export const selectBlocks = (state: EditorStore) => state.blocks
export const selectSelectedBlockId = (state: EditorStore) => state.selectedBlockId

// Derived selectors (use with shallow comparison)
export const selectSelectedBlock = (state: EditorStore) => 
  state.selectedBlockId ? state.blocks.find(b => b.id === state.selectedBlockId) : null

// Factory selectors for specific blocks
export const createBlockSelector = (blockId: string) => (state: EditorStore) => 
  state.blocks.find(b => b.id === blockId)
```

---

## UI/UX Analysis

### Layout Structure

The editor uses a **3-column layout**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Editor Header (40px)                      │
│  [← Back] [Store Name] [Status] │ [Undo/Redo] [Mode] [Viewport] │ [Save] [Publish] │
├──────────┬────────────────────────────────────────┬─────────────┤
│          │                                        │             │
│  Layers  │           Inline Preview               │  Settings   │
│  Panel   │                                        │   Panel     │
│  (240px) │         (Flexible width)               │  (280px)    │
│          │                                        │             │
│  • Tree  │  ┌────────────────────────────────┐   │  • Variant  │
│  • Search│  │     Browser Chrome (desktop)   │   │  • Fields   │
│  • DnD   │  ├────────────────────────────────┤   │  • Advanced │
│          │  │                                │   │  • Actions  │
│          │  │     Block 1 (Header)           │   │             │
│          │  │     Block 2 (Hero)             │   │             │
│          │  │     Block 3 (Products)         │   │             │
│          │  │     ...                        │   │             │
│          │  │                                │   │             │
│          │  └────────────────────────────────┘   │             │
│          │                                        │             │
└──────────┴────────────────────────────────────────┴─────────────┘
```

### Layers Panel (Left - 240px)

**Purpose**: Block tree navigation and reordering

**Features**:
- Hierarchical tree view with expand/collapse for containers
- Search/filter blocks by name
- Drag-and-drop reordering with dnd-kit
- Visual indicators: color bars, visibility icons, lock icons
- Context menu: Edit, Focus Mode, Hide/Show, Lock, Copy Styles, Duplicate, Move, Remove
- Multi-select support (Shift+click, Cmd+click)
- Keyboard navigation (↑↓ arrows, Enter to select)

**UX Highlights**:
- Compact 7px row height for dense information
- Color-coded block type indicators
- Hover actions for quick visibility toggle
- Footer shows selection count and keyboard hints

### Inline Preview (Center)

**Purpose**: Real-time WYSIWYG preview with direct manipulation

**Key Innovation**: Blocks render directly in React tree (no iframe), enabling:
- Instant state updates via Zustand subscription
- No postMessage synchronization delay
- Shared React context (cart, theme)
- Direct DOM access for selection overlays

**Features**:
- Viewport simulation (Desktop 1440px, Tablet 768px, Mobile 375px)
- Browser chrome decoration (traffic lights, URL bar)
- Zoom controls (25% - 150%, pinch-to-zoom)
- Smart alignment guides during drag
- Block selection overlays with action bar
- Drop indicators with ghost preview
- Hidden block overlay

**Interaction States**:
```
┌─────────────────────────────────────┐
│ [Block Type Label]    [Action Bar] │  ← Appears on hover/select
├─────────────────────────────────────┤
│                                     │
│         Block Content               │  ← pointer-events: none
│                                     │
└─────────────────────────────────────┘
  ↑ Drag handle (left side)
```

### Settings Panel (Right - 280px)

**Purpose**: Block configuration and properties

**Sections**:
1. **Header**: Block switcher dropdown, visibility toggle, close button
2. **Variant Picker**: Grid of layout options (if multiple variants)
3. **Settings Fields**: Auto-generated from field schema
4. **Advanced**: Responsive visibility, custom CSS class, lock toggle
5. **Footer**: Duplicate and Remove actions

**Field Types Supported**:
- Text, Textarea, Rich Text
- Number, Range
- Select, Multi-select
- Color picker
- Image upload
- Toggle/Switch
- Array (repeatable items)

**Multi-Select State**: When multiple blocks selected, shows bulk actions (Duplicate All, Remove All) instead of settings.

### Editor Header

**Left Section**:
- Back to Dashboard
- Store name with status indicator (Unsaved/Draft/Live)
- Presets, Save Preset, Start Fresh buttons

**Center Section**:
- Undo/Redo buttons
- Edit/Preview mode toggle
- Viewport switcher (Desktop/Tablet/Mobile)
- Zoom controls
- Snapping toggle

**Right Section**:
- View live store / Preview draft
- Keyboard shortcuts dialog
- Save button with autosave indicator
- Publish dropdown

---

## Feature Analysis

### 1. Autosave System

**Implementation**: `useAutosave` hook + `AutosaveService`

```typescript
// Debounced autosave (3 seconds default)
const autosave = useAutosave({
  onSave: async () => {
    await saveAsDraft(tenantId, storeSlug, { blocks })
  },
  config: { debounceMs: 3000, maxRetries: 3, retryDelayMs: 1000 }
})
```

**Behavior**:
- Starts timer on first change (isDirty → true)
- Resets timer on subsequent changes
- Retries with exponential backoff on failure
- Cancels on manual save
- Shows status in header (pending → saving → saved/error)

### 2. Undo/Redo History

**Implementation**: Array-based snapshots in store

```typescript
history: {
  past: StoreBlock[][]    // Previous states (max 50)
  future: StoreBlock[][]  // Redo stack
}
```

**Behavior**:
- Every mutation pushes current state to `past`
- Undo pops from `past`, pushes current to `future`
- Redo pops from `future`, pushes current to `past`
- History cleared on new mutations after undo

### 3. Clipboard Operations

**Dual Clipboard System**:
1. **In-memory**: Zustand store (`clipboardBlock`)
2. **System**: Browser Clipboard API (cross-tab support)

**Operations**:
- Copy block (⌘C): Stores type, variant, settings, visibility
- Paste block (⌘V): Inserts after selected block or at end
- Copy styles: Extracts style-related settings
- Paste styles: Applies to target block (same type only)

### 4. Multi-Select

**Selection Modes**:
- Click: Replace selection
- Shift+Click: Add to selection
- Cmd/Ctrl+Click: Toggle selection
- ⌘A: Select all

**Bulk Operations**:
- Duplicate selected
- Remove selected
- Move selected (up/down)
- Lock/Unlock selected
- Group selected (⌘G)

### 5. Smart Guides

**Implementation**: `calculateGuides()` in `guides.ts`

**Alignment Types**:
- Edge alignment (left, right, top, bottom)
- Center alignment (horizontal, vertical)
- Container bounds

**Visual Feedback**:
- Colored guide lines during drag
- Magnetic snapping (can be toggled)
- Hold Alt to temporarily disable

### 6. Responsive Visibility

**Per-Block Settings**:
```typescript
responsiveVisibility: {
  mobile: boolean
  tablet: boolean
  desktop: boolean
}
```

**UI**: Three toggle buttons in Settings Panel → Advanced section

### 7. Block Locking

**Behavior**:
- Locked blocks cannot be moved, edited, or deleted
- Visual indicator (lock icon) in layers panel
- Toggle via context menu or Settings Panel

### 8. Focus Mode

**Purpose**: Edit single block in isolation

**Activation**: Double-click in layers panel or context menu

**Features**:
- Full-width preview of single block
- Simplified UI
- Exit via button or Escape

### 9. Command Palette (⌘K)

**Categories**:
- Actions: Save, Publish, Undo, Redo
- Block Actions: Copy, Duplicate, Hide, Move, Delete
- Add Block: All block types
- View: Mode toggle, Viewport, Snapping
- Go to Block: Quick navigation

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K | Command palette |
| ⌘S | Save draft |
| ⌘Z | Undo |
| ⌘⇧Z | Redo |
| ⌘C | Copy block |
| ⌘V | Paste block |
| ⌘D | Duplicate block |
| ⌘H | Toggle visibility |
| ⌘G | Toggle snapping |
| ⌘A | Select all |
| ⌘L | Lock/Unlock |
| 1/2/3 | Desktop/Tablet/Mobile viewport |
| P | Toggle Edit/Preview mode |
| ↑↓ | Navigate blocks |
| ⇧+Click | Add to selection |
| ⌘+Click | Toggle selection |
| Backspace | Delete block |
| Escape | Clear selection / Exit focus mode |
| / | Focus search (in layers panel) |

---

## Strengths

### 1. Performance
- **Direct rendering** eliminates iframe overhead
- **Zustand selectors** prevent unnecessary re-renders
- **React.memo** on block wrappers
- **Immer** for efficient immutable updates

### 2. User Experience
- **Instant feedback** - changes visible immediately
- **Rich interactions** - drag, multi-select, keyboard shortcuts
- **Contextual UI** - action bars appear on hover/select
- **Responsive preview** - test all viewports in-editor

### 3. Developer Experience
- **Type-safe** - Full TypeScript coverage
- **Modular** - Clear separation of concerns
- **Extensible** - Block registry pattern for new blocks
- **Well-documented** - Inline comments with requirement references

### 4. Reliability
- **Autosave** - Never lose work
- **Undo/Redo** - 50-step history
- **Error boundary** - Fallback to iframe on crash
- **Optimistic updates** - Rollback on failure

---

## Areas for Improvement

### 1. Missing Features (vs PayloadCMS)

| Feature | Status | Priority |
|---------|--------|----------|
| Version History | ❌ Not implemented | High |
| Scheduled Publishing | ❌ Not implemented | Medium |
| Media Library | ❌ Not implemented | High |
| Field Validation | ⚠️ Basic only | Medium |
| Collaborative Editing | ❌ Not implemented | Low |
| Content Localization | ❌ Not implemented | Medium |
| Workflow/Approval | ❌ Not implemented | Low |

### 2. UX Improvements

- **Inline text editing**: Currently requires settings panel; could support direct text editing in preview
- **Drag from palette**: Add blocks by dragging from palette to preview
- **Block templates**: Pre-configured block combinations
- **Undo granularity**: Currently saves full state; could be more granular
- **Keyboard focus management**: Could improve accessibility

### 3. Technical Debt

- **Store size**: 1256 lines could be split into slices
- **Selector memoization**: Some derived selectors create new arrays
- **Test coverage**: Property tests exist but unit tests sparse
- **Error handling**: Some silent catches could surface errors

---

## Comparison: Indigo vs PayloadCMS

| Aspect | Indigo | PayloadCMS |
|--------|--------|------------|
| **Approach** | Visual/WYSIWYG | Form-based |
| **Preview** | Inline (same React tree) | Iframe (separate app) |
| **State** | Client-side (Zustand) | Server-side (database) |
| **Updates** | Instant | Requires save + refresh |
| **Target** | E-commerce storefronts | General content |
| **Flexibility** | Fixed block types | Custom field schemas |
| **Learning Curve** | Low (visual) | Medium (config) |

**Verdict**: Indigo's approach is optimal for e-commerce storefront editing where visual feedback and speed are paramount. PayloadCMS excels for complex content structures requiring validation, workflows, and localization.

---

## Recommendations

### Short-term (1-2 weeks)
1. Add **version history** with diff view
2. Implement **media library** for image management
3. Add **field validation** with error messages

### Medium-term (1-2 months)
1. **Scheduled publishing** with calendar UI
2. **Block templates** (pre-configured combinations)
3. **Inline text editing** in preview

### Long-term (3+ months)
1. **Collaborative editing** (real-time cursors)
2. **Content localization** (multi-language)
3. **A/B testing** integration

---

## Conclusion

The Indigo Visual Editor is a well-architected, performant storefront builder that prioritizes user experience through instant visual feedback. Its direct rendering approach (no iframe) is a key differentiator that enables superior responsiveness compared to traditional CMS editors.

The codebase demonstrates strong engineering practices: TypeScript throughout, clear separation of concerns, comprehensive state management, and thoughtful UX details like smart guides and multi-select. The main gaps are in content management features (versioning, media library, scheduling) which would be valuable additions for production use.

**Overall Assessment**: Production-ready for basic storefront editing; needs versioning and media management for enterprise use.
