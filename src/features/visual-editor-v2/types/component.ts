/**
 * Visual Editor V2 - Component Types
 * 
 * Reusable component system with variants and props.
 */

import type { VisualElement } from './element';

// ============================================================================
// COMPONENT CATEGORIES
// ============================================================================

export type ComponentCategory =
  | 'layout'       // Headers, footers, sections
  | 'navigation'   // Navbars, menus, breadcrumbs
  | 'hero'         // Hero sections
  | 'features'     // Feature grids, lists
  | 'products'     // Product cards, grids
  | 'testimonials' // Reviews, testimonials
  | 'pricing'      // Pricing tables
  | 'cta'          // Call-to-action sections
  | 'forms'        // Contact forms, newsletter
  | 'footer'       // Footer sections
  | 'ecommerce'    // Cart, checkout, product details
  | 'content'      // Text blocks, media
  | 'social'       // Social proof, sharing
  | 'custom';      // User-created

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export type ComponentPropType =
  | 'text'
  | 'rich-text'
  | 'number'
  | 'boolean'
  | 'color'
  | 'image'
  | 'video'
  | 'icon'
  | 'select'
  | 'multi-select'
  | 'link'
  | 'array'
  | 'object';

export interface ComponentPropOption {
  label: string;
  value: string | number | boolean;
}

export interface ComponentProp {
  name: string;
  type: ComponentPropType;
  label: string;
  description?: string;
  defaultValue: unknown;
  
  // For select/multi-select
  options?: ComponentPropOption[];
  
  // For number
  min?: number;
  max?: number;
  step?: number;
  
  // For text
  maxLength?: number;
  multiline?: boolean;
  
  // For array
  itemType?: ComponentPropType;
  maxItems?: number;
  
  // For object
  properties?: ComponentProp[];
  
  // Validation
  required?: boolean;
  
  // Which element property this maps to
  targetElementId: string;
  targetProperty: string; // e.g., 'content.text', 'styles.background.color'
}

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

export interface ComponentVariant {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  propOverrides: Record<string, unknown>;
}

// ============================================================================
// COMPONENT DEFINITION
// ============================================================================

export interface ComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  
  // The component's element tree
  rootElementId: string;
  elements: Record<string, VisualElement>;
  
  // Exposed props that can be customized
  props: ComponentProp[];
  
  // Variants (like Figma variants)
  variants: ComponentVariant[];
  
  // Default variant
  defaultVariantId?: string;
  
  // Preview
  thumbnail?: string;
  previewUrl?: string;
  
  // Search/filter
  tags: string[];
  
  // Source
  source: 'system' | 'ai-generated' | 'user-created';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

// ============================================================================
// COMPONENT INSTANCE
// ============================================================================

export interface ComponentInstance {
  componentId: string;
  variantId?: string;
  propValues: Record<string, unknown>;
  
  // Overrides that break the component link
  overrides?: {
    elementId: string;
    property: string;
    value: unknown;
  }[];
  
  // Whether the instance is detached from the component
  detached: boolean;
}

// ============================================================================
// E-COMMERCE COMPONENT PRESETS
// ============================================================================

export const ECOMMERCE_COMPONENT_IDS = {
  // Product Display
  PRODUCT_CARD: 'product-card',
  PRODUCT_GRID: 'product-grid',
  PRODUCT_CAROUSEL: 'product-carousel',
  PRODUCT_DETAIL: 'product-detail',
  PRODUCT_GALLERY: 'product-gallery',
  PRODUCT_REVIEWS: 'product-reviews',
  PRODUCT_VARIANTS: 'product-variants',
  
  // Cart & Checkout
  CART_DRAWER: 'cart-drawer',
  CART_PAGE: 'cart-page',
  CART_ITEM: 'cart-item',
  CHECKOUT_FORM: 'checkout-form',
  ORDER_SUMMARY: 'order-summary',
  
  // Navigation
  STORE_HEADER: 'store-header',
  CATEGORY_NAV: 'category-nav',
  SEARCH_BAR: 'search-bar',
  MEGA_MENU: 'mega-menu',
  BREADCRUMBS: 'breadcrumbs',
  
  // Marketing
  HERO_BANNER: 'hero-banner',
  HERO_SPLIT: 'hero-split',
  HERO_VIDEO: 'hero-video',
  PROMO_BAR: 'promo-bar',
  NEWSLETTER_SIGNUP: 'newsletter-signup',
  TRUST_BADGES: 'trust-badges',
  
  // Content
  COLLECTION_GRID: 'collection-grid',
  FEATURED_PRODUCTS: 'featured-products',
  RECENTLY_VIEWED: 'recently-viewed',
  RELATED_PRODUCTS: 'related-products',
  
  // Social Proof
  TESTIMONIAL_CARD: 'testimonial-card',
  TESTIMONIAL_CAROUSEL: 'testimonial-carousel',
  RATING_STARS: 'rating-stars',
  
  // Footer
  FOOTER_SIMPLE: 'footer-simple',
  FOOTER_COLUMNS: 'footer-columns',
  FOOTER_NEWSLETTER: 'footer-newsletter',
} as const;

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createComponentDefinition(
  name: string,
  category: ComponentCategory,
  rootElement: VisualElement,
  elements: Record<string, VisualElement>,
  overrides: Partial<ComponentDefinition> = {}
): ComponentDefinition {
  return {
    id: `component-${Date.now()}`,
    name,
    category,
    description: '',
    rootElementId: rootElement.id,
    elements,
    props: [],
    variants: [],
    tags: [],
    source: 'user-created',
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    ...overrides,
  };
}

export function createComponentInstance(
  componentId: string,
  propValues: Record<string, unknown> = {},
  variantId?: string
): ComponentInstance {
  return {
    componentId,
    variantId,
    propValues,
    detached: false,
  };
}
