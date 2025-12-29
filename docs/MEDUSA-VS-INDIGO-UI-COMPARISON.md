# UI/UX Comparison: MedusaJS Admin vs Indigo Dashboard

## Executive Summary

This document provides a comprehensive UI/UX comparison between MedusaJS Admin Dashboard and Indigo's dashboard implementation. Both systems target e-commerce administration but take different approaches to design patterns, component architecture, and user experience.

| Aspect | MedusaJS | Indigo | Winner |
|--------|----------|--------|--------|
| Design System | @medusajs/ui (custom) | shadcn/ui + Tailwind | Indigo (more flexible) |
| Icon System | @medusajs/icons | Hugeicons | Indigo (richer set) |
| Layout Pattern | Shell + Sidebar | App Sidebar + Header | Tie |
| Data Tables | Custom DataTable component | shadcn Table + custom | MedusaJS (more features) |
| Empty States | NoResults/NoRecords | EmptyState component | Tie |
| Forms | react-hook-form + zod | react-hook-form + custom | Tie |
| Modals | Route-based modals | Dialog components | MedusaJS (better UX) |
| i18n | react-i18next | None | MedusaJS |
| Theming | CSS variables | Tailwind design tokens | Indigo (more modern) |

---

## 1. Layout Architecture

### MedusaJS Shell Pattern
```
┌─────────────────────────────────────────────────────────────┐
│ Progress Bar (loading indicator)                             │
├──────────────┬──────────────────────────────────────────────┤
│              │ Topbar (breadcrumbs + notifications)          │
│   Sidebar    ├──────────────────────────────────────────────┤
│   (220px)    │                                              │
│              │              Main Content                     │
│  - Header    │              (max-w-1600px)                   │
│  - Nav       │                                              │
│  - User      │              Gutter (p-3)                    │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Key Features:**
- Fixed 220px sidebar width
- Collapsible on mobile (dialog-based)
- Progress bar for route transitions
- Breadcrumb navigation in topbar
- Max content width of 1600px

### Indigo Layout Pattern
```
┌─────────────────────────────────────────────────────────────┐
│ Header (h-14, sticky, blur backdrop)                         │
│ [Trigger] [Breadcrumbs]              [Search] [+] [🔔] [Store]│
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │              Main Content                     │
│   (collapsible)              (flex-1)                       │
│              │                                              │
│  - Store     │              Page Content                    │
│  - Nav Groups│              (space-y-6)                     │
│  - User      │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Key Features:**
- Sticky header with blur effect
- Collapsible sidebar (shadcn Sidebar)
- Command palette (⌘K)
- Quick actions dropdown
- Notification center
- "View Store" link

### Comparison

| Feature | MedusaJS | Indigo |
|---------|----------|--------|
| Sidebar Width | Fixed 220px | Collapsible |
| Mobile Sidebar | Dialog overlay | Sheet overlay |
| Loading State | Progress bar | Spinner/transition |
| Search | Inline in sidebar | Header + Command palette |
| Breadcrumbs | Topbar | Header |
| Notifications | Dedicated component | Dropdown menu |

**Recommendation:** Indigo's layout is more modern with the command palette and sticky header. Consider adding MedusaJS's progress bar for route transitions.

---

## 2. Navigation Patterns

### MedusaJS Navigation
```typescript
// Core routes with nested items
const coreRoutes = [
  { icon: <ShoppingCart />, label: "Orders", to: "/orders", items: [] },
  { icon: <Tag />, label: "Products", to: "/products", items: [
    { label: "Collections", to: "/collections" },
    { label: "Categories", to: "/categories" },
  ]},
  { icon: <Buildings />, label: "Inventory", to: "/inventory", items: [
    { label: "Reservations", to: "/reservations" },
  ]},
  { icon: <Users />, label: "Customers", to: "/customers", items: [
    { label: "Customer Groups", to: "/customer-groups" },
  ]},
  { icon: <ReceiptPercent />, label: "Promotions", to: "/promotions", items: [
    { label: "Campaigns", to: "/campaigns" },
  ]},
  { icon: <CurrencyDollar />, label: "Price Lists", to: "/price-lists" },
]
```

