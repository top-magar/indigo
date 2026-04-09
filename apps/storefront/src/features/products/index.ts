/**
 * Products Feature
 * 
 * Product management functionality including CRUD operations,
 * variants, pricing, and inventory integration.
 */

// Types - export all types from the types module
export type {
    ProductStatus,
    StockStatus,
    ProductMedia,
    VariantOption,
    ProductVariant,
    AttributeInputType,
    AttributeValue,
    ProductAttribute,
    ProductType,
    ProductShipping,
    ProductSeo,
    ProductChannelListing,
    Product,
    CreateProductInput,
    UpdateProductInput,
    CreateVariantInput,
    UpdateVariantInput,
    BulkUpdateStockInput,
    ProductFilters,
    ProductListItem,
    ProductStats,
    ProductExportOptions,
    ProductImportRow,
    ProductImportResult,
} from "./types";

// Repositories
export { productRepository, ProductRepository } from "./repositories/products";

// Components
export * from "./components";

// Services (to be added)
// export * from "./services";
