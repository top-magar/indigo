// Storefront Template Presets
// Pre-designed layouts merchants can choose from

import type { PageLayout, StoreBlock } from "@/types/blocks"

export type TemplateId = "modern-minimal" | "bold-vibrant" | "classic-commerce" | "product-focused" | "lifestyle-brand"

export interface TemplatePreset {
  id: TemplateId
  name: string
  description: string
  thumbnail?: string
  category: "minimal" | "bold" | "classic" | "product" | "lifestyle"
  blocks: Omit<StoreBlock, "id">[]
}

// Helper to generate unique block IDs
function generateBlockId(type: string, index: number): string {
  return `${type}-${index}-${Date.now()}`
}

// Convert template blocks to full blocks with IDs
export function templateToLayout(template: TemplatePreset, storeSlug: string): PageLayout {
  const blocks = template.blocks.map((block, index) => ({
    ...block,
    id: generateBlockId(block.type, index),
  })) as StoreBlock[]

  // Replace placeholder slugs with actual store slug
  const processedBlocks = blocks.map((block) => {
    const settings = JSON.parse(
      JSON.stringify(block.settings).replace(/\{storeSlug\}/g, storeSlug)
    )
    return { ...block, settings }
  })

  return {
    id: `layout-${template.id}`,
    name: template.name,
    slug: "/",
    isHomepage: true,
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: processedBlocks,
  }
}

// ============================================================================
// TEMPLATE: Modern Minimal
// ============================================================================
export const modernMinimalTemplate: TemplatePreset = {
  id: "modern-minimal",
  name: "Modern Minimal",
  description: "Clean, spacious design with focus on typography and whitespace",
  category: "minimal",
  blocks: [
    {
      type: "header",
      variant: "minimal",
      order: 0,
      visible: true,
      settings: {
        navLinks: [
          { label: "Shop", href: "/store/{storeSlug}/products" },
          { label: "About", href: "/store/{storeSlug}/about" },
        ],
        showSearch: true,
        showAccount: true,
        sticky: true,
        transparent: true,
      },
    },
    {
      type: "hero",
      variant: "minimal-text",
      order: 1,
      visible: true,
      settings: {
        headline: "Thoughtfully Designed",
        subheadline: "Products that speak for themselves",
        primaryCtaText: "Explore",
        primaryCtaLink: "/store/{storeSlug}/products",
        overlayOpacity: 0,
        textAlignment: "center",
        height: "medium",
      },
    },
    {
      type: "product-grid",
      variant: "masonry",
      order: 2,
      visible: true,
      settings: {
        productsToShow: 6,
        columns: 3,
        showPrices: true,
        showQuickAdd: false,
        showReviews: false,
        showViewAll: true,
        sortOrder: "newest",
      },
    },
    {
      type: "newsletter",
      variant: "inline",
      order: 3,
      visible: true,
      settings: {
        headline: "Stay in the loop",
        subtext: "New arrivals and exclusive offers",
        buttonText: "Subscribe",
        collectName: false,
        successMessage: "Welcome aboard",
      },
    },
    {
      type: "footer",
      variant: "centered",
      order: 4,
      visible: true,
      settings: {
        columns: [],
        socialLinks: [],
        showPaymentIcons: false,
        showNewsletter: false,
        legalLinks: [
          { label: "Privacy", href: "/store/{storeSlug}/privacy" },
          { label: "Terms", href: "/store/{storeSlug}/terms" },
        ],
      },
    },
  ],
}

