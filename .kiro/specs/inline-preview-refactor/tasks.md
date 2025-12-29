# Implementation Plan: Inline Preview Refactor

## Overview

This plan refactors the visual editor from iframe-based to inline rendering. The implementation is structured to allow incremental validation, with the existing iframe preview kept as a fallback/preview mode.

## Tasks

- [x] 1. Extend Editor Store with new state
  - Add `editorMode: 'edit' | 'preview'` state
  - Add `viewport: 'mobile' | 'tablet' | 'desktop'` state
  - Add `setEditorMode` and `setViewport` actions
  - Add selectors: `selectEditorMode`, `selectViewport`
  - _Requirements: 4.1, 9.1_

- [x] 1.1 Write property test for mode switching preserves state
  - **Property 7: Mode Switching Preserves State**
  - **Validates: Requirements 4.4**

- [x] 2. Create InlinePreview component
  - [x] 2.1 Create base InlinePreview component structure
    - Create `app/(editor)/storefront/components/inline-preview.tsx`
    - Render blocks from Editor Store using existing BlockRenderer logic
    - Apply viewport width styling based on store state
    - _Requirements: 1.1, 1.4_

  - [x] 2.2 Implement viewport container with scaling
    - Add viewport width constraints (375px, 768px, 1440px)
    - Implement scale-to-fit when container is smaller than viewport
    - Add dotted background pattern matching existing LivePreview
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 2.3 Write property test for viewport sizing
    - **Property 11: Viewport Sizing**
    - **Validates: Requirements 9.2, 9.3**

- [x] 3. Create EditableBlockWrapper component
  - [x] 3.1 Create wrapper with selection/hover states
    - Create `app/(editor)/storefront/components/editable-block-wrapper.tsx`
    - Add click handler to select block
    - Add hover handlers for highlight state
    - Add visual indicators (ring, label) for selected/hovered states
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Implement event propagation prevention
    - Prevent click events from reaching block content (links, buttons)
    - Use pointer-events: none on content wrapper
    - Allow drag handle interactions
    - _Requirements: 2.4_

  - [x] 3.3 Write property test for event propagation prevention
    - **Property 4: Event Propagation Prevention**
    - **Validates: Requirements 2.4**

  - [x] 3.4 Implement hidden block placeholder
    - Show dimmed overlay for blocks with visible: false
    - Display "Hidden" label on overlay
    - _Requirements: 1.5_

  - [x] 3.5 Write property test for hidden block placeholder
    - **Property 2: Hidden Block Placeholder Rendering**
    - **Validates: Requirements 1.5**

- [x] 4. Integrate drag-and-drop in InlinePreview
  - [x] 4.1 Add DndContext and SortableContext to InlinePreview
    - Wrap blocks in SortableContext
    - Add useSortable hook to EditableBlockWrapper
    - Handle drag end to update block order via Editor Store
    - _Requirements: 7.1, 7.3_

  - [x] 4.2 Add drag preview and drop indicators
    - Show drag preview during drag
    - Show drop indicator between blocks
    - Sync with layers panel drag state
    - _Requirements: 7.2, 7.4_

  - [x] 4.3 Write property test for drag-drop order synchronization
    - **Property 9: Drag-Drop Order Synchronization**
    - **Validates: Requirements 7.3, 7.4**

- [x] 5. Implement BlockActionBar in preview  
  - [x] 5.1 Add action bar to EditableBlockWrapper
    - Show action bar on selection or hover
    - Include move up, move down, duplicate, delete, visibility buttons
    - Position at top-right of block
    - _Requirements: 8.1, 8.2_

  - [x] 5.2 Wire action bar buttons to Editor Store
    - Move up: call moveBlock(index, index - 1)
    - Move down: call moveBlock(index, index + 1)
    - Duplicate: call duplicateBlock(blockId)
    - Delete: show confirmation, then call removeBlock(blockId)
    - Visibility: call updateBlock(blockId, { visible: !visible })
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 5.3 Write property test for move operations
    - **Property 10: Move Operations**
    - **Validates: Requirements 8.3, 8.4**

