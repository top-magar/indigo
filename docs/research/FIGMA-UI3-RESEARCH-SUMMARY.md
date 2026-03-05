# Figma UI3 Research Summary

> **Quick Reference Guide**  
> **Date**: January 2025  
> **For**: Visual Editor V3 Implementation

---

## What is Figma UI3?

Figma's latest interface redesign (2024) that prioritizes **work center stage** and **minimal UI distractions**. It's the foundation for all Figma products (Design, FigJam, Slides).

---

## Key Principles

### 1. Work Center Stage
- Maximize canvas space
- Minimize UI chrome
- Hide panels when not needed

### 2. Docked Panels (Not Floating)
- Fixed panels on left/right
- Resizable by dragging
- Predictable layout

### 3. Bottom Toolbar
- Tools at bottom (not top)
- Frees vertical space
- Consistent across products

### 4. Minimize UI Mode
- Toggle with Shift + \
- Collapses all panels
- Distraction-free work

### 5. Responsive Micro-Interactions
- Instant feedback (0-16ms)
- Smooth animations (100-300ms)
- Clear state transitions

---

## Interface Layout

```
┌─────────────────────────────────────┐
│      Navigation Bar (Top)           │
├──────────┬──────────────┬───────────┤
│          │              │           │
│  Left    │   CANVAS     │   Right   │
│  Panel   │  (Center)    │   Panel   │
│          │              │           │
├──────────┴──────────────┴───────────┤
│      Toolbar (Bottom)               │
└─────────────────────────────────────┘
```

---

## Selection State Machine

```
IDLE
  ↓ hover
HOVER (dashed border, subtle bg)
  ↓ click
SELECTED (solid border, handles, label)
  ├─ drag → DRAGGING (lifted, ghost, guides)
  ├─ resize → RESIZING (dimension labels)
  └─ double-click → EDITING (text cursor)
```

---

## Response Time Targets

| Category | Time | Examples |
|----------|------|----------|
| Instant | 0-16ms | Selection, hover |
| Fast | 16-100ms | Panel updates |
| Animated | 100-300ms | Transitions |
| Async | 300ms+ | AI, exports |

---

## Top 10 Figma UI3 Patterns

### 1. Canvas-First Layout
- Left: Components + Layers (tabbed)
- Center: Canvas (full focus)
- Right: Properties only

### 2. Docked Resizable Panels
- Drag resize handles
- Persist user preferences
- Min/max width constraints

### 3. Minimize UI Mode
- Keyboard: Shift + \
- Hides all panels + toolbar
- Distraction-free work

### 4. Bottom Toolbar
- Tools at bottom
- Frees vertical space
- Horizontal layout

### 5. Selection State Machine
- IDLE → HOVER → SELECTED → DRAGGING/RESIZING/EDITING
- Visual feedback for each state
- Clear transitions

### 6. Smart Guides
- Alignment guides (center, edges)
- Spacing guides (equal distribution)
- Distance measurement (Alt+hover)

### 7. Drop Indicators
- Animated line showing drop zone
- Pulse dot for emphasis
- Valid zones highlight

### 8. Keyboard Shortcuts
- 40+ shortcuts for power users
- Platform-aware modifiers
- Discoverable via help menu

### 9. Design Token Integration
- Token picker for colors
- CSS variable references
- Consistent design system

### 10. Accessibility First
- Optional property labels
- ARIA support
- Screen reader friendly

---

## Keyboard Shortcuts (Essential)

| Shortcut | Action |
|----------|--------|
| ⌘K | Command palette |
| Arrow keys | Nudge 1px |
| Shift+Arrow | Nudge 10px |
| ⌘G | Group |
| ⌘⇧G | Ungroup |
| ⌘D | Duplicate |
| ⌘C | Copy |
| ⌘X | Cut |
| ⌘V | Paste |
| ⌘Z | Undo |
| ⌘⇧Z | Redo |
| ⌘L | Align left |
| ⌘R | Align right |
| ⌘E | Align center |
| ⌘⇧H | Flip horizontal |
| ⌘⇧V | Flip vertical |
| Shift+\ | Minimize UI |
| ⌘0 | Zoom to fit |
| ⌘1 | Zoom 100% |
| ⌘2 | Zoom to selection |

---

## Visual Editor V3: Current vs. Target

| Feature | Current | Target | Status |
|---------|---------|--------|--------|
| Layout | Docked ✅ | Docked ✅ | ✅ Done |
| Canvas | Center ✅ | Center ✅ | ✅ Done |
| Toolbar | Top | Bottom | ⏳ TODO |
| Minimize UI | No | Yes | ⏳ TODO |
| Resizable panels | No | Yes | ⏳ TODO |
| Selection states | Basic | Multi-state | ⏳ TODO |
| Smart guides | Yes ✅ | Yes ✅ | ✅ Done |
| Drop indicators | Yes ✅ | Yes ✅ | ✅ Done |
| Keyboard shortcuts | Partial | 40+ | ⏳ TODO |
| Zoom to cursor | No | Yes | ⏳ TODO |
| Token picker | Yes ✅ | Yes ✅ | ✅ Done |
| Accessibility | Good | Excellent | ⏳ TODO |

