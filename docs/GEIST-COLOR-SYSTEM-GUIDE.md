# Geist Color System - Complete Guide

> How the Vercel Geist color system works across your application
> Source: [vercel.com/geist/colors](https://vercel.com/geist/colors)

---

## Table of Contents

1. [Core Concept: The 10-Step Scale](#core-concept-the-10-step-scale)
2. [Color Scale Purpose Map](#color-scale-purpose-map)
3. [Background Colors](#background-colors)
4. [Component State Pattern (1-2-3)](#component-state-pattern-1-2-3)
5. [Border Colors (4-5-6)](#border-colors-4-5-6)
6. [High Contrast Backgrounds (7-8)](#high-contrast-backgrounds-7-8)
7. [Text & Icons (9-10)](#text--icons-9-10)
8. [Available Color Scales](#available-color-scales)
9. [Practical Examples](#practical-examples)
10. [Dark Mode Behavior](#dark-mode-behavior)
11. [CSS Token Reference](#css-token-reference)

---

## Core Concept: The 10-Step Scale

Geist uses a **10-step color scale** (100-1000) where each step has a specific purpose. This isn't arbitrary—each range serves a distinct UI function:

```
┌─────────────────────────────────────────────────────────────────┐
│  100-300  │  Component Backgrounds (default → hover → active)   │
├───────────┼─────────────────────────────────────────────────────┤
│  400-600  │  Borders (default → hover → active)                 │
├───────────┼─────────────────────────────────────────────────────┤
│  700-800  │  High Contrast Backgrounds (solid buttons, badges)  │
├───────────┼─────────────────────────────────────────────────────┤
│  900-1000 │  Text & Icons (secondary → primary)                 │
└───────────┴─────────────────────────────────────────────────────┘
```

---

## Color Scale Purpose Map

| Steps | Purpose | Example Usage |
|-------|---------|---------------|
| **100** | Component background (default) | Button resting state, card background |
| **200** | Component background (hover) | Button hover state |
| **300** | Component background (active) | Button pressed state |
| **400** | Border (default) | Input borders, dividers |
| **500** | Border (hover) | Input focus border |
| **600** | Border (active) | Strong emphasis borders |
| **700** | Solid background (primary) | Primary buttons, badges |
| **800** | Solid background (hover) | Primary button hover |
| **900** | Text (secondary) | Body text, descriptions |
| **1000** | Text (primary) | Headings, important text |

---

## Background Colors

Geist provides two background levels for page/element backgrounds:

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--ds-background-100` | `#FFFFFF` | `#0A0A0A` | **Primary** - Default page background |
| `--ds-background-200` | `#FAFAFA` | `#111111` | **Secondary** - Subtle differentiation |

### When to Use Each

```
Background 100 (Primary):
├── Page backgrounds
├── Card backgrounds
├── Modal backgrounds
├── Input backgrounds
└── Most UI surfaces

Background 200 (Secondary):
├── Sidebar backgrounds
├── Nested card backgrounds
├── Input prefix/suffix areas
├── Table header backgrounds
└── Subtle section differentiation
```

### Code Example

```tsx
// Primary background (default)
<div className="bg-[var(--ds-background-100)]">
  Main content area
</div>

// Secondary background (subtle)
<aside className="bg-[var(--ds-background-200)]">
  Sidebar content
</aside>
```

---

## Component State Pattern (1-2-3)

The first three steps (100-300) create a consistent state transition pattern:

```css
/* The 1-2-3 Pattern */
.component {
  background: var(--ds-gray-100);      /* 1: Default state */
}
.component:hover {
  background: var(--ds-gray-200);      /* 2: Hover state */
}
.component:active {
  background: var(--ds-gray-300);      /* 3: Active/pressed state */
}
```

### Visual Representation

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Default (100)  →  Hover (200)  →  Active (300)            │
│   ┌─────────┐       ┌─────────┐      ┌─────────┐            │
│   │ #FAFAFA │  →    │ #EAEAEA │  →   │ #E1E1E1 │            │
│   └─────────┘       └─────────┘      └─────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Practical Component Example

```tsx
// Button with 1-2-3 state pattern
const SecondaryButton = () => (
  <button className="
    bg-[var(--ds-gray-100)]
    hover:bg-[var(--ds-gray-200)]
    active:bg-[var(--ds-gray-300)]
    transition-colors duration-150
  ">
    Click me
  </button>
);

// List item with 1-2-3 pattern
const ListItem = () => (
  <li className="
    bg-[var(--ds-gray-100)]
    hover:bg-[var(--ds-gray-200)]
    active:bg-[var(--ds-gray-300)]
    cursor-pointer
  ">
    List item content
  </li>
);
```

### Alpha Transparency Variant

For overlays and subtle backgrounds, use the alpha scale:

```css
.overlay-component {
  background: var(--ds-gray-alpha-100);      /* Default */
}
.overlay-component:hover {
  background: var(--ds-gray-alpha-200);      /* Hover */
}
.overlay-component:active {
  background: var(--ds-gray-alpha-300);      /* Active */
}
```

---

## Border Colors (4-5-6)

Steps 400-600 are designed for borders with state transitions:

| Step | Purpose | Light Mode | Dark Mode |
|------|---------|------------|-----------|
| **400** | Default border | `#CACACA` | `#3D3D3D` |
| **500** | Hover border | `#B3B3B3` | `#525252` |
| **600** | Active/focus border | `#8F8F8F` | `#6E6E6E` |

### Border Implementation

```css
/* Standard border pattern */
.input {
  border: 1px solid var(--ds-gray-400);
}
.input:hover {
  border-color: var(--ds-gray-500);
}
.input:focus {
  border-color: var(--ds-gray-600);
}

/* Shadow-based border (preferred for consistency) */
.card {
  box-shadow: 0 0 0 1px var(--ds-gray-alpha-400);
}
```

### Why Use Alpha for Borders?

Alpha transparency borders adapt better to different backgrounds:

```css
/* Recommended: Alpha borders */
border: 1px solid var(--ds-gray-alpha-400);

/* This works on any background color */
```

---

## High Contrast Backgrounds (7-8)

Steps 700-800 are for solid, high-contrast backgrounds:

| Step | Purpose | Usage |
|------|---------|-------|
| **700** | Primary solid background | Primary buttons, solid badges |
| **800** | Hover state for solid backgrounds | Primary button hover |

### Example: Primary Button

```tsx
const PrimaryButton = () => (
  <button className="
    bg-[var(--ds-blue-700)]
    hover:bg-[var(--ds-blue-800)]
    text-white
    transition-colors duration-150
  ">
    Primary Action
  </button>
);
```

### Status Badges

```tsx
// Solid badge (high contrast)
<span className="bg-[var(--ds-green-700)] text-white">
  Success
</span>

// Subtle badge (low contrast)
<span className="bg-[var(--ds-green-200)] text-[var(--ds-green-900)]">
  Success
</span>
```

---

## Text & Icons (9-10)

Steps 900-1000 are reserved for text and icons:

| Step | Purpose | Usage |
|------|---------|-------|
| **900** | Secondary text | Body text, descriptions, labels |
| **1000** | Primary text | Headings, important text, icons |

### Text Hierarchy

```tsx
// Primary text (headings, important)
<h1 className="text-[var(--ds-gray-1000)]">
  Main Heading
</h1>

// Secondary text (body, descriptions)
<p className="text-[var(--ds-gray-900)]">
  This is body text with secondary emphasis.
</p>

// Tertiary text (muted, placeholders)
<span className="text-[var(--ds-gray-700)]">
  Placeholder text
</span>

// Disabled text
<span className="text-[var(--ds-gray-500)]">
  Disabled state
</span>
```

### Complete Text Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  Text Level      │  Token           │  Usage               │
├──────────────────┼──────────────────┼──────────────────────┤
│  Primary         │  gray-1000       │  Headings, titles    │
│  Secondary       │  gray-900        │  Body text           │
│  Tertiary        │  gray-700        │  Muted text          │
│  Placeholder     │  gray-600        │  Input placeholders  │
│  Disabled        │  gray-500        │  Disabled states     │
└──────────────────┴──────────────────┴──────────────────────┘
```

---

## Available Color Scales

Geist provides 8 color scales, each with 10 steps:

| Scale | Primary Use | Key Token |
|-------|-------------|-----------|
| **Gray** | Neutral UI, text, borders | `--ds-gray-*` |
| **Gray Alpha** | Transparent overlays | `--ds-gray-alpha-*` |
| **Blue** | Primary actions, links, info | `--ds-blue-*` |
| **Red** | Errors, destructive actions | `--ds-red-*` |
| **Amber** | Warnings, caution | `--ds-amber-*` |
| **Green** | Success, positive states | `--ds-green-*` |
| **Purple** | Special features, accents | `--ds-purple-*` |
| **Pink** | Accent colors, highlights | `--ds-pink-*` |
| **Teal** | Ready states, informational | `--ds-teal-*` |

### Status Color Mapping

```tsx
const STATUS_COLORS = {
  success: 'var(--ds-green-700)',
  error: 'var(--ds-red-700)',
  warning: 'var(--ds-amber-700)',
  info: 'var(--ds-blue-700)',
  ready: 'var(--ds-teal-600)',
};
```

---

## Practical Examples

### Card Component

```tsx
const Card = ({ children }) => (
  <div className="
    bg-[var(--ds-background-100)]
    border border-[var(--ds-gray-alpha-400)]
    rounded-xl
    shadow-[var(--shadow-geist-small)]
  ">
    {children}
  </div>
);
```

### Input Component

```tsx
const Input = () => (
  <input className="
    bg-[var(--ds-background-100)]
    border border-[var(--ds-gray-alpha-400)]
    hover:border-[var(--ds-gray-500)]
    focus:border-[var(--ds-gray-600)]
    focus:ring-2 focus:ring-[var(--ds-blue-700)]/20
    text-[var(--ds-gray-1000)]
    placeholder:text-[var(--ds-gray-600)]
    rounded-md
    transition-colors duration-150
  " />
);
```

### Button Variants

```tsx
// Primary Button
<button className="
  bg-[var(--ds-gray-1000)]
  hover:bg-[var(--ds-gray-900)]
  text-[var(--ds-background-100)]
">
  Primary
</button>

// Secondary Button
<button className="
  bg-[var(--ds-background-100)]
  hover:bg-[var(--ds-gray-100)]
  border border-[var(--ds-gray-alpha-400)]
  text-[var(--ds-gray-1000)]
">
  Secondary
</button>

// Destructive Button
<button className="
  bg-[var(--ds-red-700)]
  hover:bg-[var(--ds-red-800)]
  text-white
">
  Delete
</button>
```

### Badge Variants

```tsx
// Solid badges (high contrast)
<Badge className="bg-[var(--ds-blue-700)] text-white">Info</Badge>
<Badge className="bg-[var(--ds-green-700)] text-white">Success</Badge>
<Badge className="bg-[var(--ds-red-700)] text-white">Error</Badge>
<Badge className="bg-[var(--ds-amber-700)] text-black">Warning</Badge>

// Subtle badges (low contrast)
<Badge className="bg-[var(--ds-blue-200)] text-[var(--ds-blue-900)]">Info</Badge>
<Badge className="bg-[var(--ds-green-200)] text-[var(--ds-green-900)]">Success</Badge>
<Badge className="bg-[var(--ds-red-200)] text-[var(--ds-red-900)]">Error</Badge>
<Badge className="bg-[var(--ds-amber-200)] text-[var(--ds-amber-900)]">Warning</Badge>
```

---

## Dark Mode Behavior

Geist uses **semantic inversion** for dark mode. The scale numbers stay the same, but the actual colors flip:

### Light vs Dark Mode Comparison

```
Light Mode:
  gray-100 = #FAFAFA (very light)
  gray-1000 = #171717 (very dark)

Dark Mode:
  gray-100 = #171717 (very dark)
  gray-1000 = #EDEDED (very light)
```

### Why This Works

Your code stays the same—the CSS variables handle the inversion:

```tsx
// This works in BOTH light and dark mode
<div className="
  bg-[var(--ds-background-100)]
  text-[var(--ds-gray-1000)]
  border-[var(--ds-gray-alpha-400)]
">
  Content adapts automatically
</div>
```

### Dark Mode Adjustments

Some elements need different treatment in dark mode:

```css
/* Shadows are darker in dark mode */
.dark {
  --shadow-geist-small: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-geist-medium: 0 4px 8px rgba(0, 0, 0, 0.4);
}

/* Alpha borders use white instead of black */
.dark {
  --ds-gray-alpha-400: rgba(255, 255, 255, 0.12);
}
```

---

## CSS Token Reference

### Quick Reference Table

| Purpose | Token | Light | Dark |
|---------|-------|-------|------|
| Page background | `--ds-background-100` | #FFFFFF | #0A0A0A |
| Secondary background | `--ds-background-200` | #FAFAFA | #111111 |
| Component default | `--ds-gray-100` | #FAFAFA | #171717 |
| Component hover | `--ds-gray-200` | #EAEAEA | #1F1F1F |
| Component active | `--ds-gray-300` | #E1E1E1 | #292929 |
| Border default | `--ds-gray-400` | #CACACA | #3D3D3D |
| Border hover | `--ds-gray-500` | #B3B3B3 | #525252 |
| Border active | `--ds-gray-600` | #8F8F8F | #6E6E6E |
| Muted text | `--ds-gray-700` | #6E6E6E | #8F8F8F |
| Secondary text | `--ds-gray-900` | #2E2E2E | #D4D4D4 |
| Primary text | `--ds-gray-1000` | #171717 | #EDEDED |
| Primary action | `--ds-blue-700` | #0070F3 | #0070F3 |
| Error | `--ds-red-700` | #E5484D | #E5484D |
| Warning | `--ds-amber-700` | #F5A623 | #F5A623 |
| Success | `--ds-green-700` | #17C964 | #17C964 |

### Semantic Aliases (in globals.css)

```css
:root {
  --foreground-primary: var(--ds-gray-1000);
  --foreground-secondary: var(--ds-gray-700);
  --foreground-tertiary: var(--ds-gray-600);
  --foreground-muted: var(--ds-gray-500);
  
  --border-default: var(--ds-gray-200);
  --border-subtle: var(--ds-gray-100);
  --border-strong: var(--ds-gray-400);
  
  --status-success: var(--ds-green-700);
  --status-warning: var(--ds-amber-700);
  --status-error: var(--ds-red-700);
  --status-info: var(--ds-blue-700);
}
```

---

## Summary: The Mental Model

1. **Steps 100-300**: Component backgrounds with state transitions
2. **Steps 400-600**: Borders with state transitions
3. **Steps 700-800**: High-contrast solid backgrounds
4. **Steps 900-1000**: Text and icons

**The 1-2-3 Pattern**: Default → Hover → Active using consecutive steps

**Dark Mode**: Same tokens, inverted values—your code stays the same

**Alpha Colors**: Use for borders and overlays that need to work on any background

---

## Related Documentation

- [Geist Tokens](../src/styles/geist-tokens.css) - CSS custom properties
- [Color Usage Patterns](./VERCEL-COLOR-USAGE-PATTERNS.md) - Detailed patterns
- [Design Patterns Summary](./VERCEL-DESIGN-PATTERNS-SUMMARY.md) - Quick reference
- [Geist Integration Guide](./GEIST-INTEGRATION-GUIDE.md) - Component implementation

---

*Based on official Vercel Geist Design System documentation at vercel.com/geist/colors*
