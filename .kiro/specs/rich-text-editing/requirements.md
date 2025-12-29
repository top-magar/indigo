# Requirements Document

## Introduction

This feature formalizes the rich text editing capabilities within the storefront visual editor. Building on the inline editing foundation, this enhancement provides a TipTap-based rich text editor with a floating toolbar that appears on text selection. Users can apply formatting (bold, italic, underline), create headings, add lists, align text, and insert links—all while editing directly in the live preview. The block action bar provides quick access to block manipulation actions (move, duplicate, delete, add) that appear on block hover.

## Glossary

- **Rich_Text_Editor**: A TipTap-based editor component that enables formatted text editing with HTML output
- **Floating_Toolbar**: A contextual toolbar that appears above selected text, providing formatting controls
- **Block_Action_Bar**: A toolbar that appears on block hover, providing block manipulation actions (move, duplicate, delete, add)
- **Toolbar_Config**: Configuration object that determines which formatting options are available in the toolbar
- **Editor_Instance**: The TipTap editor instance that manages content state and formatting commands
- **Preview**: The iframe displaying the live storefront with real-time block updates
- **Editor**: The main visual editor application that hosts the preview iframe and settings panels

## Requirements

### Requirement 1: Rich Text Editor Initialization

**User Story:** As a store owner, I want rich text fields to use a full-featured editor, so that I can format my content with headings, lists, and text styles.

#### Acceptance Criteria

1. WHEN a rich text field is rendered in the preview THEN the Rich_Text_Editor SHALL initialize with TipTap and required extensions (StarterKit, Underline, Link, TextAlign, Placeholder)
2. WHEN the Rich_Text_Editor initializes THEN it SHALL load the existing HTML content from the block settings
3. WHEN the Rich_Text_Editor is not in editor mode (outside iframe) THEN it SHALL render as static HTML without editing capabilities
4. THE Rich_Text_Editor SHALL preserve all existing text styling from the block's CSS

### Requirement 2: Floating Toolbar Display

**User Story:** As a store owner, I want a formatting toolbar to appear when I select text, so that I can quickly apply formatting without leaving the editing context.

#### Acceptance Criteria

1. WHEN a user selects text in the Rich_Text_Editor THEN the Floating_Toolbar SHALL appear above the selection
2. WHEN the text selection is collapsed (cursor only, no selection) THEN the Floating_Toolbar SHALL hide
3. WHEN the Floating_Toolbar appears THEN it SHALL be positioned centered above the selection
4. THE Floating_Toolbar SHALL remain visible while the user interacts with its buttons
5. WHEN a user clicks outside the Rich_Text_Editor THEN the Floating_Toolbar SHALL hide

### Requirement 3: Text Formatting Controls

**User Story:** As a store owner, I want to apply basic text formatting like bold, italic, and underline, so that I can emphasize important content.

#### Acceptance Criteria

1. WHEN a user clicks the Bold button THEN the Rich_Text_Editor SHALL toggle bold formatting on the selected text
2. WHEN a user clicks the Italic button THEN the Rich_Text_Editor SHALL toggle italic formatting on the selected text
3. WHEN a user clicks the Underline button THEN the Rich_Text_Editor SHALL toggle underline formatting on the selected text
4. WHEN a user clicks the Strikethrough button THEN the Rich_Text_Editor SHALL toggle strikethrough formatting on the selected text
5. WHEN formatting is active on selected text THEN the corresponding toolbar button SHALL display an active state
6. THE Rich_Text_Editor SHALL support keyboard shortcuts (Cmd+B for bold, Cmd+I for italic, Cmd+U for underline)

### Requirement 4: Heading Controls

**User Story:** As a store owner, I want to create headings of different levels, so that I can structure my content hierarchically.

#### Acceptance Criteria

1. WHEN a user clicks a Heading button (H1, H2, H3) THEN the Rich_Text_Editor SHALL convert the current paragraph to that heading level
2. WHEN a heading is active THEN the corresponding heading button SHALL display an active state
3. WHEN a user clicks an active heading button THEN the Rich_Text_Editor SHALL convert the heading back to a paragraph
4. THE Floating_Toolbar SHALL display heading options based on the Toolbar_Config

### Requirement 5: List Controls

**User Story:** As a store owner, I want to create bulleted and numbered lists, so that I can organize information clearly.

#### Acceptance Criteria

1. WHEN a user clicks the Bullet List button THEN the Rich_Text_Editor SHALL toggle a bulleted list on the current selection
2. WHEN a user clicks the Numbered List button THEN the Rich_Text_Editor SHALL toggle a numbered list on the current selection
3. WHEN a list is active THEN the corresponding list button SHALL display an active state
4. THE Rich_Text_Editor SHALL properly nest list items when indenting

