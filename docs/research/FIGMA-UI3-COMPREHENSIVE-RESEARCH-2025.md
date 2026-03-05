# Figma UI3 Comprehensive Research 2025

> Official documentation research from help.figma.com for Visual Editor V3 rebuild

## Executive Summary

Figma UI3 represents a major redesign focused on simplifying the design experience. Key changes:
- **Bottom Toolbar** - Design tools moved to bottom, freeing canvas space
- **Actions Menu** - New AI-powered productivity hub
- **Resizable Properties Panel** - Better for long component names
- **Property Labels** - Toggle for clearer property identification
- **Minimize UI** - Shift+\ collapses all panels for expanded canvas view
- **Navigation Bar** - New left navigation for essential workflows

## 1. Layout Structure (4 Regions)

### 1.1 Toolbar (Bottom)
- Moved from top to bottom in UI3
- Houses all design tools for selecting, moving, creating
- Contains: Move tools, Region tools, Shape tools, Creation tools, Comment tools
- **Actions menu** - AI tools, productivity actions, plugins/widgets
- **Dev Mode toggle** - Shift+D to switch modes

### 1.2 Left Sidebar (Navigation Panel)
- Two tabs: **File** and **Assets**
- File tab: Layers, Pages
- Assets tab: Components, Libraries
- Keyboard shortcuts: Option+1 (Mac) / Alt+1 (Windows) for File
- **Minimize UI button** at top of panel

### 1.3 Right Sidebar (Properties Panel)
- **Design tab** - Layer properties, styling, effects
- **Prototype tab** - Interactions, flows, scroll behavior
- **Resizable** - Drag to adjust width
- **Property labels toggle** - From zoom/view options menu
- Grouped properties: Layout, Position, Appearance, Typography

### 1.4 Canvas
- Scrollable working area
- Supports zoom gestures (trackpad, mouse wheel)
- Pixel grid at 400%+ zoom
- Layout guides toggle

## 2. Toolbar Tools (Bottom Bar)

### 2.1 Move Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| Move | V | Default tool, select and move |
| Hand | H | Pan around canvas |
| Scale | K | Scale elements proportionally |

### 2.2 Region Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| Frame | F | Create frame containers |
| Section | Shift+S | Create labeled canvas regions |
| Slice | S | Define export regions |

### 2.3 Shape Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| Rectangle | R | Draw rectangles |
| Line | L | Draw lines |
| Arrow | Shift+L | Draw arrows |
| Ellipse | O | Draw circles/ellipses |
| Polygon | - | Draw polygons |
| Star | - | Draw stars |

### 2.4 Creation Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| Pen | P | Draw vector paths |
| Pencil | Shift+P | Freehand drawing |

### 2.5 Text Tool
| Tool | Shortcut | Description |
|------|----------|-------------|
| Text | T | Add text layers |

### 2.6 Comment Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| Comment | C | Add comments |
| Spotlight | - | Present designs |

## 3. Actions Menu (AI Hub)

The Actions menu is the new productivity center in UI3:

### 3.1 AI Tools
- **First Draft** - Transform ideas into editable designs
- **Find assets** - Search by description, screenshot, or design part
- **Find similar** - Select object, find matching designs

### 3.2 Common Actions
- Layer operations (group, frame, flatten, outline stroke)
- Selection and styling (select all, copy/paste properties)
- Editing tools (find and replace, spell check)
- View and navigation (zoom, pan, focus)
- File management (export, version history)
- Preferences (settings, keyboard shortcuts)

### 3.3 Plugins & Widgets
- Third-party extensions
- Custom workflows
- Accessible from Actions menu

## 4. Properties Panel (Right Sidebar)

### 4.1 Selection Actions (Header Row)
- Mask button
- Create component button
- Boolean operations
- More menu (...)

### 4.2 Layout Section
- Width/Height
- Auto layout toggle
- Resize to fit button
- Constraints (when applicable)

### 4.3 Position Section
- X/Y coordinates
- Rotation (90° button)
- Flip horizontal/vertical
- Constraints icon

### 4.4 Appearance Section
- Fill colors
- Stroke
- Effects (shadows, blur)
- Blend modes
- Show/hide toggle
- Variable modes

### 4.5 Typography Section (for text)
- Font family
- Font size
- Font weight
- Line height
- Letter spacing
- Type settings (paragraph spacing)

## 5. Keyboard Shortcuts

