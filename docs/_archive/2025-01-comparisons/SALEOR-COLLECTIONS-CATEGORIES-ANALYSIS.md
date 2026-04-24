# Saleor Collections & Categories System - Deep Analysis

## Overview

Both Collections and Categories in Saleor follow similar patterns but serve different purposes:
- **Categories**: Hierarchical product organization (parent-child relationships)
- **Collections**: Curated product groupings (flat structure, manual product assignment)

---

## COLLECTIONS FOLDER STRUCTURE

```
resources/saleor-dashboard/src/collections/
├── components/
│   ├── CollectionCreatePage/
│   │   ├── CollectionCreatePage.tsx    # Create page layout
│   │   └── form.tsx                    # Form state management
│   ├── CollectionDetails/
│   │   └── CollectionDetails.tsx       # Name & description card
│   ├── CollectionDetailsPage/
│   │   ├── CollectionDetailsPage.tsx   # Edit page layout
│   │   └── form.tsx                    # Update form state
│   ├── CollectionImage/
│   │   └── CollectionImage.tsx         # Background image upload
│   ├── CollectionListDatagrid/
│   │   ├── CollectionListDatagrid.tsx  # Datagrid component
│   │   ├── datagrid.ts                 # Column definitions
│   │   ├── datagrid.test.ts            # Tests
│   │   ├── messages.ts                 # i18n messages
│   │   └── index.ts                    # Exports
│   ├── CollectionListPage/
│   │   ├── CollectionListPage.tsx      # List page layout
│   │   ├── filters.ts                  # Filter definitions
│   │   └── index.ts                    # Exports
│   └── CollectionProducts/
│       ├── CollectionProducts.tsx      # Products management card
│       ├── ProductsTable.tsx           # Products table
│       ├── ProductTableItem.tsx        # Single product row
│       ├── ProductTableSkeleton.tsx    # Loading skeleton
│       ├── Pagination.tsx              # Pagination controls
│       ├── types.ts                    # Type definitions
│       ├── useCollectionId.ts          # Hook for collection ID
│       ├── useProductDrag.ts           # Drag & drop hook
│       ├── useProductEdges.ts          # Product edges hook
│       ├── useProductReorder.ts        # Reorder mutation hook
│       └── useProductReorderOptimistic.ts # Optimistic updates
├── views/
│   ├── CollectionList/
│   │   ├── CollectionList.tsx          # List view container
│   │   ├── filters.ts                  # Filter logic
│   │   ├── sort.ts                     # Sort logic
│   │   └── index.ts                    # Exports
│   ├── CollectionCreate.tsx            # Create view container
│   ├── CollectionDetails.tsx           # Details view container
│   └── consts.ts                       # Form IDs
├── fixtures.ts                         # Test fixtures
├── index.tsx                           # Route definitions
├── mutations.ts                        # GraphQL mutations
├── queries.ts                          # GraphQL queries
├── types.ts                            # Type definitions
├── urls.ts                             # URL helpers
├── utils.ts                            # Utility functions
└── utils.test.ts                       # Utility tests
```

### Collection Key Features

1. **Collection List Page**
   - Datagrid with sortable columns (name, availability, product count)
   - Filter presets (saved filters)
   - Bulk delete
   - Channel-based filtering
   - Search functionality

2. **Collection Create Page**
   - Name & description (rich text editor)
   - Background image upload
   - SEO settings (title, description, slug)
   - Channel availability (publish/unpublish per channel)
   - Metadata

3. **Collection Details Page**
   - All create fields + edit capabilities
   - Products management:
     - Assign products dialog
     - Unassign products
     - Product reordering (drag & drop)
     - Pagination
   - Delete collection
   - Delete background image

### Collection Data Structure

```typescript
interface CollectionCreateData {
  name: string;
  description: OutputData; // Rich text (EditorJS)
  backgroundImage: { url: string; value: File };
  backgroundImageAlt: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  channelListings: ChannelCollectionData[];
  metadata: MetadataItem[];
  privateMetadata: MetadataItem[];
}

interface ChannelCollectionData {
  id: string;
  name: string;
  isPublished: boolean;
  publishedAt: string | null;
}
```