---

## Implementation Priority

### High Impact, Low Effort ✅
1. Move toolbar to bottom
2. Implement Minimize UI mode
3. Add resizable panels
4. Enhance selection states
5. Add missing keyboard shortcuts

### High Impact, High Effort 📋
1. Zoom to cursor
2. Minimap
3. Rulers & guides
4. Virtualization for large canvases
5. CRDT collaboration

### Low Impact, Nice to Have ⏳
1. Tooltip delays
2. Cursor changes
3. Focus management
4. WebGPU rendering
5. Binary format

---

## Quick Implementation Checklist

### Week 1: Foundation
- [ ] Move toolbar to bottom
- [ ] Implement Minimize UI (Shift + \)
- [ ] Add resizable panels with localStorage

### Week 2: Interactions
- [ ] Enhance selection states (hover, selected, multi-select)
- [ ] Add missing keyboard shortcuts
- [ ] Implement zoom to cursor

### Week 3: Polish
- [ ] Add property labels toggle
- [ ] Improve accessibility (ARIA labels)
- [ ] Performance optimization (virtualization)

### Week 4: Testing & Launch
- [ ] Functionality testing
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Beta release

---

## Code Examples

### Minimize UI Toggle
```tsx
useHotkeys('shift+\\', () => {
  setIsUIMinimized(!isUIMinimized);
});
```

### Resizable Panel
```tsx
<ResizablePanel
  position="left"
  defaultWidth={280}
  minWidth={200}
  maxWidth={400}
  storageKey="editor-left-panel-width"
>
  <LeftSidebarPanel />
</ResizablePanel>
```

### Selection State Machine
```tsx
const SELECTION_STYLES = {
  hover: { border: '1px dashed var(--ds-blue-400)' },
  selected: { border: '2px solid var(--ds-blue-600)' },
  dragging: { opacity: 0.8, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' },
};
```

### Keyboard Shortcut
```tsx
useHotkeys('mod+g', () => groupSelectedBlocks());
useHotkeys('shift+ArrowUp', () => nudgeSelectedBlocks(0, -10));
```

---

## Files Created

1. **FIGMA-UI3-INTERFACE-PATTERNS-RESEARCH.md** (this directory)
   - Comprehensive research on Figma UI3
   - 10 actionable recommendations
   - Implementation priority matrix

2. **VISUAL-EDITOR-V3-FIGMA-UI3-IMPLEMENTATION-GUIDE.md** (design directory)
   - Step-by-step implementation instructions
   - Code examples for each feature
   - Testing checklist
   - Rollout plan

3. **FIGMA-UI3-RESEARCH-SUMMARY.md** (this file)
   - Quick reference guide
   - Key principles and patterns
   - Implementation checklist

---

## Key Takeaways

1. **Figma UI3 is canvas-first** - Everything else is secondary
2. **Docked panels are better than floating** - Power users spend hours in the tool
3. **Minimize UI mode is essential** - Distraction-free work is important
4. **Keyboard shortcuts matter** - 40+ shortcuts for power users
5. **Micro-interactions are crucial** - Every action needs immediate feedback
6. **Accessibility is not optional** - Labels, ARIA, and screen readers from day one
7. **Performance is a feature** - 60fps dragging, <16ms selection response
8. **Resizable panels are expected** - Users want to customize their workspace
9. **Smart guides save time** - Alignment and spacing guides are essential
10. **Gradual rollout is wise** - Listen to users, iterate quickly

---

## Next Steps

1. **Read** the full research document (FIGMA-UI3-INTERFACE-PATTERNS-RESEARCH.md)
2. **Review** the implementation guide (VISUAL-EDITOR-V3-FIGMA-UI3-IMPLEMENTATION-GUIDE.md)
3. **Prioritize** based on impact/effort matrix
4. **Start** with Week 1 foundation items
5. **Test** thoroughly before each release
6. **Gather** user feedback and iterate

---

## References

- [Figma UI3 Blog](https://www.figma.com/blog/our-approach-to-designing-ui3/)
- [Figma UI3 Behind the Scenes](https://www.figma.com/blog/behind-our-redesign-ui3/)
- [Figma Help: Navigating UI3](https://help.figma.com/hc/en-us/articles/23954856027159)
- [Figma Keyboard Shortcuts](https://help.figma.com/hc/en-us/articles/360040328653)
- [Vercel Web Interface Guidelines](workspace steering file)
- [Vercel Geist Design System](workspace steering file)

---

## Questions?

Refer to the full research document or implementation guide for detailed information on any topic.
