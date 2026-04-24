# Saleor Dashboard - Comprehensive Code Analysis

## Executive Summary

Saleor Dashboard is a mature, enterprise-grade React admin panel for e-commerce. Version 3.22.23 represents years of development with sophisticated patterns for handling complex commerce workflows.

---

## 1. Build System & Configuration

### Tech Stack
```
Framework:     React 18.3.1 + Vite 6.4.1
Language:      TypeScript 5.8.3 (non-strict mode with plugin)
State:         Apollo Client 3.4.17 + Jotai 2.14.0
Routing:       React Router 5.3.4
UI:            Material UI 4.x + Macaw UI (Saleor's design system)
Forms:         react-hook-form 7.66.0 + zod 3.25.76
Data Grid:     @glideapps/glide-data-grid 5.3.0
i18n:          react-intl 5.25.1
Testing:       Jest + Playwright
```

### Vite Configuration Highlights
```javascript
// Key features from vite.config.js:
- Path aliases: @dashboard, @assets, @locale
- Environment variable injection via createHtmlPlugin
- Sentry integration for error tracking
- Service worker for offline support
- Vendor chunk splitting for caching
- Node polyfills for browser compatibility
```

### GraphQL Code Generation
```typescript
// codegen-main.ts generates:
- fragmentTypes.generated.ts    // Apollo cache config
- typePolicies.generated.ts     // Cache policies
- types.generated.ts            // TypeScript types
- hooks.generated.ts            // React hooks for queries/mutations
```

---

## 2. Project Architecture

### Directory Structure
```
src/
├── auth/                 # Authentication module
├── products/             # Products feature module
├── orders/               # Orders feature module
├── customers/            # Customers feature module
├── discounts/            # Discounts/promotions module
├── categories/           # Categories module
├── collections/          # Collections module
├── channels/             # Multi-channel support
├── shipping/             # Shipping configuration
├── taxes/                # Tax management
├── translations/         # i18n content
├── staff/                # Staff/user management
├── permissionGroups/     # RBAC permissions
├── warehouses/           # Inventory locations
├── giftCards/            # Gift card management
├── extensions/           # App/plugin system
├── components/           # Shared UI components (100+)
├── hooks/                # Custom React hooks (50+)
├── graphql/              # Generated GraphQL code
├── utils/                # Utility functions
├── services/             # External services
├── featureFlags/         # Feature flag system
├── theme/                # Theming system
└── containers/           # Context providers
```

### Feature Module Pattern
Each feature module follows a consistent structure:
```
products/
├── index.tsx             # Route definitions
├── urls.ts               # URL builders & types
├── queries.ts            # GraphQL queries
├── mutations.ts          # GraphQL mutations
├── fixtures.ts           # Test data
├── components/           # Feature-specific components
│   ├── ProductListPage/
│   ├── ProductDetailsPage/
│   └── ProductCreatePage/
├── views/                # Container components
│   ├── ProductList/
│   ├── ProductUpdate/
│   └── ProductCreate/
└── utils/                # Feature utilities
```

---

## 3. Core Systems Deep Dive

### 3.1 Routing System

**URL Management Pattern:**
```typescript
// urls.ts - Type-safe URL builders
export const productListPath = "/products/";
export type ProductListUrlDialog = "delete" | "export" | "create-product";

export interface ProductListUrlQueryParams
  extends BulkAction, Dialog<ProductListUrlDialog>, 
          ProductListUrlFilters, Pagination, ActiveTab {
  attributeId?: string;
}

export const productListUrl = (params?: ProductListUrlQueryParams): string =>
  productListPath + "?" + stringifyQs(params);
```

**Route Component Pattern:**
```typescript
// index.tsx - Feature routes
const ProductList = ({ location }: RouteComponentProps) => {
  const qs = parseQs(location.search.substr(1));
  const params: ProductListUrlQueryParams = asSortParams(qs, ...);
  
  return (
    <ConditionalProductFilterProvider locationSearch={location.search}>
      <ProductListComponent params={params} />
    </ConditionalProductFilterProvider>
  );
};
```

### 3.2 Data Fetching with Apollo

