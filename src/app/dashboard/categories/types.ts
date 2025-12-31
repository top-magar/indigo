//
// Category Types - Saleor-level category management types
//

// ============================================================================
// CATEGORY PRODUCT TYPES
// ============================================================================

export interface CategoryProduct {
    id: string;
    name: string;
    slug: string;
    sku?: string | null;
    price: number;
    image?: string | null;
    status: "draft" | "active" | "archived";
    createdAt: string;
}

// ============================================================================
// SUBCATEGORY TYPES
// ============================================================================

export interface Subcategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    productCount: number;
    subcategoryCount: number;
    sortOrder: number;
    createdAt: string;
}

// ============================================================================
// SEO TYPES
// ============================================================================

export interface CategorySeo {
    metaTitle?: string | null;
    metaDescription?: string | null;
    slug: string;
}

// ============================================================================
// MAIN CATEGORY TYPE
// ============================================================================

export interface Category {
    id: string;
    tenantId: string;
    
    // Basic Info
    name: string;
    slug: string;
    description?: string | null;
    
    // Image
    backgroundImage?: string | null;
    backgroundImageAlt?: string | null;
    
    // Hierarchy
    parentId?: string | null;
    parentName?: string | null;
    level: number;
    
    // SEO
    seo: CategorySeo;
    
    // Counts
    productCount: number;
    subcategoryCount: number;
    
    // Children (for detail view)
    subcategories?: Subcategory[];
    products?: CategoryProduct[];
    
    // Metadata
    metadata?: Record<string, unknown> | null;
    
    // Timestamps
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// BREADCRUMB TYPE
// ============================================================================

export interface CategoryBreadcrumb {
    id: string;
    name: string;
    slug: string;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateCategoryInput {
    name: string;
    slug?: string;
    description?: string;
    backgroundImage?: string;
    backgroundImageAlt?: string;
    parentId?: string;
    seo?: Omit<CategorySeo, "slug">;
    metadata?: Record<string, unknown>;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
    id: string;
}

// ============================================================================
// LIST/FILTER TYPES
// ============================================================================

export interface CategoryFilters {
    search?: string;
    parentId?: string | "root" | "all";
    hasProducts?: boolean | "all";
}

export interface CategoryListItem {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    parentId?: string | null;
    parentName?: string | null;
    level: number;
    productCount: number;
    subcategoryCount: number;
    sortOrder: number;
    createdAt: string;
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface CategoryStats {
    total: number;
    rootCategories: number;
    withProducts: number;
    empty: number;
    totalProducts: number;
    maxDepth: number;
}
