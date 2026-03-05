# Visual Editor V3 - Figma Design Specification

> **Author**: Senior Product Designer Analysis  
> **Date**: January 2025  
> **Version**: 1.0  
> **Status**: Design Recommendations

---

## Executive Summary

This document provides a comprehensive design specification for completing and polishing the Indigo Visual Editor V3, applying Figma's design principles and interaction patterns. The analysis identifies gaps in micro-interactions, visual feedback, canvas experience, and accessibility—with specific, actionable recommendations.

**Current State Assessment**: The editor has a solid foundation with normalized block data, responsive breakpoints, and AI integration. However, it lacks the polish and micro-interactions that make professional creative tools feel responsive and delightful.

---

## Table of Contents

1. [Interaction Design Gaps](#1-interaction-design-gaps)
2. [Visual Hierarchy & Polish](#2-visual-hierarchy--polish)
3. [Canvas Experience](#3-canvas-experience)
4. [Properties Panel UX](#4-properties-panel-ux)
5. [Keyboard & Accessibility](#5-keyboard--accessibility)
6. [Priority UI Components](#6-priority-ui-components)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Interaction Design Gaps

### 1.1 Missing Micro-Interactions

#### **Selection States**

**Current Issue**: Selection uses a simple ring with no transition or visual hierarchy for multi-select.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  SELECTION STATES                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │  Unselected │   │   Hovered   │   │  Selected   │       │
│  │             │   │  ┌───────┐  │   │ ╔═══════╗   │       │
│  │  ┌───────┐  │   │  │ dashed│  │   │ ║ solid ║   │       │
│  │  │       │  │   │  │ blue  │  │   │ ║ blue  ║   │       │
│  │  │       │  │   │  │ 1px   │  │   │ ║ 2px   ║   │       │
│  │  └───────┘  │   │  └───────┘  │   │ ╚═══════╝   │       │
│  │             │   │             │   │  + handles  │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│                                                             │
│  Multi-Select: Blue fill at 5% opacity + solid border      │
│  Parent Highlight: Dashed purple border when child hovered │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Recommendations**:

1. **Hover State** (150ms transition):
   - Dashed border: `1px dashed var(--ds-blue-400)`
   - Background tint: `var(--ds-blue-100)` at 30% opacity
   - Cursor: `pointer` for leaf elements, `move` for containers

2. **Selected State**:
   - Solid border: `2px solid var(--ds-blue-600)`
   - 8 resize handles at corners and edges
   - Label badge positioned `-24px` above element
   - Background: `var(--ds-blue-100)` at 10% opacity

3. **Multi-Select State**:
   - Bounding box around all selected elements
   - Individual elements show lighter selection ring
   - Count badge: "3 selected" in floating toolbar

4. **Parent Highlight**:
   - When hovering a child, show parent with dashed purple border
   - Helps users understand nesting hierarchy

#### **Drag Feedback**

**Current Issue**: Drag overlay is a simple text label. No drop zone indicators.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  DRAG FEEDBACK SYSTEM                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. DRAG PREVIEW                                            │
│     ┌─────────────────┐                                     │
│     │ ░░░░░░░░░░░░░░░ │  Semi-transparent clone             │
│     │ ░░ Section ░░░░ │  50% opacity                        │
│     │ ░░░░░░░░░░░░░░░ │  Slight scale (1.02)               │
│     └─────────────────┘  Shadow: 0 8px 24px rgba(0,0,0,0.2)│
│                                                             │
│  2. DROP INDICATORS                                         │
│     ┌─────────────────┐                                     │
│     │                 │                                     │
│     ├─────────────────┤ ← Blue line (2px) for "before"     │
│     │   Drop Zone     │   Animated pulse effect             │
│     ├─────────────────┤ ← Blue line for "after"            │
│     │                 │                                     │
│     └─────────────────┘                                     │
│                                                             │
│  3. CONTAINER DROP                                          │
│     ┌─────────────────┐                                     │
│     │ ╔═════════════╗ │  Blue dashed border                 │
│     │ ║  Drop Here  ║ │  Background: blue at 5%            │
│     │ ║             ║ │  Label: "Drop inside Section"      │
│     │ ╚═════════════╝ │                                     │
│     └─────────────────┘                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation**:

```tsx
// DragPreview component
const DragPreview = ({ block, isDragging }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ 
      opacity: isDragging ? 0.8 : 0, 
      scale: isDragging ? 1.02 : 0.95 
    }}
    className={cn(
      "pointer-events-none",
      "bg-[var(--ds-background-100)]",
      "border-2 border-[var(--ds-blue-500)]",
      "rounded-lg shadow-2xl"
    )}
  >
    {/* Render block preview */}
  </motion.div>
);

// DropIndicator component
const DropIndicator = ({ position, isActive }) => (
  <motion.div
    initial={{ scaleX: 0 }}
    animate={{ scaleX: isActive ? 1 : 0 }}
    className={cn(
      "absolute h-0.5 bg-[var(--ds-blue-500)]",
      "left-0 right-0",
      position === 'before' ? '-top-px' : '-bottom-px'
    )}
  >
    {/* Animated pulse dot at center */}
    <motion.div
      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
      transition={{ repeat: Infinity, duration: 1 }}
      className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--ds-blue-500)]"
    />
  </motion.div>
);
```

#### **Resize Handles**

**Current Issue**: No resize handles visible on selected elements.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  RESIZE HANDLES                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ●───────────────────●───────────────────●               │
│     │                                       │               │
│     │                                       │               │
│     ●                                       ●               │
│     │         Selected Element              │               │
│     │                                       │               │
│     ●                                       ●               │
│     │                                       │               │
│     │                                       │               │
│     ●───────────────────●───────────────────●               │
│                                                             │
│  Handle Specs:                                              │
│  - Size: 8x8px (touch: 24x24px hit area)                   │
│  - Fill: white                                              │
│  - Border: 1px solid var(--ds-blue-600)                    │
│  - Corner handles: resize cursor (nwse, nesw)              │
│  - Edge handles: resize cursor (ew, ns)                    │
│  - Hover: scale(1.2) + shadow                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Gesture Support

**Missing Gestures**:

| Gesture | Action | Priority |
|---------|--------|----------|
| Pinch-to-zoom | Canvas zoom | High |
| Two-finger pan | Canvas pan | High |
| Double-click | Edit text inline | High |
| Option+drag | Duplicate element | Medium |
| Shift+drag | Constrain to axis | Medium |
| Space+drag | Pan canvas (hand tool) | High |

**Implementation Priority**:

```tsx
// useCanvasGestures hook
const useCanvasGestures = () => {
  // Pinch-to-zoom with wheel event
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(prev => clamp(prev + delta, 0.25, 4));
      }
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
  }, []);

  // Space+drag for panning
  useHotkeys('space', () => setIsPanning(true), { keydown: true });
  useHotkeys('space', () => setIsPanning(false), { keyup: true });
};
```

---

## 2. Visual Hierarchy & Polish

### 2.1 Panel Layout Improvements

**Current Issue**: Panels lack visual depth and clear section separation.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  PANEL VISUAL HIERARCHY                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │ ▼ LAYOUT                          ⋮    │ ← Section      │
│  ├─────────────────────────────────────────┤   header with  │
│  │                                         │   collapse +   │
│  │  Width        Height                    │   overflow     │
│  │  ┌─────────┐  ┌─────────┐              │   menu         │
│  │  │ auto    │  │ 100px   │              │                │
│  │  └─────────┘  └─────────┘              │                │
│  │                                         │                │
│  │  ┌─────────────────────────────────┐   │                │
│  │  │ ▢ ▢ ▢ │ ▢ ▢ ▢ │ ▢ ▢ ▢ │       │   │ ← Segmented   │
│  │  │ Start │Center │ End   │ Space  │   │   control for  │
│  │  └─────────────────────────────────┘   │   alignment    │
│  │                                         │                │
│  ├─────────────────────────────────────────┤ ← Subtle      │
│  │ ▼ FILL                            ⋮    │   divider      │
│  ├─────────────────────────────────────────┤                │
│  │                                         │                │
│  │  ┌──┐ #FFFFFF                     100% │ ← Color with  │
│  │  │██│ ─────────────────────────── ──── │   opacity      │
│  │  └──┘                                   │   slider       │
│  │                                         │                │
│  │  + Add fill                             │ ← Add action  │
│  │                                         │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  Visual Specs:                                              │
│  - Section headers: 11px uppercase, 600 weight             │
│  - Dividers: 1px var(--ds-gray-200)                        │
│  - Input height: 32px (h-8)                                │
│  - Section padding: 12px                                    │
│  - Collapsed indicator: rotate chevron 90°                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Empty States

**Current Issue**: Empty states are minimal text. Need visual guidance.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  EMPTY STATE PATTERNS                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. NO SELECTION                                            │
│     ┌─────────────────────────────────────┐                │
│     │                                     │                │
│     │         ┌─────────────┐             │                │
│     │         │    ◇ ◇ ◇    │             │                │
│     │         │   ◇     ◇   │             │                │
│     │         │    ◇ ◇ ◇    │             │                │
│     │         └─────────────┘             │                │
│     │                                     │                │
│     │      Select an element              │                │
│     │      to edit its properties         │                │
│     │                                     │                │
│     │      ─────── or ───────             │                │
│     │                                     │                │
│     │      [+ Add Element]                │                │
│     │                                     │                │
│     └─────────────────────────────────────┘                │
│                                                             │
│  2. EMPTY CANVAS                                            │
│     ┌─────────────────────────────────────┐                │
│     │                                     │                │
│     │    ┌───────────────────────────┐    │                │
│     │    │                           │    │                │
│     │    │   Drag components here    │    │                │
│     │    │   or use AI to generate   │    │                │
│     │    │                           │    │                │
│     │    │   ┌─────────────────────┐ │    │                │
│     │    │   │ ✨ Generate with AI │ │    │                │
│     │    │   └─────────────────────┘ │    │                │
│     │    │                           │    │                │
│     │    │   ┌─────────────────────┐ │    │                │
│     │    │   │ 📄 Start from       │ │    │                │
│     │    │   │    Template         │ │    │                │
│     │    │   └─────────────────────┘ │    │                │
│     │    │                           │    │                │
│     │    └───────────────────────────┘    │                │
│     │                                     │                │
│     └─────────────────────────────────────┘                │
│                                                             │
│  3. NO SEARCH RESULTS                                       │
│     ┌─────────────────────────────────────┐                │
│     │                                     │                │
│     │         🔍                          │                │
│     │                                     │                │
│     │    No results for "xyz"             │                │
│     │                                     │                │
│     │    Try:                             │                │
│     │    • Different keywords             │                │
│     │    • Fewer filters                  │                │
│     │                                     │                │
│     │    [Clear Search]                   │                │
│     │                                     │                │
│     └─────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Loading States

**Current Issue**: Loading states use simple spinners without skeleton previews.

**Recommendations**:

1. **Skeleton Loaders** for panels:
```tsx
const PanelSkeleton = () => (
  <div className="space-y-3 p-3 animate-pulse">
    <div className="h-4 w-24 bg-[var(--ds-gray-200)] rounded" />
    <div className="space-y-2">
      <div className="h-8 bg-[var(--ds-gray-100)] rounded-md" />
      <div className="h-8 bg-[var(--ds-gray-100)] rounded-md" />
      <div className="h-8 bg-[var(--ds-gray-100)] rounded-md" />
    </div>
    <div className="h-4 w-20 bg-[var(--ds-gray-200)] rounded" />
    <div className="grid grid-cols-2 gap-2">
      <div className="h-8 bg-[var(--ds-gray-100)] rounded-md" />
      <div className="h-8 bg-[var(--ds-gray-100)] rounded-md" />
    </div>
  </div>
);
```

2. **Minimum Loading Duration**: 300ms to prevent flash
3. **Progressive Loading**: Show content as it becomes available
4. **AI Generation Progress**: Show step-by-step progress with estimated time

### 2.4 Visual Feedback During Operations

**Drag Operations**:
```
┌─────────────────────────────────────────────────────────────┐
│  DRAG OPERATION FEEDBACK                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: Drag Start (0ms)                                  │
│  - Element lifts with shadow                                │
│  - Original position shows ghost (20% opacity)              │
│  - Cursor changes to grabbing                               │
│                                                             │
│  Phase 2: Dragging (continuous)                             │
│  - Element follows cursor with 16ms lag (smooth)            │
│  - Valid drop zones highlight                               │
│  - Invalid zones show red indicator                         │
│  - Distance indicator: "↕ 24px" from nearest guide          │
│                                                             │
│  Phase 3: Drop (0ms)                                        │
│  - Element snaps to position                                │
│  - Brief scale animation (1.02 → 1.0)                       │
│  - Success feedback: subtle green flash                     │
│  - Ghost disappears                                         │
│                                                             │
│  Phase 4: Cancel (Escape key)                               │
│  - Element returns to original position                     │
│  - Spring animation (200ms)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Canvas Experience

### 3.1 Zoom & Pan System

**Current Issue**: Zoom controls exist but don't actually transform the canvas. No pan support.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  ZOOM & PAN SYSTEM                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ZOOM CONTROLS                                              │
│  ┌─────────────────────────────────────────┐                │
│  │  [-]  [  100%  ▼]  [+]  │  [⊡]  [⊞]   │                │
│  │   │        │        │      │     │     │                │
│  │   │        │        │      │     └─ Fit all             │
│  │   │        │        │      └─ Fit selection             │
│  │   │        │        └─ Zoom in (+10%)                   │
│  │   │        └─ Dropdown: 25%, 50%, 100%, 200%, 400%      │
│  │   └─ Zoom out (-10%)                                    │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  ZOOM BEHAVIOR                                              │
│  - Zoom toward cursor position (not center)                 │
│  - Smooth animation (200ms ease-out)                        │
│  - Min: 10%, Max: 800%                                      │
│  - Scroll wheel: ±10% per tick                              │
│  - Pinch gesture: continuous                                │
│                                                             │
│  PAN BEHAVIOR                                               │
│  - Space + drag: pan mode                                   │
│  - Middle mouse: pan mode                                   │
│  - Two-finger scroll: pan                                   │
│  - Edge scrolling when dragging near edges                  │
│                                                             │
│  MINIMAP (optional)                                         │
│  ┌─────────────────┐                                        │
│  │ ┌───┐           │  - Shows full canvas                  │
│  │ │ ▢ │           │  - Viewport indicator                 │
│  │ └───┘           │  - Click to navigate                  │
│  │                 │  - Drag viewport                       │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation**:

```tsx
// Canvas transform state
interface CanvasTransform {
  x: number;      // Pan X offset
  y: number;      // Pan Y offset
  scale: number;  // Zoom level (1 = 100%)
}

// Apply transform to canvas
const canvasStyle = {
  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
  transformOrigin: '0 0',
  transition: isAnimating ? 'transform 200ms ease-out' : 'none',
};

// Zoom toward cursor
const zoomToPoint = (point: Point, newScale: number) => {
  const scaleDiff = newScale - transform.scale;
  setTransform({
    scale: newScale,
    x: transform.x - point.x * scaleDiff,
    y: transform.y - point.y * scaleDiff,
  });
};
```

### 3.2 Ruler & Guide System

**Current Issue**: No rulers or guides exist.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  RULER & GUIDE SYSTEM                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──┬──────────────────────────────────────────────────┐    │
│  │  │ 0    100   200   300   400   500   600   700     │    │
│  ├──┼──────────────────────────────────────────────────┤    │
│  │ 0│                                                  │    │
│  │  │     ┌─────────────────────────────────┐          │    │
│  │50│     │                                 │          │    │
│  │  │     │                                 │          │    │
│  │  │─────┼─────────────────────────────────┼──────────│    │
│  │  │     │         ↑                       │          │    │
│  │  │     │      Guide                      │          │    │
│  │  │     │         ↓                       │          │    │
│  │  │─────┼─────────────────────────────────┼──────────│    │
│  │  │     │                                 │          │    │
│  │  │     └─────────────────────────────────┘          │    │
│  │  │                                                  │    │
│  └──┴──────────────────────────────────────────────────┘    │
│                                                             │
│  RULER SPECS                                                │
│  - Width: 20px                                              │
│  - Background: var(--ds-gray-100)                          │
│  - Tick marks: every 10px (small), 50px (medium), 100px    │
│  - Numbers: every 100px, 10px font                         │
│  - Current position indicator: red line                     │
│                                                             │
│  GUIDE CREATION                                             │
│  - Drag from ruler to create guide                          │
│  - Double-click guide to enter exact position               │
│  - Drag guide off canvas to delete                          │
│  - Right-click: "Remove guide", "Remove all guides"         │
│                                                             │
│  GUIDE COLORS                                               │
│  - Default: var(--ds-blue-500) at 50%                      │
│  - Snapping: var(--ds-green-500) (when element snaps)      │
│  - Margin guides: var(--ds-purple-500)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Smart Guides & Spacing Helpers

**Current Issue**: No alignment or spacing guides.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  SMART GUIDES & SPACING                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ALIGNMENT GUIDES                                        │
│     ┌─────────┐                                             │
│     │    A    │                                             │
│     └─────────┘                                             │
│          │                                                  │
│          │ ← Center alignment guide (magenta)               │
│          │                                                  │
│     ┌─────────┐                                             │
│     │    B    │                                             │
│     └─────────┘                                             │
│                                                             │
│  2. SPACING INDICATORS                                      │
│     ┌─────────┐     ┌─────────┐     ┌─────────┐            │
│     │    A    │←24→│    B    │←24→│    C    │            │
│     └─────────┘     └─────────┘     └─────────┘            │
│                                                             │
│     When spacing matches, show pink indicator with value    │
│                                                             │
│  3. DISTANCE MEASUREMENT                                    │
│     ┌─────────┐                                             │
│     │ Selected│                                             │
│     └─────────┘                                             │
│          ↕ 48px  ← Distance to nearest element              │
│     ┌─────────┐                                             │
│     │ Hovered │                                             │
│     └─────────┘                                             │
│                                                             │
│  4. SNAP POINTS                                             │
│     - Element edges                                         │
│     - Element centers                                       │
│     - Parent padding                                        │
│     - Sibling spacing                                       │
│     - Grid lines (if enabled)                               │
│                                                             │
│  SNAP THRESHOLD: 8px                                        │
│  SNAP FEEDBACK: Element "jumps" to guide + guide highlights │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation**:

```tsx
// Smart guide calculation
const calculateSmartGuides = (
  draggingElement: Rect,
  otherElements: Rect[],
  threshold: number = 8
): Guide[] => {
  const guides: Guide[] = [];
  
  for (const other of otherElements) {
    // Horizontal center alignment
    if (Math.abs(draggingElement.centerX - other.centerX) < threshold) {
      guides.push({
        type: 'vertical',
        position: other.centerX,
        start: Math.min(draggingElement.top, other.top),
        end: Math.max(draggingElement.bottom, other.bottom),
      });
    }
    
    // Edge alignments
    // ... left, right, top, bottom edges
    
    // Spacing guides
    // ... equal spacing detection
  }
  
  return guides;
};
```

### 3.4 Canvas Grid

**Current Issue**: Dot grid exists but is not configurable.

**Recommendations**:

```
┌─────────────────────────────────────────────────────────────┐
│  GRID OPTIONS                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Grid Type:  [●] Dots  [ ] Lines  [ ] None                 │
│                                                             │
│  Grid Size:  ┌────────────────────────────────┐            │
│              │ 8px ▼                          │            │
│              └────────────────────────────────┘            │
│              Options: 4, 8, 16, 24, 32, Custom              │
│                                                             │
│  Snap to Grid: [✓]                                         │
│                                                             │
│  Show Grid:    [✓]  (Toggle: ⌘')                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Properties Panel UX

### 4.1 Panel Organization (Figma-Style Tabs)

**Current Issue**: Properties panel has collapsible sections but no top-level organization.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  PROPERTIES PANEL TABS                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │  [Design]  [Prototype]  [Inspect]       │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  For Visual Editor V3, adapt to:                            │
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │  [Style]  [Layout]  [Actions]  [Code]   │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  STYLE TAB                                                  │
│  ├─ Fill (background color, gradients)                      │
│  ├─ Stroke (border)                                         │
│  ├─ Effects (shadow, blur)                                  │
│  └─ Typography (for text elements)                          │
│                                                             │
│  LAYOUT TAB                                                 │
│  ├─ Position (x, y, width, height)                          │
│  ├─ Constraints (responsive behavior)                       │
│  ├─ Auto Layout (flex properties)                           │
│  └─ Spacing (padding, margin, gap)                          │
│                                                             │
│  ACTIONS TAB                                                │
│  ├─ Click actions (navigate, open modal)                    │
│  ├─ Hover effects                                           │
│  └─ Animations                                              │
│                                                             │
│  CODE TAB                                                   │
│  ├─ Generated CSS                                           │
│  ├─ Custom classes                                          │
│  └─ Data bindings                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Inline Editing Patterns

**Current Issue**: All editing happens in the properties panel. No inline editing.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  INLINE EDITING                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. TEXT INLINE EDITING                                     │
│     ┌─────────────────────────────────────┐                │
│     │                                     │                │
│     │   Double-click to edit|             │ ← Cursor       │
│     │                                     │                │
│     └─────────────────────────────────────┘                │
│                                                             │
│     - Double-click enters edit mode                         │
│     - Text cursor appears                                   │
│     - Selection ring changes to text selection              │
│     - Escape or click outside to exit                       │
│     - Enter confirms (for single-line)                      │
│                                                             │
│  2. DIMENSION SCRUBBING                                     │
│     ┌─────────────────────────────────────┐                │
│     │  Width: [←→ 200px]                  │                │
│     └─────────────────────────────────────┘                │
│                                                             │
│     - Click and drag on label to scrub value                │
│     - Shift+drag: 10x increment                             │
│     - Alt+drag: 0.1x increment                              │
│     - Shows live preview while scrubbing                    │
│                                                             │
│  3. COLOR PICKER INLINE                                     │
│     ┌──┐                                                    │
│     │██│ ← Click to open color picker popover              │
│     └──┘                                                    │
│                                                             │
│     ┌─────────────────────────────────────┐                │
│     │  ┌─────────────────────────────┐    │                │
│     │  │                             │    │                │
│     │  │      Color Gradient         │    │                │
│     │  │                             │    │                │
│     │  └─────────────────────────────┘    │                │
│     │  ┌─────────────────────────────┐    │                │
│     │  │ Hue Slider                  │    │                │
│     │  └─────────────────────────────┘    │                │
│     │  ┌─────────────────────────────┐    │                │
│     │  │ Opacity Slider              │    │                │
│     │  └─────────────────────────────┘    │                │
│     │                                     │                │
│     │  Hex: #3B82F6   RGB: 59,130,246    │                │
│     │                                     │                │
│     │  Recent: [■][■][■][■][■]           │                │
│     │  Document: [■][■][■]               │                │
│     └─────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Multi-Select Property Editing

**Current Issue**: Multi-select shows nothing. Should show mixed values.

**Figma Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  MULTI-SELECT EDITING                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Header: "3 elements selected"                              │
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │ ▼ LAYOUT                                │                │
│  ├─────────────────────────────────────────┤                │
│  │                                         │                │
│  │  Width        Height                    │                │
│  │  ┌─────────┐  ┌─────────┐              │                │
│  │  │ Mixed   │  │ 100px   │ ← Same value │                │
│  │  └─────────┘  └─────────┘              │                │
│  │                                         │                │
│  │  Padding                                │                │
│  │  ┌─────────┐                           │                │
│  │  │ ── ──   │ ← Mixed indicator         │                │
│  │  └─────────┘                           │                │
│  │                                         │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  MIXED VALUE BEHAVIOR                                       │
│  - Show "Mixed" or "──" placeholder                         │
│  - Typing a value applies to ALL selected                   │
│  - Clearing resets to individual values                     │
│  - Checkbox: shows indeterminate state (-)                  │
│                                                             │
│  BATCH ACTIONS                                              │
│  ┌─────────────────────────────────────────┐                │
│  │ [Align Left] [Align Center] [Distribute]│                │
│  │ [Same Width] [Same Height] [Same Size]  │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Responsive Property Indicators

**Current Issue**: Breakpoint overrides show a small badge. Need clearer indication.

**Improved Pattern**:
```
┌─────────────────────────────────────────────────────────────┐
│  RESPONSIVE INDICATORS                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │  Width                                  │                │
│  │  ┌─────────────────────────────────┐   │                │
│  │  │ 100%                        [📱] │   │ ← Device icon │
│  │  └─────────────────────────────────┘   │   shows which  │
│  │                                         │   breakpoint   │
│  │  ┌─────────────────────────────────┐   │   has override │
│  │  │ 🖥️ 100%  📱 50%  📱 100%        │   │                │
│  │  └─────────────────────────────────┘   │ ← Hover shows  │
│  │                                         │   all values   │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  VISUAL INDICATORS                                          │
│  - Blue left border: has override for current breakpoint    │
│  - Device icons: 🖥️ desktop, 📱 tablet, 📱 mobile          │
│  - Hover tooltip: shows all breakpoint values               │
│  - Click icon: jump to that breakpoint                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Keyboard & Accessibility

### 5.1 Missing Keyboard Shortcuts

**Current Shortcuts** (implemented):
- `⌘Z` / `⌘⇧Z` - Undo/Redo
- `⌘C` / `⌘X` / `⌘V` - Copy/Cut/Paste
- `Delete` / `Backspace` - Delete selected

**Missing Shortcuts** (priority order):

| Shortcut | Action | Priority |
|----------|--------|----------|
| `⌘D` | Duplicate selection | High |
| `⌘G` | Group selection | High |
| `⌘⇧G` | Ungroup | High |
| `⌘A` | Select all (in parent) | High |
| `⌘⇧A` | Deselect all | High |
| `⌘[` / `⌘]` | Send backward/forward | High |
| `⌘⌥[` / `⌘⌥]` | Send to back/front | Medium |
| `⌘L` | Lock selection | Medium |
| `⌘⇧L` | Unlock all | Medium |
| `⌘H` | Hide selection | Medium |
| `⌘⇧H` | Show all | Medium |
| `⌘K` | Open AI assistant | High |
| `⌘/` | Open command palette | High |
| `⌘'` | Toggle grid | Medium |
| `⌘;` | Toggle guides | Medium |
| `⌘0` | Zoom to 100% | High |
| `⌘1` | Zoom to fit | High |
| `⌘2` | Zoom to selection | High |
| `⌘+` / `⌘-` | Zoom in/out | High |
| `Space` (hold) | Pan mode | High |
| `V` | Select tool | Medium |
| `T` | Text tool | Medium |
| `R` | Rectangle tool | Medium |
| `F` | Frame tool | Medium |
| `↑↓←→` | Nudge 1px | High |
| `⇧↑↓←→` | Nudge 10px | High |
| `Enter` | Edit text (when text selected) | High |
| `Escape` | Exit edit mode / Deselect | High |
| `Tab` | Select next sibling | Medium |
| `⇧Tab` | Select previous sibling | Medium |

### 5.2 Focus Management

**Current Issue**: Focus is not properly managed when switching between panels.

**Recommendations**:

```
┌─────────────────────────────────────────────────────────────┐
│  FOCUS MANAGEMENT                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. FOCUS ZONES                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │ [Header]                                        │     │
│     ├──────────┬─────────────────────┬───────────────┤     │
│     │          │                     │               │     │
│     │  [Left   │     [Canvas]        │   [Right      │     │
│     │  Panel]  │                     │   Panel]      │     │
│     │          │                     │               │     │
│     └──────────┴─────────────────────┴───────────────┘     │
│                                                             │
│     - F6: Cycle between zones                               │
│     - Tab: Navigate within zone                             │
│     - Escape: Return focus to canvas                        │
│                                                             │
│  2. FOCUS INDICATORS                                        │
│     - 2px blue outline on focused element                   │
│     - High contrast mode: 3px black/white outline           │
│     - Skip decorative elements                              │
│                                                             │
│  3. FOCUS TRAPPING                                          │
│     - Modals trap focus                                     │
│     - Dropdowns trap focus                                  │
│     - Return focus to trigger on close                      │
│                                                             │
│  4. ROVING TABINDEX                                         │
│     - Layer tree: arrow keys navigate, Tab exits            │
│     - Component grid: arrow keys navigate                   │
│     - Toolbar: arrow keys between buttons                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Screen Reader Support

**Current Issue**: Limited ARIA labels and live regions.

**Recommendations**:

```tsx
// Layer tree accessibility
<div
  role="tree"
  aria-label="Layer hierarchy"
  aria-activedescendant={selectedId}
>
  <div
    role="treeitem"
    aria-expanded={isExpanded}
    aria-selected={isSelected}
    aria-level={depth}
    aria-setsize={siblingCount}
    aria-posinset={position}
  >
    {/* Layer content */}
  </div>
</div>

// Live region for actions
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>

// Announce actions
const announce = (message: string) => {
  setAnnouncement(message);
  setTimeout(() => setAnnouncement(''), 1000);
};

// Usage
announce('Block duplicated');
announce('3 blocks selected');
announce('Undo: deleted block restored');
```

**Required ARIA Patterns**:

| Component | ARIA Pattern |
|-----------|--------------|
| Layer tree | Tree view |
| Component grid | Grid |
| Properties panel | Form |
| Toolbar | Toolbar |
| Breakpoint tabs | Tablist |
| Color picker | Dialog |
| Dropdown menus | Menu |
| Modals | Dialog |
| Toasts | Alert |

### 5.4 Reduced Motion Support

**Current Issue**: Animations don't respect `prefers-reduced-motion`.

**Implementation**:

```tsx
// CSS approach
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// React hook
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

// Usage in components
const prefersReducedMotion = usePrefersReducedMotion();

<motion.div
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: prefersReducedMotion ? 0 : 0.2 
  }}
/>
```

---

## 6. Priority UI Components

### 6.1 Command Palette (⌘K)

**Priority**: 🔴 Critical

**Description**: Global command interface for quick actions, similar to VS Code/Figma.

```
┌─────────────────────────────────────────────────────────────┐
│  COMMAND PALETTE                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔍 Type a command or search…                    ⌘K │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  RECENT                                             │    │
│  │  ├─ Add Hero Section                          ⌘⇧H  │    │
│  │  ├─ Generate with AI                          ⌘⇧G  │    │
│  │  └─ Export to HTML                            ⌘E   │    │
│  │                                                     │    │
│  │  ACTIONS                                            │    │
│  │  ├─ Duplicate                                 ⌘D   │    │
│  │  ├─ Group Selection                           ⌘G   │    │
│  │  ├─ Ungroup                                   ⌘⇧G  │    │
│  │  ├─ Send to Back                              ⌘[   │    │
│  │  └─ Bring to Front                            ⌘]   │    │
│  │                                                     │    │
│  │  COMPONENTS                                         │    │
│  │  ├─ Section                                         │    │
│  │  ├─ Container                                       │    │
│  │  ├─ Text                                            │    │
│  │  └─ Button                                          │    │
│  │                                                     │    │
│  │  TEMPLATES                                          │    │
│  │  ├─ Landing Page                                    │    │
│  │  ├─ Product Page                                    │    │
│  │  └─ About Page                                      │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  INTERACTION                                                │
│  - ⌘K opens palette                                        │
│  - Type to filter                                           │
│  - ↑↓ to navigate                                          │
│  - Enter to execute                                         │
│  - Escape to close                                          │
│  - Shows keyboard shortcuts inline                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Context Menu (Right-Click)

**Priority**: 🔴 Critical

**Description**: Right-click menu for element-specific actions.

```
┌─────────────────────────────────────────────────────────────┐
│  CONTEXT MENU                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────┐                           │
│  │ Cut                    ⌘X   │                           │
│  │ Copy                   ⌘C   │                           │
│  │ Paste                  ⌘V   │                           │
│  │ Duplicate              ⌘D   │                           │
│  ├─────────────────────────────┤                           │
│  │ Delete                 ⌫    │                           │
│  ├─────────────────────────────┤                           │
│  │ Group Selection        ⌘G   │                           │
│  │ Ungroup               ⌘⇧G   │                           │
│  ├─────────────────────────────┤                           │
│  │ Bring to Front        ⌘]    │                           │
│  │ Bring Forward         ⌘⌥]   │                           │
│  │ Send Backward         ⌘⌥[   │                           │
│  │ Send to Back          ⌘[    │                           │
│  ├─────────────────────────────┤                           │
│  │ Lock                   ⌘L   │                           │
│  │ Hide                   ⌘H   │                           │
│  ├─────────────────────────────┤                           │
│  │ Copy CSS                    │                           │
│  │ Copy as Component           │                           │
│  ├─────────────────────────────┤                           │
│  │ ✨ AI Actions          ▶    │ ← Submenu                 │
│  │   ├─ Improve copy           │                           │
│  │   ├─ Generate variations    │                           │
│  │   └─ Suggest layout         │                           │
│  └─────────────────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Selection Toolbar (Floating)

**Priority**: 🟡 High

**Description**: Floating toolbar that appears above selected elements.

```
┌─────────────────────────────────────────────────────────────┐
│  SELECTION TOOLBAR                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [≡][≡][≡] │ [⬆][⬇] │ [📋][✂][📄] │ [🗑] │ [⋮] │ Section │
│  │  align    │ order  │  clipboard  │ del │more│  type   │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  POSITION                                                   │
│  - Centered above selection                                 │
│  - 8px gap from element                                     │
│  - Flips below if near top edge                            │
│  - Follows selection during drag                            │
│                                                             │
│  RESPONSIVE                                                 │
│  - Collapses to overflow menu on narrow selections          │
│  - Shows most-used actions first                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Breadcrumb Navigation

**Priority**: 🟡 High

**Description**: Shows element hierarchy path, allows quick parent selection.

```
┌─────────────────────────────────────────────────────────────┐
│  BREADCRUMB NAVIGATION                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Page › Section › Container › Text                   │    │
│  │  ↑       ↑          ↑         ↑                     │    │
│  │  │       │          │         └─ Current selection  │    │
│  │  │       │          └─ Click to select parent       │    │
│  │  │       └─ Hover shows outline on canvas           │    │
│  │  └─ Click to select root                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  POSITION                                                   │
│  - Below header, above canvas                               │
│  - Or in properties panel header                            │
│                                                             │
│  INTERACTION                                                │
│  - Click: select that ancestor                              │
│  - Hover: highlight ancestor on canvas                      │
│  - Right-click: context menu for that element               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.5 Quick Insert Menu (+)

**Priority**: 🟡 High

**Description**: Floating "+" button for quick element insertion.

```
┌─────────────────────────────────────────────────────────────┐
│  QUICK INSERT MENU                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Trigger: Click "+" button that appears on hover            │
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │                                         │                │
│  │   ┌─────────────────────────────────┐   │                │
│  │   │         Element                 │   │                │
│  │   └─────────────────────────────────┘   │                │
│  │                  [+]  ← Appears on hover│                │
│  │   ┌─────────────────────────────────┐   │                │
│  │   │         Element                 │   │                │
│  │   └─────────────────────────────────┘   │                │
│  │                                         │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  Menu:                                                      │
│  ┌─────────────────────────────┐                           │
│  │ 🔍 Search components…       │                           │
│  ├─────────────────────────────┤                           │
│  │ ▢ Section                   │                           │
│  │ ▢ Container                 │                           │
│  │ T Text                      │                           │
│  │ ▢ Button                    │                           │
│  │ 🖼 Image                    │                           │
│  ├─────────────────────────────┤                           │
│  │ ✨ Generate with AI…        │                           │
│  └─────────────────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.6 Resize Handles Component

**Priority**: 🔴 Critical

**Description**: Visual handles for resizing selected elements.

```
┌─────────────────────────────────────────────────────────────┐
│  RESIZE HANDLES                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ●───────────────────●───────────────────●               │
│     │                                       │               │
│     │   ┌───────────────────────────────┐   │               │
│     ●   │                               │   ●               │
│     │   │      Selected Element         │   │               │
│     │   │                               │   │               │
│     ●   │                               │   ●               │
│     │   └───────────────────────────────┘   │               │
│     │                                       │               │
│     ●───────────────────●───────────────────●               │
│                                                             │
│  HANDLE SPECS                                               │
│  - Size: 8x8px visual, 24x24px hit area                    │
│  - Fill: white                                              │
│  - Border: 1px var(--ds-blue-600)                          │
│  - Hover: scale(1.2), shadow                               │
│                                                             │
│  CURSORS                                                    │
│  - Corners: nwse-resize, nesw-resize                       │
│  - Edges: ew-resize, ns-resize                             │
│                                                             │
│  CONSTRAINTS                                                │
│  - Shift: maintain aspect ratio                             │
│  - Alt: resize from center                                  │
│  - Shift+Alt: both                                          │
│                                                             │
│  FEEDBACK                                                   │
│  - Show dimensions while resizing: "320 × 240"             │
│  - Snap to guides                                           │
│  - Show smart guides                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.7 Spacing Visualizer

**Priority**: 🟢 Medium

**Description**: Shows padding/margin when hovering or selecting.

```
┌─────────────────────────────────────────────────────────────┐
│  SPACING VISUALIZER                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │
│  │ ░░░ ┌─────────────────────────────────────────┐ ░░░ │    │
│  │ ░░░ │                                         │ ░░░ │    │
│  │ ░░░ │                                         │ ░░░ │    │
│  │ ░░░ │           Content Area                  │ ░░░ │    │
│  │ ░░░ │                                         │ ░░░ │    │
│  │ ░░░ │                                         │ ░░░ │    │
│  │ ░░░ └─────────────────────────────────────────┘ ░░░ │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ░░░ = Padding (green tint)                                │
│  ▓▓▓ = Margin (orange tint)                                │
│                                                             │
│  Shows on:                                                  │
│  - Hover with Alt key held                                  │
│  - When editing spacing in properties                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.8 History Panel

**Priority**: 🟢 Medium

**Description**: Visual undo history with named actions.

```
┌─────────────────────────────────────────────────────────────┐
│  HISTORY PANEL                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │ History                            [×]  │                │
│  ├─────────────────────────────────────────┤                │
│  │                                         │                │
│  │  ● Current State                        │ ← Now         │
│  │  ○ Changed padding                      │                │
│  │  ○ Added Button                         │                │
│  │  ○ Moved Section                        │                │
│  │  ○ Changed background color             │                │
│  │  ○ Added Text                           │                │
│  │  ○ Initial State                        │ ← Start       │
│  │                                         │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  INTERACTION                                                │
│  - Click to jump to that state                              │
│  - Hover shows preview                                      │
│  - States after current are grayed                          │
│  - Making a change clears future states                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.9 Asset Manager

**Priority**: 🟢 Medium

**Description**: Manage images, icons, and other assets.

```
┌─────────────────────────────────────────────────────────────┐
│  ASSET MANAGER                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │ Assets                        [Upload]  │                │
│  ├─────────────────────────────────────────┤                │
│  │ 🔍 Search assets…                       │                │
│  ├─────────────────────────────────────────┤                │
│  │                                         │                │
│  │  IMAGES                                 │                │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │                │
│  │  │ 🖼  │ │ 🖼  │ │ 🖼  │ │ 🖼  │       │                │
│  │  └─────┘ └─────┘ └─────┘ └─────┘       │                │
│  │                                         │                │
│  │  ICONS                                  │                │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐  │                │
│  │  │ ★ │ │ ♥ │ │ ✓ │ │ ✕ │ │ → │ │ ← │  │                │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘  │                │
│  │                                         │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  FEATURES                                                   │
│  - Drag to canvas to insert                                 │
│  - Upload via drag-and-drop                                 │
│  - Search by name                                           │
│  - Filter by type                                           │
│  - Delete unused assets                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.10 Keyboard Shortcuts Panel

**Priority**: 🟢 Medium

**Description**: Searchable list of all keyboard shortcuts.

```
┌─────────────────────────────────────────────────────────────┐
│  KEYBOARD SHORTCUTS                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Keyboard Shortcuts                              [×] │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 🔍 Search shortcuts…                                │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  GENERAL                                            │    │
│  │  ├─ Command Palette              ⌘K                │    │
│  │  ├─ Undo                         ⌘Z                │    │
│  │  ├─ Redo                         ⌘⇧Z               │    │
│  │  └─ Save                         ⌘S                │    │
│  │                                                     │    │
│  │  SELECTION                                          │    │
│  │  ├─ Select All                   ⌘A                │    │
│  │  ├─ Deselect                     ⌘⇧A               │    │
│  │  └─ Select Parent                Escape            │    │
│  │                                                     │    │
│  │  EDITING                                            │    │
│  │  ├─ Copy                         ⌘C                │    │
│  │  ├─ Cut                          ⌘X                │    │
│  │  ├─ Paste                        ⌘V                │    │
│  │  ├─ Duplicate                    ⌘D                │    │
│  │  └─ Delete                       ⌫                 │    │
│  │                                                     │    │
│  │  VIEW                                               │    │
│  │  ├─ Zoom In                      ⌘+                │    │
│  │  ├─ Zoom Out                     ⌘-                │    │
│  │  ├─ Zoom to 100%                 ⌘0                │    │
│  │  └─ Zoom to Fit                  ⌘1                │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Roadmap

### Phase 1: Critical Interactions (Week 1-2)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Resize handles on selection | 🔴 Critical | Medium | High |
| Improved drag preview & drop indicators | 🔴 Critical | Medium | High |
| Context menu (right-click) | 🔴 Critical | Low | High |
| Command palette (⌘K) | 🔴 Critical | Medium | High |
| Working zoom/pan on canvas | 🔴 Critical | High | High |

### Phase 2: Visual Polish (Week 3-4)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Selection states (hover, multi-select) | 🟡 High | Medium | High |
| Empty states with CTAs | 🟡 High | Low | Medium |
| Skeleton loading states | 🟡 High | Low | Medium |
| Breadcrumb navigation | 🟡 High | Low | Medium |
| Selection toolbar (floating) | 🟡 High | Medium | High |

### Phase 3: Canvas Features (Week 5-6)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Rulers | 🟢 Medium | Medium | Medium |
| Smart guides (alignment) | 🟢 Medium | High | High |
| Spacing indicators | 🟢 Medium | Medium | Medium |
| Grid configuration | 🟢 Medium | Low | Low |
| Minimap | 🟢 Medium | Medium | Low |

### Phase 4: Properties & Editing (Week 7-8)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Properties panel tabs | 🟡 High | Medium | Medium |
| Inline text editing | 🟡 High | High | High |
| Multi-select property editing | 🟡 High | Medium | Medium |
| Dimension scrubbing | 🟢 Medium | Medium | Medium |
| Color picker improvements | 🟢 Medium | Medium | Medium |

### Phase 5: Accessibility (Week 9-10)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Complete keyboard shortcuts | 🔴 Critical | Medium | High |
| Focus management | 🟡 High | Medium | High |
| Screen reader support | 🟡 High | High | Medium |
| Reduced motion support | 🟢 Medium | Low | Medium |
| Keyboard shortcuts panel | 🟢 Medium | Low | Low |

### Phase 6: Advanced Features (Week 11-12)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| History panel | 🟢 Medium | Medium | Medium |
| Asset manager | 🟢 Medium | High | Medium |
| Quick insert menu (+) | 🟡 High | Medium | High |
| Spacing visualizer | 🟢 Medium | Medium | Medium |
| Gesture support (pinch, pan) | 🟡 High | Medium | Medium |

---

## Summary

### Top 10 Priorities

1. **Resize Handles** - Users can't resize elements visually
2. **Working Zoom/Pan** - Canvas zoom controls don't transform canvas
3. **Command Palette** - No quick access to actions
4. **Context Menu** - No right-click menu
5. **Drag Feedback** - Poor visual feedback during drag operations
6. **Keyboard Shortcuts** - Missing essential shortcuts (⌘D, ⌘G, etc.)
7. **Selection States** - Hover and multi-select need improvement
8. **Inline Text Editing** - Can't double-click to edit text
9. **Smart Guides** - No alignment helpers
10. **Focus Management** - Accessibility gaps

### Design Principles Applied

1. **Direct Manipulation** - Users should interact directly with elements on canvas
2. **Progressive Disclosure** - Show advanced options only when needed
3. **Immediate Feedback** - Every action should have visual confirmation
4. **Keyboard First** - Power users should never need the mouse
5. **Accessibility by Default** - WCAG 2.1 AA compliance minimum

### Success Metrics

- **Task Completion Time**: Reduce average page creation time by 40%
- **Error Rate**: Reduce undo usage by 25% (fewer mistakes)
- **Keyboard Usage**: 60% of actions should be keyboard-accessible
- **Accessibility Score**: Achieve 100% on axe-core audit
- **User Satisfaction**: Target 4.5/5 on usability surveys

---

*Document prepared following Figma's design principles and Vercel's Geist design system guidelines.*
