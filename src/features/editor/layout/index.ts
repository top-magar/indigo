/**
 * Layout System - Shopify/Wix Hybrid Architecture
 * 
 * Combines Shopify's Section/Block model with Wix's positioning flexibility.
 * 
 * Architecture:
 * - Page → Sections (full-width containers like Shopify)
 * - Section → Elements (blocks with positioning like Wix)
 * - Elements can be positioned: stacked (default), grid, flex, or absolute
 */

// Types
export * from "./types"

// Block Layout CSS - Simple CSS generation for block settings
export {
  generateBlockLayoutCSS,
  extractLayoutSettings,
  isSectionBlock,
  SECTION_BLOCK_TYPES,
  type BlockLayoutSettings,
  type LayoutMode,
  type Alignment,
  type SectionBlockType,
} from "./block-layout-css"

// Layout Engine - CSS generation and positioning calculations
export {
  generateSectionCSS,
  generateElementCSS,
  snapToGrid,
  getElementBounds,
  elementsOverlap,
  findAvailablePosition,
  getResponsiveLayout,
  getResponsivePosition,
  migrateBlockToElement,
  migrateBlocksToSection,
  type ElementBounds,
} from "./layout-engine"

// Section Schemas - Shopify-like section definitions
export {
  heroSectionSchema,
  featuredCollectionSchema,
  richTextSectionSchema,
  imageWithTextSchema,
  multicolumnSchema,
  testimonialsSectionSchema,
  newsletterSectionSchema,
  customContentSchema,
  SECTION_SCHEMAS,
  getAllSectionPresets,
  getSectionSchema,
} from "./section-schemas"

// Layout Store - State management
export {
  useLayoutStore,
  type LayoutState,
} from "./layout-store"

// Renderers - React components
export { SectionRenderer } from "./section-renderer"
export { ElementRenderer } from "./element-renderer"
