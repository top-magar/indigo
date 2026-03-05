# Figma UI3 Interface Patterns Research

> **Research Date**: January 2025  
> **Source**: Official Figma documentation, UI3 blog posts, help center  
> **Goal**: Extract actionable patterns for Visual Editor V3 improvement  
> **Status**: Complete

---

## Executive Summary

This research synthesizes Figma's UI3 redesign philosophy and interface patterns to provide concrete recommendations for improving the Indigo Visual Editor V3. Figma's approach prioritizes **work center stage**, **minimal UI distractions**, **docked panels**, and **responsive micro-interactions**.

### Key Findings

1. **Canvas-First Philosophy**: Maximize canvas space by minimizing UI chrome
2. **Docked Panels**: Fixed panels (not floating) for power users who spend hours in the tool
3. **Minimize UI Mode**: Collapse all panels for distraction-free work
4. **Bottom Toolbar**: Tools at bottom frees vertical space for canvas
5. **Resizable Panels**: Users control panel widths based on their workflow
6. **Responsive Micro-Interactions**: Every action has immediate, polished feedback
7. **Accessibility First**: Labels, tooltips, and ARIA support from day one

---

## Part 1: Figma UI3 Architecture Overview

### 1.1 Interface Layout (UI3 Standard)

Figma's UI3 introduced a standardized layout across all products (Design, FigJam, Slides):

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Bar (Top)                      │
│  File Name | Branch | Project | Pages | Search              │
├──────────────┬──────────────────────────────┬────────────────┤
│              │                              │                │
│   Left       │                              │     Right      │
│   Panel      │      CANVAS (Center Stage)   │     Panel      │
│              │                              │                │
│ Components   │  ┌──────────────────────┐   │  Properties    │
│ Layers       │  │                      │   │  Design        │
│ Assets       │  │   Your Work Here     │   │  Prototype     │
│              │  │                      │   │  Inspect       │
│              │  └──────────────────────┘   │                │
├──────────────┴──────────────────────────────┴────────────────┤
│                    Toolbar (Bottom)                           │
│  Selection | Shapes | Text | Pen | Comments | Actions | ... │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Decisions

#### Decision 1: Docked Panels (Not Floating)
**Problem**: Floating panels cramped the canvas, especially on smaller screens
**Solution**: Fixed docked panels that are resizable
**Benefit**: Predictable layout, more canvas space, better for power users

```tsx
// Figma's approach: Fixed panels with resize handles
<aside className="fixed left-0 top-0 h-full w-64 border-r">
  {/* Left panel content */}
</aside>

// NOT: Floating panels that appear on hover
// NOT: Panels that hide automatically
```

#### Decision 2: Minimize UI Mode
**Problem**: Users wanted distraction-free work but Hide UI was too blunt
**Solution**: Collapse panels while keeping tools accessible
**Benefit**: Smooth transition, easy to toggle back

```tsx
// Minimize UI: Collapse left/right panels + toolbar
// Keyboard: Shift + \
// Result: Full canvas with panels hidden but accessible
```

#### Decision 3: Bottom Toolbar
**Problem**: Top toolbar took vertical space, especially on laptops
**Solution**: Move tools to bottom, create horizontal toolbar
**Benefit**: Frees vertical space for canvas, standard across Figma products

```
Before (UI2):
┌─────────────────────────────────────┐
│ [Tools] [File] [Edit] [View]        │  ← Takes vertical space
├─────────────────────────────────────┤
│                                     │
│          Canvas Area                │
│                                     │
└─────────────────────────────────────┘

After (UI3):
┌─────────────────────────────────────┐
│                                     │
│          Canvas Area                │  ← More vertical space
│                                     │
├─────────────────────────────────────┤
│ [Selection] [Shapes] [Text] [Tools] │  ← Bottom toolbar
└─────────────────────────────────────┘
```

#### Decision 4: Resizable Panels
**Problem**: One-size-fits-all panel widths didn't work for all workflows
**Solution**: Drag resize handles to adjust panel widths
**Benefit**: Customizable to user preference, supports different screen sizes

