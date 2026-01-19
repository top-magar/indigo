# Geist Components Reference - Part 2

This document provides detailed documentation for additional Geist Design System components, covering their variants, sizes, states, props, and usage guidelines.

---

## Table of Contents

1. [Error](#error)
2. [Loading Dots](#loading-dots)
3. [Status Dot](#status-dot)
4. [Capacity](#capacity)
5. [Keyboard Input](#keyboard-input)
6. [Snippet](#snippet)
7. [File Tree](#file-tree)
8. [Description](#description)
9. [Entity](#entity)
10. [Project Banner](#project-banner)
11. [Feedback](#feedback)
12. [Window](#window)
13. [Show More](#show-more)
14. [Text](#text)
15. [Link](#link)

---

## Error

**Description:** Good error design is clear, useful, and friendly. Designing concise and accurate error messages unblocks users and builds trust by meeting people where they are.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard error message with default "Error:" label |
| Custom Label | Error with a custom label (e.g., "Email Error:") |
| No Label | Error message displayed without any label prefix |
| With Error Property | Error with actionable link (e.g., "Contact Us") |

### Sizes

| Size | Use Case |
|------|----------|
| Small | Compact error messages for inline validation |
| Medium | Standard error messages (default) |
| Large | Prominent error messages for important alerts |

### States

| State | Description |
|-------|-------------|
| Default | Standard error display |
| With Action | Error with clickable action link |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Custom label prefix for the error |
| `message` | `string` | The error message content |
| `size` | `'small' \| 'medium' \| 'large'` | Size variant |
| `action` | `{ label: string, href: string }` | Optional action link |
| `showLabel` | `boolean` | Whether to show the label prefix |

### Usage Guidelines

- Keep error messages concise and actionable
- Use custom labels to provide context (e.g., "Email Error:", "Password Error:")
- Include action links when users can take immediate steps to resolve the issue
- Use appropriate size based on context and importance

---

## Loading Dots

**Description:** Indicate an action running in the background. A simple, animated loading indicator.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Three animated dots without text |
| With Text | Loading dots accompanied by text label (e.g., "Loading") |

### Sizes

| Size | Use Case |
|------|----------|
| Small | Inline loading indicators, buttons |
| Medium | Standard loading states (default) |
| Large | Full-page or prominent loading states |

### States

| State | Description |
|-------|-------------|
| Animating | Default animated state |
| Static | Non-animated (for reduced motion preferences) |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | Size of the loading dots |
| `text` | `string` | Optional text to display alongside dots |
| `color` | `string` | Color of the dots |

### Usage Guidelines

- Use for short, indeterminate loading states
- Pair with text for clarity when the loading context isn't obvious
- Consider using skeleton loaders for longer loading states
- Respect user's reduced motion preferences

---

## Status Dot

**Description:** Display an indicator of deployment status. A visual indicator for various states.

### Variants

| Variant | Color | Description |
|---------|-------|-------------|
| Queued | Gray | Waiting to be processed |
| Building | Yellow/Amber | Currently in progress |
| Error | Red | Failed or error state |
| Ready | Green | Successfully completed |
| Canceled | Gray | Operation was canceled |

### Sizes

| Size | Use Case |
|------|----------|
| Small | Inline status indicators |
| Medium | Standard status display (default) |
| Large | Prominent status indicators |

### States

| State | Description |
|-------|-------------|
| Default | Static status indicator |
| With Label | Status dot with text label |
| Pulsing | Animated pulse for active states (Building) |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `status` | `'queued' \| 'building' \| 'error' \| 'ready' \| 'canceled'` | Status type |
| `size` | `'small' \| 'medium' \| 'large'` | Size variant |
| `label` | `string` | Optional text label |
| `pulse` | `boolean` | Enable pulse animation |

### Usage Guidelines

- Use consistent status colors across the application
- Always provide accessible text alternatives
- Use pulse animation sparingly for active/in-progress states
- Consider colorblind users - don't rely solely on color

---

## Capacity

**Description:** Visual indicator for capacity, usage, or progress levels. Displays resource utilization.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard capacity bar |
| Segmented | Divided into discrete segments |
| Circular | Circular/radial capacity indicator |

### Sizes

| Size | Use Case |
|------|----------|
| Small | Compact inline indicators |
| Medium | Standard capacity display (default) |
| Large | Prominent capacity visualization |

### States

| State | Color | Description |
|-------|-------|-------------|
| Low | Green | Under 50% capacity |
| Medium | Yellow | 50-75% capacity |
| High | Orange | 75-90% capacity |
| Critical | Red | Over 90% capacity |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Current capacity value (0-100) |
| `max` | `number` | Maximum capacity value |
| `size` | `'small' \| 'medium' \| 'large'` | Size variant |
| `variant` | `'default' \| 'segmented' \| 'circular'` | Visual variant |
| `showLabel` | `boolean` | Display percentage label |
| `thresholds` | `object` | Custom color thresholds |

### Usage Guidelines

- Use appropriate thresholds for your use case
- Provide clear labels for what the capacity represents
- Consider using segmented variant for discrete limits
- Include accessible descriptions for screen readers

---

## Keyboard Input

**Description:** Display keyboard input that triggers an action. Shows keyboard shortcuts and key combinations.

### Variants

| Variant | Description |
|---------|-------------|
| Modifiers | Display modifier keys (⇧ Shift, ⌥ Option, ⌃ Control, ⌘ Command) |
| Combination | Key combinations (e.g., ⌘ + K) |
| Single Key | Individual key display |

### Sizes

| Size | Use Case |
|------|----------|
| Small | Inline keyboard hints |
| Medium | Standard keyboard display (default) |

### Modifier Keys

| Symbol | Key | Platform |
|--------|-----|----------|
| ⌘ | Command | macOS |
| ⌃ | Control | All |
| ⌥ | Option/Alt | macOS/Windows |
| ⇧ | Shift | All |
| ⏎ | Enter/Return | All |
| ⌫ | Backspace | All |
| ⎋ | Escape | All |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `keys` | `string[]` | Array of keys to display |
| `size` | `'small' \| 'medium'` | Size variant |
| `separator` | `string` | Separator between keys (default: +) |

### Usage Guidelines

- Use platform-appropriate symbols (⌘ for Mac, Ctrl for Windows)
- Keep combinations simple and memorable
- Display shortcuts near their associated actions
- Consider providing both Mac and Windows shortcuts

---

## Snippet

**Description:** Display code snippets with copy functionality. Ideal for terminal commands and code examples.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard snippet with prompt symbol |
| Inverted | Dark background variant |
| Multi-line | Multiple lines of code |
| No Prompt | Without the $ prompt symbol |
| With Callback | Custom callback on copy |

### Visual Variants

| Variant | Background | Use Case |
|---------|------------|----------|
| Default | Light | Standard documentation |
| Inverted | Dark | Terminal-style display |
| Highlighted | Accent | Emphasis on important commands |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `text` | `string \| string[]` | Code content (string or array for multi-line) |
| `prompt` | `boolean` | Show prompt symbol (default: true) |
| `dark` | `boolean` | Use dark/inverted theme |
| `width` | `string` | Custom width |
| `onCopy` | `() => void` | Callback when copied |
| `copyable` | `boolean` | Enable copy button |

### Usage Guidelines

- Use for terminal commands and code examples
- Enable copy functionality for user convenience
- Use multi-line for related commands
- Consider dark variant for terminal-style content

---

## File Tree

**Description:** Display hierarchical file and folder structures. Useful for documentation and project navigation.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard file tree display |
| Selectable | Items can be selected |
| With Icons | File type icons displayed |

### States

| State | Description |
|-------|-------------|
| Expanded | Folder is open showing contents |
| Collapsed | Folder is closed |
| Selected | Item is currently selected |
| Highlighted | Item is highlighted/focused |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `data` | `TreeNode[]` | Hierarchical data structure |
| `defaultExpanded` | `string[]` | Initially expanded folders |
| `onSelect` | `(node: TreeNode) => void` | Selection callback |
| `showIcons` | `boolean` | Display file type icons |
| `selectable` | `boolean` | Enable selection |

### TreeNode Structure

```typescript
interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  icon?: ReactNode;
}
```

### Usage Guidelines

- Use for displaying project structures
- Keep nesting levels reasonable (max 4-5 levels)
- Use appropriate file type icons
- Consider lazy loading for large trees

---

## Description

**Description:** Displays a brief heading and subheading to communicate any additional information or context a user needs to continue.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Title with description text |
| Compact | Reduced spacing variant |
| With Icon | Description with leading icon |

### Sizes

| Size | Use Case |
|------|----------|
| Small | Compact descriptions |
| Medium | Standard descriptions (default) |
| Large | Prominent section descriptions |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Section title/heading |
| `content` | `string \| ReactNode` | Description content |
| `size` | `'small' \| 'medium' \| 'large'` | Size variant |
| `icon` | `ReactNode` | Optional leading icon |

### Usage Guidelines

- Use to introduce sections or provide context
- Keep titles concise and descriptive
- Use description text to elaborate on the title
- Maintain consistent sizing within a page

---

## Entity

**Description:** Display entity information with avatar, name, and metadata. Ideal for user profiles, devices, and connected services.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Avatar with name and description |
| With Skeleton | Loading state with skeleton |
| With List | Multiple entities in a list |
| With Checkbox | Selectable entity items |

### Components

| Component | Description |
|-----------|-------------|
| Avatar | User/entity image or initials |
| Name | Primary identifier |
| Description | Secondary information (username, status) |
| Metadata | Additional info (last used, connected time) |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Entity name |
| `description` | `string` | Secondary description |
| `avatar` | `string \| ReactNode` | Avatar image or component |
| `metadata` | `string` | Additional metadata text |
| `selectable` | `boolean` | Enable checkbox selection |
| `selected` | `boolean` | Selection state |
| `onSelect` | `() => void` | Selection callback |

### Usage Guidelines

- Use for displaying user profiles, devices, or services
- Include relevant metadata (last active, connection status)
- Use skeleton loading for async data
- Group related entities in lists

---

## Project Banner

**Description:** Display project-level status banners for important notifications and alerts.

### Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| Success | Green | Positive temporary mitigations (e.g., Attack Challenge Mode) |
| Warning | Yellow | Exceptional state requiring non-immediate action (e.g., during rollback) |
| Error | Red | Critical downtime requiring immediate attention (e.g., payment overdue) |

### States

| State | Description |
|-------|-------------|
| Default | Standard banner display |
| Dismissible | Can be dismissed by user |
| Persistent | Cannot be dismissed |
| With Action | Includes action button |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'success' \| 'warning' \| 'error'` | Banner type |
| `message` | `string` | Banner message content |
| `dismissible` | `boolean` | Allow dismissal |
| `onDismiss` | `() => void` | Dismiss callback |
| `action` | `{ label: string, onClick: () => void }` | Optional action |

### Usage Guidelines

- Use sparingly for important project-level notifications
- Success: Temporary protective measures in place
- Warning: Issues requiring attention but not urgent
- Error: Critical issues requiring immediate action
- Always provide clear, actionable information

---

## Feedback

**Description:** Collect user feedback with various input methods. Desktop-optimized component.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Simple "Was this helpful?" prompt |
| Inline | Compact inline feedback |
| With Select | Feedback with topic selection dropdown |
| With Metadata | Feedback with arbitrary key-value metadata |

### States

| State | Description |
|-------|-------------|
| Default | Initial prompt state |
| Submitted | After feedback is submitted |
| With Comment | Expanded to include text input |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(feedback: FeedbackData) => void` | Submit callback |
| `topics` | `string[]` | Pre-defined topic options |
| `metadata` | `Record<string, string>` | Additional metadata |
| `inline` | `boolean` | Use inline variant |
| `prompt` | `string` | Custom prompt text |

### Usage Guidelines

- Use at the end of documentation or help content
- Keep the initial interaction simple (thumbs up/down)
- Allow optional detailed feedback
- Desktop-only component - consider alternatives for mobile

---

## Window

**Description:** Container component that mimics a desktop window with title bar and controls.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard window with title bar |
| Browser | Browser-style window with URL bar |
| Terminal | Terminal/console style window |
| Code | Code editor style window |

### Components

| Component | Description |
|-----------|-------------|
| Title Bar | Window header with controls |
| Traffic Lights | macOS-style window controls |
| Content Area | Main window content |
| Tab Bar | Optional tab navigation |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Window title |
| `variant` | `'default' \| 'browser' \| 'terminal' \| 'code'` | Window style |
| `showControls` | `boolean` | Show window controls |
| `tabs` | `Tab[]` | Optional tabs |
| `url` | `string` | URL for browser variant |
| `children` | `ReactNode` | Window content |

### Usage Guidelines

- Use for showcasing UI examples or demos
- Browser variant for web page previews
- Terminal variant for command-line examples
- Maintain consistent styling within documentation

---

## Show More

**Description:** Styling component to show expanded or collapsed content. Toggle visibility of additional content.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard show more/less toggle |
| Inline | Inline text expansion |
| With Count | Shows count of hidden items |

### States

| State | Description |
|-------|-------------|
| Collapsed | Content is hidden, shows "Show more" |
| Expanded | Content is visible, shows "Show less" |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `expanded` | `boolean` | Controlled expansion state |
| `defaultExpanded` | `boolean` | Initial expansion state |
| `onToggle` | `(expanded: boolean) => void` | Toggle callback |
| `moreLabel` | `string` | Custom "show more" text |
| `lessLabel` | `string` | Custom "show less" text |
| `count` | `number` | Number of hidden items |
| `children` | `ReactNode` | Collapsible content |

### Usage Guidelines

- Use for long content that can be progressively disclosed
- Provide clear labels for the toggle action
- Consider showing a preview of hidden content
- Animate the expansion/collapse transition

---

## Text

**Description:** Comprehensive typography system with semantic text styles for headings, labels, buttons, and copy.

### Headings

| Style | Class | Use Case |
|-------|-------|----------|
| Heading 72 | `text-heading-72` | Marketing heroes |
| Heading 64 | `text-heading-64` | Large marketing headings |
| Heading 56 | `text-heading-56` | Section headings |
| Heading 48 | `text-heading-48` | Page titles |
| Heading 40 | `text-heading-40` | Major sections |
| Heading 32 | `text-heading-32` | Marketing subheadings, dashboard headings |
| Heading 24 | `text-heading-24` | Card titles |
| Heading 20 | `text-heading-20` | Subsection titles |
| Heading 16 | `text-heading-16` | Small headings |
| Heading 14 | `text-heading-14` | Micro headings |

### Buttons

| Style | Class | Use Case |
|-------|-------|----------|
| Button 16 | `text-button-16` | Largest button text |
| Button 14 | `text-button-14` | Default button text |
| Button 12 | `text-button-12` | Tiny buttons inside input fields |

### Labels

| Style | Class | Use Case |
|-------|-------|----------|
| Label 20 | `text-label-20` | Marketing text |
| Label 18 | `text-label-18` | Large labels |
| Label 16 | `text-label-16` | Titles, differentiation from regular text |
| Label 14 | `text-label-14` | Most common - menus, navigation |
| Label 14 Mono | `text-label-14-mono` | Largest mono, pairs with larger text |
| Label 13 | `text-label-13` | Secondary lines, tabular numbers |
| Label 13 Mono | `text-label-13-mono` | Pairs with Label 14 |
| Label 12 | `text-label-12` | Tertiary text, comments, calendars |
| Label 12 Mono | `text-label-12-mono` | Small monospace |

### Copy

| Style | Class | Use Case |
|-------|-------|----------|
| Copy 24 | `text-copy-24` | Hero areas on marketing pages |
| Copy 20 | `text-copy-20` | Marketing hero text |
| Copy 18 | `text-copy-18` | Marketing, big quotes |
| Copy 16 | `text-copy-16` | Modals, larger views |
| Copy 14 | `text-copy-14` | Most commonly used text style |
| Copy 13 | `text-copy-13` | Secondary text, space-constrained views |
| Copy 13 Mono | `text-copy-13-mono` | Inline code mentions |

### Text Modifiers

| Modifier | Description |
|----------|-------------|
| Strong | Bold weight variant |
| Subtle | Muted/secondary color |
| Tabular | Fixed-width numbers for alignment |
| CAPS | Uppercase transformation |

### Usage Guidelines

- Use semantic text styles consistently
- Headings for page/section structure
- Labels for UI elements and navigation
- Copy for body text and descriptions
- Use mono variants for code and numbers
- Apply modifiers (Strong, Subtle) for emphasis

---

## Link

**Description:** Interactive text links for navigation and actions.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard text link |
| Subtle | Muted link style |
| External | Link with external icon |
| Button | Link styled as button |

### States

| State | Description |
|-------|-------------|
| Default | Normal link appearance |
| Hover | Underline or color change on hover |
| Active | Pressed state |
| Visited | Previously visited link |
| Disabled | Non-interactive state |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | Link destination |
| `external` | `boolean` | Opens in new tab, shows icon |
| `variant` | `'default' \| 'subtle' \| 'button'` | Visual variant |
| `disabled` | `boolean` | Disable interaction |
| `underline` | `'always' \| 'hover' \| 'none'` | Underline behavior |
| `icon` | `ReactNode` | Custom icon |
| `onClick` | `() => void` | Click handler |

### Usage Guidelines

- Use descriptive link text (avoid "click here")
- Indicate external links with icon or text
- Maintain consistent link styling
- Ensure sufficient color contrast
- Use appropriate cursor styles

---

## Implementation Notes

### Accessibility

All Geist components follow accessibility best practices:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader compatibility

### Theming

Components support Geist's theming system:

- Light and dark mode variants
- CSS custom properties for customization
- Consistent color tokens
- Responsive design patterns

### Performance

- Components are optimized for performance
- Lazy loading where appropriate
- Minimal bundle size
- Tree-shakeable exports

---

## Related Resources

- [Geist Design System](https://vercel.com/geist)
- [Geist Components Reference - Part 1](./GEIST-COMPONENTS-REFERENCE.md)
- [Vercel Design Guidelines](https://vercel.com/design)