### Requirement 6: Text Alignment Controls

**User Story:** As a store owner, I want to align text left, center, right, or justified, so that I can control the visual layout of my content.

#### Acceptance Criteria

1. WHEN a user clicks an alignment button THEN the Rich_Text_Editor SHALL apply that alignment to the current paragraph or selection
2. WHEN alignment is applied THEN the corresponding alignment button SHALL display an active state
3. THE Rich_Text_Editor SHALL support left, center, right, and justify alignment options
4. WHEN no alignment is explicitly set THEN the text SHALL default to left alignment

### Requirement 7: Link Management

**User Story:** As a store owner, I want to add and remove links from text, so that I can connect my content to other pages or resources.

#### Acceptance Criteria

1. WHEN a user clicks the Link button with text selected THEN the Floating_Toolbar SHALL display a URL input field
2. WHEN a user enters a URL and confirms THEN the Rich_Text_Editor SHALL apply the link to the selected text
3. WHEN a user clicks the Link button on existing linked text THEN the URL input SHALL show the current URL
4. WHEN a user clicks the Unlink button THEN the Rich_Text_Editor SHALL remove the link from the selected text
5. WHEN a link is active on selected text THEN the Link button SHALL display an active state
6. THE Rich_Text_Editor SHALL validate that URLs are properly formatted

### Requirement 8: Content Synchronization

**User Story:** As a store owner, I want my rich text changes to sync with the editor store, so that my formatting is saved and persists.

#### Acceptance Criteria

1. WHEN a user makes changes in the Rich_Text_Editor THEN the changes SHALL sync to the Editor store after a debounce period
2. WHEN the Editor store updates a rich text field THEN the Rich_Text_Editor SHALL reflect the new content
3. WHEN the Rich_Text_Editor is actively being edited THEN external updates SHALL NOT override the user's input
4. THE Rich_Text_Editor SHALL send INLINE_EDIT_CHANGE messages via postMessage for synchronization

### Requirement 9: Edit Session Management

**User Story:** As a store owner, I want to start and end editing sessions cleanly, so that my changes are properly tracked for undo/redo.

#### Acceptance Criteria

1. WHEN a user clicks on a Rich_Text_Editor field THEN an edit session SHALL start and INLINE_EDIT_START message SHALL be sent
2. WHEN a user clicks outside the Rich_Text_Editor THEN the edit session SHALL end and changes SHALL be saved
3. WHEN a user presses Escape THEN the edit session SHALL end and changes SHALL be reverted to the original value
4. WHEN an edit session ends with save THEN INLINE_EDIT_END message SHALL be sent with the new and original values
5. WHEN an edit session ends with cancel THEN INLINE_EDIT_CANCEL message SHALL be sent

### Requirement 10: Block Action Bar Display

**User Story:** As a store owner, I want quick access to block actions when hovering over a block, so that I can easily manipulate blocks without using menus.

#### Acceptance Criteria

1. WHEN a user hovers over a block in the preview THEN the Block_Action_Bar SHALL appear
2. WHEN the Block_Action_Bar appears THEN it SHALL be positioned at the top of the block
3. THE Block_Action_Bar SHALL display actions for: Move Up, Move Down, Add Below, Duplicate, Delete
4. WHEN a user moves the mouse away from the block THEN the Block_Action_Bar SHALL hide
5. THE Block_Action_Bar SHALL remain visible while the user interacts with its buttons

### Requirement 11: Block Movement Actions

**User Story:** As a store owner, I want to move blocks up and down in the layout, so that I can reorder my content easily.

#### Acceptance Criteria

1. WHEN a user clicks Move Up THEN the block SHALL move one position up in the layout
2. WHEN a user clicks Move Down THEN the block SHALL move one position down in the layout
3. WHEN a block is at the top of the layout THEN the Move Up button SHALL be disabled
4. WHEN a block is at the bottom of the layout THEN the Move Down button SHALL be disabled
5. WHEN a block is moved THEN the Editor store SHALL update and the preview SHALL reflect the new order

### Requirement 12: Block Duplication

**User Story:** As a store owner, I want to duplicate blocks, so that I can quickly create similar content sections.

#### Acceptance Criteria

1. WHEN a user clicks Duplicate THEN a copy of the block SHALL be created immediately below the original
2. WHEN a block is duplicated THEN the new block SHALL have a unique ID
3. WHEN a block is duplicated THEN the new block SHALL have identical settings to the original
4. WHEN a block is duplicated THEN the Editor store SHALL update and the preview SHALL show the new block