```tsx
// Resize handle between panels
<div
  className="w-1 cursor-col-resize hover:bg-blue-500"
  onMouseDown={handleResizeStart}
/>
```

---

## Part 2: Navigation & Organization Patterns

### 2.1 Left Panel Organization (Figma UI3)

Figma reorganized the left panel into a clear hierarchy:

```
┌─ Navigation Panel ─────────────────┐
│                                    │
│ File Name                          │
│ Branch Name (if applicable)        │
│ Project Name                       │
│                                    │
├─ Pages ───────────────────────────┤
│ ▼ Page 1                           │
│ ▼ Page 2                           │
│                                    │
├─ Layers ──────────────────────────┤
│ ▼ Frame 1                          │
│   ├─ Group 1                       │
│   │  ├─ Text                       │
│   │  └─ Button                     │
│   └─ Image                         │
│                                    │
├─ Assets ──────────────────────────┤
│ ▼ Components                       │
│ ▼ Colors                           │
│ ▼ Typography                       │
│                                    │
└────────────────────────────────────┘
```

**Key Insight**: Linear progression (File → Branch → Project → Pages → Layers) makes it easy to add new features without hard tradeoffs.

### 2.2 Right Panel Organization (Figma UI3)

The properties panel was reorganized to prioritize modern workflows:

```
┌─ Properties Panel ─────────────────┐
│                                    │
│ [Selection Actions]                │
│ ┌─ Mask | Component | Boolean ─┐  │
│ └────────────────────────────────┘  │
│                                    │
│ ▼ Design                           │
│   ├─ Layout (Width, Height, Auto)  │
│   ├─ Position (X, Y, Constraints)  │
│   ├─ Appearance (Fill, Stroke)     │
│   ├─ Typography                    │
│   └─ Effects (Shadow, Blur)        │
│                                    │
│ ▼ Prototype                        │
│   ├─ Interactions                  │
│   └─ Animations                    │
│                                    │
│ ▼ Inspect                          │
│   ├─ Code                          │
│   └─ Measurements                  │
│                                    │
└────────────────────────────────────┘
```

**Key Insight**: Component controls moved to top (above color/size) because components became central to design systems.

---

## Part 3: Interaction Patterns

### 3.1 Selection State Machine

Figma uses a clear state machine for selection:

```
IDLE
  ↓ (hover)
HOVER
  ├─ Visual: Dashed border, subtle background
  ├─ Cursor: Pointer
  └─ Feedback: Tooltip on delay
  
  ↓ (click)
SELECTED
  ├─ Visual: Solid border, resize handles, label
  ├─ Cursor: Default
  ├─ Panels: Properties update
  └─ Feedback: Instant
  
  ├─ (drag)
  │ DRAGGING
  │   ├─ Visual: Lifted shadow, ghost at origin
  │   ├─ Cursor: Grabbing
  │   ├─ Feedback: Drop indicators, smart guides
  │   └─ Performance: 60fps
  │
  ├─ (resize handle)
  │ RESIZING
  │   ├─ Visual: Dimension labels, guides
  │   ├─ Cursor: Resize arrow
  │   └─ Feedback: Real-time dimension updates
  │
  └─ (double-click)
    EDITING
      ├─ Visual: Text cursor, inline editing
      ├─ Cursor: Text
      └─ Feedback: Spell check, suggestions
```

### 3.2 Response Time Hierarchy

Figma follows strict response time targets:

| Category | Time | Examples | Feeling |
|----------|------|----------|---------|
| **Instant** | 0-16ms | Selection, hover, cursor change | Immediate |
| **Fast** | 16-100ms | Panel updates, property changes | Responsive |
| **Animated** | 100-300ms | Panel slides, zoom transitions | Smooth |
| **Async** | 300ms+ | AI generation, exports, saves | Background |

**Implementation**:
```tsx
// Instant: Use CSS for hover states
.block:hover {
  border-color: var(--ds-blue-400);
  transition: none; // No transition = instant
}

// Fast: Use requestAnimationFrame for updates
const updateProperties = (block) => {
  requestAnimationFrame(() => {
    setProperties(block.properties);
  });
};

// Animated: Use CSS transitions or Framer Motion
<motion.div
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.2 }}
/>

// Async: Show loading state, don't block UI
const generateText = async () => {
  setLoading(true);
  const result = await api.generate(prompt);
  setLoading(false);
};
```

