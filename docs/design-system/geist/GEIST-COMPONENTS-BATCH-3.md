# Geist Design System Components - Batch 3 Analysis

> Comprehensive documentation of Vercel Geist Design System components: Input, Material, Menu, Modal, Multi-Select, Note, Pagination, and Phone.

---

## Table of Contents

1. [Input](#1-input)
2. [Material](#2-material)
3. [Menu](#3-menu)
4. [Modal](#4-modal)
5. [Multi-Select](#5-multi-select)
6. [Note](#6-note)
7. [Pagination](#7-pagination)
8. [Phone](#8-phone)

---

## 1. Input

### Purpose
The Input component provides a styled text input field with support for prefixes, suffixes, search functionality, keyboard shortcuts, error states, and labels.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prefix` | `ReactNode` | - | Content displayed before the input |
| `suffix` | `ReactNode` | - | Content displayed after the input |
| `disabled` | `boolean` | `false` | Disables the input |
| `error` | `string` | - | Error message to display |
| `label` | `string` | - | Label text for the input |
| `type` | `string` | `"text"` | Input type (text, search, etc.) |

### Variants/States

1. **Default** - Standard text input
2. **Prefix and Suffix** - Input with icons or text before/after
3. **Disabled** - Non-interactive state with reduced opacity
4. **Search** - Specialized search input that clears on Escape key
5. **⌘K (Command Palette)** - Shows keyboard shortcut indicator, transitions to "Esc" when dirty
6. **Error** - Displays error message below input with error styling
7. **Label** - Input with associated label text

### Key CSS Patterns

```css
/* Input base styles */
.geist-input {
  --input-height: 40px;
  --input-padding: 12px;
  --input-border-radius: 6px;
  
  height: var(--input-height);
  padding: 0 var(--input-padding);
  border: 1px solid var(--ds-gray-alpha-400);
  border-radius: var(--input-border-radius);
  background: var(--ds-background-100);
  color: var(--ds-gray-1000);
  font-size: 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.geist-input:focus {
  outline: none;
  border-color: var(--ds-gray-900);
  box-shadow: 0 0 0 1px var(--ds-gray-900);
}

.geist-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--ds-gray-100);
}

.geist-input--error {
  border-color: var(--ds-red-700);
}

.geist-input--error:focus {
  box-shadow: 0 0 0 1px var(--ds-red-700);
}

/* Prefix/Suffix container */
.geist-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.geist-input-prefix,
.geist-input-suffix {
  display: flex;
  align-items: center;
  color: var(--ds-gray-900);
  padding: 0 8px;
}

/* Search variant */
.geist-input--search {
  padding-left: 36px;
}

/* Keyboard shortcut indicator */
.geist-input-shortcut {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: var(--ds-gray-200);
  border-radius: 4px;
  font-size: 12px;
  color: var(--ds-gray-900);
}
```

### Implementation Notes

- Search input automatically clears when Escape is pressed
- ⌘K variant shows keyboard shortcut that transitions to "Esc" when input has content
- Error messages support multiple lines and wrap appropriately
- Prefix/suffix elements are positioned absolutely within the input wrapper
- Focus states use both border color change and box-shadow for accessibility

---

## 2. Material

### Purpose
The Material component provides various surface styles with shadows, built on top of the Stack component. Used for creating elevated UI elements with consistent shadow treatments.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | - | Surface type/variant |
| `children` | `ReactNode` | - | Content to render inside |
| `...stackProps` | `StackProps` | - | Inherits all Stack props |

### Variants/States

1. **Types** - Various surface types with different shadow depths and styles

### Key CSS Patterns

```css
/* Material base - extends Stack */
.geist-material {
  background: var(--ds-background-100);
  border-radius: var(--ds-radius-medium);
}

/* Shadow levels */
.geist-material--shadow-sm {
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 1px 1px rgba(0, 0, 0, 0.02);
}

.geist-material--shadow-md {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.geist-material--shadow-lg {
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

/* Dark mode adjustments */
[data-theme="dark"] .geist-material {
  background: var(--ds-gray-100);
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-200),
    0 4px 6px rgba(0, 0, 0, 0.4);
}
```

### Implementation Notes

- Built on top of Stack component, inheriting all layout capabilities
- Shadows are carefully tuned for both light and dark themes
- Uses layered shadows for more realistic depth perception
- Dark mode uses border + shadow combination for better visibility

---

## 3. Menu

### Purpose
The Menu component extends the Button component to create dropdown menus with various trigger styles, item states, and positioning options.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | - | Custom trigger element |
| `chevron` | `boolean` | `false` | Show chevron indicator |
| `disabled` | `boolean` | `false` | Disable menu items |
| `position` | `string` | `"bottom"` | Menu position relative to trigger |
| `prefix` | `ReactNode` | - | Prefix content for trigger |
| `suffix` | `ReactNode` | - | Suffix content for trigger |

### Variants/States

1. **Default** - Standard menu extending Button
2. **With Chevron** - Shows dropdown indicator
3. **Disabled Items** - Non-interactive menu items
4. **Link Items** - Menu items that navigate
5. **Custom Trigger** - Custom element wrapped by unstyled button
6. **Prefix and Suffix** - Trigger with additional content
7. **Menu Position** - Auto-adapts based on window bounds

### Key CSS Patterns

```css
/* Menu trigger */
.geist-menu-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.geist-menu-chevron {
  transition: transform 0.2s ease;
}

.geist-menu-trigger[aria-expanded="true"] .geist-menu-chevron {
  transform: rotate(180deg);
}

/* Menu dropdown */
.geist-menu-content {
  position: absolute;
  min-width: 180px;
  padding: 4px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-200);
  border-radius: 8px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

/* Menu item */
.geist-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: var(--ds-gray-1000);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.geist-menu-item:hover {
  background: var(--ds-gray-100);
}

.geist-menu-item:focus-visible {
  outline: 2px solid var(--ds-blue-700);
  outline-offset: -2px;
}

.geist-menu-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Menu item prefix/suffix */
.geist-menu-item-prefix,
.geist-menu-item-suffix {
  display: flex;
  align-items: center;
  color: var(--ds-gray-900);
}

/* Position variants */
.geist-menu-content--top {
  bottom: 100%;
  margin-bottom: 4px;
}

.geist-menu-content--bottom {
  top: 100%;
  margin-top: 4px;
}
```

### Implementation Notes

- Extends Button component for consistent trigger styling
- Custom triggers are wrapped in an unstyled button for accessibility
- Position automatically adapts based on viewport boundaries
- Supports keyboard navigation (arrow keys, Enter, Escape)
- Uses portal rendering to avoid overflow issues

---

## 4. Modal

### Purpose
The Modal component provides a dialog overlay for displaying content that requires user attention or interaction, with support for sticky headers, action buttons, and focus management.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controls modal visibility |
| `onClose` | `function` | - | Callback when modal closes |
| `sticky` | `boolean` | `false` | Sticky header/footer |
| `inset` | `boolean` | `false` | Inset content padding |
| `initialFocus` | `RefObject` | - | Element to focus on open |
| `actions` | `ReactNode` | - | Action buttons |
| `disabledActions` | `boolean` | `false` | Disable action buttons |

### Variants/States

1. **Default** - Standard modal dialog
2. **Sticky** - Header/footer stick during scroll
3. **Single Button** - Modal with one action
4. **Disabled Actions** - Non-interactive action buttons
5. **Inset** - Content with inset padding
6. **Control Initial Focus** - Custom focus target on open

### Key CSS Patterns

```css
/* Modal overlay */
.geist-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal container */
.geist-modal {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  background: var(--ds-background-100);
  border-radius: 12px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal header */
.geist-modal-header {
  padding: 24px 24px 0;
}

.geist-modal-header--sticky {
  position: sticky;
  top: 0;
  background: var(--ds-background-100);
  border-bottom: 1px solid var(--ds-gray-alpha-200);
  padding-bottom: 16px;
  z-index: 1;
}

/* Modal body */
.geist-modal-body {
  padding: 16px 24px;
  overflow-y: auto;
}

.geist-modal-body--inset {
  padding: 0;
}

/* Modal footer */
.geist-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px 24px;
}

.geist-modal-footer--sticky {
  position: sticky;
  bottom: 0;
  background: var(--ds-background-100);
  border-top: 1px solid var(--ds-gray-alpha-200);
  padding-top: 16px;
}

/* Disabled actions */
.geist-modal-footer--disabled button {
  opacity: 0.5;
  pointer-events: none;
}
```

### Implementation Notes

- Focus is trapped within modal when open
- Escape key closes the modal
- Click outside (on overlay) closes the modal
- Initial focus can be controlled via `initialFocus` prop
- Sticky variant keeps header/footer visible during content scroll
- Uses portal rendering to escape parent stacking contexts

---

## 5. Multi-Select

### Purpose
The Multi-Select component provides a sophisticated selection interface with checkbox-based item selection, smart selection behaviors, and comprehensive keyboard navigation support.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `array` | `[]` | Items to display |
| `selected` | `array` | `[]` | Currently selected items |
| `onChange` | `function` | - | Selection change callback |
| `controlled` | `boolean` | `false` | Use controlled state |

### Variants/States

1. **Select Actions** - Different behaviors based on selection state:
   - Checkbox focus + Enter/Space: Toggle individual item
   - Button focus + Enter/Space: Smart selection (Select Only, Select All, or Toggle)
   - Hidden action labels appear on hover/focus

2. **Keyboard Navigation**:
   - Up/Down arrows: Navigate between rows
   - Left/Right arrows: Switch between checkbox and button focus
   - Tab: Focus away from menu
   - Enter/Space: Execute actions based on focus

3. **Controlled State** - Programmatic selection management

### Key CSS Patterns

```css
/* Multi-select container */
.geist-multi-select {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ds-gray-alpha-200);
  border-radius: 8px;
  overflow: hidden;
}

/* Multi-select item row */
.geist-multi-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ds-gray-alpha-100);
  transition: background-color 0.15s ease;
}

.geist-multi-select-item:last-child {
  border-bottom: none;
}

.geist-multi-select-item:hover {
  background: var(--ds-gray-50);
}

.geist-multi-select-item--focused {
  background: var(--ds-gray-100);
}

/* Checkbox styling */
.geist-multi-select-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid var(--ds-gray-alpha-400);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.geist-multi-select-checkbox:checked {
  background: var(--ds-blue-700);
  border-color: var(--ds-blue-700);
}

.geist-multi-select-checkbox:focus-visible {
  outline: 2px solid var(--ds-blue-700);
  outline-offset: 2px;
}

/* Action button */
.geist-multi-select-action {
  margin-left: auto;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--ds-gray-900);
  background: transparent;
  border: 1px solid var(--ds-gray-alpha-200);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}

.geist-multi-select-item:hover .geist-multi-select-action,
.geist-multi-select-action:focus-visible {
  opacity: 1;
}

.geist-multi-select-action:hover {
  background: var(--ds-gray-100);
}

/* Action label */
.geist-multi-select-action-label {
  font-size: 11px;
  color: var(--ds-gray-800);
  margin-left: 4px;
}

/* Selection states */
.geist-multi-select-item--selected {
  background: var(--ds-blue-100);
}

.geist-multi-select-item--selected:hover {
  background: var(--ds-blue-200);
}
```

### Implementation Notes

- Smart selection logic adapts based on current selection state
- Action labels are hidden by default, appear on hover/focus for cleaner UI
- Full keyboard navigation support maintains focus state across rows
- Checkbox and button focus states are tracked separately
- Controlled mode allows external state management
- Tab behavior follows natural document flow

---

## 6. Note

### Purpose
The Note component displays informational messages with various semantic types (success, error, warning, etc.), sizes, and optional action buttons.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | `"default"` | Note type/variant |
| `size` | `string` | `"medium"` | Size: small, medium, large |
| `fill` | `boolean` | `false` | Use filled background |
| `label` | `string\|boolean` | - | Custom label or hide label |
| `action` | `ReactNode` | - | Action button/link |
| `disabled` | `boolean` | `false` | Disabled state |

### Variants/States

**Types:**
1. **Default** - Neutral informational note
2. **Success** - Positive/success messages
3. **Error** - Error/failure messages
4. **Warning** - Warning/caution messages
5. **Secondary** - Secondary/muted information
6. **Violet** - Violet-themed note
7. **Cyan** - Cyan-themed note
8. **Tertiary** - Tertiary styling
9. **Alert** - Alert/attention messages
10. **Lite** - Lightweight styling
11. **Ghost** - Minimal/ghost styling

**Sizes:**
- Small
- Medium (default)
- Large

**Modifiers:**
- Fill (solid background)
- With Action
- Disabled
- Custom/No Label

### Key CSS Patterns

```css
/* Note base */
.geist-note {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

/* Size variants */
.geist-note--small {
  padding: 8px 12px;
  font-size: 13px;
}

.geist-note--large {
  padding: 16px 20px;
  font-size: 15px;
}

/* Type variants - outline style */
.geist-note--default {
  background: var(--ds-gray-100);
  border: 1px solid var(--ds-gray-alpha-200);
  color: var(--ds-gray-1000);
}

.geist-note--success {
  background: var(--ds-green-100);
  border: 1px solid var(--ds-green-400);
  color: var(--ds-green-900);
}

.geist-note--error {
  background: var(--ds-red-100);
  border: 1px solid var(--ds-red-400);
  color: var(--ds-red-900);
}

.geist-note--warning {
  background: var(--ds-amber-100);
  border: 1px solid var(--ds-amber-400);
  color: var(--ds-amber-900);
}

.geist-note--secondary {
  background: var(--ds-gray-50);
  border: 1px solid var(--ds-gray-alpha-100);
  color: var(--ds-gray-900);
}

.geist-note--violet {
  background: var(--ds-violet-100);
  border: 1px solid var(--ds-violet-400);
  color: var(--ds-violet-900);
}

.geist-note--cyan {
  background: var(--ds-cyan-100);
  border: 1px solid var(--ds-cyan-400);
  color: var(--ds-cyan-900);
}

/* Fill variants */
.geist-note--fill.geist-note--success {
  background: var(--ds-green-700);
  border-color: var(--ds-green-700);
  color: white;
}

.geist-note--fill.geist-note--error {
  background: var(--ds-red-700);
  border-color: var(--ds-red-700);
  color: white;
}

.geist-note--fill.geist-note--warning {
  background: var(--ds-amber-600);
  border-color: var(--ds-amber-600);
  color: white;
}

/* Label */
.geist-note-label {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

/* Action */
.geist-note-action {
  margin-left: auto;
  flex-shrink: 0;
}

/* Disabled */
.geist-note--disabled {
  opacity: 0.5;
  pointer-events: none;
}
```

### Implementation Notes

- Labels can be customized, hidden, or use default type-based labels
- Fill variant provides solid background for higher emphasis
- Action slot supports buttons or links
- Content can wrap to multiple lines
- Disabled state reduces opacity and prevents interaction
- Icon is typically shown based on type (checkmark for success, X for error, etc.)

---

## 7. Pagination

### Purpose
The Pagination component provides navigation controls for paginated content, allowing users to move between pages of data.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | - | Total number of pages |
| `page` | `number` | `1` | Current page |
| `onChange` | `function` | - | Page change callback |
| `siblingCount` | `number` | `1` | Pages shown on each side |
| `boundaryCount` | `number` | `1` | Pages shown at boundaries |

### Variants/States

1. **Default** - Standard pagination with page numbers
2. **With Ellipsis** - Truncated page numbers for large sets
3. **Compact** - Minimal prev/next only

### Key CSS Patterns

```css
/* Pagination container */
.geist-pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Pagination button */
.geist-pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  font-size: 14px;
  color: var(--ds-gray-1000);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.geist-pagination-button:hover {
  background: var(--ds-gray-100);
  border-color: var(--ds-gray-alpha-200);
}

.geist-pagination-button:focus-visible {
  outline: 2px solid var(--ds-blue-700);
  outline-offset: 2px;
}

/* Active page */
.geist-pagination-button--active {
  background: var(--ds-gray-1000);
  color: var(--ds-background-100);
  border-color: var(--ds-gray-1000);
}

.geist-pagination-button--active:hover {
  background: var(--ds-gray-900);
}

/* Disabled state */
.geist-pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Ellipsis */
.geist-pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--ds-gray-700);
}

/* Navigation arrows */
.geist-pagination-prev,
.geist-pagination-next {
  padding: 0;
}

.geist-pagination-prev svg,
.geist-pagination-next svg {
  width: 16px;
  height: 16px;
}
```

### Implementation Notes

- Automatically calculates visible page range based on sibling/boundary counts
- Ellipsis appears when pages are truncated
- First/last page always visible (boundary)
- Previous/Next buttons disabled at boundaries
- Supports keyboard navigation
- Responsive design may hide page numbers on small screens

---

## 8. Phone

### Purpose
The Phone component provides a realistic phone-style frame for showcasing website screenshots, mobile app previews, or other content within a device mockup.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Content to display in phone |
| `src` | `string` | - | Image source URL |
| `alt` | `string` | - | Image alt text |
| `url` | `string` | - | URL to display in address bar |

### Variants/States

1. **Composition** - Phone frame with custom content
2. **With URL** - Shows URL in address bar area (e.g., "vercel.com")

### Key CSS Patterns

```css
/* Phone container */
.geist-phone {
  position: relative;
  width: 375px;
  background: var(--ds-gray-1000);
  border-radius: 40px;
  padding: 12px;
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-200),
    0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Phone notch */
.geist-phone::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 28px;
  background: var(--ds-gray-1000);
  border-radius: 14px;
  z-index: 10;
}

/* Phone screen */
.geist-phone-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 19.5;
  background: var(--ds-background-100);
  border-radius: 32px;
  overflow: hidden;
}

/* Phone content */
.geist-phone-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* URL bar */
.geist-phone-url {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: var(--ds-gray-100);
  border-radius: 20px;
  font-size: 12px;
  color: var(--ds-gray-900);
  z-index: 5;
}

/* Status bar */
.geist-phone-status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ds-gray-1000);
}

