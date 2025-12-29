# Design Document

## Overview

This design implements inline editing for the storefront visual editor, enabling users to click on text elements directly in the preview iframe and edit them in place. The implementation extends the existing postMessage communication bridge to support bidirectional inline edit synchronization between the editor and preview.

The architecture follows a "preview-driven editing" model where the preview iframe owns the inline editing UI (contenteditable elements), while the editor maintains the source of truth for block data and undo/redo history.

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              EDITOR                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │ Zustand Store │◄──►│ useEditorPre │◄──►│ Settings Panel           │  │
│  │ (blocks,      │    │ view Hook    │    │ (reflects inline edits)  │  │
│  │  history)     │    └──────┬───────┘    └──────────────────────────┘  │
│  └──────────────┘            │                                          │
│                              │ postMessage                              │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────────┐
│                              ▼           PREVIEW IFRAME                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │ usePreviewMo │◄──►│ useInlineEdi │◄──►│ EditableText Components  │  │
│  │ de Hook      │    │ t Hook       │    │ (contenteditable)        │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Contenteditable over Input Overlays**: Use native `contenteditable` on text elements to preserve exact styling and positioning, rather than overlaying input elements.

2. **Preview Owns Edit UI**: The preview iframe manages the inline editing state and UI, sending change events to the editor. This keeps the editing experience smooth without cross-frame DOM manipulation.

3. **Debounced Sync**: Text input syncs to the editor store after a 300ms debounce to avoid excessive postMessage traffic and history entries.

4. **Single History Entry per Edit Session**: Each inline edit session (activation to deactivation) creates one undo history entry, not one per keystroke.

## Components and Interfaces

### New Message Types

Extend `EditorMessageType` in `lib/editor/types.ts`:

```typescript
export type EditorMessageType =
  | "EDITOR_READY"
  | "PREVIEW_READY"
  | "BLOCKS_UPDATE"
  | "SELECT_BLOCK"
  | "HIGHLIGHT_BLOCK"
  | "SCROLL_TO_BLOCK"
  | "PREVIEW_CLICK"
  | "PREVIEW_HOVER"
  // New inline editing messages
  | "INLINE_EDIT_START"    // Preview -> Editor: User started inline editing
  | "INLINE_EDIT_CHANGE"   // Preview -> Editor: Text content changed
  | "INLINE_EDIT_END"      // Preview -> Editor: User finished editing
  | "INLINE_EDIT_CANCEL"   // Preview -> Editor: User cancelled (Escape)
  | "FIELD_VALUE_UPDATE"   // Editor -> Preview: Settings panel changed a field
```

### New Payload Types

```typescript
export interface InlineEditStartPayload {
  blockId: string
  fieldPath: string        // e.g., "headline", "settings.items[0].title"
  originalValue: string
}

export interface InlineEditChangePayload {
  blockId: string
  fieldPath: string
  value: string
}

export interface InlineEditEndPayload {
  blockId: string
  fieldPath: string
  value: string
  originalValue: string    // For undo history
}

export interface FieldValueUpdatePayload {
  blockId: string
  fieldPath: string
  value: string
}
```

### EditableText Component

New component for preview: `components/store/blocks/editable-text.tsx`

```typescript
interface EditableTextProps {
  blockId: string
  fieldPath: string
  value: string
  placeholder?: string
  multiline?: boolean
  className?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div'
  children?: React.ReactNode
}
```

Responsibilities:
- Renders text with `data-editable-field`, `data-block-id`, `data-field-path` attributes
- Shows hover indicator when in editor mode
- Activates contenteditable on click
- Handles keyboard events (Enter, Escape, Tab)
- Sends change events via postMessage
- Shows placeholder when empty

### useInlineEdit Hook

New hook for preview: `lib/editor/hooks/use-inline-edit.ts`

```typescript
interface InlineEditState {
  activeBlockId: string | null
  activeFieldPath: string | null
  originalValue: string | null
}

interface UseInlineEditReturn {
  state: InlineEditState
  startEdit: (blockId: string, fieldPath: string, value: string) => void
  updateValue: (value: string) => void
  endEdit: (save: boolean) => void
  isEditing: (blockId: string, fieldPath: string) => boolean
}
```

### Editor Store Extensions

Add to `EditorState` in `lib/editor/types.ts`:

```typescript
export interface EditorState {
  // ... existing fields
  inlineEdit: {
    blockId: string | null
    fieldPath: string | null
    originalValue: string | null
  } | null
}
```

Add to `EditorActions`:

```typescript
export interface EditorActions {
  // ... existing actions
  startInlineEdit: (blockId: string, fieldPath: string, originalValue: string) => void
  updateInlineEdit: (value: string) => void
  endInlineEdit: (save: boolean) => void
}
```

## Data Models

### Editable Field Mapping

Fields eligible for inline editing are determined by their type in `BLOCK_FIELD_SCHEMAS`:

| Field Type | Inline Editable | Multiline |
|------------|-----------------|-----------|
| `text`     | Yes             | No        |
| `textarea` | Yes             | Yes       |
| `url`      | No              | -         |
| `number`   | No              | -         |
| `boolean`  | No              | -         |
| `select`   | No              | -         |
| `image`    | No              | -         |
| `color`    | No              | -         |
| `array`    | No (items may be)| -        |
| `product`  | No              | -         |
| `collection`| No             | -         |

### Field Path Convention

Field paths use dot notation with array indexing:
- Simple: `"headline"`, `"subheadline"`, `"buttonText"`
- Nested: `"settings.items[0].title"`, `"columns[1].links[2].label"`

### Tab Order

Tab navigation follows DOM order within a block, then moves to the next block. The order is determined by:
1. Query all `[data-editable-field]` elements within current block
2. Sort by `getBoundingClientRect().top`, then `.left`
3. On last field, query next block's editable fields

## Correctness Properties

### CP1: Hover Indicator Display
- GIVEN a text element with `data-editable-field` attribute
- WHEN the user hovers over it in editor mode
- THEN a visual indicator (2px dashed outline) SHALL appear
- AND the indicator SHALL disappear when hover ends

### CP2: Data Attribute Generation
- GIVEN a block with text/textarea fields in its schema
- WHEN the block renders in the preview
- THEN each editable text element SHALL have:
  - `data-editable-field="true"`
  - `data-block-id="{blockId}"`
  - `data-field-path="{fieldPath}"`

### CP3: Click Activation
- GIVEN an editable text element
- WHEN the user clicks on it
- THEN the element SHALL become contenteditable
- AND the cursor SHALL be placed at the click position
- AND `INLINE_EDIT_START` message SHALL be sent to editor

### CP4: Block Selection on Edit
- GIVEN an inline edit is activated
- WHEN `INLINE_EDIT_START` is received by editor
- THEN the corresponding block SHALL be selected in the layers panel

### CP5: Text Input Display
- GIVEN an active inline editor
- WHEN the user types characters
- THEN the characters SHALL appear immediately in the element
- AND the element SHALL maintain its original CSS styling

### CP6: Debounced Store Update
- GIVEN an active inline editor with text changes
- WHEN 300ms passes without new input
- THEN `INLINE_EDIT_CHANGE` SHALL be sent to editor
- AND the editor store SHALL update the block field

### CP7: Click-Outside Save
- GIVEN an active inline editor
- WHEN the user clicks outside the editable element
- THEN the edit SHALL be saved
- AND `INLINE_EDIT_END` SHALL be sent with `save: true`

### CP8: Escape Cancel
- GIVEN an active inline editor
- WHEN the user presses Escape
- THEN the edit SHALL be cancelled
- AND the original value SHALL be restored
- AND `INLINE_EDIT_END` SHALL be sent with `save: false`

### CP9: Enter Behavior - Single Line
- GIVEN an active inline editor on a single-line field (type: "text")
- WHEN the user presses Enter
- THEN the edit SHALL be saved and deactivated
- AND no line break SHALL be inserted

### CP10: Enter Behavior - Multi Line
- GIVEN an active inline editor on a multi-line field (type: "textarea")
- WHEN the user presses Enter
- THEN a line break SHALL be inserted
- AND the editor SHALL remain active

### CP11: Settings Panel Sync (Inline → Panel)
- GIVEN an inline edit that is saved
- WHEN the editor store updates
- THEN the settings panel field SHALL reflect the new value

### CP12: Settings Panel Sync (Panel → Inline)
- GIVEN a field being edited in the settings panel
- WHEN the value changes
- THEN `FIELD_VALUE_UPDATE` SHALL be sent to preview
- AND the preview text SHALL update (if not actively being inline edited)