### 3.3 Keyboard Shortcuts

Figma has 40+ keyboard shortcuts. Key ones for visual editors:

| Shortcut | Action | Category |
|----------|--------|----------|
| ⌘K | Command palette | Navigation |
| ⌘/ | Keyboard shortcuts help | Help |
| Arrow keys | Nudge 1px | Movement |
| Shift+Arrow | Nudge 10px | Movement |
| ⌘G | Group | Organization |
| ⌘⇧G | Ungroup | Organization |
| ⌘D | Duplicate | Editing |
| ⌘C | Copy | Editing |
| ⌘X | Cut | Editing |
| ⌘V | Paste | Editing |
| ⌘Z | Undo | History |
| ⌘⇧Z | Redo | History |
| ⌘L | Align left | Alignment |
| ⌘R | Align right | Alignment |
| ⌘E | Align center | Alignment |
| ⌘⇧H | Flip horizontal | Transform |
| ⌘⇧V | Flip vertical | Transform |
| Space+Drag | Pan canvas | Navigation |
| Scroll | Zoom | Navigation |
| ⌘0 | Zoom to fit | Navigation |
| ⌘1 | Zoom to 100% | Navigation |
| ⌘2 | Zoom to selection | Navigation |

---

## Part 4: Visual Design Patterns

### 4.1 Selection Visualization

Figma's selection uses multiple visual cues:

```
HOVER STATE:
┌─────────────────┐
│ ┌─────────────┐ │  ← Dashed border (1px, blue-400)
│ │             │ │  ← Subtle background (blue-100, 20% opacity)
│ │   Content   │ │
│ │             │ │
│ └─────────────┘ │
└─────────────────┘

SELECTED STATE:
┌─────────────────┐
│ ┌─────────────┐ │  ← Solid border (2px, blue-600)
│ │ ◯ ◯ ◯ ◯ ◯ ◯ │ │  ← Resize handles (6px circles)
│ │ ◯ Content ◯ │ │
│ │ ◯ ◯ ◯ ◯ ◯ ◯ │ │
│ └─────────────┘ │
│ Label: "Button" │  ← Element label
└─────────────────┘

MULTI-SELECT STATE:
┌─────────────────┐
│ ┌─────────────┐ │  ← Bounding box (dashed, blue-500)
│ │ ┌─────────┐ │ │  ← Individual borders (solid, blue-400)
│ │ │ Item 1  │ │ │
│ │ └─────────┘ │ │
│ │ ┌─────────┐ │ │
│ │ │ Item 2  │ │ │
│ │ └─────────┘ │ │
│ └─────────────┘ │
│ [3 items]       │  ← Count badge
└─────────────────┘
```

### 4.2 Drag & Drop Feedback

Figma provides multiple feedback layers during drag:

```
DRAG START:
┌─────────────────┐
│ ┌─────────────┐ │
│ │ ◯ ◯ ◯ ◯ ◯ ◯ │ │  ← Element lifts (scale 1.02, shadow)
│ │ ◯ Content ◯ │ │  ← Ghost at origin (20% opacity)
│ │ ◯ ◯ ◯ ◯ ◯ ◯ │ │
│ └─────────────┘ │
└─────────────────┘

DRAGGING OVER DROP ZONE:
┌─────────────────┐
│ ┌─────────────┐ │
│ │ Item 1      │ │
│ ├─────────────┤ │  ← Drop indicator (animated line)
│ │ Item 2      │ │  ← Valid drop zone highlights
│ │ Item 3      │ │
│ └─────────────┘ │
└─────────────────┘

DROP FEEDBACK:
┌─────────────────┐
│ ┌─────────────┐ │
│ │ Item 1      │ │
│ │ Item 2      │ │  ← Element snaps to position
│ │ Item 3      │ │  ← Brief scale animation (1.02 → 1.0)
│ │ Item 4      │ │  ← Success toast
│ └─────────────┘ │
└─────────────────┘
```

