# How Figma Would Complete the Indigo Visual Editor V3

> **Multi-Persona Analysis**  
> Compiled from Design Systems Engineer, Frontend Engineer, and Product Designer perspectives  
> January 2025

---

## Executive Summary

This document consolidates recommendations from three Figma team personas on how they would complete and polish the Indigo Visual Editor V3. The analysis reveals that while the editor has a solid foundation (normalized data model, Zustand state management, responsive breakpoints), it needs significant work in **interaction polish**, **performance optimization**, and **design system consistency** to reach professional-grade quality.

---

## 🎨 Product Designer Perspective

### Critical UX Gaps

| Gap | Current State | Figma Standard |
|-----|---------------|----------------|
| **Resize Handles** | None visible | 8 handles (corners + edges) with cursor feedback |
| **Zoom/Pan** | Controls exist but non-functional | Pinch-zoom, Space+drag pan, scroll wheel zoom |
| **Drag Feedback** | Simple text label | Semi-transparent clone + drop indicators |
| **Selection States** | Basic ring | Hover (dashed), Selected (solid + handles), Multi-select (bounding box) |
| **Context Menu** | None | Right-click with common actions |
| **Command Palette** | None | ⌘K quick actions |

### Missing Micro-Interactions

1. **Selection Transitions** - 100ms ease-out for selection ring appearance
2. **Drag Preview** - 50% opacity clone with slight scale (1.02) and shadow
3. **Drop Indicators** - Blue line (2px) with animated pulse dot
4. **Hover States** - Dashed border + 30% background tint
5. **Parent Highlight** - Purple dashed border when child is hovered

### Priority UI Components to Build

1. **ResizeHandles** - 8 handles with proper cursors and touch targets (24px hit area)
2. **CommandPalette** - ⌘K interface with fuzzy search
3. **ContextMenu** - Right-click menu with keyboard shortcuts shown
4. **SmartGuides** - Alignment and spacing indicators during drag
5. **RulerSystem** - Horizontal/vertical rulers with guide creation
6. **BreadcrumbNav** - Parent element navigation
7. **InlineTextEditor** - Double-click to edit text content
8. **MarqueeSelection** - Click-drag to select multiple elements
9. **ZoomControls** - Functional zoom with fit-to-selection
10. **EmptyStates** - Illustrated empty states with CTAs

### Missing Keyboard Shortcuts

```
⌘D        Duplicate selection
⌘G        Group elements
⌘⇧G       Ungroup
⌘[        Send backward
⌘]        Bring forward
⌘⇧[       Send to back
⌘⇧]       Bring to front
⌘K        Command palette
⌘/        Toggle comment
⌘⇧L       Lock/unlock
⌘⇧H       Show/hide
⌘0        Zoom to 100%
⌘1        Zoom to fit
⌘2        Zoom to selection
Space+Drag Pan canvas
⌥+Drag    Duplicate while dragging
⇧+Drag    Constrain to axis
```

---

## 🛠️ Frontend Engineer Perspective

### Performance Bottlenecks

| Issue | Impact | Solution |
|-------|--------|----------|
| No selector memoization | All components re-render on any state change | Granular selectors with `useShallow` |
| Full tree re-render | O(n) on every change | React.memo + virtualization |
| O(n) hit-testing | Slow selection with many elements | R-tree spatial indexing |
| Full state snapshots for undo | Memory bloat | Operation-based history |
| No render batching | Jank during rapid updates | RAF batching |

### Recommended Architecture Changes

#### 1. Granular Selectors (Already Implemented)

```typescript
// ✅ Good - Only re-renders when this specific block changes
export const useBlock = (blockId: BlockId) => 
  useEditorStore(state => state.blocks[blockId]);

// ✅ Good - Efficient selection check
export const useIsBlockSelected = (blockId: BlockId) =>
  useEditorStore(state => state.selectedIds.includes(blockId));
```

#### 2. Computed Tree Cache (Already Implemented)

