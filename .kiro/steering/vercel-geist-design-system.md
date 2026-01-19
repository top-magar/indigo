---
inclusion: always
---

# Vercel/Geist Design System Guide (OKLCH)

This steering file enforces Vercel's design patterns using OKLCH color space for perceptually uniform colors.

---

## Core Principles

1. **Minimalism** - Remove visual noise, let content breathe
2. **Consistency** - Same patterns everywhere
3. **Hierarchy** - Clear visual importance through size, weight, color
4. **Precision** - Exact spacing, no arbitrary values
5. **Perceptual Uniformity** - OKLCH ensures colors look equally bright across hues

---

## Why Not 60-30-10? The 4-Layer Product Design Approach

The classic 60-30-10 rule works for landing pages but fails for product design. Vercel is ~90% black, 8% white, 2% accent. Product UIs need more nuance.

### The Problem with 60-30-10
- Too simplistic for complex dashboards
- Doesn't account for interactive states
- Ignores semantic meaning (errors, success, warnings)
- No guidance for dark mode adaptation

### The 4-Layer Solution

**Layer 1: Neutral Foundation** → Backgrounds, borders, text
**Layer 2: Functional Accent** → Brand color as a scale
**Layer 3: Semantic Colors** → Success, error, warning, info
**Layer 4: Theming** → OKLCH-based color transformation

---

## Layer 1: Neutral Foundation

Product design needs ~4 background layers, 2 stroke variants, and 3 text variants minimum.

### Background Layers (Light Mode)

| Layer | OKLCH Lightness | Use Case | Example |
|-------|-----------------|----------|---------|
| Frame/Sidebar | 0.96-0.98 | App shell, navigation | `--ds-gray-100` |
| Page Background | 0.98-1.0 | Main content area | `--ds-background` |
| Card (elevated) | 1.0 | Cards on darker bg | Pure white |
| Card (recessed) | 0.96-0.98 | Cards on lighter bg | `--ds-gray-100` |

**Key Insight**: Light mode is flexible—you can have:
- Dark background + lighter cards (Vercel style)
- Light background + darker cards (Notion style)
- Monochromatic layers (Supabase style)

```tsx
// Vercel-style: darker bg, lighter cards
<div className="bg-[var(--ds-gray-100)]">
  <Card className="bg-white" />
</div>

// Notion-style: lighter bg, darker cards
<div className="bg-white">
  <Card className="bg-[var(--ds-gray-100)]" />
</div>
```

### Border Colors

**Never use pure black borders.** Use ~85% white (L: 0.85) to define edges without overpowering.

```tsx
// ✅ Correct - subtle definition
border-[var(--ds-gray-200)]  // L: ~0.90
border-[var(--ds-gray-300)]  // L: ~0.85

// ❌ Wrong - too harsh
border-black
border-gray-900
```

### Text Hierarchy (Light Mode)

| Role | OKLCH Lightness | Variable | Description |
|------|-----------------|----------|-------------|
| Headings | 0.11 | `--ds-gray-1000` | Darkest, reserved for important headings |
| Body | 0.15-0.20 | `--ds-gray-800` | Majority of text |
| Secondary | 0.30-0.40 | `--ds-gray-600` | Subtext, captions |
| Placeholder | 0.50 | `--ds-gray-500` | Input placeholders |

### Button Importance Scale

**Rule: The more important a button, the darker it is.**

```tsx
// Ghost (least important) → L: ~0.95
<Button variant="ghost" className="hover:bg-[var(--ds-gray-100)]">

// Secondary → L: ~0.90-0.95
<Button variant="outline" className="border-[var(--ds-gray-300)]">

// Primary (most important) → L: ~0.11
<Button className="bg-[var(--ds-gray-1000)] text-white">
```

---

## Layer 2: Functional Accent (Brand Color)

Don't think of brand color as a single color—think of it as a **scale from lightest to darkest**.

### Brand Color Scale Usage

| Scale | Light Mode Use | Dark Mode Use |
|-------|----------------|---------------|
| 100-200 | Subtle backgrounds | Rarely used |
| 300-400 | Links, light accents | Primary color |
| 500-600 | **Main brand color** | Hover states |
| 700 | Hover states | Rarely used |
| 800-900 | Text on light bg | Text on dark bg |

```tsx
// Light mode
<Button className="bg-[var(--ds-brand-600)] hover:bg-[var(--ds-brand-700)]">
<a className="text-[var(--ds-brand-500)]">

// Dark mode
<Button className="bg-[var(--ds-brand-400)] hover:bg-[var(--ds-brand-500)]">
<a className="text-[var(--ds-brand-300)]">
```