### 4.3 Smart Guides

Figma shows alignment guides during drag:

```
ALIGNMENT GUIDES:
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────┐                        │
│  │ Item 1  │                        │
│  └─────────┘                        │
│                                     │
│  ┌─────────┐                        │
│  │ Item 2  │  ← Vertical guide line │
│  └─────────┘     (blue, 50% opacity)
│                                     │
│  ┌─────────┐                        │
│  │ Item 3  │                        │
│  └─────────┘                        │
│                                     │
└─────────────────────────────────────┘

SPACING GUIDES:
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────┐                        │
│  │ Item 1  │                        │
│  └─────────┘                        │
│      ↕ 24px  ← Distance label       │
│  ┌─────────┐                        │
│  │ Item 2  │                        │
│  └─────────┘                        │
│                                     │
└─────────────────────────────────────┘
```

---

## Part 5: Accessibility & Usability

### 5.1 Labels & Tooltips

Figma UI3 introduced optional labels for clarity:

```tsx
// Property labels can be toggled on/off
// ON: Shows full context
<div className="flex items-center gap-2">
  <label className="text-xs font-medium">Padding</label>
  <input type="number" value={16} />
</div>

// OFF: Icon-only for power users
<div className="flex items-center gap-2">
  <Icon name="padding" />
  <input type="number" value={16} />
</div>

// Tooltip always shows on hover
<Tooltip content="Padding: Space inside the element">
  <Icon name="padding" />
</Tooltip>
```

### 5.2 Accessibility Features

Figma UI3 prioritizes accessibility:

- **Visible labels**: All controls have descriptive labels
- **ARIA support**: Proper roles, labels, and live regions
- **Keyboard navigation**: Tab through all controls
- **Focus management**: Visible focus rings, focus trapping in modals
- **Screen reader support**: Hierarchical structure, meaningful alt text
- **Color contrast**: APCA standards (not just WCAG)

### 5.3 Change Management

Figma's approach to UI changes:

1. **Gradual rollout**: Not all users get UI3 at once
2. **Opt-out option**: Users can revert to old UI during beta
3. **Documentation**: Tutorials and guides available
4. **Feedback loop**: Listen to users, iterate quickly
5. **Deprecation timeline**: Clear path to old UI removal

---

## Part 6: Actionable Recommendations for Visual Editor V3

### 6.1 Immediate Improvements (This Week)

#### 1. Adopt Figma's Panel Layout
```tsx
// Current: Floating panels
// Target: Docked panels like Figma UI3

<div className="flex h-screen">
  {/* Left Panel: Components + Layers (tabbed) */}
  <LeftPanel width={280} />
  
  {/* Canvas: Center stage */}
  <Canvas className="flex-1" />
  
  {/* Right Panel: Properties only */}
  <RightPanel width={280} />
</div>
```

**Status**: ✅ Already implemented in `EditorLayout.tsx`

#### 2. Implement Selection State Machine
```tsx
type SelectionState = 'IDLE' | 'HOVER' | 'SELECTED' | 'DRAGGING' | 'RESIZING' | 'EDITING';

// Visual feedback for each state
const SELECTION_STYLES = {
  HOVER: { border: '1px dashed var(--ds-blue-400)', background: 'rgba(59, 130, 246, 0.1)' },
  SELECTED: { border: '2px solid var(--ds-blue-600)', showHandles: true },
  DRAGGING: { opacity: 0.8, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' },
};
```

**Status**: ✅ Partially implemented in `SelectionOverlay.tsx`

#### 3. Add Animation Timing Tokens
```css
:root {
  --timing-instant: 0ms;
  --timing-micro: 100ms;
  --timing-fast: 150ms;
  --timing-medium: 250ms;
  --easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
}
```

**Status**: ✅ Already in `utils/animations.ts`

### 6.2 Short-Term Improvements (Next 2 Weeks)

#### 4. Enhance Drop Indicators
```tsx
// Current: Simple line
// Target: Animated line with pulse dot

<motion.div
  initial={{ scaleX: 0 }}
  animate={{ scaleX: isActive ? 1 : 0 }}
  className="h-0.5 bg-blue-500"
>
  <motion.div
    animate={{ scale: [1, 1.5, 1] }}
    transition={{ repeat: Infinity }}
    className="w-2 h-2 rounded-full bg-blue-500"
  />
</motion.div>
```