```typescript
// Pre-computed tree data for O(1) lookups
interface ComputedTreeData {
  depthMap: Map<BlockId, number>;
  ancestorMap: Map<BlockId, BlockId[]>;
  descendantMap: Map<BlockId, Set<BlockId>>;
  flattenedOrder: BlockId[];
}
```

#### 3. Hit-Testing Engine (Already Implemented)

```typescript
// O(log n) hit-testing with spatial indexing
hitTestEngine.hitTest(x, y);           // Find topmost block at point
hitTestEngine.hitTestRect(rect);       // Marquee selection
hitTestEngine.findNearby(x, y, 8);     // Snap-to-guides
```

#### 4. Operation-Based History (To Implement)

```typescript
type Operation =
  | { type: 'ADD_BLOCK'; block: EditorBlock; parentId: BlockId; index: number }
  | { type: 'REMOVE_BLOCK'; block: EditorBlock; parentId: BlockId; index: number }
  | { type: 'MOVE_BLOCK'; blockId: BlockId; from: Location; to: Location }
  | { type: 'UPDATE_CONTENT'; blockId: BlockId; oldContent: any; newContent: any }
  | { type: 'BATCH'; operations: Operation[] };

// Benefits:
// - 70% memory reduction
// - Enables collaborative undo
// - Automatic batching of rapid changes
```

#### 5. Canvas Virtualization (To Implement)

```typescript
// Only render visible blocks
const virtualizer = useVirtualizer({
  count: flattenedBlocks.length,
  getScrollElement: () => containerRef.current,
  estimateSize: (index) => estimateBlockHeight(blocks[flattenedBlocks[index].id]),
  overscan: 5,
});
```

### Performance Targets

| Metric | Current (Est.) | Target |
|--------|----------------|--------|
| Initial render (1000 blocks) | ~2000ms | <200ms |
| Selection change | ~50ms | <16ms |
| Drag frame rate | ~30fps | 60fps |
| Memory (1000 blocks) | ~50MB | <20MB |
| Undo/redo | ~100ms | <16ms |

### Collaborative Editing Foundation

```typescript
// CRDT-based collaboration with Yjs
class CollaborativeEngine {
  private doc: Y.Doc;
  private blocksMap: Y.Map<Y.Map<any>>;
  
  connect(roomId: string) { /* WebSocket connection */ }
  applyLocalChange(blockId: BlockId, updates: Partial<EditorBlock>) { /* ... */ }
  onRemoteChange(callback: (blocks: BlockMap) => void) { /* ... */ }
}
```

---

## 🎯 Design Systems Engineer Perspective

### Block Component Architecture

#### Enhanced Block Definition

```typescript
interface EnhancedBlockDefinition<T = unknown> {
  // Identity
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  category: 'layout' | 'content' | 'media' | 'interactive' | 'commerce';
  
  // Variants (like Figma component variants)
  variants?: BlockVariant[];
  
  // Property panel configuration
  propertyFields: PropertyField[];
  
  // Constraints
  constraints?: {
    canBeRoot?: boolean;
    canHaveChildren?: boolean;
    allowedParents?: BlockType[];
    allowedChildren?: BlockType[];
  };
}
```

#### Standardized Block Props

```typescript
interface BlockComponentProps<TContent = Record<string, unknown>> {
  content: TContent;
  styles: React.CSSProperties;
  isSelected?: boolean;
  isHovered?: boolean;
  isEditing?: boolean;
  children?: React.ReactNode;
  blockId: string;
  blockType: BlockType;
}
```

### Additional Design Tokens

```css
/* Editor-specific tokens */
--editor-selection-color: var(--ds-blue-700);
--editor-selection-bg: var(--ds-blue-100);
--editor-hover-color: var(--ds-gray-alpha-400);
--editor-drop-zone-color: var(--ds-blue-500);
--editor-handle-size: 8px;
--editor-canvas-grid-size: 24px;
--editor-panel-width-left: 280px;
--editor-panel-width-right: 280px;

/* Z-index scale */
--z-canvas: 1;
--z-block: 10;
--z-block-selected: 15;
--z-panel: 20;
--z-header: 30;
--z-overlay: 40;
--z-modal: 50;
--z-drag: 100;
```

