// Block System Types - Hybrid Architecture
// Supports both atomic blocks and nested container blocks

// =============================================================================
// BLOCK TYPE CATEGORIES
// =============================================================================

// Atomic blocks - self-contained, no children
export type AtomicBlockType =
  | "header"
  | "hero"
  | "featured-product"
  | "product-grid"
  | "promotional-banner"
  | "testimonials"
  | "trust-signals"
  | "newsletter"
  | "footer"
  | "rich-text"
  | "image"
  | "button"
  | "spacer"
  | "divider"
  | "video"
  | "faq"
  | "countdown"
  | "gallery"
  | "icon"

// Container blocks - can hold child blocks
export type ContainerBlockType =
  | "section"
  | "columns"
  | "column"

// All block types
export type BlockType = AtomicBlockType | ContainerBlockType

// Helper to check if a block type is a container
export function isContainerBlockType(type: BlockType): type is ContainerBlockType {
  return type === "section" || type === "columns" || type === "column"
}

// =============================================================================
// VARIANT TYPES
// =============================================================================

// Atomic block variants
export type HeaderVariant = "classic" | "centered" | "minimal" | "mega-menu" | "announcement"
export type HeroVariant = "full-width" | "split" | "video" | "minimal-text" | "product-showcase"
export type FeaturedProductVariant = "large-image" | "gallery" | "lifestyle" | "comparison" | "urgency"
export type ProductGridVariant = "standard" | "featured-grid" | "carousel" | "list" | "masonry"
export type PromoBannerVariant = "full-width" | "split-image" | "countdown" | "discount-code" | "multi-offer"
export type TestimonialsVariant = "carousel" | "grid" | "featured" | "video" | "aggregate"
export type TrustSignalsVariant = "icon-row" | "feature-cards" | "logo-cloud" | "guarantee" | "stats"
export type NewsletterVariant = "inline" | "card" | "split-image" | "full-width" | "multi-field"
export type FooterVariant = "multi-column" | "centered" | "newsletter" | "contact" | "rich"
export type RichTextVariant = "simple" | "card" | "full-width" | "two-column" | "highlight"
export type ImageVariant = "default" | "rounded" | "circle" | "card"
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link"
export type SpacerVariant = "small" | "medium" | "large" | "custom"
export type DividerVariant = "solid" | "dashed" | "dotted" | "gradient"
export type VideoVariant = "inline" | "fullwidth" | "background" | "lightbox"
export type FAQVariant = "accordion" | "grid" | "simple" | "searchable"
export type CountdownVariant = "inline" | "banner" | "card" | "minimal"
export type GalleryVariant = "grid" | "masonry" | "carousel" | "lightbox"
export type IconVariant = "default" | "circle" | "square" | "outline"

// Container block variants
export type SectionVariant = "default" | "contained" | "full-width" | "split"
export type ColumnsVariant = "equal" | "left-heavy" | "right-heavy" | "sidebar-left" | "sidebar-right"
export type ColumnVariant = "default"

// Responsive visibility settings per viewport
export interface ResponsiveVisibility {
  mobile: boolean
  tablet: boolean
  desktop: boolean
}

// =============================================================================
// BASE INTERFACES
// =============================================================================

// Base block interface (shared by all blocks)
export interface BaseBlock {
  id: string
  type: BlockType
  order: number
  visible: boolean
  // Optional parent reference for nested blocks
  parentId?: string
  // Block locking - prevents editing and moving
  locked?: boolean
  // Group ID - blocks with same groupId move together
  groupId?: string
  // Responsive visibility - show/hide per viewport
  responsiveVisibility?: ResponsiveVisibility
  // Custom CSS class for advanced styling
  customClass?: string
}

// Base container interface (for blocks that can have children)
export interface BaseContainerBlock extends BaseBlock {
  children: StoreBlock[]
}

// =============================================================================
// ATOMIC BLOCKS - Self-contained, no children
// =============================================================================

// Header Block
export interface HeaderBlock extends BaseBlock {
  type: "header"
  variant: HeaderVariant
  settings: {
    logo?: string
    logoText?: string
    navLinks: { label: string; href: string }[]
    showSearch: boolean
    showAccount: boolean
    sticky: boolean
    announcementText?: string
    announcementLink?: string
    backgroundColor?: string
    transparent?: boolean
  }
}

