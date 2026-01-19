# Geist Design System - CSS Patterns Reference

> Extracted from the official Vercel Geist Design System (https://vercel.com/geist)
> This document provides styling patterns and design tokens for implementing Geist-inspired components.

## Table of Contents

1. [Design Tokens (CSS Variables)](#1-design-tokens-css-variables)
2. [Color Palette](#2-color-palette)
3. [Typography System](#3-typography-system)
4. [Spacing Scale](#4-spacing-scale)
5. [Border Radius Scale](#5-border-radius-scale)
6. [Shadow Definitions (Materials)](#6-shadow-definitions-materials)
7. [Component-Specific Styles](#7-component-specific-styles)

---

## 1. Design Tokens (CSS Variables)

### Background Colors

```css
:root {
  /* Background 1 - Default element background */
  --ds-background-100: #ffffff; /* Light mode */
  --ds-background-100: #0a0a0a; /* Dark mode */
  
  /* Background 2 - Secondary background */
  --ds-background-200: #fafafa; /* Light mode */
  --ds-background-200: #111111; /* Dark mode */
}
```

### Gray Scale (10 steps)

The Geist system uses a 10-step gray scale with specific purposes:

```css
:root {
  /* Colors 1-3: Component Backgrounds */
  --ds-gray-100: /* Default background */
  --ds-gray-200: /* Hover background */
  --ds-gray-300: /* Active background */
  
  /* Colors 4-6: Borders */
  --ds-gray-400: /* Default border */
  --ds-gray-500: /* Hover border */
  --ds-gray-600: /* Active border */
  
  /* Colors 7-8: High Contrast Backgrounds */
  --ds-gray-700: /* High contrast background */
  --ds-gray-800: /* Hover high contrast background */
  
  /* Colors 9-10: Text and Icons */
  --ds-gray-900: /* Secondary text and icons */
  --ds-gray-1000: /* Primary text and icons */
}
```

### Gray Alpha Scale

Semi-transparent gray values for overlays and subtle backgrounds:

```css
:root {
  --ds-gray-alpha-100: rgba(0, 0, 0, 0.02);
  --ds-gray-alpha-200: rgba(0, 0, 0, 0.04);
  --ds-gray-alpha-300: rgba(0, 0, 0, 0.06);
  --ds-gray-alpha-400: rgba(0, 0, 0, 0.08);
  --ds-gray-alpha-500: rgba(0, 0, 0, 0.12);
  --ds-gray-alpha-600: rgba(0, 0, 0, 0.16);
  --ds-gray-alpha-700: rgba(0, 0, 0, 0.24);
  --ds-gray-alpha-800: rgba(0, 0, 0, 0.36);
  --ds-gray-alpha-900: rgba(0, 0, 0, 0.52);
  --ds-gray-alpha-1000: rgba(0, 0, 0, 0.80);
}
```

---

## 2. Color Palette

The Geist system includes 10 color scales, each with 10 steps. P3 colors are used on supported browsers and displays.

### Semantic Color Scales

| Scale | Primary Use |
|-------|-------------|
| **Gray** | Neutral UI elements, text, borders |
| **Gray Alpha** | Transparent overlays, subtle backgrounds |
| **Blue** | Primary actions, links, information |
| **Red** | Errors, destructive actions, alerts |
| **Amber** | Warnings, caution states |
| **Green** | Success, positive states, confirmations |
| **Teal** | Secondary accent, alternative highlights |
| **Purple** | Special features, premium indicators |
| **Pink** | Accent, decorative elements |

### Color Usage Guidelines

#### Component Backgrounds (Colors 1-3)
- **Color 1**: Default background
- **Color 2**: Hover background
- **Color 3**: Active background

For smaller UI elements like badges, use Color 2 or Color 3 as the background.

#### Borders (Colors 4-6)
- **Color 4**: Default border
- **Color 5**: Hover border
- **Color 6**: Active border

#### High Contrast Backgrounds (Colors 7-8)
- **Color 7**: High contrast background
- **Color 8**: Hover high contrast background

#### Text and Icons (Colors 9-10)
- **Color 9**: Secondary text and icons
- **Color 10**: Primary text and icons

---

## 3. Typography System

The Geist typography system uses Tailwind classes that preset `font-size`, `line-height`, `letter-spacing`, and `font-weight`.

### Headings

| Class | Size | Usage |
|-------|------|-------|
| `text-heading-72` | 72px | Marketing heroes |
| `text-heading-64` | 64px | Large marketing headings |
| `text-heading-56` | 56px | Section headings |
| `text-heading-48` | 48px | Page headings |
| `text-heading-40` | 40px | Major section headings |
| `text-heading-32` | 32px | Marketing subheadings, dashboard headings |
| `text-heading-24` | 24px | Card headings |
| `text-heading-20` | 20px | Subsection headings |
| `text-heading-16` | 16px | Small headings |
| `text-heading-14` | 14px | Micro headings |

### Buttons

| Class | Size | Usage |
|-------|------|-------|
| `text-button-16` | 16px | Largest button |
| `text-button-14` | 14px | Default button |
| `text-button-12` | 12px | Tiny button inside input fields |

### Labels (Single-line text)

| Class | Size | Usage |
|-------|------|-------|
| `text-label-20` | 20px | Marketing text |
| `text-label-18` | 18px | Large labels |
| `text-label-16` | 16px | Titles to differentiate from regular text |
| `text-label-14` | 14px | Most common - used in many menus |
| `text-label-14-mono` | 14px | Largest mono, pairs with larger text |
| `text-label-13` | 13px | Secondary line next to other labels |
| `text-label-13-mono` | 13px | Pairs with Label 14 |
| `text-label-12` | 12px | Tertiary text, comments, calendars |
| `text-label-12-mono` | 12px | Small monospace |

### Copy (Multi-line text)

| Class | Size | Usage |
|-------|------|-------|
| `text-copy-24` | 24px | Hero areas on marketing pages |
| `text-copy-20` | 20px | Hero areas on marketing pages |
| `text-copy-18` | 18px | Marketing, big quotes |
| `text-copy-16` | 16px | Modals where text can breathe |
| `text-copy-14` | 14px | Most commonly used text style |
| `text-copy-13` | 13px | Secondary text, space-constrained views |
| `text-copy-13-mono` | 13px | Inline code mentions |

### Typography Modifiers

Use `<strong>` element nested within typography classes for emphasis:

```html
<p class="text-copy-16">
  Copy 16 <strong>with Strong</strong>
</p>
```

---

## 4. Spacing Scale

Geist uses a consistent spacing scale based on 4px increments:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-9: 36px;
  --space-10: 40px;
  --space-12: 48px;
  --space-14: 56px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

---

## 5. Border Radius Scale

The Geist system uses specific border radius values based on component elevation:

| Radius | Value | Usage |
|--------|-------|-------|
| **Small** | 4px | Small elements, tags |
| **Base** | 6px | Buttons, inputs, base components, tooltips |
| **Medium** | 8px | Cards, small containers |
| **Large** | 12px | Menus, modals, medium containers |
| **XLarge** | 16px | Fullscreen modals, large containers |
| **Full** | 9999px | Pills, rounded buttons |

### Material-Based Radius

| Material | Radius | Usage |
|----------|--------|-------|
| `material-base` | 6px | Everyday use |
| `material-small` | 6px | Slightly raised elements |
| `material-medium` | 12px | Further raised elements |
| `material-large` | 12px | Large raised elements |
| `material-tooltip` | 6px | Tooltips (with triangular stem) |
| `material-menu` | 12px | Dropdown menus |
| `material-modal` | 12px | Modal dialogs |
| `material-fullscreen` | 16px | Fullscreen overlays |

---

## 6. Shadow Definitions (Materials)

### Surface Materials (On the page)

```css
/* Material Base - Everyday use */
.material-base {
  border-radius: 6px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
}

/* Material Small - Slightly raised */
.material-small {
  border-radius: 6px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* Material Medium - Further raised */
.material-medium {
  border-radius: 12px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

/* Material Large - Further raised */
.material-large {
  border-radius: 12px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
}
```

### Floating Materials (Above the page)

```css
/* Material Tooltip - Lightest shadow */
.material-tooltip {
  border-radius: 6px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-200),
    0 2px 4px rgba(0, 0, 0, 0.08);
}

/* Material Menu - Lift from page */
.material-menu {
  border-radius: 12px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-200),
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.08);
}

/* Material Modal - Further lift */
.material-modal {
  border-radius: 12px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-200),
    0 8px 16px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.12);
}

/* Material Fullscreen - Biggest lift */
.material-fullscreen {
  border-radius: 16px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-200),
    0 16px 32px rgba(0, 0, 0, 0.16),
    0 32px 64px rgba(0, 0, 0, 0.16);
}
```

---

## 7. Component-Specific Styles

### Button

#### Sizes
- **Small**: Height 32px, padding 0 12px
- **Medium** (default): Height 40px, padding 0 16px
- **Large**: Height 48px, padding 0 20px

#### Types
- **Primary**: Solid background, high contrast
- **Secondary**: Subtle background, bordered
- **Tertiary**: Ghost/transparent background
- **Error**: Red variant for destructive actions
- **Warning**: Amber variant for caution

#### Shapes
- **Default**: `border-radius: 6px`
- **Rounded**: `border-radius: 9999px` (pill shape)
- **Square**: For icon-only buttons with `svgOnly` prop

#### States
```css
.button {
  transition: all 150ms ease;
}

.button:hover {
  /* Background shifts to Color 2 */
  /* Border shifts to Color 5 */
}

.button:active {
  /* Background shifts to Color 3 */
  /* Border shifts to Color 6 */
  transform: scale(0.98);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button:focus-visible {
  outline: 2px solid var(--ds-blue-700);
  outline-offset: 2px;
}
```

#### Rounded Button with Shadow
```css
.button-rounded {
  border-radius: 9999px;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 2px 4px rgba(0, 0, 0, 0.04);
}
```

---

### Input

#### Sizes
- **Small**: Height 32px
- **Default**: Height 40px
- **Large**: Height 48px

#### Base Styles
```css
.input {
  border-radius: 6px;
  border: 1px solid var(--ds-gray-400);
  background: var(--ds-background-100);
  padding: 0 12px;
  font-size: 14px;
  line-height: 1.5;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input:hover {
  border-color: var(--ds-gray-500);
}

.input:focus {
  border-color: var(--ds-gray-1000);
  outline: none;
  box-shadow: 0 0 0 1px var(--ds-gray-1000);
}

.input:disabled {
  background: var(--ds-gray-100);
  color: var(--ds-gray-900);
  cursor: not-allowed;
}

.input[aria-invalid="true"] {
  border-color: var(--ds-red-700);
}
```

#### Prefix/Suffix
Inputs support prefix and suffix elements (icons, text, buttons).

#### Search Input
- Includes search icon prefix
- Clears on Escape key press
- Optional ⌘K shortcut indicator

---

### Badge

#### Variants
| Variant | Background | Text |
|---------|------------|------|
| `gray` | Gray Color 7-8 | White |
| `gray-subtle` | Gray Color 2-3 | Gray Color 10 |
| `blue` | Blue Color 7-8 | White |
| `blue-subtle` | Blue Color 2-3 | Blue Color 10 |
| `purple` | Purple Color 7-8 | White |
| `purple-subtle` | Purple Color 2-3 | Purple Color 10 |
| `amber` | Amber Color 7-8 | Black |
| `amber-subtle` | Amber Color 2-3 | Amber Color 10 |
| `red` | Red Color 7-8 | White |
| `red-subtle` | Red Color 2-3 | Red Color 10 |
| `pink` | Pink Color 7-8 | White |
| `pink-subtle` | Pink Color 2-3 | Pink Color 10 |
| `green` | Green Color 7-8 | White |
| `green-subtle` | Green Color 2-3 | Green Color 10 |
| `teal` | Teal Color 7-8 | White |
| `teal-subtle` | Teal Color 2-3 | Teal Color 10 |
| `inverted` | Foreground | Background |

#### Sizes
- **Small**: Height 20px, padding 0 6px, font-size 12px
- **Medium**: Height 24px, padding 0 8px, font-size 13px
- **Large**: Height 28px, padding 0 10px, font-size 14px

#### Base Styles
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}
```

#### Pill (Link Badge)
A special link variant based on Badge styling, less prominent than a button.

---

### Modal

#### Base Styles
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  border-radius: 12px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-200),
    0 8px 16px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.12);
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow: auto;
}

.modal-header {
  padding: 24px 24px 0;
}

.modal-body {
  padding: 16px 24px;
}

.modal-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
```

#### Variants
- **Default**: Standard modal with header, body, footer
- **Sticky**: Header/footer stick during scroll
- **Single button**: Simplified footer with one action
- **Inset**: Content with inset padding
- **Disabled actions**: Buttons can be disabled

---

### Checkbox

```css
.checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--ds-gray-400);
  background: var(--ds-background-100);
  transition: all 150ms ease;
}

.checkbox:hover {
  border-color: var(--ds-gray-500);
}

.checkbox:checked {
  background: var(--ds-gray-1000);
  border-color: var(--ds-gray-1000);
}

.checkbox:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox:indeterminate {
  background: var(--ds-gray-1000);
  border-color: var(--ds-gray-1000);
}
```

---

### Select

#### Sizes
- **XSmall**: Height 28px
- **Small**: Height 32px
- **Default**: Height 40px
- **Large**: Height 48px

```css
.select {
  border-radius: 6px;
  border: 1px solid var(--ds-gray-400);
  background: var(--ds-background-100);
  padding: 0 32px 0 12px;
  font-size: 14px;
  appearance: none;
  cursor: pointer;
  transition: border-color 150ms ease;
}

.select:hover {
  border-color: var(--ds-gray-500);
}

.select:focus {
  border-color: var(--ds-gray-1000);
  outline: none;
}

.select:disabled {
  background: var(--ds-gray-100);
  cursor: not-allowed;
}
```

---

### Toggle (Switch)

```css
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  background: var(--ds-gray-400);
  position: relative;
  cursor: pointer;
  transition: background 150ms ease;
}

.toggle:checked {
  background: var(--ds-blue-700);
}

.toggle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform 150ms ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle:checked::after {
  transform: translateX(20px);
}

.toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Sizes
- **Small**: Width 36px, Height 20px
- **Default**: Width 44px, Height 24px

#### Custom Colors
Toggle supports custom colors for the checked state (blue, green, amber, red, etc.).

---

### Tooltip

```css
.tooltip {
  border-radius: 6px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  padding: 8px 12px;
  font-size: 13px;
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-200),
    0 2px 4px rgba(0, 0, 0, 0.08);
  max-width: 240px;
}

/* Tooltip with stem/arrow */
.tooltip::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  transform: rotate(45deg);
}
```

#### Positions
- Top, Bottom, Left, Right
- Box alignment: Left, Center, Right

#### Delay
- Default: Has delay before showing
- No delay: Shows immediately on hover

---

### Toast

```css
.toast {
  border-radius: 8px;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  padding: 12px 16px;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 420px;
}
```

#### Types
| Type | Icon Color | Usage |
|------|------------|-------|
| Default | Gray | General notifications |
| Success | Green | Positive confirmations |
| Warning | Amber | Caution messages |
| Error | Red | Error notifications |

#### Features
- Multi-line support
- JSX content support
- Link support
- Action buttons
- Undo functionality
- Preserve (stays until dismissed)

---

### Table

```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 13px;
  color: var(--ds-gray-900);
  border-bottom: 1px solid var(--ds-gray-400);
}

.table td {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--ds-gray-200);
}

/* Striped variant */
.table-striped tbody tr:nth-child(even) {
  background: var(--ds-gray-100);
}

/* Bordered variant */
.table-bordered {
  border: 1px solid var(--ds-gray-400);
  border-radius: 8px;
  overflow: hidden;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid var(--ds-gray-200);
}

/* Interactive variant */
.table-interactive tbody tr {
  cursor: pointer;
  transition: background 150ms ease;
}

.table-interactive tbody tr:hover {
  background: var(--ds-gray-100);
}
```

---

## Transitions & Animations

### Standard Transitions

```css
/* Fast - Micro interactions */
--transition-fast: 100ms ease;

/* Default - Most interactions */
--transition-default: 150ms ease;

/* Slow - Larger animations */
--transition-slow: 200ms ease;

/* Slower - Page transitions */
--transition-slower: 300ms ease;
```

### Common Transition Properties

```css
/* Button hover/active */
transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;

/* Input focus */
transition: border-color 150ms ease, box-shadow 150ms ease;

/* Modal/overlay */
transition: opacity 200ms ease, transform 200ms ease;

/* Toggle switch */
transition: background 150ms ease;
```

---

## Focus States

All interactive elements should have visible focus states:

```css
/* Default focus ring */
:focus-visible {
  outline: 2px solid var(--ds-blue-700);
  outline-offset: 2px;
}

/* Alternative for dark backgrounds */
:focus-visible {
  box-shadow: 0 0 0 2px var(--ds-background-100), 0 0 0 4px var(--ds-blue-700);
}
```

---

## Dark Mode Considerations

The Geist system supports both light and dark modes. Key differences:

1. **Backgrounds**: Inverted (white → near-black)
2. **Text**: Inverted (dark → light)
3. **Borders**: Adjusted alpha values for visibility
4. **Shadows**: Reduced intensity in dark mode
5. **Colors**: P3 color space used where supported

```css
@media (prefers-color-scheme: dark) {
  :root {
    --ds-background-100: #0a0a0a;
    --ds-background-200: #111111;
    /* Gray scale inverted */
    /* Shadows with reduced opacity */
  }
}
```

---

## Implementation Notes

1. **P3 Colors**: The Geist system uses P3 colors on supported browsers and displays for wider color gamut.

2. **Tailwind Integration**: Typography styles are consumed as Tailwind classes (e.g., `text-heading-32`, `text-copy-14`).

3. **Component Composition**: Many components support prefix/suffix elements for icons and additional content.

4. **Accessibility**: All components include proper ARIA attributes, focus states, and keyboard navigation.

5. **Responsive Design**: Components adapt to different screen sizes with appropriate sizing and spacing adjustments.

---

*This document was compiled from the official Vercel Geist Design System documentation. For the most up-to-date information, visit https://vercel.com/geist*
