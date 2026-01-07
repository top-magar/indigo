import type { BlockMeta, BlockType } from "@/types/blocks"

export const BLOCK_REGISTRY: Record<BlockType, BlockMeta> = {
  // =============================================================================
  // LAYOUT BLOCKS (Containers)
  // =============================================================================
  
  section: {
    type: "section",
    name: "Section",
    description: "Container for grouping blocks with shared styling",
    icon: "SquareIcon",
    category: "layout",
    isContainer: true,
    allowedChildren: ["rich-text", "image", "button", "columns", "hero", "testimonials", "trust-signals", "newsletter", "product-grid", "featured-product", "promotional-banner", "video", "faq", "gallery"],
    variants: [
      { id: "default", name: "Default", description: "Standard section with padding" },
      { id: "contained", name: "Contained", description: "Max-width container" },
      { id: "full-width", name: "Full Width", description: "Edge-to-edge section" },
      { id: "split", name: "Split", description: "Two-tone background" },
    ],
    defaultSettings: {
      padding: "medium",
      maxWidth: "contained",
      verticalAlign: "top",
    },
  },

  columns: {
    type: "columns",
    name: "Columns",
    description: "Multi-column layout for side-by-side content",
    icon: "LayoutColumnIcon",
    category: "layout",
    isContainer: true,
    allowedChildren: ["column"],
    variants: [
      { id: "equal", name: "Equal", description: "Equal width columns" },
      { id: "left-heavy", name: "Left Heavy", description: "Larger left column" },
      { id: "right-heavy", name: "Right Heavy", description: "Larger right column" },
      { id: "sidebar-left", name: "Sidebar Left", description: "Narrow left, wide right" },
      { id: "sidebar-right", name: "Sidebar Right", description: "Wide left, narrow right" },
    ],
    defaultSettings: {
      columns: 2,
      gap: "medium",
      verticalAlign: "top",
      reverseOnMobile: false,
      stackOnMobile: true,
    },
  },

  column: {
    type: "column",
    name: "Column",
    description: "Individual column within a columns layout",
    icon: "LayoutColumnIcon",
    category: "layout",
    isContainer: true,
    // Internal only - not shown in editor palette (created automatically by columns block)
    hidden: true,
    allowedParents: ["columns"],
    allowedChildren: ["rich-text", "image", "button", "section", "video", "faq", "gallery"],
    variants: [
      { id: "default", name: "Default", description: "Standard column" },
    ],
    defaultSettings: {
      padding: "none",
      verticalAlign: "top",
    },
  },

  // =============================================================================
  // CONTENT BLOCKS (Atomic - Complex)
  // =============================================================================

  header: {
    type: "header",
    name: "Header",
    description: "Navigation and brand identity",
    icon: "Menu01Icon",
    category: "layout",
    isContainer: false,
    variants: [
      { id: "classic", name: "Classic", description: "Logo left, nav center, cart right" },
      { id: "centered", name: "Centered Logo", description: "Navigation left, centered logo" },
      { id: "minimal", name: "Minimal", description: "Logo and hamburger menu only" },
      { id: "mega-menu", name: "Mega Menu", description: "With dropdown category menus" },
      { id: "announcement", name: "Announcement Bar", description: "Top bar with promo message" },
    ],
    defaultSettings: {
      navLinks: [],
      showSearch: true,
      showAccount: true,
      sticky: true,
    },
  },

  hero: {
    type: "hero",
    name: "Hero Section",
    description: "First impression, value proposition",
    icon: "Image01Icon",
    category: "content",
    isContainer: false,
    variants: [
      { id: "full-width", name: "Full-Width Image", description: "Full viewport background image" },
      { id: "split", name: "Split Layout", description: "50/50 image and content" },
      { id: "video", name: "Video Background", description: "Looping video background" },
      { id: "minimal-text", name: "Minimal Text", description: "Large typography, no image" },
      { id: "product-showcase", name: "Product Showcase", description: "Hero with featured product" },
    ],
    defaultSettings: {
      headline: "Welcome to Our Store",
      subheadline: "Discover amazing products",
      primaryCtaText: "Shop Now",
      primaryCtaLink: "/products",
      overlayOpacity: 40,
      textAlignment: "center",
      height: "large",
    },
  },

  "rich-text": {
    type: "rich-text",
    name: "Rich Text",
    description: "Custom formatted text content",
    icon: "TextAlignLeftIcon",
    category: "content",
    isContainer: false,
    variants: [
      { id: "simple", name: "Simple", description: "Basic text content" },
      { id: "card", name: "Card", description: "Text in a card container" },
      { id: "full-width", name: "Full Width", description: "Edge-to-edge background" },
    ],
    defaultSettings: {
      content: "<p>Enter your content here...</p>",
      padding: "medium",
      maxWidth: "medium",
      alignment: "left",
    },
  },

  testimonials: {
    type: "testimonials",
    name: "Testimonials",
    description: "Customer reviews and social proof",
    icon: "MessageSquare01Icon",
    category: "content",
    isContainer: false,
    variants: [
      { id: "carousel", name: "Carousel", description: "Single testimonial with navigation" },
      { id: "grid", name: "Grid", description: "3-column testimonial cards" },
      { id: "featured", name: "Featured Review", description: "Large single review" },
    ],
    defaultSettings: {
      dataSource: "manual",
      reviewsToShow: 3,
      showRatings: true,
      showPhotos: true,
      showProduct: false,
      sectionTitle: "What Our Customers Say",
    },
  },

  "trust-signals": {
    type: "trust-signals",
    name: "Trust Signals",
    description: "Build confidence and reduce anxiety",
    icon: "ShieldCheckIcon",
    category: "content",
    isContainer: false,
    variants: [
      { id: "icon-row", name: "Icon Row", description: "Horizontal icons with labels" },
      { id: "feature-cards", name: "Feature Cards", description: "Cards with descriptions" },
      { id: "logo-cloud", name: "Logo Cloud", description: "Partner/press logos" },
      { id: "guarantee", name: "Guarantee Banner", description: "Prominent guarantee" },
      { id: "stats", name: "Stats & Numbers", description: "Key metrics display" },
    ],
    defaultSettings: {
      items: [
        { icon: "Truck01Icon", title: "Free Shipping", description: "On orders over $50" },
        { icon: "RefreshIcon", title: "Easy Returns", description: "30-day return policy" },
        { icon: "ShieldCheckIcon", title: "Secure Checkout", description: "SSL encrypted" },
        { icon: "HeadphonesIcon", title: "24/7 Support", description: "We're here to help" },
      ],
      linkToPolicies: true,
    },
  },

  "promotional-banner": {
    type: "promotional-banner",
    name: "Promotional Banner",
    description: "Offers, announcements, and countdown timers",
    icon: "Megaphone01Icon",
    category: "content",
    isContainer: false,
    variants: [
      { id: "full-width", name: "Full-Width", description: "Edge-to-edge colored banner" },
      { id: "split-image", name: "Split Image", description: "50/50 image and offer" },
      { id: "countdown", name: "Countdown", description: "With timer for urgency (includes full countdown settings)" },
      { id: "discount-code", name: "Discount Code", description: "Copy-to-clipboard code" },
      { id: "multi-offer", name: "Multi-Offer", description: "2-3 offers side by side" },
    ],
    defaultSettings: {
      headline: "Special Offer",
      ctaText: "Shop Now",
      ctaLink: "/products",
      // Countdown defaults (used when variant is "countdown")
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      expiredMessage: "This offer has ended",
    },
  },

  footer: {
    type: "footer",
    name: "Footer",
    description: "Secondary navigation and info",
    icon: "LayoutBottomIcon",
    category: "layout",
    isContainer: false,
    variants: [
      { id: "multi-column", name: "Multi-Column", description: "4 columns with links" },
      { id: "centered", name: "Centered Minimal", description: "Centered logo and links" },
      { id: "rich", name: "Rich Footer", description: "Full info with badges" },
    ],
    defaultSettings: {
      columns: [],
      socialLinks: [],
      showPaymentIcons: true,
      showNewsletter: false,
      legalLinks: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  },

  // =============================================================================
  // COMMERCE BLOCKS
  // =============================================================================

  "featured-product": {
    type: "featured-product",
    name: "Featured Product",
    description: "Highlight a single product",
    icon: "Star01Icon",
    category: "commerce",
    isContainer: false,
    variants: [
      { id: "large-image", name: "Large Image", description: "60% image, 40% content" },
      { id: "gallery", name: "Gallery Showcase", description: "Main image with thumbnails" },
      { id: "lifestyle", name: "Lifestyle Context", description: "Product in use setting" },
      { id: "comparison", name: "Comparison", description: "With benefits highlight" },
      { id: "urgency", name: "Limited Edition", description: "With countdown and stock" },
    ],
    defaultSettings: {
      showPrice: true,
      showReviews: true,
      showCountdown: false,
    },
  },

  "product-grid": {
    type: "product-grid",
    name: "Product Grid",
    description: "Display multiple products",
    icon: "GridIcon",
    category: "commerce",
    isContainer: false,
    variants: [
      { id: "standard", name: "Standard Grid", description: "4-column product grid" },
      { id: "featured-grid", name: "Featured + Grid", description: "1 large + 4 small" },
      { id: "carousel", name: "Carousel", description: "Horizontal scrolling" },
      { id: "list", name: "List View", description: "Horizontal cards with details" },
      { id: "masonry", name: "Masonry", description: "Pinterest-style varied heights" },
    ],
    defaultSettings: {
      productsToShow: 8,
      columns: 4,
      showPrices: true,
      showQuickAdd: true,
      showReviews: false,
      showViewAll: true,
      sortOrder: "newest",
    },
  },

  // =============================================================================
  // ENGAGEMENT BLOCKS
  // =============================================================================

  newsletter: {
    type: "newsletter",
    name: "Newsletter",
    description: "Email capture and list building",
    icon: "Mail01Icon",
    category: "engagement",
    isContainer: false,
    variants: [
      { id: "inline", name: "Inline Simple", description: "Single row form" },
      { id: "card", name: "Card with Incentive", description: "Card with discount offer" },
      { id: "split-image", name: "Split Image", description: "50/50 image and form" },
      { id: "full-width", name: "Full-Width Banner", description: "Colored banner form" },
      { id: "multi-field", name: "Multi-Field", description: "Email + name + preferences" },
    ],
    defaultSettings: {
      headline: "Join Our Newsletter",
      subtext: "Get 10% off your first order",
      buttonText: "Subscribe",
      collectName: false,
      successMessage: "Thanks for subscribing!",
    },
  },

  // =============================================================================
  // PRIMITIVE BLOCKS
  // =============================================================================

  image: {
    type: "image",
    name: "Image",
    description: "Single image with optional link",
    icon: "Image01Icon",
    category: "primitive",
    isContainer: false,
    variants: [
      { id: "default", name: "Default", description: "Standard image" },
      { id: "rounded", name: "Rounded", description: "Rounded corners" },
      { id: "circle", name: "Circle", description: "Circular crop" },
      { id: "card", name: "Card", description: "Image in a card" },
    ],
    defaultSettings: {
      src: "",
      alt: "",
      objectFit: "cover",
    },
  },

  button: {
    type: "button",
    name: "Button",
    description: "Call-to-action button",
    icon: "PointerIcon",
    category: "primitive",
    isContainer: false,
    variants: [
      { id: "primary", name: "Primary", description: "Main action button" },
      { id: "secondary", name: "Secondary", description: "Secondary action" },
      { id: "outline", name: "Outline", description: "Bordered button" },
      { id: "ghost", name: "Ghost", description: "Minimal button" },
      { id: "link", name: "Link", description: "Text link style" },
    ],
    defaultSettings: {
      text: "Click me",
      href: "#",
      size: "md",
      fullWidth: false,
    },
  },

  video: {
    type: "video",
    name: "Video",
    description: "Embed video content",
    icon: "Video01Icon",
    category: "content",
    isContainer: false,
    variants: [
      { id: "inline", name: "Inline", description: "Standard video player" },
      { id: "fullwidth", name: "Full Width", description: "Edge-to-edge video" },
      { id: "lightbox", name: "Lightbox", description: "Click to play in modal" },
    ],
    defaultSettings: {
      src: "",
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      aspectRatio: "16:9",
    },
  },

  faq: {
    type: "faq",
    name: "FAQ",
    description: "Frequently asked questions",
    icon: "HelpCircleIcon",
    category: "content",
    isContainer: false,
    variants: [
      { id: "accordion", name: "Accordion", description: "Expandable Q&A list" },
      { id: "grid", name: "Grid", description: "Two-column layout" },
      { id: "simple", name: "Simple", description: "All expanded" },
      { id: "searchable", name: "Searchable", description: "With search filter" },
    ],
    defaultSettings: {
      items: [],
      allowMultipleOpen: false,
      defaultOpenFirst: true,
      showSearch: false,
      columns: 1,
    },
  },

  gallery: {
    type: "gallery",
    name: "Gallery",
    description: "Image gallery or slideshow",
    icon: "ImageGalleryIcon",
    category: "content",
    isContainer: false,
    variants: [
      { id: "grid", name: "Grid", description: "Standard image grid" },
      { id: "masonry", name: "Masonry", description: "Pinterest-style layout" },
      { id: "carousel", name: "Carousel", description: "Horizontal slideshow" },
      { id: "lightbox", name: "Lightbox", description: "Click to enlarge" },
    ],
    defaultSettings: {
      images: [],
      columns: 3,
      gap: "medium",
      aspectRatio: "1:1",
      showCaptions: false,
      enableLightbox: true,
    },
  },

}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getBlockMeta(type: BlockType): BlockMeta {
  return BLOCK_REGISTRY[type]
}

export function getVariantMeta(type: BlockType, variantId: string) {
  const block = BLOCK_REGISTRY[type]
  return block?.variants.find((v) => v.id === variantId)
}

export function getBlocksByCategory(category: BlockMeta["category"]): BlockMeta[] {
  return Object.values(BLOCK_REGISTRY).filter((block) => block.category === category)
}

export function getContainerBlocks(): BlockMeta[] {
  return Object.values(BLOCK_REGISTRY).filter((block) => block.isContainer)
}

export function getAtomicBlocks(): BlockMeta[] {
  return Object.values(BLOCK_REGISTRY).filter((block) => !block.isContainer)
}

export function canBlockBeChildOf(childType: BlockType, parentType: BlockType): boolean {
  const parentMeta = BLOCK_REGISTRY[parentType]
  const childMeta = BLOCK_REGISTRY[childType]
  
  if (!parentMeta?.isContainer) return false
  if (!parentMeta.allowedChildren) return true // Allow all if not specified
  
  // Check if child is allowed in parent
  const allowedInParent = parentMeta.allowedChildren.includes(childType)
  
  // Check if parent is allowed for child
  const parentAllowedForChild = !childMeta.allowedParents || childMeta.allowedParents.includes(parentType)
  
  return allowedInParent && parentAllowedForChild
}

export function getDefaultVariant(type: BlockType): string {
  const meta = BLOCK_REGISTRY[type]
  return meta?.variants[0]?.id || "default"
}
