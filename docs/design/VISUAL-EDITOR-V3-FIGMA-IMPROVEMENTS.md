# Visual Editor V3 - Figma-Inspired Improvements

> **Analysis Date**: January 24, 2026  
> **Persona**: Senior Figma Designer / UX Architect  
> **Status**: Implementation Recommendations

---

## Executive Summary

After comprehensive analysis of the Visual Editor V3 codebase and research into Figma's design patterns (including their UI3 redesign, WebGPU rendering, and interaction patterns), this document provides prioritized improvements to achieve Figma-level polish.

**Current State**: Solid foundation with normalized block data, responsive breakpoints, Zustand state management, and AI integration. Missing micro-interactions, smart guides, and visual polish that make professional tools feel responsive.

---

## Key Figma Patterns to Adopt

### 1. UI3 Design Philosophy (2024)
- **Work center stage**: Minimize UI distractions, maximize canvas space
- **Docked panels**: Fixed panels (not floating) for power users
- **Minimize UI mode**: Collapse panels for distraction-free work
- **Bottom toolbar**: Tools at bottom for vertical space efficiency

### 2. Response Time Hierarchy
| Category | Time | Examples |
|----------|------|----------|
| Instant | 0-16ms | Selection, hover, cursor |
| Fast | 16-100ms | Panel updates, tooltips |
| Animated | 100-300ms | Panel slides, zoom |
| Async | 300ms+ | AI generation, exports |

### 3. Selection State Machine
```
IDLE → HOVER → SELECTED → DRAGGING/RESIZING/EDITING
```

---

## Priority 1: Micro-Interactions (High Impact, Low Effort)

### 1.1 Enhanced Selection States
**Current**: Simple ring with no transition  
**Target**: Figma-style multi-state selection

```tsx
// Selection visual states
const SELECTION_STATES = {
  hover: {
    border: '1px dashed var(--ds-blue-400)',
    background: 'var(--ds-blue-100)',
    backgroundOpacity: 0.2,
    transition: '100ms ease-out',
  },
  selected: {
    border: '2px solid var(--ds-blue-600)',
    background: 'var(--ds-blue-100)',
    backgroundOpacity: 0.1,
    showHandles: true,
    showLabel: true,
  },
  multiSelect: {
    boundingBox: '1px dashed var(--ds-blue-500)',
    individualBorder: '1px solid var(--ds-blue-400)',
    countBadge: true,
  },
  parentHighlight: {
    border: '1px dashed var(--ds-purple-400)',
    // Shows when child is hovered
  },
};
```

### 1.2 Drag Feedback System
**Current**: Simple text label overlay  
**Target**: Full drag preview with drop indicators

```tsx
// Drag phases
const DRAG_PHASES = {
  start: {
    // Element lifts with shadow
    transform: 'scale(1.02)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    opacity: 0.8,
    // Ghost at original position (20% opacity)
  },
  dragging: {
    // Preview follows cursor with 16ms lag
    // Valid drop zones highlight
    // Smart guides appear
  },
  drop: {
    // Snap to position
    // Brief scale animation (1.02 → 1.0, 150ms)
    // Success feedback
  },
  cancel: {
    // Return to original with spring animation
    transition: '200ms ease-out',
  },
};
```

### 1.3 Drop Zone Indicators
```tsx
// Drop indicator component
const DropIndicator = ({ position, isActive }) => (
  <motion.div
    initial={{ scaleX: 0 }}
    animate={{ scaleX: isActive ? 1 : 0 }}
    className={cn(
      "absolute h-0.5 bg-[var(--ds-blue-500)]",
      position === 'before' ? '-top-px' : '-bottom-px'
    )}
  >
    {/* Animated pulse dot */}
    <motion.div
      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
      transition={{ repeat: Infinity, duration: 1 }}
      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--ds-blue-500)]"
    />
  </motion.div>
);
```

---

## Priority 2: Smart Guides & Snapping (High Impact, Medium Effort)

### 2.1 Alignment Guides
- Center alignment (vertical/horizontal)
- Edge alignment (left, right, top, bottom)
- Spacing guides (equal distribution)
- Distance measurement (Alt+hover)

