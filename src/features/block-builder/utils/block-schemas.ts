// Block Schemas - Defines the structure and fields for each block type
import type { BlockSchema } from "../types"

export const blockSchemas: BlockSchema[] = [
  // Layout blocks
  {
    type: "header",
    name: "Header",
    description: "Site navigation and branding",
    icon: "Layout",
    category: "layout",
    variants: [
      { id: "classic", name: "Classic", description: "Traditional header with logo and nav" },
      { id: "centered", name: "Centered", description: "Centered logo with navigation below" },
      { id: "minimal", name: "Minimal", description: "Clean, minimal design" },
    ],
    fields: {
      branding: [
        { id: "logoText", type: "text", label: "Logo Text", default: "Your Store" },
        { id: "logo", type: "image", label: "Logo Image" },
      ],
      navigation: [
        { id: "showSearch", type: "toggle", label: "Show Search", default: true },
        { id: "showAccount", type: "toggle", label: "Show Account", default: true },
        { id: "sticky", type: "toggle", label: "Sticky Header", default: false },
      ],
    },
  },

  {
    type: "footer",
    name: "Footer",
    description: "Site footer with links and info",
    icon: "Layout",
    category: "layout",
    variants: [
      { id: "multi-column", name: "Multi-Column", description: "Multiple columns of links" },
      { id: "centered", name: "Centered", description: "Centered layout" },
      { id: "rich", name: "Rich Footer", description: "Full-featured footer" },
    ],
    fields: {
      branding: [
        { id: "logoText", type: "text", label: "Logo Text", default: "Your Store" },
        { id: "logo", type: "image", label: "Logo Image" },
      ],
      content: [
        { id: "showNewsletter", type: "toggle", label: "Show Newsletter", default: true },
        { id: "showPaymentIcons", type: "toggle", label: "Show Payment Icons", default: true },
        { id: "copyrightText", type: "text", label: "Copyright Text", default: "© 2024 Your Store" },
      ],
    },
  },

  // Content blocks
  {
    type: "hero",
    name: "Hero Section",
    description: "First impression, value proposition",
    icon: "Image",
    category: "content",
    variants: [
      { id: "full-width", name: "Full-Width Image", description: "Full viewport background" },
      { id: "split", name: "Split Layout", description: "50/50 image and content" },
      { id: "minimal-text", name: "Minimal Text", description: "Large typography, no image" },
      { id: "product-showcase", name: "Product Showcase", description: "Hero with featured product" },
    ],
    fields: {
      content: [
        { id: "headline", type: "text", label: "Headline", required: true, default: "Welcome to Our Store" },
        { id: "subheadline", type: "textarea", label: "Subheadline", default: "Discover amazing products" },
        { id: "primaryCtaText", type: "text", label: "Button Text", default: "Shop Now" },
        { id: "primaryCtaLink", type: "link", label: "Button Link", default: "/products" },
        { id: "secondaryCtaText", type: "text", label: "Secondary Button (optional)" },
        { id: "secondaryCtaLink", type: "link", label: "Secondary Link" },
      ],
      background: [
        { id: "backgroundImage", type: "image", label: "Background Image" },
        { id: "overlayOpacity", type: "number", label: "Overlay Opacity", min: 0, max: 100, default: 40 },
      ],
      layout: [
        { id: "textAlignment", type: "select", label: "Text Alignment", options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ], default: "center" },
        { id: "height", type: "select", label: "Height", options: [
          { value: "full", label: "Full Screen" },
          { value: "large", label: "Large (80vh)" },
          { value: "medium", label: "Medium (60vh)" },
        ], default: "large" },
      ],
    },
  },

  {
    type: "rich-text",
    name: "Rich Text",
    description: "Formatted text content",
    icon: "Type",
    category: "content",
    variants: [
      { id: "simple", name: "Simple", description: "Basic text block" },
      { id: "card", name: "Card", description: "Text in a card container" },
      { id: "full-width", name: "Full Width", description: "Full-width text section" },
    ],
    fields: {
      content: [
        { id: "content", type: "richtext", label: "Content", required: true, default: "Enter your text here..." },
      ],
      styling: [
        { id: "backgroundColor", type: "color", label: "Background Color" },
        { id: "textColor", type: "color", label: "Text Color" },
        { id: "alignment", type: "select", label: "Alignment", options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ], default: "left" },
      ],
    },
  },

  {
    type: "testimonials",
    name: "Testimonials",
    description: "Customer reviews and testimonials",
    icon: "MessageSquare",
    category: "content",
    variants: [
      { id: "carousel", name: "Carousel", description: "Sliding testimonials" },
      { id: "grid", name: "Grid", description: "Grid layout" },
      { id: "featured", name: "Featured", description: "Single featured testimonial" },
    ],
    fields: {
      content: [
        { id: "sectionTitle", type: "text", label: "Section Title", default: "What Our Customers Say" },
        { id: "reviewsToShow", type: "number", label: "Reviews to Show", min: 1, max: 12, default: 3 },
        { id: "showRatings", type: "toggle", label: "Show Ratings", default: true },
        { id: "showPhotos", type: "toggle", label: "Show Photos", default: true },
      ],
      data: [
        { id: "dataSource", type: "select", label: "Data Source", options: [
          { value: "manual", label: "Manual Reviews" },
          { value: "product-reviews", label: "Product Reviews" },
          { value: "all-reviews", label: "All Reviews" },
        ], default: "manual" },
      ],
    },
  },

  {
    type: "faq",
    name: "FAQ",
    description: "Frequently asked questions",
    icon: "HelpCircle",
    category: "content",
    variants: [
      { id: "accordion", name: "Accordion", description: "Expandable questions" },
      { id: "grid", name: "Grid", description: "Grid layout" },
      { id: "simple", name: "Simple", description: "Simple list" },
    ],
    fields: {
      content: [
        { id: "title", type: "text", label: "Title", default: "Frequently Asked Questions" },
        { id: "subtitle", type: "text", label: "Subtitle" },
        { id: "allowMultipleOpen", type: "toggle", label: "Allow Multiple Open", default: false },
        { id: "defaultOpenFirst", type: "toggle", label: "Open First by Default", default: true },
      ],
      layout: [
        { id: "columns", type: "select", label: "Columns", options: [
          { value: "1", label: "1 Column" },
          { value: "2", label: "2 Columns" },
        ], default: "1" },
      ],
    },
  },

  // Commerce blocks
  {
    type: "featured-product",
    name: "Featured Product",
    description: "Highlight a specific product",
    icon: "ShoppingBag",
    category: "commerce",
    variants: [
      { id: "large-image", name: "Large Image", description: "Product with large image" },
      { id: "gallery", name: "Gallery", description: "Product with image gallery" },
      { id: "lifestyle", name: "Lifestyle", description: "Product in lifestyle setting" },
    ],
    fields: {
      product: [
        { id: "productId", type: "product", label: "Product", required: true },
        { id: "customHeadline", type: "text", label: "Custom Headline" },
        { id: "customDescription", type: "textarea", label: "Custom Description" },
      ],
      display: [
        { id: "showPrice", type: "toggle", label: "Show Price", default: true },
        { id: "showReviews", type: "toggle", label: "Show Reviews", default: true },
        { id: "badgeText", type: "text", label: "Badge Text" },
      ],
    },
  },

  {
    type: "product-grid",
    name: "Product Grid",
    description: "Grid of products",
    icon: "Grid3X3",
    category: "commerce",
    variants: [
      { id: "standard", name: "Standard", description: "Standard product grid" },
      { id: "featured-grid", name: "Featured Grid", description: "Grid with featured items" },
      { id: "carousel", name: "Carousel", description: "Scrollable product carousel" },
    ],
    fields: {
      products: [
        { id: "collectionId", type: "collection", label: "Collection" },
        { id: "productsToShow", type: "number", label: "Products to Show", min: 1, max: 24, default: 8 },
        { id: "sortOrder", type: "select", label: "Sort Order", options: [
          { value: "newest", label: "Newest" },
          { value: "price-asc", label: "Price: Low to High" },
          { value: "price-desc", label: "Price: High to Low" },
          { value: "bestselling", label: "Best Selling" },
        ], default: "newest" },
      ],
      layout: [
        { id: "columns", type: "select", label: "Columns", options: [
          { value: "3", label: "3 Columns" },
          { value: "4", label: "4 Columns" },
          { value: "5", label: "5 Columns" },
        ], default: "4" },
      ],
      display: [
        { id: "sectionTitle", type: "text", label: "Section Title" },
        { id: "showPrices", type: "toggle", label: "Show Prices", default: true },
        { id: "showQuickAdd", type: "toggle", label: "Show Quick Add", default: true },
        { id: "showViewAll", type: "toggle", label: "Show View All", default: true },
      ],
    },
  },

  {
    type: "promotional-banner",
    name: "Promo Banner",
    description: "Promotional banner or announcement",
    icon: "Megaphone",
    category: "commerce",
    variants: [
      { id: "full-width", name: "Full Width", description: "Full-width banner" },
      { id: "split-image", name: "Split Image", description: "Banner with image" },
      { id: "countdown", name: "Countdown", description: "Banner with countdown timer" },
    ],
    fields: {
      content: [
        { id: "headline", type: "text", label: "Headline", required: true, default: "Special Offer" },
        { id: "subtext", type: "textarea", label: "Subtext" },
        { id: "ctaText", type: "text", label: "Button Text", default: "Shop Now" },
        { id: "ctaLink", type: "link", label: "Button Link", required: true },
      ],
      styling: [
        { id: "backgroundColor", type: "color", label: "Background Color", default: "#000000" },
        { id: "backgroundImage", type: "image", label: "Background Image" },
      ],
      countdown: [
        { id: "countdownEnd", type: "text", label: "Countdown End Date", placeholder: "2024-12-31T23:59:59" },
        { id: "expiredMessage", type: "text", label: "Expired Message", default: "Offer has ended" },
      ],
    },
  },

  // Engagement blocks
  {
    type: "newsletter",
    name: "Newsletter",
    description: "Email signup form",
    icon: "Mail",
    category: "engagement",
    variants: [
      { id: "inline", name: "Inline", description: "Simple inline form" },
      { id: "card", name: "Card", description: "Form in a card" },
      { id: "split-image", name: "Split Image", description: "Form with background image" },
    ],
    fields: {
      content: [
        { id: "headline", type: "text", label: "Headline", default: "Stay Updated" },
        { id: "subtext", type: "textarea", label: "Subtext", default: "Get the latest news and offers" },
        { id: "buttonText", type: "text", label: "Button Text", default: "Subscribe" },
        { id: "successMessage", type: "text", label: "Success Message", default: "Thanks for subscribing!" },
      ],
      form: [
        { id: "collectName", type: "toggle", label: "Collect Name", default: false },
        { id: "privacyText", type: "text", label: "Privacy Text" },
      ],
      styling: [
        { id: "backgroundColor", type: "color", label: "Background Color" },
        { id: "backgroundImage", type: "image", label: "Background Image" },
      ],
    },
  },

  {
    type: "trust-signals",
    name: "Trust Signals",
    description: "Build trust with guarantees and features",
    icon: "Shield",
    category: "engagement",
    variants: [
      { id: "icon-row", name: "Icon Row", description: "Row of icons with text" },
      { id: "feature-cards", name: "Feature Cards", description: "Cards with features" },
      { id: "logo-cloud", name: "Logo Cloud", description: "Partner/client logos" },
    ],
    fields: {
      content: [
        { id: "guaranteeText", type: "text", label: "Guarantee Text" },
        { id: "linkToPolicies", type: "toggle", label: "Link to Policies", default: false },
      ],
    },
  },
]