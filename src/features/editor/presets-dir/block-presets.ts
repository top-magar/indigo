/**
 * Block Presets System
 * 
 * Pre-configured block combinations for quick addition to the layers panel.
 * Each preset contains multiple blocks that work well together.
 */

import type { BlockType } from "@/types/blocks"

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Configuration for a single block within a preset
 */
export interface PresetBlockConfig {
  type: BlockType
  variant: string
  settings: Record<string, unknown>
}

/**
 * A preset is a named collection of pre-configured blocks
 */
export interface BlockPreset {
  id: string
  name: string
  description: string
  icon: string
  category: PresetCategory
  blocks: PresetBlockConfig[]
}

/**
 * Categories for organizing presets
 */
export type PresetCategory = 
  | "marketing"
  | "commerce"
  | "content"
  | "engagement"

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

export const BLOCK_PRESETS: BlockPreset[] = [
  // -------------------------------------------------------------------------
  // Hero + CTA
  // -------------------------------------------------------------------------
  {
    id: "hero-cta",
    name: "Hero + CTA",
    description: "Hero block with prominent call-to-action button",
    icon: "Sparkles",
    category: "marketing",
    blocks: [
      {
        type: "hero",
        variant: "full-width",
        settings: {
          headline: "Welcome to Our Store",
          subheadline: "Discover amazing products crafted with care",
          primaryCtaText: "Shop Now",
          primaryCtaLink: "/products",
          secondaryCtaText: "Learn More",
          secondaryCtaLink: "/about",
          overlayOpacity: 40,
          textAlignment: "center",
          height: "large",
        },
      },
      {
        type: "button",
        variant: "primary",
        settings: {
          text: "Browse Collection",
          href: "/collections",
          size: "lg",
          fullWidth: false,
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Product Showcase
  // -------------------------------------------------------------------------
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "Product grid with header section",
    icon: "ShoppingBag",
    category: "commerce",
    blocks: [
      {
        type: "rich-text",
        variant: "simple",
        settings: {
          content: "<h2>Featured Products</h2><p>Handpicked selections just for you</p>",
          padding: "medium",
          maxWidth: "medium",
          alignment: "center",
        },
      },
      {
        type: "product-grid",
        variant: "featured-grid",
        settings: {
          productsToShow: 6,
          columns: 3,
          showPrices: true,
          showQuickAdd: true,
          showReviews: true,
          showViewAll: true,
          sortOrder: "bestselling",
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Testimonial Section
  // -------------------------------------------------------------------------
  {
    id: "testimonial-section",
    name: "Testimonial Section",
    description: "Testimonials with trust signals",
    icon: "MessageSquareQuote",
    category: "engagement",
    blocks: [
      {
        type: "testimonials",
        variant: "grid",
        settings: {
          dataSource: "manual",
          reviewsToShow: 3,
          showRatings: true,
          showPhotos: true,
          showProduct: false,
          sectionTitle: "What Our Customers Say",
          manualReviews: [
            {
              quote: "Absolutely love this product! Quality exceeded my expectations.",
              author: "Sarah M.",
              rating: 5,
            },
            {
              quote: "Fast shipping and excellent customer service. Will buy again!",
              author: "John D.",
              rating: 5,
            },
            {
              quote: "Great value for money. Highly recommend to everyone.",
              author: "Emily R.",
              rating: 4,
            },
          ],
        },
      },
      {
        type: "trust-signals",
        variant: "icon-row",
        settings: {
          items: [
            { icon: "shield", title: "Secure Payment", description: "100% protected" },
            { icon: "truck", title: "Free Shipping", description: "On orders $50+" },
            { icon: "refresh", title: "Easy Returns", description: "30-day guarantee" },
          ],
          linkToPolicies: true,
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Newsletter Footer
  // -------------------------------------------------------------------------
  {
    id: "newsletter-footer",
    name: "Newsletter Footer",
    description: "Newsletter signup with footer",
    icon: "Mail",
    category: "engagement",
    blocks: [
      {
        type: "newsletter",
        variant: "card",
        settings: {
          headline: "Stay in the Loop",
          subtext: "Subscribe for exclusive offers and updates",
          buttonText: "Subscribe",
          collectName: false,
          successMessage: "Thanks for subscribing!",
        },
      },
      {
        type: "footer",
        variant: "multi-column",
        settings: {
          logoText: "Your Store",
          columns: [
            {
              title: "Shop",
              links: [
                { label: "All Products", href: "/products" },
                { label: "New Arrivals", href: "/collections/new" },
                { label: "Best Sellers", href: "/collections/best-sellers" },
              ],
            },
            {
              title: "Support",
              links: [
                { label: "Contact Us", href: "/contact" },
                { label: "FAQ", href: "/faq" },
                { label: "Shipping", href: "/shipping" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About Us", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Careers", href: "/careers" },
              ],
            },
          ],
          socialLinks: [
            { platform: "instagram", url: "#" },
            { platform: "twitter", url: "#" },
            { platform: "facebook", url: "#" },
          ],
          showPaymentIcons: true,
          showNewsletter: false,
          copyrightText: "© 2024 Your Store. All rights reserved.",
          legalLinks: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
          ],
        },
      },
    ],
  },

  // -------------------------------------------------------------------------
  // FAQ Section
  // -------------------------------------------------------------------------
  {
    id: "faq-section",
    name: "FAQ Section",
    description: "FAQ block with rich text intro",
    icon: "HelpCircle",
    category: "content",
    blocks: [
      {
        type: "rich-text",
        variant: "card",
        settings: {
          content: "<h2>Frequently Asked Questions</h2><p>Find answers to common questions about our products and services.</p>",
          padding: "medium",
          maxWidth: "medium",
          alignment: "center",
        },
      },
      {
        type: "faq",
        variant: "accordion",
        settings: {
          items: [
            {
              question: "What is your return policy?",
              answer: "We offer a 30-day return policy for all unused items in original packaging.",
            },
            {
              question: "How long does shipping take?",
              answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery.",
            },
            {
              question: "Do you ship internationally?",
              answer: "Yes, we ship to over 50 countries worldwide. Shipping rates vary by location.",
            },
            {
              question: "How can I track my order?",
              answer: "Once your order ships, you'll receive an email with tracking information.",
            },
          ],
          allowMultipleOpen: false,
          defaultOpenFirst: true,
          showSearch: false,
          columns: 1,
        },
      },
    ],
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all available presets
 */
export function getAllPresets(): BlockPreset[] {
  return BLOCK_PRESETS
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: PresetCategory): BlockPreset[] {
  return BLOCK_PRESETS.filter((preset) => preset.category === category)
}

/**
 * Find a preset by ID
 */
export function getPresetById(presetId: string): BlockPreset | undefined {
  return BLOCK_PRESETS.find((preset) => preset.id === presetId)
}

/**
 * Apply a preset - returns the block configurations to add
 * @param presetId - The ID of the preset to apply
 * @returns Array of block configs ready to be added, or null if preset not found
 */
export function applyPreset(presetId: string): PresetBlockConfig[] | null {
  const preset = getPresetById(presetId)
  if (!preset) return null
  
  // Return a deep copy of the blocks to avoid mutation
  return preset.blocks.map((block) => ({
    type: block.type,
    variant: block.variant,
    settings: { ...block.settings },
  }))
}

/**
 * Get preset categories with labels
 */
export const PRESET_CATEGORIES: { id: PresetCategory; label: string; icon: string }[] = [
  { id: "marketing", label: "Marketing", icon: "Megaphone" },
  { id: "commerce", label: "Commerce", icon: "ShoppingCart" },
  { id: "content", label: "Content", icon: "FileText" },
  { id: "engagement", label: "Engagement", icon: "Heart" },
]
