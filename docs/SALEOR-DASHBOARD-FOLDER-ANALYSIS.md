# Saleor Dashboard - Folder-by-Folder Analysis

This document provides a detailed analysis of each folder in `resources/saleor-dashboard/src/`, documenting patterns, key files, and insights for Indigo development.

---

## Feature Modules (Domain-Specific)

### 1. `products/`
**Purpose**: Product catalog management - CRUD, variants, media, pricing

**Key Patterns**:
- Route-based code splitting via `index.tsx`
- URL state management with typed query params
- Datagrid for bulk editing variants
- Media upload with drag-drop

**Files to Study**:
- `index.tsx` - Route definitions with param parsing
- `urls.ts` - Type-safe URL builders
- `views/ProductList/` - List view with filters, pagination
- `components/ProductMedia/` - Media management UI

---

### 2. `orders/`
**Purpose**: Order lifecycle management - fulfillment, refunds, invoices

**Key Patterns**:
- Complex state machine for order status
- Timeline/activity log component
- Bulk actions (fulfill, cancel)
- Invoice generation as background task

**Notable Features**:
- Draft orders as separate workflow
- Partial fulfillment support
- Refund calculations

---

### 3. `customers/`
**Purpose**: Customer management - profiles, addresses, order history

**Key Patterns**:
- ConditionalFilter for advanced search
- Customer groups/segments
- Address book management
- Order history timeline

---

### 4. `discounts/`
**Purpose**: Promotions engine - sales, vouchers, coupons

**Structure**:
```
discounts/
├── components/     # UI components
├── models/         # Discount logic models
├── views/          # Page containers
├── handlers.ts     # Business logic handlers
├── types.ts        # TypeScript types
└── utils.ts        # Helper functions
```

**Key Patterns**:
- Separate flows for Sales vs Vouchers
- Complex rule builder UI
- Channel-specific pricing
- Usage limits and conditions

---

### 5. `giftCards/`
**Purpose**: Gift card issuance and management

**Key Features**:
- Bulk creation dialog
- Export functionality
- Settings configuration
- Balance tracking

**Pattern**: Uses hooks folder for feature-specific hooks

---

### 6. `channels/`
**Purpose**: Multi-channel commerce configuration

**Key Concept**: Channels enable:
- Different currencies per region
- Separate inventory pools
- Channel-specific pricing
- Localized checkout flows

**Files**:
- `validation.ts` - Channel configuration validation
- `ripples/` - Notification system for channel changes

---

### 7. `shipping/`
**Purpose**: Shipping zones and rate configuration

**Structure**:
- Shipping Zones (geographic regions)
- Shipping Methods (rate types)
- Rate creation with conditions

**Key Pattern**: Nested routes for zone → method → rate

---

### 8. `taxes/`
**Purpose**: Tax configuration and compliance

**Views**:
- Tax Channels List - per-channel tax settings
- Tax Countries List - country-specific rates
- Tax Classes List - product tax categories

---

### 9. `warehouses/`
**Purpose**: Inventory location management

**Features**:
- Multiple warehouse support
- Stock allocation rules
- Address management
- Click & collect configuration

---

### 10. `categories/`
**Purpose**: Product categorization hierarchy

**Pattern**: Tree structure with drag-drop reordering

---

### 11. `collections/`
**Purpose**: Curated product groupings

**Features**:
- Manual product assignment
- Automated rules (future)
- Featured collections

---

### 12. `attributes/`
**Purpose**: Dynamic product attributes system

**Key Concept**: Attributes define:
- Product specifications (color, size)
- Variant options
- Filterable properties

**Files**:
- `errors.ts` - Attribute validation errors
- `utils/` - Attribute manipulation helpers

---

### 13. `productTypes/`
**Purpose**: Product type templates

**Defines**:
- Which attributes a product has
- Variant configuration
- Tax class assignment

---

### 14. `staff/`
**Purpose**: Admin user management

**Features**:
- Staff member CRUD
- Permission assignment
- Activity tracking

---

### 15. `permissionGroups/`
**Purpose**: Role-based access control (RBAC)

**Pattern**: Groups contain permissions, users belong to groups

---

### 16. `translations/`
**Purpose**: Multi-language content management