// ============================================================================
// TEMPLATE: Bold & Vibrant
// ============================================================================
export const boldVibrantTemplate: TemplatePreset = {
  id: "bold-vibrant",
  name: "Bold & Vibrant",
  description: "Eye-catching design with strong visuals and prominent CTAs",
  category: "bold",
  blocks: [
    {
      type: "header",
      variant: "announcement",
      order: 0,
      visible: true,
      settings: {
        navLinks: [
          { label: "Shop All", href: "/store/{storeSlug}/products" },
          { label: "New In", href: "/store/{storeSlug}/products?sort=newest" },
          { label: "Sale", href: "/store/{storeSlug}/products?sale=true" },
        ],
        showSearch: true,
        showAccount: true,
        sticky: true,
        announcementText: "🔥 Free shipping on orders over $50",
      },
    },
    {
      type: "hero",
      variant: "full-width",
      order: 1,
      visible: true,
      settings: {
        headline: "Make a Statement",
        subheadline: "Bold products for bold people",
        primaryCtaText: "Shop Now",
        primaryCtaLink: "/store/{storeSlug}/products",
        secondaryCtaText: "View Lookbook",
        secondaryCtaLink: "/store/{storeSlug}/lookbook",
        overlayOpacity: 50,
        textAlignment: "center",
        height: "full",
      },
    },
    {
      type: "promotional-banner",
      variant: "countdown",
      order: 2,
      visible: true,
      settings: {
        headline: "Flash Sale",
        subtext: "Up to 40% off selected items",
        ctaText: "Shop Sale",
        ctaLink: "/store/{storeSlug}/products?sale=true",
      },
    },
    {
      type: "product-grid",
      variant: "featured-grid",
      order: 3,
      visible: true,
      settings: {
        productsToShow: 5,
        columns: 4,
        showPrices: true,
        showQuickAdd: true,
        showReviews: true,
        sectionTitle: "Trending Now",
        showViewAll: true,
        sortOrder: "bestselling",
      },
    },
    {
      type: "testimonials",
      variant: "carousel",
      order: 4,
      visible: true,
      settings: {
        dataSource: "manual",
        reviewsToShow: 5,
        showRatings: true,
        showPhotos: true,
        showProduct: true,
        sectionTitle: "What People Say",
        manualReviews: [
          { quote: "Absolutely love the quality!", author: "Sarah M.", rating: 5 },
          { quote: "Fast shipping and great products", author: "Mike R.", rating: 5 },
          { quote: "My new favorite store", author: "Emma L.", rating: 5 },
        ],
      },
    },
    {
      type: "newsletter",
      variant: "full-width",
      order: 5,
      visible: true,
      settings: {
        headline: "Get 15% Off Your First Order",
        subtext: "Plus early access to new drops and exclusive deals",
        buttonText: "Sign Me Up",
        collectName: true,
        successMessage: "Check your inbox for your discount code!",
      },
    },
    {
      type: "footer",
      variant: "rich",
      order: 6,
      visible: true,
      settings: {
        columns: [
          {
            title: "Shop",
            links: [
              { label: "All Products", href: "/store/{storeSlug}/products" },
              { label: "New Arrivals", href: "/store/{storeSlug}/products?sort=newest" },
              { label: "Best Sellers", href: "/store/{storeSlug}/products?sort=bestselling" },
              { label: "Sale", href: "/store/{storeSlug}/products?sale=true" },
            ],
          },
          {
            title: "Help",
            links: [
              { label: "Contact Us", href: "/store/{storeSlug}/contact" },
              { label: "Shipping", href: "/store/{storeSlug}/shipping" },
              { label: "Returns", href: "/store/{storeSlug}/returns" },
              { label: "FAQ", href: "/store/{storeSlug}/faq" },
            ],
          },
        ],
        socialLinks: [
          { platform: "instagram", url: "#" },
          { platform: "tiktok", url: "#" },
          { platform: "twitter", url: "#" },
        ],
        showPaymentIcons: true,
        showNewsletter: false,
        legalLinks: [
          { label: "Privacy Policy", href: "/store/{storeSlug}/privacy" },
          { label: "Terms of Service", href: "/store/{storeSlug}/terms" },
        ],
      },
    },
  ],
}


