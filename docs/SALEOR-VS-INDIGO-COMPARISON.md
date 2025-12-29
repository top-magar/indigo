# Saleor Dashboard vs Indigo Dashboard Comparison

## Overview

| Aspect | Saleor Dashboard | Indigo Dashboard |
|--------|------------------|------------------|
| **Version** | v3.22.23 | Custom Build |
| **Framework** | React 18 + Vite | Next.js 14 (App Router) |
| **Routing** | React Router v5 | Next.js File-based |
| **State Management** | Apollo Client + Jotai | React hooks + Server Actions |
| **Data Layer** | GraphQL (Apollo) | Supabase (REST/RPC) |
| **UI Library** | Material UI + Macaw UI | shadcn/ui + Tailwind |
| **Form Handling** | react-hook-form + zod | react-hook-form + zod |
| **Drag & Drop** | @dnd-kit | @dnd-kit |
| **i18n** | react-intl | None (English only) |

---

## Architecture Comparison

### 1. Project Structure

**Saleor** - Feature-based modules:
```
src/
├── products/           # Feature module
│   ├── components/     # UI components
│   ├── views/          # Page containers
│   ├── mutations.ts    # GraphQL mutations
│   ├── queries.ts      # GraphQL queries
│   ├── urls.ts         # Route definitions
│   └── index.tsx       # Route exports
├── components/         # Shared components
├── hooks/              # Custom hooks
└── graphql/            # Generated types
```

**Indigo** - Next.js App Router:
```
app/
├── dashboard/
│   ├── products/
│   │   ├── page.tsx           # Server component
│   │   ├── products-client.tsx # Client component
│   │   ├── actions.ts         # Server actions
│   │   └── loading.tsx        # Loading state
│   └── layout.tsx             # Dashboard layout
├── components/
│   ├── ui/                    # shadcn components
│   └── dashboard/             # Dashboard-specific
└── lib/
    └── supabase/              # Database client
```

### 2. Data Fetching Patterns

**Saleor** - GraphQL with Apollo:
```tsx
// Uses generated hooks from GraphQL schema
const { data, refetch } = useProductListQuery({
  variables: { ...queryVariables },
});

// Mutations with optimistic updates
const [productBulkDelete] = useProductBulkDeleteMutation({
  onCompleted: (data) => {
    refetch();
    notify({ status: "success" });
  },
});
```

**Indigo** - Server Components + Server Actions:
```tsx
// Server Component (page.tsx)
export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId);
  
  return <ProductsClient products={products} />;
}

// Server Action (actions.ts)
"use server"
export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/dashboard/products");
}
```

### 3. Component Patterns

**Saleor** - Container/Presenter Pattern:
```tsx
// View (container) - handles data & logic
const ProductList = ({ params }) => {
  const { data } = useProductListQuery();
  const [deleteProduct] = useProductBulkDeleteMutation();
  
  return (
    <ProductListPage
      products={data?.products}
      onDelete={deleteProduct}
    />
  );
};

// Page (presenter) - pure UI
const ProductListPage = ({ products, onDelete }) => (
  <ListPageLayout>
    <TopNav title="Products" />
    <ProductListDatagrid products={products} />
  </ListPageLayout>
);
```

**Indigo** - Server/Client Split:
```tsx
// Server Component - data fetching
export default async function ProductsPage() {
  const products = await fetchProducts();
  return <ProductsClient products={products} />;
}

// Client Component - interactivity
"use client"
export function ProductsClient({ products }) {
  const [selected, setSelected] = useState([]);
  return <Table data={products} />;
}
```

---

## Feature Comparison

### Products Module

| Feature | Saleor | Indigo |
|---------|--------|--------|
| List View | Datagrid + Tiles toggle | Table only |
| Bulk Actions | ✅ Full support | ✅ Basic support |
| Filters | Advanced expression filters | Simple dropdowns |
| Filter Presets | ✅ Save/load presets | ❌ Not implemented |
| Export | ✅ CSV with options | ✅ Basic CSV |
| Variants | ✅ Full variant system | ✅ Basic variants |
| Attributes | ✅ Dynamic attributes | ❌ Fixed fields |
| Channels | ✅ Multi-channel pricing | ❌ Single store |
| SEO | ✅ Built-in SEO fields | ❌ Not implemented |

### Orders Module

| Feature | Saleor | Indigo |
|---------|--------|--------|
| Order Management | ✅ Full lifecycle | ✅ Basic CRUD |
| Fulfillment | ✅ Partial fulfillment | ❌ Simple status |
| Refunds | ✅ Granular refunds | ✅ Basic refunds |
| Draft Orders | ✅ Full support | ❌ Not implemented |
| Order Notes | ✅ Timeline/history | ❌ Not implemented |

### Customers Module

| Feature | Saleor | Indigo |
|---------|--------|--------|
| Customer List | ✅ Advanced filtering | ✅ Basic list |
| Customer Groups | ❌ Via metadata | ✅ Customer groups |
| Order History | ✅ Full history | ✅ Basic history |
| Addresses | ✅ Multiple addresses | ❌ Single address |

---

## UI/UX Patterns

### Layout System

