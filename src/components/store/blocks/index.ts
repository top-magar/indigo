// Block Components Export
export { HeaderBlock } from "./header"
export { HeroBlock } from "./hero"
export { FeaturedProductBlock } from "./featured-product"
export { ProductGridBlock } from "./product-grid"
export { PromoBannerBlock } from "./promotional-banner"
export { TestimonialsBlock } from "./testimonials"
export { TrustSignalsBlock } from "./trust-signals"
export { NewsletterBlock } from "./newsletter"
export { FooterBlock } from "./footer"
export { RichTextBlock } from "./rich-text"
export { BlockRenderer } from "./block-renderer"
export { LiveBlockRenderer } from "./live-block-renderer"
export { EditableBlockWrapper } from "./editable-block-wrapper"
export { EditableText } from "./editable-text"
export { EditableRichText, RichTextToolbar, useRichTextEditor } from "./rich-text-editor"
export { BlockActionBar } from "./block-action-bar"

// Container Blocks (Hybrid Architecture)
export { SectionBlock } from "./section"
export { ColumnsBlock, ColumnBlock } from "./columns"

// Primitive Blocks (Hybrid Architecture)
export { ImageBlock } from "./image"
export { ButtonBlock } from "./button"

// New Content Blocks
export { VideoBlock } from "./video"
export { FAQBlock } from "./faq"
export { GalleryBlock } from "./gallery"

// Re-export from lib for convenience (server-compatible)
export { createDefaultHomepageLayout } from "@/features/store/default-layout"

// Block metadata and registry
export { BLOCK_REGISTRY, getBlockMeta, getVariantMeta } from "./registry"

// Template presets
export {
  TEMPLATE_PRESETS,
  TEMPLATE_LIST,
  getTemplateById,
  templateToLayout,
  type TemplateId,
  type TemplatePreset,
} from "./templates"

// Types
export type { Product } from "./product-grid"
export type { FeaturedProduct } from "./featured-product"