---

## CATEGORIES FOLDER STRUCTURE

```
resources/saleor-dashboard/src/categories/
├── components/
│   ├── CategoryBackground/
│   │   ├── CategoryBackground.tsx      # Background image upload
│   │   └── index.ts                    # Exports
│   ├── CategoryCreatePage/
│   │   ├── CategoryCreatePage.tsx      # Create page layout
│   │   ├── form.tsx                    # Form state management
│   │   └── index.ts                    # Exports
│   ├── CategoryDetailsForm/
│   │   ├── CategoryDetailsForm.tsx     # Name & description card
│   │   └── index.ts                    # Exports
│   ├── CategoryListDatagrid/
│   │   ├── CategoryListDatagrid.tsx    # Datagrid component
│   │   ├── datagrid.ts                 # Column definitions
│   │   ├── messages.ts                 # i18n messages
│   │   └── index.ts                    # Exports
│   ├── CategoryListPage/
│   │   ├── CategoryListPage.tsx        # List page layout
│   │   └── messages.ts                 # i18n messages
│   ├── CategoryProductListDatagrid/
│   │   ├── CategoryProductListDatagrid.tsx # Products datagrid
│   │   ├── datagrid.ts                 # Column definitions
│   │   ├── messages.ts                 # i18n messages
│   │   └── index.ts                    # Exports
│   ├── CategoryProducts/
│   │   ├── CategoryProducts.tsx        # Products card
│   │   └── index.ts                    # Exports
│   ├── CategorySubcategories/
│   │   ├── CategorySubcategories.tsx   # Subcategories card
│   │   └── index.ts                    # Exports
│   └── CategoryUpdatePage/
│       ├── CategoryUpdatePage.tsx      # Update page layout
│       └── form.tsx                    # Update form state
├── views/
│   ├── CategoryList/
│   │   ├── CategoryList.tsx            # List view container
│   │   ├── filter.ts                   # Filter logic
│   │   ├── sort.ts                     # Sort logic
│   │   └── index.ts                    # Exports
│   ├── CategoryCreate.tsx              # Create view container
│   └── CategoryDetails.tsx             # Details view container
├── fixtures.ts                         # Test fixtures
├── index.tsx                           # Route definitions
├── mutations.ts                        # GraphQL mutations
├── queries.ts                          # GraphQL queries
└── urls.ts                             # URL helpers
```

### Category Key Features

1. **Category List Page**
   - Datagrid with columns (name, subcategories count, products count)
   - Filter presets
   - Bulk delete
   - Search functionality

2. **Category Create Page**
   - Name & description (rich text editor)
   - SEO settings (title, description, slug)
   - Metadata
   - Parent category support (via URL param)

3. **Category Update Page**
   - All create fields + edit capabilities
   - Background image upload
   - **Tabbed interface**:
     - Subcategories tab (nested categories)
     - Products tab (products in category)
   - Subcategory management:
     - Create subcategory button
     - Bulk delete subcategories
   - Products management:
     - View products link
     - Add product link
     - Bulk delete products
   - Delete category

### Category Data Structure

```typescript
interface CategoryCreateData {
  name: string;
  description: OutputData | null; // Rich text (EditorJS)
  slug: string;
  seoTitle: string;
  seoDescription: string;
  metadata: MetadataItem[];
  privateMetadata: MetadataItem[];
}

interface CategoryUpdateData extends CategoryCreateData {
  backgroundImageAlt: string;
}

// Category has hierarchical structure
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  backgroundImage: Image | null;
  parent: Category | null;      // Parent category
  children: Category[];         // Subcategories
  products: Product[];          // Products in category
  level: number;                // Nesting level
}
```

---

## KEY DIFFERENCES

| Feature | Collections | Categories |
|---------|-------------|------------|
| Structure | Flat | Hierarchical (parent-child) |
| Product Assignment | Manual (assign/unassign) | Automatic (product belongs to category) |
| Product Reordering | Yes (drag & drop) | No |
| Channel Availability | Yes (per-channel publish) | No |
| Background Image | Yes | Yes |
| Subcategories | No | Yes |
| Nesting | No | Unlimited depth |

