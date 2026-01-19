# Geist Design System - Component Reference

This document provides comprehensive documentation for Geist UI components, extracted from the official Vercel Geist design system.

---

## Table of Contents

1. [Checkbox](#checkbox)
2. [Radio](#radio)
3. [Toggle](#toggle)
4. [Choicebox](#choicebox)
5. [Textarea](#textarea)
6. [Skeleton](#skeleton)
7. [Note](#note)
8. [Drawer](#drawer)
9. [Pagination](#pagination)
10. [Context Menu](#context-menu)
11. [Gauge](#gauge)
12. [Multi-Select](#multi-select)
13. [Code Block](#code-block)
14. [Materials](#materials)

---

## Checkbox

A control that toggles between two options, checked or unchecked.

### Description
The Checkbox component provides a binary selection control that allows users to toggle between checked and unchecked states. It also supports an indeterminate state for partial selections.

### States

| State | Description |
|-------|-------------|
| **Default** | Standard checkbox with label |
| **Checked** | Checkbox in selected state |
| **Unchecked** | Checkbox in unselected state |
| **Disabled** | Non-interactive checkbox (can be checked, unchecked, or indeterminate) |
| **Disabled Checked** | Disabled checkbox in checked state |
| **Disabled Indeterminate** | Disabled checkbox in indeterminate state |
| **Indeterminate** | Partial selection state (neither fully checked nor unchecked) |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `checked` | boolean | Controls the checked state |
| `disabled` | boolean | Disables the checkbox |
| `indeterminate` | boolean | Sets the indeterminate state |
| `label` | string | Text label for the checkbox |
| `onChange` | function | Callback when state changes |

### Usage Guidelines
- Use checkboxes for binary choices or multiple selections from a list
- Use indeterminate state when a parent checkbox has some but not all children selected
- Always provide a clear label describing what the checkbox controls
- Disabled checkboxes should indicate why they're disabled when possible

---

## Radio

A control for selecting a single option from a group of mutually exclusive choices.

### Description
The Radio component allows users to select exactly one option from a set of mutually exclusive choices. Radio buttons are typically used within a RadioGroup.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard radio button with label within a RadioGroup |
| **Disabled** | Non-interactive radio button |
| **Required** | Radio group that requires a selection |
| **Headless** | RadioGroup without RadioGroup.Item for custom implementations |
| **Standalone** | Unlabelled radio input for use in custom UI |

### States

| State | Description |
|-------|-------------|
| **Default** | Unselected radio button |
| **Selected** | Radio button in selected state |
| **Disabled** | Non-interactive radio button |
| **Focus** | Radio button with keyboard focus |
| **Hover** | Radio button on mouse hover |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | string | The value of the selected option |
| `disabled` | boolean | Disables the radio group or individual item |
| `required` | boolean | Makes selection required |
| `onChange` | function | Callback when selection changes |
| `name` | string | Name attribute for form submission |

### Usage Guidelines
- Use radio buttons when users must select exactly one option from a list
- Always group related radio buttons together using RadioGroup
- Provide clear, concise labels for each option
- Consider using Choicebox for more prominent single-select scenarios
- Use headless variant when building custom radio-like interfaces

---

## Toggle

A switch control for toggling between on and off states.

### Description
The Toggle component provides a switch-style control for binary on/off settings. It's commonly used for enabling or disabling features.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard toggle switch |
| **Disabled** | Non-interactive toggle |
| **With Label** | Toggle with associated text label |
| **Custom Color** | Toggle with custom accent color |

### Sizes

| Size | Description |
|------|-------------|
| **Small** | Compact toggle for dense UIs |
| **Medium** | Default toggle size |
| **Large** | Larger toggle for emphasis |

### States

| State | Description |
|-------|-------------|
| **On** | Toggle in active/enabled state |
| **Off** | Toggle in inactive/disabled state |
| **Disabled** | Non-interactive toggle |
| **Focus** | Toggle with keyboard focus |
| **Hover** | Toggle on mouse hover |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `checked` | boolean | Controls the on/off state |
| `disabled` | boolean | Disables the toggle |
| `size` | string | Size variant (small, medium, large) |
| `color` | string | Custom accent color |
| `label` | string | Associated label text |
| `onChange` | function | Callback when state changes |

### Usage Guidelines
- Use toggles for immediate on/off settings that take effect instantly
- Position labels consistently (typically to the right of the toggle)
- Use clear labels like "Enable Firewall" rather than ambiguous text
- Consider the toggle's default state carefully
- Don't use toggles for actions that require confirmation

---

## Choicebox

A prominent selection component for single or multiple choices with rich content.

### Description
The Choicebox component provides a card-style selection interface for making choices. It supports both single-select (radio-like) and multi-select (checkbox-like) behaviors with the ability to display custom content.

### Variants

| Variant | Description |
|---------|-------------|
| **Single-select** | Only one option can be selected at a time |
| **Multi-select** | Multiple options can be selected |
| **Custom Content** | Displays additional content when an option is selected |

### States

| State | Description |
|-------|-------------|
| **Default** | Unselected choicebox |
| **Selected** | Choicebox in selected state |
| **Disabled (Group)** | Entire choicebox group is disabled |
| **Disabled (Single)** | Individual choicebox item is disabled |
| **Hover** | Choicebox on mouse hover |
| **Focus** | Choicebox with keyboard focus |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `type` | 'single' \| 'multi' | Selection mode |
| `disabled` | boolean | Disables the choicebox or group |
| `value` | string \| string[] | Selected value(s) |
| `onChange` | function | Callback when selection changes |
| `children` | ReactNode | Custom content to display |

### Usage Guidelines
- Use Choicebox for prominent selection scenarios like pricing tiers or plan selection
- Single-select mode works like radio buttons but with more visual prominence
- Multi-select mode works like checkboxes with card-style presentation
- Custom content can reveal additional details when an option is selected
- Consider using regular Radio or Checkbox for simpler, less prominent selections

---

## Textarea

A multi-line text input control for longer form content.

### Description
The Textarea component provides a multi-line text input field for entering longer text content such as descriptions, comments, or messages.

### States

| State | Description |
|-------|-------------|
| **Default** | Standard textarea |
| **Error** | Textarea with error state and message |
| **Disabled** | Non-interactive textarea |
| **Focus** | Textarea with keyboard focus |
| **Hover** | Textarea on mouse hover |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | string | The text content |
| `placeholder` | string | Placeholder text |
| `disabled` | boolean | Disables the textarea |
| `error` | string | Error message to display |
| `rows` | number | Number of visible text rows |
| `maxLength` | number | Maximum character limit |
| `onChange` | function | Callback when content changes |
| `resize` | string | Resize behavior (none, vertical, horizontal, both) |

### Usage Guidelines
- Use textarea for multi-line text input (descriptions, comments, messages)
- Provide clear error messages when validation fails
- Consider setting appropriate rows based on expected content length
- Use placeholder text to provide input hints
- Consider character limits for fields with length restrictions

---

## Skeleton

A placeholder component that indicates loading content.

### Description
The Skeleton component displays animated placeholder shapes while content is loading. It helps maintain layout stability and provides visual feedback during data fetching.

### Variants

| Variant | Description |
|---------|-------------|
| **Default with set width** | Skeleton with explicit width |
| **Default with box height** | Skeleton with explicit height |
| **Wrapping children** | Auto-calculates size based on children |
| **Wrapping children with fixed size** | Hides when children load, retains size |
| **Pill** | Rounded pill-shaped skeleton |
| **Rounded** | Skeleton with rounded corners |
| **Squared** | Skeleton with square corners |
| **No animation** | Static skeleton without shimmer effect |

### Shapes

| Shape | Description |
|-------|-------------|
| **Rectangle** | Default rectangular shape |
| **Pill** | Fully rounded ends |
| **Rounded** | Rounded corners |
| **Squared** | Sharp corners |
| **Circle** | Circular shape for avatars |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `width` | string \| number | Width of the skeleton |
| `height` | string \| number | Height of the skeleton |
| `shape` | string | Shape variant (pill, rounded, squared) |
| `animated` | boolean | Enable/disable shimmer animation |
| `children` | ReactNode | Content to wrap (skeleton hides when children render) |

### Usage Guidelines
- Use skeletons to indicate loading states and maintain layout stability
- Match skeleton shapes to the content they represent (e.g., circles for avatars)
- Wrapping children mode automatically shows content when loaded
- Disable animation for static placeholders or reduced motion preferences
- Use consistent skeleton patterns across your application

---

## Note

An informational component for displaying contextual messages and alerts.

### Description
The Note component displays informational messages, warnings, errors, and other contextual content. It supports multiple types, sizes, and can include actions.

### Sizes

| Size | Description |
|------|-------------|
| **Small** | Compact note for inline messages |
| **Default** | Standard note size |
| **Large** | Larger note for prominent messages |

### Types/Variants

| Type | Description |
|------|-------------|
| **Default** | Standard informational note |
| **Success** | Positive/success message (green) |
| **Error** | Error/failure message (red) |
| **Warning** | Warning/caution message (yellow/amber) |
| **Secondary** | Secondary/muted information |
| **Violet** | Violet-themed note |
| **Cyan** | Cyan-themed note |
| **Tertiary** | Tertiary styling |
| **Alert** | Alert-style note |
| **Lite** | Lightweight styling |
| **Ghost** | Minimal/ghost styling |

### Fill Modes

| Mode | Description |
|------|-------------|
| **Outline** | Border-only styling (default) |
| **Filled** | Solid background fill |

### States

| State | Description |
|-------|-------------|
| **Default** | Standard note appearance |
| **Disabled** | Muted/disabled note |
| **With Action** | Note with clickable action button |
| **With Label** | Note with custom label prefix |
| **No Label** | Note without label prefix |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `type` | string | Note type (success, error, warning, etc.) |
| `size` | string | Size variant (small, default, large) |
| `fill` | boolean | Use filled background style |
| `disabled` | boolean | Disable the note |
| `label` | string \| boolean | Custom label or hide label |
| `action` | ReactNode | Action button/link |
| `children` | ReactNode | Note content |

### Usage Guidelines
- Use appropriate type for the message context (error for failures, success for confirmations)
- Keep note content concise and actionable
- Use filled variant for more prominent messages
- Include actions when users can take immediate steps
- Consider size based on message importance and context

---

## Drawer

A slide-in panel component for mobile and small viewport interactions.

### Description
The Drawer component provides a slide-in panel from the bottom of the screen, primarily designed for mobile and small viewport interactions.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard drawer with default height |
| **Custom Height** | Drawer with specified height |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `open` | boolean | Controls drawer visibility |
| `onClose` | function | Callback when drawer closes |
| `height` | string \| number | Custom drawer height |
| `children` | ReactNode | Drawer content |

### Usage Guidelines
- **Only use Drawer on small viewports** - use Modal or Sheet for larger screens
- Drawers slide up from the bottom of the screen
- Provide clear close affordances (close button, backdrop click, swipe down)
- Keep drawer content focused and concise
- Consider the mobile context when designing drawer content

---

## Pagination

A navigation component for paginated content.

### Description
The Pagination component provides navigation controls for moving between pages of content.

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `page` | number | Current page number |
| `totalPages` | number | Total number of pages |
| `onChange` | function | Callback when page changes |
| `siblingCount` | number | Number of sibling pages to show |
| `boundaryCount` | number | Number of boundary pages to show |

### Usage Guidelines
- Use pagination for large datasets that need to be split across pages
- Show current page context (e.g., "Page 3 of 10")
- Provide first/last page navigation for large page counts
- Consider infinite scroll as an alternative for certain use cases
- Ensure pagination is keyboard accessible

---

## Context Menu

A right-click menu component for contextual actions.

### Description
The Context Menu component displays a menu of actions when users right-click on an element. It supports various item types including disabled items, links, and items with prefix/suffix content.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard context menu with action items |
| **Disabled Items** | Menu with some items disabled |
| **Link Items** | Menu items that navigate to URLs |
| **Prefix and Suffix** | Items with icons or badges |

### Item Types

| Type | Description |
|------|-------------|
| **Action Item** | Clickable action |
| **Link Item** | Navigation link |
| **Disabled Item** | Non-interactive item |
| **Separator** | Visual divider between groups |
| **Submenu** | Nested menu |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `trigger` | ReactNode | Element that triggers the context menu |
| `items` | array | Menu items configuration |
| `disabled` | boolean | Disable specific items |
| `prefix` | ReactNode | Icon or content before item text |
| `suffix` | ReactNode | Badge or content after item text |
| `href` | string | URL for link items |

### Usage Guidelines
- Use context menus for secondary actions that don't need to be always visible
- Provide keyboard shortcuts for common actions
- Group related actions with separators
- Disable items that aren't currently available rather than hiding them
- Keep menu items concise and action-oriented

---

## Gauge

A circular progress indicator for displaying values within a range.

### Description
The Gauge component displays a value as a circular arc, useful for showing progress, scores, or ratios.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Basic gauge with value |
| **With Label** | Gauge with text label |
| **Default Color Scale** | Automatic color based on value |
| **Custom Color Range** | User-defined color thresholds |
| **Custom Secondary Color** | Custom background arc color |
| **Arc Priority** | Equal arc sizing for ratio display |
| **Indeterminate** | Loading/unknown state |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | number | Current value (0-100) |
| `label` | string | Text label to display |
| `color` | string | Primary arc color |
| `secondaryColor` | string | Background arc color |
| `colorScale` | array | Color thresholds for automatic coloring |
| `arcPriority` | 'equal' \| 'value' | Arc sizing mode |
| `indeterminate` | boolean | Show loading state |

### Usage Guidelines
- Use gauges for displaying single values within a known range
- Default color scale provides automatic red/yellow/green coloring
- Use equal arc priority when displaying ratios (e.g., 50/50 split)
- Provide labels for context when the value alone isn't clear
- Use indeterminate state when the value is loading or unknown

---

## Multi-Select

A selection component for choosing multiple items from a list with advanced interaction patterns.

### Description
The Multi-Select component provides a sophisticated interface for selecting multiple items with support for keyboard navigation, smart selection actions, and controlled state management.

### Features

| Feature | Description |
|---------|-------------|
| **Checkbox Selection** | Toggle individual items via checkbox |
| **Smart Selection** | Context-aware actions (Select Only, Select All, Toggle) |
| **Hidden Action Labels** | Action hints appear on hover/focus |
| **Keyboard Navigation** | Full keyboard support |
| **Controlled State** | Programmatic selection management |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| **Up/Down arrows** | Navigate between rows |
| **Left/Right arrows** | Switch between checkbox and button focus |
| **Tab** | Focus away from menu |
| **Enter/Space** | Execute action based on focus |

### Selection Behaviors

| Focus State | Enter/Space Action |
|-------------|-------------------|
| **Checkbox focus** | Toggle individual item |
| **Button focus** | Smart selection (Select Only, Select All, or Toggle) |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `items` | array | List of selectable items |
| `selected` | array | Currently selected items |
| `onChange` | function | Callback when selection changes |
| `onClearAll` | function | Clear all selections |

### Usage Guidelines
- Use for complex multi-selection scenarios with many items
- Leverage keyboard navigation for accessibility
- Smart selection actions reduce clicks for common operations
- Use controlled state for programmatic selection management
- Action labels provide discoverability without cluttering the UI

---

## Code Block

A syntax-highlighted code display component with advanced features.

### Description
The Code Block component displays formatted code with syntax highlighting, line numbers, and various annotation features.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Code block with filename tab |
| **No Filename** | Code block without filename header |
| **Highlighted Lines** | Specific lines visually emphasized |
| **Added & Removed Lines** | Diff-style additions and deletions |
| **Referenced Lines** | Clickable line numbers for linking |
| **Language Switcher** | Toggle between language versions |
| **Hidden Line Numbers** | Code without line numbers |

### Features

| Feature | Description |
|---------|-------------|
| **Syntax Highlighting** | Language-aware code coloring |
| **Line Numbers** | Numbered lines (can be hidden) |
| **Line Highlighting** | Emphasize specific lines |
| **Diff Display** | Show added/removed lines |
| **Line References** | Link to specific lines |
| **Language Tabs** | Switch between code versions |
| **Copy Button** | Copy code to clipboard |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `code` | string | The code content |
| `language` | string | Programming language for highlighting |
| `filename` | string | Filename to display in tab |
| `highlightLines` | array | Line numbers to highlight |
| `addedLines` | array | Lines marked as added (green) |
| `removedLines` | array | Lines marked as removed (red) |
| `showLineNumbers` | boolean | Show/hide line numbers |
| `languages` | array | Multiple language versions |

### Usage Guidelines
- Always specify the correct language for proper syntax highlighting
- Use filename tabs to provide context about the code
- Highlight important lines to draw attention
- Use diff styling for showing code changes
- Line references enable deep linking to specific code sections
- Hide line numbers for short snippets where they add noise

---

## Materials

A system of surface styles for creating depth and hierarchy.

### Description
Materials define the visual treatment of surfaces in the UI, including shadows, borders, and corner radii. They create a consistent depth hierarchy across the interface.

### Surface Materials (On the page)

| Material | Class Name | Usage | Radius |
|----------|------------|-------|--------|
| **Material Base** | `material-base` | Everyday use | 6px |
| **Material Small** | `material-small` | Slightly raised elements | 6px |
| **Material Medium** | `material-medium` | Further raised elements | 12px |
| **Material Large** | `material-large` | Most raised surface elements | 12px |

### Floating Materials (Above the page)

| Material | Class Name | Usage | Radius |
|----------|------------|-------|--------|
| **Material Tooltip** | `material-tooltip` | Tooltips (lightest shadow, with triangular stem) | 6px |
| **Material Menu** | `material-menu` | Dropdown menus, context menus | 12px |
| **Material Modal** | `material-modal` | Modal dialogs | 12px |
| **Material Fullscreen** | `material-fullscreen` | Fullscreen overlays (biggest lift) | 16px |

### Depth Hierarchy

```
Surface (On page):
  Base → Small → Medium → Large
  (increasing elevation)

Floating (Above page):
  Tooltip → Menu → Modal → Fullscreen
  (increasing elevation and shadow)
```

### Usage Guidelines
- Use surface materials for elements that sit on the page
- Use floating materials for elements that appear above the page
- Tooltips are the only floating elements with triangular stems
- Corner radius increases with elevation (6px → 12px → 16px)
- Shadow intensity increases with elevation
- Maintain consistent material usage across similar components
- Consider the visual hierarchy when choosing materials

---

## Summary

This reference covers 14 core Geist components:

| Component | Primary Use Case |
|-----------|-----------------|
| **Checkbox** | Binary selection, multiple choice |
| **Radio** | Single selection from mutually exclusive options |
| **Toggle** | On/off settings |
| **Choicebox** | Prominent single/multi selection with rich content |
| **Textarea** | Multi-line text input |
| **Skeleton** | Loading placeholders |
| **Note** | Informational messages and alerts |
| **Drawer** | Mobile slide-in panels |
| **Pagination** | Page navigation |
| **Context Menu** | Right-click actions |
| **Gauge** | Circular progress/value display |
| **Multi-Select** | Advanced multiple selection |
| **Code Block** | Syntax-highlighted code display |
| **Materials** | Surface depth and hierarchy system |

---

*Documentation extracted from [Vercel Geist Design System](https://vercel.com/geist)*