/* Home indicator */
.geist-phone::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: var(--ds-gray-800);
  border-radius: 3px;
}

/* Dark mode */
[data-theme="dark"] .geist-phone {
  background: var(--ds-gray-100);
}

[data-theme="dark"] .geist-phone::before,
[data-theme="dark"] .geist-phone::after {
  background: var(--ds-gray-200);
}
```

### Implementation Notes

- Realistic iPhone-style frame with notch and home indicator
- Aspect ratio matches modern smartphone proportions (9:19.5)
- Content area clips overflow for realistic display
- URL bar provides context for web content
- Supports both image sources and custom React content
- Responsive sizing while maintaining proportions
- Dark mode adjusts frame colors appropriately

---

## CSS Design Tokens Reference

All components use Geist's design token system:

```css
:root {
  /* Colors */
  --ds-gray-50: #fafafa;
  --ds-gray-100: #f5f5f5;
  --ds-gray-200: #e5e5e5;
  --ds-gray-400: #a3a3a3;
  --ds-gray-700: #525252;
  --ds-gray-800: #404040;
  --ds-gray-900: #262626;
  --ds-gray-1000: #0a0a0a;
  
  --ds-gray-alpha-100: rgba(0, 0, 0, 0.05);
  --ds-gray-alpha-200: rgba(0, 0, 0, 0.1);
  --ds-gray-alpha-400: rgba(0, 0, 0, 0.2);
  
  --ds-blue-100: #dbeafe;
  --ds-blue-700: #1d4ed8;
  
  --ds-green-100: #dcfce7;
  --ds-green-400: #4ade80;
  --ds-green-700: #15803d;
  --ds-green-900: #14532d;
  
  --ds-red-100: #fee2e2;
  --ds-red-400: #f87171;
  --ds-red-700: #b91c1c;
  --ds-red-900: #7f1d1d;
  
  --ds-amber-100: #fef3c7;
  --ds-amber-400: #fbbf24;
  --ds-amber-600: #d97706;
  --ds-amber-900: #78350f;
  
  --ds-violet-100: #ede9fe;
  --ds-violet-400: #a78bfa;
  --ds-violet-900: #4c1d95;
  
  --ds-cyan-100: #cffafe;
  --ds-cyan-400: #22d3ee;
  --ds-cyan-900: #164e63;
  
  /* Backgrounds */
  --ds-background-100: #ffffff;
  --ds-background-200: #fafafa;
  
  /* Radius */
  --ds-radius-small: 4px;
  --ds-radius-medium: 6px;
  --ds-radius-large: 8px;
  --ds-radius-xlarge: 12px;
  
  /* Shadows */
  --ds-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --ds-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --ds-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --ds-shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* Transitions */
  --ds-transition-fast: 0.15s ease;
  --ds-transition-normal: 0.2s ease;
  --ds-transition-slow: 0.3s ease;
}

