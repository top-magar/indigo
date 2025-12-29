/**
 * Block Constants - Shared styling constants for block types
 * 
 * Consolidates BLOCK_ICONS, BLOCK_COLORS, and BLOCK_NAMES used across
 * multiple editor components to reduce duplication and ensure consistency.
 */

import {
  Menu01Icon,
  Image01Icon,
  FavouriteIcon,
  GridIcon,
  Megaphone01Icon,
  MessageMultiple01Icon,
  ShieldIcon,
  Mail01Icon,
  LayoutBottomIcon,
  TextAlignLeftIcon,
  SquareIcon,
  LayoutTwoColumnIcon,
  Cursor01Icon,
  ArrowExpand01Icon,
  MinusSignIcon,
  Video01Icon,
  HelpCircleIcon,
  Clock01Icon,
  Image02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import type { BlockType } from "@/types/blocks"

// Icon type from hugeicons
type HugeIcon = typeof Menu01Icon

/**
 * Block icons mapping - used in layers panel, preview, settings, etc.
 */
export const BLOCK_ICONS: Record<BlockType, HugeIcon> = {
  // Layout / Container blocks
  section: SquareIcon,
  columns: LayoutTwoColumnIcon,
  column: LayoutTwoColumnIcon,
  header: Menu01Icon,
  footer: LayoutBottomIcon,
  
  // Content blocks
  hero: Image01Icon,
  "rich-text": TextAlignLeftIcon,
  testimonials: MessageMultiple01Icon,
  "trust-signals": ShieldIcon,
  "promotional-banner": Megaphone01Icon,
  
  // Commerce blocks
  "featured-product": FavouriteIcon,
  "product-grid": GridIcon,
  
  // Engagement blocks
  newsletter: Mail01Icon,
  
  // Primitive blocks
  image: Image01Icon,
  button: Cursor01Icon,
  spacer: ArrowExpand01Icon,
  divider: MinusSignIcon,
  video: Video01Icon,
  faq: HelpCircleIcon,
  countdown: Clock01Icon,
  gallery: Image02Icon,
  icon: StarIcon,
}

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
  spacer: "text-gray-400",
  divider: "text-gray-400",
  video: "text-red-500",
  faq: "text-blue-500",
  countdown: "text-yellow-500",
  gallery: "text-fuchsia-500",
  icon: "text-lime-500",
}

/**
 * Block background colors - used for icon backgrounds and highlights
 */
export const BLOCK_BG_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "bg-gray-500/10",
  columns: "bg-gray-500/10",
  column: "bg-gray-400/10",
  header: "bg-blue-500/10",
  footer: "bg-slate-500/10",
  
  // Content blocks
  hero: "bg-purple-500/10",
  "rich-text": "bg-teal-500/10",
  testimonials: "bg-cyan-500/10",
  "trust-signals": "bg-indigo-500/10",
  "promotional-banner": "bg-rose-500/10",
  
  // Commerce blocks
  "featured-product": "bg-amber-500/10",
  "product-grid": "bg-emerald-500/10",
  
  // Engagement blocks
  newsletter: "bg-pink-500/10",
  
  // Primitive blocks
  image: "bg-violet-500/10",
  button: "bg-orange-500/10",
  spacer: "bg-gray-400/10",
  divider: "bg-gray-400/10",
  video: "bg-red-500/10",
  faq: "bg-blue-500/10",
  countdown: "bg-yellow-500/10",
  gallery: "bg-fuchsia-500/10",
  icon: "bg-lime-500/10",
}

/**
 * Block border colors - used for selection and hover states
 */
