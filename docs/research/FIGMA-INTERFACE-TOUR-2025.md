# Figma Interface Tour - January 2025 Update

> **Source**: https://help.figma.com/hc/en-us/sections/13148571463703-Tour-the-interface
> **Date**: January 2025
> **Purpose**: Latest Figma UI3 patterns for Visual Editor V3

---

## Key Updates from Figma Help Center

### 1. Navigation Bar (New - Rolling Out)

A new left navigation bar is rolling out to all Figma Design files, providing access to essential workflows in a single place:

- File name, project name, and file actions
- Pages navigation
- Layers panel
- Assets/Components panel
- Main menu access

### 2. Minimize UI Mode

**Keyboard**: `Shift + \`

Collapses:
- Navigation bar
- Navigation panel (left)
- Properties panel (right)

This provides an expanded canvas view for distraction-free work.

### 3. Toolbar (Bottom Position)

The toolbar has moved to the **bottom** of the editor, freeing up vertical canvas space.

**Tool Groups**:
- **Move tools**: Move (V), Hand, Scale
- **Region tools**: Frame (F), Section, Slice
- **Shape tools**: Rectangle, Ellipse, Line, Arrow, Polygon, Star
- **Creation tools**: Pen, Pencil
- **Text tool**: T
- **Comment tools**: Comment, Voice memo
- **Actions menu**: AI tools, plugins, widgets, components
- **Dev Mode toggle**: Shift+D
- **Figma Draw**: Visual design tools

### 4. Properties Panel (Right)

Reorganized with modern workflow groupings:

**Header Row**: Selection actions (Mask, Component, Boolean operations)

**Sections**:
1. **Layout**: Width, height, auto layout
2. **Position**: X, Y, constraints, rotation, flip
3. **Appearance**: Fill, stroke, effects, blend modes
4. **Typography**: Font, size, weight, spacing

**New Features**:
- Resizable panel width
- Property labels toggle (via zoom dropdown)
- Spotlight mode (minimizes panels for presentations)

### 5. Actions Menu (New)

Located in the toolbar, provides quick access to:
- Figma AI tools
- Common productivity actions
- Plugins and widgets
- Components
- Quick actions

---

## Visual Editor V3 Implementation Status

### ✅ Already Implemented

| Feature | Status | File |
|---------|--------|------|
| Docked panel layout | ✅ | `EditorLayout.tsx` |
| Canvas center stage | ✅ | `EditorCanvas.tsx` |
| Left sidebar (Components + Layers) | ✅ | `LeftSidebarPanel.tsx` |
| Right sidebar (Properties) | ✅ | `PropertiesPanel.tsx` |
| Smart guides | ✅ | `SmartGuides.tsx` |
| Drop indicators | ✅ | `DropIndicators.tsx` |
| Floating toolbar | ✅ | `FloatingToolbar.tsx` |
| Zoom controls | ✅ | `ZoomControls.tsx` |
| Command palette (⌘K) | ✅ | `CommandPalette.tsx` |
| Keyboard shortcuts | ✅ | `useKeyboardShortcuts.ts` |
| Token picker | ✅ | `TokenPicker.tsx` |
| Scrub input | ✅ | `ScrubInput.tsx` |
| Export dialog | ✅ | `ExportDialog.tsx` |
| AI chat panel | ✅ | `AIChatPanel.tsx` |
| Templates panel | ✅ | `TemplatesPanel.tsx` |
| Undo/Redo | ✅ | Zustand temporal |
| Copy/Cut/Paste | ✅ | `EditorRoot.tsx` |
| Auto-save | ✅ | `useDebounceAutoSave.ts` |

### ⏳ Remaining Improvements

| Feature | Priority | Effort | Notes |
|---------|----------|--------|-------|
| Move toolbar to bottom | High | Low | Figma UI3 standard |
| Minimize UI mode (Shift+\) | High | Low | Collapse all panels |
| Resizable panels | High | Medium | Drag to resize |
| Property labels toggle | Medium | Low | Accessibility |
| Zoom to cursor | Medium | Medium | Better UX |
| Enhanced selection states | Medium | Medium | Hover/multi-select |
| Nudge shortcuts (Arrow keys) | Medium | Low | 1px/10px nudge |
| Group/Ungroup (⌘G) | Medium | Low | Organization |
| Align shortcuts (⌘L/R/E) | Low | Low | Quick alignment |
| Minimap | Low | High | Large canvas navigation |
| Rulers & guides | Low | High | Precision layout |

---

## Recommended Implementation Order

### Week 1: Foundation
1. **Move toolbar to bottom** - Create `BottomToolbar.tsx`
2. **Minimize UI mode** - Add `isUIMinimized` state + `Shift+\` shortcut
3. **Resizable panels** - Add drag handles with localStorage persistence

### Week 2: Interactions
4. **Enhanced selection states** - Hover, selected, multi-select visuals
5. **Nudge shortcuts** - Arrow keys (1px), Shift+Arrow (10px)
6. **Group/Ungroup** - ⌘G / ⌘⇧G

### Week 3: Polish
7. **Property labels toggle** - Accessibility improvement
8. **Zoom to cursor** - Better zoom UX
9. **Align shortcuts** - ⌘L, ⌘R, ⌘E

---

## Code Examples

### Bottom Toolbar Component

```tsx
// src/features/visual-editor-v3/components/BottomToolbar.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Pointer, Square, Type, Pen, MessageCircle, Zap, MoreHorizontal
} from 'lucide-react';