**Status**: ✅ Implemented in `DropIndicators.tsx`

#### 5. Implement Smart Guides
```tsx
// Show alignment guides during drag
const guides = calculateSmartGuides(draggingRect, otherRects);

guides.forEach(guide => (
  <SmartGuide
    type={guide.type}
    position={guide.position}
    label={guide.label}
  />
));
```

**Status**: ✅ Implemented in `SmartGuides.tsx` and `useSmartGuides.ts`

#### 6. Add Missing Keyboard Shortcuts
```tsx
// Arrow keys: Nudge
useHotkeys('ArrowUp', () => nudgeBlock(0, -1));
useHotkeys('Shift+ArrowUp', () => nudgeBlock(0, -10));

// ⌘G: Group
useHotkeys('mod+g', () => groupSelectedBlocks());

// ⌘D: Duplicate
useHotkeys('mod+d', () => duplicateSelectedBlocks());
```

**Status**: ✅ Partially implemented in `useKeyboardShortcuts.ts`

### 6.3 Medium-Term Improvements (Next Month)

#### 7. Minimize UI Mode
```tsx
// Toggle with Shift + \
const [isUIMinimized, setIsUIMinimized] = useState(false);

return (
  <div className={isUIMinimized ? 'hide-panels' : ''}>
    {/* Panels hidden, canvas full width */}
  </div>
);
```

**Status**: ⏳ Not yet implemented

#### 8. Resizable Panels
```tsx
// Drag resize handle to adjust panel width
<div
  className="w-1 cursor-col-resize hover:bg-blue-500"
  onMouseDown={handleResizeStart}
  onMouseMove={handleResizeMove}
  onMouseUp={handleResizeEnd}
/>
```

**Status**: ⏳ Not yet implemented

#### 9. Design Token Picker
```tsx
// Token picker for colors, spacing, typography
<TokenPicker
  value="var(--ds-gray-1000)"
  onChange={setColor}
  tokens={DESIGN_TOKENS}
/>
```

**Status**: ✅ Implemented in `TokenPicker.tsx`

### 6.4 Long-Term Improvements (Next Quarter)

#### 10. Zoom Toward Cursor
```tsx
// Zoom toward cursor, not canvas center
const zoomToPoint = (point: Point, newScale: number) => {
  const scaleDiff = newScale - transform.scale;
  setTransform({
    scale: newScale,
    x: transform.x - point.x * scaleDiff,
    y: transform.y - point.y * scaleDiff,
  });
};
```

**Status**: ⏳ Not yet implemented

#### 11. Minimap
```tsx
// Show full canvas overview in bottom-right
<Minimap
  canvas={canvasRect}
  viewport={viewportRect}
  onNavigate={handleMiniMapClick}
/>
```

**Status**: ⏳ Not yet implemented

#### 12. Rulers & Guides
```tsx
// Drag from ruler to create guide
// Double-click guide for exact position
<Ruler
  orientation="horizontal"
  onDragGuide={handleCreateGuide}
/>
```

**Status**: ⏳ Not yet implemented

---

## Part 7: Implementation Priority Matrix

```
                    LOW EFFORT          HIGH EFFORT
                    ─────────────────────────────────
HIGH IMPACT    │  ✅ Selection states   │  📋 Zoom to cursor │
               │  ✅ Animation tokens   │  📋 Minimap        │
               │  ✅ Keyboard shortcuts │  📋 Rulers/Guides  │
               ├───────────────────────┼───────────────────┤
LOW IMPACT     │  ⏳ Tooltip delays     │  ⏳ WebGPU render  │
               │  ⏳ Cursor changes     │  ⏳ Binary format   │
               │  ⏳ Focus management   │  ⏳ Rust/WASM       │
                    ─────────────────────────────────
```

**Legend**:
- ✅ Already implemented or in progress
- 📋 Plan carefully, high value
- ⏳ Nice to have, lower priority

---

