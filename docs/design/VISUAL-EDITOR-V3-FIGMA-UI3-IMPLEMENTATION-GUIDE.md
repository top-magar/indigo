# Visual Editor V3: Figma UI3 Implementation Guide

> **Date**: January 2025  
> **Target**: Achieve Figma UI3-level polish and usability  
> **Status**: Implementation roadmap

---

## Overview

This guide provides step-by-step implementation instructions for adopting Figma UI3 patterns in the Visual Editor V3. It complements the research document with concrete code examples and architectural decisions.

---

## Section 1: Toolbar Repositioning

### Current State
- Toolbar at top (takes vertical space)
- Tools scattered across header

### Target State (Figma UI3)
- Toolbar at bottom (frees vertical space)
- Horizontal layout with grouped tools
- Consistent with FigJam and Slides

### Implementation

#### Step 1: Create Bottom Toolbar Component

```tsx
// src/features/visual-editor-v3/components/BottomToolbar.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Pointer,
  Square,
  Type,
  Pen,
  MessageCircle,
  Zap,
  MoreHorizontal,
} from 'lucide-react';

interface BottomToolbarProps {
  onToolSelect?: (tool: string) => void;
  className?: string;
}

export function BottomToolbar({ onToolSelect, className }: BottomToolbarProps) {
  const tools = [
    { id: 'select', label: 'Select', icon: Pointer, shortcut: 'V' },
    { id: 'frame', label: 'Frame', icon: Square, shortcut: 'F' },
    { id: 'text', label: 'Text', icon: Type, shortcut: 'T' },
    { id: 'pen', label: 'Pen', icon: Pen, shortcut: 'P' },
    { id: 'comment', label: 'Comment', icon: MessageCircle, shortcut: 'C' },
  ];

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 h-12 bg-[var(--ds-background-100)]',
        'border-t border-[var(--ds-gray-200)]',
        'flex items-center justify-center gap-1 px-4',
        'z-30',
        className
      )}
    >
      {/* Tool Groups */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            size="sm"
            onClick={() => onToolSelect?.(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className="h-8 w-8 p-0"
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--ds-gray-200)] mx-2" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          title="Actions (⌘K)"
          className="h-8 px-2 text-xs"
        >
          <Zap className="h-4 w-4 mr-1" />
          Actions
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* More Menu */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

#### Step 2: Update EditorLayout

```tsx
// src/features/visual-editor-v3/components/EditorLayout.tsx
export function EditorLayout({ children, className }: EditorLayoutProps) {
  return (
    <div 
      className={cn(
        "flex flex-col h-screen w-screen overflow-hidden fixed inset-0",
        "bg-[var(--ds-gray-100)]",
        className
      )}
    >
      {/* Header */}
      <EditorHeader />
      
      {/* Main content area */}
      <div className="flex-1 min-h-0 flex">
        {children}
      </div>
      
      {/* Bottom toolbar (NEW) */}
      <BottomToolbar />
    </div>
  );
}
```

#### Step 3: Adjust Canvas Padding

```tsx
// src/features/visual-editor-v3/canvas/EditorCanvas.tsx
export function EditorCanvas() {
  return (
    <div
      className={cn(
        "flex-1 min-w-0 h-full relative overflow-hidden",
        "bg-[var(--ds-gray-100)]",
        "pb-12" // Add padding for bottom toolbar
      )}
    >
      {/* Canvas content */}
    </div>
  );
}
```

---

## Section 2: Minimize UI Mode

### Current State
- No way to hide panels for distraction-free work

### Target State (Figma UI3)
- Toggle with Shift + \
- Collapses left panel, right panel, and toolbar
- Keyboard shortcut to toggle back

### Implementation

#### Step 1: Add UI State to Store

```tsx
// src/features/visual-editor-v3/store/useEditorEngine.ts
interface EditorState {
  // ... existing state
  isUIMinimized: boolean;
  setUIMinimized: (minimized: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // ... existing state
  isUIMinimized: false,
  setUIMinimized: (minimized) => set({ isUIMinimized: minimized }),
}));
```

#### Step 2: Create Minimize UI Hook

```tsx
// src/features/visual-editor-v3/hooks/useMinimizeUI.ts
import { useHotkeys } from 'react-hotkeys-hook';
import { useEditorStore } from '../store/useEditorEngine';

