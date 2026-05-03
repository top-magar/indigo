# Indigo Brand Guidelines

> The definitive reference for anyone creating anything for Indigo — marketing, product UI, social, print, or partner materials.

---

## 1. Brand Foundation

### Mission
Empower Nepali entrepreneurs to sell online with confidence.

### Positioning
Indigo is the e-commerce platform built for Nepal. Local payments (eSewa, Khalti), Nepali language support, and a visual storefront editor — designed for merchants who are often creating their first online store.

### Brand Personality

| Attribute | Description | NOT this |
|-----------|-------------|----------|
| **Trustworthy** | Reliable, secure, handles money | Not corporate or cold |
| **Approachable** | Simple language, guided flows | Not dumbed-down or patronizing |
| **Crafted** | Attention to detail, polished | Not flashy or trendy |
| **Local** | Understands Nepal's market | Not a generic global SaaS |

### Tagline
**"Launch your store in minutes."**

Alternative: "E-commerce for Nepal."

---

## 2. Logo

### Primary Mark
The word "Indigo" in Inter SemiBold (600), tracking-tight. No icon mark — the name is the brand.

### Usage Rules
- Minimum size: 80px wide (digital), 20mm (print)
- Clear space: 1× the height of the "I" on all sides
- Always use on solid backgrounds — never on busy images
- Never stretch, rotate, add effects, or change the font

### Color Variants
| Variant | Usage |
|---------|-------|
| Dark (`#171717`) on light bg | Default — website, dashboard, print |
| Light (`#ededed`) on dark bg | Dark mode, dark photography |
| Single color only | Never use gradients or multi-color |

### Prohibited Uses
- ❌ Logo with drop shadow or glow
- ❌ Logo inside a colored box
- ❌ Logo with a tagline attached (keep separate)
- ❌ Logo in any color other than the two approved variants

---

## 3. Color System

### Primary Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Foreground** | `#171717` | 23, 23, 23 | Primary text, buttons, logo |
| **Background** | `#FFFFFF` | 255, 255, 255 | Page backgrounds |
| **Muted** | `#F4F4F5` | 244, 244, 245 | Secondary surfaces, hover states |
| **Muted Foreground** | `#71717A` | 113, 113, 122 | Secondary text, icons |
| **Border** | `#E4E4E7` | 228, 228, 231 | Borders, dividers |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#15803D` | Positive states, published, profit |
| **Destructive** | `#B91C1C` | Errors, delete, negative |
| **Warning** | `#B45309` | Alerts, low stock, caution |
| **Info** | `#1D4ED8` | Links, informational |

### Status Colors (with tinted backgrounds)

| State | Background | Text |
|-------|-----------|------|
| Success | `bg-success/10` | `text-success` |
| Error | `bg-destructive/10` | `text-destructive` |
| Warning | `bg-warning/10` | `text-warning` |
| Info | `bg-info/10` | `text-info` |
| Neutral | `bg-muted` | `text-muted-foreground` |

### Dark Mode
All colors invert via CSS custom properties. Never hardcode `#fff`, `#000`, `bg-white`, or `text-black`. Use semantic tokens only.

### Rules
- No gradients in the product UI (landing pages are OK)
- No hardcoded hex values in components — use tokens
- Status colors always paired: tinted background + matching text
- Overlays use `bg-foreground/50`, never `bg-black/50`

---

## 4. Typography

### Typefaces

| Role | Font | Fallback |
|------|------|----------|
| **UI / Body** | Inter | system-ui, -apple-system, sans-serif |
| **Code / Numbers** | Geist Mono | ui-monospace, monospace |

No other fonts. Inter is the only typeface used across all Indigo materials.

### Type Scale

| Role | Size | Weight | Tracking | Class |
|------|------|--------|----------|-------|
| Page title | 18px | 600 (SemiBold) | -0.02em | `text-lg font-semibold tracking-tight` |
| Section title | 14px | 500 (Medium) | 0 | `text-sm font-medium` |
| Body | 14px | 400 (Regular) | 0 | `text-sm` |
| Secondary | 12px | 400 (Regular) | 0 | `text-xs` |
| Label | 12px | 500 (Medium) | 0 | `text-xs font-medium` |
| Badge | 10px | 500 (Medium) | 0 | `text-[10px]` |
| Overline | 10–11px | 500–600 | 0.06–0.08em | `uppercase tracking-widest` |

### Rules
- **Never use `font-bold` (700)** — maximum weight is `font-semibold` (600)
- `tracking-tight` on page titles only
- `tabular-nums` on all numeric displays (prices, counts, dates)
- Line length: max 65ch for body text
- No custom font sizes outside the scale

---

## 5. Iconography

