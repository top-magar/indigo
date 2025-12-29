# Design Document

## Overview

This design formalizes the rich text editing capabilities within the storefront visual editor. The implementation uses TipTap (a headless wrapper around ProseMirror) to provide a full-featured rich text editor with a floating toolbar that appears on text selection. The block action bar provides quick access to block manipulation actions.

The architecture extends the existing inline editing foundation, reusing the postMessage communication bridge for editor-preview synchronization. The rich text editor integrates seamlessly with the existing `EditableText` component pattern while adding formatting capabilities.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              EDITOR                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │ Zustand Store │◄──►│ useEditorPre │◄──►│ Settings Panel           │  │
│  │ (blocks,      │    │ view Hook    │    │ (RichTextField)          │  │
│  │  history)     │    └──────┬───────┘    └──────────────────────────┘  │
│  └──────────────┘            │                                          │
│                              │ postMessage                              │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────┐
│                              ▼           PREVIEW IFRAME                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │ usePreviewMo │◄──►│ EditableRich │◄──►│ RichTextToolbar          │  │
│  │ de Hook      │    │ Text         │    │ (floating)               │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘  │
│                              │                                          │
│                      ┌───────┴───────┐                                  │
│                      │ TipTap Editor │                                  │
│                      │ Instance      │                                  │
│                      └───────────────┘                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **TipTap over Custom Implementation**: TipTap provides a battle-tested, extensible rich text editing foundation with excellent TypeScript support and a plugin architecture.

2. **Floating Toolbar over Fixed**: The toolbar appears on text selection rather than being always visible, reducing visual clutter and matching modern editor UX patterns (Notion, Medium).

3. **Selection-Based Visibility**: Toolbar shows only when text is selected (not collapsed cursor), preventing accidental toolbar display during navigation.

4. **Debounced Sync Strategy**: 
   - Type: Trailing debounce (fires after 300ms of inactivity)
   - No maxWait - allows continuous typing without interruption
   - Debounce resets on each keystroke

5. **Composable Block Actions**: The BlockActionBar uses a compound component pattern for flexibility in different contexts.

6. **Active Editing Detection**:
   - `isEditing` state tracked in component via `useState`
   - Set to `true` on click/focus, `false` on blur/click-outside
   - External updates check `isEditing` before applying

7. **Link Input UI**: Inline input field replaces link button in toolbar when active (not popover/modal)

8. **URL Validation**: 
   - Accept any string (browser handles navigation)
   - Relative URLs supported (e.g., `/products/item`)
   - No XSS risk as URLs are only used in `href` attribute

## Components and Interfaces

### EditableRichText Component

Location: `components/store/blocks/rich-text-editor/editable-rich-text.tsx`

```typescript
interface RichTextEditorProps {
  blockId: string
  fieldPath: string
  value: string
  placeholder?: string
  className?: string
  toolbarConfig?: ToolbarConfig
  onUpdate?: (html: string) => void
}
```

Responsibilities:
- Initializes TipTap editor with required extensions
- Manages edit session lifecycle (start, save, cancel)
- Positions and shows/hides floating toolbar based on selection
- Sends postMessage events for editor synchronization
- Handles click-outside and keyboard events (Escape)

### Toolbar Positioning Algorithm

The toolbar position is calculated based on selection bounds and viewport constraints:

```typescript
function calculateToolbarPosition(
  selectionRect: DOMRect,
  containerRect: DOMRect,
  toolbarWidth: number,
  toolbarHeight: number
): { top: number; left: number } {
  const PADDING = 8 // Minimum distance from viewport edge
  
  // Default: center above selection
  let top = selectionRect.top - containerRect.top - toolbarHeight - PADDING
  let left = selectionRect.left - containerRect.left + selectionRect.width / 2
  
  // If toolbar would go above viewport, position below selection
  if (selectionRect.top - toolbarHeight - PADDING < 0) {
    top = selectionRect.bottom - containerRect.top + PADDING
  }
  
  // Constrain to left edge
  const leftEdge = left - toolbarWidth / 2
  if (leftEdge < PADDING) {
    left = toolbarWidth / 2 + PADDING
  }
  
  // Constrain to right edge
  const rightEdge = left + toolbarWidth / 2
  const viewportWidth = window.innerWidth
  if (rightEdge > viewportWidth - PADDING) {
    left = viewportWidth - toolbarWidth / 2 - PADDING
  }
  
  return { top, left }
}
```