### Indigo Navigation
```typescript
// Grouped navigation with badges and keywords
const navigation = [
  { id: "main", label: "Main", items: [
    { id: "dashboard", title: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
    { id: "orders", title: "Orders", href: "/dashboard/orders", icon: ShoppingCart01Icon,
      badge: counts.pendingOrders, badgeVariant: "warning",
      children: [
        { id: "all-orders", title: "All Orders", href: "/dashboard/orders" },
        { id: "returns", title: "Returns", href: "/dashboard/orders/returns" },
      ]
    },
  ]},
  { id: "catalog", label: "Catalog", items: [
    { id: "products", title: "Products", href: "/dashboard/products", icon: Tag01Icon,
      children: [
        { id: "all-products", title: "All Products", href: "/dashboard/products" },
        { id: "collections", title: "Collections", href: "/dashboard/collections" },
        { id: "categories", title: "Categories", href: "/dashboard/categories" },
      ]
    },
    { id: "inventory", title: "Inventory", href: "/dashboard/inventory", icon: Layers01Icon,
      badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
    },
  ]},
  // ... more groups
]
```

### Comparison

| Feature | MedusaJS | Indigo |
|---------|----------|--------|
| Grouping | Flat with sections | Labeled groups |
| Badges | None | Count badges with variants |
| Keywords | None | Search keywords |
| Access Control | None visible | requiredRole, requiredPlan |
| New Indicators | None | isNew flag |
| Collapsible | Radix Collapsible | shadcn Collapsible |

**Recommendation:** Indigo's navigation is more feature-rich with badges, keywords, and access control. Keep this pattern.

---

## 3. Data Table Patterns

### MedusaJS DataTable
```typescript
<DataTable
  data={products}
  columns={columns}
  filters={[
    { id: "status", label: "Status", type: "select", options: [...] },
  ]}
  commands={[
    { label: "Delete", action: handleDelete },
  ]}
  action={{ label: "Create", to: "/products/create" }}
  getRowId={(row) => row.id}
  enablePagination
  enableSearch
  enableSorting
  enableColumnVisibility
  rowHref={(row) => `/products/${row.id}`}
  emptyState={{
    title: "No products",
    message: "Create your first product",
    action: { label: "Create", to: "/products/create" },
  }}
/>
```

**Features:**
- URL-based filtering/sorting/pagination
- Column visibility toggle
- Row selection with commands
- Built-in empty states
- Keyboard navigation
- View configurations (feature flag)

### Indigo DataTable Pattern
```typescript
// Manual implementation with shadcn Table
<Card>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead><Checkbox /></TableHead>
        <TableHead>Product</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Price</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {products.length === 0 ? (
        <TableRow>
          <TableCell colSpan={8}>
            <EmptyState
              icon={PackageIcon}
              title="No products yet"
              description="Add your first product"
              action={{ label: "Add Product", onClick: () => router.push("/dashboard/products/new") }}
            />
          </TableCell>
        </TableRow>
      ) : (
        products.map((product) => (
          <TableRow key={product.id}>
            {/* ... cells */}
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</Card>
<DataTablePagination
  pageIndex={currentPage - 1}
  pageSize={pageSize}
  pageCount={pageCount}
  totalItems={totalCount}
  onPageChange={(page) => updateFilters({ page: String(page + 1) })}
  onPageSizeChange={(size) => updateFilters({ pageSize: String(size) })}
/>
```

**Features:**
- Manual filter state management
- Custom toolbar with search/filters
- Bulk actions bar
- Stats cards above table
- Export functionality

### Comparison

| Feature | MedusaJS | Indigo |
|---------|----------|--------|
| URL State | Built-in | Manual |
| Column Visibility | Built-in | Not implemented |
| Sorting | Built-in | Manual |
| Filtering | Declarative | Manual selects |
| Row Selection | Built-in commands | Manual with bulk bar |
| Empty States | Prop-based | Inline component |
| Stats | None | Cards above table |
| Export | None | CSV export |

**Recommendation:** Create a reusable DataTable component inspired by MedusaJS with URL-based state management.

---

## 4. Empty States

### MedusaJS Empty States
```typescript
// NoResults - for search/filter with no matches
<NoResults
  title="No results found"
  message="Try adjusting your search"
  className="h-[400px]"
/>

// NoRecords - for empty collections
<NoRecords
  title="No products"
  message="Get started by creating a product"
  action={{ to: "/products/create", label: "Create product" }}
  buttonVariant="default" | "transparentIconLeft"
  icon={<ExclamationCircle />}
/>
```

### Indigo EmptyState
```typescript
<EmptyState
  icon={PackageIcon}
  title="No products yet"
  description="Add your first product to start selling"
  action={{ label: "Add Product", onClick: () => router.push("/dashboard/products/new") }}
  secondaryAction={{ label: "Import", onClick: handleImport }}
  size="sm" | "md" | "lg"
/>
```

### Comparison