// Hero Block
export interface HeroBlock extends BaseBlock {
  type: "hero"
  variant: HeroVariant
  settings: {
    headline: string
    subheadline?: string
    primaryCtaText: string
    primaryCtaLink: string
    secondaryCtaText?: string
    secondaryCtaLink?: string
    backgroundImage?: string
    backgroundVideo?: string
    overlayOpacity: number
    textAlignment: "left" | "center" | "right"
    height: "full" | "large" | "medium"
    featuredProductId?: string
  }
}

// Featured Product Block
export interface FeaturedProductBlock extends BaseBlock {
  type: "featured-product"
  variant: FeaturedProductVariant
  settings: {
    productId: string
    showPrice: boolean
    showReviews: boolean
    customHeadline?: string
    customDescription?: string
    badgeText?: string
    showCountdown: boolean
    countdownEnd?: string
    backgroundColor?: string
  }
}

// Product Grid Block
export interface ProductGridBlock extends BaseBlock {
  type: "product-grid"
  variant: ProductGridVariant
  settings: {
    collectionId?: string
    productIds?: string[]
    productsToShow: number
    columns: 3 | 4 | 5
    showPrices: boolean
    showQuickAdd: boolean
    showReviews: boolean
    sectionTitle?: string
    showViewAll: boolean
    sortOrder: "newest" | "price-asc" | "price-desc" | "bestselling"
  }
}

// Promotional Banner Block
export interface PromoBannerBlock extends BaseBlock {
  type: "promotional-banner"
  variant: PromoBannerVariant
  settings: {
    headline: string
    subtext?: string
    ctaText: string
    ctaLink: string
    backgroundColor?: string
    backgroundImage?: string
    discountCode?: string
    countdownEnd?: string
    offers?: { headline: string; subtext: string; ctaText: string; ctaLink: string }[]
  }
}

// Testimonials Block
export interface TestimonialsBlock extends BaseBlock {
  type: "testimonials"
  variant: TestimonialsVariant
  settings: {
    dataSource: "manual" | "product-reviews" | "all-reviews"
    reviewsToShow: number
    showRatings: boolean
    showPhotos: boolean
    showProduct: boolean
    sectionTitle?: string
    manualReviews?: {
      quote: string
      author: string
      role?: string
      avatar?: string
      rating?: number
      productName?: string
    }[]
    videoUrls?: string[]
  }
}

// Trust Signals Block
export interface TrustSignalsBlock extends BaseBlock {
  type: "trust-signals"
  variant: TrustSignalsVariant
  settings: {
    items: {
      icon: string
      title: string
      description?: string
    }[]
    logos?: string[]
    guaranteeText?: string
    stats?: { value: string; label: string }[]
    backgroundColor?: string
    linkToPolicies: boolean
  }
}

// Newsletter Block
export interface NewsletterBlock extends BaseBlock {
  type: "newsletter"
  variant: NewsletterVariant
  settings: {
    headline: string
    subtext?: string
    buttonText: string
    incentiveCode?: string
    backgroundColor?: string
    backgroundImage?: string
    collectName: boolean
    privacyText?: string
    successMessage: string
  }
}

// Footer Block
export interface FooterBlock extends BaseBlock {
  type: "footer"
  variant: FooterVariant
  settings: {
    logo?: string
    logoText?: string
    columns: {
      title: string
      links: { label: string; href: string }[]
    }[]
    contactEmail?: string
    contactPhone?: string
    address?: string
    socialLinks: { platform: string; url: string }[]
    showPaymentIcons: boolean
    showNewsletter: boolean
    copyrightText?: string
    legalLinks: { label: string; href: string }[]
  }
}

// Rich Text Block
export interface RichTextBlock extends BaseBlock {
  type: "rich-text"
  variant: RichTextVariant
  settings: {
    content: string
    backgroundColor?: string
    textColor?: string
    padding: "none" | "small" | "medium" | "large"
    maxWidth: "full" | "narrow" | "medium" | "wide"
    alignment: "left" | "center" | "right"
  }
}

// Image Block (new primitive)
export interface ImageBlock extends BaseBlock {
  type: "image"
  variant: ImageVariant
  settings: {
    src: string
    alt: string
    width?: number
    height?: number
    aspectRatio?: "auto" | "1:1" | "4:3" | "16:9" | "3:2" | "2:3"
    objectFit: "cover" | "contain" | "fill" | "none"
    link?: string
    caption?: string
  }
}