### RichTextToolbar Component

Location: `components/store/blocks/rich-text-editor/toolbar.tsx`

```typescript
interface ToolbarProps {
  editor: Editor | null
  config?: ToolbarConfig
  className?: string
}
```

Responsibilities:
- Renders formatting buttons based on config
- Manages button active states from editor state
- Handles link input UI (show/hide, URL entry)
- Prevents click events from bubbling to editor

### ToolbarConfig Type

Location: `components/store/blocks/rich-text-editor/types.ts`

```typescript
interface ToolbarConfig {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  heading?: boolean | { levels: (1 | 2 | 3 | 4 | 5 | 6)[] }
  bulletList?: boolean
  orderedList?: boolean
  link?: boolean
  textAlign?: boolean
  code?: boolean
}

const defaultToolbarConfig: ToolbarConfig = {
  bold: true,
  italic: true,
  underline: true,
  strike: false,
  heading: { levels: [1, 2, 3] },
  bulletList: true,
  orderedList: true,
  link: true,
  textAlign: true,
  code: false,
}
```

### useRichTextEditor Hook

Location: `components/store/blocks/rich-text-editor/use-rich-text-editor.ts`

```typescript
interface UseRichTextEditorOptions {
  content: string
  placeholder?: string
  onUpdate?: (html: string) => void
  editable?: boolean
}

interface UseRichTextEditorReturn {
  editor: Editor | null
  setLink: () => void
}
```

Responsibilities:
- Creates and configures TipTap editor instance
- Configures extensions (StarterKit, Underline, Link, TextAlign, Placeholder)
- Handles content updates from external sources
- Provides link setting utility

### BlockActionBar Component

Location: `components/store/blocks/block-action-bar/index.tsx`

```typescript
interface BlockActionBarProps {
  label?: string
  children?: ReactNode
  className?: string
  position?: "top" | "bottom" | "left" | "right"
}

interface BlockActionsProps {
  onMoveUp?: () => void
  onMoveDown?: () => void
  onAddBelow?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  showDragHandle?: boolean
}
```

Compound components:
- `BlockActionBar.Action` - Individual action button
- `BlockActionBar.Group` - Group of related actions
- `BlockActionBar.Separator` - Visual divider
- `BlockActionBar.BlockActions` - Pre-built action set

## Data Models

### TipTap Extensions Configuration

```typescript
const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: "text-primary underline" },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Placeholder.configure({
    placeholder,
    emptyEditorClass: "is-editor-empty",
  }),
]
```

### Message Types (Reused from Inline Editing)

The rich text editor reuses the existing inline editing message types:
- `INLINE_EDIT_START` - Edit session started
- `INLINE_EDIT_CHANGE` - Content changed (debounced)
- `INLINE_EDIT_END` - Edit session ended with save
- `INLINE_EDIT_CANCEL` - Edit session cancelled

### Block Action Message Types

