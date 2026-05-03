# Indigo Component Catalog

> Developer handoff reference for all reusable dashboard components. Import paths, props, and usage examples.

---

## Templates (Page-Level)

### EntityListPage
**Path**: `@/components/dashboard/templates/entity-list-page`
**Use**: All list/table pages (products, orders, customers, collections).

```tsx
<EntityListPage
  title="Products"
  description="Manage your product catalog"
  count={42}
  actions={<Button>Add product</Button>}
  search={{ value, onChange, placeholder: "Search products..." }}
  filters={<FilterPresets />}
>
  <DataTable columns={columns} data={data} />
</EntityListPage>
```

### EntityDetailPage
**Path**: `@/components/dashboard/templates/entity-detail-page`
**Use**: All detail/edit pages (product detail, customer detail, collection detail).

```tsx
<EntityDetailPage
  backHref="/dashboard/products"
  backLabel="Products"
  title={product.name}
  status={<StatusBadge status="active" />}
  actions={<Button>Save</Button>}
  sidebar={<ProductOrganizationCard />}
>
  <ProductInfoCard />
  <ProductPricingCard />
</EntityDetailPage>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `backHref` | string | ✓ | Back link URL |
| `backLabel` | string | ✓ | Back link text |
| `title` | string | ✓ | Page heading (text-lg font-semibold tracking-tight) |
| `subtitle` | string | | Secondary text below title |
| `status` | ReactNode | | Badge/indicator next to title |
| `actions` | ReactNode | | Right-aligned action buttons |
| `sidebar` | ReactNode | | 380px right column |
| `children` | ReactNode | ✓ | Main content |

### EntityFormCard
**Path**: `@/components/dashboard/templates/entity-form-card`
**Use**: Card sections within detail/create pages.

```tsx
<EntityFormCard title="General information" id="section-general" actions={<Switch />}>
  <FormField label="Title" required error={errors.name}>
    <Input value={name} onChange={...} />
  </FormField>
</EntityFormCard>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | ✓ | Card header (text-sm font-medium) |
| `description` | string | | Subtitle below title |
| `actions` | ReactNode | | Right-aligned header actions |
| `id` | string | | HTML id for scroll-to |
| `className` | string | | Additional classes |
| `children` | ReactNode | ✓ | Card content (space-y-3) |

---

## Form Components

### FormField
**Path**: `@/components/dashboard/form-field`
**Use**: Every form field — wraps label + input + error.

```tsx
<FormField label="Title" required error={errors.name} description="Helper text">
  <Input value={name} onChange={...} />
</FormField>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | string | ✓ | Field label (text-xs font-medium) |
| `description` | string | | Helper text (text-[10px] text-muted-foreground) |
| `error` | string | | Error message (text-[10px] text-destructive) |
| `required` | boolean | | Shows red asterisk |
| `horizontal` | boolean | | Side-by-side label + input layout |
| `children` | ReactNode | ✓ | The input element |

### ToggleRow
**Path**: `@/components/dashboard/toggle-row`
**Use**: Settings toggles (physical product, track inventory, allow backorders).

```tsx
<ToggleRow
  label="Physical product"
  description="This product requires shipping"
  checked={requiresShipping}
  onChange={setRequiresShipping}
  badge="Recommended"
/>
```

### Savebar
**Path**: `@/components/dashboard/savebar/savebar`
**Use**: Sticky bottom bar on edit pages when form is dirty.

```tsx
<Savebar
  show={isDirty}
  isSaving={isPending}
  hasErrors={!!errors}
  onDiscard={reset}
  onSave={handleSave}
  onDelete={() => setShowDeleteDialog(true)}
  labels={{ save: "Save changes", saving: "Saving…" }}
