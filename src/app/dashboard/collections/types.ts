//
// Collection Types - Saleor-level collection management types
//

// ============================================================================
// COLLECTION STATUS TYPES
// ============================================================================

export type CollectionType = "manual" | "automatic";

// ============================================================================
// COLLECTION CONDITION TYPES (for automatic collections)
// ============================================================================

export interface CollectionCondition {
    field: "tag" | "category" | "price" | "title" | "vendor" | "product_type";
    operator: "equals" | "not_equals" | "contains" | "starts_with" | "ends_with" | "greater_than" | "less_than";
    value: string;
}

// ============================================================================
// COLLECTION PRODUCT TYPES
// ============================================================================

export interface CollectionProduct {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    productSku?: string | null;
    productPrice: number;
    productImage?: string | null;
    productStatus: "draft" | "active" | "archived";
    position: number;
    addedAt: string;
}

// ============================================================================
// SEO TYPES
// ============================================================================

export interface CollectionSeo {
    metaTitle?: string | null;
    metaDescription?: string | null;
    slug: string;
}

// ============================================================================
// MAIN COLLECTION TYPE
// ============================================================================

export interface Collection {
    id: string;
    tenantId: string;
    
    // Basic Info
    name: string;
    slug: string;
    description?: string | null;
    
    // Image
    backgroundImage?: string | null;
    backgroundImageAlt?: string | null;
    
    // Status
    isActive: boolean;
    type: CollectionType;
    
    // Automatic collection conditions
    conditions?: CollectionCondition[] | null;
    
    // SEO
    seo: CollectionSeo;
    
    // Counts
    productCount: number;
    
    // Products (for detail view)
    products?: CollectionProduct[];
    
    // Metadata
    metadata?: Record<string, unknown> | null;
    
    // Timestamps
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateCollectionInput {
    name: string;
    slug?: string;
    description?: string;
    backgroundImage?: string;
    backgroundImageAlt?: string;
    isActive?: boolean;
    type?: CollectionType;
    conditions?: CollectionCondition[];
    seo?: Omit<CollectionSeo, "slug">;
    metadata?: Record<string, unknown>;
}

export interface UpdateCollectionInput extends Partial<CreateCollectionInput> {
    id: string;
}

// ============================================================================
// LIST/FILTER TYPES
// ============================================================================

export interface CollectionFilters {
    search?: string;
    isActive?: boolean | "all";
    type?: CollectionType | "all";
}

export interface CollectionListItem {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    backgroundImage?: string | null;
    isActive: boolean;
    type: CollectionType;
    productCount: number;
    sortOrder: number;
    createdAt: string;
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface CollectionStats {
    total: number;
    active: number;
    inactive: number;
    manual: number;
    automatic: number;
    totalProducts: number;
}
