# Geist Design System Migration Plan

## Overview

This document outlines the migration plan to ensure full Geist Design System compliance across the application.

## Priority Levels

### HIGH Priority (Fix Immediately)
- Hardcoded Tailwind colors in feature components
- Hardcoded hex colors
- Custom modal implementations

### MEDIUM Priority
- Non-standard typography sizes (`text-[10px]`)
- Golden ratio spacing (should use Geist 4px scale)
- Hardcoded borderRadius in tooltips

### LOW Priority
- Stripe Elements theming (external library)
- OpenGraph images (require inline styles)

### ACCEPTABLE (No Changes Needed)
- Brand colors in `src/config/brand-colors.ts`
- macOS window controls
- Google/Discord/Stripe brand colors

## Token Mapping Reference

### Status Colors
| Hardcoded | Geist Token |
|-----------|-------------|
| `text-green-600`, `bg-green-*` | `var(--ds-status-success)` / `text-[color:var(--ds-green-700)]` |
| `text-red-600`, `bg-red-*` | `var(--ds-status-error)` / `text-[color:var(--ds-red-700)]` |
| `text-amber-600`, `bg-amber-*` | `var(--ds-status-warning)` / `text-[color:var(--ds-amber-700)]` |
| `text-blue-600`, `bg-blue-*` | `var(--ds-status-info)` / `text-[color:var(--ds-blue-700)]` |

### Background Colors
| Hardcoded | Geist Token |
|-----------|-------------|
| `bg-white` | `bg-[var(--ds-background-100)]` |
| `bg-black` | `bg-[var(--ds-gray-1000)]` |
| `bg-gray-50` | `bg-[var(--ds-gray-100)]` |
| `bg-gray-100` | `bg-[var(--ds-gray-200)]` |
| `bg-gray-950` | `bg-[var(--ds-gray-1000)]` |

### Typography Sizes
| Hardcoded | Geist Utility |
|-----------|---------------|
| `text-[10px]` | `text-label-12` (minimum readable) |
| `text-[11px]` | `text-label-12` |
| `text-[13px]` | `text-label-13` |

### Spacing (4px base)
| Golden Ratio | Geist Scale |
|--------------|-------------|
| `gap-[8px]` | `gap-geist-2` (8px) |
| `gap-[13px]` | `gap-geist-3` (12px) |
| `gap-[21px]` | `gap-geist-5` (20px) |
| `gap-[26px]` | `gap-geist-6` (24px) |

### Border Radius
| Hardcoded | Geist Scale |
|-----------|-------------|
| `rounded-[4px]` | `rounded-sm` |
| `rounded-[6px]` | `rounded-md` |
| `rounded-[8px]` | `rounded-lg` |
| `rounded-[12px]` | `rounded-xl` |

## Files to Migrate

### Phase 1: Feature Components (HIGH)
- `src/features/editor/components/*.tsx`
- `src/features/media/components/asset-viewer.tsx`
- `src/features/discounts/components/*.tsx`

### Phase 2: Store Components (MEDIUM)
- `src/components/store/product-detail.tsx`
- `src/components/store/blocks/editable-block-wrapper.tsx`
- `src/components/landing/integrations.tsx`

### Phase 3: UI Components (MEDIUM)
- `src/components/ui/text-hover-effect.tsx`
- `src/components/ui/slider.tsx`
- `src/components/ui/shimmer-effect.tsx`
- `src/components/ui/navigation-menu.tsx`

### Phase 4: Dashboard Components (LOW)
- Chart tooltip borderRadius
- Typography size standardization

## Implementation Status

- [x] Phase 1: Feature Components
  - [x] `src/features/media/components/folder-sidebar.tsx` - Fixed amber colors
- [x] Phase 2: Store Components
  - [x] `src/components/store/product-detail.tsx` - Fixed green status color
  - [x] `src/components/store/blocks/editable-block-wrapper.tsx` - Fixed blue/white colors
  - [x] `src/components/landing/integrations.tsx` - Fixed gray colors
- [x] Phase 3: UI Components
  - [x] `src/components/ui/text-hover-effect.tsx` - Fixed neutral stroke colors
  - [x] `src/components/ui/slider.tsx` - Fixed bg-white
  - [x] `src/components/ui/shimmer-effect.tsx` - Fixed via-white/20
  - [x] `src/components/ui/navigation-menu.tsx` - Fixed bg-white/5, bg-white/10
- [x] Phase 4: Dashboard Components
  - [x] `src/components/dashboard/widgets/renderers/activity-feed-widget.tsx`
  - [x] `src/components/dashboard/widgets/renderers/recent-orders-widget.tsx`
  - [x] `src/components/dashboard/widgets/renderers/top-products-widget.tsx`
  - [x] `src/components/dashboard/widgets/renderers/insights-widget.tsx`
  - [x] `src/components/dashboard/notifications/notification-center.tsx`
  - [x] `src/components/dashboard/orders/order-timeline.tsx`
  - [x] `src/components/dashboard/bulk-actions/bulk-action-dialog.tsx`

## Verification
- ✅ TypeScript compilation passes (`pnpm tsc --noEmit`)
- ✅ All hardcoded Tailwind colors migrated to Geist CSS variables
- ✅ Brand colors preserved (eSewa, Khalti, Google, macOS)

## Acceptable Exceptions (Not Migrated)

The following hardcoded colors are intentionally kept as they represent:

### Brand Colors (`src/config/brand-colors.ts`)
- eSewa green (`#60BB46`) - Payment provider brand
- Khalti purple (`#5C2D91`) - Payment provider brand
- Facebook blue (`#1877F2`) - Social media brand
- Instagram pink (`#E4405F`) - Social media brand
- macOS window controls (red, yellow, green)

### Code Syntax Highlighting
- Terminal output colors in landing page code blocks
- These are standard syntax highlighting colors

### Landing Page Decorative Elements
- Payment provider themed cards (eSewa green, Khalti purple backgrounds)
- Social media icons with brand colors
- macOS-style window controls in mockups