export const BLOCK_BORDER_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "border-gray-500",
  columns: "border-gray-500",
  column: "border-gray-400",
  header: "border-blue-500",
  footer: "border-slate-500",
  
  // Content blocks
  hero: "border-purple-500",
  "rich-text": "border-teal-500",
  testimonials: "border-cyan-500",
  "trust-signals": "border-indigo-500",
  "promotional-banner": "border-rose-500",
  
  // Commerce blocks
  "featured-product": "border-amber-500",
  "product-grid": "border-emerald-500",
  
  // Engagement blocks
  newsletter: "border-pink-500",
  
  // Primitive blocks
  image: "border-violet-500",
  button: "border-orange-500",
  spacer: "border-gray-400",
  divider: "border-gray-400",
  video: "border-red-500",
  faq: "border-blue-500",
  countdown: "border-yellow-500",
  gallery: "border-fuchsia-500",
  icon: "border-lime-500",
}

/**
 * Block display names - human-readable names for UI
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
  spacer: "Spacer",
  divider: "Divider",
  video: "Video",
  faq: "FAQ",
  countdown: "Countdown",
  gallery: "Gallery",
  icon: "Icon",
}

/**
 * Combined block colors object - for components that need multiple color variants
 */
export const BLOCK_COLORS: Record<BlockType, { text: string; bg: string; border: string }> = {
  // Layout / Container blocks
  section: { text: "text-gray-500", bg: "bg-gray-500", border: "border-gray-500" },
  columns: { text: "text-gray-500", bg: "bg-gray-500", border: "border-gray-500" },
  column: { text: "text-gray-400", bg: "bg-gray-400", border: "border-gray-400" },
  header: { text: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500" },
  footer: { text: "text-slate-500", bg: "bg-slate-500", border: "border-slate-500" },
  
  // Content blocks
  hero: { text: "text-purple-500", bg: "bg-purple-500", border: "border-purple-500" },
  "rich-text": { text: "text-teal-500", bg: "bg-teal-500", border: "border-teal-500" },
  testimonials: { text: "text-cyan-500", bg: "bg-cyan-500", border: "border-cyan-500" },
  "trust-signals": { text: "text-indigo-500", bg: "bg-indigo-500", border: "border-indigo-500" },
  "promotional-banner": { text: "text-rose-500", bg: "bg-rose-500", border: "border-rose-500" },
  
  // Commerce blocks
  "featured-product": { text: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500" },
  "product-grid": { text: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500" },
  
  // Engagement blocks
  newsletter: { text: "text-pink-500", bg: "bg-pink-500", border: "border-pink-500" },
  
  // Primitive blocks
  image: { text: "text-violet-500", bg: "bg-violet-500", border: "border-violet-500" },
  button: { text: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500" },
  spacer: { text: "text-gray-400", bg: "bg-gray-400", border: "border-gray-400" },
  divider: { text: "text-gray-400", bg: "bg-gray-400", border: "border-gray-400" },
  video: { text: "text-red-500", bg: "bg-red-500", border: "border-red-500" },
  faq: { text: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500" },
  countdown: { text: "text-yellow-500", bg: "bg-yellow-500", border: "border-yellow-500" },
  gallery: { text: "text-fuchsia-500", bg: "bg-fuchsia-500", border: "border-fuchsia-500" },
  icon: { text: "text-lime-500", bg: "bg-lime-500", border: "border-lime-500" },
}

/**
 * Block preview colors - solid colors for mini-preview bars
 */
export const BLOCK_PREVIEW_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "bg-gray-500/60",
  columns: "bg-gray-500/60",
  column: "bg-gray-400/60",
  header: "bg-blue-500/60",
  footer: "bg-slate-500/60",
  
  // Content blocks
  hero: "bg-purple-500/60",
  "rich-text": "bg-teal-500/60",
  testimonials: "bg-cyan-500/60",
  "trust-signals": "bg-indigo-500/60",
  "promotional-banner": "bg-rose-500/60",
  
  // Commerce blocks
  "featured-product": "bg-amber-500/60",
  "product-grid": "bg-emerald-500/60",
  
  // Engagement blocks
  newsletter: "bg-pink-500/60",
  
  // Primitive blocks
  image: "bg-violet-500/60",
  button: "bg-orange-500/60",
  spacer: "bg-gray-400/60",
  divider: "bg-gray-400/60",
  video: "bg-red-500/60",
  faq: "bg-blue-500/60",
  countdown: "bg-yellow-500/60",
  gallery: "bg-fuchsia-500/60",
  icon: "bg-lime-500/60",
}

/**
 * Block palette colors - with hover states for block palette
 */
export const BLOCK_PALETTE_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "bg-gray-500/10 text-gray-600 dark:text-gray-400 group-hover:bg-gray-500/20",
  columns: "bg-gray-500/10 text-gray-600 dark:text-gray-400 group-hover:bg-gray-500/20",
  column: "bg-gray-400/10 text-gray-500 dark:text-gray-400 group-hover:bg-gray-400/20",
  header: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20",
  footer: "bg-slate-500/10 text-slate-600 dark:text-slate-400 group-hover:bg-slate-500/20",
  
  // Content blocks
  hero: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20",
  "rich-text": "bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/20",
  testimonials: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20",
  "trust-signals": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20",
  "promotional-banner": "bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20",
  
  // Commerce blocks
  "featured-product": "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20",
  "product-grid": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20",
  
  // Engagement blocks
  newsletter: "bg-pink-500/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500/20",
  
  // Primitive blocks
  image: "bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500/20",
  button: "bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500/20",
  spacer: "bg-gray-400/10 text-gray-500 dark:text-gray-400 group-hover:bg-gray-400/20",
  divider: "bg-gray-400/10 text-gray-500 dark:text-gray-400 group-hover:bg-gray-400/20",
  video: "bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500/20",
  faq: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20",
  countdown: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500/20",
  gallery: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 group-hover:bg-fuchsia-500/20",
  icon: "bg-lime-500/10 text-lime-600 dark:text-lime-400 group-hover:bg-lime-500/20",
}

/**
 * Block hover colors - with hover states for draggable items
 */
export const BLOCK_HOVER_COLORS: Record<BlockType, string> = {
  // Layout / Container blocks
  section: "bg-gray-500/10 group-hover:bg-gray-500/20",
  columns: "bg-gray-500/10 group-hover:bg-gray-500/20",
  column: "bg-gray-400/10 group-hover:bg-gray-400/20",
  header: "bg-blue-500/10 group-hover:bg-blue-500/20",
  footer: "bg-slate-500/10 group-hover:bg-slate-500/20",
  
  // Content blocks
  hero: "bg-purple-500/10 group-hover:bg-purple-500/20",
  "rich-text": "bg-teal-500/10 group-hover:bg-teal-500/20",
  testimonials: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
  "trust-signals": "bg-indigo-500/10 group-hover:bg-indigo-500/20",
  "promotional-banner": "bg-rose-500/10 group-hover:bg-rose-500/20",
  
  // Commerce blocks
  "featured-product": "bg-amber-500/10 group-hover:bg-amber-500/20",
  "product-grid": "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  
  // Engagement blocks
  newsletter: "bg-pink-500/10 group-hover:bg-pink-500/20",
  
  // Primitive blocks
  image: "bg-violet-500/10 group-hover:bg-violet-500/20",
  button: "bg-orange-500/10 group-hover:bg-orange-500/20",
  spacer: "bg-gray-400/10 group-hover:bg-gray-400/20",
  divider: "bg-gray-400/10 group-hover:bg-gray-400/20",
  video: "bg-red-500/10 group-hover:bg-red-500/20",
  faq: "bg-blue-500/10 group-hover:bg-blue-500/20",
  countdown: "bg-yellow-500/10 group-hover:bg-yellow-500/20",
  gallery: "bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20",
  icon: "bg-lime-500/10 group-hover:bg-lime-500/20",
}

/**
 * Get icon for a block type
 */
export function getBlockIcon(type: BlockType): HugeIcon {
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
    preview: BLOCK_PREVIEW_COLORS[type],
    palette: BLOCK_PALETTE_COLORS[type],
    hover: BLOCK_HOVER_COLORS[type],
  }
}