export function useMinimizeUI() {
  const { isUIMinimized, setUIMinimized } = useEditorStore();

  useHotkeys('shift+\\', (e) => {
    e.preventDefault();
    setUIMinimized(!isUIMinimized);
  });

  return { isUIMinimized, setUIMinimized };
}
```

#### Step 3: Update EditorLayout

```tsx
// src/features/visual-editor-v3/components/EditorLayout.tsx
export function EditorLayout({ children, className }: EditorLayoutProps) {
  const { isUIMinimized } = useMinimizeUI();

  return (
    <div 
      className={cn(
        "flex flex-col h-screen w-screen overflow-hidden fixed inset-0",
        "bg-[var(--ds-gray-100)]",
        className
      )}
    >
      {/* Header - hidden when minimized */}
      {!isUIMinimized && <EditorHeader />}
      
      {/* Main content area */}
      <div className="flex-1 min-h-0 flex">
        {children}
      </div>
      
      {/* Bottom toolbar - hidden when minimized */}
      {!isUIMinimized && <BottomToolbar />}
    </div>
  );
}
```

#### Step 4: Hide Panels When Minimized

```tsx
// src/features/visual-editor-v3/EditorRoot.tsx
export const EditorRoot = () => {
  const { isUIMinimized } = useMinimizeUI();

  return (
    <EditorLayout>
      <DndContext>
        <div className="flex-1 min-h-0 flex">
          {/* Left Panel - hidden when minimized */}
          {!isUIMinimized && <LeftSidebarPanel />}
          
          {/* Canvas */}
          <div className="flex-1 min-w-0 h-full relative overflow-hidden">
            <EditorCanvas />
          </div>
          
          {/* Right Panel - hidden when minimized */}
          {!isUIMinimized && <PropertiesPanel />}
        </div>
      </DndContext>
    </EditorLayout>
  );
};
```

---

## Section 3: Resizable Panels

### Current State
- Fixed panel widths (280px left, 280px right)

### Target State (Figma UI3)
- Drag resize handles to adjust widths
- Persist user preferences
- Minimum/maximum widths

### Implementation

#### Step 1: Create Resize Handle Component

```tsx
// src/features/visual-editor-v3/components/PanelResizeHandle.tsx
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface PanelResizeHandleProps {
  onResize: (delta: number) => void;
  position: 'left' | 'right';
  className?: string;
}

export function PanelResizeHandle({
  onResize,
  position,
  className,
}: PanelResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const adjustedDelta = position === 'right' ? -delta : delta;
      onResize(adjustedDelta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'w-1 cursor-col-resize',
        'hover:bg-[var(--ds-blue-400)] hover:bg-opacity-50',
        'transition-colors duration-150',
        isDragging && 'bg-[var(--ds-blue-500)]',
        className
      )}
    />
  );
}
```

#### Step 2: Create Resizable Panel Wrapper

```tsx
// src/features/visual-editor-v3/components/ResizablePanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PanelResizeHandle } from './PanelResizeHandle';

interface ResizablePanelProps {
  children: React.ReactNode;
  position: 'left' | 'right';
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
  className?: string;
}

export function ResizablePanel({
  children,
  position,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 500,
  storageKey,
  className,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);

  // Load saved width from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setWidth(Math.max(minWidth, Math.min(maxWidth, parseInt(saved))));
      }
    }
  }, [storageKey, minWidth, maxWidth]);

  const handleResize = (delta: number) => {
    const newWidth = Math.max(minWidth, Math.min(maxWidth, width + delta));
    setWidth(newWidth);

    // Save to localStorage
    if (storageKey) {
      localStorage.setItem(storageKey, newWidth.toString());
    }
  };

  return (
    <div className="flex h-full">
      {position === 'left' && (
        <PanelResizeHandle onResize={handleResize} position="left" />
      )}

      <aside
        className={cn(
          'flex flex-col h-full bg-[var(--ds-background-100)]',
          'border-[var(--ds-gray-200)]',
          position === 'left' ? 'border-r' : 'border-l',
          className
        )}
        style={{ width }}
      >
        {children}
      </aside>

      {position === 'right' && (
        <PanelResizeHandle onResize={handleResize} position="right" />
      )}
    </div>
  );
}
```

#### Step 3: Update EditorRoot

```tsx
// src/features/visual-editor-v3/EditorRoot.tsx
export const EditorRoot = () => {
  return (
    <EditorLayout>
      <DndContext>
        <div className="flex-1 min-h-0 flex">
          {/* Left Panel - Resizable */}
          {!isUIMinimized && (
            <ResizablePanel
              position="left"
              defaultWidth={280}
              minWidth={200}
              maxWidth={400}
              storageKey="editor-left-panel-width"
            >
              <LeftSidebarPanel />
            </ResizablePanel>
          )}
          
          {/* Canvas */}
          <div className="flex-1 min-w-0 h-full relative overflow-hidden">
            <EditorCanvas />
          </div>
          
          {/* Right Panel - Resizable */}
          {!isUIMinimized && (
            <ResizablePanel
              position="right"
              defaultWidth={280}
              minWidth={200}
              maxWidth={400}
              storageKey="editor-right-panel-width"
            >
              <PropertiesPanel />
            </ResizablePanel>
          )}
        </div>
      </DndContext>
    </EditorLayout>
  );
};
```

---

## Section 4: Enhanced Selection States

### Current State
- Simple ring selection

### Target State (Figma UI3)
- HOVER: Dashed border, subtle background
- SELECTED: Solid border, resize handles, label
- MULTI-SELECT: Bounding box with count badge

### Implementation

```tsx
// src/features/visual-editor-v3/canvas/SelectionOverlay.tsx
const SELECTION_STYLES = {
  hover: {
    border: '1px dashed var(--ds-blue-400)',
    background: 'rgba(59, 130, 246, 0.1)',
    transition: 'all 100ms ease-out',
  },
  selected: {
    border: '2px solid var(--ds-blue-600)',
    background: 'rgba(59, 130, 246, 0.05)',
    showHandles: true,
    showLabel: true,
  },
  multiSelect: {
    border: '1px dashed var(--ds-blue-500)',
    background: 'rgba(59, 130, 246, 0.02)',
    showBoundingBox: true,
    showCountBadge: true,
  },
};