---

## COMPONENT PATTERNS

### Card Pattern (Both)
```tsx
<DashboardCard>
  <DashboardCard.Header>
    <DashboardCard.Title>Title</DashboardCard.Title>
    <DashboardCard.Toolbar>
      <Button>Action</Button>
    </DashboardCard.Toolbar>
  </DashboardCard.Header>
  <DashboardCard.Content>
    {/* Content */}
  </DashboardCard.Content>
</DashboardCard>
```

### Page Layout Pattern
```tsx
<DetailPageLayout>
  <TopNav href={backUrl} title={title}>
    {/* Nav actions */}
  </TopNav>
  <DetailPageLayout.Content>
    {/* Main content cards */}
  </DetailPageLayout.Content>
  <DetailPageLayout.RightSidebar>
    {/* Sidebar cards (collections only) */}
  </DetailPageLayout.RightSidebar>
  <Savebar>
    <Savebar.DeleteButton onClick={onDelete} />
    <Savebar.Spacer />
    <Savebar.CancelButton onClick={onCancel} />
    <Savebar.ConfirmButton onClick={submit} />
  </Savebar>
</DetailPageLayout>
```

### Form Pattern
```tsx
<FormComponent onSubmit={handleSubmit} disabled={loading}>
  {({ data, change, handlers, submit, isSaveDisabled }) => (
    <RichTextContext.Provider value={richText}>
      {/* Form fields */}
    </RichTextContext.Provider>
  )}
</FormComponent>
```

---

## IMPLEMENTATION PLAN FOR OUR APP

### Phase 1: Enhanced Collections

**Types (`src/app/dashboard/collections/types.ts`)**
```typescript
interface Collection {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}
```

**Components to Create:**
1. `CollectionHeader` - Title, status, actions
2. `CollectionInfoCard` - Name, description
3. `CollectionImageCard` - Background image upload
4. `CollectionSeoCard` - SEO settings
5. `CollectionProductsCard` - Products management
6. `AssignProductsDialog` - Product assignment

### Phase 2: Enhanced Categories

**Types (`src/app/dashboard/categories/types.ts`)**
```typescript
interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentId?: string;
  parentName?: string;
  level: number;
  productCount: number;
  subcategoryCount: number;
  createdAt: string;
  updatedAt: string;
}
```

**Components to Create:**
1. `CategoryHeader` - Title, breadcrumb, actions
2. `CategoryInfoCard` - Name, description
3. `CategoryImageCard` - Background image upload
4. `CategorySeoCard` - SEO settings
5. `CategorySubcategoriesCard` - Subcategories table
6. `CategoryProductsCard` - Products table

### Phase 3: Server Actions

**Collection Actions:**
- `getCollectionDetail(id)` - Fetch collection with products
- `createCollection(data)` - Create new collection
- `updateCollection(id, data)` - Update collection
- `deleteCollection(id)` - Delete collection
- `assignProducts(collectionId, productIds)` - Assign products
- `unassignProducts(collectionId, productIds)` - Remove products
- `reorderProducts(collectionId, productIds)` - Reorder products
- `uploadCollectionImage(id, file)` - Upload background image
- `deleteCollectionImage(id)` - Remove background image

**Category Actions:**
- `getCategoryDetail(id)` - Fetch category with children/products
- `createCategory(data, parentId?)` - Create category/subcategory
- `updateCategory(id, data)` - Update category
- `deleteCategory(id)` - Delete category
- `uploadCategoryImage(id, file)` - Upload background image
- `deleteCategoryImage(id)` - Remove background image
- `bulkDeleteCategories(ids)` - Bulk delete
- `bulkDeleteProducts(ids)` - Bulk delete products

---

## URL PATTERNS

### Collections
- `/dashboard/collections` - List
- `/dashboard/collections/add` - Create
- `/dashboard/collections/[id]` - Details/Edit

### Categories
- `/dashboard/categories` - List (root categories)
- `/dashboard/categories/add` - Create root category
- `/dashboard/categories/[id]` - Details/Edit
- `/dashboard/categories/[id]/add` - Create subcategory