### 5.1 Navigation
| Action | Mac | Windows |
|--------|-----|---------|
| Pan canvas | Arrow keys | Arrow keys |
| Fast pan | Shift + Arrows | Shift + Arrows |
| Zoom in | ⌘ + | Ctrl + |
| Zoom out | ⌘ - | Ctrl - |
| Zoom to fit | Shift + 1 | Shift + 1 |
| Zoom to 100% | Shift + 0 | Shift + 0 |

### 5.2 UI Controls
| Action | Mac | Windows |
|--------|-----|---------|
| Minimize UI | Shift + \ | Shift + \ |
| Toggle pixel grid | ⌘ ' | Ctrl ' |
| Toggle layout guides | Ctrl + G | Ctrl + G |
| Open shortcuts panel | ⌘ Shift ? | Ctrl Shift ? |
| Dev Mode | Shift + D | Shift + D |

### 5.3 Selection
| Action | Mac | Windows |
|--------|-----|---------|
| Select all | ⌘ A | Ctrl A |
| Deselect | Esc | Esc |
| Deep select | ⌘ Click | Ctrl Click |
| Select parent | Shift + Enter | Shift + Enter |

### 5.4 Editing
| Action | Mac | Windows |
|--------|-----|---------|
| Copy | ⌘ C | Ctrl C |
| Paste | ⌘ V | Ctrl V |
| Duplicate | ⌘ D | Ctrl D |
| Delete | Delete/Backspace | Delete/Backspace |
| Undo | ⌘ Z | Ctrl Z |
| Redo | ⌘ Shift Z | Ctrl Shift Z |
| Group | ⌘ G | Ctrl G |
| Ungroup | ⌘ Shift G | Ctrl Shift G |
| Frame selection | ⌘ Option G | Ctrl Alt G |

## 6. Zoom/View Options

Located in properties panel (top-right corner):

### 6.1 Zoom Settings
- Custom percentage input
- Preset percentages (50%, 100%, 200%)
- Zoom to fit
- Zoom to selection

### 6.2 View Toggles
- **Pixel preview** (1x, 2x, Disabled)
- **Pixel grid** (visible at 400%+)
- **Snap to pixel grid**
- **Layout guides**
- **Multiplayer cursors**
- **Property labels** (NEW in UI3)
- **Prototype flows**

## 7. Layers Panel

### 7.1 Layer Types
| Icon | Type | Description |
|------|------|-------------|
| # | Frame | Container with properties |
| ⊞ | Group | Collection of layers |
| ◇ | Component | Reusable element |
| ◇ | Instance | Copy of component |
| T | Text | Text layer |
| □ | Shape | Vector shape |
| 🖼 | Image | Raster image |
| ⊞ | Auto layout | Responsive frame |
| ▭ | Section | Canvas region |

### 7.2 Layer Actions
- Collapse all layers button
- Drag to reorder
- Nest inside frames/groups
- Lock/unlock
- Show/hide

## 8. Design Principles from UI3

### 8.1 Simplification
- Reduced visual complexity
- Grouped related properties
- Consistent foundation across products

### 8.2 Focus
- More canvas space (bottom toolbar)
- Minimize UI mode
- Resizable panels

### 8.3 Approachability
- Property labels for beginners
- AI-powered assistance
- Contextual actions

### 8.4 Consistency
- Same patterns across Figma products
- Predictable interactions
- Unified design language

## 9. Implementation Recommendations

### 9.1 Must-Have Features
1. Bottom toolbar with tool groups
2. Resizable side panels
3. Minimize UI mode (Shift+\)
4. Property labels toggle
5. Actions menu with search
6. Keyboard shortcuts panel

### 9.2 Panel Structure
```
┌─────────────────────────────────────────────────────┐
│ Header (file name, share, collaborators)            │
├──────────┬──────────────────────────┬───────────────┤
│ Left     │                          │ Right         │
│ Sidebar  │       Canvas             │ Sidebar       │
│ (Layers, │                          │ (Properties)  │
│  Assets) │                          │               │
├──────────┴──────────────────────────┴───────────────┤
│ Bottom Toolbar (tools, actions, dev mode)           │
└─────────────────────────────────────────────────────┘
```

### 9.3 Interaction Patterns
- Hover: Show tooltips with shortcuts
- Click: Select/activate
- Double-click: Edit text/enter frame
- Right-click: Context menu
- Drag: Move/resize
- Shift+drag: Constrain proportions
- Option/Alt+drag: Duplicate

---

*Research compiled from official Figma Help Center documentation*
*Last updated: January 2025*
