/**
 * Layout Engine
 * Handles positioning calculations and CSS generation for the enhanced layout system
 */

import type {
  EnhancedSection,
  EnhancedElement,
  Spacing,
  Border,
  Shadow,
  GridPlacement,
} from "./types"

// =============================================================================
// CSS GENERATION
// =============================================================================

/**
 * Generate CSS for a section based on its layout mode
 */
export function generateSectionCSS(section: EnhancedSection): React.CSSProperties {
  const { layout, style } = section
  
  const css: React.CSSProperties = {
    position: "relative",
    width: "100%",
    
    // Background
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage ? `url(${style.backgroundImage})` : undefined,
    backgroundSize: style.backgroundSize || "cover",
    backgroundPosition: style.backgroundPosition || "center",
    
    // Spacing
    paddingTop: style.padding.top,
    paddingRight: style.padding.right,
    paddingBottom: style.padding.bottom,
    paddingLeft: style.padding.left,
    marginTop: style.margin.top,
    marginRight: style.margin.right,
    marginBottom: style.margin.bottom,
    marginLeft: style.margin.left,
    
    // Size
    minHeight: style.minHeight,
    maxWidth: typeof style.maxWidth === "number" ? style.maxWidth : getMaxWidthValue(style.maxWidth),
    marginInline: style.maxWidth !== "full" ? "auto" : undefined,
    
    // Border
    ...generateBorderCSS(style.border),
    
    // Shadow
    boxShadow: style.shadow ? generateShadowCSS(style.shadow) : undefined,
  }
  
  // Layout mode specific styles
  switch (layout.mode) {
    case "stack":
      Object.assign(css, {
        display: "flex",
        flexDirection: "column",
        gap: layout.gap,
        alignItems: getFlexAlignment(layout.alignment || "stretch"),
      })
      break
      
    case "grid":
      if (layout.grid) {
        Object.assign(css, {
          display: "grid",
          gridTemplateColumns: typeof layout.grid.columns === "number" 
            ? `repeat(${layout.grid.columns}, 1fr)` 
            : layout.grid.columns,
          gridTemplateRows: layout.grid.rows 
            ? (typeof layout.grid.rows === "number" 
              ? `repeat(${layout.grid.rows}, auto)` 
              : layout.grid.rows)
            : undefined,
          columnGap: layout.grid.columnGap,
          rowGap: layout.grid.rowGap,
          gridAutoFlow: layout.grid.autoFlow,
        })
      }
      break
      
    case "flex":
      if (layout.flex) {
        Object.assign(css, {
          display: "flex",
          flexDirection: layout.flex.direction,
          flexWrap: layout.flex.wrap ? "wrap" : "nowrap",
          justifyContent: getFlexAlignment(layout.flex.justifyContent),
          alignItems: getFlexAlignment(layout.flex.alignItems),
          gap: layout.flex.gap,
        })
      }
      break
      
    case "absolute":
      if (layout.absolute) {
        Object.assign(css, {
          position: "relative",
          width: layout.absolute.width,
          height: layout.absolute.height,
          overflow: "hidden",
        })
      }
      break
  }
  
  return css
}

/**
 * Generate CSS for an element based on parent's layout mode
 */
