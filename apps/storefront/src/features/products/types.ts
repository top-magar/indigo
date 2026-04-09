//
// Product Types - Saleor-level product management types
//

// ============================================================================
// PRODUCT STATUS TYPES
// ============================================================================

export type ProductStatus = "draft" | "active" | "archived";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

// ============================================================================
// MEDIA TYPES
// ============================================================================

export interface ProductMedia {
    id: string;
    url: string;
    alt: string;
    type: "image" | "video";
    position: number;
}

// ============================================================================
// VARIANT TYPES
// ============================================================================

export interface VariantOption {
    name: string; // e.g., "Size", "Color"
    value: string; // e.g., "Large", "Red"
}

export interface ProductVariant {
    id: string;
    productId: string;
    title: string; // e.g., "Large / Red"
    sku?: string | null;
    barcode?: string | null;
    price?: number | null; // Override base price
    compareAtPrice?: number | null;
    costPrice?: number | null;
    quantity: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
    weight?: number | null;
    weightUnit?: string;
    options: VariantOption[];
    imageId?: string | null;
    position: number;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// ATTRIBUTE TYPES
// ============================================================================

export type AttributeInputType = 
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "date"
    | "datetime"
    | "dropdown"
    | "multiselect"
    | "file"
    | "reference"
    | "rich_text"
    | "swatch";

export interface AttributeValue {
    id: string;
    name: string;
    slug: string;
    value?: string;
    file?: string;
    richText?: string;
}

export interface ProductAttribute {
    id: string;
    name: string;
    slug: string;
    inputType: AttributeInputType;
    values: AttributeValue[];
    required: boolean;
}

// ============================================================================
// PRODUCT TYPE
// ============================================================================

export interface ProductType {
    id: string;
    name: string;
    slug: string;
    hasVariants: boolean;
    isShippingRequired: boolean;
    isDigital: boolean;
    productAttributes: ProductAttribute[];
    variantAttributes: ProductAttribute[];
}

// ============================================================================
// SHIPPING TYPES
// ============================================================================

export interface ProductShipping {
    requiresShipping: boolean;
    weight?: number | null;
    weightUnit: "g" | "kg" | "lb" | "oz";
    dimensions?: {
        length?: number | null;
        width?: number | null;
        height?: number | null;
    };
}

// ============================================================================
// SEO TYPES
// ============================================================================

export interface ProductSeo {
    metaTitle?: string | null;
    metaDescription?: string | null;
    slug: string;
}

// ============================================================================
// CHANNEL/AVAILABILITY TYPES
// ============================================================================

export interface ProductChannelListing {
    channelId: string;
    channelName: string;
    isPublished: boolean;
    publishedAt?: string | null;
    isAvailableForPurchase: boolean;
    availableForPurchaseAt?: string | null;
    visibleInListings: boolean;
    price?: number | null;
    costPrice?: number | null;
}

// ============================================================================
// MAIN PRODUCT TYPE
// ============================================================================

export interface Product {
    id: string;
    tenantId: string;
    
    // Basic Info
    name: string;
    slug: string;
    description?: string | null;
    descriptionHtml?: string | null;
    
    // Pricing
    price: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    currency: string;
    
    // Inventory
    sku?: string | null;
    barcode?: string | null;
    quantity: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
    
    // Status
    status: ProductStatus;
    
    // Organization
    categoryId?: string | null;
    categoryName?: string | null;
    collectionIds: string[];
    collectionNames: string[];
    productTypeId?: string | null;
    productTypeName?: string | null;
    
    // Media
    media: ProductMedia[];
    
    // Variants
    hasVariants: boolean;
    variants: ProductVariant[];
    
    // Attributes
    attributes: { attributeId: string; values: string[] }[];
    
    // Shipping
    shipping: ProductShipping;
    
    // SEO
    seo: ProductSeo;
    
    // Metadata
    brand?: string | null;
    tags: string[];
    metadata?: Record<string, unknown> | null;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateProductInput {
    name: string;
    slug?: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    sku?: string;
    barcode?: string;
    quantity?: number;
    trackQuantity?: boolean;
    allowBackorder?: boolean;
    status?: ProductStatus;
    categoryId?: string;
    collectionIds?: string[];
    productTypeId?: string;
    media?: Omit<ProductMedia, "id">[];
    hasVariants?: boolean;
    variants?: Omit<ProductVariant, "id" | "productId" | "createdAt" | "updatedAt">[];
    shipping?: ProductShipping;
    seo?: Omit<ProductSeo, "slug">;
    brand?: string;
    tags?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
    id: string;
}

export interface CreateVariantInput {
    productId: string;
    title: string;
    sku?: string;
    barcode?: string;
    price?: number;
    compareAtPrice?: number;
    costPrice?: number;
    quantity?: number;
    trackQuantity?: boolean;
    allowBackorder?: boolean;
    weight?: number;
    weightUnit?: string;
    options: VariantOption[];
    imageId?: string;
}

export interface UpdateVariantInput extends Partial<Omit<CreateVariantInput, "productId">> {
    id: string;
}

export interface BulkUpdateStockInput {
    variantId: string;
    quantity: number;
    action: "set" | "add" | "subtract";
}

// ============================================================================
// LIST/FILTER TYPES
// ============================================================================

export interface ProductFilters {
    search?: string;
    status?: ProductStatus | "all";
    stockStatus?: StockStatus | "all";
    categoryId?: string;
    collectionId?: string;
    priceMin?: number;
    priceMax?: number;
    hasVariants?: boolean;
}

export interface ProductListItem {
    id: string;
    name: string;
    slug: string;
    sku?: string | null;
    price: number;
    compareAtPrice?: number | null;
    quantity: number;
    status: ProductStatus;
    categoryName?: string | null;
    thumbnail?: string | null;
    variantCount: number;
    createdAt: string;
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface ProductStats {
    total: number;
    active: number;
    draft: number;
    archived: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    withVariants: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ProductExportOptions {
    format: "csv" | "xlsx" | "json";
    fields: string[];
    includeVariants: boolean;
    filters?: ProductFilters;
}

// ============================================================================
// IMPORT TYPES
// ============================================================================

export interface ProductImportRow {
    name: string;
    sku?: string;
    price: number;
    quantity?: number;
    description?: string;
    category?: string;
    status?: ProductStatus;
    images?: string; // comma-separated URLs
    [key: string]: unknown; // Allow custom fields
}

export interface ProductImportResult {
    success: number;
    failed: number;
    errors: { row: number; message: string }[];
}
