# Geist Design System Components - Batch 5 Analysis

> Comprehensive documentation of Vercel Geist Design System components: Switch, Table, Tabs, Textarea, Toast, Toggle, and Tooltip.

---

## Table of Contents

1. [Switch](#1-switch)
2. [Table](#2-table)
3. [Tabs](#3-tabs)
4. [Textarea](#4-textarea)
5. [Toast](#5-toast)
6. [Toggle](#6-toggle)
7. [Tooltip](#7-tooltip)

---

## 1. Switch

### Purpose
The Switch component allows users to choose between a set of mutually exclusive options. It's commonly used for toggling between different views or modes (e.g., "Source" vs "Output", "List" vs "Grid").

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Controls the height and padding of the switch |
| `disabled` | `boolean` | `false` | Disables the entire switch |
| `defaultValue` | `string` | - | Initial selected value |
| `value` | `string` | - | Controlled selected value |
| `onChange` | `(value: string) => void` | - | Callback when selection changes |
| `fullWidth` | `boolean` | `false` | Makes switch take full container width |
| `tooltip` | `string` | - | Tooltip text for the switch |

### SwitchControl Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Unique value for this option |
| `label` | `string` | - | Display text for the option |
| `disabled` | `boolean` | `false` | Disables this specific option |
| `icon` | `ReactNode` | - | Icon to display alongside label |

### Variants/States

1. **Default** - Standard switch with two or more options
2. **Disabled** - Entire switch or individual options can be disabled
3. **Sizes** - Small (32px), Medium (40px), Large (48px)
4. **Full Width** - Expands to fill container
5. **With Tooltip** - Shows tooltip on hover
6. **With Icons** - Options can include icons

### Key CSS Patterns

```css
/* Container */
.switch {
  display: flex;
  background: var(--ds-background-100);
  padding: 4px;
  box-shadow: 0 0 0 1px var(--ds-gray-alpha-400);
}

/* Size variants */
.switch[data-size="small"] {
  height: 32px;
  border-radius: 6px;
}

.switch[data-size="medium"] {
  height: 40px;
  border-radius: 6px;
}

.switch[data-size="large"] {
  height: 48px;
  border-radius: 8px;
}

/* Control item */
.switch-control {
  flex: 1;
  cursor: pointer;
  color: var(--ds-gray-900);
  transition: color 0.15s ease;
}

.switch-control:hover {
  color: var(--ds-gray-1000);
}

.switch-control[data-state="active"] {
  background: var(--ds-gray-100);
  color: var(--ds-gray-1000);
}

.switch-control:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

### Implementation Notes

- Built on top of Radix UI Tabs primitive for accessibility
- Uses `class-variance-authority` for size variants
- Ensure each option has sufficient width to prevent layout jumping when active
- Active state uses background color change for clear visual feedback
- Supports keyboard navigation (arrow keys, Enter, Space)

---

## 2. Table

### Purpose
The Table component displays tabular data in a structured format with support for sorting, selection, virtualization, and custom cell rendering.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<T>` | `[]` | Data source array |
| `initialData` | `Array<T>` | `[]` | Initial data for uncontrolled mode |
| `emptyText` | `string` | - | Text displayed when table is empty |
| `hover` | `boolean` | `true` | Enable row hover effect |
| `striped` | `boolean` | `false` | Alternate row background colors |
| `bordered` | `boolean` | `false` | Add borders to cells |
| `interactive` | `boolean` | `false` | Enable row click interactions |
| `virtualized` | `boolean` | `false` | Enable virtual scrolling for large datasets |
| `onRow` | `TableOnRowClick` | - | Callback when row is clicked |
| `onCell` | `TableOnCellClick` | - | Callback when cell is clicked |
| `onChange` | `(data: T) => void` | - | Data change event |
| `rowClassName` | `TableRowClassNameHandler` | - | Custom class name for rows |

### Table.Column Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prop` | `string` | - | **Required.** Property key from data object |
| `label` | `string` | - | Column header text |
| `width` | `number` | - | Fixed column width in pixels |
| `className` | `string` | - | Custom class for column cells |
| `render` | `TableColumnRender` | - | Custom render function for cells |

### Variants/States

1. **Basic Table** - Simple data display
2. **Striped Table** - Alternating row backgrounds for readability
3. **Bordered Table** - Cell borders for clear separation
4. **Interactive Table** - Clickable rows with hover states
5. **Full Featured Table** - Combines multiple features with footer
6. **Virtualized Table** - Efficient rendering for large datasets

### Key CSS Patterns

```css
/* Table container */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

/* Header */
.table-header {
  background: var(--ds-background-100);
  border-bottom: 1px solid var(--ds-gray-alpha-400);
}

.table-header-cell {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: var(--ds-gray-900);
}

/* Body rows */
.table-row {
  border-bottom: 1px solid var(--ds-gray-alpha-200);
}

.table-row:hover {
  background: var(--ds-gray-alpha-100);
}

/* Striped variant */
.table-striped .table-row:nth-child(even) {
  background: var(--ds-gray-alpha-50);
}

/* Bordered variant */
.table-bordered .table-cell {
  border: 1px solid var(--ds-gray-alpha-200);
}

/* Cell */
.table-cell {
  padding: 12px 16px;
  color: var(--ds-gray-1000);
}

/* Interactive */
.table-interactive .table-row {
  cursor: pointer;
}

/* Footer */
.table-footer {
  background: var(--ds-background-100);
  font-weight: 500;
}
```

### Implementation Notes

- Use `render` prop for custom cell content (buttons, badges, etc.)
- Virtualization recommended for datasets > 100 rows
- TypeScript generics provide type safety for data
- Footer row can be added for totals/summaries
- Supports responsive design with horizontal scroll on small screens

---

## 3. Tabs

### Purpose
The Tabs component displays layered sections of content, showing one panel at a time. It's used for organizing related content into separate views.

### Props/API

#### Tabs (Root) Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialValue` | `string` | - | Initial active tab value |
| `value` | `string` | - | Controlled active tab value |
| `hideDivider` | `boolean` | `false` | Hide the bottom border line |
| `hideBorder` | `boolean` | `false` | Hide active tab border |
| `leftSpace` | `CSSProperties` | `'12px'` | Space on the left side |
| `onChange` | `(val: string) => void` | - | Change event callback |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Horizontal alignment |
| `activeClassName` | `string` | - | Class name for active tab |
| `activeStyles` | `object` | - | Styles for active tab |
| `hoverHeightRatio` | `number` | `0.7` | Height percentage of highlight |
| `hoverWidthRatio` | `number` | `1.15` | Width percentage of highlight |

#### Tabs.Item Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | **Required.** Display text for tab |
| `value` | `string` | - | **Required.** Unique identifier |
| `disabled` | `boolean` | `false` | Disable this tab |
| `icon` | `ReactNode` | - | Icon to display with label |

### Variants/States

1. **Default** - Standard horizontal tabs
2. **Disabled** - Entire tab list or specific tabs disabled
3. **With Icons** - Tabs with icon + label
4. **Secondary** - Alternative styling for nested tabs
5. **Scrollable** - Horizontal scroll for many tabs

### Key CSS Patterns

```css
/* Tab list container */
.tabs-list {
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  align-items: baseline;
  overflow-x: auto;
  padding-bottom: 1px;
  box-shadow: 0 -1px 0 var(--ds-gray-alpha-200) inset;
}

/* Tab trigger */
.tabs-trigger {
  padding-right: 24px;
  color: var(--ds-gray-900);
  cursor: pointer;
}

.tabs-trigger:last-child {
  padding-right: 0;
}

.tabs-trigger:hover {
  color: var(--ds-gray-1000);
}

.tabs-trigger[data-state="active"] {
  color: var(--ds-gray-1000);
}

/* Active indicator */
.tabs-trigger-inner {
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  padding: 12px 0;
  font-size: 14px;
  line-height: 20px;
}

.tabs-trigger[data-state="active"] .tabs-trigger-inner {
  border-bottom-color: var(--ds-gray-1000);
}

/* Disabled state */
.tabs-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Tab content */
.tabs-content {
  padding-top: 16px;
}
```

### Implementation Notes

- Built on Radix UI Tabs primitive for accessibility
- Supports keyboard navigation (arrow keys, Home, End)
- Hidden tabs accessible via horizontal scroll or swipe
- Active tab indicated by bottom border highlight
- Content panels are lazy-loaded by default

---

## 4. Textarea

### Purpose
The Textarea component retrieves multi-line user input with support for various states, auto-resize, and validation.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled textarea value |
| `initialValue` | `string` | - | Initial value for uncontrolled mode |
| `placeholder` | `string` | - | Placeholder text |
| `type` | `TextareaTypes` | `'default'` | Visual style type |
| `readOnly` | `boolean` | `false` | Make textarea read-only |
| `disabled` | `boolean` | `false` | Disable the textarea |
| `resize` | `CSSResize` | `'none'` | CSS resize behavior |
| `rows` | `number` | - | Number of visible text rows |
| `minRows` | `number` | - | Minimum rows for auto-resize |
| `maxRows` | `number` | - | Maximum rows for auto-resize |
| `onChange` | `(e: ChangeEvent) => void` | - | Change event handler |
| `error` | `string` | - | Error message to display |
| `label` | `string` | - | Label text |

### TextareaTypes

```typescript
type TextareaTypes = 'default' | 'secondary' | 'success' | 'warning' | 'error'
```

### CSSResize

```typescript
type CSSResize = 'none' | 'both' | 'horizontal' | 'vertical'
```

### Variants/States

1. **Default** - Standard textarea
2. **Disabled** - Non-interactive state
3. **Error** - Red border with error message
4. **Success** - Green border for valid input
5. **Warning** - Yellow border for warnings
6. **Auto-resize** - Grows with content

### Key CSS Patterns

```css
/* Container */
.textarea-wrapper {
  position: relative;
  width: 100%;
}

/* Textarea */
.textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ds-gray-1000);
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  border-radius: 6px;
  resize: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.textarea:focus {
  outline: none;
  border-color: var(--ds-gray-1000);
  box-shadow: 0 0 0 1px var(--ds-gray-1000);
}

.textarea::placeholder {
  color: var(--ds-gray-700);
}

/* Disabled */
.textarea:disabled {
  background: var(--ds-gray-alpha-100);
  color: var(--ds-gray-700);
  cursor: not-allowed;
}

/* Error state */
.textarea-error {
  border-color: var(--ds-red-700);
}

.textarea-error:focus {
  box-shadow: 0 0 0 1px var(--ds-red-700);
}

/* Success state */
.textarea-success {
  border-color: var(--ds-green-700);
}

/* Warning state */
.textarea-warning {
  border-color: var(--ds-yellow-700);
}

/* Label */
.textarea-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ds-gray-1000);
}

/* Error message */
.textarea-error-message {
  margin-top: 4px;
  font-size: 13px;
  color: var(--ds-red-700);
}
```

### Implementation Notes

- Use `react-textarea-autosize` for auto-growing behavior
- Supports both controlled and uncontrolled modes
- Error messages appear below the textarea
- Character count can be added as suffix
- Integrates with form libraries (React Hook Form, Formik)

---

## 5. Toast

### Purpose
The Toast component displays succinct, temporary messages to provide feedback about an operation or system event.

### Props/API

#### useToast Hook Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string \| ReactNode` | - | Content displayed in toast |
| `type` | `ToastTypes` | `'default'` | Visual style type |
| `delay` | `number` | `2000` | Auto-close delay in ms |
| `id` | `string` | auto | Unique identifier |
| `actions` | `ToastAction` | - | Action button configuration |

#### Layout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `padding` | `string` | - | CSS padding |
| `margin` | `string` | - | CSS margin |
| `width` | `string` | - | CSS width |
| `maxWidth` | `string` | `'90vw'` | Maximum width |
| `maxHeight` | `string` | `'75px'` | Maximum height |
| `placement` | `ToastPlacement` | `'bottomRight'` | Position on screen |

### ToastTypes

```typescript
type ToastTypes = 'default' | 'success' | 'warning' | 'error'
```

### ToastPlacement

```typescript
type ToastPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
```

### ToastAction

```typescript
interface ToastAction {
  name: string
  handler: () => void
  passive?: boolean
}
```

### Variants/States

1. **Default** - Standard informational toast
2. **Success** - Green indicator for successful operations
3. **Warning** - Yellow indicator for warnings
4. **Error** - Red indicator for errors
5. **Multi-line** - Extended content with wrapping
6. **With JSX** - Custom React content
7. **With Link** - Includes clickable link
8. **With Action** - Includes action button
9. **Undo** - Special undo action pattern
10. **Preserve** - Stays until manually dismissed

### Key CSS Patterns

```css
/* Toast container */
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

/* Placement variants */
.toast-container[data-placement="topLeft"] {
  top: 0;
  left: 0;
}

.toast-container[data-placement="topRight"] {
  top: 0;
  right: 0;
}

.toast-container[data-placement="bottomLeft"] {
  bottom: 0;
  left: 0;
}

.toast-container[data-placement="bottomRight"] {
  bottom: 0;
  right: 0;
}

/* Toast item */
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: toast-enter 0.2s ease-out;
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Type indicators */
.toast-success {
  border-left: 3px solid var(--ds-green-700);
}

.toast-warning {
  border-left: 3px solid var(--ds-yellow-700);
}

.toast-error {
  border-left: 3px solid var(--ds-red-700);
}

/* Toast content */
.toast-text {
  flex: 1;
  font-size: 14px;
  color: var(--ds-gray-1000);
}

/* Toast action */
.toast-action {
  padding: 4px 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ds-blue-700);
  background: transparent;
  border: none;
  cursor: pointer;
}

.toast-action:hover {
  text-decoration: underline;
}

/* Passive action (less prominent) */
.toast-action-passive {
  color: var(--ds-gray-700);
}
```

### Implementation Notes

- Use `useToast` hook to trigger toasts programmatically
- Toasts auto-dismiss after delay (default 2000ms)
- Set `delay: 0` for persistent toasts
- Multiple toasts stack vertically
- Supports custom React content via JSX
- Actions can be primary or passive (less prominent)

---

## 6. Toggle

### Purpose
The Toggle component displays and controls a boolean value, commonly used for on/off settings like enabling features.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | - | Controlled checked state |
| `initialChecked` | `boolean` | `false` | Initial state for uncontrolled mode |
| `onChange` | `ToggleEvent` | - | Change event handler |
| `type` | `ToggleTypes` | `'default'` | Visual style type |
| `disabled` | `boolean` | `false` | Disable the toggle |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Toggle size |
| `label` | `string` | - | Label text |
| `labelPosition` | `'left' \| 'right'` | `'right'` | Label placement |
| `color` | `string` | - | Custom active color |

### ToggleTypes

```typescript
type ToggleTypes = 'default' | 'secondary' | 'success' | 'warning' | 'error'
```

### ToggleEvent

```typescript
interface ToggleEventTarget {
  checked: boolean
}

interface ToggleEvent {
  target: ToggleEventTarget
  stopPropagation: () => void
  preventDefault: () => void
  nativeEvent: React.ChangeEvent
}
```

### Variants/States

1. **Default** - Standard toggle
2. **Disabled** - Non-interactive state
3. **Sizes** - Small, Medium, Large
4. **Custom Color** - Custom active background color
5. **With Label** - Toggle with associated label text
6. **Type Variants** - Success, Warning, Error states

### Key CSS Patterns

```css
/* Toggle container */
.toggle-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Toggle track */
.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--ds-gray-alpha-400);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Size variants */
.toggle-small {
  width: 36px;
  height: 20px;
}

.toggle-large {
  width: 52px;
  height: 28px;
}

/* Checked state */
.toggle[data-state="checked"] {
  background: var(--ds-gray-1000);
}

/* Type variants when checked */
.toggle-success[data-state="checked"] {
  background: var(--ds-green-700);
}

.toggle-warning[data-state="checked"] {
  background: var(--ds-yellow-700);
}

.toggle-error[data-state="checked"] {
  background: var(--ds-red-700);
}

/* Toggle thumb */
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.toggle[data-state="checked"] .toggle-thumb {
  transform: translateX(20px);
}

/* Disabled state */
.toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Label */
.toggle-label {
  font-size: 14px;
  color: var(--ds-gray-1000);
  cursor: pointer;
}

.toggle:disabled + .toggle-label {
  cursor: not-allowed;
  opacity: 0.5;
}
```

### Implementation Notes

- Uses native checkbox input for accessibility
- Supports both controlled and uncontrolled modes
- Label can be positioned left or right
- Custom colors override type-based colors
- Keyboard accessible (Space to toggle)
- Focus ring visible for keyboard navigation

---

## 7. Tooltip

### Purpose
The Tooltip component displays additional information when users hover over or focus on an element.

### Props/API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string \| ReactNode` | - | Tooltip content |
| `visible` | `boolean` | `false` | Controlled visibility |
| `initialVisible` | `boolean` | `false` | Initial visibility |
| `hideArrow` | `boolean` | `false` | Hide the arrow indicator |
| `type` | `TooltipTypes` | `'default'` | Visual style type |
| `placement` | `Placement` | `'top'` | Position relative to trigger |
| `trigger` | `'click' \| 'hover'` | `'hover'` | Trigger mode |
| `enterDelay` | `number` | `100` | Delay before showing (ms) |
| `leaveDelay` | `number` | `150` | Delay before hiding (ms) |
| `offset` | `number` | `12` | Distance from trigger (px) |
| `portalClassName` | `string` | - | Class for portal container |
| `onVisibleChange` | `(visible: boolean) => void` | - | Visibility change callback |
| `sideOffset` | `number` | `5` | Offset from trigger side |

### Placement

```typescript
type Placement = 
  | 'top' | 'topStart' | 'topEnd'
  | 'bottom' | 'bottomStart' | 'bottomEnd'
  | 'left' | 'leftStart' | 'leftEnd'
  | 'right' | 'rightStart' | 'rightEnd'
```

### TooltipTypes

```typescript
type TooltipTypes = 'default' | 'dark' | 'lite'
```

### Variants/States

1. **Default** - Standard tooltip on hover
2. **Placements** - 12 position options
3. **No Delay** - Instant show/hide
4. **Box Align** - Alignment within placement
5. **Custom Content** - Rich JSX content
6. **Custom Type** - Dark/lite themes
7. **Click Trigger** - Show on click instead of hover
8. **No Arrow** - Tooltip without pointer arrow

### Key CSS Patterns

```css
/* Tooltip container */
.tooltip {
  z-index: 9999;
  overflow: hidden;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--ds-gray-100);
  background: var(--ds-contrast);
  border: 1px solid var(--ds-contrast);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Animation */
.tooltip {
  animation: tooltip-enter 0.15s ease-out;
}

@keyframes tooltip-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Exit animation */
.tooltip[data-state="closed"] {
  animation: tooltip-exit 0.1s ease-in;
}

@keyframes tooltip-exit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Slide animations based on side */
.tooltip[data-side="top"] {
  animation-name: slide-from-bottom;
}

.tooltip[data-side="bottom"] {
  animation-name: slide-from-top;
}

.tooltip[data-side="left"] {
  animation-name: slide-from-right;
}

.tooltip[data-side="right"] {
  animation-name: slide-from-left;
}

@keyframes slide-from-bottom {
  from { transform: translateY(4px); }
  to { transform: translateY(0); }
}

@keyframes slide-from-top {
  from { transform: translateY(-4px); }
  to { transform: translateY(0); }
}

@keyframes slide-from-left {
  from { transform: translateX(-4px); }
  to { transform: translateX(0); }
}

@keyframes slide-from-right {
  from { transform: translateX(4px); }
  to { transform: translateX(0); }
}

/* Arrow */
.tooltip-arrow {
  fill: var(--ds-contrast);
}

/* Type variants */
.tooltip-dark {
  background: var(--ds-gray-1000);
  color: var(--ds-gray-100);
}

.tooltip-lite {
  background: var(--ds-background-100);
  color: var(--ds-gray-1000);
  border-color: var(--ds-gray-alpha-400);
}
```

### Implementation Notes

- Built on Radix UI Tooltip primitive
- Renders in portal for proper stacking
- Supports keyboard focus triggers
- Auto-positions to stay in viewport
- Enter/leave delays prevent flickering
- Custom content supports any React elements
- Arrow automatically points to trigger element

---

## Summary

### Component Comparison

| Component | Primary Use | Accessibility | Animation |
|-----------|-------------|---------------|-----------|
| Switch | Mode selection | Keyboard nav, ARIA | Background transition |
| Table | Data display | Row/cell focus | Hover states |
| Tabs | Content organization | Arrow keys, ARIA | Border indicator |
| Textarea | Multi-line input | Label association | Focus ring |
| Toast | Notifications | Live region | Enter/exit |
| Toggle | Boolean settings | Checkbox semantics | Thumb slide |
| Tooltip | Contextual info | Focus trigger | Fade/scale |

### Common Design Patterns

1. **Color System**: All components use CSS custom properties (`--ds-*`) for theming
2. **Transitions**: Consistent 150-200ms ease transitions
3. **Border Radius**: 6px for small elements, 8px for larger containers
4. **Focus States**: Visible focus rings for keyboard navigation
5. **Disabled States**: Reduced opacity (0.5) and `cursor: not-allowed`

### Integration with Existing UI

These components integrate with the existing Geist design system through:
- Shared color tokens
- Consistent spacing scale (4px base)
- Typography system (14px base, Geist font)
- Shadow system for elevation
- Animation timing functions

---

*Documentation compiled from Vercel Geist Design System. Content was rephrased for compliance with licensing restrictions.*

**Sources:**
- [Vercel Geist Design System](https://vercel.com/geist)
- [Geist UI Documentation](https://geist-ui.dev)
- [Vercel UI Components](https://vercel-ui-phi.vercel.app)
