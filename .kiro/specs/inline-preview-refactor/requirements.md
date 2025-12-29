# Requirements Document

## Introduction

This specification defines the refactoring of the visual storefront editor from an iframe-based architecture to a Puck-style inline rendering architecture. The current implementation uses postMessage communication between the editor frame and a preview iframe, creating synchronization complexity and latency. The new architecture will render blocks directly in the editor's React tree, eliminating the dual-state problem while maintaining a "Preview Mode" toggle for true WYSIWYG verification.

## Glossary

- **Visual_Editor**: The main editor component that allows merchants to customize their storefront layout
- **Inline_Preview**: The new preview area that renders blocks directly in the editor's React tree without an iframe
- **Preview_Mode**: A toggle that switches to iframe-based preview for true WYSIWYG verification
- **Block_Component**: A React component that renders a specific block type (header, hero, product-grid, etc.)
- **Editable_Block_Wrapper**: A wrapper component that adds selection, hover, and editing capabilities to blocks
- **Editor_Store**: The Zustand store that manages editor state (blocks, selection, history)
- **Block_Registry**: The registry that maps block types to their metadata and components

## Requirements

### Requirement 1: Inline Block Rendering

**User Story:** As a merchant, I want to see my storefront blocks rendered directly in the editor, so that I can edit them with instant visual feedback.

#### Acceptance Criteria

1. WHEN the Visual_Editor loads, THE Inline_Preview SHALL render all visible blocks directly in the React tree without using an iframe
2. WHEN a block's settings are updated, THE Inline_Preview SHALL reflect the changes immediately without postMessage delay
3. WHEN blocks are reordered via drag-and-drop, THE Inline_Preview SHALL update the visual order instantly
4. THE Inline_Preview SHALL render blocks using the same Block_Component implementations used in the production storefront
5. WHEN a block is hidden (visible: false), THE Inline_Preview SHALL show a dimmed placeholder instead of hiding it completely

### Requirement 2: Block Selection and Interaction

**User Story:** As a merchant, I want to click on blocks in the preview to select them, so that I can edit their settings in the side panel.

#### Acceptance Criteria

1. WHEN a user clicks on a block in the Inline_Preview, THE Visual_Editor SHALL select that block and show its settings panel
2. WHEN a user hovers over a block, THE Editable_Block_Wrapper SHALL display a highlight border and block type label
3. WHEN a block is selected, THE Editable_Block_Wrapper SHALL display a selection ring and action bar
4. THE Editable_Block_Wrapper SHALL prevent click events from propagating to block content (links, buttons) during edit mode
5. WHEN a user presses Escape, THE Visual_Editor SHALL deselect the current block

### Requirement 3: Inline Text Editing

**User Story:** As a merchant, I want to edit text directly in the preview by clicking on it, so that I can see exactly how my changes look.

#### Acceptance Criteria

1. WHEN a user double-clicks on an editable text field, THE Inline_Preview SHALL enable contenteditable mode for that field
2. WHILE inline editing is active, THE Editor_Store SHALL track the editing state and original value
3. WHEN the user clicks outside or presses Enter, THE Inline_Preview SHALL save the changes to the Editor_Store
4. WHEN the user presses Escape during inline editing, THE Inline_Preview SHALL revert to the original value
5. WHEN inline editing changes are saved, THE settings panel SHALL reflect the updated value

### Requirement 4: Preview Mode Toggle

**User Story:** As a merchant, I want to toggle to a true preview mode, so that I can verify exactly how my storefront will look to customers.

#### Acceptance Criteria

1. THE Visual_Editor SHALL provide a toggle button to switch between Edit Mode and Preview Mode
2. WHEN Preview Mode is enabled, THE Visual_Editor SHALL render the storefront in an iframe at the actual store URL
3. WHILE in Preview Mode, THE Visual_Editor SHALL disable block selection and editing interactions
4. WHEN switching from Preview Mode to Edit Mode, THE Visual_Editor SHALL restore the inline preview with current block state
5. THE Preview Mode iframe SHALL include viewport controls (mobile, tablet, desktop) from the existing LivePreview component

### Requirement 5: CSS Isolation

**User Story:** As a merchant, I want the preview to accurately reflect my storefront styles, so that I can trust the visual representation.

#### Acceptance Criteria