### Generating Brand Scales with OKLCH

```css
:root {
  --ds-brand-hue: 240; /* Blue */
  
  /* Light mode scale */
  --ds-brand-100: oklch(0.97 0.02 var(--ds-brand-hue));
  --ds-brand-200: oklch(0.93 0.04 var(--ds-brand-hue));
  --ds-brand-300: oklch(0.85 0.08 var(--ds-brand-hue));
  --ds-brand-400: oklch(0.75 0.12 var(--ds-brand-hue));
  --ds-brand-500: oklch(0.65 0.15 var(--ds-brand-hue));
  --ds-brand-600: oklch(0.55 0.15 var(--ds-brand-hue));
  --ds-brand-700: oklch(0.45 0.14 var(--ds-brand-hue));
  --ds-brand-800: oklch(0.35 0.12 var(--ds-brand-hue));
  --ds-brand-900: oklch(0.25 0.10 var(--ds-brand-hue));
}
```

---

## Layer 3: Semantic Colors

Semantic colors **must break the neutral system** to convey meaning. Even Vercel (black/white brand) uses colored status indicators.

### Semantic Color Rules

| Semantic | Color | Use Case | Never Change |
|----------|-------|----------|--------------|
| Success | Green | Completed, active, positive | ✅ |
| Error | Red | Failed, destructive, invalid | ✅ |
| Warning | Amber | Caution, pending, attention | ✅ |
| Info | Blue | Informational, neutral status | ✅ |

**Design sin**: Making destructive actions anything other than red.

```tsx
// Destructive actions MUST be red
<Button variant="destructive" className="bg-[var(--ds-red-600)]">
  Delete
</Button>

// Success states MUST be green
<Badge className="bg-[var(--ds-green-100)] text-[var(--ds-green-800)]">
  Active
</Badge>
```

### Chart Colors (OKLCH Perceptual Uniformity)

Problem: Bright green looks more "neon" than bright blue in RGB/HSL.
Solution: OKLCH with consistent lightness and chroma.

```css
/* All chart colors: L=0.65, C=0.15, increment H by 25-30 */
--ds-chart-red:    oklch(0.65 0.20 25);
--ds-chart-orange: oklch(0.65 0.15 55);
--ds-chart-amber:  oklch(0.65 0.15 85);
--ds-chart-yellow: oklch(0.65 0.15 100);
--ds-chart-lime:   oklch(0.65 0.15 130);
--ds-chart-green:  oklch(0.65 0.15 155);
--ds-chart-teal:   oklch(0.65 0.12 180);
--ds-chart-cyan:   oklch(0.65 0.12 200);
--ds-chart-blue:   oklch(0.65 0.15 240);
--ds-chart-indigo: oklch(0.65 0.15 270);
--ds-chart-purple: oklch(0.65 0.15 300);
--ds-chart-pink:   oklch(0.65 0.15 330);
```

---

## Layer 4: Theming with OKLCH

Transform any neutral design into a themed version using this formula:

### The OKLCH Theming Formula

For every neutral color:
1. **Lightness**: Decrease by 0.03
2. **Chroma**: Increase by 0.02
3. **Hue**: Set to your theme hue

```tsx
// Original neutral
oklch(0.98 0 0)  // Pure gray background

// Themed to blue (hue: 240)
oklch(0.95 0.02 240)  // Subtle blue tint

// Themed to green (hue: 145)
oklch(0.95 0.02 145)  // Subtle green tint

// Themed to purple (hue: 300)
oklch(0.95 0.02 300)  // Subtle purple tint
```

### CSS Implementation

```css
:root {
  --theme-hue: 240; /* Change this to theme everything */
  
  /* Themed neutrals */
  --ds-themed-bg: oklch(0.95 0.02 var(--theme-hue));
  --ds-themed-card: oklch(0.98 0.01 var(--theme-hue));
  --ds-themed-border: oklch(0.85 0.03 var(--theme-hue));
}
```

---

## Dark Mode: The "Double the Distance" Rule

Dark colors look more similar than light colors. If you just invert your light palette, backgrounds lose distinction.

### The Rule

**Light mode**: 2% lightness between layers
**Dark mode**: 4-6% lightness between layers

### Dark Mode Background Layers

| Layer | Light Mode L | Dark Mode L | Distance |
|-------|--------------|-------------|----------|
| Base | 0.98 | 0.12 | - |
| Elevated 1 | 0.96 | 0.18 | +6% |
| Elevated 2 | 0.94 | 0.24 | +6% |
| Elevated 3 | 0.92 | 0.30 | +6% |