// Button Block (new primitive)
export interface ButtonBlock extends BaseBlock {
  type: "button"
  variant: ButtonVariant
  settings: {
    text: string
    href: string
    size: "sm" | "md" | "lg"
    fullWidth: boolean
    icon?: string
    iconPosition?: "left" | "right"
  }
}

// Spacer Block (new primitive)
export interface SpacerBlock extends BaseBlock {
  type: "spacer"
  variant: SpacerVariant
  settings: {
    height: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge" | "custom"
    customHeight?: number // in pixels, used when height is "custom"
    showOnMobile: boolean
  }
}

// Divider Block (new primitive)
export interface DividerBlock extends BaseBlock {
  type: "divider"
  variant: DividerVariant
  settings: {
    color?: string
    thickness: number
    width: "full" | "medium" | "short"
    margin: "none" | "small" | "medium" | "large"
  }
}

// Video Block
export interface VideoBlock extends BaseBlock {
  type: "video"
  variant: VideoVariant
  settings: {
    src: string
    poster?: string
    autoplay: boolean
    loop: boolean
    muted: boolean
    controls: boolean
    aspectRatio: "16:9" | "4:3" | "1:1" | "9:16" | "21:9"
    caption?: string
    maxWidth?: "full" | "large" | "medium" | "small"
  }
}

// FAQ Block
export interface FAQBlock extends BaseBlock {
  type: "faq"
  variant: FAQVariant
  settings: {
    title?: string
    subtitle?: string
    items: {
      question: string
      answer: string
    }[]
    allowMultipleOpen: boolean
    defaultOpenFirst: boolean
    showSearch: boolean
    columns: 1 | 2
  }
}

// Countdown Block
export interface CountdownBlock extends BaseBlock {
  type: "countdown"
  variant: CountdownVariant
  settings: {
    endDate: string
    title?: string
    subtitle?: string
    showDays: boolean
    showHours: boolean
    showMinutes: boolean
    showSeconds: boolean
    expiredMessage: string
    backgroundColor?: string
    textColor?: string
    ctaText?: string
    ctaLink?: string
  }
}

// Gallery Block
export interface GalleryBlock extends BaseBlock {
  type: "gallery"
  variant: GalleryVariant
  settings: {
    images: {
      src: string
      alt: string
      caption?: string
    }[]
    columns: 2 | 3 | 4 | 5
    gap: "none" | "small" | "medium" | "large"
    aspectRatio: "auto" | "1:1" | "4:3" | "16:9" | "3:2"
    showCaptions: boolean
    enableLightbox: boolean
  }
}

// Icon Block
export interface IconBlock extends BaseBlock {
  type: "icon"
  variant: IconVariant
  settings: {
    icon: string
    size: "small" | "medium" | "large" | "xlarge"
    color?: string
    backgroundColor?: string
    title?: string
    description?: string
    link?: string
    alignment: "left" | "center" | "right"
  }
}

// =============================================================================
// CONTAINER BLOCKS - Can hold child blocks
// =============================================================================

// Section Block - A container for grouping blocks with shared styling
export interface SectionBlock extends BaseContainerBlock {
  type: "section"
  variant: SectionVariant
  settings: {
    backgroundColor?: string
    backgroundImage?: string
    backgroundOverlay?: number
    padding: "none" | "small" | "medium" | "large" | "xlarge"
    maxWidth: "full" | "contained" | "narrow"
    verticalAlign: "top" | "center" | "bottom"
    minHeight?: string
    anchor?: string // for navigation links
  }
  children: StoreBlock[]
}

// Columns Block - A multi-column layout container
export interface ColumnsBlock extends BaseContainerBlock {
  type: "columns"
  variant: ColumnsVariant
  settings: {
    columns: 2 | 3 | 4
    gap: "none" | "small" | "medium" | "large"
    verticalAlign: "top" | "center" | "bottom" | "stretch"
    reverseOnMobile: boolean
    stackOnMobile: boolean
  }
  children: ColumnBlock[] // Only ColumnBlocks as direct children
}