**Translatable Entities**:
- Products, Categories, Collections
- Attributes, Pages
- Shipping methods, Vouchers

**Pattern**: Language → Entity Type → Entity routes

---

### 17. `siteSettings/`
**Purpose**: Global store configuration

---

### 18. `extensions/`
**Purpose**: App/plugin marketplace integration

**Key Files**:
- `extensionMountPoints.ts` - Where apps can inject UI
- `handlers.ts` - Extension lifecycle management
- `popup-frame-reference.ts` - Iframe communication

**Mount Points** (30+):
```typescript
PRODUCT_OVERVIEW_CREATE
PRODUCT_OVERVIEW_MORE_ACTIONS
PRODUCT_DETAILS_MORE_ACTIONS
PRODUCT_DETAILS_WIDGETS
ORDER_DETAILS_WIDGETS
NAVIGATION_SIDEBAR
// ... etc
```

---

### 19. `search/`
**Purpose**: Global search functionality

**Features**:
- Cross-entity search (products, orders, customers)
- Search history
- Scope filtering
- Keyboard navigation (Escape to close)

---

### 20. `welcomePage/`
**Purpose**: First-time user onboarding

---

### 21. `refundsSettings/`
**Purpose**: Refund policy configuration

---

## Infrastructure Folders

### 22. `components/` (130+ components)
**Purpose**: Shared UI component library

**Key Components**:

| Component | Purpose |
|-----------|---------|
| `Datagrid/` | Virtual scrolling data grid (Glide) |
| `ConditionalFilter/` | Advanced filter builder |
| `AppLayout/` | Main layout wrapper |
| `Sidebar/` | Navigation sidebar |
| `Savebar/` | Sticky save/cancel footer |
| `ActionDialog/` | Confirmation modals |
| `Form/` | Legacy form wrapper |
| `Timeline/` | Activity timeline |
| `Metadata/` | Key-value metadata editor |
| `RichTextEditor/` | WYSIWYG editor |
| `ImageUpload/` | Media upload component |
| `FilterPresetsSelect/` | Saved filter presets |

**Datagrid Features**:
- Virtual scrolling (10k+ rows)
- Inline editing
- Column picker
- Fullscreen mode
- Custom cell renderers
- Row selection with bulk actions

**ConditionalFilter Architecture**:
```
ConditionalFilter/
├── API/                  # Data fetching
├── context/              # React context
├── FilterElement/        # Filter model
├── FiltersQueryBuilder/  # GraphQL conversion
├── UI/                   # Visual components
├── Validation/           # Filter validation
└── ValueProvider/        # URL ↔ State sync
```

---

### 23. `hooks/` (50+ hooks)
**Purpose**: Reusable React hooks

**Essential Hooks**:

| Hook | Purpose |
|------|---------|
| `useFilterPresets` | Save/load filter configurations |
| `useBackgroundTask` | Queue long-running operations |
| `useWizard` | Multi-step form navigation |
| `useNotifier` | Toast notifications |
| `usePaginator` | Cursor-based pagination |
| `useNavigator` | Programmatic navigation |
| `useLocalStorage` | Persistent local state |
| `useBulkActions` | Multi-select operations |
| `useDebounce` | Input debouncing |
| `useClipboard` | Copy to clipboard |
| `useFormset` | Dynamic form arrays |

**useFilterPresets Pattern**:
```typescript
const {
  presets,           // Saved configurations
  selectedPreset,    // Active preset
  onPresetChange,    // Switch preset
  onPresetSave,      // Save current filters
  onPresetDelete,    // Remove preset
  hasPresetsChanged, // Dirty check
} = useFilterPresets({ params, getUrl, storageUtils });
```

**useWizard Pattern**:
```typescript
const [currentStep, { next, prev, set }] = useWizard(
  initialStep,
  ['step1', 'step2', 'step3'],
  { onTransition: (from, to) => console.log(`${from} → ${to}`) }
);
```

---

### 24. `containers/`
**Purpose**: React context providers

**Key Providers**:
- `BackgroundTasksProvider` - Task queue management
- `LocaleProvider` - i18n context
- `ShopProvider` - Store configuration

**BackgroundTasks System**:
```typescript
// Task types
enum Task {
  CUSTOM,
  EXPORT,
  INVOICE_GENERATE,
}

// Usage
const { queue, cancel } = useBackgroundTask();
queue(Task.EXPORT, { id: exportFileId });

// Polling every 15 seconds
// Notifications on completion/failure
```

