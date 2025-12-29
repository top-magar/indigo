# Implementation Plan: Rich Text Editing Enhancement

## Overview

This implementation plan formalizes and validates the existing rich text editing implementation. Since the core components are already built, the tasks focus on verification, gap resolution, and comprehensive testing.

## Tasks

- [x] 1. Verify Core Rich Text Editor Implementation
  - [x] 1.1 Verify TipTap editor initialization with all required extensions
    - Confirm StarterKit, Underline, Link, TextAlign, Placeholder extensions are configured
    - Verify editor creates successfully with HTML content
    - _Requirements: 1.1, 1.2_

  - [ ]* 1.2 Write property test for formatting toggle consistency
    - **Property 1: Formatting Toggle Consistency**
    - Test bold, italic, underline, strikethrough toggles
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 1.3 Verify static HTML rendering outside editor mode
    - Confirm component renders static HTML when not in iframe
    - _Requirements: 1.3_

- [x] 2. Implement Toolbar Positioning Algorithm
  - [x] 2.1 Update toolbar positioning to handle viewport edges
    - Implement `calculateToolbarPosition` function from design
    - Position below selection when near top edge
    - Constrain to left/right viewport edges with 8px padding
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

  - [ ]* 2.2 Write property test for viewport constraints
    - **Property 15: Toolbar Viewport Constraints**
    - **Validates: Requirements 19.1, 19.2, 19.3**

- [x] 3. Verify Floating Toolbar Functionality
  - [x] 3.1 Verify toolbar visibility based on selection state
    - Confirm toolbar shows on text selection (length > 0)
    - Confirm toolbar hides on collapsed selection (cursor only)
    - _Requirements: 2.1, 2.2_

  - [ ]* 3.2 Write property test for toolbar visibility
    - **Property 3: Toolbar Visibility Based on Selection**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 3.3 Verify toolbar remains visible during button interaction
    - Confirm click on toolbar buttons doesn't hide toolbar
    - _Requirements: 2.4_

- [x] 4. Verify Text Formatting Controls
  - [x] 4.1 Verify all formatting toggles work correctly
    - Test bold, italic, underline, strikethrough toggles
    - Verify keyboard shortcuts (Cmd+B, Cmd+I, Cmd+U)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

  - [ ]* 4.2 Write property test for button active states
    - **Property 2: Button Active State Reflects Content**
    - **Validates: Requirements 3.5, 4.2, 5.3, 6.2, 7.5**

- [x] 5. Verify Heading and List Controls
  - [x] 5.1 Verify heading toggle behavior
    - Test H1, H2, H3 conversion from paragraph
    - Test heading to paragraph conversion on re-click
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 5.2 Write property test for heading toggles
    - **Property 4: Heading Toggle Behavior**
    - **Validates: Requirements 4.1, 4.3**

  - [x] 5.3 Verify list controls
    - Test bullet list toggle
    - Test numbered list toggle
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Verify Text Alignment and Link Controls
  - [x] 6.1 Verify text alignment controls
    - Test left, center, right, justify alignment
    - Verify default left alignment
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.2 Verify link management with inline input
    - Test link button shows inline URL input field
    - Test link creation with URL entry
    - Test link editing (pre-populated URL)
    - Test link removal with unlink button
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 6.3 Write property test for link round-trip
    - **Property 5: Link Application Round-Trip**
    - **Validates: Requirements 7.2, 7.3, 7.4**

- [x] 7. Checkpoint - Core Editor Verification
  - Ensure all formatting controls work correctly
  - Verify toolbar positioning at viewport edges
  - Ask the user if questions arise

- [x] 8. Verify Content Synchronization
  - [x] 8.1 Verify trailing debounce sync (300ms)
    - Confirm changes sync after 300ms of inactivity
    - Verify debounce resets on each keystroke
    - Verify INLINE_EDIT_CHANGE messages are sent
    - _Requirements: 8.1, 8.4_

  - [ ]* 8.2 Write property test for debounced sync
    - **Property 6: Content Sync with Debounce**
    - **Validates: Requirements 8.1, 8.4**

  - [x] 8.3 Verify external update handling with isEditing state
    - Confirm external updates apply when isEditing=false
    - Confirm external updates are ignored when isEditing=true
    - _Requirements: 8.2, 8.3_

  - [ ]* 8.4 Write property test for external updates
    - **Property 7: External Update Handling**
    - **Validates: Requirements 8.2, 8.3**