- [x] 6. Checkpoint - Verify InlinePreview renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement PreviewModeToggle
  - [x] 7.1 Create PreviewModeToggle component
    - Create toggle button group (Edit / Preview)
    - Wire to Editor Store editorMode state
    - _Requirements: 4.1_

  - [x] 7.2 Integrate toggle into PreviewToolbar
    - Add toggle to existing preview toolbar
    - Position alongside viewport controls
    - _Requirements: 4.1_

- [x] 8. Implement mode switching in VisualEditor
  - [x] 8.1 Conditionally render InlinePreview or LivePreview
    - When editorMode === 'edit': render InlinePreview
    - When editorMode === 'preview': render existing LivePreview (iframe)
    - _Requirements: 4.2_

  - [x] 8.2 Disable interactions in preview mode
    - When in preview mode, don't update selection/hover on clicks
    - Hide action bars and edit affordances
    - _Requirements: 4.3_

  - [x] 8.3 Write property test for preview mode disables interactions
    - **Property 6: Preview Mode Disables Interactions**
    - **Validates: Requirements 4.3**

- [x] 9. Implement error boundary and fallback
  - [x] 9.1 Create InlinePreviewErrorBoundary
    - Catch render errors in InlinePreview
    - Display error message
    - Call onError callback to trigger fallback
    - _Requirements: 11.5_

  - [x] 9.2 Implement automatic fallback to iframe preview
    - On InlinePreview error, switch editorMode to 'preview'
    - Show toast notification explaining fallback
    - _Requirements: 11.5_

- [x] 10. Checkpoint - Verify mode switching works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Optimize rendering performance
  - [x] 11.1 Memoize block components
    - Wrap BlockComponent in React.memo
    - Use stable references for props
    - _Requirements: 10.1_

  - [x] 11.2 Optimize Editor Store selectors
    - Use shallow equality for array selectors
    - Create block-specific selectors to prevent cascading re-renders
    - _Requirements: 10.3_

  - [x] 11.3 Write property test for selective re-rendering
    - **Property 12: Selective Re-rendering**
    - **Validates: Requirements 10.2**

- [x] 12. Remove postMessage communication code
  - [x] 12.1 Remove postMessage from InlinePreview flow
    - InlinePreview should not use sendToPreview or sendToEditor
    - Keep postMessage only for LivePreview (iframe preview mode)
    - _Requirements: 6.1, 6.2_

  - [x] 12.2 Simplify Editor Store
    - Remove isPreviewReady state (not needed for inline)
    - Remove setPreviewReady action
    - Keep for backward compatibility with LivePreview
    - _Requirements: 6.1_

- [x] 13. Write remaining property tests
  - [x] 13.1 Write property test for state-to-render synchronization
    - **Property 1: State-to-Render Synchronization**
    - **Validates: Requirements 1.2, 1.3**

  - [x] 13.2 Write property test for block click selection
    - **Property 3: Block Click Selection**
    - **Validates: Requirements 2.1**

  - [x] 13.3 Write property test for inline edit state tracking
    - **Property 5: Inline Edit State Tracking**
    - **Validates: Requirements 3.2, 3.4**

  - [x] 13.4 Write property test for undo/redo history maintenance
    - **Property 8: Undo/Redo History Maintenance**
    - **Validates: Requirements 6.4**

- [x] 14. Final checkpoint - Full integration testing
  - Ensure all tests pass, ask the user if questions arise.
  - Verify save/publish/discard actions work correctly
  - Verify existing block components render without modification
  - Verify Editor Store interface unchanged for settings panels
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

## Notes

- All tasks including property-based tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The existing LivePreview component is kept for preview mode, not deleted
- postMessage communication is kept only for LivePreview (iframe) mode