// Column Block - Individual column within a Columns block
export interface ColumnBlock extends BaseContainerBlock {
  type: "column"
  variant: ColumnVariant
  settings: {
    width?: string // e.g., "1/3", "2/3", "auto"
    padding: "none" | "small" | "medium" | "large"
    backgroundColor?: string
    verticalAlign: "top" | "center" | "bottom"
  }
  children: StoreBlock[] // Can contain any blocks except columns
}

// =============================================================================
// UNION TYPES
// =============================================================================

// All atomic blocks
export type AtomicBlock =
  | HeaderBlock
  | HeroBlock
  | FeaturedProductBlock
  | ProductGridBlock
  | PromoBannerBlock
  | TestimonialsBlock
  | TrustSignalsBlock
  | NewsletterBlock
  | FooterBlock
  | RichTextBlock
  | ImageBlock
  | ButtonBlock
  | SpacerBlock
  | DividerBlock
  | VideoBlock
  | FAQBlock
  | CountdownBlock
  | GalleryBlock
  | IconBlock

// All container blocks
export type ContainerBlock =
  | SectionBlock
  | ColumnsBlock
  | ColumnBlock

// All blocks (union type)
export type StoreBlock = AtomicBlock | ContainerBlock

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isContainerBlock(block: StoreBlock): block is ContainerBlock {
  return isContainerBlockType(block.type)
}

export function isAtomicBlock(block: StoreBlock): block is AtomicBlock {
  return !isContainerBlockType(block.type)
}

export function isSectionBlock(block: StoreBlock): block is SectionBlock {
  return block.type === "section"
}

export function isColumnsBlock(block: StoreBlock): block is ColumnsBlock {
  return block.type === "columns"
}

export function isColumnBlock(block: StoreBlock): block is ColumnBlock {
  return block.type === "column"
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Get all blocks including nested children (flattened)
export function flattenBlocks(blocks: StoreBlock[]): StoreBlock[] {
  const result: StoreBlock[] = []
  
  function traverse(block: StoreBlock) {
    result.push(block)
    if (isContainerBlock(block) && block.children) {
      block.children.forEach(traverse)
    }
  }
  
  blocks.forEach(traverse)
  return result
}

// Find a block by ID in a nested structure
export function findBlockById(blocks: StoreBlock[], id: string): StoreBlock | undefined {
  for (const block of blocks) {
    if (block.id === id) return block
    if (isContainerBlock(block) && block.children) {
      const found = findBlockById(block.children, id)
      if (found) return found
    }
  }
  return undefined
}

// Find parent block of a given block ID
export function findParentBlock(blocks: StoreBlock[], childId: string): ContainerBlock | undefined {
  for (const block of blocks) {
    if (isContainerBlock(block) && block.children) {
      if (block.children.some(child => child.id === childId)) {
        return block
      }
      const found = findParentBlock(block.children, childId)
      if (found) return found
    }
  }
  return undefined
}

// Get the path to a block (array of parent IDs)
export function getBlockPath(blocks: StoreBlock[], targetId: string): string[] {
  function traverse(currentBlocks: StoreBlock[], path: string[]): string[] | null {
    for (const block of currentBlocks) {
      if (block.id === targetId) {
        return path
      }
      if (isContainerBlock(block) && block.children) {
        const result = traverse(block.children, [...path, block.id])
        if (result) return result
      }
    }
    return null
  }
  
  return traverse(blocks, []) || []
}

// =============================================================================
// PAGE & METADATA TYPES
// =============================================================================

// Page layout configuration
export interface PageLayout {
  id: string
  name: string
  slug: string
  blocks: StoreBlock[]
  isHomepage: boolean
  status: "draft" | "published"
  createdAt: string
  updatedAt: string
}

// Block metadata for the editor
export interface BlockMeta {
  type: BlockType
  name: string
  description: string
  icon: string
  category: "layout" | "content" | "commerce" | "engagement" | "primitive"
  isContainer: boolean
  allowedChildren?: BlockType[] // For containers: which block types can be children
  allowedParents?: BlockType[] // Which containers can hold this block
  variants: {
    id: string
    name: string
    description: string
    thumbnail?: string
  }[]
  defaultSettings: Record<string, unknown>
}

// Store theme settings that blocks inherit
export interface StoreTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: "none" | "small" | "medium" | "large"
}
