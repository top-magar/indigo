# Geist Components Reference - Part 3

This document provides comprehensive documentation for additional Geist Design System components, completing the full component reference.

---

## Table of Contents

1. [Button](#button)
2. [Input](#input)
3. [Select](#select)
4. [Combobox](#combobox)
5. [Modal](#modal)
6. [Menu](#menu)
7. [Split Button](#split-button)
8. [Switch](#switch)
9. [Calendar](#calendar)
10. [Toast](#toast)
11. [Avatar](#avatar)
12. [Tooltip](#tooltip)
13. [Scroller](#scroller)
14. [Theme Switcher](#theme-switcher)
15. [Relative Time Card](#relative-time-card)
16. [Empty State](#empty-state)
17. [Grid](#grid)
18. [Stack](#stack)

---

## Button

**Description:** Primary interactive element for triggering actions.

### Sizes

| Size | Description |
|------|-------------|
| Small | Compact button for dense UIs |
| Medium | Default button size |
| Large | Prominent button for emphasis |

### Shapes

| Shape | Description |
|-------|-------------|
| Default | Standard rectangular button |
| Rounded | Fully rounded ends (pill shape) |
| Icon-only | Square button with only an icon (use `svgOnly` prop and `aria-label`) |

### Variants

| Variant | Description |
|---------|-------------|
| Primary | Main action button |
| Secondary | Secondary action button |
| With Prefix | Button with icon before text |
| With Suffix | Button with icon after text |
| Rounded + Shadow | Marketing style with `shape="rounded"` and `shadow` prop |

### States

| State | Description |
|-------|-------------|
| Default | Normal button appearance |
| Loading | Shows loading indicator |
| Disabled | Non-interactive state |
| Hover | Mouse hover state |
| Active | Pressed state |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | Button size |
| `shape` | `'default' \| 'rounded'` | Button shape |
| `svgOnly` | `boolean` | Icon-only button mode |
| `shadow` | `boolean` | Add shadow (marketing style) |
| `loading` | `boolean` | Show loading state |
| `disabled` | `boolean` | Disable button |
| `prefix` | `ReactNode` | Icon before text |
| `suffix` | `ReactNode` | Icon after text |

### ButtonLink

Use `ButtonLink` for links styled as buttons with the same props as Button.

### Usage Guidelines

- Use primary buttons for main actions
- Icon-only buttons must include `aria-label` for accessibility
- Use `shadow` prop with `rounded` shape for marketing pages
- Avoid multiple primary buttons in the same context

---

## Input

**Description:** Single-line text input field for user data entry.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard text input |
| Search | Auto-clears on Escape key press |
| With Label | Input with associated label |
| ⌘K | Shows keyboard shortcut indicator, transitions to `Esc` when dirty |

### States

| State | Description |
|-------|-------------|
| Default | Normal input appearance |
| Disabled | Non-interactive state |
| Error | Shows error message below input |
| Focus | Input has keyboard focus |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Input value |
| `placeholder` | `string` | Placeholder text |
| `disabled` | `boolean` | Disable input |
| `error` | `string` | Error message |
| `label` | `string` | Associated label |
| `prefix` | `ReactNode` | Content before input |
| `suffix` | `ReactNode` | Content after input |
| `type` | `'text' \| 'search' \| 'password' \| etc.` | Input type |

### Usage Guidelines

- Use search variant for search inputs (auto-clears on Escape)
- Always provide labels for accessibility
- Show clear error messages when validation fails
- Use prefix/suffix for icons or additional context

---

## Select

**Description:** Dropdown selection component for choosing from a list of options.

### Sizes

| Size | Description |
|------|-------------|
| Small | Compact select for dense UIs |
| Medium | Default select size |
| Large | Larger select for emphasis |

### States

| State | Description |
|-------|-------------|
| Default | Normal select appearance |
| Disabled | Non-interactive state |
| Error | Shows error message |
| Open | Dropdown is expanded |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Selected value |
| `options` | `Option[]` | List of options |
| `disabled` | `boolean` | Disable select |
| `error` | `string` | Error message |
| `label` | `string` | Associated label |
| `prefix` | `ReactNode` | Content before select |
| `suffix` | `ReactNode` | Content after select |
| `placeholder` | `string` | Placeholder text |

### Usage Guidelines

- Use for selecting from a predefined list of options
- Provide clear placeholder text
- Show error messages for validation failures
- Consider Combobox for searchable selections

---

## Combobox

**Description:** Searchable dropdown selection with autocomplete functionality.

### Variants

| Variant | Description |
|---------|-------------|
| Uncontrolled | Internal state management |
| Controlled | External state management |
| With Label | Combobox with associated label |
| Inside Modal | Common pattern - Modal renders as Dialog on mobile |

### Sizes

| Size | Description |
|------|-------------|
| Small | Compact combobox |
| Medium | Default size |
| Large | Larger combobox |

### States

| State | Description |
|-------|-------------|
| Default | Normal appearance |
| Disabled | Non-interactive state |
| Errored | Shows error state |
| Open | Dropdown is expanded |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Selected value |
| `options` | `Option[]` | List of options |
| `disabled` | `boolean` | Disable combobox |
| `error` | `boolean` | Show error state |
| `label` | `string` | Associated label |
| `inputWidth` | `string` | Custom input width |
| `listWidth` | `string` | Custom dropdown width |
| `emptyMessage` | `string` | Custom empty state message |
| `onChange` | `function` | Selection change callback |

### Usage Guidelines

- Use for large lists where search is helpful
- Common to use inside Modal (auto-renders as Dialog on mobile)
- Provide custom empty message for better UX
- Consider custom widths for specific layouts

---

## Modal

**Description:** Dialog overlay for focused interactions and important content.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard modal dialog |
| Sticky | Sticky header/footer for scrollable content |
| Single Button | Simplified with one action |
| Inset | Content with inset styling |

### Features

| Feature | Description |
|---------|-------------|
| Disabled Actions | Actions can be disabled |
| Control Initial Focus | Specify which element receives focus |
| Backdrop | Click outside to close |
| Escape Key | Press Escape to close |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Control modal visibility |
| `onClose` | `function` | Close callback |
| `title` | `string` | Modal title |
| `description` | `string` | Modal description |
| `actions` | `Action[]` | Action buttons |
| `sticky` | `boolean` | Sticky header/footer |
| `inset` | `boolean` | Inset content styling |
| `initialFocus` | `RefObject` | Element to focus on open |

### Usage Guidelines

- Use for important interactions requiring user attention
- Provide clear title and description
- Include cancel/close option
- Use sticky variant for long scrollable content
- Control initial focus for accessibility

---

## Menu

**Description:** Dropdown menu triggered by a button, supporting typeahead and keyboard navigation.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Menu extends Button component |
| With Chevron | Shows dropdown indicator |
| Custom Trigger | Custom trigger element (still wrapped by unstyled button) |

### Item Types

| Type | Description |
|------|-------------|
| Default | Standard menu item |
| Disabled | Non-interactive item |
| Link | Navigation link item |
| With Prefix | Item with icon before text |
| With Suffix | Item with badge/icon after text |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `trigger` | `ReactNode` | Custom trigger element |
| `items` | `MenuItem[]` | Menu items |
| `chevron` | `boolean` | Show chevron indicator |
| `position` | `string` | Menu position (auto-adapts to window bounds) |

### Usage Guidelines

- Menu extends Button component for consistent styling
- Position automatically adapts based on window bounds
- Supports typeahead for quick navigation
- Full keyboard navigation support
- Custom triggers are still wrapped by unstyled button

---

## Split Button

**Description:** Button with primary action and dropdown menu for additional actions.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Primary action + dropdown |
| Menu Alignment | Control dropdown alignment |
| Icon | Icon-only split button |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `primaryAction` | `Action` | Main button action |
| `menuItems` | `MenuItem[]` | Dropdown menu items |
| `menuAlignment` | `'left' \| 'right'` | Dropdown alignment |
| `icon` | `ReactNode` | Icon for icon-only variant |

### Usage Guidelines

- Primary action should be the first item in the dropdown menu
- Use for actions with multiple related options
- Keep menu items related to the primary action
- Consider icon variant for compact UIs

---

## Switch

**Description:** Segmented control for switching between mutually exclusive options.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard switch |
| Disabled | Non-interactive switch |
| Full Width | Expands to fill container |
| With Tooltip | Shows tooltip on hover |
| With Icon | Items with icons |

### Sizes

| Size | Description |
|------|-------------|
| Small | Compact switch |
| Medium | Default size |
| Large | Larger switch |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Selected value |
| `options` | `Option[]` | Switch options |
| `disabled` | `boolean` | Disable switch |
| `fullWidth` | `boolean` | Expand to fill container |
| `onChange` | `function` | Selection change callback |

### Usage Guidelines

- Ensure item width is wide enough to prevent jumping when active
- Use for switching between 2-4 options
- Consider full width for prominent controls
- Add tooltips for additional context

---

## Calendar

**Description:** Date picker component with various layout and preset options.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard calendar |
| Horizontal Layout | Content aligned horizontally in popover |
| With Presets | Common date ranges provided |
| Compact | Compact calendar display |
| Stacked | Stacked layout |
| With Default Value | Presets with default selection |

### Sizes

| Size | Description |
|------|-------------|
| Small | Compact calendar |
| Large | Default/larger calendar |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `Date \| DateRange` | Selected date(s) |
| `onChange` | `function` | Date change callback |
| `size` | `'small' \| 'large'` | Calendar size |
| `horizontalLayout` | `boolean` | Horizontal content alignment |
| `presets` | `Preset[]` | Common date range presets |
| `defaultValue` | `Date` | Default selected date |
| `minDate` | `Date` | Minimum selectable date |
| `maxDate` | `Date` | Maximum selectable date |

### Usage Guidelines

- Use `horizontalLayout` for horizontal content alignment in popover
- Provide presets for common date ranges
- Set min/max dates to constrain selection
- Consider compact variant for space-constrained UIs

---

## Toast

**Description:** Temporary notification messages displayed to users.

### Types

| Type | Color | Description |
|------|-------|-------------|
| Default | Gray | Standard notification |
| Success | Green | Positive/success message |
| Warning | Amber | Warning/caution message |
| Error | Red | Error/failure message |

### Variants

| Variant | Description |
|---------|-------------|
| Default | Simple text message |
| Multi-line | Multiple lines of text |
| With JSX | Custom JSX content |
| With Link | Includes clickable link |
| With Action | Includes action button |
| Undo | Includes undo action |
| Preserve | Persists until dismissed |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `message` | `string \| ReactNode` | Toast content |
| `type` | `'default' \| 'success' \| 'warning' \| 'error'` | Toast type |
| `action` | `Action` | Action button |
| `link` | `{ label: string, href: string }` | Link in toast |
| `preserve` | `boolean` | Persist until dismissed |
| `duration` | `number` | Auto-dismiss duration |

### Usage Guidelines

- Use appropriate type for message context
- Keep messages concise and actionable
- Include undo for destructive actions
- Use preserve for important messages requiring acknowledgment

---

## Avatar

**Description:** Visual representation of users, teams, or entities.

### Types

| Type | Description |
|------|-------------|
| User | User avatar with image or initials |
| Team | Team avatar |
| Git | Git-related avatar |
| Custom Icon | Avatar with custom icon |
| Placeholder | Placeholder when no image available |

### Group

Stacked avatars with overflow indicator (+N) for representing multiple users.

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `src` | `string` | Image source URL |
| `name` | `string` | Name for initials fallback |
| `size` | `number` | Avatar size |
| `type` | `'user' \| 'team' \| 'git'` | Avatar type |
| `icon` | `ReactNode` | Custom icon |
| `placeholder` | `boolean` | Show placeholder |

### Usage Guidelines

- Use appropriate type for context (user, team, git)
- Provide name for initials fallback when image unavailable
- Use Avatar.Group for multiple users with overflow indicator
- Consider placeholder for loading states

---

## Tooltip

**Description:** Contextual information displayed on hover or focus.

### Positions

| Position | Description |
|----------|-------------|
| Top | Above the trigger element |
| Bottom | Below the trigger element |
| Left | To the left of trigger |
| Right | To the right of trigger |

### Alignments

For each position, tooltips can be aligned:
- Left
- Center
- Right

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard tooltip with delay |
| No Delay | Immediate display |
| Custom Content | Rich content in tooltip |
| Custom Type | Custom styling |
| No Tip Indicator | Without triangular stem |
| Components | Tooltip with component content |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `content` | `string \| ReactNode` | Tooltip content |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | Tooltip position |
| `align` | `'left' \| 'center' \| 'right'` | Tooltip alignment |
| `delay` | `number` | Show delay (0 for no delay) |
| `noTip` | `boolean` | Hide triangular stem |

### Usage Guidelines

- Use for supplementary information
- Keep content concise
- Consider no delay for frequently accessed tooltips
- Use custom content for rich information

---

## Scroller

**Description:** Display an overflowing list of items with optional navigation buttons.

### Variants

| Variant | Description |
|---------|-------------|
| Vertical | Vertical scrolling list |
| Horizontal | Horizontal scrolling list |
| Free | Free-form scrolling |
| Vertical with Buttons | Vertical with navigation buttons |
| Horizontal with Buttons | Horizontal with navigation buttons |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `direction` | `'vertical' \| 'horizontal' \| 'free'` | Scroll direction |
| `showButtons` | `boolean` | Show navigation buttons |
| `children` | `ReactNode` | Scrollable content |

### Usage Guidelines

- Buttons automatically scroll to given direct child
- Use for overflowing content that needs navigation
- Consider horizontal for tab-like interfaces
- Buttons provide accessible navigation alternative

---

## Theme Switcher

**Description:** Component for switching between light and dark themes.

### Options

| Option | Description |
|--------|-------------|
| System | Follow system preference |
| Light | Force light theme |
| Dark | Force dark theme |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `'system' \| 'light' \| 'dark'` | Current theme |
| `onChange` | `function` | Theme change callback |

### Usage Guidelines

- Include system option to respect user preferences
- Persist selection across sessions
- Consider placement in settings or header

---

## Relative Time Card

**Description:** Popover showing a date in local time with relative formatting.

### Features

- Shows relative time (e.g., "2 hours ago")
- Popover displays exact date/time in local timezone
- Also shows UTC time for clarity

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `date` | `Date` | The date to display |
| `format` | `string` | Date format string |

### Usage Guidelines

- Use for timestamps that benefit from relative context
- Popover provides exact time for precision
- Shows both local and UTC for clarity

---

## Empty State

**Description:** Design framework for empty content areas.

### Types

| Type | Description |
|------|-------------|
| Blank Slate | Basic empty state for first-run experience |
| Informational | First-use with CTAs and documentation links |
| Educational | Launch contextual onboarding flow |
| Guide | Starter content for learning by tinkering |

### Components

| Component | Description |
|-----------|-------------|
| Title | Message conveying the state |
| Description | Detailed explanation of actions and value |
| Action | Call-to-action button |
| Link | Link to documentation |

### Usage Guidelines

- Blank Slate: Most basic, conveys view state
- Informational: Explains benefit/utility with CTA and documentation
- Educational: Deeper understanding through onboarding
- Guide: Interactive starter content
- Default to showing rather than telling feature value
- Include upgrade CTAs where appropriate

---

## Grid

**Description:** Layout system for creating grid-based designs.

### Variants

| Variant | Description |
|---------|-------------|
| Basic | Non-responsive grid with auto-flowing cells |
| Solid Cells | Cells occlude underlying guides |
| Responsive | Adapts rows/columns at breakpoints |
| Guide Clipping | Cells clip grid guides |
| Hidden Row Guides | Grid without row guides |
| Hidden Column Guides | Grid without column guides |
| Overlaying Cells | Cells overlay other cells |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `rows` | `number \| ResponsiveValue` | Number of rows |
| `columns` | `number \| ResponsiveValue` | Number of columns |
| `solid` | `boolean` | Cells occlude guides |
| `hideRowGuides` | `boolean` | Hide row guides |
| `hideColumnGuides` | `boolean` | Hide column guides |

### Usage Guidelines

- Core part of Vercel aesthetic
- Use responsive props for all 3 breakpoints
- Solid cells occlude underlying guides
- Guide clipping creates visual effects
- Overlaying cells for complex layouts

---

## Stack

**Description:** Layout component for vertical or horizontal element arrangement.

### Directions

| Direction | Description |
|-----------|-------------|
| Vertical | Stack elements vertically |
| Horizontal | Stack elements horizontally |

### Gap Scale

Gap uses a 4px grid scale for consistent spacing.

### Padding Scale

Padding uses the same 4px grid scale as gap.

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `direction` | `'vertical' \| 'horizontal'` | Stack direction |
| `gap` | `number` | Gap between items (4px units) |
| `padding` | `number` | Padding around stack (4px units) |
| `align` | `string` | Alignment of items |
| `justify` | `string` | Justification of items |

### Usage Guidelines

- Use for consistent spacing between elements
- Gap and padding on 4px grid scale
- Prefer Stack over manual margin/padding
- Combine with Grid for complex layouts

---

## Complete Component Index

### Form Components
- Button, ButtonLink
- Input
- Select
- Combobox
- Multi-Select
- Checkbox
- Radio
- Toggle
- Choicebox
- Textarea
- Switch
- Calendar

### Feedback Components
- Toast
- Modal
- Drawer
- Spinner
- Loading Dots
- Progress
- Skeleton
- Error
- Note
- Project Banner

### Navigation Components
- Menu
- Split Button
- Tabs
- Scroller
- Pagination
- Context Menu
- Breadcrumb

### Data Display
- Table
- Badge
- Pill
- Avatar
- Tooltip
- Collapse
- Code Block
- Snippet
- File Tree
- Gauge
- Status Dot
- Capacity
- Entity
- Description
- Relative Time Card

### Layout Components
- Grid
- Stack
- Container

### Utility Components
- Theme Switcher
- Keyboard Input
- Show More
- Empty State
- Feedback
- Window
- Materials

---

## Accessibility Guidelines

All Geist components follow accessibility best practices:

- **ARIA Labels**: Proper labels and roles
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical focus order
- **Color Contrast**: WCAG compliant contrast ratios
- **Screen Readers**: Compatible with assistive technology
- **Reduced Motion**: Respects user preferences

---

## Related Resources

- [Geist Design System](https://vercel.com/geist)
- [Geist Components Reference - Part 1](./GEIST-COMPONENTS-REFERENCE.md)
- [Geist Components Reference - Part 2](./GEIST-COMPONENTS-REFERENCE-2.md)
- [Vercel Geist Design System Overview](./VERCEL-GEIST-DESIGN-SYSTEM.md)