### 2.2 Implementation
```tsx
interface SmartGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  start: number;
  end: number;
  label?: string; // "24px" for spacing
}

const calculateSmartGuides = (
  draggingRect: Rect,
  otherRects: Rect[],
  threshold: number = 8
): SmartGuide[] => {
  const guides: SmartGuide[] = [];
  
  for (const other of otherRects) {
    // Center alignment
    if (Math.abs(draggingRect.centerX - other.centerX) < threshold) {
      guides.push({
        type: 'vertical',
        position: other.centerX,
        start: Math.min(draggingRect.top, other.top),
        end: Math.max(draggingRect.bottom, other.bottom),
      });
    }
    // ... edge alignments, spacing detection
  }
  
  return guides;
};
```

### 2.3 Visual Specs
- Guide color: `var(--ds-blue-500)` at 50%
- Snap threshold: 8px
- Snap feedback: Element "jumps" + guide highlights
- Distance label: Pink background, white text, 10px font

---

## Priority 3: Canvas Experience (High Impact, High Effort)

### 3.1 Zoom & Pan Improvements
**Current**: Basic zoom controls, space+drag pan  
**Target**: Figma-level canvas navigation

```tsx
// Zoom toward cursor (not center)
const zoomToPoint = (point: Point, newScale: number) => {
  const scaleDiff = newScale - transform.scale;
  setTransform({
    scale: newScale,
    x: transform.x - point.x * scaleDiff,
    y: transform.y - point.y * scaleDiff,
  });
};

// Smooth animated zoom
const animatedZoom = (targetScale: number) => {
  const startScale = transform.scale;
  const duration = 200;
  
  animate({
    from: startScale,
    to: targetScale,
    duration,
    easing: 'easeOut',
    onUpdate: (scale) => setTransform({ ...transform, scale }),
  });
};
```

### 3.2 Minimap (Optional)
- Shows full canvas overview
- Viewport indicator (draggable)
- Click to navigate
- Position: Bottom-right corner

### 3.3 Rulers & Guides
- 20px ruler width
- Tick marks: 10px (small), 50px (medium), 100px (large)
- Drag from ruler to create guide
- Double-click guide for exact position
- Right-click: Remove guide

---

## Priority 4: Properties Panel Polish

### 4.1 Section Improvements
- Smooth collapse/expand animations (already implemented ✓)
- Section badges for override counts (already implemented ✓)
- Overflow menu for section actions

### 4.2 Input Enhancements
- Scrubbing: Click+drag on number inputs
- Unit conversion: Type "2rem" → converts to px
- Math expressions: Type "100/2" → 50
- Color picker improvements: Eyedropper, recent colors

### 4.3 Design Token Picker
```tsx
// Token picker for colors
const TokenPicker = ({ value, onChange }) => (
  <Popover>
    <PopoverTrigger>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded border" style={{ background: value }} />
        <span className="text-xs font-mono">{value}</span>
      </div>
    </PopoverTrigger>
    <PopoverContent>
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Design Tokens</div>
        {DESIGN_TOKENS.colors.map(token => (
          <button
            key={token.name}
            onClick={() => onChange(`var(${token.name})`)}
            className="flex items-center gap-2 w-full p-1 rounded hover:bg-accent"
          >
            <div className="w-4 h-4 rounded" style={{ background: token.value }} />
            <span className="text-xs">{token.name}</span>
          </button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);
```

---

## Priority 5: Keyboard & Accessibility

### 5.1 Missing Shortcuts
| Shortcut | Action | Priority |
|----------|--------|----------|
| Arrow keys | Nudge 1px | High |
| Shift+Arrow | Nudge 10px | High |
| ⌘G | Group selection | High |
| ⌘⇧G | Ungroup | High |
| ⌘L/R/C | Align left/right/center | Medium |
| ⌘⇧H/V | Flip horizontal/vertical | Medium |
| ⌘' | Toggle grid | Medium |
| ⌘\\ | Toggle UI | Medium |

### 5.2 Focus Management
- Trap focus in modals/dialogs
- Return focus on close
- Skip to content link
- Visible focus rings (`:focus-visible`)

### 5.3 Screen Reader Support
- Proper ARIA labels on all interactive elements
- Live regions for status updates
- Hierarchical headings
- Accessible tree view for layers

---

## Priority 6: Performance Optimizations

### 6.1 Current Bottlenecks
- ResizeObserver on every selected element
- Full re-render on selection change
- No virtualization for large canvases