| Feature | MedusaJS | Indigo |
|---------|----------|--------|
| Variants | NoResults, NoRecords | Single component |
| Icon | Custom per variant | Configurable |
| Actions | Link-based | onClick-based |
| Secondary Action | None | Supported |
| Sizes | Fixed | sm/md/lg |
| Button Variants | 2 options | Standard |

**Recommendation:** Indigo's EmptyState is more flexible. Consider adding a "NoResults" variant for search states.

---

## 5. Form Patterns

### MedusaJS Form Pattern
```typescript
// Route-based modal forms
<RouteModalForm
  form={form}
  onSubmit={handleSubmit}
>
  <RouteModalForm.Header>
    <RouteModalForm.Title>Create Product</RouteModalForm.Title>
  </RouteModalForm.Header>
  <RouteModalForm.Body>
    <Form.Field name="title" control={form.control}>
      <Form.Label>Title</Form.Label>
      <Form.Control>
        <Input {...form.register("title")} />
      </Form.Control>
      <Form.ErrorMessage />
    </Form.Field>
  </RouteModalForm.Body>
  <RouteModalForm.Footer>
    <Button type="submit">Save</Button>
  </RouteModalForm.Footer>
</RouteModalForm>
```

### Indigo Form Pattern
```typescript
// Card-based forms
<form onSubmit={handleSubmit}>
  <div className="grid gap-6 lg:grid-cols-3">
    <div className="space-y-6 lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
        <CardContent>
          <Select value={status} onValueChange={setStatus}>...</Select>
        </CardContent>
      </Card>
    </div>
  </div>
</form>
```

### Comparison

| Feature | MedusaJS | Indigo |
|---------|----------|--------|
| Form Library | react-hook-form | useState (manual) |
| Validation | zod schemas | Manual |
| Layout | Modal-based | Page-based cards |
| Field Components | Form.Field wrapper | Label + Input |
| Error Display | Form.ErrorMessage | toast.error |
| Character Limits | None | useCharacterLimit hook |
| File Upload | FileUpload component | useFileUpload hook |

**Recommendation:** Adopt react-hook-form with zod for better validation. Keep the card-based layout for complex forms.

---

## 6. Modal Patterns

### MedusaJS Route Modals
```typescript
// URL-based modals that preserve navigation
// /products/create opens a modal over /products

<RouteDrawer>
  <RouteDrawer.Header>
    <RouteDrawer.Title>Edit Product</RouteDrawer.Title>
  </RouteDrawer.Header>
  <RouteDrawer.Body>...</RouteDrawer.Body>
</RouteDrawer>

<RouteFocusModal>
  <RouteFocusModal.Header>...</RouteFocusModal.Header>
  <RouteFocusModal.Body>...</RouteFocusModal.Body>
</RouteFocusModal>
```

### Indigo Dialog Pattern
```typescript
// State-based dialogs
const [dialogOpen, setDialogOpen] = useState(false)

<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Product</DialogTitle>
      <DialogDescription>Are you sure?</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onClick={handleDelete}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// AlertDialog for confirmations
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Product?</AlertDialogTitle>
      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Comparison

| Feature | MedusaJS | Indigo |
|---------|----------|--------|
| URL Integration | Yes (route-based) | No (state-based) |
| Back Navigation | Preserves history | Closes dialog |
| Stacking | StackedDrawer, StackedFocusModal | Not supported |
| Types | Drawer, FocusModal | Dialog, AlertDialog, Sheet |
| Animation | Framer Motion | Tailwind animate |

**Recommendation:** Consider implementing route-based modals for better UX (shareable URLs, back button support).

---

## 7. Status Badges & Colors

### MedusaJS Status Pattern
```typescript
// Uses @medusajs/ui Badge with semantic colors
<Badge color="green">Active</Badge>
<Badge color="orange">Pending</Badge>
<Badge color="red">Cancelled</Badge>
```

### Indigo Status Pattern
```typescript
// Uses design tokens with consistent pattern
const statusConfig = {
  draft: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Draft" },
  active: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Active" },
  archived: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Archived" },
}

<Badge
  variant="secondary"
  className={cn("border-0 gap-1", status.bgColor, status.color)}
>
  <span className="h-1.5 w-1.5 rounded-full bg-current" />
  {status.label}