### CP13: Active Edit Conflict Resolution
- GIVEN an active inline editor on field X
- WHEN the settings panel updates field X
- THEN the inline editor SHALL NOT update (user input takes precedence)
- AND the settings panel change SHALL be queued until edit ends

### CP14: Tab Navigation Forward
- GIVEN an active inline editor
- WHEN the user presses Tab
- THEN focus SHALL move to the next editable field (by visual position)
- AND the current edit SHALL be saved

### CP15: Tab Navigation Backward
- GIVEN an active inline editor
- WHEN the user presses Shift+Tab
- THEN focus SHALL move to the previous editable field
- AND the current edit SHALL be saved

### CP16: Tab Navigation Cross-Block
- GIVEN an active inline editor on the last field of a block
- WHEN the user presses Tab
- THEN focus SHALL move to the first editable field of the next block

### CP17: Empty Field Placeholder
- GIVEN an optional text field with empty value
- WHEN rendered in editor mode
- THEN a placeholder SHALL be displayed
- AND the placeholder SHALL have `opacity: 0.5` and `font-style: italic`

### CP18: Undo Integration
- GIVEN an inline edit session that was saved
- WHEN the user triggers undo (Cmd+Z)
- THEN the field SHALL revert to its pre-edit value
- AND the preview SHALL update to show the reverted value

### CP19: Redo Integration
- GIVEN an undone inline edit
- WHEN the user triggers redo (Cmd+Shift+Z)
- THEN the field SHALL restore to the edited value
- AND the preview SHALL update to show the restored value

## Error Handling

### Communication Failures
- If postMessage fails, log error and continue (graceful degradation)
- Preview maintains local state; editor is source of truth on reconnect

### Invalid Field Paths
- If `fieldPath` doesn't exist in block schema, ignore the edit
- Log warning in development mode

### Concurrent Edit Conflicts
- Settings panel edits during active inline edit are queued
- Queue is applied when inline edit ends
- If queued value differs from saved value, queued value wins (last write wins)

### Empty Required Fields
- If user clears a required field and exits, show validation error
- Revert to original value if validation fails

## Testing Strategy

### Unit Tests

1. **EditableText Component**
   - Renders with correct data attributes
   - Shows hover indicator in editor mode
   - Activates contenteditable on click
   - Handles Enter/Escape/Tab correctly
   - Shows placeholder when empty

2. **useInlineEdit Hook**
   - Tracks active edit state
   - Sends correct postMessage events
   - Debounces value updates
   - Handles save/cancel correctly

3. **Editor Store Extensions**
   - `startInlineEdit` sets state correctly
   - `updateInlineEdit` updates block field
   - `endInlineEdit` creates history entry (save) or reverts (cancel)

### Integration Tests

1. **Editor ↔ Preview Communication**
   - `INLINE_EDIT_START` selects block in editor
   - `INLINE_EDIT_CHANGE` updates store after debounce
   - `INLINE_EDIT_END` creates undo history entry
   - `FIELD_VALUE_UPDATE` updates preview text

2. **Bidirectional Sync**
   - Inline edit updates settings panel
   - Settings panel edit updates preview (when not inline editing)

3. **Undo/Redo**
   - Inline edit can be undone
   - Undone edit can be redone
   - Multiple inline edits create separate history entries

### E2E Tests

1. **Full Inline Edit Flow**
   - Click on headline → edit → click outside → verify saved
   - Click on headline → edit → press Escape → verify reverted
   - Tab through multiple fields → verify all saved

2. **Keyboard Navigation**
   - Tab moves to next field
   - Shift+Tab moves to previous field
   - Tab on last field moves to next block

## File Changes Summary

### New Files
- `lib/editor/hooks/use-inline-edit.ts` - Preview-side inline edit hook
- `components/store/blocks/editable-text.tsx` - Editable text wrapper component

### Modified Files
- `lib/editor/types.ts` - Add new message types and payloads
- `lib/editor/communication.ts` - Add message creators and listeners for inline edit
- `lib/editor/store.ts` - Add inline edit state and actions
- `lib/editor/hooks/use-preview-mode.ts` - Integrate inline edit handling
- `lib/editor/hooks/use-editor-preview.ts` - Handle inline edit messages from preview
- `components/store/blocks/live-block-renderer.tsx` - Wrap text fields with EditableText
- Block variant components (hero, header, etc.) - Use EditableText for text fields
