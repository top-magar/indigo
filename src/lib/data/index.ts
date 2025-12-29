import "server-only"

/**
 * Storefront Data Layer
 * 
 * Server-side data fetching utilities with Next.js 16 Cache Components.
 * All functions use `use cache` directive for optimal performance.
 */

// Cache utilities
export {
  CACHE_TAGS,
  getTenantCacheTag,
  tagTenantCache,
  CACHE_PROFILES,
} from "./cache"

// Cart operations
export {
  retrieveCart,
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  updateCart,
  clearCart,
  completeCart,
  transferCart,
  type Cart,
  type CartItem,
} from "./cart"

// Product operations
export {
  listProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  revalidateProductsCache,
  revalidateProductCache,
  expireProductsCache,
  expireProductCache,
  type StoreProduct,
  type ProductListParams,
  type ProductListResponse,
} from "./products"

// Category operations
export {
  listCategories,
  getCategoryBySlug,
  getRootCategories,
  getChildCategories,
  revalidateCategoriesCache,
  revalidateCategoryCache,
  expireCategoriesCache,
  expireCategoryCache,
  type StoreCategory,
} from "./categories"

// Tenant operations (for static generation)
export {
  getAllTenantSlugs,
  getProductSlugsForTenant,
  getCategorySlugsForTenant,
  getAllStoreStaticParams,
  getTenantBySlug,
  type StoreTenant,
} from "./tenants"

// Cookie utilities
export {
  getCartId,
  setCartId,
  removeCartId,
  getCacheId,
  getCacheTag,
  getCacheOptions,
} from "./cookies"