### Input Components to Build

| Component | Purpose | API |
|-----------|---------|-----|
| **SpacingInput** | 4-sided padding/margin | `value: SpacingValue, onChange, linked: boolean` |
| **TypographyInput** | Font family, size, weight | `value: TypographyValue, onChange` |
| **BorderInput** | Width, style, color, radius | `value: BorderValue, onChange` |
| **ShadowInput** | Box shadow with presets | `value: string, onChange, presets` |
| **ColorPicker** | OKLCH color picker | `value: string, onChange, showAlpha` |
| **GradientInput** | Linear/radial gradients | `value: GradientValue, onChange` |
| **AITextInput** | Text with AI generation | `value, onChange, onAiGenerate` |

### Theming System

```typescript
interface TenantTheme {
  brand: {
    hue: number;  // 0-360, changes --ds-brand-hue
    name: string;
    logo?: string;
  };
  colors: {
    primary?: string;
    secondary?: string;
    background?: string;
  };
  typography: {
    fontFamily?: string;
    headingFontFamily?: string;
  };
  darkMode: {
    enabled: boolean;
    default?: 'light' | 'dark' | 'system';
  };
}
```

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [x] Granular selectors
- [x] Computed tree cache
- [x] Hit-testing engine
- [ ] Resize handles
- [ ] Working zoom/pan

### Phase 2: Interactions (Weeks 3-4)
- [ ] Command palette (⌘K)
- [ ] Context menu
- [ ] Drag preview + drop indicators
- [ ] Complete keyboard shortcuts
- [ ] Selection state improvements

### Phase 3: Polish (Weeks 5-6)
- [ ] Smart guides
- [ ] Inline text editing
- [ ] Empty states
- [ ] Loading states
- [ ] Focus management

### Phase 4: Performance (Weeks 7-8)
- [ ] Operation-based history
- [ ] Canvas virtualization
- [ ] RAF batching
- [ ] Memory optimization

### Phase 5: Advanced (Weeks 9-12)
- [ ] Ruler system
- [ ] Collaborative editing (CRDT)
- [ ] Version history
- [ ] Comments system

---

## 📁 Files Created/Updated

### Documentation
- `docs/design/VISUAL-EDITOR-V3-FIGMA-DESIGN-SPEC.md` - Product Designer analysis
- `docs/features/visual-editor/FIGMA-STYLE-OPTIMIZATION-GUIDE.md` - Frontend Engineer analysis
- `docs/design-system/VISUAL-EDITOR-V3-DESIGN-SYSTEM-SPEC.md` - Design Systems analysis

### Implementation
- `src/features/visual-editor-v3/store/selectors.ts` - Granular selectors
- `src/features/visual-editor-v3/hooks/useComputedTree.ts` - Tree cache
- `src/features/visual-editor-v3/utils/hit-testing.ts` - Spatial indexing
- `src/features/visual-editor-v3/store/index.ts` - Store exports
- `src/features/visual-editor-v3/hooks/index.ts` - Hooks exports

---

## Summary

The Indigo Visual Editor V3 has a **solid architectural foundation** but needs work in three key areas:

1. **UX Polish** - Missing micro-interactions, keyboard shortcuts, and visual feedback that make professional tools feel responsive
2. **Performance** - Current architecture won't scale to 1000+ elements; needs virtualization, spatial indexing, and operation-based history
3. **Design System** - Need more editor-specific tokens, standardized component APIs, and a proper theming system

The good news: Much of the foundational work (selectors, tree cache, hit-testing) has already been implemented. The next priority should be **resize handles**, **working zoom/pan**, and **command palette** to bring the editor to a usable professional standard.