/* Dark mode overrides */
[data-theme="dark"] {
  --ds-gray-50: #171717;
  --ds-gray-100: #262626;
  --ds-gray-200: #404040;
  --ds-gray-400: #737373;
  --ds-gray-700: #a3a3a3;
  --ds-gray-800: #d4d4d4;
  --ds-gray-900: #e5e5e5;
  --ds-gray-1000: #fafafa;
  
  --ds-gray-alpha-100: rgba(255, 255, 255, 0.05);
  --ds-gray-alpha-200: rgba(255, 255, 255, 0.1);
  --ds-gray-alpha-400: rgba(255, 255, 255, 0.2);
  
  --ds-background-100: #0a0a0a;
  --ds-background-200: #171717;
}
```

---

## Component Composition Patterns

### Form Pattern with Input + Note

```tsx
<Stack gap={2}>
  <Input
    label="Email"
    type="email"
    error={errors.email}
  />
  <Note type="secondary" size="small">
    We'll never share your email with anyone.
  </Note>
</Stack>
```

### Menu with Modal Confirmation

```tsx
<Menu trigger={<Button>Actions</Button>}>
  <Menu.Item onClick={() => setShowModal(true)}>
    Delete Item
  </Menu.Item>
</Menu>

<Modal
  open={showModal}
  onClose={() => setShowModal(false)}
  actions={
    <>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button variant="error" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  Are you sure you want to delete this item?
</Modal>
```

### Multi-Select with Pagination

```tsx
<Stack gap={4}>
  <MultiSelect
    items={paginatedItems}
    selected={selected}
    onChange={setSelected}
  />
  <Pagination
    count={totalPages}
    page={currentPage}
    onChange={setCurrentPage}
  />
</Stack>
```

---

## Accessibility Considerations

1. **Input**: Proper label association, error announcements via aria-describedby
2. **Menu**: Full keyboard navigation, aria-expanded states, focus management
3. **Modal**: Focus trap, aria-modal, escape key handling, initial focus control
4. **Multi-Select**: Checkbox semantics, keyboard navigation, selection announcements
5. **Note**: Role="alert" for error/warning types, aria-live regions
6. **Pagination**: aria-current for active page, disabled state communication
7. **Phone**: Decorative frame with proper alt text for content images

---

## Summary

This batch of Geist components covers essential UI patterns:

| Component | Primary Use Case |
|-----------|------------------|
| **Input** | Form text entry with validation |
| **Material** | Elevated surface containers |
| **Menu** | Dropdown action menus |
| **Modal** | Dialog overlays for focused tasks |
| **Multi-Select** | Bulk item selection |
| **Note** | Informational/status messages |
| **Pagination** | Data set navigation |
| **Phone** | Device mockup displays |

All components follow Geist's design principles:
- Consistent spacing and typography
- Smooth transitions (0.15s-0.2s ease)
- Proper dark mode support
- Accessible keyboard navigation
- Semantic color usage for states
