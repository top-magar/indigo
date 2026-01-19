# Geist Design System Components - Batch 1 Analysis

> Comprehensive documentation of Vercel's Geist Design System components.
> Source: [Vercel Geist Design System](https://vercel.com/geist)

---

## Table of Contents

1. [Avatar](#1-avatar)
2. [Badge](#2-badge)
3. [Book](#3-book)
4. [Browser](#4-browser)
5. [Button](#5-button)
6. [Calendar](#6-calendar)
7. [Checkbox](#7-checkbox)
8. [Choicebox](#8-choicebox)

---

## 1. Avatar

### Purpose
Avatars represent a user or a team. Stacked avatars represent a group of people.

### Variants & States

| Variant | Description |
|---------|-------------|
| **Default** | Standard avatar with user image |
| **Group** | Stacked avatars showing multiple users with overflow indicator (e.g., "+2") |
| **Git** | Avatar with Git-specific styling |
| **Custom Icon** | Avatar with custom icon instead of image |
| **Placeholder** | Fallback avatar when no image is available |

### Props/API

```typescript
interface AvatarProps {
  src?: string;           // Image source URL
  alt?: string;           // Alt text for accessibility
  size?: 'sm' | 'md' | 'lg';  // Avatar size
  fallback?: ReactNode;   // Fallback content when image fails
  icon?: ReactNode;       // Custom icon to display
}

interface AvatarGroupProps {
  max?: number;           // Maximum avatars to show before "+N"
  children: ReactNode;    // Avatar components
}
```

### Key CSS Patterns

```css
/* Avatar base */
.avatar {
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Avatar group stacking */
.avatar-group {
  display: flex;
  flex-direction: row-reverse;
}

.avatar-group .avatar {
  margin-left: -8px;
  border: 2px solid var(--geist-background);
}

/* Placeholder styling */
.avatar-placeholder {
  background: var(--accents-2);
  color: var(--accents-5);
}
```

### Implementation Notes
- Use `AvatarGroup` for displaying multiple users with automatic overflow handling
- Placeholder state should show initials or a generic user icon
- Consider lazy loading for avatar images in lists
- Ensure proper alt text for accessibility

---

## 2. Badge

### Purpose
Badges are used to highlight status, categories, or labels. They provide visual distinction for different states and types.

### Variants

| Variant | Subtle Variant | Use Case |
|---------|----------------|----------|
| `gray` | `gray-subtle` | Default, neutral status |
| `blue` | `blue-subtle` | Information, links |
| `purple` | `purple-subtle` | Special features, premium |
| `amber` | `amber-subtle` | Warnings, pending |
| `red` | `red-subtle` | Errors, destructive |
| `pink` | `pink-subtle` | Highlights, promotions |
| `green` | `green-subtle` | Success, active |
| `teal` | `teal-subtle` | Secondary info |
| `inverted` | - | High contrast |

### Sizes

| Size | Use Case |
|------|----------|
| `small` | Inline text, compact UI |
| `medium` | Default, general use |
| `large` | Prominent labels, headers |

### Props/API

```typescript
interface BadgeProps {
  variant?: 'gray' | 'gray-subtle' | 'blue' | 'blue-subtle' | 
            'purple' | 'purple-subtle' | 'amber' | 'amber-subtle' |
            'red' | 'red-subtle' | 'pink' | 'pink-subtle' |
            'green' | 'green-subtle' | 'teal' | 'teal-subtle' | 'inverted';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;       // Leading icon
  iconRight?: ReactNode;  // Trailing icon
  children: ReactNode;
}

// Pill variant - link-style badge
interface PillProps extends BadgeProps {
  href?: string;
}
```

### Key CSS Patterns

```css
/* Badge base */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--geist-radius);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

/* Size variants */
.badge-small { padding: 1px 6px; font-size: 11px; }
.badge-medium { padding: 2px 8px; font-size: 12px; }
.badge-large { padding: 4px 12px; font-size: 14px; }

/* Color variants */
.badge-gray { background: var(--accents-2); color: var(--accents-6); }
.badge-gray-subtle { background: var(--accents-1); color: var(--accents-5); }
.badge-blue { background: var(--geist-cyan); color: white; }
.badge-green { background: var(--geist-success); color: white; }
.badge-red { background: var(--geist-error); color: white; }
.badge-amber { background: var(--geist-warning); color: black; }

/* Pill variant */
.badge-pill {
  border-radius: 9999px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.badge-pill:hover { opacity: 0.8; }
```

### Implementation Notes
- Badges with icons support both leading and trailing icon positions
- Pill variant is used for interactive link-style badges
- Subtle variants have lower contrast for less prominent display
- Use semantic colors: green for success, red for errors, amber for warnings

---

## 3. Book

### Purpose
The Book component displays content in a book/card format, commonly used for showcasing articles, documentation, or featured content.

### Variants

| Variant | Description |
|---------|-------------|
| **Default** | Standard book card |
| **Custom Color** | Book with custom background color |
| **Custom Illustration** | Book with custom artwork/illustration |
| **Responsive** | Adapts to container width |
| **Textured** | Book with textured background effect |

### Props/API

```typescript
interface BookProps {
  title: string;
  description?: string;
  illustration?: ReactNode;
  color?: string;           // Custom background color
  textured?: boolean;       // Enable textured background
  width?: 'auto' | 'full' | number;
  responsive?: boolean;
  href?: string;            // Link destination
}
```

### Width Options

| Width | Description |
|-------|-------------|
| `auto` | Content-based width |
| `full` | Full container width |
| Custom number | Fixed pixel width |

### Key CSS Patterns

```css
/* Book base */
.book {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: var(--geist-background);
  border: 1px solid var(--accents-2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.book:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Textured variant */
.book-textured {
  background-image: url('/textures/paper.png');
  background-size: cover;
}

/* Responsive behavior */
.book-responsive {
  width: 100%;
  max-width: 400px;
}

@media (max-width: 768px) {
  .book-responsive {
    max-width: 100%;
  }
}
```

### Implementation Notes
- Use for article previews, documentation cards, or featured content
- Custom illustrations should maintain aspect ratio
- Textured variant adds visual depth for premium feel
- Consider lazy loading for illustrations

---

## 4. Browser

### Purpose
The Browser component lets you showcase website screenshots or any other content within a realistic browser-style frame.

### Composition Elements

| Element | Description |
|---------|-------------|
| **Frame** | Browser window chrome with controls |
| **Address Bar** | URL display area |
| **Content Area** | Main content/screenshot area |
| **Window Controls** | Close, minimize, maximize buttons |

### Props/API

```typescript
interface BrowserProps {
  url?: string;             // URL to display in address bar
  children: ReactNode;      // Content to display
  showControls?: boolean;   // Show window control buttons
  className?: string;
}

interface BrowserFrameProps {
  variant?: 'light' | 'dark';
  shadow?: boolean;
}
```

### Key CSS Patterns

```css
/* Browser frame */
.browser {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--accents-2);
  background: var(--geist-background);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

/* Browser header/chrome */
.browser-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--accents-1);
  border-bottom: 1px solid var(--accents-2);
  gap: 8px;
}

/* Window controls */
.browser-controls {
  display: flex;
  gap: 6px;
}

.browser-control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.browser-control-close { background: #ff5f57; }
.browser-control-minimize { background: #febc2e; }
.browser-control-maximize { background: #28c840; }

/* Address bar */
.browser-address {
  flex: 1;
  padding: 6px 12px;
  background: var(--accents-1);
  border-radius: 4px;
  font-size: 13px;
  color: var(--accents-5);
}

/* Content area */
.browser-content {
  min-height: 200px;
}
```

### Implementation Notes
- Ideal for documentation, showcasing websites, or demo content
- Content area can contain images, iframes, or custom components
- Consider responsive behavior for mobile displays
- Use composition pattern for flexible content

---

## 5. Button

### Purpose
Buttons trigger actions or navigation. Geist provides multiple variants for different contexts and importance levels.

### Sizes

| Size | Use Case |
|------|----------|
| `small` | Compact UI, inline actions |
| `medium` | Default, general use |
| `large` | Primary CTAs, prominent actions |

### Types/Variants

| Type | Description |
|------|-------------|
| `primary` | Main actions, high emphasis |
| `secondary` | Secondary actions |
| `tertiary` | Low emphasis actions |
| `error` | Destructive actions |
| `warning` | Cautionary actions |

### Shapes

| Shape | Description |
|-------|-------------|
| `default` | Standard rounded corners |
| `rounded` | Pill-shaped button |
| `square` | Icon-only buttons |

### Props/API

```typescript
interface ButtonProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning';
  shape?: 'default' | 'rounded' | 'square';
  prefix?: ReactNode;       // Leading icon/element
  suffix?: ReactNode;       // Trailing icon/element
  svgOnly?: boolean;        // Icon-only button
  loading?: boolean;        // Show loading state
  disabled?: boolean;
  shadow?: boolean;         // Add shadow effect
  'aria-label'?: string;    // Required for icon-only buttons
  onClick?: () => void;
  children?: ReactNode;
}

// Link variant
interface ButtonLinkProps extends ButtonProps {
  href: string;
  external?: boolean;
}
```

### States

| State | Description |
|-------|-------------|
| Default | Normal interactive state |
| Hover | Mouse over state |
| Active | Pressed state |
| Loading | Shows spinner, disables interaction |
| Disabled | Non-interactive state |

### Key CSS Patterns

```css
/* Button base */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--geist-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

/* Sizes */
.button-small { height: 32px; padding: 0 12px; font-size: 13px; }
.button-medium { height: 40px; padding: 0 16px; font-size: 14px; }
.button-large { height: 48px; padding: 0 24px; font-size: 16px; }

/* Types */
.button-primary {
  background: var(--geist-foreground);
  color: var(--geist-background);
}
.button-secondary {
  background: var(--geist-background);
  color: var(--geist-foreground);
  border: 1px solid var(--accents-2);
}
.button-tertiary {
  background: transparent;
  color: var(--accents-5);
}
.button-error {
  background: var(--geist-error);
  color: white;
}

/* Shapes */
.button-rounded { border-radius: 9999px; }
.button-square { 
  padding: 0;
  aspect-ratio: 1;
}

/* States */
.button:hover { opacity: 0.9; }
.button:active { transform: scale(0.98); }
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading state */
.button-loading {
  position: relative;
  color: transparent;
}
.button-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Shadow variant (marketing) */
.button-shadow {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}
```

### Implementation Notes
- Icon-only buttons MUST include `svgOnly` prop and `aria-label`
- Use `ButtonLink` component for navigation (renders as `<a>`)
- Rounded + shadow combination is common for marketing pages
- Loading state should disable the button and show spinner
- Prefix/suffix icons should be sized appropriately for button size

---

## 6. Calendar

### Purpose
Calendar component for date selection with various layouts and preset options.

### Layouts

| Layout | Description |
|--------|-------------|
| **Default** | Vertical calendar layout |
| **Horizontal** | Side-by-side calendar and controls |
| **Compact** | Minimal space usage |
| **Stacked** | Multiple months stacked |

### Sizes

| Size | Description |
|------|-------------|
| `small` | Compact calendar |
| `large` | Default, full-size calendar |

### Features

| Feature | Description |
|---------|-------------|
| **Presets** | Common date ranges (Today, Last 7 days, etc.) |
| **Min/Max Dates** | Restrict selectable date range |
| **Default Value** | Pre-selected date/range |

### Props/API

```typescript
interface CalendarProps {
  value?: Date | DateRange;
  onChange?: (date: Date | DateRange) => void;
  size?: 'small' | 'large';
  horizontalLayout?: boolean;
  compact?: boolean;
  presets?: CalendarPreset[];
  defaultValue?: Date | DateRange;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

interface CalendarPreset {
  label: string;
  value: DateRange;
}

interface DateRange {
  from: Date;
  to: Date;
}
```

### Key CSS Patterns

```css
/* Calendar container */
.calendar {
  background: var(--geist-background);
  border: 1px solid var(--accents-2);
  border-radius: 12px;
  padding: 16px;
}

/* Horizontal layout */
.calendar-horizontal {
  display: flex;
  gap: 16px;
}

/* Calendar grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

/* Day cell */
.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s ease;
}

.calendar-day:hover {
  background: var(--accents-2);
}

.calendar-day-selected {
  background: var(--geist-foreground);
  color: var(--geist-background);
}

.calendar-day-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Range selection */
.calendar-day-in-range {
  background: var(--accents-2);
  border-radius: 0;
}

/* Presets */
.calendar-presets {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 16px;
  border-right: 1px solid var(--accents-2);
}

.calendar-preset {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.calendar-preset:hover {
  background: var(--accents-2);
}

/* Size variants */
.calendar-small .calendar-day { font-size: 12px; }
.calendar-small { padding: 12px; }
```

### Implementation Notes
- Use `horizontalLayout` for wider containers
- Presets improve UX for common date range selections
- Min/max dates should visually disable out-of-range dates
- Consider keyboard navigation for accessibility
- Compact mode is useful for inline date pickers

---

## 7. Checkbox

### Purpose
A control that toggles between two options: checked or unchecked. Also supports an indeterminate state.

### States

| State | Description |
|-------|-------------|
| **Unchecked** | Default, unselected state |
| **Checked** | Selected state with checkmark |
| **Indeterminate** | Partial selection (e.g., parent with some children selected) |
| **Disabled** | Non-interactive state |
| **Disabled Checked** | Checked but non-interactive |
| **Disabled Indeterminate** | Indeterminate but non-interactive |

### Props/API

```typescript
interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  name?: string;
  value?: string;
  id?: string;
}
```

### Key CSS Patterns

```css
/* Checkbox container */
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* Checkbox input (visually hidden) */
.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* Custom checkbox */
.checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid var(--accents-3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  background: var(--geist-background);
}

/* Hover state */
.checkbox-wrapper:hover .checkbox {
  border-color: var(--geist-foreground);
}

/* Checked state */
.checkbox-input:checked + .checkbox {
  background: var(--geist-foreground);
  border-color: var(--geist-foreground);
}

.checkbox-input:checked + .checkbox::after {
  content: '';
  width: 10px;
  height: 10px;
  background-image: url("data:image/svg+xml,..."); /* Checkmark SVG */
}

/* Indeterminate state */
.checkbox-input:indeterminate + .checkbox::after {
  content: '';
  width: 8px;
  height: 2px;
  background: var(--geist-background);
}

/* Disabled state */
.checkbox-wrapper-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Label */
.checkbox-label {
  font-size: 14px;
  color: var(--geist-foreground);
  user-select: none;
}
```

### Implementation Notes
- Use native `<input type="checkbox">` for accessibility
- Indeterminate state must be set via JavaScript (not HTML attribute)
- Label should be clickable to toggle checkbox
- Consider focus ring for keyboard navigation
- Group related checkboxes with fieldset/legend

---

## 8. Choicebox

### Purpose
Choicebox provides a card-style selection interface for single or multi-select options. More prominent than standard radio buttons or checkboxes.

### Selection Modes

| Mode | Description |
|------|-------------|
| **Single-select** | Only one option can be selected (radio behavior) |
| **Multi-select** | Multiple options can be selected (checkbox behavior) |

### States

| State | Description |
|-------|-------------|
| **Default** | Unselected option |
| **Selected** | Active selection with visual indicator |
| **Disabled (Group)** | Entire group is non-interactive |
| **Disabled (Single)** | Individual option is non-interactive |

### Features

| Feature | Description |
|---------|-------------|
| **Custom Content** | Additional content shown when option is selected |
| **Title & Description** | Primary and secondary text |
| **Icon/Badge** | Visual indicators (e.g., "Trial" badge) |

### Props/API

```typescript
interface ChoiceboxGroupProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;       // Enable multi-select
  disabled?: boolean;       // Disable entire group
  children: ReactNode;
}

interface ChoiceboxProps {
  value: string;
  title: string;
  description?: string;
  disabled?: boolean;
  badge?: ReactNode;
  icon?: ReactNode;
  expandedContent?: ReactNode;  // Content shown when selected
}
```

### Key CSS Patterns

```css
/* Choicebox group */
.choicebox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Choicebox item */
.choicebox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--accents-2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: var(--geist-background);
}

.choicebox:hover {
  border-color: var(--accents-4);
}

/* Selected state */
.choicebox-selected {
  border-color: var(--geist-foreground);
  background: var(--accents-1);
}

/* Selection indicator */
.choicebox-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid var(--accents-3);
  border-radius: 50%;  /* Circle for single-select */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Multi-select indicator */
.choicebox-multi .choicebox-indicator {
  border-radius: 4px;  /* Square for multi-select */
}

.choicebox-selected .choicebox-indicator {
  border-color: var(--geist-foreground);
  background: var(--geist-foreground);
}

.choicebox-selected .choicebox-indicator::after {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--geist-background);
  border-radius: 50%;
}

/* Content area */
.choicebox-content {
  flex: 1;
}

.choicebox-title {
  font-weight: 500;
  font-size: 14px;
  color: var(--geist-foreground);
}

.choicebox-description {
  font-size: 13px;
  color: var(--accents-5);
  margin-top: 4px;
}

/* Badge */
.choicebox-badge {
  margin-left: auto;
}

/* Expanded content */
.choicebox-expanded {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--accents-2);
}

/* Disabled state */
.choicebox-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Implementation Notes
- Use for prominent selection UI (pricing plans, feature selection)
- Single-select uses radio button semantics
- Multi-select uses checkbox semantics
- Custom content can include forms, additional options, etc.
- Consider keyboard navigation between options
- Badge is useful for highlighting special options (e.g., "Trial", "Popular")

---

## CSS Variables Reference

All Geist components use these core CSS variables:

```css
:root {
  /* Colors */
  --geist-foreground: #000;
  --geist-background: #fff;
  --geist-success: #0070f3;
  --geist-error: #e00;
  --geist-warning: #f5a623;
  --geist-cyan: #79ffe1;
  
  /* Accents (gray scale) */
  --accents-1: #fafafa;
  --accents-2: #eaeaea;
  --accents-3: #999;
  --accents-4: #888;
  --accents-5: #666;
  --accents-6: #444;
  --accents-7: #333;
  --accents-8: #111;
  
  /* Spacing */
  --geist-gap: 16pt;
  --geist-gap-half: 8pt;
  --geist-gap-quarter: 4pt;
  
  /* Border radius */
  --geist-radius: 5px;
  
  /* Shadows */
  --geist-shadow-small: 0 5px 10px rgba(0, 0, 0, 0.12);
  --geist-shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.12);
  --geist-shadow-large: 0 30px 60px rgba(0, 0, 0, 0.12);
}

/* Dark mode */
[data-theme='dark'] {
  --geist-foreground: #fff;
  --geist-background: #000;
  --accents-1: #111;
  --accents-2: #333;
  --accents-3: #444;
  --accents-4: #666;
  --accents-5: #888;
  --accents-6: #999;
  --accents-7: #eaeaea;
  --accents-8: #fafafa;
}
```

---

## Summary

| Component | Primary Use Case | Key Features |
|-----------|------------------|--------------|
| **Avatar** | User/team representation | Groups, placeholders, custom icons |
| **Badge** | Status/category labels | 9 color variants, 3 sizes, icons |
| **Book** | Content cards | Custom colors, textures, responsive |
| **Browser** | Website showcases | Realistic frame, URL bar |
| **Button** | Actions/navigation | Multiple types, shapes, loading state |
| **Calendar** | Date selection | Presets, ranges, layouts |
| **Checkbox** | Boolean selection | Indeterminate state, disabled |
| **Choicebox** | Card-style selection | Single/multi-select, custom content |

---

*Document generated from Vercel Geist Design System documentation.*
*Last updated: 2025*
