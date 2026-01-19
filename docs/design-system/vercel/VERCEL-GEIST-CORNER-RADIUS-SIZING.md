# Vercel Geist Design System: Corner Radius & Sizing Patterns

> Comprehensive reference for Vercel's border-radius scale, component sizing, and spacing system.
> Sources: [Vercel Geist Materials](https://vercel.com/geist/materials), [Vercel UI Components](https://vercel-ui-phi.vercel.app/docs/components), [Theme UI Geist Preset](https://theme-ui-preset-geist.vercel.app/)

---

## 1. Border Radius Scale

Vercel uses a **context-aware radius system** where corner radius increases with component elevation and size.

### Core Radius Values

| Token Name | Value | Usage |
|------------|-------|-------|
| `rounded-[4px]` | 4px | Tiny buttons, inline elements |
| `rounded-md` | 6px | Default for small/medium components |
| `rounded-lg` | 8px | Large buttons, inputs |
| `rounded-xl` | 12px | Cards, menus, modals |
| `rounded-2xl` | 16px | Fullscreen modals, large containers |
| `rounded-full` / `pill` | 9999px | Avatars, badges, pills |

### Material-Based Radius (Official Geist)

From [vercel.com/geist/materials](https://vercel.com/geist/materials):

#### Surface Elements (On the page)
| Material Class | Radius | Description |
|----------------|--------|-------------|
| `material-base` | **6px** | Everyday use, base level |
| `material-small` | **6px** | Slightly raised elements |
| `material-medium` | **12px** | Further raised elements |
| `material-large` | **12px** | Further raised elements |

#### Floating Elements (Above the page)
| Material Class | Radius | Description |
|----------------|--------|-------------|
| `material-tooltip` | **6px** | Lightest shadow, tooltips with triangular stem |
| `material-menu` | **12px** | Dropdown menus, lift from page |
| `material-modal` | **12px** | Modal dialogs, further lift |
| `material-fullscreen` | **16px** | Fullscreen modals, biggest lift |

### CSS Variables (Theme UI Geist)

```css
:root {
  --radius-default: 5px;
  --radius-small: 5px;
  --radius-large: 10px;
  --radius-pill: 9999px;
}
```

---

## 2. Component Sizing Patterns

### Button Sizes

From Vercel UI implementation:

| Size | Height | Padding | Border Radius | Font Size | Line Height |
|------|--------|---------|---------------|-----------|-------------|
| **tiny** | 24px (h-6) | 2px (px-0.5) | 4px | 12px (text-xs) | 16px |
| **small/sm** | 32px (h-8) | 6px (px-1.5) | 6px (rounded-md) | 14px (text-sm) | 20px |
| **medium/md** | 40px (h-10) | 10px (px-2.5) | 6px (rounded-md) | 14px (text-sm) | 20px |
| **large/lg** | 48px (h-12) | 14px (px-[14px]) | 8px (rounded-lg) | 16px (text-base) | 24px |

```typescript
// Vercel Button Variants (CVA)
const buttonVariants = cva({
  variants: {
    size: {
      tiny: "h-6 px-0.5 rounded-[4px] text-xs leading-4",
      sm: "h-8 px-1.5 rounded-md text-sm leading-5",
      small: "h-8 px-1.5 rounded-md text-sm leading-5",
      medium: "h-10 px-2.5 rounded-md text-sm leading-5",
      md: "h-10 px-2.5 rounded-md text-sm leading-5",
      large: "h-12 px-[14px] rounded-lg text-base leading-6",
      lg: "h-12 px-[14px] rounded-lg text-base leading-6",
    },
  },
  defaultVariants: {
    size: "medium",
  },
})
```

### Input Sizes

| Size | Height | Border Radius | Icon Size | Font Size |
|------|--------|---------------|-----------|-----------|
| **small** | 32px (h-8) | 6px (rounded-md) | 14px | 14px (text-sm) |
| **medium** | 40px (h-10) | 6px (rounded-md) | 16px | 14px (text-sm) |
| **large** | 48px (h-12) | 8px (rounded-lg) | 18px | 16px (text-base) |

```typescript
// Vercel Input Variants (CVA)
const inputVariants = cva({
  variants: {
    size: {
      small: "h-8 text-sm rounded-md [--icon-size:14px]",
      medium: "h-10 text-sm rounded-md [--icon-size:16px]",
      large: "h-12 text-base rounded-lg [--icon-size:18px]",
    },
  },
  defaultVariants: {
    size: "medium",
  },
})
```

### Modal Sizing

| Property | Value |
|----------|-------|
| Max Width | 540px |
| Border Radius | 12px (rounded-xl) |
| Body Padding | 24px (p-6) |
| Actions Padding | 16px (p-4) |
| Title Margin Bottom | 24px (mb-6) |

### Avatar Sizes

| Size | Dimensions |
|------|------------|
| **small** | 20px × 20px (1.25rem) |
| **default** | 30px × 30px (1.875rem) |
| **big** | 60px × 60px (3.75rem) |
| **huge** | 90px × 90px (5.625rem) |

---

## 3. Spacing System

### Base Spacing Scale

Vercel uses a **4pt base unit** spacing system:

| Index | Value | Tailwind Class |
|-------|-------|----------------|
| 0 | 0pt | `p-0`, `m-0` |
| 1 | 4pt | `p-1`, `m-1` |
| 2 | 8pt | `p-2`, `m-2` |
| 3 | 16pt | `p-4`, `m-4` |
| 4 | 24pt | `p-6`, `m-6` |
| 5 | 32pt | `p-8`, `m-8` |
| 6 | 48pt | `p-12`, `m-12` |

### Common Spacing Patterns

#### Component Internal Padding
| Component | Padding |
|-----------|---------|
| Button (text area) | 6px horizontal (px-1.5) |
| Input prefix/suffix | 12px horizontal (px-3) |
| Card | 16pt (p-3 in theme scale) |
| Modal body | 24px (p-6) |
| Modal actions | 16px (p-4) |

#### Gap Patterns
| Context | Gap Value |
|---------|-----------|
| Button icon gap | 2px (gap-0.5) |
| Modal body sections | 24px (space-y-6) |
| Form label to input | 8px (mb-2) |

---

## 4. Radius-Size Relationship

### Key Pattern: Radius Increases with Size

```
┌─────────────────────────────────────────────────────────────┐
│  Component Size    │  Border Radius  │  Elevation Level    │
├─────────────────────────────────────────────────────────────┤
│  Tiny (24px)       │  4px            │  Inline             │
│  Small (32px)      │  6px            │  Surface            │
│  Medium (40px)     │  6px            │  Surface            │
│  Large (48px)      │  8px            │  Raised             │
│  Card/Menu         │  12px           │  Floating           │
│  Modal             │  12px           │  Overlay            │
│  Fullscreen        │  16px           │  Maximum            │
├─────────────────────────────────────────────────────────────┤
│  Avatars/Badges    │  9999px (pill)  │  Any                │
└─────────────────────────────────────────────────────────────┘
```

### Nested Radius Formula

For nested elements, Vercel uses the **inner radius = outer radius - padding** principle:

```css
/* Example: Card with nested button */
.card {
  border-radius: 12px;
  padding: 16px;
}

.card .button {
  /* Inner radius should be: 12px - 16px = negative, so use minimum */
  border-radius: 6px; /* Use component's natural radius */
}
```

---

## 5. Shadow Scale (Complements Radius)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-default` | `0 4px 4px 0 rgba(0,0,0,0.02)` | Subtle depth |
| `shadow-dropdown` | `0 4px 4px 0 rgba(0,0,0,0.02)` | Dropdown menus |
| `shadow-small` | `0 5px 10px rgba(0,0,0,0.12)` | Cards on hover |
| `shadow-medium` | `0 8px 30px rgba(0,0,0,0.12)` | Elevated cards |
| `shadow-large` | `0 30px 60px rgba(0,0,0,0.12)` | Modals |
| `shadow-modal` | Custom | Modal-specific shadow |
| `shadow-input-ring` | Focus ring | Input focus state |

---

## 6. Typography Button Classes

From [vercel.com/geist/typography](https://vercel.com/geist/typography):

| Class | Usage |
|-------|-------|
| `text-button-16` | Largest button text |
| `text-button-14` | Default button text |
| `text-button-12` | Tiny button (inside input fields) |

---

## 7. Implementation Reference

### CSS Custom Properties

```css
:root {
  /* Radius tokens */
  --radius-xs: 4px;
  --radius-sm: 5px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
  
  /* Component heights */
  --height-tiny: 24px;
  --height-small: 32px;
  --height-medium: 40px;
  --height-large: 48px;
  
  /* Spacing scale */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
}
```

### Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        'geist-xs': '4px',
        'geist-sm': '5px',
        'geist-md': '6px',
        'geist-lg': '8px',
        'geist-xl': '12px',
        'geist-2xl': '16px',
      },
      height: {
        'btn-tiny': '24px',
        'btn-small': '32px',
        'btn-medium': '40px',
        'btn-large': '48px',
      },
    },
  },
}
```

---

## 8. Quick Reference Card

### Buttons
- **Tiny**: h-6 (24px), rounded-[4px], text-xs
- **Small**: h-8 (32px), rounded-md (6px), text-sm
- **Medium**: h-10 (40px), rounded-md (6px), text-sm ← DEFAULT
- **Large**: h-12 (48px), rounded-lg (8px), text-base

### Inputs
- **Small**: h-8 (32px), rounded-md (6px)
- **Medium**: h-10 (40px), rounded-md (6px) ← DEFAULT
- **Large**: h-12 (48px), rounded-lg (8px)

### Containers
- **Cards**: rounded-xl (12px), p-4 to p-6
- **Menus**: rounded-xl (12px)
- **Modals**: rounded-xl (12px), max-w-[540px]
- **Fullscreen**: rounded-2xl (16px)

### Special
- **Avatars/Badges**: rounded-full (9999px)
- **Tooltips**: rounded-md (6px)

---

*Content was rephrased for compliance with licensing restrictions. Sources: [Vercel Geist](https://vercel.com/geist), [Vercel UI](https://vercel-ui-phi.vercel.app)*