/>
```

---

## Navigation Components

### PageHeader
**Path**: `@/components/dashboard/page-header`
**Use**: List page headers with title + count + search + actions.

### SectionHeader
**Path**: `@/components/dashboard/section-header`
**Use**: Section titles within pages.

```tsx
<SectionHeader title="Shipping" description="Configure shipping options" actions={<Button>Add zone</Button>} />
```

### StatusBadge
**Path**: `@/components/dashboard/status-badge`
**Use**: Order/product status indicators.

### StatusDot
**Path**: `@/components/dashboard/status-dot`
**Use**: Colored dot for inline status (draft, active, archived).

---

## Data Display

### DataTable
**Path**: `@/components/dashboard/data-table/data-table`
**Use**: All list pages. Includes sorting, selection, pagination.

### SortableHeader
**Path**: `@/components/dashboard/sortable-header`
**Use**: Table column headers with sort indicators.

### StatBar
**Path**: `@/components/dashboard/stat-bar`
**Use**: Inline stat row (not cards) above tables.

### BulkActionsBar
**Path**: `@/components/dashboard/bulk-actions-bar/bulk-actions-bar`
**Use**: Floating bar when table rows are selected.

---

## Feedback Components

### HelpTooltip
**Path**: `@/components/dashboard/help-tooltip`
**Use**: (i) icon with tooltip for field explanations.

```tsx
<HelpTooltip content="Original price shown with strikethrough" />
```

### VerificationBanner
**Path**: `@/components/dashboard/verification-banner`
**Use**: Top-of-page alert for store verification.

### CommandPalette
**Path**: `@/components/dashboard/command-palette/command-palette`
**Use**: ⌘K search across the entire dashboard.

---

## Hooks

| Hook | Path | Purpose |
|------|------|---------|
| `useFormDirty` | `@/hooks/use-form-dirty` | Track form dirty state with deep comparison |
| `useSaveShortcut` | `@/hooks/use-save-shortcut` | Bind ⌘S to save action |
| `useUnsavedChanges` | `@/hooks/use-unsaved-changes` | Warn before navigating away |

---

## Design Tokens (CSS Variables)

### Semantic Colors
```css
--background    /* Page bg: white / #0a0a0a */
--foreground    /* Primary text: #171717 / #ededed */
--muted         /* Secondary surface: gray-100 / gray-800 */
--muted-foreground  /* Secondary text: gray-500 */
--primary       /* Buttons, active: gray-1000 */
--destructive   /* Errors, delete: red-700 */
--success       /* Positive: green-700 */
--warning       /* Caution: amber-700 */
--info          /* Links: blue-700 */
--border        /* Borders: gray-200 */
```

### Spacing Scale
```
4px  → gap-1    (tight)
8px  → gap-2    (default)
12px → gap-3    (within cards)
16px → gap-4    (between cards)
24px → gap-6    (major sections)
```

### Border Radius
```
6px  → rounded-md  (buttons, inputs)
8px  → rounded-lg  (cards, containers)
12px → rounded-xl  (dialogs, sheets)
```

### Typography
```
18px/600  → text-lg font-semibold tracking-tight  (page title)
14px/500  → text-sm font-medium                   (card title, label)
14px/400  → text-sm                                (body)
12px/400  → text-xs                                (secondary, table)
10px/500  → text-[10px]                            (badge, overline)
```

---

## Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop (sidebar visible, 2-column layouts) |
| `xl` | 1280px | Wide desktop |

### Responsive Patterns
- Sidebar: visible at `lg`, collapsible
- Detail pages: `grid-cols-1 lg:grid-cols-[1fr_380px]`
- Form fields: `grid-cols-1 md:grid-cols-2`
- Tables: horizontal scroll on mobile

---

## File Structure Convention

```
src/components/dashboard/
├── templates/           # Page-level layouts (EntityListPage, EntityDetailPage)
├── sidebar/             # Navigation sidebar
├── savebar/             # Sticky save bar
├── data-table/          # Table + pagination
├── bulk-actions/        # Bulk action dialogs
├── charts/              # Analytics charts
├── analytics/           # Analytics widgets
├── command-palette/     # ⌘K search
├── notifications/       # Notification center
├── forms/               # Form wrappers
├── form-field.tsx       # Label + input + error
├── toggle-row.tsx       # Settings toggle
├── status-badge.tsx     # Status indicators
├── page-header.tsx      # List page header
├── section-header.tsx   # Section title
└── help-tooltip.tsx     # Info tooltip
```