export function SelectionOverlay() {
  const { selectedIds } = useEditorStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isMultiSelect = selectedIds.length > 1;
  const isSingleSelect = selectedIds.length === 1;

  return (
    <>
      {/* Hover state */}
      {hoveredId && !selectedIds.includes(hoveredId) && (
        <SelectionBox
          blockId={hoveredId}
          style={SELECTION_STYLES.hover}
          showLabel={false}
        />
      )}

      {/* Single select */}
      {isSingleSelect && (
        <SelectionBox
          blockId={selectedIds[0]}
          style={SELECTION_STYLES.selected}
          showHandles
          showLabel
        />
      )}

      {/* Multi-select */}
      {isMultiSelect && (
        <>
          <BoundingBox
            blocks={selectedIds}
            style={SELECTION_STYLES.multiSelect}
          />
          <CountBadge count={selectedIds.length} />
        </>
      )}
    </>
  );
}
```

---

## Section 5: Keyboard Shortcuts

### Missing Shortcuts

Add these to `useKeyboardShortcuts.ts`:

```tsx
// Arrow keys: Nudge
useHotkeys('ArrowUp', () => nudgeSelectedBlocks(0, -1), { scopes: ['editor'] });
useHotkeys('ArrowDown', () => nudgeSelectedBlocks(0, 1), { scopes: ['editor'] });
useHotkeys('ArrowLeft', () => nudgeSelectedBlocks(-1, 0), { scopes: ['editor'] });
useHotkeys('ArrowRight', () => nudgeSelectedBlocks(1, 0), { scopes: ['editor'] });

// Shift+Arrow: Nudge 10px
useHotkeys('shift+ArrowUp', () => nudgeSelectedBlocks(0, -10), { scopes: ['editor'] });
useHotkeys('shift+ArrowDown', () => nudgeSelectedBlocks(0, 10), { scopes: ['editor'] });
useHotkeys('shift+ArrowLeft', () => nudgeSelectedBlocks(-10, 0), { scopes: ['editor'] });
useHotkeys('shift+ArrowRight', () => nudgeSelectedBlocks(10, 0), { scopes: ['editor'] });

// ⌘G: Group
useHotkeys('mod+g', () => groupSelectedBlocks(), { scopes: ['editor'] });

// ⌘⇧G: Ungroup
useHotkeys('mod+shift+g', () => ungroupSelectedBlocks(), { scopes: ['editor'] });

// ⌘L: Align left
useHotkeys('mod+l', () => alignSelectedBlocks('left'), { scopes: ['editor'] });

// ⌘R: Align right
useHotkeys('mod+r', () => alignSelectedBlocks('right'), { scopes: ['editor'] });

// ⌘E: Align center
useHotkeys('mod+e', () => alignSelectedBlocks('center'), { scopes: ['editor'] });

// ⌘⇧H: Flip horizontal
useHotkeys('mod+shift+h', () => flipSelectedBlocks('horizontal'), { scopes: ['editor'] });

// ⌘⇧V: Flip vertical
useHotkeys('mod+shift+v', () => flipSelectedBlocks('vertical'), { scopes: ['editor'] });

// Shift+\: Minimize UI
useHotkeys('shift+\\', () => toggleMinimizeUI(), { scopes: ['editor'] });

// ⌘0: Zoom to fit
useHotkeys('mod+0', () => zoomToFit(), { scopes: ['editor'] });

// ⌘1: Zoom to 100%
useHotkeys('mod+1', () => setZoom(100), { scopes: ['editor'] });