### Requirement 13: Block Deletion

**User Story:** As a store owner, I want to delete blocks, so that I can remove content I no longer need.

#### Acceptance Criteria

1. WHEN a user clicks Delete THEN the block SHALL be removed from the layout
2. WHEN a block is deleted THEN the Editor store SHALL update and the preview SHALL reflect the removal
3. THE Delete action SHALL be undoable through the editor's undo system

### Requirement 14: Add Block Below

**User Story:** As a store owner, I want to add new blocks below existing ones, so that I can expand my content in context.

#### Acceptance Criteria

1. WHEN a user clicks Add Below THEN the block palette SHALL open for block selection
2. WHEN a user selects a block type THEN the new block SHALL be inserted below the current block
3. WHEN a new block is added THEN the Editor store SHALL update and the preview SHALL show the new block

### Requirement 15: Toolbar Configuration

**User Story:** As a developer, I want to configure which toolbar options are available, so that I can customize the editing experience for different field types.

#### Acceptance Criteria

1. THE Rich_Text_Editor SHALL accept a Toolbar_Config prop to customize available options
2. WHEN Toolbar_Config specifies disabled options THEN those buttons SHALL NOT appear in the Floating_Toolbar
3. THE default Toolbar_Config SHALL include: bold, italic, underline, headings (1-3), bullet list, numbered list, link, text alignment
4. WHEN Toolbar_Config is not provided THEN the default configuration SHALL be used

### Requirement 16: Undo/Redo Integration

**User Story:** As a store owner, I want to undo and redo my rich text changes, so that I can recover from mistakes and experiment with content.

#### Acceptance Criteria

1. WHEN a user triggers undo (Cmd+Z) THEN the Editor SHALL revert the last change
2. WHEN a user triggers redo (Cmd+Shift+Z) THEN the Editor SHALL restore the undone change
3. THE Editor SHALL maintain a maximum of 50 undo history entries
4. WHEN an edit session ends THEN the Editor SHALL create a single undo history entry for all changes in that session
5. WHEN a block action (move, duplicate, delete) is performed THEN the Editor SHALL create an undo history entry

### Requirement 17: Content Security

**User Story:** As a platform operator, I want rich text content to be sanitized, so that malicious scripts cannot be injected through user content.

#### Acceptance Criteria

1. THE Rich_Text_Editor SHALL only allow whitelisted HTML tags: p, h1-h6, strong, em, u, s, a, ul, ol, li, br, span
2. THE Rich_Text_Editor SHALL strip all script tags and event handler attributes from content
3. WHEN content is loaded THEN the Rich_Text_Editor SHALL sanitize it through the TipTap/ProseMirror schema
4. THE Rich_Text_Editor SHALL enforce a maximum content size of 50KB per field

### Requirement 18: Accessibility

**User Story:** As a store owner with accessibility needs, I want to use the rich text editor with keyboard and screen readers, so that I can edit content without relying solely on mouse interactions.

#### Acceptance Criteria

1. THE Floating_Toolbar buttons SHALL have aria-label attributes describing their function
2. WHEN a formatting button is active THEN it SHALL have aria-pressed="true"
3. THE Rich_Text_Editor SHALL have role="textbox" and aria-multiline="true" attributes
4. WHEN the user presses Tab in the editor THEN focus SHALL move to the next editable field
5. WHEN the user presses Shift+Tab THEN focus SHALL move to the previous editable field
6. THE Rich_Text_Editor SHALL display a visible focus ring when focused

### Requirement 19: Toolbar Positioning

**User Story:** As a store owner, I want the toolbar to always be visible and usable, so that I can format text even when editing near viewport edges.

#### Acceptance Criteria

1. WHEN the toolbar would appear above the viewport THEN it SHALL be positioned below the selection instead
2. WHEN the toolbar would extend beyond the left viewport edge THEN it SHALL be constrained to the viewport
3. WHEN the toolbar would extend beyond the right viewport edge THEN it SHALL be constrained to the viewport
4. THE Floating_Toolbar SHALL remain fully visible while the user interacts with it

### Requirement 20: Error Recovery

**User Story:** As a store owner, I want my edits to be preserved even if sync fails, so that I don't lose my work due to technical issues.

#### Acceptance Criteria

1. WHEN a sync message fails to send THEN the Rich_Text_Editor SHALL retry on the next content change
2. WHEN the editor loses connection to the parent frame THEN it SHALL continue allowing local edits
3. WHEN connection is restored THEN the Rich_Text_Editor SHALL sync the current content to the Editor store
4. IF content exceeds the maximum size THEN the Rich_Text_Editor SHALL display a warning and prevent further input