**Query Pattern:**
```typescript
// queries.ts
export const productListQuery = gql`
  query ProductList(
    $first: Int, $after: String, $filter: ProductFilterInput,
    $search: String, $channel: String, $sort: ProductOrder
  ) {
    products(first: $first, after: $after, filter: $filter, 
             search: $search, sortBy: $sort, channel: $channel) {
      edges { node { ...ProductWithChannelListings } }
      pageInfo { hasNextPage, endCursor }
      totalCount
    }
  }
`;

// Usage in view
const { data, refetch } = useProductListQuery({
  displayLoader: true,
  variables: queryVariables,
  skip: valueProvider.loading,
});
```

**Mutation Pattern:**
```typescript
const [productBulkDelete, productBulkDeleteOpts] = useProductBulkDeleteMutation({
  onCompleted: data => {
    if (data.productBulkDelete.errors.length === 0) {
      closeModal();
      notify({ status: "success", text: intl.formatMessage(commonMessages.savedChanges) });
      refetch();
      clearRowSelection();
    }
  },
});
```

### 3.3 State Management

**Jotai for Global State:**
```typescript
// Used for feature flags, ripples (notifications), modal state
import { atom, useAtom } from 'jotai';

const isModalOpenAtom = atom(false);
const [isOpen, setIsOpen] = useAtom(isModalOpenAtom);
```

**Apollo Cache as Server State:**
```typescript
// typePolicies for cache normalization
const cache = new InMemoryCache({
  possibleTypes: introspectionData.possibleTypes,
  typePolicies: {
    CountryDisplay: { keyFields: ["code"] },
    Money: { merge: false },
    Shop: { keyFields: [] },
  },
});
```

### 3.4 Form System

**Legacy Form Component (deprecated):**
```typescript
<Form
  initial={initialData}
  onSubmit={handleSubmit}
  confirmLeave={true}
  checkIfSaveIsDisabled={data => !data.name}
>
  {({ change, data, submit }) => (
    <TextField value={data.name} onChange={change} />
  )}
</Form>
```

**Modern react-hook-form:**
```typescript
const { control, handleSubmit, formState } = useForm({
  resolver: zodResolver(schema),
  defaultValues: initialData,
});

<Controller
  name="name"
  control={control}
  render={({ field }) => <TextField {...field} />}
/>
```

**Exit Form Dialog Provider:**
```typescript
// Prevents accidental navigation with unsaved changes
<ExitFormDialogProvider>
  {children}
</ExitFormDialogProvider>

// Hook usage
const { setIsDirty, shouldBlockNavigation } = useExitFormDialog();
```

### 3.5 Datagrid System

**Glide Data Grid Integration:**
```typescript
<DataEditor
  columns={availableColumns}
  rows={rowsTotal}
  getCellContent={handleGetCellContent}
  onCellEdited={handleOnCellEdited}
  onGridSelectionChange={handleGridSelectionChange}
  rowMarkers="checkbox"
  freezeColumns={1}
  smoothScrollX
  rowSelect="multi"
  rangeSelect="multi-rect"
  // Custom renderers for special cell types
  customRenderers={customRenderers}
  // Row actions on the right
  rightElement={<RowActions menuItems={menuItems} />}
/>
```

**Key Features:**
- Virtual scrolling for 10k+ rows
- Column resizing/reordering
- Inline editing
- Multi-select with bulk actions
- Custom cell renderers (money, status, avatar)
- Fullscreen mode
- Keyboard navigation

### 3.6 Filter System (ConditionalFilter)

**Architecture:**
```
ConditionalFilter/
├── context/              # React context for filter state
├── FilterElement/        # Filter condition model
├── ValueProvider/        # URL <-> Filter state sync
├── FiltersQueryBuilder/  # Convert filters to GraphQL
├── UI/                   # Filter UI components
├── Validation/           # Filter validation
└── API/                  # Filter options fetching
```

**Filter Element Model:**
```typescript
interface FilterElement {
  condition: Condition;        // equals, contains, gt, lt, etc.
  value: ConditionValue;       // The filter value
  constraint: Constraint;      // AND/OR logic
}
```

**Usage:**
```typescript
const { valueProvider } = useConditionalFilterContext();
const filterVariables = createOrderQueryVariables(valueProvider.value);

// Filters are persisted to URL and restored on page load
```

### 3.7 Filter Presets System

