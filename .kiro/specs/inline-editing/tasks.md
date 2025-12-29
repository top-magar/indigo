# Implementation Plan: Inline Editing

## Overview

This implementation plan breaks down the inline editing feature into incremental tasks. The approach starts with extending the type system and communication layer, then builds the preview-side editing components, followed by editor-side integration, and finally wires everything together with proper undo/redo support.

## Tasks

- [x] 1. Extend type system and communication layer
  - [x] 1.1 Add inline editing message types and payloads to `lib/editor/types.ts`
    - Add `INLINE_EDIT_START`, `INLINE_EDIT_CHANGE`, `INLINE_EDIT_END`, `INLINE_EDIT_CANCEL`, `FIELD_VALUE_UPDATE` to `EditorMessageType`
    - Add `InlineEditStartPayload`, `InlineEditChangePayload`, `InlineEditEndPayload`, `FieldValueUpdatePayload` interfaces
    - Add `inlineEdit` state to `EditorState` interface
    - _Requirements: 5.4_

  - [x] 1.2 Add message creators and listeners to `lib/editor/communication.ts`
    - Add message creators for all inline edit message types
    - Extend `createPreviewListener` with inline edit handlers
    - Extend `createEditorListener` with field value update handler
    - _Requirements: 5.4_

- [x] 2. Create EditableText component for preview
  - [x] 2.1 Create `components/store/blocks/editable-text.tsx`
    - Implement component with `data-editable-field`, `data-block-id`, `data-field-path` attributes
    - Add hover indicator styles (2px dashed outline on hover in editor mode)
    - Support `multiline` prop for textarea vs text field behavior
    - Support `placeholder` prop for empty field display
    - Render children or value with appropriate HTML element (`as` prop)
    - _Requirements: 1.1, 1.2, 1.4, 8.1, 8.4_

  - [ ]* 2.2 Write property test for data attribute generation
    - **Property CP2: Data Attribute Generation**
    - **Validates: Requirements 1.4**

  - [x] 2.3 Add contenteditable activation on click
    - Make element contenteditable when clicked
    - Place cursor at click position using Selection API
    - Send `INLINE_EDIT_START` message to editor
    - Add focused border style when editing
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 2.4 Implement keyboard event handling
    - Enter on single-line: save and deactivate
    - Enter on multi-line: insert line break
    - Escape: cancel and revert to original value
    - Tab: save and move to next editable field
    - Shift+Tab: save and move to previous editable field
    - _Requirements: 3.5, 4.2, 4.3, 6.1, 6.2, 7.1_

  - [ ]* 2.5 Write property test for Enter key behavior
    - **Property CP9: Enter Behavior - Single Line**
    - **Property CP10: Enter Behavior - Multi Line**
    - **Validates: Requirements 3.5, 7.1**

  - [x] 2.6 Implement click-outside detection and save
    - Add document click listener when editing
    - Save changes and deactivate on click outside
    - Clean up listener on deactivation
    - _Requirements: 4.1_

  - [ ]* 2.7 Write property test for click-outside save
    - **Property CP7: Click-Outside Save**
    - **Validates: Requirements 4.1**

- [x] 3. Checkpoint - Verify EditableText component
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create useInlineEdit hook for preview
  - [x] 4.1 Create `lib/editor/hooks/use-inline-edit.ts`
    - Track active edit state (blockId, fieldPath, originalValue)
    - Implement `startEdit`, `updateValue`, `endEdit`, `isEditing` functions
    - Send postMessage events to editor
    - Implement 300ms debounce for value updates
    - _Requirements: 3.2, 4.4, 5.2_

  - [ ]* 4.2 Write property test for debounced store update
    - **Property CP6: Debounced Store Update**
    - **Validates: Requirements 3.2**

  - [x] 4.3 Implement tab navigation logic
    - Query all `[data-editable-field]` elements in current block
    - Sort by visual position (top, then left)
    - Find next/previous field and activate it
    - Cross-block navigation when at first/last field
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 4.4 Write property test for tab navigation
    - **Property CP14: Tab Navigation Forward**
    - **Property CP15: Tab Navigation Backward**
    - **Property CP16: Tab Navigation Cross-Block**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 5. Extend editor store with inline edit state
  - [x] 5.1 Add inline edit state and actions to `lib/editor/store.ts`
    - Add `inlineEdit` state field
    - Implement `startInlineEdit` action
    - Implement `updateInlineEdit` action (updates block field)
    - Implement `endInlineEdit` action (creates history entry on save, reverts on cancel)
    - _Requirements: 4.4, 4.5, 9.1, 9.4_

  - [ ]* 5.2 Write property test for undo integration
    - **Property CP18: Undo Integration**
    - **Property CP19: Redo Integration**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [x] 6. Checkpoint - Verify store and hook integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrate inline editing into preview hooks
  - [x] 7.1 Update `lib/editor/hooks/use-preview-mode.ts`
    - Add inline edit state to PreviewState
    - Handle `FIELD_VALUE_UPDATE` messages from editor
    - Export inline edit handlers for use by EditableText
    - _Requirements: 5.1, 5.3_

  - [ ]* 7.2 Write property test for settings panel sync
    - **Property CP12: Settings Panel Sync (Panel → Inline)**
    - **Property CP13: Active Edit Conflict Resolution**
    - **Validates: Requirements 5.1, 5.3**

  - [x] 7.3 Update `lib/editor/hooks/use-editor-preview.ts`
    - Handle `INLINE_EDIT_START` - select block in editor
    - Handle `INLINE_EDIT_CHANGE` - update store with debounced value
    - Handle `INLINE_EDIT_END` - finalize edit, create history entry
    - Handle `INLINE_EDIT_CANCEL` - revert to original value
    - Send `FIELD_VALUE_UPDATE` when settings panel changes a field
    - _Requirements: 2.3, 4.4, 4.5, 5.2_

  - [ ]* 7.4 Write property test for block selection on edit
    - **Property CP4: Block Selection on Edit**
    - **Validates: Requirements 2.3**