// ⌘2: Zoom to selection
useHotkeys('mod+2', () => zoomToSelection(), { scopes: ['editor'] });
```

---

## Section 6: Zoom to Cursor

### Current State
- Zoom to canvas center

### Target State (Figma UI3)
- Zoom toward cursor position

### Implementation

```tsx
// src/features/visual-editor-v3/hooks/useCanvasTransform.ts
export function useCanvasTransform() {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });

  const zoomToPoint = (point: { x: number; y: number }, newScale: number) => {
    const scaleDiff = newScale - transform.scale;
    
    setTransform({
      scale: newScale,
      x: transform.x - point.x * scaleDiff,
      y: transform.y - point.y * scaleDiff,
    });
  };

  const handleWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;

    e.preventDefault();

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, transform.scale * scaleFactor));

    zoomToPoint({ x: cursorX, y: cursorY }, newScale);
  };

  return { transform, zoomToPoint, handleWheel };
}
```

---

## Section 7: Accessibility Improvements

### Add Property Labels Toggle

```tsx
// src/features/visual-editor-v3/panels/PropertiesPanel.tsx
export function PropertiesPanel() {
  const [showLabels, setShowLabels] = useState(true);

  return (
    <Panel position="right">
      <PanelHeader
        title="Design"
        className="flex items-center justify-between"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLabels(!showLabels)}
          title="Toggle property labels"
          className="h-6 px-2 text-xs"
        >
          {showLabels ? 'Hide labels' : 'Show labels'}
        </Button>
      </PanelHeader>

      <PanelContent>
        {/* Properties with optional labels */}
        <PropertyGroup label={showLabels ? 'Layout' : undefined}>
          {/* Layout properties */}
        </PropertyGroup>
      </PanelContent>
    </Panel>
  );
}
```

### Add ARIA Labels

```tsx
// Ensure all interactive elements have aria-labels
<button
  aria-label="Duplicate selected block (⌘D)"
  onClick={handleDuplicate}
>
  <Icon name="duplicate" />
</button>

// Use aria-live for status updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Use aria-expanded for collapsible sections
<button
  aria-expanded={isExpanded}
  aria-controls="section-content"
  onClick={toggleSection}
>
  Section Title
</button>
```

---

## Section 8: Performance Optimization

### Virtualize Large Layer Trees

```tsx
// src/features/visual-editor-v3/panels/LayersPanel.tsx
import { Virtuoso } from 'react-virtuoso';

export function LayersPanel() {
  const { blocks } = useEditorStore();
  const flattenedLayers = useMemo(() => flattenTree(blocks), [blocks]);

  return (
    <Virtuoso
      data={flattenedLayers}
      itemContent={(index, layer) => (
        <LayerItem key={layer.id} layer={layer} depth={layer.depth} />
      )}
      overscan={10}
      className="h-full"
    />
  );
}
```

### Batch ResizeObserver Updates

```tsx
// src/features/visual-editor-v3/hooks/useResizeBlock.ts
const batchedResizeObserver = new ResizeObserver(
  debounce((entries) => {
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        const blockId = entry.target.getAttribute('data-block-id');
        if (blockId) {
          updateBlockBounds(blockId, entry.contentRect);
        }
      });
    });
  }, 16)
);
```

---

## Section 9: Testing Checklist

### Functionality Tests
- [ ] Toolbar appears at bottom
- [ ] Minimize UI toggle works (Shift + \)
- [ ] Panels are resizable
- [ ] Selection states show correctly
- [ ] All keyboard shortcuts work
- [ ] Zoom to cursor works
- [ ] Property labels toggle works

### Performance Tests
- [ ] 1000 blocks render in <500ms
- [ ] Drag frame rate is 60fps
- [ ] Selection response is <16ms
- [ ] Memory usage <50MB for 1000 blocks

### Accessibility Tests
- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works
- [ ] Focus rings are visible
- [ ] Screen reader announces changes
- [ ] Color contrast meets APCA standards

### Browser Tests
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (iPad)

---

## Section 10: Rollout Plan

### Phase 1: Foundation (Week 1)
- [ ] Move toolbar to bottom
- [ ] Implement Minimize UI mode
- [ ] Add resizable panels

### Phase 2: Interactions (Week 2)
- [ ] Enhance selection states
- [ ] Add missing keyboard shortcuts
- [ ] Implement zoom to cursor

### Phase 3: Polish (Week 3)
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Testing and bug fixes

### Phase 4: Launch (Week 4)
- [ ] Beta release
- [ ] Gather user feedback
- [ ] Iterate based on feedback
- [ ] Full release

---

## References

- [Figma UI3 Blog](https://www.figma.com/blog/our-approach-to-designing-ui3/)
- [Figma Help: Navigating UI3](https://help.figma.com/hc/en-us/articles/23954856027159)
- [Figma Keyboard Shortcuts](https://help.figma.com/hc/en-us/articles/360040328653)
- [Visual Editor V3 Research](./FIGMA-UI3-INTERFACE-PATTERNS-RESEARCH.md)