**Hook Implementation:**
```typescript
const {
  presets,              // Saved filter configurations
  selectedPreset,       // Currently active preset
  onPresetChange,       // Switch to a preset
  onPresetSave,         // Save current filters as preset
  onPresetDelete,       // Delete a preset
  hasPresetsChanged,    // Check if filters differ from preset
} = useFilterPresets({
  params,
  getUrl: productListUrl,
  storageUtils,         // localStorage adapter
});
```

**Storage Pattern:**
```typescript
// Presets stored in localStorage per feature
const storageUtils = {
  getFilterTabs: () => JSON.parse(localStorage.getItem('productFilters') || '[]'),
  saveFilterTab: (name, data) => { /* ... */ },
  deleteFilterTab: (index) => { /* ... */ },
};
```

---

## 4. UI Component Library

### 4.1 Layout Components

**AppLayout:**
```typescript
<Box display="grid" __gridTemplateColumns="auto 1fr">
  <Sidebar />
  <Box as="main">
    {children}
  </Box>
  <Savebar /> {/* Portal-based sticky footer */}
</Box>
```

**TopNav:**
```typescript
<TopNav
  title="Products"
  subtitle={contextualLink}
  href="/products"  // Back button
>
  <TopNav.Menu items={menuItems} />
  <Button onClick={onAdd}>Create Product</Button>
</TopNav>
```

**Page Layouts:**
```typescript
// List pages
<ListPageLayout>
  <TopNav />
  <DashboardCard>
    <ListFilters />
    <Datagrid />
  </DashboardCard>
</ListPageLayout>

// Detail pages
<DetailPageLayout>
  <TopNav />
  <Grid>
    <MainContent />
    <Sidebar />
  </Grid>
  <Savebar />
</DetailPageLayout>
```

### 4.2 Sidebar Navigation

**Menu Structure:**
```typescript
const menuItems: SidebarMenuItem[] = [
  {
    icon: <ProductsIcon />,
    label: "Catalog",
    id: "products",
    url: productListUrl(),
    permissions: [PermissionEnum.MANAGE_PRODUCTS],
    type: "itemGroup",
    children: [
      { label: "Products", url: productListUrl(), type: "item" },
      { label: "Categories", url: categoryListUrl(), type: "item" },
      { label: "Collections", url: collectionListUrl(), type: "item" },
    ],
  },
  // ... more items
];
```

**Permission Filtering:**
```typescript
const isMenuItemPermitted = (menuItem: SidebarMenuItem) => {
  const userPermissions = user?.userPermissions?.map(p => p.code) || [];
  return menuItem.permissions?.some(p => userPermissions.includes(p)) ?? true;
};
```

### 4.3 Dialog System

**Action Dialog:**
```typescript
<ActionDialog
  open={params.action === "delete"}
  confirmButtonState={deleteOpts.status}
  onClose={closeModal}
  onConfirm={handleDelete}
  title="Delete Products"
  variant="delete"
>
  Are you sure you want to delete {count} products?
</ActionDialog>
```

**Dialog Action Handlers:**
```typescript
const [openModal, closeModal] = createDialogActionHandlers<
  ProductListUrlDialog,
  ProductListUrlQueryParams
>(navigate, productListUrl, params);

// Opens modal by updating URL params
openModal("delete");  // ?action=delete
closeModal();         // removes action param
```

---

## 5. Advanced Patterns

### 5.1 Background Tasks

**Task Queue System:**
```typescript
const { queue, cancel } = useBackgroundTask();

// Queue an export task
queue(Task.EXPORT, { id: exportFile.id });

// Tasks are polled every 15 seconds
useEffect(() => {
  const intervalId = setInterval(() => {
    tasks.current.forEach(async task => {
      if (task.status === TaskStatus.PENDING) {
        const status = await handleTask(task);
        // Update task status
      }
    });
  }, 15000);
  return () => clearInterval(intervalId);
}, []);
```

### 5.2 Feature Flags

**Multi-Strategy System:**
```typescript
// Strategies in priority order:
const strategies = [
  new LocalStorageStrategy(),    // Developer overrides
  new EnvVarsStrategy(),         // Build-time flags
  new MetadataStrategy(user.metadata), // User-specific flags
];

// Usage
const { enabled } = useFlag("newProductEditor");
if (enabled) {
  return <NewEditor />;
}
```

### 5.3 Extensions/Apps System