</Badge>
```

### Design Token Usage

| Token | Usage | Color |
|-------|-------|-------|
| `chart-1` | Info, Processing | Blue |
| `chart-2` | Success, Active | Green |
| `chart-3` | Secondary | Purple |
| `chart-4` | Warning, Pending | Orange/Yellow |
| `chart-5` | Shipped, In Transit | Cyan |
| `destructive` | Error, Cancelled | Red |
| `muted-foreground` | Draft, Inactive | Gray |

**Recommendation:** Indigo's design token approach is more maintainable. Document the token usage for consistency.

---

## 8. Action Menus

### MedusaJS ActionMenu
```typescript
<ActionMenu
  groups={[
    {
      actions: [
        { icon: <Pencil />, label: "Edit", to: `/products/${id}/edit` },
        { icon: <Trash />, label: "Delete", onClick: handleDelete, disabled: hasOrders },
      ],
    },
  ]}
  variant="transparent" | "primary"
/>
```

### Indigo DropdownMenu
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <HugeiconsIcon icon={MoreHorizontalIcon} />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${id}`)}>
      <HugeiconsIcon icon={ViewIcon} className="w-4 h-4 mr-2" />
      View
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
      <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Comparison

| Feature | MedusaJS | Indigo |
|---------|----------|--------|
| Grouping | Built-in groups | Manual separators |
| Disabled Tooltip | Built-in | Not implemented |
| Link Support | to prop | Manual router.push |
| Icon Styling | Automatic | Manual className |

**Recommendation:** Create an ActionMenu wrapper component with grouped actions and disabled tooltips.

---

## 9. Loading States

### MedusaJS Loading
```typescript
// Route-level loading with progress bar
<NavigationBar loading={navigation.state === "loading"} />

// Component-level with Skeleton
<Skeleton className="h-6 w-6 rounded-md" />
```

### Indigo Loading
```typescript
// Page-level loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

// Button loading with useTransition
const [isPending, startTransition] = useTransition()

<Button disabled={isPending}>
  {isPending ? "Saving..." : "Save"}
</Button>

// Refresh button
<Button onClick={() => router.refresh()} disabled={isPending}>
  <RefreshIcon className={cn("w-4 h-4", isPending && "animate-spin")} />
</Button>
```

### Comparison

| Feature | MedusaJS | Indigo |
|---------|----------|--------|
| Route Loading | Progress bar | loading.tsx |
| Skeleton | Built-in component | Not used |
| Button Loading | Not shown | Text change + disabled |
| Transition | React Router | useTransition |

**Recommendation:** Add skeleton loading states for better perceived performance. Consider adding a progress bar for route transitions.

---

## 10. Implementation Status

### ✅ Implemented Components

| Component | Location | Description |
|-----------|----------|-------------|
| DataTable | `components/dashboard/data-table/data-table.tsx` | URL-based state, filtering, sorting, pagination, row selection |
| ProgressBar | `components/ui/progress-bar.tsx` | Route transition indicator with Framer Motion |
| Skeleton | `components/ui/skeleton.tsx` | Loading skeletons (text, avatar, card, table, stats, form, list) |
| ActionMenu | `components/dashboard/action-menu.tsx` | Grouped actions with disabled tooltips |
| Form Components | `components/ui/form.tsx` | RHF integration (FormField, FormItem, FormLabel, etc.) |
| Form Helpers | `components/dashboard/forms/form-wrapper.tsx` | FormInput, FormTextarea, FormSwitch, FormSelect, FormPriceInput |
| Validation Schemas | `lib/validations/index.ts` | Zod schemas for product, category, customer, discount, etc. |
| EmptyState Variants | `components/ui/empty-state.tsx` | EmptyState, NoResults, NoRecords |

### Usage Examples

#### DataTable with URL State
```typescript
import { DataTable } from "@/components/dashboard/data-table";

<DataTable
  data={products}
  columns={[
    { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
    { id: "price", header: "Price", cell: (row) => formatCurrency(row.price) },
    { id: "status", header: "Status", accessorKey: "status" },
  ]}
  filters={[
    { id: "status", label: "Status", options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ]},
  ]}
  actions={[
    { label: "Add Product", href: "/dashboard/products/new", icon: <AddIcon /> },
  ]}
  getRowId={(row) => row.id}
  rowHref={(row) => `/dashboard/products/${row.id}`}
  totalCount={totalCount}
  enableSearch
  enablePagination
  enableRowSelection
  enableColumnVisibility
  bulkActions={[
    { label: "Delete", value: "delete", variant: "destructive" },
  ]}
  onBulkAction={handleBulkAction}
  emptyState={{
    icon: PackageIcon,
    title: "No products yet",
    description: "Add your first product to start selling",
    action: { label: "Add Product", onClick: () => router.push("/dashboard/products/new") },
  }}
/>
```

