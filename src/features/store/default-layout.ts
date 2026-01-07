// Default homepage layout generator - server-compatible
import type { PageLayout, StoreBlock } from "@/types/blocks"

/**
 * Generate a unique block ID
 */
function generateBlockId(type: string, index: number): string {
  return `${type}-${index}-default`
}

/**
 * Create the default homepage layout for a store
 * This is used when no custom layout has been saved
 */
export function createDefaultHomepageLayout(storeSlug: string): PageLayout {
  const blocks: StoreBlock[] = [
    {
      id: generateBlockId("header", 0),
      type: "header",
      variant: "classic",
      order: 0,
      visible: true,
      settings: {
        navLinks: [
          { label: "Shop", href: `/store/${storeSlug}/products` },
          { label: "Collections", href: `/store/${storeSlug}/collections` },
          { label: "About", href: `/store/${storeSlug}/about` },
          { label: "Contact", href: `/store/${storeSlug}/contact` },
        ],
        showSearch: true,
        showAccount: true,
        sticky: true,
      },
    },
    {
      id: generateBlockId("hero", 1),
      type: "hero",
      variant: "full-width",
      order: 1,
      visible: true,
      settings: {
        headline: "Welcome to Our Store",
        subheadline: "Discover amazing products crafted with care",
        primaryCtaText: "Shop Now",
        primaryCtaLink: `/store/${storeSlug}/products`,
        secondaryCtaText: "Learn More",
        secondaryCtaLink: `/store/${storeSlug}/about`,
        overlayOpacity: 40,
        textAlignment: "center",
        height: "large",
      },
    },
    {
      id: generateBlockId("trust", 2),
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
      id: generateBlockId("products", 3),
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
      id: generateBlockId("newsletter", 4),
      type: "newsletter",
      variant: "card",
      order: 4,
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
      id: generateBlockId("footer", 5),
      type: "footer",
      variant: "multi-column",
      order: 5,
      visible: true,
      settings: {
        columns: [
          {
            title: "Shop",
            links: [
              { label: "All Products", href: `/store/${storeSlug}/products` },
              { label: "New Arrivals", href: `/store/${storeSlug}/products?sort=newest` },
              { label: "Best Sellers", href: `/store/${storeSlug}/products?sort=bestselling` },
            ],
          },
          {
            title: "Support",
            links: [
              { label: "Contact Us", href: `/store/${storeSlug}/contact` },
              { label: "Shipping Info", href: `/store/${storeSlug}/shipping` },
              { label: "Returns", href: `/store/${storeSlug}/returns` },
            ],
          },
        ],
        socialLinks: [],
        showPaymentIcons: true,
        showNewsletter: false,
        legalLinks: [
          { label: "Privacy Policy", href: `/store/${storeSlug}/privacy` },
          { label: "Terms of Service", href: `/store/${storeSlug}/terms` },
        ],
      },
    },
  ]

  return {
    id: "default-homepage",
    name: "Homepage",
    slug: "/",
    isHomepage: true,
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks,
  }
}

/**
 * Create an empty layout (for starting from scratch)
 */
export function createEmptyLayout(storeSlug: string): PageLayout {
  return {
    id: "empty-homepage",
    name: "Homepage",
    slug: "/",
    isHomepage: true,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: generateBlockId("header", 0),
        type: "header",
        variant: "classic",
        order: 0,
        visible: true,
        settings: {
          navLinks: [
            { label: "Shop", href: `/store/${storeSlug}/products` },
          ],
          showSearch: true,
          showAccount: true,
          sticky: true,
        },
      },
      {
        id: generateBlockId("footer", 1),
        type: "footer",
        variant: "centered",
        order: 1,
        visible: true,
        settings: {
          columns: [],
          socialLinks: [],
          showPaymentIcons: true,
          showNewsletter: false,
          legalLinks: [
            { label: "Privacy", href: `/store/${storeSlug}/privacy` },
            { label: "Terms", href: `/store/${storeSlug}/terms` },
          ],
        },
      },
    ],
  }
}