// ============================================================================
// TEMPLATE: Classic Commerce
// ============================================================================
export const classicCommerceTemplate: TemplatePreset = {
  id: "classic-commerce",
  name: "Classic Commerce",
  description: "Traditional e-commerce layout with proven conversion patterns",
  category: "classic",
  blocks: [
    {
      type: "header",
      variant: "classic",
      order: 0,
      visible: true,
      settings: {
        navLinks: [
          { label: "Shop", href: "/store/{storeSlug}/products" },
          { label: "Collections", href: "/store/{storeSlug}/collections" },
          { label: "About", href: "/store/{storeSlug}/about" },
          { label: "Contact", href: "/store/{storeSlug}/contact" },
        ],
        showSearch: true,
        showAccount: true,
        sticky: true,
      },
    },
    {
      type: "hero",
      variant: "split",
      order: 1,
      visible: true,
      settings: {
        headline: "Quality You Can Trust",
        subheadline: "Discover our curated collection of premium products",
        primaryCtaText: "Shop Now",
        primaryCtaLink: "/store/{storeSlug}/products",
        secondaryCtaText: "Learn More",
        secondaryCtaLink: "/store/{storeSlug}/about",
        overlayOpacity: 0,
        textAlignment: "left",
        height: "large",
      },
    },
    {
      type: "trust-signals",
      variant: "icon-row",
      order: 2,
      visible: true,
      settings: {
        items: [
          { icon: "Truck01Icon", title: "Free Shipping", description: "On orders over $50" },
          { icon: "RefreshIcon", title: "Easy Returns", description: "30-day return policy" },
          { icon: "ShieldCheckIcon", title: "Secure Checkout", description: "SSL encrypted" },
          { icon: "HeadphonesIcon", title: "24/7 Support", description: "We're here to help" },
        ],
        linkToPolicies: true,
      },
    },
    {
      type: "product-grid",
      variant: "standard",
      order: 3,
      visible: true,
      settings: {
        productsToShow: 8,
        columns: 4,
        showPrices: true,
        showQuickAdd: true,
        showReviews: false,
        sectionTitle: "Featured Products",
        showViewAll: true,
        sortOrder: "newest",
      },
    },
    {
      type: "promotional-banner",
      variant: "split-image",
      order: 4,
      visible: true,
      settings: {
        headline: "New Season Collection",
        subtext: "Fresh styles just arrived",
        ctaText: "Explore Now",
        ctaLink: "/store/{storeSlug}/products?sort=newest",
      },
    },
    {
      type: "testimonials",
      variant: "grid",
      order: 5,
      visible: true,
      settings: {
        dataSource: "manual",
        reviewsToShow: 3,
        showRatings: true,
        showPhotos: false,
        showProduct: false,
        sectionTitle: "Customer Reviews",
        manualReviews: [
          { quote: "Excellent quality and fast delivery!", author: "John D.", rating: 5 },
          { quote: "Great customer service", author: "Lisa K.", rating: 5 },
          { quote: "Will definitely order again", author: "Tom S.", rating: 5 },
        ],
      },
    },
    {
      type: "newsletter",
      variant: "card",
      order: 6,
      visible: true,
      settings: {
        headline: "Join Our Newsletter",
        subtext: "Get 10% off your first order and stay updated on new arrivals",
        buttonText: "Subscribe",
        collectName: false,
        successMessage: "Thanks for subscribing!",
        privacyText: "We respect your privacy. Unsubscribe at any time.",
      },
    },
    {
      type: "footer",
      variant: "multi-column",
      order: 7,
      visible: true,
      settings: {
        columns: [
          {
            title: "Shop",
            links: [
              { label: "All Products", href: "/store/{storeSlug}/products" },
              { label: "New Arrivals", href: "/store/{storeSlug}/products?sort=newest" },
              { label: "Best Sellers", href: "/store/{storeSlug}/products?sort=bestselling" },
            ],
          },
          {
            title: "Support",
            links: [
              { label: "Contact Us", href: "/store/{storeSlug}/contact" },
              { label: "Shipping Info", href: "/store/{storeSlug}/shipping" },
              { label: "Returns", href: "/store/{storeSlug}/returns" },
            ],
          },
        ],
        socialLinks: [],
        showPaymentIcons: true,
        showNewsletter: false,
        legalLinks: [
          { label: "Privacy Policy", href: "/store/{storeSlug}/privacy" },
          { label: "Terms of Service", href: "/store/{storeSlug}/terms" },
        ],
      },
    },
  ],
}

// ============================================================================
// TEMPLATE: Product Focused
// ============================================================================
export const productFocusedTemplate: TemplatePreset = {
  id: "product-focused",
  name: "Product Focused",
  description: "Puts products front and center with minimal distractions",
  category: "product",
  blocks: [
    {
      type: "header",
      variant: "minimal",
      order: 0,
      visible: true,
      settings: {
        navLinks: [
          { label: "All", href: "/store/{storeSlug}/products" },
          { label: "New", href: "/store/{storeSlug}/products?sort=newest" },
        ],
        showSearch: true,
        showAccount: true,
        sticky: true,
      },
    },
    {
      type: "product-grid",
      variant: "featured-grid",
      order: 1,
      visible: true,
      settings: {
        productsToShow: 5,
        columns: 4,
        showPrices: true,
        showQuickAdd: true,
        showReviews: true,
        sectionTitle: "Featured",
        showViewAll: false,
        sortOrder: "bestselling",
      },
    },
    {
      type: "product-grid",
      variant: "standard",
      order: 2,
      visible: true,
      settings: {
        productsToShow: 12,
        columns: 4,
        showPrices: true,
        showQuickAdd: true,
        showReviews: false,
        sectionTitle: "All Products",
        showViewAll: true,
        sortOrder: "newest",
      },
    },
    {
      type: "trust-signals",
      variant: "stats",
      order: 3,
      visible: true,
      settings: {
        items: [],
        stats: [
          { value: "10K+", label: "Happy Customers" },
          { value: "4.9", label: "Average Rating" },
          { value: "24h", label: "Fast Shipping" },
        ],
        linkToPolicies: false,
      },
    },
    {
      type: "footer",
      variant: "centered",
      order: 4,
      visible: true,
      settings: {
        columns: [],
        socialLinks: [
          { platform: "instagram", url: "#" },
        ],
        showPaymentIcons: true,
        showNewsletter: false,
        legalLinks: [
          { label: "Privacy", href: "/store/{storeSlug}/privacy" },
          { label: "Terms", href: "/store/{storeSlug}/terms" },
        ],
      },
    },
  ],
}

