# Geist Components Reference - Batch 2

This document provides comprehensive documentation for Geist Design System components, covering Code Block, Collapse, Combobox, Command Menu, Context Card, Context Menu, Drawer, and Empty State.

---

## Table of Contents

1. [Code Block](#code-block)
2. [Collapse](#collapse)
3. [Combobox](#combobox)
4. [Command Menu](#command-menu)
5. [Context Card](#context-card)
6. [Context Menu](#context-menu)
7. [Drawer](#drawer)
8. [Empty State](#empty-state)

---

## Code Block

**Description:** A syntax-highlighted code display component with advanced features for displaying formatted code with line numbers, annotations, and various visual enhancements.

### Purpose
Display code snippets with syntax highlighting, line numbers, and various annotation features. Ideal for documentation, tutorials, and technical content.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Code block with filename tab displayed |
| **No Filename** | Code block without filename header |
| **Highlighted Lines** | Specific lines visually emphasized |
| **Added & Removed Lines** | Diff-style additions (green) and deletions (red) |
| **Referenced Lines** | Clickable line numbers for deep linking |
| **Language Switcher** | Toggle between multiple language versions |
| **Hidden Line Numbers** | Code without line numbers |

### Features

| Feature | Description |
|---------|-------------|
| **Syntax Highlighting** | Language-aware code coloring |
| **Line Numbers** | Numbered lines (can be hidden) |
| **Line Highlighting** | Emphasize specific lines |
| **Diff Display** | Show added/removed lines |
| **Line References** | Link to specific lines (press on any line number) |
| **Language Tabs** | Switch between code versions |
| **Copy Button** | Copy code to clipboard |

### Props/API

| Prop | Type | Description |
|------|------|-------------|
| `code` | `string` | The code content to display |
| `language` | `string` | Programming language for syntax highlighting |
| `filename` | `string` | Filename to display in tab header |
| `highlightLines` | `number[]` | Array of line numbers to highlight |
| `addedLines` | `number[]` | Lines marked as added (green background) |
| `removedLines` | `number[]` | Lines marked as removed (red background) |
| `showLineNumbers` | `boolean` | Show/hide line numbers (default: true) |
| `languages` | `Language[]` | Multiple language versions for switcher |
| `copyable` | `boolean` | Enable copy to clipboard button |

### Key CSS Patterns

```css
/* Code block container */
.code-block {
  background: var(--geist-background);
  border: 1px solid var(--accents-2);
  border-radius: var(--geist-radius);
  overflow: hidden;
}

/* Filename tab */
.code-block-header {
  background: var(--accents-1);
  padding: 8px 16px;
  border-bottom: 1px solid var(--accents-2);
  font-family: var(--font-mono);
  font-size: 13px;
}

/* Line highlighting */
.line-highlighted {
  background: rgba(var(--geist-highlight-rgb), 0.1);
  border-left: 2px solid var(--geist-highlight);
}

/* Added lines (diff) */
.line-added {
  background: rgba(var(--geist-success-rgb), 0.15);
}

/* Removed lines (diff) */
.line-removed {
  background: rgba(var(--geist-error-rgb), 0.15);
  text-decoration: line-through;
}

/* Line numbers */
.line-number {
  color: var(--accents-4);
  user-select: none;
  padding-right: 16px;
  text-align: right;
  min-width: 40px;
}
```

### Implementation Notes

- Always specify the correct language for proper syntax highlighting
- Use filename tabs to provide context about the code
- Highlight important lines to draw attention to key sections
- Use diff styling (added/removed) for showing code changes
- Line references enable deep linking to specific code sections
- Hide line numbers for short snippets where they add visual noise
- Language switcher is useful for showing same logic in multiple languages

---

## Collapse

**Description:** An expandable/collapsible content container that allows users to show or hide content sections.

### Purpose
Toggle visibility of content sections, useful for FAQs, accordions, and progressive disclosure of information.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard collapsible section |
| **Expanded** | Initially expanded state |
| **Multiple** | Multiple collapse items in a group |
| **Small** | Compact size variant |

### Sizes

| Size | Description |
|------|-------------|
| **Default** | Standard collapse size |
| **Small** | Compact collapse for dense UIs |

### States

| State | Description |
|-------|-------------|
| **Collapsed** | Content is hidden |
| **Expanded** | Content is visible |
| **Hover** | Visual feedback on hover |
| **Focus** | Keyboard focus state |

### Props/API

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Header text for the collapse trigger |
| `expanded` | `boolean` | Controlled expansion state |
| `defaultExpanded` | `boolean` | Initial expansion state (uncontrolled) |
| `onToggle` | `(expanded: boolean) => void` | Callback when state changes |
| `size` | `'default' \| 'small'` | Size variant |
| `disabled` | `boolean` | Disable interaction |
| `children` | `ReactNode` | Collapsible content |

### Key CSS Patterns

```css
/* Collapse container */
.collapse {
  border: 1px solid var(--accents-2);
  border-radius: var(--geist-radius);
  overflow: hidden;
}

/* Collapse header/trigger */
.collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  background: var(--geist-background);
  transition: background 0.15s ease;
}

.collapse-header:hover {
  background: var(--accents-1);
}

/* Chevron icon rotation */
.collapse-icon {
  transition: transform 0.2s ease;
}

.collapse-icon[data-expanded="true"] {
  transform: rotate(180deg);
}

/* Content area with animation */
.collapse-content {
  overflow: hidden;
  transition: height 0.2s ease;
}

/* Small variant */
.collapse-small .collapse-header {
  padding: 12px;
  font-size: 14px;
}

/* Multiple collapse group */
.collapse-group .collapse + .collapse {
  border-top: none;
}
```

### Implementation Notes

- Use for progressive disclosure of content
- Multiple collapses can be grouped for accordion-like behavior
- Animate height transitions for smooth expand/collapse
- Include chevron icon that rotates on state change
- Small variant useful for dense information displays
- Consider keyboard accessibility (Enter/Space to toggle)
- Use `aria-expanded` for screen reader support

---

## Combobox

**Description:** A searchable dropdown selection component with autocomplete functionality, combining text input with a filterable list of options.

### Purpose
Allow users to search and select from a list of options. Ideal for large lists where filtering improves usability.

### Variants

| Variant | Description |
|---------|-------------|
| **Uncontrolled** | Internal state management |
| **Controlled** | External state management via props |
| **With Label** | Combobox with associated label |
| **Inside Modal** | Common pattern - Modal renders as Dialog on mobile |

### Sizes

| Size | Description |
|------|-------------|
| **Small** | Compact combobox |
| **Medium** | Default size |
| **Large** | Larger combobox |

### States

| State | Description |
|-------|-------------|
| **Default** | Normal appearance |
| **Disabled** | Non-interactive state |
| **Errored** | Shows error state styling |
| **Open** | Dropdown is expanded |
| **Focused** | Input has keyboard focus |

### Props/API

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Selected value (controlled) |
| `defaultValue` | `string` | Initial value (uncontrolled) |
| `options` | `Option[]` | List of selectable options |
| `disabled` | `boolean` | Disable the combobox |
| `error` | `boolean` | Show error state |
| `label` | `string` | Associated label text |
| `placeholder` | `string` | Input placeholder text |
| `inputWidth` | `string` | Custom input width |
| `listWidth` | `string` | Custom dropdown list width |
| `emptyMessage` | `string` | Custom message when no results |
| `onChange` | `(value: string) => void` | Selection change callback |
| `onSearch` | `(query: string) => void` | Search input callback |

### Key CSS Patterns

```css
/* Combobox input container */
.combobox-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--accents-2);
  border-radius: var(--geist-radius);
  background: var(--geist-background);
  transition: border-color 0.15s ease;
}

.combobox-input:focus-within {
  border-color: var(--geist-foreground);
}

/* Error state */
.combobox-input[data-error="true"] {
  border-color: var(--geist-error);
}

/* Disabled state */
.combobox-input[data-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dropdown list */
.combobox-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--geist-background);
  border: 1px solid var(--accents-2);
  border-radius: var(--geist-radius);
  box-shadow: var(--shadow-medium);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
}

/* Option item */
.combobox-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.combobox-option:hover,
.combobox-option[data-highlighted="true"] {
  background: var(--accents-1);
}

.combobox-option[data-selected="true"] {
  background: var(--accents-2);
}

/* Empty state */
.combobox-empty {
  padding: 16px;
  text-align: center;
  color: var(--accents-5);
}
```

### Implementation Notes

- Use for large lists where search/filtering improves UX
- Common pattern: use inside Modal (auto-renders as Dialog on mobile)
- Provide custom empty message for better user experience
- Custom widths allow fitting specific layout requirements
- Support keyboard navigation (Arrow keys, Enter, Escape)
- Filter options as user types for instant feedback
- Consider debouncing search for async option loading

---

## Command Menu

**Description:** A full-screen overlay that launches a set of actions, providing quick access to commands and navigation.

### Purpose
Launch a set of actions as a full-screen overlay. Commonly triggered by keyboard shortcut (⌘K or Ctrl+K).

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard command menu overlay |

### Features

| Feature | Description |
|---------|-------------|
| **Search** | Filter commands by typing |
| **Keyboard Navigation** | Arrow keys to navigate, Enter to select |
| **Grouping** | Commands organized into groups |
| **Shortcuts** | Display keyboard shortcuts for actions |
| **Recent** | Show recently used commands |

### Props/API

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Control menu visibility |
| `onOpenChange` | `(open: boolean) => void` | Visibility change callback |
| `commands` | `Command[]` | List of available commands |
| `groups` | `CommandGroup[]` | Grouped commands |
| `placeholder` | `string` | Search input placeholder |
| `onSelect` | `(command: Command) => void` | Command selection callback |
| `recentCommands` | `Command[]` | Recently used commands |

### Command Structure

```typescript
interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string[];
  action: () => void;
  group?: string;
}

interface CommandGroup {
  id: string;
  label: string;
  commands: Command[];
}
```

### Key CSS Patterns

```css
/* Full-screen overlay */
.command-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
  z-index: 9999;
}

/* Command menu container */
.command-menu {
  width: 100%;
  max-width: 640px;
  background: var(--geist-background);
  border-radius: var(--geist-radius-lg);
  box-shadow: var(--shadow-large);
  overflow: hidden;
}

/* Search input */
.command-menu-input {
  width: 100%;
  padding: 16px 20px;
  border: none;
  border-bottom: 1px solid var(--accents-2);
  font-size: 16px;
  background: transparent;
  outline: none;
}

/* Command list */
.command-menu-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

/* Command group */
.command-group-label {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accents-5);
  text-transform: uppercase;
}

/* Command item */
.command-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--geist-radius);
  cursor: pointer;
  transition: background 0.1s ease;
}

.command-item:hover,
.command-item[data-highlighted="true"] {
  background: var(--accents-1);
}

/* Keyboard shortcut display */
.command-shortcut {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.command-shortcut kbd {
  padding: 2px 6px;
  background: var(--accents-2);
  border-radius: 4px;
  font-size: 12px;
  font-family: var(--font-mono);
}
```

### Implementation Notes

- Typically triggered by ⌘K (Mac) or Ctrl+K (Windows)
- Full-screen overlay provides focused interaction
- Search filters commands in real-time
- Group related commands for better organization
- Display keyboard shortcuts for power users
- Show recently used commands for quick access
- Close on Escape key or backdrop click
- Focus trap within the menu when open

---

## Context Card

**Description:** A card component that provides contextual information or actions, often used for theme selection or settings.

### Purpose
Display contextual options or settings in a card format. Commonly used for theme selection (system/light/dark).

### Variants

| Variant | Description |
|---------|-------------|
| **Theme Selector** | System/Light/Dark theme options |
| **Settings Card** | Contextual settings display |

### Props/API

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title/heading |
| `options` | `Option[]` | Selectable options |
| `value` | `string` | Currently selected value |
| `onChange` | `(value: string) => void` | Selection change callback |
| `children` | `ReactNode` | Custom card content |

### Key CSS Patterns

```css
/* Context card container */
.context-card {
  background: var(--geist-background);
  border: 1px solid var(--accents-2);
  border-radius: var(--geist-radius);
  padding: 16px;
  box-shadow: var(--shadow-small);
}

/* Card title */
.context-card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--accents-5);
  margin-bottom: 12px;
}

/* Option buttons */
.context-card-options {
  display: flex;
  gap: 8px;
}

.context-card-option {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--accents-2);
  border-radius: var(--geist-radius);
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.context-card-option:hover {
  border-color: var(--accents-4);
}

.context-card-option[data-selected="true"] {
  border-color: var(--geist-foreground);
  background: var(--accents-1);
}
```

### Implementation Notes

- Use for contextual settings that need visual prominence
- Theme selector is the most common use case
- Options should be clearly labeled
- Selected state should be visually distinct
- Consider keyboard navigation between options
- Persist selections appropriately (localStorage for theme)

---

## Context Menu

**Description:** A right-click menu component for displaying contextual actions when users right-click on an element.

### Purpose
Display a menu of actions when users right-click on an element. Supports various item types including disabled items, links, and items with prefix/suffix content.

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

### Props/API

| Prop | Type | Description |
|------|------|-------------|
| `trigger` | `ReactNode` | Element that triggers the context menu |
| `items` | `MenuItem[]` | Menu items configuration |
| `onSelect` | `(item: MenuItem) => void` | Item selection callback |

### MenuItem Structure

```typescript
interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  href?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  shortcut?: string;
  onClick?: () => void;
  items?: MenuItem[]; // For submenus
}
```

### Key CSS Patterns

```css
/* Context menu container */
.context-menu {
  position: fixed;
  min-width: 180px;
  background: var(--geist-background);
  border: 1px solid var(--accents-2);
  border-radius: var(--geist-radius);
  box-shadow: var(--shadow-medium);
  padding: 4px;
  z-index: 9999;
}

/* Menu item */
.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: calc(var(--geist-radius) - 2px);
  cursor: pointer;
  font-size: 14px;
  transition: background 0.1s ease;
}

.context-menu-item:hover {
  background: var(--accents-1);
}

/* Disabled item */
.context-menu-item[data-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}

.context-menu-item[data-disabled="true"]:hover {
  background: transparent;
}

/* Prefix icon */
.context-menu-prefix {
  width: 16px;
  height: 16px;
  color: var(--accents-5);
}

/* Suffix (shortcut or badge) */
.context-menu-suffix {
  margin-left: auto;
  font-size: 12px;
  color: var(--accents-5);
}

/* Separator */
.context-menu-separator {
  height: 1px;
  background: var(--accents-2);
  margin: 4px 0;
}

/* Submenu indicator */
.context-menu-submenu-indicator {
  margin-left: auto;
}
```

### Implementation Notes

- Use for secondary actions that don't need to be always visible
- Provide keyboard shortcuts for common actions
- Group related actions with separators
- Disable items that aren't currently available rather than hiding them
- Keep menu items concise and action-oriented
- Position menu to stay within viewport bounds
- Support keyboard navigation (Arrow keys, Enter, Escape)
- Close on click outside or Escape key

---

## Drawer

**Description:** A slide-in panel component from the bottom of the screen, primarily designed for mobile and small viewport interactions.

### Purpose
Provide a slide-in panel for mobile interactions. Only use on small viewports - use Modal or Sheet for larger screens.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard drawer with default height |
| **Custom Height** | Drawer with specified height |

### States

| State | Description |
|-------|-------------|
| **Closed** | Drawer is hidden |
| **Open** | Drawer is visible |
| **Dragging** | User is dragging to resize/close |

### Props/API

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls drawer visibility |
| `onClose` | `() => void` | Callback when drawer closes |
| `height` | `string \| number` | Custom drawer height |
| `children` | `ReactNode` | Drawer content |
| `showHandle` | `boolean` | Show drag handle indicator |

### Key CSS Patterns

```css
/* Drawer backdrop */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.drawer-backdrop[data-open="true"] {
  opacity: 1;
}

/* Drawer container */
.drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--geist-background);
  border-top-left-radius: var(--geist-radius-lg);
  border-top-right-radius: var(--geist-radius-lg);
  box-shadow: var(--shadow-large);
  z-index: 9999;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  max-height: 90vh;
  overflow: hidden;
}

.drawer[data-open="true"] {
  transform: translateY(0);
}

/* Drag handle */
.drawer-handle {
  width: 36px;
  height: 4px;
  background: var(--accents-3);
  border-radius: 2px;
  margin: 12px auto;
}

/* Drawer content */
.drawer-content {
  padding: 0 16px 16px;
  overflow-y: auto;
  max-height: calc(90vh - 40px);
}

/* Custom height */
.drawer[data-height] {
  height: var(--drawer-height);
}
```

### Implementation Notes

- **Only use Drawer on small viewports** - use Modal or Sheet for larger screens
- Drawers slide up from the bottom of the screen
- Provide clear close affordances:
  - Close button
  - Backdrop click
  - Swipe down gesture
- Keep drawer content focused and concise
- Consider the mobile context when designing content
- Use drag handle for swipe-to-close interaction
- Trap focus within drawer when open
- Prevent body scroll when drawer is open

---

## Empty State

**Description:** A design framework for empty content areas, providing context and guidance when there's no data to display.

### Purpose
When designed thoughtfully, empty states become an essential part of a smooth user experience, providing enough context to keep users working productively.

### Types

| Type | Description |
|------|-------------|
| **Blank Slate** | Basic empty state for first-run experience |
| **Informational** | Alternative for first use, including CTAs and documentation links |
| **Educational** | Launch contextual onboarding flow for deeper understanding |
| **Guide** | Starter content for learning by tinkering or setting up environment |

### Components

| Component | Description |
|-----------|-------------|
| **Title** | Message conveying the state of the product |
| **Description** | Detailed explanation of actions and value |
| **Action** | Call-to-action button |
| **Link** | Link to documentation or more information |
| **Illustration** | Optional visual element |

### Props/API

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Main heading text |
| `description` | `string` | Explanatory text |
| `action` | `Action` | Primary call-to-action |
| `secondaryAction` | `Action` | Secondary action |
| `link` | `{ label: string, href: string }` | Documentation link |
| `illustration` | `ReactNode` | Visual element |
| `variant` | `'blank' \| 'informational' \| 'educational' \| 'guide'` | Empty state type |

### Variant Guidelines

#### Blank Slate
The most basic empty state - conveys the state of the view.
```jsx
<EmptyState
  title="No projects yet"
  description="A message conveying the state of the product."
/>
```

#### Informational
Help users by explaining benefit and utility with CTA and documentation link.
```jsx
<EmptyState
  title="No deployments"
  description="This should detail the actions you can take on this screen, as well as why it's valuable."
  action={{ label: "Create Deployment", onClick: handleCreate }}
  link={{ label: "Learn more", href: "/docs/deployments" }}
/>
```

#### Educational
Launch contextual onboarding for deeper understanding.
```jsx
<EmptyState
  title="Welcome to Analytics"
  description="Let's walk through how to set up your first dashboard."
  action={{ label: "Start Tutorial", onClick: startOnboarding }}
/>
```

#### Guide
Starter content for learning by interaction.
```jsx
<EmptyState
  title="Your workspace is ready"
  description="We've created some sample projects to help you get started."
  action={{ label: "Explore Samples", onClick: viewSamples }}
/>
```

### Key CSS Patterns

```css
/* Empty state container */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
}

/* Illustration */
.empty-state-illustration {
  margin-bottom: 24px;
  color: var(--accents-4);
}

/* Title */
.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--geist-foreground);
  margin-bottom: 8px;
}

/* Description */
.empty-state-description {
  font-size: 14px;
  color: var(--accents-5);
  line-height: 1.5;
  margin-bottom: 24px;
}

/* Actions container */
.empty-state-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

/* Documentation link */
.empty-state-link {
  font-size: 14px;
  color: var(--geist-link);
  text-decoration: none;
}

.empty-state-link:hover {
  text-decoration: underline;
}
```

### Implementation Notes

- **Blank Slate**: Most basic, simply conveys view state
- **Informational**: Explains benefit/utility with CTA and documentation
- **Educational**: Provides deeper understanding through onboarding
- **Guide**: Interactive starter content for learning
- Default to showing rather than telling feature value
- Include upgrade CTAs where appropriate for certain entry points
- Keep titles concise and descriptions actionable
- Use illustrations sparingly and purposefully
- Ensure empty states are accessible (proper heading hierarchy)

---

## Summary

This batch covers 8 essential Geist components:

| Component | Primary Use Case |
|-----------|-----------------|
| **Code Block** | Syntax-highlighted code display with annotations |
| **Collapse** | Expandable/collapsible content sections |
| **Combobox** | Searchable dropdown selection |
| **Command Menu** | Full-screen action launcher (⌘K) |
| **Context Card** | Contextual settings display (theme selector) |
| **Context Menu** | Right-click action menus |
| **Drawer** | Mobile slide-in panels |
| **Empty State** | Empty content area guidance |

---

## Accessibility Considerations

All components follow accessibility best practices:

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **ARIA Labels**: Proper labels and roles for screen readers
- **Focus Management**: Logical focus order and visible focus indicators
- **Color Contrast**: WCAG compliant contrast ratios
- **Reduced Motion**: Respect user preferences for reduced motion

---

## Related Resources

- [Geist Design System](https://vercel.com/geist)
- [Geist Components Reference - Part 1](./GEIST-COMPONENTS-REFERENCE.md)
- [Geist Components Reference - Part 2](./GEIST-COMPONENTS-REFERENCE-2.md)
- [Geist Components Reference - Part 3](./GEIST-COMPONENTS-REFERENCE-3.md)
- [Geist CSS Patterns](./GEIST-CSS-PATTERNS.md)

---

*Documentation extracted from [Vercel Geist Design System](https://vercel.com/geist)*