- [x] 9. Verify Edit Session Management
  - [x] 9.1 Verify edit session lifecycle with isEditing state
    - Test isEditing=true on click/focus (INLINE_EDIT_START)
    - Test isEditing=false on click-outside (INLINE_EDIT_END)
    - Test isEditing=false on Escape (INLINE_EDIT_CANCEL)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 9.2 Write property test for edit session lifecycle
    - **Property 8: Edit Session Lifecycle**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

- [x] 10. Verify Block Action Bar
  - [x] 10.1 Verify block action bar display
    - Confirm action bar appears on block hover
    - Confirm action bar hides on mouse leave
    - Verify all action buttons are present (Move Up/Down, Add, Duplicate, Delete)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 10.2 Verify block move operations
    - Test move up decreases index by 1
    - Test move down increases index by 1
    - Verify Move Up disabled at index 0
    - Verify Move Down disabled at last index
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 10.3 Write property test for block moves
    - **Property 9: Block Move Operations**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [x] 11. Verify Block Duplication and Deletion
  - [x] 11.1 Verify block duplication
    - Test duplicate creates block at index+1
    - Verify new block has unique ID (not same as original)
    - Verify settings are deeply equal (excluding ID)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 11.2 Write property test for duplication
    - **Property 10: Block Duplication Invariants**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

  - [x] 11.3 Verify block deletion
    - Test delete removes block from array
    - Verify deletion is undoable
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ]* 11.4 Write property test for deletion
    - **Property 11: Block Deletion**
    - **Validates: Requirements 13.1, 13.2, 13.3**

- [x] 12. Verify Toolbar Configuration
  - [x] 12.1 Verify config-driven toolbar rendering
    - Test custom config hides disabled buttons
    - Verify default config includes: bold, italic, underline, headings, lists, link, alignment
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ]* 12.2 Write property test for toolbar config
    - **Property 12: Toolbar Config-Driven Rendering**
    - **Validates: Requirements 15.2, 15.4**

- [x] 13. Checkpoint - Block Actions Verification
  - Ensure all block actions work correctly
  - Verify toolbar configuration
  - Ask the user if questions arise

- [x] 14. Verify Undo/Redo Integration
  - [x] 14.1 Verify undo/redo functionality
    - Test Cmd+Z reverts last change
    - Test Cmd+Shift+Z restores undone change
    - Verify edit session creates single history entry
    - Verify block actions create history entries
    - _Requirements: 16.1, 16.2, 16.4, 16.5_

  - [ ]* 14.2 Write property test for undo/redo
    - **Property 13: Undo/Redo Consistency**
    - **Validates: Requirements 16.1, 16.2, 16.4**

- [x] 15. Verify Content Security
  - [x] 15.1 Verify HTML sanitization via TipTap schema
    - Test script tags are stripped on load
    - Test event handlers (onclick, onerror) are removed
    - Verify only whitelisted tags remain: p, h1-h6, strong, em, u, s, a, ul, ol, li, br, span
    - _Requirements: 17.1, 17.2, 17.3_

  - [ ]* 15.2 Write property test for sanitization
    - **Property 14: Content Sanitization**
    - **Validates: Requirements 17.1, 17.2, 17.3**

  - [x] 15.3 Implement content size limit (50KB)
    - Add size check before sync
    - Display warning when limit exceeded
    - Prevent further input when at limit
    - _Requirements: 17.4, 20.4_

- [x] 16. Verify Accessibility
  - [x] 16.1 Add ARIA attributes to toolbar
    - Add aria-label to all toolbar buttons
    - Add aria-pressed to active formatting buttons
    - Add role="textbox" and aria-multiline="true" to editor
    - _Requirements: 18.1, 18.2, 18.3_

  - [x] 16.2 Verify keyboard navigation
    - Test Tab moves to next editable field
    - Test Shift+Tab moves to previous field
    - Verify visible focus ring on editor
    - _Requirements: 18.4, 18.5, 18.6_

- [x] 17. Verify Error Recovery
  - [x] 17.1 Implement sync retry on failure
    - Add error handling to postMessage sync
    - Retry sync on next content change after failure
    - _Requirements: 20.1_

  - [x] 17.2 Verify local editing during disconnection
    - Test edits continue when parent frame unavailable
    - Test content syncs when connection restored
    - _Requirements: 20.2, 20.3_

- [x] 18. Final Checkpoint - Complete Verification
  - Ensure all tests pass
  - Verify TypeScript diagnostics are clean
  - Run full test suite
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests
- Core implementation already exists - tasks focus on verification, gap resolution, and testing
- Property tests should use fast-check with minimum 100 iterations
- Each property test references specific design document properties
- Key implementation gaps to address: toolbar positioning (Task 2), content size limit (Task 15.3), ARIA attributes (Task 16.1), sync retry (Task 17.1)

