---
inclusion: always
---

# Vercel/Geist Design System Guide

This steering file enforces Vercel's design patterns across the application.

---

## Core Principles

1. **Minimalism** - Remove visual noise, let content breathe
2. **Consistency** - Same patterns everywhere
3. **Hierarchy** - Clear visual importance through size, weight, color
4. **Precision** - Exact spacing, no arbitrary values

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