### Dark Mode Rules

1. **Surfaces get lighter as they elevate** (opposite of light mode)
2. **Use 300-400 range for brand colors** (not 500-600)
3. **Brighten borders** (they need more contrast)
4. **Dim text slightly** (pure white is harsh)

```css
.dark {
  /* Backgrounds get LIGHTER as they elevate */
  --ds-background: oklch(0.12 0 0);
  --ds-card: oklch(0.18 0 0);
  --ds-popover: oklch(0.24 0 0);
  
  /* Borders need more contrast */
  --ds-border: oklch(0.30 0 0);
  
  /* Text is dimmed */
  --ds-foreground: oklch(0.93 0 0);
  
  /* Brand shifts to lighter range */
  --ds-brand-primary: var(--ds-brand-400);
  --ds-brand-hover: var(--ds-brand-500);
}
```

### Dark Mode Theming

The OKLCH theming formula works even better in dark mode:

```css
.dark {
  --theme-hue: 240;
  
  /* Themed dark backgrounds */
  --ds-themed-bg: oklch(0.12 0.02 var(--theme-hue));
  --ds-themed-card: oklch(0.18 0.03 var(--theme-hue));
  --ds-themed-border: oklch(0.30 0.04 var(--theme-hue));
}
```

---

## OKLCH Color System

All colors use OKLCH format: `oklch(lightness chroma hue)`
- **Lightness**: 0-1 (0 = black, 1 = white)
- **Chroma**: 0-0.4 (0 = gray, higher = more saturated)
- **Hue**: 0-360 (color wheel degrees)

### Benefits of OKLCH
- Same lightness = same perceived brightness across all hues
- Better dark mode with "double the distance" rule
- Easy theming by adjusting hue while maintaining brightness
- Perceptually uniform chart colors

---

## Color Hierarchy (100-1000 Scale)

Use Geist CSS variables for all colors:

```
--ds-gray-100   → Subtle backgrounds, hover states
--ds-gray-200   → Selected states, light borders
--ds-gray-300   → Borders, dividers
--ds-gray-400   → Disabled states
--ds-gray-500   → Placeholder text
--ds-gray-600   → Secondary text, icons
--ds-gray-700   → Links, interactive elements
--ds-gray-800   → Body text
--ds-gray-900   → Headings
--ds-gray-1000  → Maximum emphasis
```

### Text Hierarchy
```tsx
// Page title
<h1 className="text-2xl font-semibold text-[var(--ds-gray-1000)]">

// Section heading
<h2 className="text-lg font-medium text-[var(--ds-gray-900)]">

// Card title
<h3 className="text-sm font-medium text-[var(--ds-gray-900)]">

// Body text
<p className="text-sm text-[var(--ds-gray-800)]">

// Secondary/helper text
<span className="text-sm text-[var(--ds-gray-600)]">

// Muted/placeholder
<span className="text-sm text-[var(--ds-gray-500)]">
```

### Status Colors
```tsx
// Success
bg-[var(--ds-green-100)] text-[var(--ds-green-900)]  // Subtle
bg-[var(--ds-green-700)] text-white                   // Solid

// Warning
bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)]  // Subtle
bg-[var(--ds-amber-700)] text-white                   // Solid

// Error
bg-[var(--ds-red-100)] text-[var(--ds-red-900)]      // Subtle
bg-[var(--ds-red-700)] text-white                     // Solid

// Info
bg-[var(--ds-blue-100)] text-[var(--ds-blue-900)]    // Subtle
bg-[var(--ds-blue-700)] text-white                    // Solid
```

### Chart Colors (Perceptually Uniform)
```tsx
// All chart colors have the same perceived brightness
--ds-chart-red      // oklch(0.65 0.20 25)
--ds-chart-orange   // oklch(0.65 0.15 55)
--ds-chart-amber    // oklch(0.65 0.15 85)
--ds-chart-yellow   // oklch(0.65 0.15 100)
--ds-chart-lime     // oklch(0.65 0.15 130)
--ds-chart-green    // oklch(0.65 0.15 155)
--ds-chart-teal     // oklch(0.65 0.12 180)
--ds-chart-cyan     // oklch(0.65 0.12 200)
--ds-chart-blue     // oklch(0.65 0.15 240)
--ds-chart-indigo   // oklch(0.65 0.15 270)
--ds-chart-purple   // oklch(0.65 0.15 300)
--ds-chart-pink     // oklch(0.65 0.15 330)
```

