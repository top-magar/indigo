/**
 * Shared Block Constants
 * 
 * Centralized styling constants for block types used across
 * Block Builder, Visual Editor, and other components.
 * 
 * Consolidates BLOCK_ICONS, BLOCK_COLORS, and BLOCK_NAMES to
 * reduce duplication and ensure consistency.
 */

import {
  Menu,
  Image,
  Heart,
  Grid3X3,
  Megaphone,
  MessageSquare,
  Shield,
  Mail,
  PanelBottom,
  AlignLeft,
  Square,
  Columns2,
  MousePointer,
  Video,
  HelpCircle,
  Images,
  type LucideIcon,
} from "lucide-react"
import type { BlockType } from "@/types/blocks"

// =============================================================================
// BLOCK ICONS
// =============================================================================

/**
 * Block icons mapping - used in layers panel, preview, settings, etc.
 */
export const BLOCK_ICONS: Record<BlockType, LucideIcon> = {
  // Layout / Container blocks
  section: Square,
  columns: Columns2,
  column: Columns2,
  header: Menu,
  footer: PanelBottom,

  // Content blocks
  hero: Image,
  "rich-text": AlignLeft,
  testimonials: MessageSquare,
  "trust-signals": Shield,
  "promotional-banner": Megaphone,

  // Commerce blocks
  "featured-product": Heart,
  "product-grid": Grid3X3,

  // Engagement blocks
  newsletter: Mail,

  // Primitive blocks
  image: Image,
  button: MousePointer,
  video: Video,
  faq: HelpCircle,
  gallery: Images,
}

// =============================================================================
// BLOCK TEXT COLORS
// =============================================================================

/**
 * Block text colors - used for icons and labels
 */
export const BLOCK_TEXT_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "text-gray-500",
  columns: "text-gray-500",
  column: "text-gray-400",
  header: "text-blue-500",
  footer: "text-slate-500",

  // Content blocks
  hero: "text-purple-500",
  "rich-text": "text-teal-500",
  testimonials: "text-cyan-500",
  "trust-signals": "text-indigo-500",
  "promotional-banner": "text-rose-500",

  // Commerce blocks
  "featured-product": "text-amber-500",
  "product-grid": "text-emerald-500",

  // Engagement blocks
  newsletter: "text-pink-500",

  // Primitive blocks
  image: "text-violet-500",
  button: "text-orange-500",
  video: "text-red-500",
  faq: "text-lime-500",
  gallery: "text-fuchsia-500",
}

// =============================================================================
// BLOCK BACKGROUND COLORS
// =============================================================================

/**
 * Block background colors - used for badges and highlights
 */
export const BLOCK_BG_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "bg-gray-100",
  columns: "bg-gray-100",
  column: "bg-gray-50",
  header: "bg-blue-100",
  footer: "bg-slate-100",

  // Content blocks
  hero: "bg-purple-100",
  "rich-text": "bg-teal-100",
  testimonials: "bg-cyan-100",
  "trust-signals": "bg-indigo-100",
  "promotional-banner": "bg-rose-100",

  // Commerce blocks
  "featured-product": "bg-amber-100",
  "product-grid": "bg-emerald-100",

  // Engagement blocks
  newsletter: "bg-pink-100",

  // Primitive blocks
  image: "bg-violet-100",
  button: "bg-orange-100",
  video: "bg-red-100",
  faq: "bg-lime-100",
  gallery: "bg-fuchsia-100",
}

// =============================================================================
// BLOCK BORDER COLORS
// =============================================================================

/**
 * Block border colors - used for selection and hover states
 */
export const BLOCK_BORDER_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "border-gray-300",
  columns: "border-gray-300",
  column: "border-gray-200",
  header: "border-blue-300",
  footer: "border-slate-300",

  // Content blocks
  hero: "border-purple-300",
  "rich-text": "border-teal-300",
  testimonials: "border-cyan-300",
  "trust-signals": "border-indigo-300",
  "promotional-banner": "border-rose-300",

  // Commerce blocks
  "featured-product": "border-amber-300",
  "product-grid": "border-emerald-300",

  // Engagement blocks
  newsletter: "border-pink-300",

  // Primitive blocks
  image: "border-violet-300",
  button: "border-orange-300",
  video: "border-red-300",
  faq: "border-lime-300",
  gallery: "border-fuchsia-300",
}

// =============================================================================
// BLOCK RING COLORS (for focus states)
// =============================================================================

/**
 * Block ring colors - used for focus and selection rings
 */
