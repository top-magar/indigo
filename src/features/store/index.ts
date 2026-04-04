/**
 * Store Feature Module
 * 
 * Exports all store-related providers, services, and utilities.
 */

// Cart providers
export { CartProvider, CartContext, useCart } from "./cart-provider";

// Layout service (read-only — write ops in features/editor/actions.ts)
export {
  getHomepageLayout,
  getDraftLayout,
  type StoreLayoutRow,
  type LayoutStatus,
} from "./layout-service";

// Default layout
export {
  createDefaultHomepageLayout,
} from "./default-layout";

// Theme
export { StoreThemeProvider, themeToVars, type StoreTheme } from "./theme-provider";
