/**
 * Enhanced Layout System Types
 * Combines Shopify's Section/Block model with Wix's flexibility
 * 
 * Architecture:
 * - Page → Sections (full-width containers like Shopify)
 * - Section → Elements (blocks with positioning like Wix)
 * - Elements can be positioned: stacked (default), grid, or absolute
 */

// =============================================================================
// POSITIONING MODES
// =============================================================================

/**
 * Layout modes for sections - determines how child elements are positioned
 */
export type LayoutMode = 
  | "stack"      // Vertical stacking (Shopify-like, default)
  | "grid"       // CSS Grid layout (flexible columns/rows)
  | "flex"       // Flexbox layout (horizontal/vertical with wrapping)
  | "absolute"   // Freeform positioning (Wix-like)

/**
 * Alignment options for flex/grid layouts
 */
export type Alignment = "start" | "center" | "end" | "stretch" | "space-between" | "space-around"

// =============================================================================
// POSITION & SIZE
// =============================================================================

/**
 * Position for absolute/freeform layouts
 */
export interface Position {
  x: number        // pixels from left
  y: number        // pixels from top
  unit: "px" | "%" // position unit
}

/**
 * Size configuration with responsive support
 */
export interface Size {
  width: number | "auto" | "full"
  height: number | "auto" | "fit-content"
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  unit: "px" | "%" | "vw" | "vh"
}

/**
 * Responsive size overrides per breakpoint
 */
export interface ResponsiveSize {
  desktop?: Partial<Size>
  tablet?: Partial<Size>
  mobile?: Partial<Size>
}

/**
 * Grid placement for grid layout mode
 */
export interface GridPlacement {
  column: number | "auto"      // Grid column start
  columnSpan: number           // How many columns to span
  row: number | "auto"         // Grid row start
  rowSpan: number              // How many rows to span
}

// =============================================================================
// SPACING & STYLING
// =============================================================================

/**
 * Spacing configuration (margin/padding)
 */
export interface Spacing {
  top: number
  right: number
  bottom: number
  left: number
  unit: "px" | "rem" | "%"
}

/**
 * Border configuration
 */
export interface Border {
  width: number
  style: "none" | "solid" | "dashed" | "dotted"
  color: string
  radius: number | { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }
}

/**
 * Shadow configuration
 */
export interface Shadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset: boolean
}


// =============================================================================
// SECTION TYPES (Shopify-like containers)
// =============================================================================

/**
 * Section schema - defines what blocks a section can contain
 * Similar to Shopify's section schema
 */
export interface SectionSchema {
  name: string
  tag?: string                    // HTML tag (section, div, article, etc.)
  class?: string                  // CSS class
  maxBlocks?: number              // Maximum number of blocks allowed
  blocks: SectionBlockSchema[]    // Allowed block types
  settings: SectionSettingSchema[] // Section-level settings
  presets?: SectionPreset[]       // Pre-configured section templates
}

/**
 * Block schema within a section
 */
export interface SectionBlockSchema {
  type: string
  name: string
  limit?: number                  // Max instances of this block type
  settings: BlockSettingSchema[]
}

/**
 * Setting schema for sections and blocks
 */
export interface SectionSettingSchema {
  id: string
  type: SettingType
  label: string
  default?: unknown
  info?: string
  placeholder?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  unit?: string
}

export interface BlockSettingSchema extends SectionSettingSchema {
  // Block settings inherit from section settings
}

/**
 * Setting types (similar to Shopify's setting types)
 */
export type SettingType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "range"
  | "checkbox"
  | "select"
  | "radio"
  | "color"
  | "color_background"
  | "image_picker"
  | "video_url"
  | "url"
  | "product"
  | "collection"
  | "page"
  | "blog"
  | "article"
  | "link_list"
  | "font_picker"
  | "html"
  | "liquid"

/**
 * Section preset - pre-configured section template
 */
export interface SectionPreset {
  name: string
  category?: string
  settings: Record<string, unknown>
  blocks: {
    type: string
    settings: Record<string, unknown>
  }[]
}

// =============================================================================
// ENHANCED SECTION BLOCK
// =============================================================================

/**
 * Enhanced Section with layout capabilities
 * Combines Shopify's section concept with Wix's layout flexibility
 */
export interface EnhancedSection {
  id: string
  type: "section"
  name?: string                   // Custom name for the section
  
  // Layout configuration
  layout: {
    mode: LayoutMode
    
    // Stack mode settings
    gap?: number                  // Gap between stacked items
    alignment?: Alignment         // Cross-axis alignment
    
    // Grid mode settings
    grid?: {
      columns: number | string    // Number or template (e.g., "1fr 2fr 1fr")
      rows?: number | string      // Number or template
      columnGap: number
      rowGap: number
      autoFlow?: "row" | "column" | "dense"
    }
    
    // Flex mode settings
    flex?: {
      direction: "row" | "column"
      wrap: boolean
      justifyContent: Alignment
      alignItems: Alignment
      gap: number
    }
    
    // Absolute mode settings (Wix-like)
    absolute?: {
      width: number               // Canvas width
      height: number              // Canvas height
      snapToGrid: boolean
      gridSize: number            // Snap grid size in pixels
    }
  }
  
  // Styling
  style: {
    backgroundColor?: string
    backgroundImage?: string
    backgroundSize?: "cover" | "contain" | "auto"
    backgroundPosition?: string
    backgroundOverlay?: { color: string; opacity: number }
    padding: Spacing
    margin: Spacing
    border?: Border
    shadow?: Shadow
    minHeight?: string
    maxWidth?: "full" | "contained" | "narrow" | number
  }
  
