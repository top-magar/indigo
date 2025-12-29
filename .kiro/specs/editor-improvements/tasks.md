# Implementation Plan: Editor Improvements

## Overview

This implementation plan covers comprehensive improvements to the Visual Store Editor, organized into three phases. Each phase builds on the previous, allowing incremental delivery and testing.

## Tasks

### Phase 1: Core Enhancements

- [x] 1. Implement Autosave Service
  - [x] 1.1 Create autosave service with debounce logic
    - Create `lib/editor/autosave.ts` with AutosaveService class
    - Implement debounce timer with configurable delay (default 3s)
    - Add start, stop, cancel, retry methods
    - _Requirements: 1.1, 1.2, 1.3, 1.7_

  - [x] 1.2 Add autosave state to Editor Store
    - Extend EditorState with autosaveStatus, lastAutosaveAt, autosaveError
    - Add setAutosaveStatus action
    - _Requirements: 1.4, 1.5, 1.6_

  - [x] 1.3 Create useAutosave hook
    - Create `lib/editor/hooks/use-autosave.ts`
    - Integrate with Editor Store and server actions
    - Handle retry logic with exponential backoff
    - _Requirements: 1.1, 1.2, 1.6_

  - [x] 1.4 Integrate autosave into Visual Editor
    - Add autosave status indicator to header
    - Cancel autosave on manual save
    - Display "Auto-saving..." and "Auto-saved" states
    - _Requirements: 1.4, 1.5, 1.7_

  - [x] 1.5 Write property tests for autosave
    - **Property 1: Autosave Debounce Behavior**
    - **Property 2: Autosave Status Transitions**
    - **Property 3: Manual Save Cancels Autosave**
    - **Validates: Requirements 1.1-1.7**

- [x] 2. Implement Clipboard Manager
  - [x] 2.1 Create clipboard manager utility
    - Create `lib/editor/clipboard.ts` with ClipboardManager
    - Implement copy/paste using Clipboard API with localStorage fallback
    - Handle block serialization/deserialization
    - _Requirements: 3.1, 3.6_

  - [x] 2.2 Add clipboard state to Editor Store
    - Add clipboardBlock state for in-memory clipboard
    - Add copyBlock and pasteBlock actions
    - Generate new unique IDs on paste
    - _Requirements: 3.2, 3.5, 3.7_

  - [x] 2.3 Create useBlockClipboard hook
    - Create `lib/editor/hooks/use-block-clipboard.ts`
    - Expose copy, paste, canPaste
    - Handle edge case of no selection on paste
    - _Requirements: 3.2, 3.3_

  - [x] 2.4 Add keyboard shortcuts for copy/paste
    - Add Cmd/Ctrl+C handler in Visual Editor
    - Add Cmd/Ctrl+V handler in Visual Editor
    - Show toast notifications on copy/paste
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 2.5 Write property tests for clipboard
    - **Property 4: Clipboard Round-Trip**
    - **Validates: Requirements 3.1, 3.2, 3.5, 3.7**

- [x] 3. Implement Optimistic Updates
  - [x] 3.1 Refactor save handler for optimistic updates
    - Update handleSave to set status immediately
    - Implement rollback on failure
    - Add pending state to disable conflicting actions
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 3.2 Refactor publish handler for optimistic updates
    - Update handlePublish to set status immediately
    - Implement rollback on failure
    - Show toast with retry option on error
    - _Requirements: 5.3, 5.4, 5.6_

  - [x] 3.3 Write property tests for optimistic updates
    - **Property 8: Save Optimistic Update with Rollback**
    - **Property 9: Publish Optimistic Update with Rollback**
    - **Validates: Requirements 5.1-5.6**

- [x] 4. Enhance Drag Feedback
  - [x] 4.1 Create animated drop indicator component
    - Create `components/editor/animated-drop-indicator.tsx`
    - Add glow effect and smooth animation
    - Support above/below positioning
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 Create ghost preview component
    - Create `components/editor/block-ghost-preview.tsx`
    - Show semi-transparent preview at target position
    - Calculate and display final position
    - _Requirements: 2.3_

  - [x] 4.3 Integrate enhanced drag feedback into InlinePreview
    - Replace basic drop indicator with animated version
    - Add ghost preview during drag
    - Improve drag start/end animations
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 4.4 Write property tests for drag operations
    - **Property 5: Drag Operation Correctness**
    - **Validates: Requirements 2.3, 2.5, 2.6**