**Extension Mount Points:**
```typescript
const extensionMountPoints = {
  NAVIGATION_SIDEBAR: "navigationSidebar",
  NAVIGATION_CATALOG: "navigationCatalog",
  PRODUCT_OVERVIEW_CREATE: "productOverviewCreate",
  PRODUCT_OVERVIEW_MORE_ACTIONS: "productOverviewMoreActions",
  // ... 20+ mount points
};

// Extensions inject UI at mount points
const { PRODUCT_OVERVIEW_CREATE } = useExtensions(extensionMountPoints.PRODUCT_LIST);
```

### 5.4 Pagination

**Cursor-Based Pagination:**
```typescript
const paginationState = createPaginationState(settings.rowNumber, params);
// { first: 20, after: "cursor123" } or { last: 20, before: "cursor456" }

const paginationValues = usePaginator({
  pageInfo: data?.products?.pageInfo,
  paginationState,
  queryString: params,
});

// Returns: { loadNextPage, loadPreviousPage, pageInfo }
```

### 5.5 Notification System

**Toast Notifications:**
```typescript
const notify = useNotifier();

notify({
  status: "success",
  text: "Product saved",
  title: "Success",
});

notify({
  status: "error",
  text: "Failed to save product",
  apiMessage: error.message,
});
```

---

## 6. Testing Strategy

### Unit Tests (Jest)
```typescript
// Component tests
describe("ProductListPage", () => {
  it("renders empty state when no products", () => {
    render(<ProductListPage products={[]} />);
    expect(screen.getByText("No products")).toBeInTheDocument();
  });
});

// Hook tests
describe("useFilterPresets", () => {
  it("saves preset to localStorage", () => {
    const { result } = renderHook(() => useFilterPresets(options));
    act(() => result.current.onPresetSave({ name: "My Filter" }));
    expect(localStorage.getItem("productFilters")).toContain("My Filter");
  });
});
```

### E2E Tests (Playwright)
```typescript
test("can create a product", async ({ page }) => {
  await page.goto("/products/add");
  await page.fill('[name="name"]', "Test Product");
  await page.fill('[name="price"]', "99.99");
  await page.click('button:has-text("Save")');
  await expect(page).toHaveURL(/\/products\/\w+/);
});
```

---

## 7. Performance Optimizations

### Code Splitting
```typescript
// Lazy-loaded feature modules
const ProductSection = lazy(() => import("./products"));
const OrdersSection = lazy(() => import("./orders"));

<Suspense fallback={<LoginLoading />}>
  <Switch>
    <Route path="/products" component={ProductSection} />
    <Route path="/orders" component={OrdersSection} />
  </Switch>
</Suspense>
```

### Memoization
```typescript
// Expensive computations
const sortedBlocks = useMemo(
  () => [...blocks].sort((a, b) => a.order - b.order),
  [blocks]
);

// Callback stability
const handleSort = useCallback(
  (field: string) => navigate(productListUrl({ ...params, sort: field })),
  [navigate, params]
);
```

### Virtual Scrolling
```typescript
// Glide Data Grid handles virtualization automatically
// Only renders visible rows + buffer
<DataEditor
  rows={10000}  // Can handle large datasets
  rowHeight={48}
  // Only ~50 rows rendered at a time
/>
```

---

## 8. Key Takeaways for Indigo

### Patterns to Adopt:

1. **Filter Presets** - Save/load filter configurations
2. **URL-Based State** - Dialogs, filters, pagination in URL
3. **Background Tasks** - Queue long-running operations
4. **Feature Flags** - Gradual rollouts
5. **Exit Form Dialog** - Prevent accidental data loss
6. **Permission-Based Navigation** - Hide unauthorized items
7. **Datagrid with Virtual Scrolling** - Handle large datasets

### Patterns to Avoid:

1. **Legacy Form Component** - Use react-hook-form directly
2. **Material UI v4** - Outdated, use modern alternatives
3. **React Router v5** - Migrate to v6 or use Next.js
4. **Complex GraphQL Schema** - REST/RPC can be simpler

### Implementation Priority:

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Filter Presets | Medium | High | 1 |
| Virtual Scrolling | Medium | High | 2 |
| Background Tasks | Medium | Medium | 3 |
| Feature Flags | Low | Medium | 4 |
| Exit Form Dialog | Low | Medium | 5 |
| Permission Navigation | Low | Low | 6 |