export const BLOCK_RING_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "ring-gray-400",
  columns: "ring-gray-400",
  column: "ring-gray-300",
  header: "ring-blue-400",
  footer: "ring-slate-400",

  // Content blocks
  hero: "ring-purple-400",
  "rich-text": "ring-teal-400",
  testimonials: "ring-cyan-400",
  "trust-signals": "ring-indigo-400",
  "promotional-banner": "ring-rose-400",

  // Commerce blocks
  "featured-product": "ring-amber-400",
  "product-grid": "ring-emerald-400",

  // Engagement blocks
  newsletter: "ring-pink-400",

  // Primitive blocks
  image: "ring-violet-400",
  button: "ring-orange-400",
  video: "ring-red-400",
  faq: "ring-lime-400",
  gallery: "ring-fuchsia-400",
}

// =============================================================================
// BLOCK NAMES
// =============================================================================

/**
 * Human-readable block names
 */
export const BLOCK_NAMES: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "Section",
  columns: "Columns",
  column: "Column",
  header: "Header",
  footer: "Footer",

  // Content blocks
  hero: "Hero",
  "rich-text": "Rich Text",
  testimonials: "Testimonials",
  "trust-signals": "Trust Signals",
  "promotional-banner": "Promo Banner",

  // Commerce blocks
  "featured-product": "Featured Product",
  "product-grid": "Product Grid",

  // Engagement blocks
  newsletter: "Newsletter",

  // Primitive blocks
  image: "Image",
  button: "Button",
  video: "Video",
  faq: "FAQ",
  gallery: "Gallery",
}

// =============================================================================
// BLOCK CATEGORIES
// =============================================================================

export type BlockCategory = "layout" | "content" | "commerce" | "engagement" | "primitive"

/**
 * Block category mapping
 */