- [ ] 5. Checkpoint - Phase 1 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify autosave works correctly with debounce
  - Verify copy/paste works across the editor
  - Verify optimistic updates show immediate feedback
  - Verify enhanced drag feedback is smooth

### Phase 2: UI Features

- [ ] 6. Implement Block Templates
  - [ ] 6.1 Create template registry
    - Create `lib/editor/templates.ts` with BLOCK_TEMPLATES array
    - Define 2-3 templates per block type
    - Include recommended flag and thumbnails
    - _Requirements: 4.1, 4.2, 4.4, 4.6_

  - [ ] 6.2 Update BlockPalette to show templates
    - Modify `components/editor/block-palette.tsx`
    - Group templates by block type
    - Show template previews on hover
    - _Requirements: 4.1, 4.5_

  - [ ] 6.3 Implement template selection handler
    - Add template to block with pre-configured settings
    - Select newly added block
    - _Requirements: 4.3_

  - [ ] 6.4 Write property tests for templates
    - **Property 6: Template Registry Completeness**
    - **Property 7: Template Application Correctness**
    - **Validates: Requirements 4.1-4.6**

- [ ] 7. Implement Version History UI
  - [ ] 7.1 Add history metadata to Editor Store
    - Extend store with historyMeta array
    - Add generateHistoryEntry function
    - Track history entries on each operation
    - _Requirements: 6.2, 6.3_

  - [ ] 7.2 Create HistoryPanel component
    - Create `components/editor/history-panel.tsx`
    - Display timeline of changes with descriptions
    - Show current position indicator
    - _Requirements: 6.1, 6.5_

  - [ ] 7.3 Implement history navigation
    - Add restoreToHistoryEntry action
    - Clear future entries on backward navigation
    - Support keyboard navigation (up/down arrows)
    - _Requirements: 6.4, 6.6, 6.7_

  - [ ] 7.4 Add history button to toolbar
    - Add history icon button to Visual Editor header
    - Toggle history panel visibility
    - _Requirements: 6.1_

  - [ ] 7.5 Write property tests for history
    - **Property 10: History Entry Generation**
    - **Property 11: History Navigation Correctness**
    - **Validates: Requirements 6.2-6.7**

- [ ] 8. Implement Accessibility Improvements
  - [ ] 8.1 Create accessibility announcer
    - Create `lib/editor/accessibility.ts` with AccessibilityAnnouncer
    - Implement announce function with aria-live region
    - Add block-specific announcement helpers
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 8.2 Implement keyboard navigation
    - Create `lib/editor/hooks/use-block-keyboard-navigation.ts`
    - Support Tab and Arrow key navigation
    - Manage focus after block operations
    - _Requirements: 7.3, 7.5_

  - [ ] 8.3 Add ARIA labels to block action bar
    - Update BlockActionBar with proper ARIA attributes
    - Ensure all buttons have accessible labels
    - Add visible focus indicators
    - _Requirements: 7.6, 7.7_

  - [ ] 8.4 Integrate accessibility into Visual Editor
    - Add announcer to selection/reorder handlers
    - Connect keyboard navigation hook
    - Test with screen reader
    - _Requirements: 7.1-7.5_

  - [ ] 8.5 Write property tests for accessibility
    - **Property 12: Screen Reader Announcements**
    - **Property 13: Keyboard Navigation Completeness**
    - **Validates: Requirements 7.1-7.5**

- [ ] 9. Checkpoint - Phase 2 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify block templates appear in palette
  - Verify history panel shows changes
  - Verify keyboard navigation works
  - Verify screen reader announcements work

### Phase 3: Foundation Features