### Theming with Brand Colors
```tsx
// Change --ds-brand-hue to theme the accent color
:root {
  --ds-brand-hue: 240; // Blue (default)
  // --ds-brand-hue: 145; // Green
  // --ds-brand-hue: 300; // Purple
  // --ds-brand-hue: 25;  // Red
}

// Use brand colors
bg-[var(--ds-brand-700)]  // Primary brand
bg-[var(--ds-brand-100)]  // Subtle brand background
```

---

## Sizing Scale (sm, md, lg)

### Component Heights
| Size | Height | Tailwind | Use Case |
|------|--------|----------|----------|
| sm | 32px | h-8 | Dense UIs, table actions, secondary |
| md | 40px | h-10 | Default buttons, inputs |
| lg | 48px | h-12 | Primary CTAs, hero sections |

### Button Sizes
```tsx
// Small - dense UIs
<Button size="sm" className="h-8 px-3 text-sm rounded-md">

// Medium - default
<Button size="md" className="h-10 px-4 text-sm rounded-md">

// Large - primary CTAs
<Button size="lg" className="h-12 px-6 text-base rounded-md">
```

### Input Sizes
```tsx
<Input className="h-8" />   // sm
<Input className="h-10" />  // md (default)
<Input className="h-12" />  // lg
```

### Icon Sizes
```tsx
// In buttons/inputs
<Icon className="h-4 w-4" />  // 16px - default
<Icon className="h-3.5 w-3.5" />  // 14px - small buttons
<Icon className="h-5 w-5" />  // 20px - large buttons

// Standalone
<Icon className="h-4 w-4" />  // inline with text
<Icon className="h-5 w-5" />  // section icons
<Icon className="h-6 w-6" />  // feature icons
```

---

## Spacing Scale (4px base)

### Standard Spacing Values
| Token | Value | Use Case |
|-------|-------|----------|
| 1 | 4px | Icon gaps, tight spacing |
| 1.5 | 6px | Compact elements |
| 2 | 8px | Inline gaps, small padding |
| 3 | 12px | Default component padding |
| 4 | 16px | Card padding, section gaps |
| 6 | 24px | Large card padding |
| 8 | 32px | Section spacing |
| 12 | 48px | Page sections |
| 16 | 64px | Major page breaks |

### Layout Patterns
```tsx
// Page layout
<main className="p-6 lg:p-8">

// Section spacing
<div className="space-y-6">

// Card padding
<Card className="p-4">        // Compact
<Card className="p-6">        // Default

// Content gaps
<div className="space-y-3">   // Tight
<div className="space-y-4">   // Default

// Inline elements
<div className="flex gap-2">  // Default
<div className="flex gap-1.5"> // Compact
```

### Vercel-Specific Patterns
```tsx
// Header height
<header className="h-14 lg:h-16">

// Sidebar width
<aside className="w-64">

// Content max-width
<div className="max-w-5xl mx-auto">

// Table row height
<tr className="h-12">

// List item padding
<li className="px-3 py-2">
```

---

## Corner Radius Scale

| Token | Value | Tailwind | Use Case |
|-------|-------|----------|----------|
| sm | 4px | rounded-sm | Badges, tags, chips |
| md | 6px | rounded-md | Buttons, inputs, selects |
| lg | 8px | rounded-lg | Cards, dropdowns |
| xl | 12px | rounded-xl | Dialogs, large panels |
| 2xl | 16px | rounded-2xl | Hero cards |
| full | 9999px | rounded-full | Avatars, pills |

### Component Radius Rules
```tsx
// Small elements
<Badge className="rounded-sm" />
<Tag className="rounded-sm" />

// Interactive elements (ALWAYS rounded-md)
<Button className="rounded-md" />
<Input className="rounded-md" />
<Select className="rounded-md" />

// Containers
<Card className="rounded-lg" />
<DropdownMenu className="rounded-lg" />

// Large surfaces
<Dialog className="rounded-xl" />
<Sheet className="rounded-xl" />

// Circular
<Avatar className="rounded-full" />
```

---

## Typography

### Font Weights
```
font-normal (400)  → Body text
font-medium (500)  → Labels, buttons, nav items
font-semibold (600) → Headings, emphasis
font-bold (700)    → Rarely used, only for strong emphasis
```

### Font Sizes
```
text-xs (12px)   → Badges, timestamps, helper text
text-sm (14px)   → Default body, buttons, inputs
text-base (16px) → Large buttons, important text
text-lg (18px)   → Section headings
text-xl (20px)   → Page subheadings
text-2xl (24px)  → Page titles
text-3xl (30px)  → Hero headings
```