### Library
**Lucide** — outline style, 1.5px stroke weight default.

### Rules
- Size: `size-4` (16px) for inline, `size-3.5` (14px) for compact
- Active state: `strokeWidth={2}` (bolder)
- Color: `text-muted-foreground` default, `text-foreground` when active
- No emoji in the product UI
- No filled/solid icons — outline only
- Use `size-N` shorthand, never `h-N w-N`

---

## 6. Imagery & Photography

### Product Photography (Storefront)
- Clean, well-lit product shots on neutral backgrounds
- No heavy filters or oversaturation
- Square aspect ratio (1:1) for product cards

### Dashboard Illustrations
- None. The dashboard uses icons and text only — no illustrations, mascots, or decorative graphics.

### Empty States
- Lucide icon (muted, `strokeWidth={1.5}`) + short text
- No illustrations or cartoon graphics
- Helpful copy that guides the user to action

---

## 7. Voice & Tone

### Voice Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| **Clear** | Short sentences, plain words | "Your product is live" not "Your product has been successfully published" |
| **Direct** | Lead with the action | "Add a product" not "Get started by adding your first product to the catalog" |
| **Warm** | Friendly but not casual | "Draft saved" not "Awesome! We saved your draft! 🎉" |
| **Honest** | State problems plainly | "Upload failed" not "Oops! Something went wrong" |

### Tone Matrix

| Context | Tone | Example |
|---------|------|---------|
| Success | Confident, brief | "Product published" |
| Error | Clear, helpful | "Title is required" |
| Empty state | Encouraging, guiding | "Add your first product to get started" |
| Onboarding | Warm, supportive | "Your store is almost ready" |
| Destructive action | Serious, clear | "This will permanently delete the product" |

### Prohibited Language
- ❌ "Oops", "Uh oh", "Whoops" — errors are not cute
- ❌ Emoji in product UI (landing pages OK sparingly)
- ❌ "Please" before every action — just state it
- ❌ Marketing buzzwords: "Elevate", "Seamless", "Unleash", "Next-gen"
- ❌ Exclamation marks in UI copy (toasts, labels, buttons)

---

## 8. Spacing & Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| 4px | `gap-1` | Icon groups, tight pairs |
| 8px | `gap-2` | Default gap |
| 12px | `gap-3` | Within cards |
| 16px | `gap-4` | Between cards/sections |
| 24px | `gap-6` | Major section breaks |

### Border Radius

| Element | Radius |
|---------|--------|
| Buttons, inputs | `rounded-md` (6px) |
| Cards, containers | `rounded-lg` (8px) |
| Dialogs, sheets | `rounded-xl` (12px) |
| Avatars, pills | `rounded-full` |

### Rules
- No decorative shadows on cards — shadows only on floating elements
- `transition-colors` not `transition-all`
- No `mr-2` on icons — parent gap handles spacing

---

## 9. Motion

### Dashboard
- **No framer-motion** — CSS transitions only
- `transition-colors duration-150` for hover states
- `transition-all duration-200` for layout changes
- No entrance animations on page load
- No bounce, elastic, or spring easing

### Landing Pages
- Framer Motion allowed
- Subtle fade-in on scroll (`translateY(8px)` + opacity)
- `ease-out` or custom cubic-bezier, never `linear`

---

## 10. Component Patterns

### Buttons
- Primary: `bg-primary text-primary-foreground rounded-md`
- Outline: `border bg-background hover:bg-accent`
- Ghost: `hover:bg-accent` (no border)
- Destructive: `bg-destructive text-destructive-foreground`
- Size: `size="sm"` in dashboard, `size="default"` in marketing

### Cards
- `rounded-lg border` — no shadow
- `CardHeader` + `CardContent` with `space-y-3`
- No nested cards — use spacing and dividers for hierarchy

### Forms
- `FormField` component for label + input + error
- Labels: `text-xs font-medium`
- Error text: `text-[10px] text-destructive`
- Required indicator: red asterisk after label

### Tables
- No Card wrapper around tables
- Bare table with `border-b` row separators
- `text-xs` for table content

---

## Quick Audit Checklist

Before shipping any Indigo asset:

- [ ] Colors use semantic tokens (no hardcoded hex)
- [ ] Typography follows the scale (no custom sizes/weights)
- [ ] Icons are Lucide, `size-4`, outline style
- [ ] No decorative shadows on cards
- [ ] No `font-bold` anywhere
- [ ] No emoji in product UI
- [ ] Copy is clear, direct, warm — no buzzwords
- [ ] Dark mode works (no hardcoded white/black)
- [ ] `rounded-lg` for containers, `rounded-md` for buttons
- [ ] `tabular-nums` on all numbers