## Part 8: Comparison: Current vs. Figma UI3

| Aspect | Current V3 | Figma UI3 | Gap |
|--------|-----------|-----------|-----|
| **Layout** | Docked panels ✅ | Docked panels ✅ | None |
| **Canvas** | Center stage ✅ | Center stage ✅ | None |
| **Toolbar** | Top + floating | Bottom | Move toolbar to bottom |
| **Selection** | Ring only | Multi-state | Add hover/drag states |
| **Guides** | Smart guides ✅ | Smart guides ✅ | None |
| **Drop indicators** | Animated ✅ | Animated ✅ | None |
| **Keyboard** | Partial | 40+ shortcuts | Add missing shortcuts |
| **Minimize UI** | No | Yes | Add toggle |
| **Resizable panels** | No | Yes | Add resize handles |
| **Token picker** | Yes ✅ | Yes ✅ | None |
| **Zoom to cursor** | No | Yes | Implement |
| **Minimap** | No | Optional | Consider adding |
| **Rulers** | No | Yes | Consider adding |
| **Accessibility** | Good | Excellent | Improve labels/ARIA |

---

## Part 9: Quick Reference: Figma UI3 Patterns

### Navigation Pattern
```
File Name → Branch → Project → Pages → Layers
```

### Selection Pattern
```
IDLE → HOVER → SELECTED → DRAGGING/RESIZING/EDITING
```

### Response Time Pattern
```
Instant (0-16ms) → Fast (16-100ms) → Animated (100-300ms) → Async (300ms+)
```

### Panel Organization Pattern
```
Left: Components + Layers (tabbed)
Center: Canvas (full focus)
Right: Properties only
```

### Keyboard Pattern
```
Navigation: ⌘K, Space+Drag, Scroll
Editing: ⌘C, ⌘X, ⌘V, ⌘Z, ⌘⇧Z
Organization: ⌘G, ⌘⇧G, ⌘D
Alignment: ⌘L, ⌘R, ⌘E
Transform: ⌘⇧H, ⌘⇧V
```

---

## Part 10: Implementation Checklist

### Phase 1: Foundation (Week 1)
- [x] Docked panel layout
- [x] Canvas center stage
- [x] Selection state machine (partial)
- [x] Animation timing tokens
- [x] Drop indicators

### Phase 2: Interactions (Week 2-3)
- [x] Smart guides
- [x] Keyboard shortcuts (partial)
- [x] Drag feedback
- [ ] Minimize UI mode
- [ ] Resizable panels

### Phase 3: Polish (Week 4+)
- [ ] Zoom to cursor
- [ ] Minimap
- [ ] Rulers & guides
- [ ] Accessibility audit
- [ ] Performance optimization

---

## References

1. **Figma UI3 Blog**: https://www.figma.com/blog/our-approach-to-designing-ui3/
2. **Figma UI3 Behind the Scenes**: https://www.figma.com/blog/behind-our-redesign-ui3/
3. **Figma Help: Navigating UI3**: https://help.figma.com/hc/en-us/articles/23954856027159
4. **Figma Keyboard Shortcuts**: https://help.figma.com/hc/en-us/articles/360040328653
5. **Figma Component Architecture**: https://www.figma.com/best-practices/component-architecture/
6. **Vercel Web Interface Guidelines**: Workspace steering file
7. **Vercel Geist Design System**: Workspace steering file

---

## Conclusion

Figma's UI3 redesign provides a proven blueprint for professional design tools. The key principles are:

1. **Work center stage** - Minimize UI distractions
2. **Docked panels** - Fixed, resizable panels for power users
3. **Responsive micro-interactions** - Every action has immediate feedback
4. **Keyboard-first** - 40+ shortcuts for power users
5. **Accessibility first** - Labels, ARIA, and screen reader support
6. **Gradual rollout** - Listen to users, iterate quickly

The Visual Editor V3 has already implemented many of these patterns. The remaining gaps are primarily in:
- Minimize UI mode
- Resizable panels
- Zoom to cursor
- Additional keyboard shortcuts
- Accessibility improvements

By following this roadmap, the Visual Editor V3 can achieve Figma-level polish and usability.
