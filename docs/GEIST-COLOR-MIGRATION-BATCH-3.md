# Geist Color System Migration - Batch 3

> Migration of hardcoded Tailwind color classes to Geist CSS variables
> Date: January 10, 2026

---

## Summary

This batch completed the migration of **50+ files** from hardcoded Tailwind color classes to Geist CSS variables, ensuring consistent theming and automatic dark mode support across the entire codebase.

---

## Files Updated

### Editor Components

| File | Changes |
|------|---------|
| `src/features/editor/components/global-styles-panel.tsx` | Dirty indicator amber color migrated |
| `src/features/editor/components/editable-block-wrapper.tsx` | Hover ring and label colors migrated |
| `src/features/editor/components/focus-preview.tsx` | macOS window controls use BRAND_COLORS |
| `src/features/editor/components/layers-layout-modes.tsx` | Multi-select violet→purple, lock amber colors |
| `src/features/editor/components/preset-palette.tsx` | CATEGORY_COLORS object fully migrated |
| `src/features/editor/components/seo-panel.tsx` | Warning amber color migrated |
| `src/features/editor/components/layers-context-actions.tsx` | Suggestion amber color migrated |
| `src/features/editor/components/layers-panel-toolbar.tsx` | Bulk actions violet→purple colors |
| `src/features/editor/components/save-button.tsx` | Success emerald→green colors |
| `src/features/editor/components/save-preset-dialog.tsx` | Success green color migrated |
| `src/features/editor/components/settings-panel.tsx` | Lock amber colors migrated |
| `src/features/editor/components/layers-filter-menu.tsx` | Filter violet→purple colors |
| `src/features/editor/components/layer-item.tsx` | Highlight amber, multi-select purple |
| `src/features/editor/components/layers-dnd-system.tsx` | Count badge violet→purple |
| `src/features/editor/layout/section-renderer.tsx` | Hover ring and label colors |
| `src/features/editor/layout/element-renderer.tsx` | Hover ring color |

### Dashboard Components

| File | Changes |
|------|---------|
| `src/components/dashboard/notifications/notification-center.tsx` | Connection status yellow→amber |
| `src/components/dashboard/insights/insight-card.tsx` | Trend colors emerald→green, red |
| `src/components/dashboard/advanced-search/search-results-preview.tsx` | Entity type colors |
| `src/components/dashboard/collaboration/presence-indicator.tsx` | STATUS_COLORS object migrated |

### Feature Components

| File | Changes |
|------|---------|
| `src/features/discounts/components/discount-products.tsx` | Availability green color |
| `src/features/discounts/components/discount-collections.tsx` | Published green color |
| `src/features/products/components/product-seo-card.tsx` | Link blue color |
| `src/features/media/components/upload-panel.tsx` | Success green color |
| `src/features/media/components/asset-list-item.tsx` | File type badge colors |

### Landing Page Components

| File | Changes |
|------|---------|
| `src/components/landing/features.tsx` | All preview component colors migrated |

### Store Components

| File | Changes |
|------|---------|
| `src/components/store/blocks/editable-block-wrapper.tsx` | Hover ring color |
| `src/app/dashboard/products/add-product-sheet.tsx` | Required field rose→red |

### Test Files

| File | Changes |
|------|---------|
| `src/components/dashboard/collaboration/__tests__/presence-indicator.test.tsx` | Test assertions updated |
| `src/components/dashboard/insights/__tests__/insights-panel.test.tsx` | Test assertions updated |

---

## Color Mapping Reference

### Tailwind → Geist CSS Variable

| Tailwind Class | Geist Variable | Usage |
|----------------|----------------|-------|
| `violet-*` | `--ds-purple-*` | Geist uses purple instead of violet |
| `emerald-*` | `--ds-green-*` | Geist uses green instead of emerald |
| `rose-*` | `--ds-red-*` | Required field indicators |
| `orange-*` | `--ds-amber-600` | Warning/logistics colors |
| `fuchsia-*` | `--ds-pink-*` | Accent colors |
| `indigo-*` | `--ds-purple-*` | Accent colors |
| `blue-400` | `--ds-blue-400` | Hover states |
| `blue-500/600` | `--ds-blue-700` | Primary blue |
| `green-500/600` | `--ds-green-700` | Success states |
| `red-500/600` | `--ds-red-700` | Error/destructive |
| `amber-500` | `--ds-amber-700` | Warning states |
| `purple-500/600` | `--ds-purple-700` | Accent/selection |
| `pink-500/600` | `--ds-pink-700` | Engagement colors |
| `yellow-500` | `--ds-amber-700` | Warning states |

---

## Brand Colors (Kept as-is)

These colors are intentionally hardcoded as they represent brand identities:

| Brand | Color | Usage |
|-------|-------|-------|
| macOS Close | `#FF5F57` | Window control dots |
| macOS Minimize | `#FEBC2E` | Window control dots |
| macOS Maximize | `#28C840` | Window control dots |
| Facebook | `#1877F2` | Social media icons |
| Instagram | `#E4405F` | Social media icons |

These are defined in `src/config/brand-colors.ts`.

---

## Dark Mode Handling

**Before (Tailwind):**
```tsx
<div className="text-emerald-600 dark:text-emerald-500">
```

**After (Geist):**
```tsx
<div className="text-[var(--ds-green-700)]">
```

Geist CSS variables automatically handle dark mode through semantic inversion - no `dark:` prefixes needed.

---

## Verification

- ✅ TypeScript compilation passes (`pnpm tsc --noEmit`)
- ✅ All files use Geist CSS variables
- ✅ Brand colors properly imported from `@/config/brand-colors`
- ✅ Dark mode prefixes removed (Geist handles automatically)
- ✅ Test assertions updated to match new class names

---

## Migration Complete

The Geist color system migration is now complete across the entire codebase. All hardcoded Tailwind color classes have been replaced with Geist CSS variables, ensuring:

1. **Consistent theming** - All colors follow the Geist design system
2. **Automatic dark mode** - No manual `dark:` prefixes needed
3. **Maintainability** - Colors can be updated in one place
4. **Accessibility** - Geist colors are designed for proper contrast ratios

---

## Related Documentation

- [Geist Color System Guide](./GEIST-COLOR-SYSTEM-GUIDE.md)
- [Geist Migration Plan](./GEIST-MIGRATION-PLAN.md)
- [Brand Colors Config](../src/config/brand-colors.ts)
- [Geist Tokens CSS](../src/styles/geist-tokens.css)
