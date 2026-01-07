// Block Field Definitions - Schema for each block type's settings

import type { FieldSchema } from "./types"
import type { BlockType } from "@/types/blocks"

export const BLOCK_FIELD_SCHEMAS: Record<BlockType, FieldSchema> = {
  header: {
    logoText: {
      type: "text",
      label: "Logo Text",
      description: "Text to display if no logo image",
      placeholder: "Your Store Name",
    },
    logo: {
      type: "image",
      label: "Logo Image",
      description: "Upload your store logo",
    },
    showSearch: {
      type: "boolean",
      label: "Show Search",
      description: "Display search icon in header",
      defaultValue: true,
    },
    showAccount: {
      type: "boolean",
      label: "Show Account",
      description: "Display account/login icon",
      defaultValue: true,
    },
    sticky: {
      type: "boolean",
      label: "Sticky Header",
      description: "Header stays visible when scrolling",
      defaultValue: true,
    },
    transparent: {
      type: "boolean",
      label: "Transparent Background",
      description: "Make header transparent over hero",
      defaultValue: false,
    },
    announcementText: {
      type: "text",
      label: "Announcement Text",
      description: "Text for announcement bar (announcement variant)",
      placeholder: "Free shipping on orders over $50!",
    },
    announcementLink: {
      type: "url",
      label: "Announcement Link",
      description: "Link when clicking announcement",
      allowInternal: true,
    },
    navLinks: {
      type: "array",
      label: "Navigation Links",
      itemLabel: "Link",
      maxItems: 8,
      itemFields: {
        label: { type: "text", label: "Label", required: true },
        href: { type: "url", label: "URL", required: true, allowInternal: true },
      },
    },
  },

  hero: {
    headline: {
      type: "text",
      label: "Headline",
      description: "Main headline text",
      placeholder: "Welcome to Our Store",
      required: true,
    },
    subheadline: {
      type: "textarea",
      label: "Subheadline",
      description: "Supporting text below headline",
      rows: 2,
    },
    primaryCtaText: {
      type: "text",
      label: "Primary Button Text",
      placeholder: "Shop Now",
    },
    primaryCtaLink: {
      type: "url",
      label: "Primary Button Link",
      allowInternal: true,
    },
    secondaryCtaText: {
      type: "text",
      label: "Secondary Button Text",
      placeholder: "Learn More",
    },
    secondaryCtaLink: {
      type: "url",
      label: "Secondary Button Link",
      allowInternal: true,
    },
    backgroundImage: {
      type: "image",
      label: "Background Image",
      aspectRatio: "16:9",
    },
    backgroundVideo: {
      type: "url",
      label: "Background Video URL",
      description: "YouTube or Vimeo URL (video variant)",
    },
    overlayOpacity: {
      type: "number",
      label: "Overlay Opacity",
      description: "Darkness of overlay (0-100)",
      min: 0,
      max: 100,
      step: 5,
      suffix: "%",
      defaultValue: 40,
    },
    textAlignment: {
      type: "select",
      label: "Text Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "center",
    },
    height: {
      type: "select",
      label: "Section Height",
      options: [
        { label: "Full Screen", value: "full" },
        { label: "Large", value: "large" },
        { label: "Medium", value: "medium" },
      ],
      defaultValue: "large",
    },
    featuredProductId: {
      type: "product",
      label: "Featured Product",
      description: "Product to showcase (product-showcase variant)",
    },
  },

  "featured-product": {
    productId: {
      type: "product",
      label: "Product",
      description: "Select the product to feature",
      required: true,
    },
    showPrice: {
      type: "boolean",
      label: "Show Price",
      defaultValue: true,
    },
    showReviews: {
      type: "boolean",
      label: "Show Reviews",
      defaultValue: true,
    },
    customHeadline: {
      type: "text",
      label: "Custom Headline",
      description: "Override product name",
    },
    customDescription: {
      type: "textarea",
      label: "Custom Description",
      description: "Override product description",
      rows: 3,
    },
    badgeText: {
      type: "text",
      label: "Badge Text",
      placeholder: "New Arrival",
    },
    showCountdown: {
      type: "boolean",
      label: "Show Countdown",
      description: "Display countdown timer (urgency variant)",
      defaultValue: false,
    },
    countdownEnd: {
      type: "text",
      label: "Countdown End Date",
      description: "ISO date string (e.g., 2024-12-31T23:59:59)",
      condition: (values) => values.showCountdown === true,
    },
    backgroundColor: {
      type: "color",
      label: "Background Color",
      presets: ["#ffffff", "#f8f9fa", "#1a1a1a", "#f0f4f8"],
    },
  },

  "product-grid": {
    sectionTitle: {
      type: "text",
      label: "Section Title",
      placeholder: "Featured Products",
    },
    collectionId: {
      type: "collection",
      label: "Collection",
      description: "Show products from a specific collection",
    },
    productIds: {
      type: "products",
      label: "Specific Products",
      description: "Or select specific products to display",
      maxItems: 12,
    },
    productsToShow: {
      type: "number",
      label: "Products to Show",
      min: 2,
      max: 24,
      defaultValue: 8,
    },
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
        { label: "5 Columns", value: "5" },
      ],
      defaultValue: "4",
    },
    showPrices: {
      type: "boolean",
      label: "Show Prices",
      defaultValue: true,
    },
    showQuickAdd: {
      type: "boolean",
      label: "Show Quick Add Button",
      defaultValue: true,
    },
    showReviews: {
      type: "boolean",
      label: "Show Reviews",
      defaultValue: false,
    },
    showViewAll: {
      type: "boolean",
      label: "Show View All Link",
      defaultValue: true,
    },
    sortOrder: {
      type: "select",
      label: "Sort Order",
      options: [
        { label: "Newest First", value: "newest" },
        { label: "Price: Low to High", value: "price-asc" },
        { label: "Price: High to Low", value: "price-desc" },
        { label: "Best Selling", value: "bestselling" },
      ],
      defaultValue: "newest",
    },
  },

  "promotional-banner": {
    headline: {
      type: "text",
      label: "Headline",
      required: true,
      placeholder: "Special Offer",
    },
    subtext: {
      type: "textarea",
      label: "Subtext",
      rows: 2,
    },
    ctaText: {
      type: "text",
      label: "Button Text",
      placeholder: "Shop Now",
    },
    ctaLink: {
      type: "url",
      label: "Button Link",
      allowInternal: true,
    },
    backgroundColor: {
      type: "color",
      label: "Background Color",
      presets: ["#000000", "#1a1a2e", "#e63946", "#2a9d8f"],
    },
    backgroundImage: {
      type: "image",
      label: "Background Image",
    },
    discountCode: {
      type: "text",
      label: "Discount Code",
      description: "Code to display (discount-code variant)",
      placeholder: "SAVE20",
    },
    countdownEnd: {
      type: "text",
      label: "Countdown End Date",
      description: "ISO date for countdown (countdown variant)",
      placeholder: "2025-12-31T23:59:59",
    },
    showDays: {
      type: "boolean",
      label: "Show Days",
      description: "Display days in countdown (countdown variant)",
      defaultValue: true,
    },
    showHours: {
      type: "boolean",
      label: "Show Hours",
      description: "Display hours in countdown (countdown variant)",
      defaultValue: true,
    },
    showMinutes: {
      type: "boolean",
      label: "Show Minutes",
      description: "Display minutes in countdown (countdown variant)",
      defaultValue: true,
    },
    showSeconds: {
      type: "boolean",
      label: "Show Seconds",
      description: "Display seconds in countdown (countdown variant)",
      defaultValue: true,
    },
    expiredMessage: {
      type: "text",
      label: "Expired Message",
      description: "Text shown when countdown ends (countdown variant)",
      placeholder: "This offer has ended",
      defaultValue: "This offer has ended",
    },
  },

  testimonials: {
    sectionTitle: {
      type: "text",
      label: "Section Title",
      placeholder: "What Our Customers Say",
    },
    dataSource: {
      type: "select",
      label: "Data Source",
      options: [
        { label: "Manual Entry", value: "manual" },
        { label: "Product Reviews", value: "product-reviews" },
        { label: "All Reviews", value: "all-reviews" },
      ],
      defaultValue: "manual",
    },
    reviewsToShow: {
      type: "number",
      label: "Reviews to Show",
      min: 1,
      max: 12,
      defaultValue: 3,
    },
    showRatings: {
      type: "boolean",
      label: "Show Star Ratings",
      defaultValue: true,
    },
    showPhotos: {
      type: "boolean",
      label: "Show Customer Photos",
      defaultValue: true,
    },
    showProduct: {
      type: "boolean",
      label: "Show Product Name",
      defaultValue: false,
    },
    manualReviews: {
      type: "array",
      label: "Manual Reviews",
      itemLabel: "Review",
      maxItems: 10,
      condition: (values) => values.dataSource === "manual",
      itemFields: {
        quote: { type: "textarea", label: "Quote", required: true, rows: 3 },
        author: { type: "text", label: "Author Name", required: true },
        role: { type: "text", label: "Role/Title" },
        avatar: { type: "image", label: "Avatar" },
        rating: { type: "number", label: "Rating", min: 1, max: 5 },
      },
    },
  },

  "trust-signals": {
    items: {
      type: "array",
      label: "Trust Items",
      itemLabel: "Item",
      maxItems: 6,
      itemFields: {
        icon: {
          type: "icon",
          label: "Icon",
          icons: ["Truck01Icon", "RefreshIcon", "ShieldCheckIcon", "HeadphonesIcon", "CreditCardIcon", "GiftIcon"],
        },
        title: { type: "text", label: "Title", required: true },
        description: { type: "text", label: "Description" },
      },
    },
    linkToPolicies: {
      type: "boolean",
      label: "Link to Policy Pages",
      description: "Make items clickable to policy pages",
      defaultValue: true,
    },
    backgroundColor: {
      type: "color",
      label: "Background Color",
      presets: ["#ffffff", "#f8f9fa", "#f0f4f8"],
    },
  },

  newsletter: {
    headline: {
      type: "text",
      label: "Headline",
      placeholder: "Join Our Newsletter",
      required: true,
    },
    subtext: {
      type: "textarea",
      label: "Subtext",
      placeholder: "Get 10% off your first order",
      rows: 2,
    },
    buttonText: {
      type: "text",
      label: "Button Text",
      placeholder: "Subscribe",
      defaultValue: "Subscribe",
    },
    collectName: {
      type: "boolean",
      label: "Collect Name",
      description: "Ask for name in addition to email",
      defaultValue: false,
    },
    incentiveCode: {
      type: "text",
      label: "Incentive Code",
      description: "Discount code to show after signup",
    },
    successMessage: {
      type: "text",
      label: "Success Message",
      placeholder: "Thanks for subscribing!",
      defaultValue: "Thanks for subscribing!",
    },
    backgroundColor: {
      type: "color",
      label: "Background Color",
      presets: ["#000000", "#1a1a2e", "#f8f9fa"],
    },
    backgroundImage: {
      type: "image",
      label: "Background Image",
    },
  },

  footer: {
    logoText: {
      type: "text",
      label: "Logo Text",
    },
    logo: {
      type: "image",
      label: "Logo Image",
    },
    columns: {
      type: "array",
      label: "Footer Columns",
      itemLabel: "Column",
      maxItems: 4,
      itemFields: {
        title: { type: "text", label: "Column Title", required: true },
        links: {
          type: "array",
          label: "Links",
          itemLabel: "Link",
          maxItems: 8,
          itemFields: {
            label: { type: "text", label: "Label", required: true },
            href: { type: "url", label: "URL", required: true, allowInternal: true },
          },
        },
      },
    },
    contactEmail: {
      type: "text",
      label: "Contact Email",
    },
    contactPhone: {
      type: "text",
      label: "Contact Phone",
    },
    address: {
      type: "textarea",
      label: "Address",
      rows: 2,
    },
    socialLinks: {
      type: "array",
      label: "Social Links",
      itemLabel: "Social",
      maxItems: 6,
      itemFields: {
        platform: {
          type: "select",
          label: "Platform",
          options: [
            { label: "Facebook", value: "facebook" },
            { label: "Instagram", value: "instagram" },
            { label: "Twitter/X", value: "twitter" },
            { label: "TikTok", value: "tiktok" },
            { label: "YouTube", value: "youtube" },
            { label: "LinkedIn", value: "linkedin" },
          ],
        },
        url: { type: "url", label: "URL", required: true },
      },
    },
    showPaymentIcons: {
      type: "boolean",
      label: "Show Payment Icons",
      defaultValue: true,
    },
    showNewsletter: {
      type: "boolean",
      label: "Show Newsletter Form",
      defaultValue: false,
    },
    copyrightText: {
      type: "text",
      label: "Copyright Text",
      placeholder: "© 2024 Your Store. All rights reserved.",
    },
    legalLinks: {
      type: "array",
      label: "Legal Links",
      itemLabel: "Link",
      maxItems: 4,
      itemFields: {
        label: { type: "text", label: "Label", required: true },
        href: { type: "url", label: "URL", required: true, allowInternal: true },
      },
    },
  },
  "rich-text": {
    content: {
      type: "richtext",
      label: "Content",
      description: "Rich text content with formatting",
      placeholder: "Enter your content here...",
    },
    backgroundColor: {
      type: "color",
      label: "Background Color",
      description: "Optional background color",
    },
    textColor: {
      type: "color",
      label: "Text Color",
      description: "Optional text color",
    },
    padding: {
      type: "select",
      label: "Padding",
      description: "Vertical spacing around content",
      defaultValue: "medium",
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
    maxWidth: {
      type: "select",
      label: "Max Width",
      description: "Maximum content width",
      defaultValue: "medium",
      options: [
        { value: "full", label: "Full Width" },
        { value: "narrow", label: "Narrow" },
        { value: "medium", label: "Medium" },
        { value: "wide", label: "Wide" },
      ],
    },
    alignment: {
      type: "select",
      label: "Alignment",
      description: "Text alignment",
      defaultValue: "left",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ],
    },
  },

  // ============================================================================
  // CONTAINER BLOCKS (Hybrid Architecture)
  // ============================================================================

  section: {
    backgroundColor: {
      type: "color",
      label: "Background Color",
      description: "Section background color",
    },
    backgroundImage: {
      type: "image",
      label: "Background Image",
      description: "Optional background image",
    },
    padding: {
      type: "select",
      label: "Padding",
      description: "Vertical spacing inside section",
      defaultValue: "medium",
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "xlarge", label: "Extra Large" },
      ],
    },
    maxWidth: {
      type: "select",
      label: "Max Width",
      description: "Maximum content width",
      defaultValue: "default",
      options: [
        { value: "full", label: "Full Width" },
        { value: "default", label: "Default (1280px)" },
        { value: "narrow", label: "Narrow (960px)" },
        { value: "wide", label: "Wide (1440px)" },
      ],
    },
    verticalAlign: {
      type: "select",
      label: "Vertical Alignment",
      description: "Align children vertically",
      defaultValue: "start",
      options: [
        { value: "start", label: "Top" },
        { value: "center", label: "Center" },
        { value: "end", label: "Bottom" },
      ],
    },
  },

  columns: {
    columnCount: {
      type: "select",
      label: "Columns",
      description: "Number of columns",
      defaultValue: "2",
      options: [
        { value: "2", label: "2 Columns" },
        { value: "3", label: "3 Columns" },
        { value: "4", label: "4 Columns" },
      ],
    },
    gap: {
      type: "select",
      label: "Gap",
      description: "Space between columns",
      defaultValue: "medium",
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
    stackOnMobile: {
      type: "boolean",
      label: "Stack on Mobile",
      description: "Stack columns vertically on mobile",
      defaultValue: true,
    },
    reverseOnMobile: {
      type: "boolean",
      label: "Reverse on Mobile",
      description: "Reverse column order on mobile",
      defaultValue: false,
    },
    verticalAlign: {
      type: "select",
      label: "Vertical Alignment",
      description: "Align columns vertically",
      defaultValue: "stretch",
      options: [
        { value: "start", label: "Top" },
        { value: "center", label: "Center" },
        { value: "end", label: "Bottom" },
        { value: "stretch", label: "Stretch" },
      ],
    },
  },

  column: {
    width: {
      type: "select",
      label: "Width",
      description: "Column width (relative to siblings)",
      defaultValue: "auto",
      options: [
        { value: "auto", label: "Auto (Equal)" },
        { value: "1/4", label: "25%" },
        { value: "1/3", label: "33%" },
        { value: "1/2", label: "50%" },
        { value: "2/3", label: "66%" },
        { value: "3/4", label: "75%" },
      ],
    },
    padding: {
      type: "select",
      label: "Padding",
      description: "Inner spacing",
      defaultValue: "none",
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
    verticalAlign: {
      type: "select",
      label: "Vertical Alignment",
      description: "Align content vertically",
      defaultValue: "start",
      options: [
        { value: "start", label: "Top" },
        { value: "center", label: "Center" },
        { value: "end", label: "Bottom" },
      ],
    },
  },

  // ============================================================================
  // PRIMITIVE BLOCKS (Hybrid Architecture)
  // ============================================================================

  image: {
    src: {
      type: "image",
      label: "Image",
      description: "Select or upload an image",
      required: true,
    },
    alt: {
      type: "text",
      label: "Alt Text",
      description: "Describe the image for accessibility",
      placeholder: "Image description",
    },
    width: {
      type: "number",
      label: "Width",
      description: "Image width in pixels (leave empty for auto)",
      placeholder: "Auto",
      min: 50,
      max: 1200,
    },
    height: {
      type: "number",
      label: "Height",
      description: "Image height in pixels (leave empty for auto)",
      placeholder: "Auto",
      min: 50,
      max: 800,
    },
    aspectRatio: {
      type: "select",
      label: "Aspect Ratio",
      description: "Image proportions",
      defaultValue: "auto",
      options: [
        { value: "auto", label: "Auto (Original)" },
        { value: "1:1", label: "Square (1:1)" },
        { value: "4:3", label: "Standard (4:3)" },
        { value: "16:9", label: "Widescreen (16:9)" },
        { value: "3:2", label: "Photo (3:2)" },
        { value: "2:3", label: "Portrait (2:3)" },
      ],
    },
    objectFit: {
      type: "select",
      label: "Object Fit",
      description: "How image fills container",
      defaultValue: "cover",
      options: [
        { value: "cover", label: "Cover" },
        { value: "contain", label: "Contain" },
        { value: "fill", label: "Fill" },
      ],
    },
    borderRadius: {
      type: "select",
      label: "Border Radius",
      description: "Corner rounding",
      defaultValue: "none",
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "full", label: "Full (Circle)" },
      ],
    },
    link: {
      type: "url",
      label: "Link",
      description: "Optional link when clicked",
      allowInternal: true,
    },
  },

  button: {
    text: {
      type: "text",
      label: "Button Text",
      description: "Text displayed on button",
      placeholder: "Click me",
      required: true,
    },
    link: {
      type: "url",
      label: "Link",
      description: "URL when clicked",
      allowInternal: true,
      required: true,
    },
    variant: {
      type: "select",
      label: "Style",
      description: "Button appearance",
      defaultValue: "primary",
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "outline", label: "Outline" },
        { value: "ghost", label: "Ghost" },
        { value: "link", label: "Link" },
      ],
    },
    size: {
      type: "select",
      label: "Size",
      description: "Button size",
      defaultValue: "default",
      options: [
        { value: "small", label: "Small" },
        { value: "default", label: "Default" },
        { value: "large", label: "Large" },
      ],
    },
    fullWidth: {
      type: "boolean",
      label: "Full Width",
      description: "Stretch to fill container",
      defaultValue: false,
    },
    openInNewTab: {
      type: "boolean",
      label: "Open in New Tab",
      description: "Open link in new browser tab",
      defaultValue: false,
    },
  },

  video: {
    src: {
      type: "url",
      label: "Video URL",
      description: "YouTube, Vimeo, or direct video URL",
      placeholder: "https://youtube.com/watch?v=...",
      required: true,
    },
    poster: {
      type: "image",
      label: "Poster Image",
      description: "Thumbnail shown before video plays",
    },
    autoplay: {
      type: "boolean",
      label: "Autoplay",
      description: "Start playing automatically (muted required)",
      defaultValue: false,
    },
    loop: {
      type: "boolean",
      label: "Loop",
      description: "Repeat video continuously",
      defaultValue: false,
    },
    muted: {
      type: "boolean",
      label: "Muted",
      description: "Start with sound off",
      defaultValue: false,
    },
    controls: {
      type: "boolean",
      label: "Show Controls",
      description: "Display play/pause controls",
      defaultValue: true,
    },
    aspectRatio: {
      type: "select",
      label: "Aspect Ratio",
      description: "Video proportions",
      defaultValue: "16:9",
      options: [
        { value: "16:9", label: "Widescreen (16:9)" },
        { value: "4:3", label: "Standard (4:3)" },
        { value: "1:1", label: "Square (1:1)" },
        { value: "9:16", label: "Vertical (9:16)" },
        { value: "21:9", label: "Cinematic (21:9)" },
      ],
    },
    caption: {
      type: "text",
      label: "Caption",
      description: "Optional text below video",
    },
    maxWidth: {
      type: "select",
      label: "Max Width",
      description: "Maximum video width",
      defaultValue: "full",
      options: [
        { value: "full", label: "Full Width" },
        { value: "large", label: "Large (960px)" },
        { value: "medium", label: "Medium (720px)" },
        { value: "small", label: "Small (480px)" },
      ],
    },
  },

  faq: {
    title: {
      type: "text",
      label: "Section Title",
      placeholder: "Frequently Asked Questions",
    },
    subtitle: {
      type: "textarea",
      label: "Subtitle",
      description: "Optional description text",
      rows: 2,
    },
    items: {
      type: "array",
      label: "Questions",
      itemLabel: "Question",
      maxItems: 20,
      itemFields: {
        question: { type: "text", label: "Question", required: true },
        answer: { type: "textarea", label: "Answer", required: true, rows: 3 },
      },
    },
    allowMultipleOpen: {
      type: "boolean",
      label: "Allow Multiple Open",
      description: "Allow multiple questions to be expanded",
      defaultValue: false,
    },
    defaultOpenFirst: {
      type: "boolean",
      label: "Open First by Default",
      description: "Expand first question on load",
      defaultValue: true,
    },
    showSearch: {
      type: "boolean",
      label: "Show Search",
      description: "Add search filter (searchable variant)",
      defaultValue: false,
    },
    columns: {
      type: "select",
      label: "Columns",
      description: "Layout columns (grid variant)",
      defaultValue: "1",
      options: [
        { value: "1", label: "1 Column" },
        { value: "2", label: "2 Columns" },
      ],
    },
  },

  gallery: {
    images: {
      type: "array",
      label: "Images",
      itemLabel: "Image",
      maxItems: 20,
      itemFields: {
        src: { type: "image", label: "Image", required: true },
        alt: { type: "text", label: "Alt Text" },
        caption: { type: "text", label: "Caption" },
      },
    },
    columns: {
      type: "select",
      label: "Columns",
      description: "Number of columns",
      defaultValue: "3",
      options: [
        { value: "2", label: "2 Columns" },
        { value: "3", label: "3 Columns" },
        { value: "4", label: "4 Columns" },
        { value: "5", label: "5 Columns" },
      ],
    },
    gap: {
      type: "select",
      label: "Gap",
      description: "Space between images",
      defaultValue: "medium",
      options: [
        { value: "none", label: "None" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
    aspectRatio: {
      type: "select",
      label: "Aspect Ratio",
      description: "Image proportions",
      defaultValue: "1:1",
      options: [
        { value: "auto", label: "Auto (Original)" },
        { value: "1:1", label: "Square (1:1)" },
        { value: "4:3", label: "Standard (4:3)" },
        { value: "16:9", label: "Widescreen (16:9)" },
        { value: "3:2", label: "Photo (3:2)" },
      ],
    },
    showCaptions: {
      type: "boolean",
      label: "Show Captions",
      description: "Display image captions",
      defaultValue: false,
    },
    enableLightbox: {
      type: "boolean",
      label: "Enable Lightbox",
      description: "Click to view full size",
      defaultValue: true,
    },
  },
}

export function getBlockFieldSchema(blockType: BlockType): FieldSchema {
  return BLOCK_FIELD_SCHEMAS[blockType] || {}
}
