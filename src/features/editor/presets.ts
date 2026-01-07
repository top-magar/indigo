// Block Presets - Pre-built block combinations for quick layouts
// Users can add these as a group or save their own custom presets

import type { StoreBlock, BlockType } from "@/types/blocks"
import { nanoid } from "nanoid"

export interface BlockPreset {
  id: string
  name: string
  description: string
  category: "layout" | "content" | "commerce" | "engagement" | "custom"
  icon: string
  blocks: Omit<StoreBlock, "id" | "order">[]
  isCustom?: boolean
  createdAt?: string
}

// Generate unique block IDs for preset blocks
export function instantiatePreset(preset: BlockPreset, startOrder: number): StoreBlock[] {
  return preset.blocks.map((block, index) => ({
    ...block,
    id: nanoid(),
    order: startOrder + index,
  })) as StoreBlock[]
}

// ============================================================================
// BUILT-IN PRESETS
// ============================================================================

export const BUILT_IN_PRESETS: BlockPreset[] = [
  // Layout Presets
  {
    id: "hero-section",
    name: "Hero Section",
    description: "Full-width hero with headline and CTA",
    category: "layout",
    icon: "Image01Icon",
    blocks: [
      {
        type: "hero",
        variant: "full-width",
        visible: true,
        settings: {
          headline: "Welcome to Our Store",
          subheadline: "Discover amazing products crafted with care",
          primaryCtaText: "Shop Now",
          primaryCtaLink: "/products",
          overlayOpacity: 40,
          textAlignment: "center",
          height: "large",
        },
      },
    ],
  },

  {
    id: "hero-with-trust",
    name: "Hero + Trust Signals",
    description: "Hero section followed by trust indicators",
    category: "layout",
    icon: "ShieldIcon",
    blocks: [
      {
        type: "hero",
        variant: "split",
        visible: true,
        settings: {
          headline: "Quality You Can Trust",
          subheadline: "Premium products with exceptional service",
          primaryCtaText: "Explore",
          primaryCtaLink: "/products",
          overlayOpacity: 0,
          textAlignment: "left",
          height: "large",
        },
      },
      {
        type: "trust-signals",
        variant: "icon-row",
        visible: true,
        settings: {
          items: [
            { icon: "Truck01Icon", title: "Free Shipping", description: "On orders over $50" },
            { icon: "RefreshIcon", title: "Easy Returns", description: "30-day policy" },
            { icon: "ShieldCheckIcon", title: "Secure Checkout", description: "SSL encrypted" },
          ],
          linkToPolicies: true,
        },
      },
    ],
  },
  {
    id: "two-column-layout",
    name: "Two Column Layout",
    description: "Side-by-side content columns",
    category: "layout",
    icon: "LayoutTwoColumnIcon",
    blocks: [
      {
        type: "columns",
        variant: "equal",
        visible: true,
        settings: {
          columns: 2,
          gap: "medium",
          verticalAlign: "top",
          reverseOnMobile: false,
          stackOnMobile: true,
        },
      },
    ],
  },
  {
    id: "content-section",
    name: "Content Section",
    description: "Section with rich text content",
    category: "layout",
    icon: "SquareIcon",
    blocks: [
      {
        type: "section",
        variant: "contained",
        visible: true,
        settings: {
          padding: "large",
          maxWidth: "contained",
          verticalAlign: "top",
        },
      },
      {
        type: "rich-text",
        variant: "simple",
        visible: true,
        settings: {
          content: "<h2>Section Title</h2><p>Add your content here...</p>",
          padding: "medium",
          maxWidth: "medium",
          alignment: "left",
        },
      },
    ],
  },


  // Content Presets
  {
    id: "testimonial-section",
    name: "Testimonial Section",
    description: "Customer reviews carousel",
    category: "content",
    icon: "MessageMultiple01Icon",
    blocks: [
      {
        type: "testimonials",
        variant: "carousel",
        visible: true,
        settings: {
          sectionTitle: "What Our Customers Say",
          dataSource: "manual",
          reviewsToShow: 3,
          showRatings: true,
          showPhotos: true,
          showProduct: false,
          manualReviews: [
            { quote: "Amazing quality and fast shipping!", author: "Sarah M.", rating: 5 },
            { quote: "Best purchase I've made this year.", author: "John D.", rating: 5 },
            { quote: "Highly recommend to everyone!", author: "Emily R.", rating: 5 },
          ],
        },
      },
    ],
  },

  {
    id: "faq-section",
    name: "FAQ Section",
    description: "Frequently asked questions accordion",
    category: "content",
    icon: "HelpCircleIcon",
    blocks: [
      {
        type: "faq",
        variant: "accordion",
        visible: true,
        settings: {
          title: "Frequently Asked Questions",
          subtitle: "Find answers to common questions",
          items: [
            { question: "What is your return policy?", answer: "We offer a 30-day return policy for all unused items in original packaging." },
            { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery." },
            { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide. Shipping rates vary by location." },
          ],
          allowMultipleOpen: false,
          defaultOpenFirst: true,
          showSearch: false,
          columns: 1,
        },
      },
    ],
  },
  {
    id: "image-gallery",
    name: "Image Gallery",
    description: "Grid gallery with lightbox",
    category: "content",
    icon: "Image02Icon",
    blocks: [
      {
        type: "gallery",
        variant: "grid",
        visible: true,
        settings: {
          images: [],
          columns: 3,
          gap: "medium",
          aspectRatio: "1:1",
          showCaptions: false,
          enableLightbox: true,
        },
      },
    ],
  },
  {
    id: "video-section",
    name: "Video Section",
    description: "Embedded video with caption",
    category: "content",
    icon: "Video01Icon",
    blocks: [
      {
        type: "video",
        variant: "inline",
        visible: true,
        settings: {
          src: "",
          autoplay: false,
          loop: false,
          muted: false,
          controls: true,
          aspectRatio: "16:9",
          caption: "Watch our story",
          maxWidth: "large",
        },
      },
    ],
  },


  // Commerce Presets
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "Featured products grid with title",
    category: "commerce",
    icon: "GridIcon",
    blocks: [
      {
        type: "product-grid",
        variant: "featured-grid",
        visible: true,
        settings: {
          sectionTitle: "Featured Products",
          productsToShow: 4,
          columns: 4,
          showPrices: true,
          showQuickAdd: true,
          showReviews: true,
          showViewAll: true,
          sortOrder: "bestselling",
        },
      },
    ],
  },
  {
    id: "sale-banner",
    name: "Sale Banner",
    description: "Promotional banner with countdown",
    category: "commerce",
    icon: "Megaphone01Icon",
    blocks: [
      {
        type: "promotional-banner",
        variant: "countdown",
        visible: true,
        settings: {
          headline: "Flash Sale",
          subtext: "Up to 50% off selected items",
          ctaText: "Shop Sale",
          ctaLink: "/products?sale=true",
          countdownEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          showDays: true,
          showHours: true,
          showMinutes: true,
          showSeconds: true,
          expiredMessage: "Sale has ended",
        },
      },
    ],
  },
  {
    id: "featured-product",
    name: "Featured Product",
    description: "Highlight a single product",
    category: "commerce",
    icon: "FavouriteIcon",
    blocks: [
      {
        type: "featured-product",
        variant: "large-image",
        visible: true,
        settings: {
          productId: "",
          showPrice: true,
          showReviews: true,
          showCountdown: false,
        },
      },
    ],
  },


  // Engagement Presets
  {
    id: "newsletter-cta",
    name: "Newsletter CTA",
    description: "Email signup with incentive",
    category: "engagement",
    icon: "Mail01Icon",
    blocks: [
      {
        type: "newsletter",
        variant: "card",
        visible: true,
        settings: {
          headline: "Get 10% Off Your First Order",
          subtext: "Subscribe to our newsletter for exclusive deals and updates",
          buttonText: "Subscribe",
          collectName: false,
          successMessage: "Thanks for subscribing! Check your email for your discount code.",
        },
      },
    ],
  },
  {
    id: "cta-section",
    name: "Call to Action",
    description: "Prominent CTA with button",
    category: "engagement",
    icon: "Cursor01Icon",
    blocks: [
      {
        type: "section",
        variant: "full-width",
        visible: true,
        settings: {
          backgroundColor: "#1a1a2e",
          padding: "xlarge",
          maxWidth: "full",
          verticalAlign: "center",
        },
      },
      {
        type: "rich-text",
        variant: "simple",
        visible: true,
        settings: {
          content: "<h2 style='color: white; text-align: center;'>Ready to Get Started?</h2><p style='color: #ccc; text-align: center;'>Join thousands of happy customers today</p>",
          padding: "none",
          maxWidth: "medium",
          alignment: "center",
        },
      },
      {
        type: "button",
        variant: "primary",
        visible: true,
        settings: {
          text: "Shop Now",
          href: "/products",
          size: "lg",
          fullWidth: false,
        },
      },
    ],
  },
  {
    id: "social-proof",
    name: "Social Proof",
    description: "Trust signals with stats",
    category: "engagement",
    icon: "ShieldIcon",
    blocks: [
      {
        type: "trust-signals",
        variant: "stats",
        visible: true,
        settings: {
          items: [],
          stats: [
            { value: "50K+", label: "Happy Customers" },
            { value: "4.9★", label: "Average Rating" },
            { value: "99%", label: "Satisfaction Rate" },
          ],
          linkToPolicies: false,
        },
      },
    ],
  },
]


// ============================================================================
// CUSTOM PRESETS STORAGE
// ============================================================================

const CUSTOM_PRESETS_KEY = "editor_custom_presets"

export function getCustomPresets(): BlockPreset[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveCustomPreset(preset: Omit<BlockPreset, "id" | "isCustom" | "createdAt">): BlockPreset {
  const newPreset: BlockPreset = {
    ...preset,
    id: `custom-${nanoid()}`,
    isCustom: true,
    createdAt: new Date().toISOString(),
  }
  
  const existing = getCustomPresets()
  const updated = [...existing, newPreset]
  
  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated))
  }
  
  return newPreset
}

export function deleteCustomPreset(id: string): void {
  const existing = getCustomPresets()
  const updated = existing.filter(p => p.id !== id)
  
  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated))
  }
}

export function getAllPresets(): BlockPreset[] {
  return [...BUILT_IN_PRESETS, ...getCustomPresets()]
}

export function getPresetsByCategory(category: BlockPreset["category"]): BlockPreset[] {
  return getAllPresets().filter(p => p.category === category)
}