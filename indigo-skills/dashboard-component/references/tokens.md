# OKLCH Token Reference

## Backgrounds
| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `bg-background` | white | L:0.12 | Page background |
| `bg-muted` | L:0.96 | L:0.18 | Recessed surfaces, sidebar |
| `bg-card` | white | L:0.18 | Elevated cards |
| `bg-popover` | white | L:0.24 | Dropdowns, popovers |
| `bg-primary` | L:0.145 | L:0.985 | Primary buttons |
| `bg-secondary` | L:0.96 | L:0.22 | Secondary buttons |
| `bg-accent` | L:0.96 | L:0.22 | Hover states |
| `bg-destructive` | hue:27 | hue:27 | Delete actions |

## Text
| Token | Use |
|-------|-----|
| `text-foreground` | Body text (primary) |
| `text-muted-foreground` | Secondary text, captions |
| `text-primary-foreground` | Text on primary bg |
| `text-card-foreground` | Text on cards |

## Borders
| Token | Use |
|-------|-----|
| `border-border` | Default borders |
| `border-input` | Input borders |
| `border-ring` | Focus rings |

## Semantic Status
| Status | Background | Text |
|--------|-----------|------|
| Success | `bg-success/10` | `text-success` |
| Destructive | `bg-destructive/10` | `text-destructive` |
| Warning | `bg-warning/10` | `text-warning` |
| Info | `bg-info/10` | `text-info` |

## Gray Scale (var(--ds-gray-*))
| Step | Light L | Dark L | Use |
|------|---------|--------|-----|
| 100 | 0.968 | 0.205 | Subtle bg, hover |
| 200 | 0.935 | 0.245 | Selected, light border |
| 300 | 0.880 | 0.300 | Borders, dividers |
| 500 | 0.710 | 0.530 | Placeholder text |
| 600 | 0.556 | 0.700 | Secondary text, icons |
| 800 | 0.370 | 0.870 | Body text |
| 900 | 0.270 | 0.930 | Headings |
| 1000 | 0.145 | 0.985 | Maximum emphasis |

## Brand Scale (hue: 185 teal)
Use `var(--ds-brand-*)` for accent colors. Light mode: 500-600 main, 700 hover. Dark mode: 300-400 main, 500 hover.

## Chart Colors (perceptually uniform)
All at L:0.65, C:0.15, hue increments of 25-30°:
`--ds-chart-red` through `--ds-chart-pink` (12 colors)

## Sizing
| Size | Height | Use |
|------|--------|-----|
| sm | h-8 (32px) | Dense UIs, table actions |
| md | h-10 (40px) | Default buttons, inputs |
| lg | h-12 (48px) | Primary CTAs |

## Radius
| Element | Class |
|---------|-------|
| Badges, tags | `rounded-sm` |
| Buttons, inputs | `rounded-md` |
| Cards, dropdowns | `rounded-lg` |
| Dialogs, modals | `rounded-xl` |
| Avatars | `rounded-full` |

## Typography
| Role | Size | Weight |
|------|------|--------|
| Page title | `text-2xl` | `font-semibold` |
| Section heading | `text-lg` | `font-medium` |
| Card title | `text-sm` | `font-medium` |
| Body | `text-sm` | `font-normal` |
| Helper/caption | `text-xs` | `font-normal` |
