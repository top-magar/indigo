# Geist Design System Reference

Complete reference extracted from vercel.com/geist. Source of truth for Indigo's design decisions.

## Typography

4 categories, each with specific `font-size` + `line-height` + `letter-spacing` + `font-weight` bundled.

### Headings (page/section intros)
| Class | Size | Usage |
|-------|------|-------|
| `text-heading-72` | 72px | Marketing heroes |
| `text-heading-48` | 48px | Marketing |
| `text-heading-32` | 32px | Dashboard headings, marketing subheadings |
| `text-heading-24` | 24px | Section headings |
| `text-heading-20` | 20px | Card headings |
| `text-heading-16` | 16px | Small headings |
| `text-heading-14` | 14px | Smallest heading |

### Labels (single-line, icon-friendly)
| Class | Size | Usage |
|-------|------|-------|
| `text-label-16` | 16px | Titles to differentiate from regular text |
| `text-label-14` | 14px | **Most common.** Menus, nav items |
| `text-label-13` | 13px | Secondary line next to labels. Has `tabular-nums` |
| `text-label-12` | 12px | Tertiary text, comments, calendar caps |
| `text-label-14-mono` | 14px mono | Pair with larger text |
| `text-label-13-mono` | 13px mono | Pair with Label 14 |
| `text-label-12-mono` | 12px mono | Smallest mono |

### Copy (multi-line, higher line-height)
| Class | Size | Usage |
|-------|------|-------|
| `text-copy-16` | 16px | Modals, larger views |
| `text-copy-14` | 14px | **Most common body text** |
| `text-copy-13` | 13px | Secondary text, space-constrained views |
| `text-copy-13-mono` | 13px mono | Inline code |

### Buttons
| Class | Size | Usage |
|-------|------|-------|
| `text-button-16` | 16px | Largest button |
| `text-button-14` | 14px | Default button |
| `text-button-12` | 12px | Tiny button inside input |

### Strong modifier
Use `<strong>` inside a type class — the class sets the weight:
```html
<p class="text-copy-14">Regular <strong>with Strong</strong></p>
```

## Colors

### 10-step scale system
8 color scales (gray, blue, red, amber, green, teal, purple, pink) × 10 steps each.

| Steps | Role | Usage |
|-------|------|-------|
| 100–300 | Component backgrounds | 100=default, 200=hover, 300=active |
| 400–600 | Borders | 400=default, 500=hover, 600=active |
| 700–800 | Solid fills | 700=default, 800=hover (buttons, badges) |
| 900–1000 | Text & icons | 900=secondary, 1000=primary |

### Key rules
- Steps 700–800 stay the same across light/dark themes
- Steps 100–500 invert between themes
- Steps 900–1000 flip to lighter values in dark mode
- Gray-alpha scale for transparent overlays (5 steps)
- Brand = gray (achromatic). Color only from semantic scales.

### Backgrounds
| Token | Light | Dark |
|-------|-------|------|
| `background-100` | white | near-black (#0a0a0a) |
| `background-200` | #fafafa | black (#000) |

## Materials (Surfaces)

8 presets combining radius + shadow + fill + stroke.

### On-page surfaces
| Material | Radius | Shadow | When |
|----------|--------|--------|------|
| `base` | 6px | 1px border only | Default container. Cards, sections. |
| `small` | 6px | border + 2px soft drop | Slightly raised. Interactive cards. |
| `medium` | 12px | border + 8px spread | Feature cards, highlighted sections. |
| `large` | 12px | border + 16px spread | Hero cards, prominent content. |

### Floating surfaces
| Material | Radius | Shadow | When |
|----------|--------|--------|------|
| `tooltip` | 6px | border + 4×8px | Tooltips only. Has arrow/stem. |
| `menu` | 12px | border + 16×24px | Dropdowns, context menus, selects. |
| `modal` | 12px | border + 24×32px | Dialogs, modals, confirmations. |
| `fullscreen` | 16px | border + 24×32px | Full-screen takeovers, command palette. |

### Shadow elevation ladder
```
border (flat) → small (2px) → medium (8px) → large (16px)
tooltip (8px) → menu (24px) → modal (32px) → fullscreen (32px + 16px radius)
```

### All borders use box-shadow, not CSS border
```css
--ds-shadow-border: 0 0 0 1px var(--ds-gray-alpha-400);
```
Light: `rgba(0,0,0,0.08)` — Dark: `rgba(255,255,255,0.14)`

## Grid

3-breakpoint responsive system.

| Breakpoint | Label | Width |
|------------|-------|-------|
| `sm` | Mobile | ~640px |
| `md` | Tablet | ~768–1024px |
| `lg` | Desktop | ~1280px+ |

Props: `columns`, `rows` (number or `{sm, md, lg}` object), `hideRowGuides`, `hideColumnGuides`.
Cell props: `solid`, `clip`, `row`, `column`, `rowSpan`, `colSpan`.

## Components — Key Patterns

### Button
- **Sizes:** small (32px), medium (40px), large (48px)
- **Types:** primary, secondary, tertiary, warning, error
- **Shapes:** default (6px radius), rounded (pill), svgOnly (icon-only)
- **Icons:** prefix, suffix, or svgOnly. Icon-only requires `aria-label`

### Badge
- **9 colors:** gray, blue, purple, amber, red, pink, green, teal, inverted
- **Each has subtle variant** (lower-opacity background)
- **Sizes:** small (20px), medium (24px), large (28px)
- **Shape:** pill (full border-radius)

### Input
- **Height:** 40px standard
- **Radius:** 6px
- **Variants:** default, prefix/suffix, search, ⌘K
- **States:** default, disabled, error (red border + message), focus

### Table
- **Variants:** basic, striped, bordered, interactive, virtualized
- **Row height:** ~48px
- **Cell padding:** ~12px 16px
- **No Card wrapper** — table sits directly on page

### Empty State
4 approaches: Blank Slate → Informational → Educational → Guide.
Structure: centered, title + description + optional CTA + optional "Learn more" link.

### Entity (list item)
Two-column layout: left (avatar + name + metadata) | right (action).
Used for member lists, device lists, session lists.

### Modal
- **Width:** ~540px
- **Radius:** 12px
- **Structure:** Header → Body (scrollable) → Footer/Actions
- **Sticky variant:** fixed header/footer, scrollable body

### Tabs
- **Primary:** underline-style with active indicator bar
- **Secondary:** more subtle/compact
- Support disabled tabs, icon tabs

## Mapping to Indigo

| Geist | Indigo Current | Action |
|-------|---------------|--------|
| Heading 32 | `text-lg` (18px) | Our dashboard titles are smaller than Geist |
| Label 14 | `text-sm font-medium` | ✅ Matches |
| Label 13 | `text-xs` (12px) | We use 12px, Geist uses 13px |
| Copy 14 | `text-sm` | ✅ Matches |
| Copy 13 | `text-xs text-muted-foreground` | Close enough |
| material-base (6px radius) | `rounded-lg` (10px) | Our radius is larger |
| material-menu (12px radius) | Dialog `rounded-xl` (14px) | Close |
| Button medium (40px) | `h-7` (28px) | **Our buttons are much smaller** |
| Input (40px) | `h-9` (36px) | Close |
| Table row (48px) | Varies | Need to standardize |
| No shadows on cards | ✅ Already removed | Matches |
