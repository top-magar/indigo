# Saleor Products System - Deep Analysis

## Folder Structure Overview

```
resources/saleor-dashboard/src/products/
├── components/                    # UI Components
│   ├── OrderDiscountProviders/    # Discount context providers
│   ├── ProductCreatePage/         # Product creation page & form
│   ├── ProductDetailsForm/        # Name, description, rating form
│   ├── ProductExportDialog/       # Export products dialog
│   ├── ProductExternalMediaDialog/# External media URL dialog
│   ├── ProductListDatagrid/       # Product list datagrid
│   ├── ProductListPage/           # Product list page with filters
│   ├── ProductListTiles/          # Tile view for products
│   ├── ProductListViewSwitch/     # Toggle between list/tile view
│   ├── ProductMedia/              # Media upload & management
│   ├── ProductMediaNavigation/    # Media navigation sidebar
│   ├── ProductMediaPage/          # Individual media edit page
│   ├── ProductOrganization/       # Category, collections, product type
│   ├── ProductShipping/           # Weight & shipping settings
│   ├── ProductStocks/             # SKU, inventory tracking, warehouses
│   ├── ProductTaxes/              # Tax class selection
│   ├── ProductTile/               # Single product tile component
│   ├── ProductTypePickerDialog/   # Product type selection dialog
│   ├── ProductUpdatePage/         # Product edit page & form
│   ├── ProductVariantChannels/    # Variant channel availability
│   ├── ProductVariantCheckoutSettings/ # Checkout settings
│   ├── ProductVariantCreatePage/  # Create variant page
│   ├── ProductVariantDeleteDialog/# Delete variant confirmation
│   ├── ProductVariantEndPreorderDialog/ # End preorder dialog
│   ├── ProductVariantImageSelectDialog/ # Select variant image
│   ├── ProductVariantMedia/       # Variant media management
│   ├── ProductVariantName/        # Variant name display
│   ├── ProductVariantNavigation/  # Variant navigation sidebar
│   ├── ProductVariantPage/        # Variant edit page
│   ├── ProductVariantPrice/       # Variant pricing per channel
│   ├── ProductVariants/           # Variants datagrid
│   └── ProductVariantSetDefault/  # Set default variant
├── utils/                         # Utility functions
│   ├── data.ts                    # Data transformation utilities
│   ├── datagrid.ts               # Datagrid utilities
│   ├── handlers.ts               # Event handlers
│   ├── utils.tsx                 # General utilities
│   └── validation.ts             # Form validation
├── views/                         # Page views (containers)
│   ├── ProductCreate/            # Create product view
│   ├── ProductList/              # Product list view
│   ├── ProductUpdate/            # Update product view
│   ├── ProductVariant/           # Variant edit view
│   ├── ProductImage.tsx          # Image edit view
│   └── ProductVariantCreate.tsx  # Create variant view
├── fixtures.ts                    # Test fixtures
├── index.tsx                      # Route definitions
├── mutations.ts                   # GraphQL mutations
├── queries.ts                     # GraphQL queries
└── urls.ts                        # URL helpers
```

## Key Features

### 1. Product List Page
- **Datagrid view** with sortable columns
- **Tile view** alternative
- **View switch** toggle
- **Filters**: status, category, collection, price range, stock
- **Bulk actions**: delete, publish/unpublish
- **Export dialog**: CSV/XLSX export with field selection

### 2. Product Create/Update Page
Layout: Two-column with main content and sidebar

**Main Content (Left)**:
- ProductDetailsForm: Name, description (rich text), rating
- Attributes: Dynamic attribute inputs based on product type
- ProductShipping: Weight input (for simple products)
- ProductVariants: Datagrid for variant management
- SeoForm: Meta title, description, slug
- Metadata: Key-value metadata editor

**Sidebar (Right)**:
- ProductOrganization: Product type, category, collections
- ChannelsAvailabilityCard: Channel publish status
- ProductTaxes: Tax class selection

### 3. Product Media
- Drag & drop upload
- External URL upload (YouTube, Vimeo)
- Reorder via drag & drop
- Alt text editing
- Image cropping/editing page

### 4. Product Variants
- Datagrid with inline editing
- Columns: Name, SKU, price per channel, stock per warehouse, attributes
- Bulk operations
- Create/edit variant pages
- Variant-specific media selection

### 5. Product Stocks
- SKU input
- Track inventory toggle
- Per-warehouse stock levels
- Allocated vs available quantities

### 6. Channel Management
- Per-channel pricing
- Per-channel availability
- Publish/unpublish per channel
- Available for purchase toggle

## Component Patterns

### Card Pattern
```tsx
<DashboardCard>
  <DashboardCard.Header>
    <DashboardCard.Title>Title</DashboardCard.Title>
    <DashboardCard.Toolbar>Actions</DashboardCard.Toolbar>
  </DashboardCard.Header>
  <DashboardCard.Content>
    Content
  </DashboardCard.Content>
</DashboardCard>
```

### Form Pattern
- Uses `useForm` hook for state management
- Handlers for different input types
- Validation with error display
- Submit with loading state

### Data Flow
1. View fetches data via GraphQL query
2. Data passed to Page component
3. Page uses Form component for state
4. Form renders Card components
5. Submit triggers mutations
6. Optimistic updates + cache invalidation

## Key Types

### Product
- id, name, slug, description
- productType (determines attributes & variants)
- category, collections
- media (images, videos)
- variants (if hasVariants)
- attributes (based on productType)
- channelListings (per-channel data)
- metadata, privateMetadata

### ProductVariant
- id, name, sku
- product reference
- attributes (variant-specific)
- channelListings (pricing per channel)
- stocks (per warehouse)
- media (variant images)
- preorder settings

### Channel Listing
- channel reference
- isPublished, publishedAt
- isAvailableForPurchase
- visibleInListings
- price, costPrice

## Implementation Plan for Our App

### Phase 1: Enhanced Product Detail Page
1. ProductHeader - Status badges, actions menu
2. ProductInfoCard - Name, description, status
3. ProductMediaCard - Image gallery with upload
4. ProductPricingCard - Price, compare at price, cost
5. ProductInventoryCard - SKU, barcode, stock, tracking
6. ProductOrganizationCard - Category, collections
7. ProductShippingCard - Weight, dimensions
8. ProductSeoCard - Meta title, description, slug

### Phase 2: Variant Management
1. ProductVariantsCard - Variants table/grid
2. CreateVariantDialog - Add new variant
3. EditVariantDialog - Edit variant details
4. BulkEditVariantsDialog - Bulk stock/price update

### Phase 3: Enhanced Actions
1. Media upload with drag & drop
2. Media reordering
3. Variant stock management
4. Bulk operations

### Phase 4: List Enhancements
1. Advanced filters
2. Bulk actions
3. Export functionality
