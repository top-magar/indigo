# Vercel Design Patterns - Complete Reference

> Consolidated summary of Vercel's Geist Design System patterns for corner radius, sizing, colors, animations, and component styling.

---

## Quick Reference Card

### Border Radius Scale

| Size | Radius | Usage |
|------|--------|-------|
| `xs` | **4px** | Tiny buttons, inline elements |
| `sm` | **5-6px** | Small/medium buttons, inputs, tooltips |
| `md` | **6px** | Default components |
| `lg` | **8px** | Large buttons, large inputs |
| `xl` | **12px** | Cards, menus, modals |
| `2xl` | **16px** | Fullscreen modals |
| `full` | **9999px** | Avatars, badges, pills |

### Component Heights

| Size | Height | Radius | Font Size |
|------|--------|--------|-----------|
| **Tiny** | 24px | 4px | 12px |
| **Small** | 32px | 6px | 14px |
| **Medium** | 40px | 6px | 14px |
| **Large** | 48px | 8px | 16px |

### Spacing Scale (4px base)

```
0 → 4px → 8px → 12px → 16px → 20px → 24px → 32px → 48px → 64px
```

---

## Color System

### Gray Scale Usage

| Step | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| 100 | #FAFAFA | #171717 | Component backgrounds (default) |
| 200 | #EAEAEA | #1F1F1F | Component backgrounds (hover) |
| 300 | #E1E1E1 | #292929 | Component backgrounds (active) |
| 400 | #CACACA | #3D3D3D | Borders (default) |
| 500 | #B3B3B3 | #525252 | Borders (hover) |
| 600 | #8F8F8F | #6E6E6E | Borders (active), muted icons |
| 700 | #6E6E6E | #8F8F8F | Placeholder text, tertiary text |
| 800 | #4B4B4B | #B3B3B3 | Secondary text |
| 900 | #2E2E2E | #D4D4D4 | Body text |
| 1000 | #171717 | #EDEDED | Primary text, headings |

### Status Colors

| Status | Color | Token |
|--------|-------|-------|
| Success/Info | Blue | `--ds-blue-700` (#0070F3) |
| Error | Red | `--ds-red-700` (#E5484D) |
| Warning | Amber | `--ds-amber-700` (#F5A623) |
| Ready | Teal | `--ds-teal-600` |
| Success (alt) | Green | `--ds-green-700` (#17C964) |

### Background Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `background-100` | #FFFFFF | #0A0A0A | Primary page background |
| `background-200` | #FAFAFA | #111111 | Secondary/nested backgrounds |

---

## Animation Patterns

### Transition Durations

| Token | Duration | Usage |
|-------|----------|-------|
| `fast` | **100ms** | Micro-interactions, color changes |
| `normal` | **150ms** | **Primary** - hover, tabs, buttons |
| `moderate` | **200ms** | Dropdowns, tooltips |
| `slow` | **250ms** | Content transitions |
| `slower` | **300ms** | Complex animations |
| `modal` | **350ms** | Modal dialogs |

### Easing Functions

| Name | Value | Usage |
|------|-------|-------|
| `ease-out` | `ease-out` | Default for most transitions |
| `ease-out-cubic` | `cubic-bezier(0.33, 1, 0.68, 1)` | Smooth deceleration |
| `ease-in-out` | `ease-in-out` | Symmetric animations |

### Common Animations

```css
/* Button hover */
transform: translateY(-1px);
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);

/* Card hover */
transform: translateY(-2px);
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);

/* Modal enter */
animation: slideInFromTop 350ms ease-out;

/* Skeleton shimmer */
animation: shimmer 1.5s ease-in-out infinite;

/* Loading dots */
animation: loadingDotsBlink 1400ms infinite;
```

---

## Component Patterns

### Button Variants

| Variant | Background | Border | Text |
|---------|------------|--------|------|
| **Default** | `gray-1000` | transparent | `background-100` |
| **Secondary** | `background-100` | `gray-alpha-400` | `gray-1000` |
| **Tertiary** | transparent | transparent | `gray-1000` |
| **Error** | `red-800` | `red-800` | white |
| **Warning** | `amber-800` | `amber-800` | black |
| **Disabled** | `gray-100` | `gray-400` | `gray-700` |

### Input States

| State | Border | Background | Shadow |
|-------|--------|------------|--------|
| Default | `gray-alpha-400` | `background-100` | none |
| Hover | `gray-alpha-600` | `background-100` | none |
| Focus | `gray-alpha-600` | `background-100` | focus ring |
| Disabled | `gray-400` | `background-200` | none |
| Error | `red-700` | `background-100` | none |

### Shadow Scale

| Level | Shadow | Usage |
|-------|--------|-------|
| Small | `0 2px 4px rgba(0,0,0,0.05)` | Subtle elevation |
| Medium | `0 4px 8px rgba(0,0,0,0.08)` | Cards, dropdowns |
| Large | `0 8px 24px rgba(0,0,0,0.12)` | Modals, popovers |
| Tooltip | `0 4px 14px rgba(0,0,0,0.15)` | Tooltips |
| Menu | `0 8px 30px rgba(0,0,0,0.12)` | Dropdown menus |
| Modal | `0 16px 70px rgba(0,0,0,0.2)` | Modal dialogs |

---

## CSS Custom Properties

```css
:root {
  /* Border Radius */
  --radius-xs: 4px;
  --radius-sm: 5px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
  
  /* Component Heights */
  --height-tiny: 24px;
  --height-small: 32px;
  --height-medium: 40px;
  --height-large: 48px;
  
  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-normal: 150ms ease-out;
  --transition-slow: 200ms ease-out;
  --transition-modal: 350ms ease-out;
  
  /* Focus Ring */
  --focus-ring: 0 0 0 2px var(--ds-background-100), 
                0 0 0 4px var(--ds-blue-700);
}
```

---

## Tailwind CSS Mappings

### Border Radius
```
rounded-[4px] → xs (tiny buttons)
rounded-md    → 6px (default)
rounded-lg    → 8px (large)
rounded-xl    → 12px (cards, modals)
rounded-2xl   → 16px (fullscreen)
rounded-full  → pill (avatars, badges)
```

### Heights
```
h-6  → 24px (tiny)
h-8  → 32px (small)
h-10 → 40px (medium)
h-12 → 48px (large)
```

### Transitions
```
duration-100 → fast
duration-150 → normal (default)
duration-200 → moderate
duration-300 → slower
duration-350 → modal
```

---

## Key Design Principles

1. **Radius increases with elevation** - Higher elements get larger radius
2. **150ms is the magic number** - Primary transition duration
3. **4px spacing base** - All spacing is multiples of 4
4. **Gray-alpha for borders** - Use alpha transparency for borders
5. **1-2-3 state pattern** - Default → Hover → Active using color steps
6. **Semantic color usage** - Blue=info, Red=error, Amber=warning
7. **Consistent heights** - 24/32/40/48px for all interactive elements

---

## Related Documentation

- [Corner Radius & Sizing](./VERCEL-GEIST-CORNER-RADIUS-SIZING.md)
- [Component Styling](./VERCEL-GEIST-COMPONENT-STYLING.md)
- [Color Usage Patterns](./VERCEL-COLOR-USAGE-PATTERNS.md)
- [Animation Patterns](./VERCEL-ANIMATION-PATTERNS.md)
- [Geist Design System](./VERCEL-GEIST-DESIGN-SYSTEM.md)
- [Geist Integration Guide](./GEIST-INTEGRATION-GUIDE.md)

---

*Compiled from Vercel Geist Design System documentation and community implementations*