export function generateElementCSS(
  element: EnhancedElement,
  parentLayout: EnhancedSection["layout"]
): React.CSSProperties {
  const css: React.CSSProperties = {}
  
  // Apply element-level styles
  if (element.style) {
    Object.assign(css, {
      padding: element.style.padding ? generateSpacingCSS(element.style.padding) : undefined,
      margin: element.style.margin ? generateSpacingCSS(element.style.margin) : undefined,
      backgroundColor: element.style.backgroundColor,
      opacity: element.style.opacity,
      overflow: element.style.overflow,
      ...generateBorderCSS(element.style.border),
      boxShadow: element.style.shadow ? generateShadowCSS(element.style.shadow) : undefined,
    })
  }
  
  // Size
  if (element.size) {
    Object.assign(css, {
      width: getSizeValue(element.size.width),
      height: getSizeValue(element.size.height),
      aspectRatio: element.size.aspectRatio,
    })
  }
  
  // Position based on parent layout mode
  switch (parentLayout.mode) {
    case "stack":
      if (element.position.order !== undefined) {
        css.order = element.position.order
      }
      break
      
    case "grid":
      if (element.position.grid) {
        Object.assign(css, generateGridPlacementCSS(element.position.grid))
      }
      break
      
    case "flex":
      if (element.position.flex) {
        Object.assign(css, {
          order: element.position.flex.order,
          flexGrow: element.position.flex.grow,
          flexShrink: element.position.flex.shrink,
          flexBasis: element.position.flex.basis,
          alignSelf: element.position.flex.alignSelf 
            ? getFlexAlignment(element.position.flex.alignSelf) 
            : undefined,
        })
      }
      break
      
    case "absolute":
      if (element.position.absolute) {
        const abs = element.position.absolute
        Object.assign(css, {
          position: "absolute",
          left: abs.x,
          top: abs.y,
          width: abs.width,
          height: abs.height,
          zIndex: abs.zIndex,
          transform: abs.rotation ? `rotate(${abs.rotation}deg)` : undefined,
          transformOrigin: getTransformOrigin(abs.anchor),
        })
      }
      break
  }
  
  return css
}


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getMaxWidthValue(maxWidth?: "full" | "contained" | "narrow" | number): string | undefined {
  if (maxWidth === "full") return "100%"
  if (maxWidth === "contained") return "1200px"
  if (maxWidth === "narrow") return "800px"
  if (typeof maxWidth === "number") return `${maxWidth}px`
  return undefined
}

function getFlexAlignment(alignment: string): string {
  const map: Record<string, string> = {
    start: "flex-start",
    end: "flex-end",
    center: "center",
    stretch: "stretch",
    "space-between": "space-between",
    "space-around": "space-around",
  }
  return map[alignment] || alignment
}

function getSizeValue(size?: number | "auto" | "full" | "fit-content"): string | undefined {
  if (size === "auto") return "auto"
  if (size === "full") return "100%"
  if (size === "fit-content") return "fit-content"
  if (typeof size === "number") return `${size}px`
  return undefined
}

function generateSpacingCSS(spacing: Spacing): string {
  const unit = spacing.unit || "px"
  return `${spacing.top}${unit} ${spacing.right}${unit} ${spacing.bottom}${unit} ${spacing.left}${unit}`
}

function generateBorderCSS(border?: Border): React.CSSProperties {
  if (!border || border.style === "none") return {}
  
  const radius = typeof border.radius === "number"
    ? border.radius
    : `${border.radius.topLeft}px ${border.radius.topRight}px ${border.radius.bottomRight}px ${border.radius.bottomLeft}px`
  
  return {
    borderWidth: border.width,
    borderStyle: border.style,
    borderColor: border.color,
    borderRadius: radius,
  }
}

function generateShadowCSS(shadow: Shadow): string {
  const inset = shadow.inset ? "inset " : ""
  return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
}

function generateGridPlacementCSS(placement: GridPlacement): React.CSSProperties {
  return {
    gridColumn: placement.column === "auto" 
      ? "auto" 
      : `${placement.column} / span ${placement.columnSpan}`,
    gridRow: placement.row === "auto"
      ? "auto"
      : `${placement.row} / span ${placement.rowSpan}`,
  }
}

function getTransformOrigin(anchor?: string): string {
  const map: Record<string, string> = {
    "top-left": "top left",
    "top-center": "top center",
    "top-right": "top right",
    "center-left": "center left",
    "center": "center center",
    "center-right": "center right",
    "bottom-left": "bottom left",
    "bottom-center": "bottom center",
    "bottom-right": "bottom right",
  }
  return map[anchor || "center"] || "center center"
}

// =============================================================================
// POSITION CALCULATIONS
// =============================================================================

