# Vercel Geist Color Usage Patterns

> Comprehensive guide to how Vercel applies colors across their design system and platform.
> Sources: [Vercel Geist Colors](https://vercel.com/geist/colors), [Vercel UI](https://vercel-ui-phi.vercel.app/docs/colors)

---

## Table of Contents

1. [Color Scale System](#color-scale-system)
2. [Background Colors](#background-colors)
3. [Component State Colors](#component-state-colors)
4. [Border Colors](#border-colors)
5. [Text Color Hierarchy](#text-color-hierarchy)
6. [Status Colors](#status-colors)
7. [Interactive Element Colors](#interactive-element-colors)
8. [Shadow System](#shadow-system)
9. [Dark Mode Patterns](#dark-mode-patterns)
10. [CSS Custom Properties Reference](#css-custom-properties-reference)

---

## Color Scale System

Vercel uses a **10-step color scale** system with P3 colors on supported browsers and displays. Each color has values from 100-1000.

### Available Color Scales

| Scale | Primary Use |
|-------|-------------|
| **Gray** | Neutral UI elements, text, borders |
| **Gray Alpha** | Transparent overlays, subtle backgrounds |
| **Blue** | Primary actions, links, success states |
| **Red** | Error states, destructive actions |
| **Amber** | Warning states, caution indicators |
| **Green** | Success confirmations, positive states |
| **Teal** | Ready/active states, informational |
| **Purple** | Special features, violet accents |
| **Pink** | Accent colors, special badges |

---

## Background Colors

### Page Backgrounds

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--ds-background-100` | `hsl(0 0% 100%)` #FFFFFF | `hsl(0 0% 4%)` #0A0A0A | **Primary** - Default page/element background |
| `--ds-background-200` | `hsl(0 0% 98%)` #FAFAFA | `hsl(0 0% 0%)` #000000 | **Secondary** - Subtle differentiation |

### Usage Guidelines

```
Background 1 (--ds-background-100):
- Use for most page backgrounds
- Use when placing colored elements on top
- Default for cards, modals, panels

Background 2 (--ds-background-200):
- Use sparingly for subtle differentiation
- Sidebar backgrounds
- Nested card backgrounds
- Input prefix/suffix areas
```

---

## Component State Colors

### Interactive Component Backgrounds (Gray Scale)

The first 3 colors in each scale are designed for component backgrounds with state transitions:

| State | Token | Light Mode | Dark Mode | Usage |
|-------|-------|------------|-----------|-------|
| **Default** | `--ds-gray-100` | `hsl(0 0% 95%)` | `hsl(0 0% 10%)` | Resting state background |
| **Hover** | `--ds-gray-200` | `hsl(0 0% 92%)` | `hsl(0 0% 12%)` | Mouse hover state |
| **Active** | `--ds-gray-300` | `hsl(0 0% 90%)` | `hsl(0 0% 16%)` | Pressed/active state |

### State Transition Pattern

```css
/* Standard component state pattern */
.component {
  background: var(--ds-gray-100);      /* Default */
}
.component:hover {
  background: var(--ds-gray-200);      /* Hover */
}
.component:active {
  background: var(--ds-gray-300);      /* Active/Pressed */
}
```

### Alpha Transparency States

For overlays and subtle backgrounds:

| State | Token | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| Default | `--ds-gray-alpha-100` | `hsla(0, 0%, 0%, 0.05)` | `hsla(0, 0%, 100%, 0.06)` |
| Hover | `--ds-gray-alpha-200` | `hsla(0, 0%, 0%, 0.08)` | `hsla(0, 0%, 100%, 0.09)` |
| Active | `--ds-gray-alpha-300` | `hsla(0, 0%, 0%, 0.1)` | `hsla(0, 0%, 100%, 0.13)` |
| Border | `--ds-gray-alpha-400` | `hsla(0, 0%, 0%, 0.08)` | `hsla(0, 0%, 100%, 0.14)` |

---

## Border Colors

### Border Scale (Colors 4-6)

| Purpose | Token | Light Mode | Dark Mode |
|---------|-------|------------|-----------|
| **Default Border** | `--ds-gray-400` | `hsl(0 0% 92%)` | `hsl(0 0% 18%)` |
| **Hover Border** | `--ds-gray-500` | `hsl(0 0% 79%)` | `hsl(0 0% 27%)` |
| **Active Border** | `--ds-gray-600` | `hsl(0 0% 66%)` | `hsl(0 0% 53%)` |

### Border Implementation

```css
/* Standard border pattern */
.element {
  border: 1px solid var(--ds-gray-alpha-400);
}

/* Shadow-based border (preferred for consistency) */
.element {
  box-shadow: 0 0 0 1px var(--ds-gray-alpha-400);
}

/* Inset border */
.element {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}
```

---

## Text Color Hierarchy

### Text Scale (Colors 9-10)

| Level | Token | Light Mode | Dark Mode | Usage |
|-------|-------|------------|-----------|-------|
| **Primary** | `--ds-gray-1000` | `hsl(0 0% 9%)` #171717 | `hsl(0 0% 93%)` #EDEDED | Headings, important text |
| **Secondary** | `--ds-gray-900` | `hsl(0 0% 40%)` | `hsl(0 0% 63%)` | Body text, descriptions |
| **Tertiary** | `--ds-gray-700` | `hsl(0 0% 56%)` | `hsl(0 0% 56%)` | Placeholder, muted text |
| **Disabled** | `--ds-gray-500` | `hsl(0 0% 79%)` | `hsl(0 0% 27%)` | Disabled state text |

### Legacy Accent Scale

```css
/* Light mode accents (dark to light) */
--accents-8: #111;    /* Darkest - primary text */
--accents-7: #333;
--accents-6: #444;
--accents-5: #666;
--accents-4: #888;
--accents-3: #999;
--accents-2: #eaeaea;
--accents-1: #fafafa; /* Lightest - backgrounds */

/* Dark mode (inverted) */
--accents-1: #111;    /* Darkest - backgrounds */
--accents-8: #fafafa; /* Lightest - primary text */
```

---

## Status Colors

### Semantic Status Mapping

| Status | Color Scale | Primary Token | Usage |
|--------|-------------|---------------|-------|
| **Success/Info** | Blue | `--ds-blue-700` | Positive actions, links, info |
| **Error** | Red | `--ds-red-700` | Errors, destructive actions |
| **Warning** | Amber | `--ds-amber-700` | Warnings, caution states |
| **Ready/Active** | Teal | `--ds-teal-600` | Ready states, active indicators |
| **Queued/Canceled** | Gray | `--accents-2` | Neutral/inactive states |
| **Building** | Orange | `--orange-500` | In-progress states |

### Status Dot Colors

```typescript
const statusColors = {
  QUEUED: "bg-accents-2",      // Gray - waiting
  BUILDING: "bg-orange-500",   // Orange - in progress
  ERROR: "bg-red-800",         // Red - failed
  READY: "bg-teal-600",        // Teal - success
  CANCELED: "bg-accents-2",    // Gray - canceled
}
```

### Note Component Variants

| Variant | Text Color | Border Color | Fill Background |
|---------|------------|--------------|-----------------|
| **Secondary** | `gray-600` | `gray-300` | `--ds-gray-alpha-200` |
| **Success** | `blue-900` | `blue-400` | `--ds-blue-200` |
| **Error** | `red-900` | `red-400` | `--ds-red-200` |
| **Warning** | `amber-900` | `amber-400` | `--ds-amber-200` |
| **Violet** | `purple-900` | `purple-400` | `--ds-purple-200` |
| **Cyan** | `teal-900` | `teal-400` | `--ds-teal-200` |

---

## Interactive Element Colors

### Button Variants

```typescript
const buttonVariants = {
  // Primary (Default) - High emphasis
  default: {
    background: "var(--ds-gray-1000)",  // Black/White
    text: "var(--ds-background-100)",    // White/Black
    hover: "#ccc",                        // Lighter
  },
  
  // Secondary - Medium emphasis
  secondary: {
    background: "var(--ds-background-100)",
    border: "var(--ds-gray-alpha-400)",
    text: "var(--ds-gray-1000)",
    hover: "var(--ds-gray-alpha-200)",
  },
  
  // Tertiary - Low emphasis
  tertiary: {
    background: "transparent",
    border: "transparent",
    text: "var(--ds-gray-1000)",
    hover: "var(--ds-gray-alpha-200)",
  },
  
  // Error - Destructive actions
  error: {
    background: "var(--ds-red-800)",
    border: "var(--ds-red-800)",
    hover: "var(--ds-red-900)",
  },
  
  // Warning - Caution actions
  warning: {
    background: "var(--ds-amber-800)",
    border: "var(--ds-amber-800)",
    text: "#0a0a0a",
    hover: "#d27504",
  },
  
  // Disabled state (all variants)
  disabled: {
    background: "var(--ds-gray-100)",
    text: "var(--ds-gray-700)",
    border: "var(--ds-gray-400)",
    cursor: "not-allowed",
  },
}
```

### Badge Variants

| Variant | Background | Text |
|---------|------------|------|
| `gray` | `bg-gray-700` | `text-white` |
| `gray-subtle` | `bg-gray-200` | `text-gray-1000` |
| `blue` | `bg-blue-700` | `text-white` |
| `blue-subtle` | `bg-blue-200` | `text-blue-900` |
| `red` | `bg-red-700` | `text-white` |
| `red-subtle` | `bg-red-200` | `text-red-900` |
| `amber` | `bg-amber-700` | `text-black` |
| `amber-subtle` | `bg-amber-200` | `text-amber-900` |
| `green` | `bg-green-700` | `text-white` |
| `green-subtle` | `bg-green-200` | `text-green-900` |
| `teal` | `bg-teal-700` | `text-white` |
| `teal-subtle` | `bg-teal-300` | `text-teal-900` |
| `purple` | `bg-purple-700` | `text-white` |
| `purple-subtle` | `bg-purple-200` | `text-purple-900` |
| `pink` | `bg-pink-700` | `text-white` |
| `pink-subtle` | `bg-pink-300` | `text-pink-900` |

### Input Focus States

```css
/* Default input */
.input {
  border: 1px solid var(--ds-gray-alpha-400);
  background: var(--ds-background-100);
}

/* Focus state with ring */
.input:focus-within {
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-600),
    0 0 0 4px rgba(0, 0, 0, 0.16);  /* Light mode */
}

/* Dark mode focus */
.dark .input:focus-within {
  box-shadow: 
    0 0 0 1px var(--ds-gray-alpha-600),
    0 0 0 4px hsla(0, 0%, 100%, 0.24);
}

/* Disabled input */
.input:disabled {
  background: var(--ds-background-200);
  color: var(--ds-gray-700);
  cursor: not-allowed;
}
```

---

## Shadow System

### Shadow Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--ds-shadow-small` | `0px 2px 2px rgba(0,0,0,0.04)` | `0px 1px 2px rgba(0,0,0,0.16)` | Subtle elevation |
| `--ds-shadow-medium` | `0px 2px 2px rgba(0,0,0,0.04), 0px 8px 8px -8px rgba(0,0,0,0.04)` | Increased opacity | Cards, dropdowns |
| `--ds-shadow-large` | `0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.04)` | Increased opacity | Modals, popovers |

### Composite Shadows

```css
/* Border + Shadow combinations */
--ds-shadow-border-small: var(--ds-shadow-border), var(--ds-shadow-small);
--ds-shadow-border-medium: var(--ds-shadow-border), var(--ds-shadow-medium);
--ds-shadow-border-large: var(--ds-shadow-border), var(--ds-shadow-large);

/* Specific component shadows */
--ds-shadow-tooltip: var(--ds-shadow-border), 0px 1px 1px rgba(0,0,0,0.02), 0px 4px 8px rgba(0,0,0,0.04);
--ds-shadow-menu: var(--ds-shadow-border), 0px 1px 1px rgba(0,0,0,0.02), 0px 4px 8px -4px rgba(0,0,0,0.04), 0px 16px 24px -8px rgba(0,0,0,0.06);
--ds-shadow-modal: var(--ds-shadow-border), 0px 1px 1px rgba(0,0,0,0.02), 0px 8px 16px -4px rgba(0,0,0,0.04), 0px 24px 32px -8px rgba(0,0,0,0.06);
```

---

## Dark Mode Patterns

### Color Inversion Strategy

Vercel uses a **semantic inversion** approach where:

1. **Backgrounds** flip from light to dark
2. **Text** flips from dark to light
3. **Accent colors** maintain their hue but adjust lightness
4. **Status colors** remain recognizable but adapt contrast

### Key Dark Mode Differences

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page background | White (#FFF) | Near-black (#0A0A0A) |
| Primary text | Near-black (#171717) | Near-white (#EDEDED) |
| Borders | Black alpha (0.08) | White alpha (0.14) |
| Shadows | Black-based | Black-based (higher opacity) |
| Focus rings | Black alpha | White alpha |

### Dark Mode Color Scale Example (Blue)

```css
/* Light mode blue scale */
--ds-blue-100: 212 100% 97%;  /* Very light */
--ds-blue-700: 212 100% 48%;  /* Primary */
--ds-blue-1000: 211 100% 15%; /* Very dark */

/* Dark mode blue scale */
--ds-blue-100: 216 50% 12%;   /* Very dark */
--ds-blue-700: 212 100% 48%;  /* Primary (same) */
--ds-blue-1000: 206 100% 96%; /* Very light */
```

---

## CSS Custom Properties Reference

### Complete Light Mode Tokens

```css
:root {
  /* Backgrounds */
  --ds-background-100: 0 0% 100%;
  --ds-background-200: 0 0% 98%;

  /* Gray Scale */
  --ds-gray-100: 0 0% 95%;
  --ds-gray-200: 0 0% 92%;
  --ds-gray-300: 0 0% 90%;
  --ds-gray-400: 0 0% 92%;
  --ds-gray-500: 0 0% 79%;
  --ds-gray-600: 0 0% 66%;
  --ds-gray-700: 0 0% 56%;
  --ds-gray-800: 0 0% 49%;
  --ds-gray-900: 0 0% 40%;
  --ds-gray-1000: 0 0% 9%;

  /* Gray Alpha */
  --ds-gray-alpha-100: hsla(0, 0%, 0%, 0.05);
  --ds-gray-alpha-200: hsla(0, 0%, 0%, 0.08);
  --ds-gray-alpha-300: hsla(0, 0%, 0%, 0.1);
  --ds-gray-alpha-400: hsla(0, 0%, 0%, 0.08);
  --ds-gray-alpha-500: hsla(0, 0%, 0%, 0.21);
  --ds-gray-alpha-600: hsla(0, 0%, 0%, 0.34);

  /* Blue Scale */
  --ds-blue-100: 212 100% 97%;
  --ds-blue-200: 210 100% 96%;
  --ds-blue-300: 210 100% 94%;
  --ds-blue-400: 209 100% 90%;
  --ds-blue-500: 209 100% 80%;
  --ds-blue-600: 208 100% 66%;
  --ds-blue-700: 212 100% 48%;
  --ds-blue-800: 212 100% 41%;
  --ds-blue-900: 211 100% 42%;
  --ds-blue-1000: 211 100% 15%;

  /* Red Scale */
  --ds-red-100: 0 100% 97%;
  --ds-red-200: 0 100% 96%;
  --ds-red-700: 358 75% 59%;
  --ds-red-800: 358 70% 52%;
  --ds-red-900: 358 66% 48%;
  --ds-red-1000: 355 49% 15%;

  /* Amber Scale */
  --ds-amber-100: 39 100% 95%;
  --ds-amber-200: 44 100% 92%;
  --ds-amber-700: 39 100% 57%;
  --ds-amber-800: 35 100% 52%;
  --ds-amber-900: 30 100% 32%;

  /* Green Scale */
  --ds-green-100: 120 60% 96%;
  --ds-green-200: 120 60% 95%;
  --ds-green-700: 131 41% 46%;
  --ds-green-800: 132 43% 39%;
  --ds-green-900: 133 50% 32%;

  /* Teal Scale */
  --ds-teal-100: 169 70% 96%;
  --ds-teal-200: 167 70% 94%;
  --ds-teal-600: 170 70% 57%;
  --ds-teal-700: 173 80% 36%;
  --ds-teal-800: 173 83% 30%;

  /* Purple Scale */
  --ds-purple-100: 276 100% 97%;
  --ds-purple-200: 277 87% 97%;
  --ds-purple-700: 272 51% 54%;
  --ds-purple-800: 272 47% 45%;
  --ds-purple-900: 274 71% 43%;

  /* Pink Scale */
  --ds-pink-100: 330 100% 96%;
  --ds-pink-200: 340 90% 96%;
  --ds-pink-700: 336 80% 58%;
  --ds-pink-800: 336 74% 51%;
  --ds-pink-900: 336 65% 45%;

  /* Contrast */
  --ds-contrast-fg: 0 0% 0%;
}
```

---

## Usage Patterns Summary

### Element Type → Color Application

| Element Type | Default | Hover | Active | Disabled |
|--------------|---------|-------|--------|----------|
| **Page Background** | `background-100` | - | - | - |
| **Card Background** | `background-100` | - | - | `background-200` |
| **Button (Primary)** | `gray-1000` | `#ccc` | - | `gray-100` |
| **Button (Secondary)** | `background-100` | `gray-alpha-200` | - | `gray-100` |
| **Input** | `background-100` | - | focus ring | `background-200` |
| **Border** | `gray-alpha-400` | `gray-500` | `gray-600` | `gray-400` |
| **Text (Primary)** | `gray-1000` | - | - | `gray-700` |
| **Text (Secondary)** | `gray-900` | - | - | `gray-500` |
| **Link** | `blue-700` | underline | - | `gray-700` |
| **Badge (Subtle)** | `{color}-200` | - | - | - |
| **Badge (Solid)** | `{color}-700` | - | - | - |
| **Status Dot** | varies by status | - | - | `accents-2` |

---

## Best Practices

1. **Use semantic tokens** over raw color values
2. **Follow the 1-2-3 pattern** for component states (default → hover → active)
3. **Use alpha colors** for overlays and subtle backgrounds
4. **Maintain contrast ratios** - use 900-1000 for text on light backgrounds
5. **Test in both modes** - ensure colors work in light and dark themes
6. **Use shadow-border combinations** for elevated components
7. **Reserve status colors** for their semantic meaning (red=error, amber=warning, etc.)

---

*Content was rephrased for compliance with licensing restrictions. Original sources: [Vercel Geist Colors](https://vercel.com/geist/colors), [Vercel UI Documentation](https://vercel-ui-phi.vercel.app/docs/colors)*