#### ActionMenu with Groups
```typescript
import { ActionMenu } from "@/components/dashboard/action-menu";

<ActionMenu
  groups={[
    {
      actions: [
        { label: "Edit", icon: PencilIcon, href: `/products/${id}/edit` },
        { label: "Duplicate", icon: CopyIcon, onClick: handleDuplicate },
      ],
    },
    {
      actions: [
        { 
          label: "Delete", 
          icon: TrashIcon, 
          onClick: handleDelete, 
          variant: "destructive",
          disabled: hasOrders,
          disabledTooltip: "Cannot delete product with orders",
        },
      ],
    },
  ]}
/>
```

#### Form with RHF
```typescript
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { FormInput, FormTextarea, FormSelect } from "@/components/dashboard/forms/form-wrapper";

const form = useForm<ProductFormData>({
  defaultValues: { name: "", price: 0, status: "draft" },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormInput form={form} name="name" label="Name" placeholder="Product name" />
    <FormTextarea form={form} name="description" label="Description" maxLength={500} />
    <FormPriceInput form={form} name="price" label="Price" currency="$" />
    <FormSelect 
      form={form} 
      name="status" 
      label="Status" 
      options={[
        { label: "Draft", value: "draft" },
        { label: "Active", value: "active" },
      ]} 
    />
    <Button type="submit">Save</Button>
  </form>
</Form>
```

#### Skeleton Loading
```typescript
import { SkeletonStats, SkeletonTable, SkeletonForm } from "@/components/ui/skeleton";

// In loading.tsx
export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonStats count={4} />
      <SkeletonTable rows={5} columns={4} />
    </div>
  );
}
```

---

## 11. Recommendations Summary

### ✅ Implemented (High Priority)
1. **Reusable DataTable** - URL-based state, column visibility, built-in filtering ✅
2. **Progress Bar** - Visual feedback for route transitions ✅
3. **Skeleton Loading** - Better perceived performance ✅
4. **ActionMenu Component** - Grouped actions with disabled tooltips ✅
5. **Form Components** - RHF integration with reusable field components ✅
6. **Validation Schemas** - Zod schemas for all entities ✅
7. **NoResults/NoRecords Variants** - Separate empty states ✅

### 📋 Remaining (Medium Priority)
8. **Route-Based Modals** - Better UX with shareable URLs
9. **i18n Support** - Add react-i18next for internationalization

### 📋 Future (Low Priority)
10. **Stacked Modals** - For complex workflows
11. **View Configurations** - Save table column preferences
12. **Keyboard Shortcuts** - Beyond command palette

---

## Appendix: Component Mapping

| MedusaJS Component | Indigo Equivalent | Status |
|--------------------|-------------------|--------|
| `Shell` | `SidebarProvider` + layout | ✅ Different architecture |
| `DataTable` | `DataTable` | ✅ Implemented |
| `ActionMenu` | `ActionMenu` | ✅ Implemented |
| `NoResults` | `NoResults` | ✅ Implemented |
| `NoRecords` | `NoRecords` | ✅ Implemented |
| `RouteDrawer` | `Sheet` | 📋 No URL integration |
| `RouteFocusModal` | `Dialog` | 📋 No URL integration |
| `Skeleton` | `Skeleton` + variants | ✅ Implemented |
| `ProgressBar` | `ProgressBar` | ✅ Implemented |
| `NavItem` | Custom nav components | ✅ Similar |
| `SectionRow` | Not implemented | 📋 Useful for detail pages |
| `Badge` | `Badge` | ✅ Different API |
| `IconButton` | `Button` variant="ghost" size="icon" | ✅ Same |
| `Form.Field` | `FormField` + helpers | ✅ Implemented |

---

## File References

### MedusaJS Files Analyzed
- `resources/medusa-develop/packages/admin/dashboard/src/components/layout/shell/shell.tsx`
- `resources/medusa-develop/packages/admin/dashboard/src/components/layout/main-layout/main-layout.tsx`
- `resources/medusa-develop/packages/admin/dashboard/src/components/data-table/data-table.tsx`
- `resources/medusa-develop/packages/admin/dashboard/src/components/common/empty-table-content/empty-table-content.tsx`
- `resources/medusa-develop/packages/admin/dashboard/src/components/common/action-menu/action-menu.tsx`
- `resources/medusa-develop/packages/admin/dashboard/src/components/common/section/section-row.tsx`

### Indigo Files Analyzed
- `components/dashboard/sidebar/navigation.ts`
- `components/dashboard/layout/dashboard-header.tsx`
- `components/dashboard/data-table/pagination.tsx`
- `components/dashboard/forms/product-form.tsx`
- `components/ui/empty-state.tsx`
- `app/dashboard/products/products-client.tsx`
- `app/dashboard/orders/orders-client.tsx`
