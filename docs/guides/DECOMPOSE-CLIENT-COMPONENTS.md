# Dashboard Client Component Decomposition Guide

## Pattern

Every dashboard `-client.tsx` file follows the same structure:

```
1. Imports (30-80 lines)
2. Constants/configs (STATUS_CONFIG, etc.)
3. Helper functions (formatters, exportCSV, etc.)
4. Sub-components (StatCard, Badge, Skeleton, TableRow, FilterBar, etc.)
5. Main exported component (state, filtering, sorting, render)
```

## Target Structure

```
src/app/dashboard/{module}/
├── page.tsx                    # Server component (unchanged)
├── {module}-client.tsx         # Main component — imports from _components/
├── _components/
│   ├── index.ts                # Barrel re-export
│   ├── stat-cards.tsx          # StatCard, stat configs
│   ├── status-badges.tsx       # Status/payment badges + config maps
│   ├── table-row.tsx           # Single table row component
│   ├── table-skeleton.tsx      # Loading skeleton
│   ├── filters.tsx             # ActiveFilters, filter bar
│   └── {feature-specific}.tsx  # AI insights, dialogs, etc.
├── actions.ts                  # (unchanged)
├── types.ts                    # (unchanged)
└── loading.tsx                 # (unchanged)
```

## Rules

1. Sub-components go in `_components/` (underscore prefix = not a route in App Router)
2. Each extracted file should be <200 lines
3. Constants/configs go with the component that uses them
4. The main `-client.tsx` should only contain: state, data flow, layout composition
5. Don't extract components used only once inline — only extract reusable pieces

## Files to Decompose (by priority)

| File | Lines | Extract |
|------|-------|---------|
| `products/new/new-product-client.tsx` | 1259 | Wizard steps → `_components/step-{n}.tsx` |
| `orders/orders-client.tsx` | 1109 | StatCard, badges, table row, AI panel, filters |
| `marketing/campaigns/campaigns-client.tsx` | 1043 | Stats, table row, filters, CSV export |
| `settings/shipping/shipping-settings-client.tsx` | 884 | Zone editor, rate editor, form sections |
| `inventory/inventory-client.tsx` | 836 | Stats, table row, filters, stock dialog |
| `orders/[id]/order-detail-client.tsx` | 824 | Timeline, items table, customer card, actions |
| `products/products-client.tsx` | 745 | Stats, table row, filters, bulk actions |
| `categories/categories-client.tsx` | 680 | Tree view, category row, filters |
| `marketing/automations/automations-client.tsx` | 649 | Automation card, trigger config |
| `settings/general-settings-client.tsx` | 643 | Form sections (store info, branding, etc.) |
| `customers/customers-client.tsx` | 597 | Stats, table row, filters |
| `analytics/analytics-client.tsx` | 583 | Chart cards, metric cards, date picker |
| `marketing/marketing-client.tsx` | 581 | Tab panels, overview cards |
| `marketing/discounts/vouchers/[id]/voucher-detail-client.tsx` | 579 | Usage table, stats, edit form |

## How to Extract (Step by Step)

1. Identify function boundaries: `grep -n '^function \|^export function ' {file}`
2. Create `_components/` directory next to the file
3. Move each sub-component + its imports to a new file
4. Add `"use client"` if the sub-component uses hooks/state
5. Update the main file to import from `_components/`
6. Run `npx tsc --noEmit` to verify
