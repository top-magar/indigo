# Figma Interaction Patterns Analysis for Indigo Visual Editor V3

> **Author**: Figma Interaction Design Expert Analysis  
> **Date**: January 2025  
> **Version**: 1.0  
> **Status**: Implementation Recommendations

---

## Executive Summary

This document provides a comprehensive analysis of Figma's interaction patterns, derived from research into their multiplayer architecture, component variants system, and WebGPU rendering pipeline. The recommendations are specifically tailored for the Indigo Visual Editor V3, which currently has Zustand state management with temporal middleware, normalized block data, and responsive breakpoints.

**Key Insight**: Figma's success comes from obsessive attention to micro-interactions, sub-16ms response times, and a collaboration-first architecture. The Indigo editor should adopt these patterns progressively.

---

## Table of Contents

1. [Interaction Patterns to Adopt](#1-interaction-patterns-to-adopt)
2. [Selection & Manipulation](#2-selection--manipulation)
3. [Keyboard Shortcuts](#3-keyboard-shortcuts)
4. [Animation Timing](#4-animation-timing)
5. [Collaboration Readiness](#5-collaboration-readiness)

---

## 1. Interaction Patterns to Adopt

### 1.1 Direct Manipulation Philosophy

Figma's core interaction philosophy centers on **direct manipulation**—users interact with objects on the canvas, not through forms or dialogs. Every interaction should feel like physically manipulating objects.

#### Core Principles

| Principle | Figma Implementation | Indigo V3 Recommendation |
|-----------|---------------------|--------------------------|
| **Immediate Feedback** | Every action has visual response within 16ms | Use optimistic updates, RAF batching |
| **Spatial Consistency** | Objects stay where you put them | Maintain transform origin during operations |
| **Reversibility** | Undo/redo for everything | Already implemented via temporal middleware |
| **Discoverability** | Hover states reveal affordances | Add hover indicators for all interactive elements |
| **Constraint Satisfaction** | Smart guides, snapping | Implement alignment guides and snap-to-grid |

#### Interaction Response Time Targets

```
┌─────────────────────────────────────────────────────────────┐
│  RESPONSE TIME HIERARCHY                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INSTANT (0-16ms)                                           │
│  ├─ Selection highlight                                     │
│  ├─ Hover state changes                                     │
│  ├─ Cursor changes                                          │
│  └─ Drag position updates                                   │
│                                                             │
│  FAST (16-100ms)                                            │
│  ├─ Property panel updates                                  │
│  ├─ Layer tree expansion                                    │
│  ├─ Context menu appearance                                 │
│  └─ Tooltip display (after delay)                           │
│                                                             │
│  ANIMATED (100-300ms)                                       │
│  ├─ Panel transitions                                       │
│  ├─ Zoom animations                                         │
│  ├─ Selection ring appearance                               │
│  └─ Drop indicator animations                               │
│                                                             │
│  ASYNC (300ms+)                                             │
│  ├─ AI generation                                           │
│  ├─ Image uploads                                           │
│  ├─ Export operations                                       │
│  └─ Collaboration sync                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Figma's Multiplayer-First Patterns

Based on Figma's architecture research, their system uses:

1. **Write-Ahead Log (Journal)** - Edits saved within 600ms
2. **Sequence Numbers** - For ordering and conflict resolution
3. **Checkpointing** - Every 30-60 seconds to S3
4. **Optimistic Updates** - UI updates immediately, reconciles on server response

#### Patterns to Adopt for Indigo V3

```typescript
// Operation-based state changes (not full snapshots)
interface EditorOperation {
  id: string;
  type: 'ADD' | 'REMOVE' | 'UPDATE' | 'MOVE';
  timestamp: number;
  sequenceNumber: number;
  blockId: BlockId;
  payload: unknown;
  inverse: EditorOperation; // For undo
}

// Optimistic update pattern
const updateBlock = async (blockId: BlockId, updates: Partial<EditorBlock>) => {
  // 1. Apply optimistically
  const previousState = store.getState().blocks[blockId];
  store.setState(state => {
    state.blocks[blockId] = { ...state.blocks[blockId], ...updates };
  });
  
  // 2. Persist to server
  try {
    await api.updateBlock(blockId, updates);
  } catch (error) {
    // 3. Rollback on failure
    store.setState(state => {
      state.blocks[blockId] = previousState;
    });
    toast.error('Failed to save changes');
  }
};
```

### 1.3 Component Variants Pattern

Figma's component variants system provides a model for block variations:

```typescript
// Block variant definition (inspired by Figma)
interface BlockVariant {
  name: string;
  properties: Record<string, string>;
  defaultContent: Record<string, unknown>;
  defaultStyles: React.CSSProperties;
}

interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: LucideIcon;
  category: 'layout' | 'content' | 'media' | 'interactive' | 'commerce';
  
  // Figma-style variants
  variants?: BlockVariant[];
  
  // Property definitions for the panel
  propertyFields: PropertyField[];
  
  // Constraints
  constraints?: {
    canBeRoot?: boolean;
    canHaveChildren?: boolean;
    allowedParents?: BlockType[];
    allowedChildren?: BlockType[];
  };
}

// Example: Button with variants
const buttonDefinition: BlockDefinition = {
  type: 'button',
  label: 'Button',
  icon: MousePointerClick,
  category: 'interactive',
  variants: [
    { name: 'Primary', properties: { variant: 'primary', size: 'md' } },
    { name: 'Secondary', properties: { variant: 'secondary', size: 'md' } },
    { name: 'Ghost', properties: { variant: 'ghost', size: 'md' } },
    { name: 'Primary/Large', properties: { variant: 'primary', size: 'lg' } },
    { name: 'Primary/Small', properties: { variant: 'primary', size: 'sm' } },
  ],
  propertyFields: [
    { name: 'text', type: 'text', label: 'Label' },
    { name: 'variant', type: 'select', options: ['primary', 'secondary', 'ghost'] },
    { name: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
  ],
};
```

---

## 2. Selection & Manipulation

### 2.1 Selection State Machine

Figma uses a sophisticated state machine for selection. Here's the recommended implementation:

```
┌─────────────────────────────────────────────────────────────┐
│  SELECTION STATE MACHINE                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  States:                                                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │   IDLE   │───▶│  HOVER   │───▶│ SELECTED │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │              │               │                      │
│       │              │               ▼                      │
│       │              │         ┌──────────┐                │
│       │              │         │ DRAGGING │                │
│       │              │         └──────────┘                │
│       │              │               │                      │
│       │              │               ▼                      │
│       │              │         ┌──────────┐                │
│       │              │         │ RESIZING │                │
│       │              │         └──────────┘                │
│       │              │               │                      │
│       │              │               ▼                      │
│       │              │         ┌──────────┐                │
│       │              └────────▶│ EDITING  │ (text)         │
│       │                        └──────────┘                │
│       │                                                     │
│       ▼                                                     │
│  ┌──────────┐                                              │
│  │ MARQUEE  │ (click-drag on empty canvas)                 │
│  └──────────┘                                              │
│                                                             │
│  Transitions:                                               │
│  - IDLE → HOVER: mouse enters block bounds                 │
│  - HOVER → SELECTED: click                                 │
│  - SELECTED → DRAGGING: mousedown + mousemove              │
│  - SELECTED → RESIZING: mousedown on handle                │
│  - SELECTED → EDITING: double-click (text blocks)          │
│  - Any → IDLE: click on empty canvas                       │
│  - MARQUEE: click-drag starting on empty canvas            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Implementation

```typescript
type SelectionState = 
  | { type: 'IDLE' }
  | { type: 'HOVER'; blockId: BlockId }
  | { type: 'SELECTED'; blockIds: BlockId[] }
  | { type: 'DRAGGING'; blockIds: BlockId[]; startPos: Point; currentPos: Point }
  | { type: 'RESIZING'; blockId: BlockId; handle: ResizeHandle; startRect: Rect }
  | { type: 'EDITING'; blockId: BlockId }
  | { type: 'MARQUEE'; startPos: Point; currentPos: Point };

// Selection state reducer
function selectionReducer(state: SelectionState, event: SelectionEvent): SelectionState {
  switch (state.type) {
    case 'IDLE':
      if (event.type === 'MOUSE_ENTER_BLOCK') {
        return { type: 'HOVER', blockId: event.blockId };
      }
      if (event.type === 'MOUSE_DOWN_CANVAS') {
        return { type: 'MARQUEE', startPos: event.pos, currentPos: event.pos };
      }
      break;
      
    case 'HOVER':
      if (event.type === 'MOUSE_LEAVE_BLOCK') {
        return { type: 'IDLE' };
      }
      if (event.type === 'CLICK') {
        return { 
          type: 'SELECTED', 
          blockIds: event.shiftKey 
            ? [...(state as any).blockIds || [], state.blockId]
            : [state.blockId]
        };
      }
      break;
      
    case 'SELECTED':
      if (event.type === 'MOUSE_DOWN_BLOCK' && event.blockId) {
        return { 
          type: 'DRAGGING', 
          blockIds: state.blockIds,
          startPos: event.pos,
          currentPos: event.pos
        };
      }
      if (event.type === 'MOUSE_DOWN_HANDLE') {
        return {
          type: 'RESIZING',
          blockId: state.blockIds[0],
          handle: event.handle,
          startRect: event.rect
        };
      }
      if (event.type === 'DOUBLE_CLICK' && isTextBlock(event.blockId)) {
        return { type: 'EDITING', blockId: event.blockId };
      }
      break;
      
    // ... more transitions
  }
  return state;
}
```

### 2.2 Visual Selection Feedback

```
┌─────────────────────────────────────────────────────────────┐
│  SELECTION VISUAL STATES                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. HOVER STATE                                             │
│     ┌─────────────────────────────────────┐                │
│     │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │                │
│     │                                     │                │
│     │ │         Block Content           │ │                │
│     │                                     │                │
│     │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │                │
│     └─────────────────────────────────────┘                │
│                                                             │
│     CSS:                                                    │
│     - Border: 1px dashed var(--ds-blue-400)                │
│     - Background: var(--ds-blue-100) at 20% opacity        │
│     - Transition: 100ms ease-out                           │
│     - Cursor: pointer (leaf) or move (container)           │
│                                                             │
│  2. SELECTED STATE                                          │
│     ●───────────────────●───────────────────●               │
│     │ ╔═══════════════════════════════════╗ │               │
│     │ ║                                   ║ │               │
│     ● ║         Block Content             ║ ●               │
│     │ ║                                   ║ │               │
│     │ ╚═══════════════════════════════════╝ │               │
│     ●───────────────────●───────────────────●               │
│                                                             │
│     CSS:                                                    │
│     - Border: 2px solid var(--ds-blue-600)                 │
│     - Background: var(--ds-blue-100) at 10% opacity        │
│     - 8 resize handles (corners + edges)                   │
│     - Label badge: -24px above, shows block type           │
│                                                             │
│  3. MULTI-SELECT STATE                                      │
│     ┌─────────────────────────────────────────────────┐     │
│     │ ╔═══════════════╗     ╔═══════════════╗         │     │
│     │ ║   Block A     ║     ║   Block B     ║         │     │
│     │ ╚═══════════════╝     ╚═══════════════╝         │     │
│     │                                                 │     │
│     │         ╔═══════════════╗                       │     │
│     │         ║   Block C     ║                       │     │
│     │         ╚═══════════════╝                       │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│     CSS:                                                    │
│     - Bounding box: 1px dashed var(--ds-blue-500)          │
│     - Individual blocks: 1px solid var(--ds-blue-400)      │
│     - Count badge: "3 selected" in floating toolbar        │
│                                                             │
│  4. PARENT HIGHLIGHT (when child is hovered)               │
│     ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│     │                                                 │    │
│     │   ┌─────────────────────────────────────┐       │    │
│     │   │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │       │    │
│     │   │           Hovered Child           │ │       │    │
│     │   │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │       │    │
│     │   └─────────────────────────────────────┘       │    │
│     │                                                 │    │
│     └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                                             │
│     CSS:                                                    │
│     - Parent border: 1px dashed var(--ds-purple-400)       │
│     - Helps understand nesting hierarchy                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Drag & Drop Interaction

```
┌─────────────────────────────────────────────────────────────┐
│  DRAG & DROP PHASES                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PHASE 1: DRAG START (0ms)                                  │
│  ─────────────────────────────────────────────────────────  │
│  Trigger: mousedown + 3px movement threshold                │
│                                                             │
│  Visual Changes:                                            │
│  - Element "lifts" with shadow                              │
│  - Original position shows ghost (20% opacity)              │
│  - Cursor changes to "grabbing"                             │
│  - Disable text selection on document                       │
│                                                             │
│  CSS for drag preview:                                      │
│  ```css                                                     │
│  .drag-preview {                                            │
│    opacity: 0.8;                                            │
│    transform: scale(1.02);                                  │
│    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);              │
│    pointer-events: none;                                    │
│    z-index: var(--z-drag);                                 │
│  }                                                          │
│  ```                                                        │
│                                                             │
│  PHASE 2: DRAGGING (continuous)                             │
│  ─────────────────────────────────────────────────────────  │
│  Update: Every frame (requestAnimationFrame)                │
│                                                             │
│  Visual Changes:                                            │
│  - Preview follows cursor with 16ms lag (smooth)            │
│  - Valid drop zones highlight                               │
│  - Invalid zones show red indicator                         │
│  - Smart guides appear when aligned                         │
│  - Distance indicator: "↕ 24px" from nearest guide          │
│                                                             │
│  Drop Indicators:                                           │
│  ┌─────────────────────────────────────┐                   │
│  │                                     │                   │
│  ├─────────────────────────────────────┤ ← "before" line   │
│  │           Target Block              │                   │
│  ├─────────────────────────────────────┤ ← "after" line    │
│  │                                     │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  Container Drop:                                            │
│  ┌─────────────────────────────────────┐                   │
│  │ ╔═════════════════════════════════╗ │                   │
│  │ ║         Drop Inside             ║ │                   │
│  │ ║    (dashed blue border)         ║ │                   │
│  │ ╚═════════════════════════════════╝ │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  PHASE 3: DROP (0ms)                                        │
│  ─────────────────────────────────────────────────────────  │
│  Trigger: mouseup over valid drop zone                      │
│                                                             │
│  Visual Changes:                                            │
│  - Element snaps to final position                          │
│  - Brief scale animation (1.02 → 1.0, 150ms)               │
│  - Success feedback: subtle green flash (100ms)             │
│  - Ghost disappears                                         │
│  - Re-enable text selection                                 │
│                                                             │
│  PHASE 4: CANCEL (Escape key)                               │
│  ─────────────────────────────────────────────────────────  │
│  Trigger: Escape key or drop outside valid zone             │
│                                                             │
│  Visual Changes:                                            │
│  - Element returns to original position                     │
│  - Spring animation (200ms, ease-out)                       │
│  - Ghost disappears                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Resize Interaction

```
┌─────────────────────────────────────────────────────────────┐
│  RESIZE HANDLES SPECIFICATION                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HANDLE POSITIONS                                           │
│     nw────────────n────────────ne                          │
│     │                          │                           │
│     │                          │                           │
│     w                          e                           │
│     │                          │                           │
│     │                          │                           │
│     sw────────────s────────────se                          │
│                                                             │
│  HANDLE SPECS                                               │
│  ─────────────────────────────────────────────────────────  │
│  Visual size: 8×8px                                         │
│  Hit area: 24×24px (for touch)                             │
│  Fill: white                                                │
│  Border: 1px solid var(--ds-blue-600)                      │
│  Border radius: 1px                                         │
│  Hover: scale(1.2), box-shadow: 0 2px 4px rgba(0,0,0,0.1) │
│                                                             │
│  CURSORS                                                    │
│  ─────────────────────────────────────────────────────────  │
│  nw, se: nwse-resize                                        │
│  ne, sw: nesw-resize                                        │
│  n, s: ns-resize                                            │
│  e, w: ew-resize                                            │
│                                                             │
│  MODIFIER KEYS                                              │
│  ─────────────────────────────────────────────────────────  │
│  Shift: Maintain aspect ratio                               │
│  Alt/Option: Resize from center                             │
│  Shift+Alt: Both constraints                                │
│                                                             │
│  FEEDBACK DURING RESIZE                                     │
│  ─────────────────────────────────────────────────────────  │
│  - Dimension tooltip: "320 × 240" near cursor               │
│  - Smart guides for alignment                               │
│  - Snap to grid (if enabled)                                │
│  - Minimum size constraint: 20×20px                         │
│                                                             │
│  IMPLEMENTATION                                             │
│  ```typescript                                              │
│  interface ResizeState {                                    │
│    handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';│
│    startRect: Rect;                                         │
│    startMouse: Point;                                       │
│    aspectRatio: number;                                     │
│    shiftKey: boolean;                                       │
│    altKey: boolean;                                         │
│  }                                                          │
│                                                             │
│  function calculateNewRect(                                 │
│    state: ResizeState,                                      │
│    currentMouse: Point                                      │
│  ): Rect {                                                  │
│    const dx = currentMouse.x - state.startMouse.x;          │
│    const dy = currentMouse.y - state.startMouse.y;          │
│    let { x, y, width, height } = state.startRect;           │
│                                                             │
│    // Apply delta based on handle                           │
│    switch (state.handle) {                                  │
│      case 'se':                                             │
│        width += dx;                                         │
│        height += dy;                                        │
│        break;                                               │
│      case 'e':                                              │
│        width += dx;                                         │
│        break;                                               │
│      // ... other handles                                   │
│    }                                                        │
│                                                             │
│    // Apply constraints                                     │
│    if (state.shiftKey) {                                    │
│      // Maintain aspect ratio                               │
│      const newRatio = width / height;                       │
│      if (newRatio > state.aspectRatio) {                    │
│        width = height * state.aspectRatio;                  │
│      } else {                                               │
│        height = width / state.aspectRatio;                  │
│      }                                                      │
│    }                                                        │
│                                                             │
│    if (state.altKey) {                                      │
│      // Resize from center                                  │
│      const centerX = state.startRect.x + state.startRect.width / 2;│
│      const centerY = state.startRect.y + state.startRect.height / 2;│
│      x = centerX - width / 2;                               │
│      y = centerY - height / 2;                              │
│    }                                                        │
│                                                             │
│    return { x, y, width, height };                          │
│  }                                                          │
│  ```                                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Smart Guides & Snapping

```
┌─────────────────────────────────────────────────────────────┐
│  SMART GUIDES SYSTEM                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ALIGNMENT GUIDES                                           │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Center Alignment (vertical):                               │
│     ┌─────────┐                                             │
│     │    A    │                                             │
│     └─────────┘                                             │
│          │                                                  │
│          │ ← Magenta line (1px)                            │
│          │                                                  │
│     ┌─────────┐                                             │
│     │    B    │                                             │
│     └─────────┘                                             │
│                                                             │
│  Edge Alignment:                                            │
│     ┌─────────┐                                             │
│     │    A    │                                             │
│     └─────────┘                                             │
│     │                                                       │
│     │ ← Left edge alignment                                │
│     │                                                       │
│     ┌───────────────┐                                       │
│     │       B       │                                       │
│     └───────────────┘                                       │
│                                                             │
│  SPACING GUIDES                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Equal Spacing Detection:                                   │
│     ┌─────────┐     ┌─────────┐     ┌─────────┐            │
│     │    A    │←24→│    B    │←24→│    C    │            │
│     └─────────┘     └─────────┘     └─────────┘            │
│                                                             │
│  When spacing matches:                                      │
│  - Pink indicator line with value                           │
│  - Haptic feedback (if supported)                           │
│                                                             │
│  DISTANCE MEASUREMENT                                       │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Hold Alt/Option to show distances:                         │
│     ┌─────────┐                                             │
│     │ Selected│                                             │
│     └─────────┘                                             │
│          ↕ 48px                                             │
│     ┌─────────┐                                             │
│     │ Hovered │                                             │
│     └─────────┘                                             │
│                                                             │
│  SNAP CONFIGURATION                                         │
│  ─────────────────────────────────────────────────────────  │
│  Snap threshold: 8px                                        │
│  Snap targets:                                              │
│  - Element edges (left, right, top, bottom)                 │
│  - Element centers (horizontal, vertical)                   │
│  - Parent padding boundaries                                │
│  - Sibling spacing (equal distribution)                     │
│  - Grid lines (if enabled)                                  │
│  - Custom guides (user-created)                             │
│                                                             │
│  IMPLEMENTATION                                             │
│  ```typescript                                              │
│  interface Guide {                                          │
│    type: 'vertical' | 'horizontal';                         │
│    position: number;                                        │
│    start: number;                                           │
│    end: number;                                             │
│    label?: string;                                          │
│  }                                                          │
│                                                             │
│  function calculateSmartGuides(                             │
│    draggingRect: Rect,                                      │
│    otherRects: Rect[],                                      │
│    threshold: number = 8                                    │
│  ): Guide[] {                                               │
│    const guides: Guide[] = [];                              │
│                                                             │
│    for (const other of otherRects) {                        │
│      // Vertical center alignment                           │
│      if (Math.abs(draggingRect.centerX - other.centerX) < threshold) {│
│        guides.push({                                        │
│          type: 'vertical',                                  │
│          position: other.centerX,                           │
│          start: Math.min(draggingRect.top, other.top),      │
│          end: Math.max(draggingRect.bottom, other.bottom),  │
│        });                                                  │
│      }                                                      │
│                                                             │
│      // Left edge alignment                                 │
│      if (Math.abs(draggingRect.left - other.left) < threshold) {│
│        guides.push({                                        │
│          type: 'vertical',                                  │
│          position: other.left,                              │
│          start: Math.min(draggingRect.top, other.top),      │
│          end: Math.max(draggingRect.bottom, other.bottom),  │
│        });                                                  │
│      }                                                      │
│                                                             │
│      // ... more alignment checks                           │
│    }                                                        │
│                                                             │
│    return guides;                                           │
│  }                                                          │
│  ```                                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Keyboard Shortcuts

### 3.1 Complete Keyboard Shortcut Map

Following Figma conventions, here's the complete keyboard shortcut specification:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KEYBOARD SHORTCUTS - COMPLETE MAP                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GENERAL                                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ⌘K          Command palette (quick actions)                               │
│  ⌘/          Toggle keyboard shortcuts panel                               │
│  ⌘S          Save (if applicable)                                          │
│  ⌘Z          Undo                                                          │
│  ⌘⇧Z         Redo                                                          │
│  ⌘Y          Redo (alternative)                                            │
│                                                                             │
│  SELECTION                                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Click       Select element                                                 │
│  ⇧+Click    Add to selection / Remove from selection                       │
│  ⌘A          Select all (within parent)                                    │
│  ⌘⇧A         Deselect all                                                  │
│  Escape      Deselect / Exit edit mode / Select parent                     │
│  Enter       Enter edit mode (text) / Confirm                              │
│  Tab         Select next sibling                                           │
│  ⇧Tab        Select previous sibling                                       │
│  ↑           Select parent (when not editing)                              │
│  ↓           Select first child (when not editing)                         │
│                                                                             │
│  CLIPBOARD                                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ⌘C          Copy selection                                                │
│  ⌘X          Cut selection                                                 │
│  ⌘V          Paste                                                         │
│  ⌘⇧V         Paste in place (same position)                               │
│  ⌘D          Duplicate selection                                           │
│  ⌥+Drag     Duplicate while dragging                                       │
│                                                                             │
│  EDITING                                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Delete      Delete selection                                               │
│  Backspace   Delete selection                                               │
│  ⌘G          Group selection                                               │
│  ⌘⇧G         Ungroup                                                       │
│  ⌘L          Lock selection                                                │
│  ⌘⇧L         Unlock all                                                    │
│  ⌘H          Hide selection                                                │
│  ⌘⇧H         Show all hidden                                               │
│                                                                             │
│  ARRANGEMENT                                                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ⌘]          Bring forward                                                 │
│  ⌘[          Send backward                                                 │
│  ⌘⇧]         Bring to front                                               │
│  ⌘⇧[         Send to back                                                 │
│  ⌘⌥A         Align left                                                   │
│  ⌘⌥D         Align right                                                  │
│  ⌘⌥W         Align top                                                    │
│  ⌘⌥S         Align bottom                                                 │
│  ⌘⌥H         Align horizontal center                                      │
│  ⌘⌥V         Align vertical center                                        │
│                                                                             │
│  NUDGE                                                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ↑↓←→       Nudge 1px                                                      │
│  ⇧↑↓←→      Nudge 10px (big nudge)                                        │
│  ⌘↑↓←→      Nudge to parent edge                                          │
│                                                                             │
│  VIEW / ZOOM                                                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ⌘0          Zoom to 100%                                                  │
│  ⌘1          Zoom to fit all                                               │
│  ⌘2          Zoom to selection                                             │
│  ⌘+          Zoom in                                                       │
│  ⌘-          Zoom out                                                      │
│  ⌘\          Toggle UI (hide panels)                                       │
│  ⌘'          Toggle grid                                                   │
│  ⌘;          Toggle guides                                                 │
│  Space+Drag  Pan canvas (hand tool)                                        │
│  Scroll      Pan vertically                                                │
│  ⇧+Scroll   Pan horizontally                                               │
│  ⌘+Scroll   Zoom (toward cursor)                                          │
│  Pinch       Zoom (trackpad)                                               │
│                                                                             │
│  TOOLS                                                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  V           Select tool (default)                                         │
│  T           Text tool                                                      │
│  R           Rectangle/Section tool                                        │
│  F           Frame/Container tool                                          │
│  I           Image tool                                                     │
│  H           Hand tool (pan)                                               │
│  Z           Zoom tool                                                      │
│                                                                             │
│  AI FEATURES                                                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ⌘⇧G         Generate with AI                                             │
│  ⌘⇧I         Improve selected text                                        │
│  ⌘⇧T         Translate selected text                                      │
│  /           Slash command (in text edit mode)                             │
│                                                                             │
│  RESPONSIVE                                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ⌘⌥1         Switch to Desktop breakpoint                                 │
│  ⌘⌥2         Switch to Tablet breakpoint                                  │
│  ⌘⌥3         Switch to Mobile breakpoint                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Keyboard Shortcut Implementation

```typescript
// useKeyboardShortcuts.ts
import { useHotkeys } from 'react-hotkeys-hook';
import { useEditorStore } from '../store/useEditorEngine';

export function useKeyboardShortcuts() {
  const {
    selectedIds,
    selectBlock,
    copyBlock,
    cutBlock,
    pasteBlock,
    deleteSelectedBlocks,
    zoomIn,
    zoomOut,
    zoomTo100,
    zoomToFit,
  } = useEditorStore();

  // General
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    openCommandPalette();
  }, { enableOnFormTags: false });

  useHotkeys('mod+/', (e) => {
    e.preventDefault();
    toggleShortcutsPanel();
  });

  // Undo/Redo (handled by temporal middleware)
  useHotkeys('mod+z', (e) => {
    e.preventDefault();
    useEditorStore.temporal.getState().undo();
  });

  useHotkeys('mod+shift+z, mod+y', (e) => {
    e.preventDefault();
    useEditorStore.temporal.getState().redo();
  });

  // Selection
  useHotkeys('mod+a', (e) => {
    e.preventDefault();
    selectAllInParent();
  });

  useHotkeys('mod+shift+a, escape', (e) => {
    e.preventDefault();
    selectBlock(null);
  });

  // Clipboard
  useHotkeys('mod+c', (e) => {
    e.preventDefault();
    if (selectedIds.length > 0) {
      copyBlock(selectedIds[0]);
    }
  });

  useHotkeys('mod+x', (e) => {
    e.preventDefault();
    if (selectedIds.length > 0) {
      cutBlock(selectedIds[0]);
    }
  });

  useHotkeys('mod+v', (e) => {
    e.preventDefault();
    pasteBlock();
  });

  useHotkeys('mod+d', (e) => {
    e.preventDefault();
    duplicateSelection();
  });

  // Delete
  useHotkeys('delete, backspace', (e) => {
    // Don't delete if in text input
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
    deleteSelectedBlocks();
  });

  // Arrangement
  useHotkeys('mod+]', (e) => {
    e.preventDefault();
    bringForward();
  });

  useHotkeys('mod+[', (e) => {
    e.preventDefault();
    sendBackward();
  });

  useHotkeys('mod+shift+]', (e) => {
    e.preventDefault();
    bringToFront();
  });

  useHotkeys('mod+shift+[', (e) => {
    e.preventDefault();
    sendToBack();
  });

  // Nudge
  useHotkeys('up', (e) => {
    if (selectedIds.length === 0) return;
    e.preventDefault();
    nudge(0, e.shiftKey ? -10 : -1);
  });

  useHotkeys('down', (e) => {
    if (selectedIds.length === 0) return;
    e.preventDefault();
    nudge(0, e.shiftKey ? 10 : 1);
  });

  useHotkeys('left', (e) => {
    if (selectedIds.length === 0) return;
    e.preventDefault();
    nudge(e.shiftKey ? -10 : -1, 0);
  });

  useHotkeys('right', (e) => {
    if (selectedIds.length === 0) return;
    e.preventDefault();
    nudge(e.shiftKey ? 10 : 1, 0);
  });

  // Zoom
  useHotkeys('mod+0', (e) => {
    e.preventDefault();
    zoomTo100();
  });

  useHotkeys('mod+1', (e) => {
    e.preventDefault();
    zoomToFit();
  });

  useHotkeys('mod+2', (e) => {
    e.preventDefault();
    zoomToSelection();
  });

  useHotkeys('mod+=, mod+plus', (e) => {
    e.preventDefault();
    zoomIn();
  });

  useHotkeys('mod+minus', (e) => {
    e.preventDefault();
    zoomOut();
  });

  // Pan mode
  useHotkeys('space', () => {
    setIsPanning(true);
  }, { keydown: true });

  useHotkeys('space', () => {
    setIsPanning(false);
  }, { keyup: true });

  // Tools
  useHotkeys('v', () => setTool('select'));
  useHotkeys('t', () => setTool('text'));
  useHotkeys('r', () => setTool('rectangle'));
  useHotkeys('f', () => setTool('frame'));
  useHotkeys('h', () => setTool('hand'));
  useHotkeys('z', () => setTool('zoom'));

  // Breakpoints
  useHotkeys('mod+alt+1', (e) => {
    e.preventDefault();
    setActiveBreakpoint('desktop');
  });

  useHotkeys('mod+alt+2', (e) => {
    e.preventDefault();
    setActiveBreakpoint('tablet');
  });

  useHotkeys('mod+alt+3', (e) => {
    e.preventDefault();
    setActiveBreakpoint('mobile');
  });
}
```

### 3.3 Platform-Aware Shortcuts

```typescript
// Detect platform for correct modifier display
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const MODIFIER_SYMBOLS = {
  mod: isMac ? '⌘' : 'Ctrl',
  alt: isMac ? '⌥' : 'Alt',
  shift: '⇧',
  ctrl: isMac ? '⌃' : 'Ctrl',
};

// Format shortcut for display
function formatShortcut(shortcut: string): string {
  return shortcut
    .replace('mod', MODIFIER_SYMBOLS.mod)
    .replace('alt', MODIFIER_SYMBOLS.alt)
    .replace('shift', MODIFIER_SYMBOLS.shift)
    .replace('ctrl', MODIFIER_SYMBOLS.ctrl)
    .replace('+', isMac ? '' : '+')
    .toUpperCase();
}

// Example: formatShortcut('mod+shift+g') → '⌘⇧G' (Mac) or 'Ctrl+Shift+G' (Windows)
```

---

## 4. Animation Timing

### 4.1 Micro-Interaction Timing Specifications

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ANIMATION TIMING REFERENCE                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INSTANT (0-16ms) - No animation, immediate response                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Selection highlight appearance                                           │
│  • Cursor changes                                                           │
│  • Drag position updates (RAF)                                              │
│  • Hover state background color                                             │
│                                                                             │
│  MICRO (50-100ms) - Barely perceptible, feels instant                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Button press feedback                          50ms   ease-out          │
│  • Checkbox toggle                                80ms   ease-out          │
│  • Input focus ring                               100ms  ease-out          │
│  • Tooltip fade in (after delay)                  100ms  ease-out          │
│  • Selection ring appearance                      100ms  ease-out          │
│  • Hover border transition                        100ms  ease-out          │
│                                                                             │
│  FAST (100-200ms) - Quick but noticeable                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Dropdown open/close                            150ms  ease-out          │
│  • Context menu appearance                        120ms  ease-out          │
│  • Panel collapse/expand                          150ms  ease-in-out       │
│  • Drag preview lift                              150ms  ease-out          │
│  • Drop snap animation                            150ms  ease-out          │
│  • Resize handle hover scale                      150ms  ease-out          │
│  • Toast notification slide in                    200ms  ease-out          │
│                                                                             │
│  MEDIUM (200-300ms) - Deliberate, smooth                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Modal open/close                               250ms  ease-out          │
│  • Sidebar slide in/out                           250ms  ease-in-out       │
│  • Zoom animation                                 200ms  ease-out          │
│  • Pan animation (programmatic)                   200ms  ease-out          │
│  • Layer tree expand/collapse                     200ms  ease-in-out       │
│  • Drag cancel return                             200ms  spring            │
│  • Command palette open                           200ms  ease-out          │
│                                                                             │
│  SLOW (300-500ms) - Emphasized, important                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Page transitions                               300ms  ease-in-out       │
│  • Large panel animations                         350ms  ease-in-out       │
│  • Skeleton shimmer cycle                         1500ms linear (loop)     │
│  • Loading spinner rotation                       1000ms linear (loop)     │
│                                                                             │
│  DELAYS                                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Tooltip show delay (first)                     150ms                    │
│  • Tooltip show delay (subsequent)                0ms                      │
│  • Tooltip hide delay                             100ms                    │
│  • Drag start threshold                           3px movement             │
│  • Double-click threshold                         300ms                    │
│  • Long press threshold                           500ms                    │
│  • Loading state show delay                       200ms  (prevent flash)   │
│  • Loading state minimum duration                 300ms  (prevent flash)   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Easing Functions

```typescript
// CSS easing functions
const EASINGS = {
  // Standard easings
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Figma-style easings
  figmaEaseOut: 'cubic-bezier(0.2, 0, 0, 1)',      // Snappy deceleration
  figmaEaseInOut: 'cubic-bezier(0.65, 0, 0.35, 1)', // Smooth both ways
  
  // Spring-like (for bouncy interactions)
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',     // Slight overshoot
  springGentle: 'cubic-bezier(0.22, 1, 0.36, 1)',  // Subtle spring
  
  // Emphasis (for important state changes)
  emphasis: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Anticipation + overshoot
};

// Usage recommendations
const EASING_USAGE = {
  // UI elements appearing
  enter: EASINGS.easeOut,
  
  // UI elements disappearing
  exit: EASINGS.easeIn,
  
  // State changes (hover, active)
  stateChange: EASINGS.easeOut,
  
  // Movement (drag, pan)
  movement: EASINGS.figmaEaseOut,
  
  // Resize operations
  resize: EASINGS.easeOut,
  
  // Zoom operations
  zoom: EASINGS.figmaEaseInOut,
  
  // Drag cancel (return to origin)
  dragCancel: EASINGS.spring,
  
  // Drop snap
  dropSnap: EASINGS.springGentle,
  
  // Panel transitions
  panel: EASINGS.easeInOut,
  
  // Modal transitions
  modal: EASINGS.figmaEaseOut,
};
```

### 4.3 Animation Implementation Patterns

```typescript
// Framer Motion variants for common patterns
const ANIMATION_VARIANTS = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  },
  
  // Scale + fade (for modals, popovers)
  scaleFade: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: [0.2, 0, 0, 1] },
  },
  
  // Slide up (for toasts, tooltips)
  slideUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  },
  
  // Slide from side (for panels)
  slideFromRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
  
  // Selection ring
  selectionRing: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.1, ease: [0, 0, 0.2, 1] },
  },
  
  // Drag preview lift
  dragLift: {
    initial: { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
    animate: { 
      scale: 1.02, 
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)' 
    },
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  },
  
  // Drop snap
  dropSnap: {
    initial: { scale: 1.02 },
    animate: { scale: 1 },
    transition: { 
      type: 'spring', 
      stiffness: 500, 
      damping: 30 
    },
  },
  
  // Resize handle hover
  handleHover: {
    initial: { scale: 1 },
    hover: { scale: 1.2 },
    transition: { duration: 0.15, ease: [0, 0, 0.2, 1] },
  },
};

// CSS custom properties for animations
const CSS_ANIMATION_TOKENS = `
  /* Duration tokens */
  --duration-instant: 0ms;
  --duration-micro: 80ms;
  --duration-fast: 150ms;
  --duration-medium: 250ms;
  --duration-slow: 350ms;
  
  /* Easing tokens */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-figma: cubic-bezier(0.2, 0, 0, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Delay tokens */
  --delay-tooltip: 150ms;
  --delay-loading: 200ms;
`;
```

### 4.4 Reduced Motion Support

```typescript
// Hook for reduced motion preference
function usePrefersReducedMotion(): boolean {
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
}

// Conditional animation helper
function useAnimation<T extends object>(
  variants: { normal: T; reduced: T }
): T {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? variants.reduced : variants.normal;
}

// Example usage
const fadeVariants = useAnimation({
  normal: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.15 },
  },
  reduced: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    transition: { duration: 0 },
  },
});

// CSS approach
const REDUCED_MOTION_CSS = `
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
```

---

## 5. Collaboration Readiness

### 5.1 Architecture Changes for Real-Time Collaboration

Based on Figma's multiplayer architecture research, here are the recommended changes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COLLABORATION ARCHITECTURE                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CURRENT STATE (Indigo V3)                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Zustand store with immer middleware                                      │
│  • Temporal middleware for undo/redo (full state snapshots)                 │
│  • Normalized block data model                                              │
│  • No persistence layer                                                     │
│  • No real-time sync                                                        │
│                                                                             │
│  TARGET STATE (Collaboration-Ready)                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Operation-based state changes (not snapshots)                            │
│  • CRDT-based data model (Yjs or Automerge)                                │
│  • WebSocket connection for real-time sync                                  │
│  • Presence awareness (cursors, selections)                                 │
│  • Conflict resolution via sequence numbers                                 │
│  • Offline support with sync on reconnect                                   │
│                                                                             │
│  MIGRATION PATH                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Phase 1: Operation-Based History                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Current: Full state snapshots                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │   │
│  │  │ State 1  │  │ State 2  │  │ State 3  │  (50MB+ for 1000 blocks) │   │
│  │  │ (full)   │──│ (full)   │──│ (full)   │                          │   │
│  │  └──────────┘  └──────────┘  └──────────┘                          │   │
│  │                                                                     │   │
│  │  Target: Operation log                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │   │
│  │  │ Op: ADD  │  │ Op: MOVE │  │ Op: UPDATE│  (< 1MB for 1000 ops)   │   │
│  │  │ block-1  │──│ block-1  │──│ block-1  │                          │   │
│  │  └──────────┘  └──────────┘  └──────────┘                          │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 2: CRDT Integration                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Yjs Document Structure:                                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ Y.Doc                                                       │   │   │
│  │  │ ├─ blocks: Y.Map<BlockId, Y.Map<string, any>>              │   │   │
│  │  │ ├─ rootId: Y.Text                                          │   │   │
│  │  │ ├─ awareness: Awareness (cursors, selections)              │   │   │
│  │  │ └─ undoManager: Y.UndoManager                              │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Phase 3: Real-Time Sync                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ┌─────────┐     WebSocket      ┌─────────┐                        │   │
│  │  │ Client  │◄──────────────────►│ Server  │                        │   │
│  │  │   A     │                    │         │                        │   │
│  │  └─────────┘                    │  ┌───┐  │                        │   │
│  │                                 │  │ S3│  │ (checkpoints)          │   │
│  │  ┌─────────┐                    │  └───┘  │                        │   │
│  │  │ Client  │◄──────────────────►│         │                        │   │
│  │  │   B     │                    └─────────┘                        │   │
│  │  └─────────┘                                                       │   │
│  │                                                                     │   │
│  │  Sync Protocol:                                                     │   │
│  │  1. Client sends operation with sequence number                     │   │
│  │  2. Server validates and broadcasts to other clients                │   │
│  │  3. Server writes to journal (every 0.5s)                          │   │
│  │  4. Server checkpoints to S3 (every 30-60s)                        │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Operation-Based State Management

```typescript
// Operation types
type EditorOperation =
  | { type: 'ADD_BLOCK'; block: EditorBlock; parentId: BlockId; index: number }
  | { type: 'REMOVE_BLOCK'; blockId: BlockId; block: EditorBlock; parentId: BlockId; index: number }
  | { type: 'MOVE_BLOCK'; blockId: BlockId; fromParent: BlockId; fromIndex: number; toParent: BlockId; toIndex: number }
  | { type: 'UPDATE_BLOCK'; blockId: BlockId; oldValues: Partial<EditorBlock>; newValues: Partial<EditorBlock> }
  | { type: 'BATCH'; operations: EditorOperation[] };

// Operation with metadata
interface OperationEntry {
  id: string;
  operation: EditorOperation;
  timestamp: number;
  sequenceNumber: number;
  userId: string;
  clientId: string;
}

// Inverse operation for undo
function getInverseOperation(op: EditorOperation): EditorOperation {
  switch (op.type) {
    case 'ADD_BLOCK':
      return {
        type: 'REMOVE_BLOCK',
        blockId: op.block.id,
        block: op.block,
        parentId: op.parentId,
        index: op.index,
      };
    
    case 'REMOVE_BLOCK':
      return {
        type: 'ADD_BLOCK',
        block: op.block,
        parentId: op.parentId,
        index: op.index,
      };
    
    case 'MOVE_BLOCK':
      return {
        type: 'MOVE_BLOCK',
        blockId: op.blockId,
        fromParent: op.toParent,
        fromIndex: op.toIndex,
        toParent: op.fromParent,
        toIndex: op.fromIndex,
      };
    
    case 'UPDATE_BLOCK':
      return {
        type: 'UPDATE_BLOCK',
        blockId: op.blockId,
        oldValues: op.newValues,
        newValues: op.oldValues,
      };
    
    case 'BATCH':
      return {
        type: 'BATCH',
        operations: op.operations.map(getInverseOperation).reverse(),
      };
  }
}

// Apply operation to state
function applyOperation(state: EditorState, op: EditorOperation): EditorState {
  switch (op.type) {
    case 'ADD_BLOCK': {
      const newBlocks = { ...state.blocks, [op.block.id]: op.block };
      const parent = newBlocks[op.parentId];
      if (parent) {
        const newChildren = [...parent.children];
        newChildren.splice(op.index, 0, op.block.id);
        newBlocks[op.parentId] = { ...parent, children: newChildren };
      }
      return { ...state, blocks: newBlocks };
    }
    
    case 'REMOVE_BLOCK': {
      const newBlocks = { ...state.blocks };
      delete newBlocks[op.blockId];
      const parent = newBlocks[op.parentId];
      if (parent) {
        newBlocks[op.parentId] = {
          ...parent,
          children: parent.children.filter(id => id !== op.blockId),
        };
      }
      return { ...state, blocks: newBlocks };
    }
    
    case 'MOVE_BLOCK': {
      const newBlocks = { ...state.blocks };
      const block = newBlocks[op.blockId];
      
      // Remove from old parent
      const oldParent = newBlocks[op.fromParent];
      if (oldParent) {
        newBlocks[op.fromParent] = {
          ...oldParent,
          children: oldParent.children.filter(id => id !== op.blockId),
        };
      }
      
      // Add to new parent
      const newParent = newBlocks[op.toParent];
      if (newParent) {
        const newChildren = [...newParent.children];
        newChildren.splice(op.toIndex, 0, op.blockId);
        newBlocks[op.toParent] = { ...newParent, children: newChildren };
      }
      
      // Update block's parentId
      newBlocks[op.blockId] = { ...block, parentId: op.toParent };
      
      return { ...state, blocks: newBlocks };
    }
    
    case 'UPDATE_BLOCK': {
      const block = state.blocks[op.blockId];
      if (!block) return state;
      
      return {
        ...state,
        blocks: {
          ...state.blocks,
          [op.blockId]: { ...block, ...op.newValues },
        },
      };
    }
    
    case 'BATCH': {
      return op.operations.reduce(applyOperation, state);
    }
  }
}
```

### 5.3 CRDT Integration with Yjs

```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Awareness } from 'y-protocols/awareness';

// Collaborative editor engine
class CollaborativeEditorEngine {
  private doc: Y.Doc;
  private blocksMap: Y.Map<Y.Map<any>>;
  private rootIdText: Y.Text;
  private awareness: Awareness;
  private provider: WebsocketProvider | null = null;
  private undoManager: Y.UndoManager;
  
  constructor() {
    this.doc = new Y.Doc();
    this.blocksMap = this.doc.getMap('blocks');
    this.rootIdText = this.doc.getText('rootId');
    this.awareness = new Awareness(this.doc);
    
    // Undo manager tracks changes to blocks
    this.undoManager = new Y.UndoManager(this.blocksMap, {
      trackedOrigins: new Set(['local']),
    });
  }
  
  // Connect to collaboration server
  connect(roomId: string, serverUrl: string = 'wss://your-server.com') {
    this.provider = new WebsocketProvider(serverUrl, roomId, this.doc, {
      awareness: this.awareness,
    });
    
    this.provider.on('status', (event: { status: string }) => {
      console.log('Connection status:', event.status);
    });
  }
  
  // Disconnect from server
  disconnect() {
    this.provider?.disconnect();
    this.provider = null;
  }
  
  // Add a block
  addBlock(block: EditorBlock, parentId: BlockId, index: number) {
    this.doc.transact(() => {
      // Create block map
      const blockMap = new Y.Map();
      Object.entries(block).forEach(([key, value]) => {
        if (key === 'children') {
          blockMap.set(key, Y.Array.from(value as string[]));
        } else if (typeof value === 'object') {
          blockMap.set(key, new Y.Map(Object.entries(value)));
        } else {
          blockMap.set(key, value);
        }
      });
      
      // Add to blocks map
      this.blocksMap.set(block.id, blockMap);
      
      // Add to parent's children
      const parentMap = this.blocksMap.get(parentId);
      if (parentMap) {
        const children = parentMap.get('children') as Y.Array<string>;
        children.insert(index, [block.id]);
      }
    }, 'local');
  }
  
  // Update a block
  updateBlock(blockId: BlockId, updates: Partial<EditorBlock>) {
    this.doc.transact(() => {
      const blockMap = this.blocksMap.get(blockId);
      if (!blockMap) return;
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'styles' || key === 'content') {
          const existingMap = blockMap.get(key) as Y.Map<any>;
          if (existingMap && typeof value === 'object') {
            Object.entries(value).forEach(([k, v]) => {
              existingMap.set(k, v);
            });
          }
        } else {
          blockMap.set(key, value);
        }
      });
    }, 'local');
  }
  
  // Remove a block
  removeBlock(blockId: BlockId) {
    this.doc.transact(() => {
      const blockMap = this.blocksMap.get(blockId);
      if (!blockMap) return;
      
      const parentId = blockMap.get('parentId') as string;
      
      // Remove from parent's children
      const parentMap = this.blocksMap.get(parentId);
      if (parentMap) {
        const children = parentMap.get('children') as Y.Array<string>;
        const index = children.toArray().indexOf(blockId);
        if (index !== -1) {
          children.delete(index, 1);
        }
      }
      
      // Remove block
      this.blocksMap.delete(blockId);
    }, 'local');
  }
  
  // Undo/Redo
  undo() {
    this.undoManager.undo();
  }
  
  redo() {
    this.undoManager.redo();
  }
  
  // Presence: Update local user's cursor/selection
  updatePresence(data: { cursor?: Point; selection?: BlockId[] }) {
    this.awareness.setLocalStateField('user', {
      ...this.awareness.getLocalState()?.user,
      ...data,
    });
  }
  
  // Subscribe to remote presence changes
  onPresenceChange(callback: (states: Map<number, any>) => void) {
    this.awareness.on('change', () => {
      callback(this.awareness.getStates());
    });
  }
  
  // Subscribe to document changes
  onDocumentChange(callback: (blocks: BlockMap, rootId: BlockId) => void) {
    this.blocksMap.observeDeep(() => {
      const blocks = this.toBlockMap();
      const rootId = this.rootIdText.toString();
      callback(blocks, rootId);
    });
  }
  
  // Convert Yjs data to plain BlockMap
  private toBlockMap(): BlockMap {
    const blocks: BlockMap = {};
    
    this.blocksMap.forEach((blockMap, blockId) => {
      const block: any = {};
      blockMap.forEach((value, key) => {
        if (value instanceof Y.Array) {
          block[key] = value.toArray();
        } else if (value instanceof Y.Map) {
          block[key] = Object.fromEntries(value.entries());
        } else {
          block[key] = value;
        }
      });
      blocks[blockId] = block as EditorBlock;
    });
    
    return blocks;
  }
}
```

### 5.4 Presence Visualization

```typescript
// Remote cursor component
interface RemoteCursor {
  id: number;
  name: string;
  color: string;
  cursor: Point | null;
  selection: BlockId[];
}

function RemoteCursors({ cursors }: { cursors: RemoteCursor[] }) {
  return (
    <>
      {cursors.map((cursor) => (
        <React.Fragment key={cursor.id}>
          {/* Cursor pointer */}
          {cursor.cursor && (
            <div
              className="absolute pointer-events-none z-50"
              style={{
                left: cursor.cursor.x,
                top: cursor.cursor.y,
                transform: 'translate(-2px, -2px)',
              }}
            >
              {/* Cursor SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={cursor.color}
              >
                <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z" />
              </svg>
              
              {/* Name label */}
              <div
                className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.name}
              </div>
            </div>
          )}
          
          {/* Selection highlights */}
          {cursor.selection.map((blockId) => (
            <RemoteSelectionHighlight
              key={blockId}
              blockId={blockId}
              color={cursor.color}
              userName={cursor.name}
            />
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

function RemoteSelectionHighlight({
  blockId,
  color,
  userName,
}: {
  blockId: BlockId;
  color: string;
  userName: string;
}) {
  const blockRect = useBlockRect(blockId);
  
  if (!blockRect) return null;
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: blockRect.x,
        top: blockRect.y,
        width: blockRect.width,
        height: blockRect.height,
        border: `2px solid ${color}`,
        borderRadius: '4px',
      }}
    >
      {/* User name badge */}
      <div
        className="absolute -top-6 left-0 px-2 py-0.5 rounded text-xs text-white"
        style={{ backgroundColor: color }}
      >
        {userName}
      </div>
    </div>
  );
}
```

### 5.5 Conflict Resolution Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONFLICT RESOLUTION                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCENARIO 1: Concurrent Property Updates                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  User A: Sets block.styles.color = 'red'                                   │
│  User B: Sets block.styles.color = 'blue'                                  │
│                                                                             │
│  Resolution: Last-write-wins based on sequence number                       │
│  - Server assigns sequence numbers                                          │
│  - Higher sequence number wins                                              │
│  - Both users see final state                                               │
│                                                                             │
│  SCENARIO 2: Concurrent Move Operations                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  User A: Moves block-1 to container-A                                       │
│  User B: Moves block-1 to container-B                                       │
│                                                                             │
│  Resolution: Last-write-wins                                                │
│  - Block ends up in one container                                           │
│  - Both users see same final state                                          │
│                                                                             │
│  SCENARIO 3: Delete vs Update                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  User A: Deletes block-1                                                    │
│  User B: Updates block-1.styles.color                                       │
│                                                                             │
│  Resolution: Delete wins                                                    │
│  - Block is deleted                                                         │
│  - User B's update is discarded                                             │
│  - User B sees block disappear                                              │
│                                                                             │
│  SCENARIO 4: Parent Delete vs Child Update                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  User A: Deletes container (with children)                                  │
│  User B: Updates child block                                                │
│                                                                             │
│  Resolution: Cascade delete                                                 │
│  - Container and all children deleted                                       │
│  - User B's update discarded                                                │
│                                                                             │
│  IMPLEMENTATION                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ```typescript                                                              │
│  // Server-side conflict resolution                                         │
│  function resolveConflict(                                                  │
│    existingOp: OperationEntry,                                              │
│    incomingOp: OperationEntry                                               │
│  ): OperationEntry | null {                                                 │
│    // Same block, same property                                             │
│    if (existingOp.operation.blockId === incomingOp.operation.blockId) {     │
│      // Higher sequence number wins                                         │
│      if (incomingOp.sequenceNumber > existingOp.sequenceNumber) {           │
│        return incomingOp;                                                   │
│      }                                                                      │
│      return null; // Discard incoming                                       │
│    }                                                                        │
│                                                                             │
│    // No conflict                                                           │
│    return incomingOp;                                                       │
│  }                                                                          │
│  ```                                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Priority Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  IMPLEMENTATION PRIORITY MATRIX                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  HIGH IMPACT + LOW EFFORT (Do First)                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ✓ Selection state machine                                                  │
│  ✓ Hover/selected visual states                                             │
│  ✓ Keyboard shortcuts (core set)                                            │
│  ✓ Animation timing tokens                                                  │
│  ✓ Reduced motion support                                                   │
│                                                                             │
│  HIGH IMPACT + MEDIUM EFFORT (Do Second)                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  □ Resize handles                                                           │
│  □ Drag preview + drop indicators                                           │
│  □ Command palette (⌘K)                                                    │
│  □ Context menu                                                             │
│  □ Smart guides (basic)                                                     │
│                                                                             │
│  HIGH IMPACT + HIGH EFFORT (Plan Carefully)                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  □ Operation-based history                                                  │
│  □ CRDT integration (Yjs)                                                   │
│  □ Real-time collaboration                                                  │
│  □ Presence visualization                                                   │
│                                                                             │
│  MEDIUM IMPACT + LOW EFFORT (Quick Wins)                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  □ Breadcrumb navigation                                                    │
│  □ Selection toolbar (floating)                                             │
│  □ Keyboard shortcuts panel                                                 │
│  □ Empty states                                                             │
│                                                                             │
│  MEDIUM IMPACT + MEDIUM EFFORT (Nice to Have)                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  □ Ruler system                                                             │
│  □ Spacing visualizer                                                       │
│  □ History panel                                                            │
│  □ Asset manager                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Summary & Next Steps

### Key Takeaways

1. **Micro-interactions matter**: Figma's success comes from obsessive attention to timing, easing, and visual feedback. Every interaction should feel responsive and intentional.

2. **Operation-based architecture**: Moving from full state snapshots to operation-based history is essential for both performance and collaboration readiness.

3. **Keyboard-first design**: Power users should be able to do everything without touching the mouse. Complete keyboard shortcut coverage is non-negotiable.

4. **Collaboration is architectural**: Real-time collaboration requires fundamental changes to state management (CRDTs), not just adding WebSockets.

5. **Progressive enhancement**: Start with single-user polish, then add collaboration. Don't try to do both at once.

### Immediate Actions

1. **Implement selection state machine** - Foundation for all interactions
2. **Add animation timing tokens** - Consistent micro-interactions
3. **Complete keyboard shortcuts** - Power user productivity
4. **Build resize handles** - Essential manipulation feature
5. **Create command palette** - Quick access to all actions

### Future Roadmap

- **Q1**: Selection, manipulation, keyboard shortcuts
- **Q2**: Smart guides, inline editing, properties panel polish
- **Q3**: Operation-based history, offline support
- **Q4**: CRDT integration, real-time collaboration

---

*Analysis prepared by Figma Interaction Design Expert persona, January 2025*