export function BottomToolbar() {
  const tools = [
    { id: 'select', icon: Pointer, shortcut: 'V' },
    { id: 'frame', icon: Square, shortcut: 'F' },
    { id: 'text', icon: Type, shortcut: 'T' },
    { id: 'pen', icon: Pen, shortcut: 'P' },
    { id: 'comment', icon: MessageCircle, shortcut: 'C' },
  ];

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 h-12',
      'bg-[var(--ds-background-100)] border-t border-[var(--ds-gray-200)]',
      'flex items-center justify-center gap-1 px-4 z-30'
    )}>
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={`${tool.id} (${tool.shortcut})`}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
      
      <div className="w-px h-6 bg-[var(--ds-gray-200)] mx-2" />
      
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <Zap className="h-4 w-4 mr-1" />
        Actions
      </Button>
    </div>
  );
}
```

### Minimize UI Hook

```tsx
// src/features/visual-editor-v3/hooks/useMinimizeUI.ts
import { useHotkeys } from 'react-hotkeys-hook';
import { useEditorStore } from '../store/useEditorEngine';

export function useMinimizeUI() {
  const isUIMinimized = useEditorStore((s) => s.isUIMinimized);
  const setUIMinimized = useEditorStore((s) => s.setUIMinimized);

  useHotkeys('shift+\\', (e) => {
    e.preventDefault();
    setUIMinimized(!isUIMinimized);
  });

  return { isUIMinimized, setUIMinimized };
}
```

### Resizable Panel

```tsx
// src/features/visual-editor-v3/components/ResizablePanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelProps {
  children: React.ReactNode;
  position: 'left' | 'right';
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
}

export function ResizablePanel({
  children,
  position,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 400,
  storageKey,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) setWidth(parseInt(saved));
    }
  }, [storageKey]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = position === 'right' 
        ? startX - moveEvent.clientX 
        : moveEvent.clientX - startX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
      setWidth(newWidth);
      if (storageKey) localStorage.setItem(storageKey, newWidth.toString());
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
    <div className="flex h-full">
      {position === 'right' && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            'w-1 cursor-col-resize hover:bg-[var(--ds-blue-400)]',
            isDragging && 'bg-[var(--ds-blue-500)]'
          )}
        />
      )}
      <aside style={{ width }} className="h-full overflow-hidden">
        {children}
      </aside>
      {position === 'left' && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            'w-1 cursor-col-resize hover:bg-[var(--ds-blue-400)]',
            isDragging && 'bg-[var(--ds-blue-500)]'
          )}
        />
      )}
    </div>
  );
}
```

---

## References

- [Navigating UI3](https://help.figma.com/hc/articles/23954856027159)
- [Access design tools from the toolbar](https://help.figma.com/hc/en-us/articles/360041064174)
- [View layers and pages](https://help.figma.com/hc/en-us/articles/360039831974)
- [Properties panel](https://help.figma.com/hc/en-us/articles/360039832014)
- [Explore the canvas](https://help.figma.com/hc/en-us/articles/360041064814)

---

## Related Documents

- `docs/research/FIGMA-UI3-RESEARCH-SUMMARY.md` - Quick reference
- `docs/research/FIGMA-UI3-INTERFACE-PATTERNS-RESEARCH.md` - Comprehensive research
- `docs/design/VISUAL-EDITOR-V3-FIGMA-UI3-IMPLEMENTATION-GUIDE.md` - Implementation guide