/**
 * Calculate snap position for absolute layout
 */
export function snapToGrid(x: number, y: number, gridSize: number): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  }
}

/**
 * Calculate element bounds for collision detection
 */
export interface ElementBounds {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export function getElementBounds(element: EnhancedElement): ElementBounds | null {
  if (!element.position.absolute) return null
  
  const { x, y, width, height } = element.position.absolute
  return {
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height,
  }
}

/**
 * Check if two elements overlap (for absolute layout)
 */
export function elementsOverlap(a: ElementBounds, b: ElementBounds): boolean {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  )
}

/**
 * Find available position for a new element (avoid overlaps)
 */
export function findAvailablePosition(
  elements: EnhancedElement[],
  newWidth: number,
  newHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number = 8
): { x: number; y: number } {
  const existingBounds = elements
    .map(getElementBounds)
    .filter((b): b is ElementBounds => b !== null)
  
  // Try positions in a grid pattern
  for (let y = 0; y < canvasHeight - newHeight; y += gridSize) {
    for (let x = 0; x < canvasWidth - newWidth; x += gridSize) {
      const newBounds: ElementBounds = {
        left: x,
        top: y,
        right: x + newWidth,
        bottom: y + newHeight,
        width: newWidth,
        height: newHeight,
      }
      
      const hasOverlap = existingBounds.some(existing => elementsOverlap(newBounds, existing))
      if (!hasOverlap) {
        return { x, y }
      }
    }
  }
  
  // Fallback: place at bottom
  const maxBottom = Math.max(0, ...existingBounds.map(b => b.bottom))
  return { x: 0, y: maxBottom + gridSize }
}

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

/**
 * Get effective layout for a breakpoint
 */
export function getResponsiveLayout(
  section: EnhancedSection,
  breakpoint: "desktop" | "tablet" | "mobile"
): EnhancedSection["layout"] {
  if (breakpoint === "desktop") return section.layout
  
  const override = section.responsive?.[breakpoint]
  if (!override) return section.layout
  
  return {
    ...section.layout,
    ...override,
  } as EnhancedSection["layout"]
}

/**
 * Get effective element position for a breakpoint
 */
export function getResponsivePosition(
  element: EnhancedElement,
  breakpoint: "desktop" | "tablet" | "mobile"
): EnhancedElement["position"] {
  if (breakpoint === "desktop") return element.position
  
  const override = element.responsive?.[breakpoint]
  if (!override) return element.position
  
  return {
    ...element.position,
    ...override,
  } as EnhancedElement["position"]
}

// =============================================================================
// MIGRATION UTILITIES
// =============================================================================

/**
 * Convert old StoreBlock to EnhancedElement
 */
export function migrateBlockToElement(block: {
  id: string
  type: string
  variant?: string
  order: number
  visible: boolean
  settings: Record<string, unknown>
  locked?: boolean
  groupId?: string
}): EnhancedElement {
  return {
    id: block.id,
    type: block.type,
    variant: block.variant,
    position: {
      order: block.order,
    },
    settings: block.settings,
    visible: block.visible,
    locked: block.locked,
    groupId: block.groupId,
  }
}

/**
 * Convert old blocks array to EnhancedSection
 */
export function migrateBlocksToSection(
  blocks: Array<{
    id: string
    type: string
    variant?: string
    order: number
    visible: boolean
    settings: Record<string, unknown>
  }>,
  sectionId: string
): EnhancedSection {
  return {
    id: sectionId,
    type: "section",
    layout: {
      mode: "stack",
      gap: 0,
      alignment: "stretch",
    },
    style: {
      padding: { top: 0, right: 0, bottom: 0, left: 0, unit: "px" },
      margin: { top: 0, right: 0, bottom: 0, left: 0, unit: "px" },
      maxWidth: "full",
    },
    settings: {},
    elements: blocks.map(migrateBlockToElement),
    order: 0,
    visible: true,
  }
}