### 6.2 Recommended Optimizations
```tsx
// 1. Batch ResizeObserver updates
const batchedResizeObserver = new ResizeObserver(
  debounce((entries) => {
    requestAnimationFrame(() => {
      entries.forEach(entry => updateBounds(entry.target));
    });
  }, 16)
);

// 2. Virtualize large layer trees
const VirtualizedLayerTree = ({ blocks }) => (
  <Virtuoso
    data={flattenTree(blocks)}
    itemContent={(index, item) => <LayerItem {...item} />}
    overscan={10}
  />
);

// 3. Memoize expensive computations
const mergedStyles = useMemo(
  () => mergeResponsiveStyles(block.styles, block.responsiveStyles, breakpoint),
  [block.styles, block.responsiveStyles, breakpoint]
);
```

### 6.3 Performance Targets
| Metric | Current | Target |
|--------|---------|--------|
| Selection response | ~30ms | <16ms |
| Drag frame rate | ~30fps | 60fps |
| Initial render (1K blocks) | ~2000ms | <500ms |
| Memory (1K blocks) | ~80MB | <50MB |

---

## Implementation Roadmap

### Week 1: Micro-Interactions
- [ ] Enhanced selection states (hover, selected, multi-select)
- [x] Drop zone indicators ✅ `DropIndicators.tsx`
- [ ] Drag preview improvements
- [x] Animation timing tokens ✅ Already in `types/selection.ts`
- [x] Floating toolbar ✅ `FloatingToolbar.tsx`

### Week 2: Smart Guides
- [x] Alignment guide calculation ✅ `smart-guides.ts`
- [x] Spacing guide detection ✅ `smart-guides.ts`
- [x] Visual guide rendering ✅ `SmartGuides.tsx`
- [x] Snap-to-guide behavior ✅ `smart-guides.ts`

### Week 3: Canvas Polish
- [ ] Zoom toward cursor
- [ ] Animated zoom transitions
- [ ] Improved pan behavior
- [ ] Grid configuration

### Week 4: Properties & Keyboard
- [x] Input scrubbing ✅ `ScrubInput.tsx`
- [x] Design token picker ✅ `TokenPicker.tsx`
- [ ] Missing keyboard shortcuts
- [ ] Accessibility audit

---

## Files to Modify

### High Priority
1. `src/features/visual-editor-v3/canvas/SelectionOverlay.tsx` - Selection states
2. `src/features/visual-editor-v3/canvas/EditorCanvas.tsx` - Drop indicators, guides ✅ Integrated
3. `src/features/visual-editor-v3/hooks/useCanvasTransform.ts` - Zoom improvements
4. `src/features/visual-editor-v3/hooks/useKeyboardShortcuts.ts` - Missing shortcuts

### Medium Priority
5. `src/features/visual-editor-v3/panels/PropertiesPanel.tsx` - Input enhancements
6. `src/features/visual-editor-v3/panels/LeftSidebarPanel.tsx` - Virtualization
7. `src/features/visual-editor-v3/utils/smart-guides.ts` - ✅ Created

### New Files Created
- ✅ `src/features/visual-editor-v3/canvas/SmartGuides.tsx`
- ✅ `src/features/visual-editor-v3/canvas/DropIndicators.tsx`
- ✅ `src/features/visual-editor-v3/components/TokenPicker.tsx`
- ✅ `src/features/visual-editor-v3/components/ScrubInput.tsx`
- ✅ `src/features/visual-editor-v3/components/FloatingToolbar.tsx`
- ✅ `src/features/visual-editor-v3/hooks/useSmartGuides.ts`
- ✅ `src/features/visual-editor-v3/hooks/useDropIndicators.ts`

### Store Enhancements
- ✅ Added `duplicateBlock` action
- ✅ Added `bringForward` action
- ✅ Added `sendBackward` action
- ✅ Added `bringToFront` action
- ✅ Added `sendToBack` action

---

## References

- [Figma UI3 Design Approach](https://www.figma.com/blog/our-approach-to-designing-ui3/)
- [Figma WebGPU Rendering](https://www.figma.com/blog/figma-rendering-powered-by-webgpu/)
- [Figma Component Architecture](https://www.figma.com/best-practices/component-architecture/)
- [Figma Keyboard Shortcuts](https://help.figma.com/hc/en-us/articles/360040328653)
- [Vercel Web Interface Guidelines](steering file)
- [Vercel Geist Design System](steering file)
