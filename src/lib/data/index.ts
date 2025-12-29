/**
 * Storefront Data Layer
 * 
 * Server-side data fetching utilities inspired by Medusa's architecture.
 * All functions are server actions that can be called from Server Components
 * or Client Components via form actions.
 */

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
  type StoreCategory,
} from "./categories"

// Cookie utilities
export {
  getCartId,
  setCartId,
  removeCartId,
  getCacheId,
  getCacheTag,
  getCacheOptions,
} from "./cookies"