  // Responsive overrides
  responsive?: {
    tablet?: Partial<EnhancedSection["layout"]> & Partial<EnhancedSection["style"]>
    mobile?: Partial<EnhancedSection["layout"]> & Partial<EnhancedSection["style"]>
  }
  
  // Section settings (from schema)
  settings: Record<string, unknown>
  
  // Child elements
  elements: EnhancedElement[]
  
  // Metadata
  order: number
  visible: boolean
  locked?: boolean
  anchor?: string                 // For navigation links
}

// =============================================================================
// ENHANCED ELEMENT (Block with positioning)
// =============================================================================

/**
 * Enhanced Element - a block with positioning capabilities
 * Can be positioned differently based on parent section's layout mode
 */
export interface EnhancedElement {
  id: string
  type: string                    // Block type (hero, product-grid, etc.)
  variant?: string                // Block variant
  
  // Position based on parent's layout mode
  position: {
    // For stack mode - just order
    order?: number
    
    // For grid mode
    grid?: GridPlacement
    
    // For flex mode
    flex?: {
      order?: number
      grow?: number
      shrink?: number
      basis?: string | number
      alignSelf?: Alignment
    }
    
    // For absolute mode (Wix-like)
    absolute?: {
      x: number
      y: number
      width: number
      height: number
      zIndex: number
      rotation?: number           // Degrees
      anchor?: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right"
    }
  }
  
  // Size (for non-absolute modes)
  size?: {
    width?: number | "auto" | "full"
    height?: number | "auto" | "fit-content"
    aspectRatio?: string          // e.g., "16/9"
  }
  
  // Styling overrides
  style?: {
    padding?: Spacing
    margin?: Spacing
    backgroundColor?: string
    border?: Border
    shadow?: Shadow
    opacity?: number
    overflow?: "visible" | "hidden" | "scroll" | "auto"
  }
  
  // Responsive overrides
  responsive?: {
    tablet?: Partial<EnhancedElement["position"]> & Partial<EnhancedElement["size"]> & Partial<EnhancedElement["style"]>
    mobile?: Partial<EnhancedElement["position"]> & Partial<EnhancedElement["size"]> & Partial<EnhancedElement["style"]>
  }
  
  // Block settings (content, configuration)
  settings: Record<string, unknown>
  
  // Metadata
  visible: boolean
  locked?: boolean
  groupId?: string                // For grouping elements
  
  // Nested elements (for container-type blocks)
  children?: EnhancedElement[]
}

// =============================================================================
// PAGE STRUCTURE
// =============================================================================

/**
 * Enhanced Page - collection of sections
 */
export interface EnhancedPage {
  id: string
  name: string
  slug: string
  
  // Page-level settings
  settings: {
    title: string
    description?: string
    favicon?: string
    socialImage?: string
  }
  
  // Global styles for this page
  globalStyles?: {
    fontFamily?: string
    primaryColor?: string
    secondaryColor?: string
    backgroundColor?: string
    textColor?: string
  }
  
  // Sections
  sections: EnhancedSection[]
  
  // Metadata
  status: "draft" | "published"
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

// =============================================================================
// DRAG & DROP TYPES
// =============================================================================

/**
 * Drop target information
 */
export interface DropTarget {
  sectionId: string
  elementId?: string              // If dropping inside an element
  position: "before" | "after" | "inside"
  index?: number
  // For absolute mode
  coordinates?: { x: number; y: number }
}

/**
 * Drag item information
 */
export interface DragItem {
  type: "section" | "element" | "new-block"
  id?: string                     // Existing item ID
  blockType?: string              // For new blocks
  sourceSection?: string          // Source section ID
}

// =============================================================================
// LAYOUT PRESETS
// =============================================================================

/**
 * Pre-built section layouts
 */
export const SECTION_LAYOUT_PRESETS = {
  // Stack layouts (Shopify-like)
  "stack-centered": {
    mode: "stack" as const,
    gap: 24,
    alignment: "center" as const,
  },
  "stack-left": {
    mode: "stack" as const,
    gap: 24,
    alignment: "start" as const,
  },
  
  // Grid layouts
  "grid-2-col": {
    mode: "grid" as const,
    grid: { columns: 2, columnGap: 24, rowGap: 24 },
  },
  "grid-3-col": {
    mode: "grid" as const,
    grid: { columns: 3, columnGap: 24, rowGap: 24 },
  },
  "grid-4-col": {
    mode: "grid" as const,
    grid: { columns: 4, columnGap: 16, rowGap: 16 },
  },
  "grid-sidebar-left": {
    mode: "grid" as const,
    grid: { columns: "300px 1fr", columnGap: 32, rowGap: 24 },
  },
  "grid-sidebar-right": {
    mode: "grid" as const,
    grid: { columns: "1fr 300px", columnGap: 32, rowGap: 24 },
  },
  
  // Flex layouts
  "flex-row": {
    mode: "flex" as const,
    flex: { direction: "row" as const, wrap: true, justifyContent: "start" as const, alignItems: "stretch" as const, gap: 24 },
  },
  "flex-row-center": {
    mode: "flex" as const,
    flex: { direction: "row" as const, wrap: true, justifyContent: "center" as const, alignItems: "center" as const, gap: 24 },
  },
  "flex-row-space-between": {
    mode: "flex" as const,
    flex: { direction: "row" as const, wrap: false, justifyContent: "space-between" as const, alignItems: "center" as const, gap: 16 },
  },
  
  // Absolute layout (Wix-like)
  "absolute-canvas": {
    mode: "absolute" as const,
    absolute: { width: 1200, height: 800, snapToGrid: true, gridSize: 8 },
  },
} as const

export type SectionLayoutPreset = keyof typeof SECTION_LAYOUT_PRESETS
