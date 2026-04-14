/**
 * Store Section Registry
 *
 * Maps section types to available design variants.
 * Each variant is a React component that accepts standardized props.
 * Merchants pick sections + variants in the dashboard → stored as JSON → rendered on storefront.
 */

export type SectionType =
  | "header"
  | "hero"
  | "announcement"
  | "product-grid"
  | "categories"
  | "banner"
  | "testimonials"
  | "footer"

export interface SectionVariant {
  id: string
  name: string
  description: string
  thumbnail: string // path to preview image or emoji placeholder
}

export interface SectionConfig {
  id: string
  type: SectionType
  variant: string
  content: Record<string, string>
  visible: boolean
  order: number
}

/** Available variants per section type */
export const SECTION_VARIANTS: Record<SectionType, SectionVariant[]> = {
  header: [
    { id: "header-centered", name: "Centered", description: "Logo centered, nav below", thumbnail: "🏛️" },
    { id: "header-left", name: "Left Logo", description: "Logo left, nav right", thumbnail: "◀️" },
    { id: "header-minimal", name: "Minimal", description: "Just logo + cart icon", thumbnail: "✨" },
  ],
  hero: [
    { id: "hero-fullwidth", name: "Full Width Image", description: "Full-width background with overlay text", thumbnail: "🖼️" },
    { id: "hero-split", name: "Split", description: "Text left, image right", thumbnail: "↔️" },
    { id: "hero-minimal", name: "Minimal", description: "Text only, clean typography", thumbnail: "📝" },
    { id: "hero-video", name: "Video", description: "Background video with overlay", thumbnail: "🎬" },
  ],
  announcement: [
    { id: "announcement-bar", name: "Top Bar", description: "Colored bar with text", thumbnail: "📢" },
    { id: "announcement-banner", name: "Banner", description: "Full-width banner with CTA", thumbnail: "🎯" },
  ],
  "product-grid": [
    { id: "products-grid-3", name: "3 Column Grid", description: "Standard product grid", thumbnail: "▦" },
    { id: "products-grid-4", name: "4 Column Grid", description: "Dense product grid", thumbnail: "▣" },
    { id: "products-carousel", name: "Carousel", description: "Horizontal scrolling products", thumbnail: "↔️" },
    { id: "products-featured", name: "Featured + Grid", description: "Large featured product + grid", thumbnail: "⭐" },
  ],
  categories: [
    { id: "categories-cards", name: "Image Cards", description: "Category cards with images", thumbnail: "🃏" },
    { id: "categories-icons", name: "Icon Grid", description: "Minimal icons with labels", thumbnail: "🔲" },
    { id: "categories-full-bg", name: "Full Background", description: "Full-width category images", thumbnail: "🌄" },
  ],
  banner: [
    { id: "banner-cta", name: "CTA Banner", description: "Call to action with button", thumbnail: "📣" },
    { id: "banner-split", name: "Split Banner", description: "Image + text side by side", thumbnail: "↔️" },
    { id: "banner-minimal", name: "Minimal", description: "Text only with accent color", thumbnail: "💬" },
  ],
  testimonials: [
    { id: "testimonials-cards", name: "Cards", description: "Review cards in a grid", thumbnail: "💬" },
    { id: "testimonials-single", name: "Single Quote", description: "One rotating testimonial", thumbnail: "❝" },
  ],
  footer: [
    { id: "footer-columns", name: "4 Columns", description: "Links organized in columns", thumbnail: "▤" },
    { id: "footer-simple", name: "Simple", description: "Centered with social icons", thumbnail: "—" },
    { id: "footer-newsletter", name: "Newsletter", description: "Email signup + social links", thumbnail: "📧" },
  ],
}

/** Default sections for a new store */
export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "s-header", type: "header", variant: "header-left", content: {}, visible: true, order: 0 },
  { id: "s-announcement", type: "announcement", variant: "announcement-bar", content: { text: "Free shipping on orders over Rs 1,000!" }, visible: true, order: 1 },
  { id: "s-hero", type: "hero", variant: "hero-fullwidth", content: { title: "Welcome to our store", subtitle: "Discover amazing products", cta: "Shop Now" }, visible: true, order: 2 },
  { id: "s-products", type: "product-grid", variant: "products-grid-3", content: { title: "Featured Products", limit: "8" }, visible: true, order: 3 },
  { id: "s-categories", type: "categories", variant: "categories-cards", content: { title: "Shop by Category" }, visible: true, order: 4 },
  { id: "s-footer", type: "footer", variant: "footer-simple", content: {}, visible: true, order: 5 },
]

/** Section type display names */
export const SECTION_LABELS: Record<SectionType, string> = {
  header: "Header",
  hero: "Hero",
  announcement: "Announcement",
  "product-grid": "Products",
  categories: "Categories",
  banner: "Banner / CTA",
  testimonials: "Testimonials",
  footer: "Footer",
}