```typescript
type BlockActionType =
  | "BLOCK_MOVE_UP"
  | "BLOCK_MOVE_DOWN"
  | "BLOCK_DUPLICATE"
  | "BLOCK_DELETE"
  | "BLOCK_ADD_BELOW"

interface BlockActionPayload {
  blockId: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Formatting Toggle Consistency

*For any* text selection and any formatting type (bold, italic, underline, strikethrough), clicking the corresponding toolbar button SHALL toggle that formatting on the selection, and clicking again SHALL remove it.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 2: Button Active State Reflects Content

*For any* text selection with formatting applied, the corresponding toolbar button SHALL display an active state, and for unformatted text, the button SHALL display an inactive state.

**Validates: Requirements 3.5, 4.2, 5.3, 6.2, 7.5**

### Property 3: Toolbar Visibility Based on Selection

*For any* text selection that is not collapsed (has length > 0), the floating toolbar SHALL be visible, and for any collapsed selection (cursor only), the toolbar SHALL be hidden.

**Validates: Requirements 2.1, 2.2**

### Property 4: Heading Toggle Behavior

*For any* paragraph, clicking a heading button (H1, H2, H3) SHALL convert it to that heading level, and clicking the same heading button on an active heading SHALL convert it back to a paragraph.

**Validates: Requirements 4.1, 4.3**

### Property 5: Link Application Round-Trip

*For any* text selection and valid URL, applying a link and then reading the link attribute SHALL return the same URL, and removing the link SHALL result in no link attribute.

**Validates: Requirements 7.2, 7.3, 7.4**

### Property 6: Content Sync with Debounce

*For any* content change in the editor, after the debounce period (300ms) without additional changes, an INLINE_EDIT_CHANGE message SHALL be sent with the current HTML content.

**Validates: Requirements 8.1, 8.4**

### Property 7: External Update Handling

*For any* external content update (from settings panel), if the editor is NOT actively being edited, the editor content SHALL update to match, and if the editor IS actively being edited, the external update SHALL NOT override the user's input.

**Validates: Requirements 8.2, 8.3**

### Property 8: Edit Session Lifecycle

*For any* edit session, starting SHALL send INLINE_EDIT_START, ending with save SHALL send INLINE_EDIT_END with new and original values, and ending with cancel (Escape) SHALL send INLINE_EDIT_CANCEL and revert content to original.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 9: Block Move Operations

*For any* block not at the boundary, moving up SHALL decrease its index by 1, moving down SHALL increase its index by 1, and blocks at boundaries SHALL have the corresponding move button disabled.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

### Property 10: Block Duplication Invariants

*For any* block, duplicating SHALL create a new block at index+1 with a unique ID and settings deeply equal to the original (excluding ID).

**Validates: Requirements 12.1, 12.2, 12.3, 12.4**

### Property 11: Block Deletion

*For any* block in the layout, deleting SHALL remove it from the blocks array, and the deletion SHALL be reversible through undo.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 12: Toolbar Config-Driven Rendering

*For any* ToolbarConfig, only the buttons for enabled options SHALL be rendered, and disabled options SHALL NOT appear in the toolbar.

**Validates: Requirements 15.2, 15.4**

### Property 13: Undo/Redo Consistency

*For any* edit session that is saved, triggering undo SHALL revert the content to its pre-edit state, and triggering redo SHALL restore the edited content.

**Validates: Requirements 16.1, 16.2, 16.4**

### Property 14: Content Sanitization

*For any* HTML content containing script tags or event handlers, loading it into the editor SHALL result in content with those elements stripped.

**Validates: Requirements 17.1, 17.2, 17.3**

### Property 15: Toolbar Viewport Constraints

*For any* selection position near viewport edges, the toolbar SHALL be positioned to remain fully visible within the viewport.

**Validates: Requirements 19.1, 19.2, 19.3**

## Error Handling

### TipTap Initialization Failures
- If TipTap fails to initialize, log error and render static HTML fallback
- Graceful degradation to non-editable content

### Invalid HTML Content
- TipTap sanitizes HTML input automatically via ProseMirror schema
- Only whitelisted tags allowed: `p`, `h1-h6`, `strong`, `em`, `u`, `s`, `a`, `ul`, `ol`, `li`, `br`
- Script tags and event handlers are stripped (XSS prevention)
- Malformed HTML is cleaned during initialization

### PostMessage Failures
- Log errors but continue local editing
- Editor store is source of truth on reconnect
- Failed syncs are retried on next change (no queue)

### Link URL Validation
- Empty URLs remove the link
- Relative URLs are supported (e.g., `/products/item`)
- Invalid URLs are accepted (browser handles navigation)

### Sync Conflict Resolution
- Debounce duration: 300ms
- Conflict strategy: Local editing wins (active edit takes precedence)
- External updates are ignored during active edit session
- On edit end, final value is synced to store

### Content Size Limits
- Maximum content size: 50KB per field
- Larger content is truncated with warning

## Undo/Redo Integration

### Scope
- Undo/redo operates at the editor store level (global)
- Each edit session (activation to deactivation) creates one history entry
- Block actions (move, duplicate, delete) each create one history entry

### History Management
- Maximum 50 undo steps maintained
- Oldest entries are discarded when limit reached
- History is cleared on page navigation

### Keyboard Shortcuts
- Cmd+Z (Mac) / Ctrl+Z (Windows): Undo
- Cmd+Shift+Z (Mac) / Ctrl+Shift+Z (Windows): Redo

## Accessibility

### Keyboard Navigation
- Tab: Move to next editable field
- Shift+Tab: Move to previous editable field
- Escape: Cancel editing and revert
- Enter: Save and exit (single-line) or new line (multi-line)

### ARIA Attributes
- Toolbar buttons have `aria-label` for screen readers
- Active formatting states use `aria-pressed`
- Editor has `role="textbox"` and `aria-multiline`

### Focus Management
- Focus ring visible on editable elements
- Focus trapped within toolbar when open
- Focus returns to editor after toolbar interaction

## Mobile/Touch Support

### Current Scope
- Desktop-first implementation
- Touch events work via browser's native handling
- Toolbar may require scrolling on small screens

### Future Considerations
- Responsive toolbar layout for mobile
- Touch-friendly button sizes (44px minimum)
- Long-press for context menu

## Testing Strategy

### Unit Tests

1. **useRichTextEditor Hook**
   - Creates editor with correct extensions
   - Updates content on external changes
   - Prevents update during active editing

2. **RichTextToolbar Component**
   - Renders buttons based on config
   - Shows active state for applied formatting
   - Handles link input show/hide

3. **EditableRichText Component**
   - Initializes in edit mode when in iframe
   - Renders static HTML outside iframe
   - Sends correct postMessage events

4. **BlockActionBar Component**
   - Renders all action buttons
   - Disables move buttons at boundaries
   - Calls correct handlers on click

### Property-Based Tests

Property tests should use a property-based testing library (e.g., fast-check for TypeScript) with minimum 100 iterations per test.

1. **Formatting Toggle Property**
   - Generate random text and formatting type
   - Apply formatting, verify active
   - Remove formatting, verify inactive

2. **Block Move Property**
   - Generate random block array and index
   - Move up/down, verify index change
   - Verify boundary conditions

3. **Block Duplication Property**
   - Generate random block
   - Duplicate, verify new ID and equal settings

### Integration Tests

1. **Editor ↔ Preview Sync**
   - Rich text changes sync to store
   - Store changes sync to preview (when not editing)

2. **Block Actions**
   - Move, duplicate, delete update store
   - Undo reverses block actions

## File Structure

### Existing Files (Already Implemented)
- `components/store/blocks/rich-text-editor/editable-rich-text.tsx`
- `components/store/blocks/rich-text-editor/toolbar.tsx`
- `components/store/blocks/rich-text-editor/types.ts`
- `components/store/blocks/rich-text-editor/use-rich-text-editor.ts`
- `components/store/blocks/rich-text-editor/index.ts`
- `components/store/blocks/block-action-bar/index.tsx`

### Integration Points
- `lib/editor/hooks/use-preview-mode.ts` - Block action handlers
- `lib/editor/hooks/use-editor-preview.ts` - Message handling
- `components/store/blocks/live-block-renderer.tsx` - Block wrapper integration
- `components/store/blocks/editable-block-wrapper.tsx` - Action bar display

