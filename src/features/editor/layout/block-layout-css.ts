/**
 * Block Layout CSS Generator
 * 
 * Generates CSS styles from block layout settings (layoutMode, gap, columns, etc.)
 * This bridges the SectionSettings component with actual block rendering.
 */

import type { CSSProperties } from "react"

export type LayoutMode = "stack" | "grid" | "flex" | "absolute"
export type Alignment = "start" | "center" | "end" | "stretch" | "space-between" | "space-around"

export interface BlockLayoutSettings {
  layoutMode?: LayoutMode
  gap?: number
  alignment?: Alignment
  columns?: number
  columnGap?: number
  rowGap?: number
  flexDirection?: "row" | "column"
  flexWrap?: boolean
}

/**
 * Convert alignment value to CSS flex/grid alignment
 */
function getAlignmentValue(alignment: Alignment): string {
  const map: Record<Alignment, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    "space-between": "space-between",
    "space-around": "space-around",
  }
  return map[alignment] || "stretch"
}

/**
 * Generate CSS properties from block layout settings
 */
export function generateBlockLayoutCSS(settings: BlockLayoutSettings): CSSProperties {
  const { layoutMode = "stack", gap = 24, alignment = "stretch" } = settings

  switch (layoutMode) {
    case "stack":
      return {
        display: "flex",
        flexDirection: "column",
        gap: `${gap}px`,
        alignItems: getAlignmentValue(alignment),
      }

    case "grid": {
      const { columns = 3, columnGap = 24, rowGap = 24 } = settings
      return {
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        columnGap: `${columnGap}px`,
        rowGap: `${rowGap}px`,
      }
    }

    case "flex": {
      const { flexDirection = "row", flexWrap = true } = settings
      return {
        display: "flex",
        flexDirection,
        flexWrap: flexWrap ? "wrap" : "nowrap",
        gap: `${gap}px`,
        justifyContent: getAlignmentValue(alignment),
        alignItems: flexDirection === "row" ? "center" : getAlignmentValue(alignment),
      }
    }

    case "absolute": {
      return {
        position: "relative",
      }
    }

    default:
      return {}
  }
}

/**
 * Check if a block type supports layout settings
 */
export const SECTION_BLOCK_TYPES = [
  "hero",
  "featured-collection",
  "product-grid",
  "collection-list",
  "multicolumn",
  "testimonials",
  "image-with-text",
  "rich-text",
  "newsletter",
  "custom-content",
] as const

export type SectionBlockType = (typeof SECTION_BLOCK_TYPES)[number]

export function isSectionBlock(blockType: string): blockType is SectionBlockType {
  return SECTION_BLOCK_TYPES.includes(blockType as SectionBlockType)
}

/**
 * Extract layout settings from block settings
 */
export function extractLayoutSettings(
  blockSettings: Record<string, unknown>
): BlockLayoutSettings {
  return {
    layoutMode: blockSettings.layoutMode as LayoutMode | undefined,
    gap: blockSettings.gap as number | undefined,
    alignment: blockSettings.alignment as Alignment | undefined,
    columns: blockSettings.columns as number | undefined,
    columnGap: blockSettings.columnGap as number | undefined,
    rowGap: blockSettings.rowGap as number | undefined,
    flexDirection: blockSettings.flexDirection as "row" | "column" | undefined,
    flexWrap: blockSettings.flexWrap as boolean | undefined,
  }
}