1. THE Inline_Preview SHALL apply storefront styles without affecting editor UI styles
2. THE Inline_Preview SHALL use a scoped container with appropriate CSS isolation
3. WHEN storefront blocks use Tailwind classes, THE Inline_Preview SHALL render them correctly
4. THE Inline_Preview SHALL support the store's theme settings (colors, fonts, border-radius)
5. IF a style conflict occurs between editor and preview, THE editor styles SHALL take precedence for editor UI elements

### Requirement 6: State Management Simplification

**User Story:** As a developer, I want a single source of truth for editor state, so that I can avoid synchronization bugs.

#### Acceptance Criteria

1. THE Visual_Editor SHALL use only the Editor_Store (Zustand) for all block state management
2. THE Visual_Editor SHALL NOT use postMessage for block updates between editor and preview
3. WHEN the Editor_Store updates, THE Inline_Preview SHALL re-render affected blocks via React's normal rendering
4. THE Editor_Store SHALL maintain undo/redo history for all block operations
5. WHEN the editor unmounts, THE Editor_Store SHALL preserve unsaved changes for recovery

### Requirement 7: Drag and Drop in Preview

**User Story:** As a merchant, I want to drag blocks directly in the preview area to reorder them, so that I can visually arrange my storefront.

#### Acceptance Criteria

1. THE Inline_Preview SHALL support drag-and-drop reordering of blocks using dnd-kit
2. WHEN a block is being dragged, THE Inline_Preview SHALL show a drag preview and drop indicators
3. WHEN a block is dropped in a new position, THE Editor_Store SHALL update block order and trigger re-render
4. THE drag-and-drop in Inline_Preview SHALL be synchronized with the layers panel on the left
5. WHEN dragging from the block palette, THE Inline_Preview SHALL show valid drop zones

### Requirement 8: Block Action Bar

**User Story:** As a merchant, I want quick access to common block actions, so that I can efficiently manage my storefront layout.

#### Acceptance Criteria

1. WHEN a block is selected or hovered, THE Editable_Block_Wrapper SHALL display an action bar
2. THE action bar SHALL include buttons for: move up, move down, duplicate, delete, and visibility toggle
3. WHEN the move up button is clicked, THE Editor_Store SHALL move the block one position earlier
4. WHEN the move down button is clicked, THE Editor_Store SHALL move the block one position later
5. WHEN the delete button is clicked, THE Visual_Editor SHALL show a confirmation dialog before removing the block

### Requirement 9: Responsive Preview

**User Story:** As a merchant, I want to preview my storefront at different screen sizes, so that I can ensure it looks good on all devices.

#### Acceptance Criteria

1. THE Inline_Preview SHALL support viewport size controls (mobile: 375px, tablet: 768px, desktop: 1440px)
2. WHEN a viewport size is selected, THE Inline_Preview container SHALL resize to that width
3. THE Inline_Preview SHALL scale the content to fit within the available space when necessary
4. WHEN the viewport changes, THE blocks SHALL re-render with responsive styles applied
5. THE current viewport selection SHALL persist during the editing session

### Requirement 10: Performance Optimization

**User Story:** As a merchant, I want the editor to remain responsive even with many blocks, so that I can work efficiently.

#### Acceptance Criteria

1. THE Inline_Preview SHALL use React.memo to prevent unnecessary re-renders of unchanged blocks
2. WHEN editing a single block, THE Inline_Preview SHALL only re-render that specific block
3. THE Editor_Store selectors SHALL be optimized to prevent cascading re-renders
4. WHEN the editor has more than 10 blocks, THE Inline_Preview SHALL maintain smooth scrolling and interactions
5. THE drag-and-drop operations SHALL maintain 60fps animation performance

### Requirement 11: Migration Compatibility

**User Story:** As a developer, I want to migrate incrementally, so that I can validate each step without breaking the existing editor.

#### Acceptance Criteria

1. THE refactored Visual_Editor SHALL maintain the same external API (props, callbacks)
2. THE existing block components SHALL work without modification in the Inline_Preview
3. THE Editor_Store interface SHALL remain unchanged for compatibility with settings panels
4. THE save/publish/discard actions SHALL continue to work with the refactored architecture
5. IF the inline preview fails to render, THE Visual_Editor SHALL fall back to iframe preview mode
