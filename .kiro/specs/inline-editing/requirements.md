# Requirements Document

## Introduction

This feature adds inline editing capabilities to the storefront visual editor, enabling users to edit text content directly within the live preview iframe. Instead of switching between the preview and the settings panel for every text change, users can click on editable text elements (headlines, descriptions, button labels, etc.) and modify them in place. This creates a more intuitive, WYSIWYG editing experience that reduces context switching and speeds up content creation.

## Glossary

- **Editor**: The main visual editor application that hosts the preview iframe and settings panels
- **Preview**: The iframe displaying the live storefront with real-time block updates
- **Inline_Editor**: A contenteditable overlay or input that appears when clicking editable text in the preview
- **Editable_Field**: A text-based block setting that can be edited inline (headline, description, button text, etc.)
- **Edit_Mode**: The state when a user is actively editing text inline within the preview
- **Block_Wrapper**: The component that wraps each block in the preview and handles click/hover interactions

## Requirements

### Requirement 1: Editable Field Detection

**User Story:** As a store owner, I want to see which text elements are editable when I hover over them, so that I know what content I can change directly in the preview.

#### Acceptance Criteria

1. WHEN a user hovers over an editable text field in the preview THEN the Preview SHALL display a subtle visual indicator (outline or highlight) showing the field is editable
2. WHEN a user hovers over a non-editable element THEN the Preview SHALL NOT display the editable indicator
3. THE Editor SHALL maintain a mapping of block field paths to their corresponding DOM elements in the preview
4. WHEN the preview renders a block THEN the Block_Wrapper SHALL add data attributes to editable text elements identifying the block ID and field path

### Requirement 2: Inline Text Editing Activation

**User Story:** As a store owner, I want to click on any editable text in the preview to start editing it directly, so that I can make quick content changes without using the settings panel.

#### Acceptance Criteria

1. WHEN a user clicks on an editable text field in the preview THEN the Inline_Editor SHALL activate on that element
2. WHEN the Inline_Editor activates THEN the Preview SHALL make the text content editable and place the cursor at the click position
3. WHEN the Inline_Editor activates THEN the Editor SHALL select the corresponding block in the layers panel
4. WHEN the Inline_Editor is active THEN the Preview SHALL visually distinguish the editing state with a focused border style
5. IF a user clicks on an editable field while another field is being edited THEN the Inline_Editor SHALL save the current field and switch to the new field

### Requirement 3: Text Input and Formatting

**User Story:** As a store owner, I want to type and see my changes immediately in the preview, so that I can see exactly how my content will look.

#### Acceptance Criteria

1. WHEN a user types in the Inline_Editor THEN the Preview SHALL display the typed characters immediately
2. WHEN a user types in the Inline_Editor THEN the Editor SHALL update the block settings in the store after a debounce period
3. THE Inline_Editor SHALL support standard text input including special characters and unicode
4. THE Inline_Editor SHALL preserve the existing text styling (font, size, color) from the block's CSS
5. WHEN editing a single-line field (headline, button text) THEN the Inline_Editor SHALL prevent line breaks on Enter key

### Requirement 4: Edit Completion and Saving

**User Story:** As a store owner, I want my inline edits to be saved automatically when I finish editing, so that I don't lose my changes.

#### Acceptance Criteria

1. WHEN a user clicks outside the Inline_Editor THEN the Inline_Editor SHALL deactivate and save the changes
2. WHEN a user presses Escape THEN the Inline_Editor SHALL deactivate and revert to the original value
3. WHEN a user presses Enter on a single-line field THEN the Inline_Editor SHALL deactivate and save the changes
4. WHEN the Inline_Editor saves changes THEN the Editor SHALL update the block settings and mark the layout as dirty
5. WHEN the Inline_Editor saves changes THEN the Editor SHALL add the change to the undo history

### Requirement 5: Editor-Preview Synchronization

**User Story:** As a store owner, I want changes made in the settings panel to update inline editors and vice versa, so that both editing methods stay in sync.

#### Acceptance Criteria

1. WHEN a user edits a field in the settings panel THEN the Preview SHALL update the corresponding text in real-time
2. WHEN a user edits a field inline THEN the Editor SHALL update the corresponding field in the settings panel
3. WHEN the Inline_Editor is active and the settings panel updates the same field THEN the Inline_Editor SHALL reflect the new value
4. THE Editor SHALL use the existing postMessage communication channel for inline edit synchronization

### Requirement 6: Keyboard Navigation

**User Story:** As a store owner, I want to use keyboard shortcuts to navigate between editable fields, so that I can edit content efficiently without using the mouse.

#### Acceptance Criteria

1. WHEN a user presses Tab while editing inline THEN the Inline_Editor SHALL move focus to the next editable field in the same block
2. WHEN a user presses Shift+Tab while editing inline THEN the Inline_Editor SHALL move focus to the previous editable field in the same block
3. WHEN there are no more editable fields in the current block THEN Tab SHALL move to the first editable field of the next block
4. THE Preview SHALL maintain a logical tab order based on visual position of editable fields

### Requirement 7: Multi-line Text Editing

**User Story:** As a store owner, I want to edit multi-line text fields (descriptions, subheadlines) with proper line break support, so that I can format longer content appropriately.

#### Acceptance Criteria

1. WHEN editing a multi-line field (textarea type) THEN the Inline_Editor SHALL allow line breaks on Enter key
2. WHEN editing a multi-line field THEN the Inline_Editor SHALL preserve existing line breaks
3. WHEN a multi-line field is edited THEN the Preview SHALL render line breaks correctly
4. THE Inline_Editor SHALL auto-expand vertically to accommodate multi-line content

### Requirement 8: Empty Field Handling

**User Story:** As a store owner, I want to easily add content to empty optional fields by clicking on placeholder areas, so that I can populate all my content inline.

#### Acceptance Criteria

1. WHEN an optional text field is empty THEN the Preview SHALL display a placeholder indicating the field can be edited
2. WHEN a user clicks on an empty field placeholder THEN the Inline_Editor SHALL activate with the placeholder cleared
3. WHEN a user clears all text from a field and exits THEN the Preview SHALL show the placeholder again
4. THE placeholder text SHALL be visually distinct from actual content (lighter color, italic style)

### Requirement 9: Undo/Redo Integration

**User Story:** As a store owner, I want inline edits to work with the editor's undo/redo system, so that I can revert mistakes made during inline editing.

#### Acceptance Criteria

1. WHEN an inline edit is saved THEN the Editor SHALL create a new undo history entry
2. WHEN a user triggers undo (Cmd+Z) after an inline edit THEN the Editor SHALL revert the inline change
3. WHEN a user triggers redo (Cmd+Shift+Z) after undoing an inline edit THEN the Editor SHALL restore the inline change
4. THE undo/redo system SHALL treat each inline edit session (activation to deactivation) as a single undoable action