- [ ] 10. Implement Mobile/Touch Support
  - [ ] 10.1 Create touch gesture handler
    - Create `lib/editor/touch-gestures.ts`
    - Implement long-press detection for drag
    - Implement pinch-to-zoom detection
    - _Requirements: 8.2, 8.6_

  - [ ] 10.2 Create useTouchGestures hook
    - Create `lib/editor/hooks/use-touch-gestures.ts`
    - Detect touch device
    - Provide gesture event handlers
    - _Requirements: 8.1, 8.5_

  - [ ] 10.3 Update InlinePreview for touch support
    - Add touch event handlers to blocks
    - Implement long-press to drag
    - Add pinch-to-zoom to preview container
    - _Requirements: 8.1, 8.2, 8.6_

  - [ ] 10.4 Update block action bar for touch
    - Increase touch target sizes to 44x44px minimum
    - Show touch-optimized controls on touch devices
    - _Requirements: 8.3, 8.5_

  - [ ] 10.5 Write property tests for touch
    - **Property 14: Touch Gesture Recognition**
    - **Property 15: Touch Mode Behavior**
    - **Validates: Requirements 8.1, 8.2, 8.5, 8.6**

- [ ] 11. Implement Nested Blocks Foundation
  - [ ] 11.1 Extend block types for nesting
    - Add parentId and children fields to StoreBlock type
    - Create container block type definition
    - _Requirements: 9.1, 9.2_

  - [ ] 11.2 Add nested block actions to Editor Store
    - Add addChildBlock, removeFromParent, moveToParent actions
    - Maintain order indices within parent context
    - Handle parent removal (promote children or cascade delete)
    - _Requirements: 9.1, 9.6_

  - [ ] 11.3 Update InlinePreview for nested rendering
    - Implement recursive block rendering
    - Support drag-and-drop into/out of containers
    - _Requirements: 9.3, 9.4_

  - [ ] 11.4 Update layers panel for hierarchy
    - Show nested blocks with indentation
    - Display parent-child relationships
    - _Requirements: 9.5_

  - [ ] 11.5 Write property tests for nested blocks
    - **Property 16: Nested Block Hierarchy Integrity**
    - **Property 17: Nested Block Operations**
    - **Validates: Requirements 9.1, 9.3-9.6**

- [ ] 12. Implement Collaboration Foundation
  - [ ] 12.1 Create collaboration types and state
    - Create `lib/editor/collaboration.ts` with types
    - Add collaborators array to Editor Store
    - Define presence and conflict interfaces
    - _Requirements: 10.1, 10.4_

  - [ ] 12.2 Create collaboration service (mock)
    - Implement CollaborationService interface
    - Create mock implementation for testing
    - Support connect, disconnect, broadcast methods
    - _Requirements: 10.1, 10.6_

  - [ ] 12.3 Create presence indicators component
    - Create `components/editor/presence-indicators.tsx`
    - Display collaborator avatars/names
    - Show remote selections with distinct colors
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 12.4 Create conflict resolution UI
    - Create `components/editor/conflict-dialog.tsx`
    - Show conflict details and resolution options
    - Support mine/theirs/merge strategies
    - _Requirements: 10.4, 10.5_

  - [ ] 12.5 Write property tests for collaboration
    - **Property 18: Presence Display**
    - **Property 19: Conflict Resolution**
    - **Validates: Requirements 10.1-10.5**

- [ ] 13. Checkpoint - Phase 3 Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify touch gestures work on mobile
  - Verify nested blocks can be created and managed
  - Verify collaboration presence indicators display
  - Verify conflict resolution UI works

- [ ] 14. Final Integration Testing
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all features work together
  - Test autosave with collaboration
  - Test nested blocks with drag-and-drop
  - Test accessibility with all new features
  - _Requirements: All_

## Notes

- All tasks including property-based tests are required for comprehensive coverage
- Each phase can be delivered independently
- Phase 3 features (nested blocks, collaboration) are foundational - full implementation may require additional specs
- The collaboration service is a mock implementation - real-time sync requires backend infrastructure
- Touch support should be tested on actual devices
- Accessibility should be tested with screen readers (VoiceOver, NVDA)