---

### 25. `featureFlags/`
**Purpose**: Feature flag system

**Multi-Strategy Approach**:
1. LocalStorage (developer overrides)
2. Environment variables (build-time)
3. User metadata (server-side)

**Usage**:
```typescript
const { enabled, payload } = useFlag("newProductEditor");
if (enabled) {
  return <NewEditor config={payload} />;
}
```

---

### 26. `graphql/`
**Purpose**: Generated GraphQL code

**Generated Files**:
- `types.generated.ts` - TypeScript types
- `hooks.generated.ts` - React query/mutation hooks
- `fragmentTypes.generated.ts` - Apollo cache config
- `typePolicies.generated.ts` - Cache policies

---

### 27. `fragments/`
**Purpose**: Reusable GraphQL fragments

---

### 28. `utils/`
**Purpose**: Utility functions

**Key Utilities**:
- `sort.ts` - Sorting helpers
- `filters/` - Filter utilities
- `errors.ts` - Error handling
- `money.ts` - Currency formatting

---

### 29. `services/`
**Purpose**: External service integrations

---

### 30. `theme/`
**Purpose**: Theming system

---

### 31. `icons/`
**Purpose**: Custom icon components

---

### 32. `searches/`
**Purpose**: Search query definitions

---

### 33. `modeling/` & `modelTypes/`
**Purpose**: Data modeling utilities

---

### 34. `structures/`
**Purpose**: Data structure utilities

---

### 35. `ripples/`
**Purpose**: Notification/toast system

---

### 36. `files/`
**Purpose**: File handling utilities

---

## Root Files

| File | Purpose |
|------|---------|
| `config.ts` | App configuration |
| `index.tsx` | App entry point |
| `intl.ts` | i18n setup |
| `links.ts` | External links |
| `misc.ts` | Miscellaneous utilities |
| `types.ts` | Global types |
| `colors.ts` | Color definitions |
| `themeOverrides.ts` | Theme customization |
| `url-utils.ts` | URL manipulation |
| `NotFound.tsx` | 404 page |

---

## Key Patterns Summary

### 1. Feature Module Structure
```
feature/
├── index.tsx          # Routes
├── urls.ts            # URL builders
├── queries.ts         # GraphQL queries
├── mutations.ts       # GraphQL mutations
├── fixtures.ts        # Test data
├── components/        # Feature UI
├── views/             # Page containers
└── utils/             # Feature helpers
```

### 2. URL-Based State
- Dialogs, filters, pagination in URL
- Type-safe URL builders
- Query string parsing with `parseQs`

### 3. Data Fetching
- Apollo Client for GraphQL
- Generated hooks for type safety
- Optimistic updates
- Cache normalization

### 4. Form Handling
- react-hook-form + zod
- Exit form dialog for unsaved changes
- Inline validation

### 5. List Pages
- Datagrid with virtual scrolling
- ConditionalFilter for advanced filtering
- Filter presets for saved searches
- Bulk actions on selection

---

## Recommendations for Indigo

### High Priority Adoptions

1. **Filter Presets** - Let users save filter configurations
2. **Background Tasks** - Queue exports, imports, bulk operations
3. **Exit Form Dialog** - Prevent accidental data loss
4. **URL State** - Shareable, bookmarkable views

### Medium Priority

5. **Feature Flags** - Gradual rollouts
6. **Extension Mount Points** - Future plugin system
7. **Datagrid** - For inventory/variant management

### Consider Alternatives

- **Material UI v4** → Already using shadcn/ui ✓
- **React Router v5** → Using Next.js App Router ✓
- **GraphQL** → REST/RPC can be simpler for our scale

---

## Implementation Priorities

| Feature | Effort | Impact | Files to Reference |
|---------|--------|--------|-------------------|
| Filter Presets | Medium | High | `hooks/useFilterPresets/` |
| Background Tasks | Medium | Medium | `containers/BackgroundTasks/` |
| Exit Form Dialog | Low | Medium | `components/Form/ExitFormDialog/` |
| Feature Flags | Low | Medium | `featureFlags/` |
| Extension System | High | Low | `extensions/` |