- [x] 8. Update block components to use EditableText
  - [x] 8.1 Create helper function to identify editable fields
    - Create `lib/editor/fields/editable-fields.ts`
    - Export `isEditableField(fieldType)` - returns true for 'text' and 'textarea'
    - Export `getEditableFields(blockType)` - returns list of editable field paths
    - _Requirements: 1.3_

  - [x] 8.2 Update Hero block variants to use EditableText
    - Wrap `headline` with EditableText (single-line)
    - Wrap `subheadline` with EditableText (multi-line)
    - Wrap `primaryCtaText` and `secondaryCtaText` with EditableText (single-line)
    - _Requirements: 1.4, 2.1_

  - [x] 8.3 Update Header block variants to use EditableText
    - Wrap `logoText` with EditableText (single-line)
    - Wrap `announcementText` with EditableText (single-line)
    - _Requirements: 1.4, 2.1_

  - [x] 8.4 Update Promotional Banner block to use EditableText
    - Wrap `headline` with EditableText (single-line)
    - Wrap `subtext` with EditableText (multi-line)
    - Wrap `ctaText` with EditableText (single-line)
    - Wrap `discountCode` with EditableText (single-line)
    - _Requirements: 1.4, 2.1_

  - [x] 8.5 Update Newsletter block to use EditableText
    - Wrap `headline` with EditableText (single-line)
    - Wrap `subtext` with EditableText (multi-line)
    - Wrap `buttonText` with EditableText (single-line)
    - _Requirements: 1.4, 2.1_

  - [x] 8.6 Update Featured Product block to use EditableText
    - Wrap `customHeadline` with EditableText (single-line)
    - Wrap `customDescription` with EditableText (multi-line)
    - Wrap `badgeText` with EditableText (single-line)
    - _Requirements: 1.4, 2.1_

  - [x] 8.7 Update Product Grid block to use EditableText
    - Wrap `sectionTitle` with EditableText (single-line)
    - _Requirements: 1.4, 2.1_

  - [x] 8.8 Update Testimonials block to use EditableText
    - Wrap `sectionTitle` with EditableText (single-line)
    - _Requirements: 1.4, 2.1_

  - [x] 8.9 Update Footer block to use EditableText
    - Wrap `logoText` with EditableText (single-line)
    - Wrap `copyrightText` with EditableText (single-line)
    - Wrap `contactEmail`, `contactPhone` with EditableText (single-line)
    - Wrap `address` with EditableText (multi-line)
    - _Requirements: 1.4, 2.1_

- [x] 9. Checkpoint - Verify block integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Add CSS styles for inline editing
  - [x] 10.1 Add inline editing styles to `app/globals.css`
    - Add `.editable-field-hover` class for hover indicator (2px dashed outline)
    - Add `.editable-field-active` class for editing state (solid border)
    - Add `.editable-field-placeholder` class for empty field placeholder (opacity, italic)
    - Ensure styles only apply in editor mode (check for parent class or data attribute)
    - _Requirements: 1.1, 2.4, 8.4_

  - [ ]* 10.2 Write property test for hover indicator display
    - **Property CP1: Hover Indicator Display**
    - **Validates: Requirements 1.1, 1.2**

- [x] 11. Wire up bidirectional sync
  - [x] 11.1 Update settings panel to send field updates to preview
    - Modify field change handlers to send `FIELD_VALUE_UPDATE` message
    - Ensure updates don't conflict with active inline edits
    - _Requirements: 5.1, 5.3_

  - [ ]* 11.2 Write property test for inline to panel sync
    - **Property CP11: Settings Panel Sync (Inline → Panel)**
    - **Validates: Requirements 5.2**

- [x] 12. Final checkpoint - Full integration test
  - Ensure all tests pass, ask the user if questions arise.
  - Verify inline editing works end-to-end in the visual editor

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The implementation uses TypeScript throughout, matching the existing codebase