export const BLOCK_CATEGORIES: Record<BlockType, BlockCategory> = {
  // Layout / Container blocks
  section: "layout",
  columns: "layout",
  column: "layout",
  header: "layout",
  footer: "layout",

  // Content blocks
  hero: "content",
  "rich-text": "content",
  testimonials: "content",
  "trust-signals": "content",
  "promotional-banner": "content",

  // Commerce blocks
  "featured-product": "commerce",
  "product-grid": "commerce",

  // Engagement blocks
  newsletter: "engagement",

  // Primitive blocks
  image: "primitive",
  button: "primitive",
  video: "primitive",
  faq: "primitive",
  gallery: "primitive",
}

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<BlockCategory, string> = {
  layout: "Layout",
  content: "Content",
  commerce: "Commerce",
  engagement: "Engagement",
  primitive: "Basic",
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all styling classes for a block type
 */
export function getBlockStyles(type: BlockType) {
  return {
    icon: BLOCK_ICONS[type],
    textColor: BLOCK_TEXT_COLORS[type],
    bgColor: BLOCK_BG_COLORS[type],
    borderColor: BLOCK_BORDER_COLORS[type],
    ringColor: BLOCK_RING_COLORS[type],
    name: BLOCK_NAMES[type],
    category: BLOCK_CATEGORIES[type],
  }
}

/**
 * Get blocks grouped by category
 */
export function getBlocksByCategory(): Record<BlockCategory, BlockType[]> {
  const result: Record<BlockCategory, BlockType[]> = {
    layout: [],
    content: [],
    commerce: [],
    engagement: [],
    primitive: [],
  }

  for (const [type, category] of Object.entries(BLOCK_CATEGORIES)) {
    result[category].push(type as BlockType)
  }

  return result
}

// =============================================================================
// EDITOR-SPECIFIC COLOR VARIANTS
// =============================================================================

/**
 * Combined block colors object - for components that need multiple color variants
 */
export const BLOCK_COLORS: Record<BlockType, { text: string; bg: string; border: string }> = {
  section: { text: "text-gray-500", bg: "bg-gray-500", border: "border-gray-500" },
  columns: { text: "text-gray-500", bg: "bg-gray-500", border: "border-gray-500" },
  column: { text: "text-gray-400", bg: "bg-gray-400", border: "border-gray-400" },
  header: { text: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500" },
  footer: { text: "text-slate-500", bg: "bg-slate-500", border: "border-slate-500" },
  hero: { text: "text-purple-500", bg: "bg-purple-500", border: "border-purple-500" },
  "rich-text": { text: "text-teal-500", bg: "bg-teal-500", border: "border-teal-500" },
  testimonials: { text: "text-cyan-500", bg: "bg-cyan-500", border: "border-cyan-500" },
  "trust-signals": { text: "text-indigo-500", bg: "bg-indigo-500", border: "border-indigo-500" },
  "promotional-banner": { text: "text-rose-500", bg: "bg-rose-500", border: "border-rose-500" },
  "featured-product": { text: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500" },
  "product-grid": { text: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500" },
  newsletter: { text: "text-pink-500", bg: "bg-pink-500", border: "border-pink-500" },
  image: { text: "text-violet-500", bg: "bg-violet-500", border: "border-violet-500" },
  button: { text: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500" },
  video: { text: "text-red-500", bg: "bg-red-500", border: "border-red-500" },
  faq: { text: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500" },
  gallery: { text: "text-fuchsia-500", bg: "bg-fuchsia-500", border: "border-fuchsia-500" },
}

/**
 * Block preview colors - solid colors for mini-preview bars
 */
export const BLOCK_PREVIEW_COLORS: Record<BlockType, string> = {
  section: "bg-gray-500/60",
  columns: "bg-gray-500/60",
  column: "bg-gray-400/60",
  header: "bg-blue-500/60",
  footer: "bg-slate-500/60",
  hero: "bg-purple-500/60",
  "rich-text": "bg-teal-500/60",
  testimonials: "bg-cyan-500/60",
  "trust-signals": "bg-indigo-500/60",
  "promotional-banner": "bg-rose-500/60",
  "featured-product": "bg-amber-500/60",
  "product-grid": "bg-emerald-500/60",
  newsletter: "bg-pink-500/60",
  image: "bg-violet-500/60",
  button: "bg-orange-500/60",
  video: "bg-red-500/60",
  faq: "bg-blue-500/60",
  gallery: "bg-fuchsia-500/60",
}

/**
 * Block palette colors - with hover states for block palette
 */
export const BLOCK_PALETTE_COLORS: Record<BlockType, string> = {
  section: "bg-gray-500/10 text-gray-600 dark:text-gray-400 group-hover:bg-gray-500/20",
  columns: "bg-gray-500/10 text-gray-600 dark:text-gray-400 group-hover:bg-gray-500/20",
  column: "bg-gray-400/10 text-gray-500 dark:text-gray-400 group-hover:bg-gray-400/20",
  header: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20",
  footer: "bg-slate-500/10 text-slate-600 dark:text-slate-400 group-hover:bg-slate-500/20",
  hero: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20",
  "rich-text": "bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/20",
  testimonials: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20",
  "trust-signals": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20",
  "promotional-banner": "bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20",
  "featured-product": "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20",
  "product-grid": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20",
  newsletter: "bg-pink-500/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500/20",
  image: "bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500/20",
  button: "bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20",
  video: "bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500/20",
  faq: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20",
  gallery: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 group-hover:bg-fuchsia-500/20",
}

/**
 * Block hover colors - with hover states for draggable items
 */
export const BLOCK_HOVER_COLORS: Record<BlockType, string> = {
  section: "bg-gray-500/10 group-hover:bg-gray-500/20",
  columns: "bg-gray-500/10 group-hover:bg-gray-500/20",
  column: "bg-gray-400/10 group-hover:bg-gray-400/20",
  header: "bg-blue-500/10 group-hover:bg-blue-500/20",
  footer: "bg-slate-500/10 group-hover:bg-slate-500/20",
  hero: "bg-purple-500/10 group-hover:bg-purple-500/20",
  "rich-text": "bg-teal-500/10 group-hover:bg-teal-500/20",
  testimonials: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
  "trust-signals": "bg-indigo-500/10 group-hover:bg-indigo-500/20",
  "promotional-banner": "bg-rose-500/10 group-hover:bg-rose-500/20",
  "featured-product": "bg-amber-500/10 group-hover:bg-amber-500/20",
  "product-grid": "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  newsletter: "bg-pink-500/10 group-hover:bg-pink-500/20",
  image: "bg-violet-500/10 group-hover:bg-violet-500/20",
  button: "bg-orange-500/10 group-hover:bg-orange-500/20",
  video: "bg-red-500/10 group-hover:bg-red-500/20",
  faq: "bg-blue-500/10 group-hover:bg-blue-500/20",
  gallery: "bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20",
}

/**
 * Get icon for a block type
 */
export function getBlockIcon(type: BlockType): LucideIcon {
  return BLOCK_ICONS[type]
}

/**
 * Get display name for a block type
 */
export function getBlockName(type: BlockType): string {
  return BLOCK_NAMES[type]
}

/**
 * Get all color variants for a block type
 */
export function getBlockColors(type: BlockType) {
  return {
    text: BLOCK_TEXT_COLORS[type],
    bg: BLOCK_BG_COLORS[type],
    border: BLOCK_BORDER_COLORS[type],
    ring: BLOCK_RING_COLORS[type],
    preview: BLOCK_PREVIEW_COLORS[type],
    palette: BLOCK_PALETTE_COLORS[type],
    hover: BLOCK_HOVER_COLORS[type],
  }
}