### Line Heights
```
leading-none (1)      → Single-line elements
leading-tight (1.25)  → Headings
leading-snug (1.375)  → Compact text
leading-normal (1.5)  → Body text (default)
leading-relaxed (1.625) → Long-form content
```

---

## Borders

### Border Colors
```tsx
border-[var(--ds-gray-200)]  // Default, subtle
border-[var(--ds-gray-300)]  // Emphasized
border-[var(--ds-gray-400)]  // Strong
```

### Border Patterns
```tsx
// Card border
<Card className="border border-[var(--ds-gray-200)]">

// Divider
<div className="border-t border-[var(--ds-gray-200)]" />

// Input border
<Input className="border border-[var(--ds-gray-300)] focus:border-[var(--ds-gray-900)]">

// Table border
<Table className="border border-[var(--ds-gray-200)] divide-y divide-[var(--ds-gray-200)]">
```

---

## Shadows

Vercel uses minimal shadows:

```tsx
// Subtle elevation
shadow-sm    // Dropdowns, popovers

// Medium elevation
shadow-md    // Cards on hover, modals

// No shadow by default - use borders instead
```

---

## Animations

### Transitions
```tsx
// Default transition
transition-colors duration-150

// Hover states
transition-all duration-200

// Page transitions
transition-opacity duration-300
```

### Vercel Animation Patterns
```tsx
// Fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.2 }}

// Slide up
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}

// Scale
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.15 }}
```

---

## Component Patterns

### Card
```tsx
<Card className="rounded-lg border border-[var(--ds-gray-200)] p-4">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
  </CardHeader>
  <CardContent className="space-y-3">
```

### Button
```tsx
// Primary
<Button className="h-10 px-4 rounded-md bg-[var(--ds-gray-1000)] text-white hover:bg-[var(--ds-gray-900)]">

// Secondary
<Button variant="outline" className="h-10 px-4 rounded-md border-[var(--ds-gray-300)]">

// Ghost
<Button variant="ghost" className="h-10 px-4 rounded-md hover:bg-[var(--ds-gray-100)]">
```

### Input
```tsx
<Input className="h-10 px-3 rounded-md border-[var(--ds-gray-300)] text-sm placeholder:text-[var(--ds-gray-500)] focus:border-[var(--ds-gray-900)] focus:ring-0">
```

### Table
```tsx
<Table className="border border-[var(--ds-gray-200)] rounded-lg">
  <TableHeader className="bg-[var(--ds-gray-100)]">
    <TableHead className="h-10 px-4 text-xs font-medium text-[var(--ds-gray-600)]">
  </TableHeader>
  <TableBody className="divide-y divide-[var(--ds-gray-200)]">
    <TableRow className="h-12 hover:bg-[var(--ds-gray-100)]">
      <TableCell className="px-4 text-sm text-[var(--ds-gray-800)]">
```

### Badge
```tsx
// Default
<Badge className="h-5 px-2 rounded-sm text-xs font-medium bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)]">

// Status
<Badge className="h-5 px-2 rounded-sm text-xs font-medium bg-[var(--ds-green-100)] text-[var(--ds-green-800)]">
```

---

## Do's and Don'ts

### ✅ Do
- Use Geist CSS variables for all colors
- Stick to the spacing scale (4px increments)
- Use rounded-md for interactive elements
- Keep shadows minimal
- Use font-medium for labels, font-semibold for headings

### ❌ Don't
- Use arbitrary color values (bg-[#xxx])
- Mix different radius values on same component
- Use heavy shadows
- Use font-bold except for strong emphasis
- Add unnecessary visual decoration

---

## 4-Layer Color Quick Reference

### Layer 1: Neutral Foundation
```
Backgrounds: 4 layers (frame, page, card elevated, card recessed)
Borders: ~85% white (never pure black)
Text: Headings 11%, Body 15-20%, Subtext 30-40%
Buttons: Darker = more important
```

### Layer 2: Functional Accent
```
Light mode: 500-600 main, 700 hover
Dark mode: 300-400 main, 400-500 hover
Think of brand as a SCALE, not a single color
```

### Layer 3: Semantic Colors
```
Success = Green (always)
Error = Red (always)
Warning = Amber (always)
Info = Blue (always)
Charts: OKLCH L=0.65, C=0.15, increment H by 25-30
```

### Layer 4: Theming Formula
```
For any neutral → themed:
  Lightness: -0.03
  Chroma: +0.02
  Hue: your theme hue (0-360)
```

### Dark Mode Rules
```
Double the distance: 4-6% between layers (not 2%)
Surfaces get LIGHTER as they elevate
Brand colors shift to 300-400 range
Brighten borders, dim text slightly
```
