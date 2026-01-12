/**
 * Block Constants - Re-exports from shared block constants
 * 
 * This file re-exports all block constants from the shared module
 * to maintain backward compatibility with existing imports.
 * 
 * @deprecated Import directly from "@/shared/block-constants" instead
 */

export {
  // Icons
  BLOCK_ICONS,
  getBlockIcon,
  
  // Names
  BLOCK_NAMES,
  getBlockName,
  
  // Colors
  BLOCK_TEXT_COLORS,
  BLOCK_BG_COLORS,
  BLOCK_BORDER_COLORS,
  BLOCK_RING_COLORS,
  BLOCK_COLORS,
  BLOCK_PREVIEW_COLORS,
  BLOCK_PALETTE_COLORS,
  BLOCK_HOVER_COLORS,
  getBlockColors,
  
  // Categories
  BLOCK_CATEGORIES,
  CATEGORY_NAMES,
  getBlocksByCategory,
  
  // Helpers
  getBlockStyles,
  
  // Types
  type BlockCategory,
} from "@/shared/block-constants"