**Saleor:**
- Uses `ListPageLayout`, `DetailPageLayout` wrappers
- Consistent `TopNav` with breadcrumbs
- `DashboardCard` for content sections
- Sticky savebar at bottom

**Indigo:**
- Uses shadcn `Card` components
- Custom `DashboardHeader` with breadcrumbs
- Sidebar with collapsible navigation
- Inline save buttons

### Data Tables

**Saleor:**
- Custom `Datagrid` component (Glide Data Grid)
- Virtual scrolling for large datasets
- Column customization
- Inline editing support

**Indigo:**
- shadcn `Table` component
- Standard pagination
- No virtualization
- Edit via modal/page

### Forms

**Saleor:**
- `react-hook-form` with custom wrappers
- `ExitFormDialogProvider` for unsaved changes
- Rich text editor (Editor.js)
- Complex validation with zod

**Indigo:**
- `react-hook-form` with shadcn components
- Basic unsaved changes handling
- Simple text inputs
- Zod validation

---

## What Indigo Can Learn from Saleor

### 1. Filter Presets System
Saleor's `useFilterPresets` hook allows users to save and load filter configurations:
```tsx
const { presets, onPresetSave, onPresetChange } = useFilterPresets({
  params,
  getUrl: productListUrl,
  storageUtils,
});
```
**Recommendation:** Implement filter presets for products, orders, customers.

### 2. Advanced Datagrid
Saleor uses Glide Data Grid for:
- Virtual scrolling (handles 10k+ rows)
- Column resizing/reordering
- Inline editing
- Custom cell renderers

**Recommendation:** Consider `@tanstack/react-table` with virtualization for large datasets.

### 3. Permission System
Saleor has granular permissions:
```tsx
<SectionRoute
  permissions={[PermissionEnum.MANAGE_PRODUCTS]}
  path="/products"
  component={ProductSection}
/>
```
**Recommendation:** Implement role-based access control beyond basic admin/user.

### 4. Internationalization
Saleor uses `react-intl` for all strings:
```tsx
intl.formatMessage({
  id: "productList.title",
  defaultMessage: "Products",
})
```
**Recommendation:** Add i18n support for multi-language dashboards.

### 5. Background Tasks
Saleor queues long-running operations:
```tsx
queue(Task.EXPORT, { id: exportFile.id });
```
**Recommendation:** Implement background job system for exports, bulk operations.

### 6. Feature Flags
Saleor has a feature flag system:
```tsx
const { enabled } = useFlag("newProductEditor");
```
**Recommendation:** Add feature flags for gradual rollouts.

---

## What Saleor Can Learn from Indigo

### 1. Server Components
Indigo's use of Next.js Server Components reduces client bundle:
```tsx
// Data fetching happens on server, no client-side loading states
export default async function ProductsPage() {
  const products = await fetchProducts();
  return <ProductsClient products={products} />;
}
```

### 2. Server Actions
Simpler mutation pattern without GraphQL boilerplate:
```tsx
"use server"
export async function updateProduct(formData: FormData) {
  await db.update(products).set(data).where(eq(products.id, id));
  revalidatePath("/dashboard/products");
}
```

### 3. Visual Editor
Indigo's storefront visual editor with:
- Drag-and-drop blocks
- Live preview
- Template system
- Keyboard shortcuts

### 4. Multi-tenant Architecture
Indigo's tenant isolation pattern:
```tsx
const { data } = await supabase
  .from("products")
  .select("*")
  .eq("tenant_id", tenantId); // Always scoped to tenant
```

---

## Technical Debt & Improvements

### Saleor Issues:
1. Still on React Router v5 (v6 migration pending)
2. Mixed Material UI v4 + Macaw UI (migration in progress)
3. Large bundle size (~2MB)
4. Complex GraphQL schema

### Indigo Issues:
1. No virtualization for large lists
2. Limited filter capabilities
3. No offline support
4. Missing audit logging
5. No webhook system

---

## Recommendations for Indigo

### High Priority:
1. **Add filter presets** - Copy Saleor's `useFilterPresets` pattern
2. **Implement virtual scrolling** - Use `@tanstack/react-virtual`
3. **Add audit logging** - Track all data changes
4. **Improve bulk operations** - Add progress indicators, background processing

### Medium Priority:
1. **Add feature flags** - For gradual feature rollouts
2. **Implement webhooks** - For external integrations
3. **Add i18n support** - For international users
4. **Improve permissions** - Granular role-based access

### Low Priority:
1. **Add GraphQL layer** - For external API consumers
2. **Implement draft orders** - For phone/manual orders
3. **Add product attributes** - Dynamic custom fields
4. **Multi-channel support** - Different pricing per channel

---

## Conclusion

Saleor is a mature, enterprise-grade e-commerce dashboard with comprehensive features but significant complexity. Indigo is a modern, streamlined dashboard leveraging Next.js 14's latest patterns for simplicity and performance.

**Saleor strengths:** Feature completeness, internationalization, enterprise patterns
**Indigo strengths:** Modern architecture, simplicity, multi-tenant design, visual editor

The ideal approach is to selectively adopt Saleor's proven patterns (filter presets, permissions, background tasks) while maintaining Indigo's architectural simplicity.