// ============================================================================
// TEMPLATE: Lifestyle Brand
// ============================================================================
export const lifestyleBrandTemplate: TemplatePreset = {
  id: "lifestyle-brand",
  name: "Lifestyle Brand",
  description: "Story-driven design for brands with a strong identity",
  category: "lifestyle",
  blocks: [
    {
      type: "header",
      variant: "centered",
      order: 0,
      visible: true,
      settings: {
        navLinks: [
          { label: "Shop", href: "/store/{storeSlug}/products" },
          { label: "Our Story", href: "/store/{storeSlug}/about" },
          { label: "Journal", href: "/store/{storeSlug}/blog" },
          { label: "Contact", href: "/store/{storeSlug}/contact" },
        ],
        showSearch: true,
        showAccount: true,
        sticky: true,
      },
    },
    {
      type: "hero",
      variant: "video",
      order: 1,
      visible: true,
      settings: {
        headline: "Live Your Best Life",
        subheadline: "Products designed for the way you live",
        primaryCtaText: "Discover",
        primaryCtaLink: "/store/{storeSlug}/products",
        overlayOpacity: 30,
        textAlignment: "center",
        height: "full",
      },
    },
    {
      type: "product-grid",
      variant: "carousel",
      order: 2,
      visible: true,
      settings: {
        productsToShow: 8,
        columns: 4,
        showPrices: true,
        showQuickAdd: false,
        showReviews: false,
        sectionTitle: "Curated For You",
        showViewAll: true,
        sortOrder: "newest",
      },
    },
    {
      type: "promotional-banner",
      variant: "full-width",
      order: 3,
      visible: true,
      settings: {
        headline: "Our Philosophy",
        subtext: "We believe in quality over quantity, sustainability over fast fashion",
        ctaText: "Learn More",
        ctaLink: "/store/{storeSlug}/about",
      },
    },
    {
      type: "testimonials",
      variant: "featured",
      order: 4,
      visible: true,
      settings: {
        dataSource: "manual",
        reviewsToShow: 1,
        showRatings: false,
        showPhotos: true,
        showProduct: false,
        manualReviews: [
          {
            quote: "These products have completely transformed my daily routine. The attention to detail is incredible.",
            author: "Alexandra Chen",
            role: "Lifestyle Blogger",
            avatar: "",
          },
        ],
      },
    },
    {
      type: "trust-signals",
      variant: "feature-cards",
      order: 5,
      visible: true,
      settings: {
        items: [
          { icon: "LeafIcon", title: "Sustainable", description: "Eco-friendly materials and processes" },
          { icon: "AwardIcon", title: "Premium Quality", description: "Crafted to last a lifetime" },
          { icon: "HeartIcon", title: "Made with Love", description: "Every product tells a story" },
        ],
        linkToPolicies: false,
      },
    },
    {
      type: "newsletter",
      variant: "split-image",
      order: 6,
      visible: true,
      settings: {
        headline: "Join the Community",
        subtext: "Be the first to know about new collections and exclusive stories",
        buttonText: "Subscribe",
        collectName: true,
        successMessage: "Welcome to the family!",
      },
    },
    {
      type: "footer",
      variant: "newsletter",
      order: 7,
      visible: true,
      settings: {
        columns: [
          {
            title: "Explore",
            links: [
              { label: "Shop All", href: "/store/{storeSlug}/products" },
              { label: "Our Story", href: "/store/{storeSlug}/about" },
              { label: "Journal", href: "/store/{storeSlug}/blog" },
            ],
          },
          {
            title: "Support",
            links: [
              { label: "Contact", href: "/store/{storeSlug}/contact" },
              { label: "Shipping", href: "/store/{storeSlug}/shipping" },
              { label: "Returns", href: "/store/{storeSlug}/returns" },
            ],
          },
        ],
        socialLinks: [
          { platform: "instagram", url: "#" },
          { platform: "pinterest", url: "#" },
        ],
        showPaymentIcons: true,
        showNewsletter: true,
        legalLinks: [
          { label: "Privacy", href: "/store/{storeSlug}/privacy" },
          { label: "Terms", href: "/store/{storeSlug}/terms" },
        ],
      },
    },
  ],
}

// ============================================================================
// EXPORTS
// ============================================================================
export const TEMPLATE_PRESETS: Record<TemplateId, TemplatePreset> = {
  "modern-minimal": modernMinimalTemplate,
  "bold-vibrant": boldVibrantTemplate,
  "classic-commerce": classicCommerceTemplate,
  "product-focused": productFocusedTemplate,
  "lifestyle-brand": lifestyleBrandTemplate,
}

export const TEMPLATE_LIST = Object.values(TEMPLATE_PRESETS)

export function getTemplateById(id: TemplateId): TemplatePreset | undefined {
  return TEMPLATE_PRESETS[id]
}
