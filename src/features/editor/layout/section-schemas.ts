/**
 * Section Schemas
 * Defines what blocks each section type can contain and their settings
 * Similar to Shopify's section schema system
 */

import type { SectionSchema, SectionPreset } from "./types"

// =============================================================================
// HERO SECTION SCHEMA
// =============================================================================

export const heroSectionSchema: SectionSchema = {
  name: "Hero",
  tag: "section",
  class: "hero-section",
  maxBlocks: 5,
  blocks: [
    {
      type: "heading",
      name: "Heading",
      limit: 1,
      settings: [
        { id: "text", type: "text", label: "Heading text", default: "Welcome to our store" },
        { id: "size", type: "select", label: "Size", default: "large", options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "xlarge", label: "Extra Large" },
        ]},
      ],
    },
    {
      type: "subheading",
      name: "Subheading",
      limit: 1,
      settings: [
        { id: "text", type: "textarea", label: "Subheading text" },
      ],
    },
    {
      type: "button",
      name: "Button",
      limit: 2,
      settings: [
        { id: "text", type: "text", label: "Button text", default: "Shop now" },
        { id: "link", type: "url", label: "Button link" },
        { id: "style", type: "select", label: "Style", default: "primary", options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
          { value: "outline", label: "Outline" },
        ]},
      ],
    },
    {
      type: "image",
      name: "Image",
      limit: 1,
      settings: [
        { id: "image", type: "image_picker", label: "Image" },
        { id: "alt", type: "text", label: "Alt text" },
      ],
    },
  ],
  settings: [
    { id: "height", type: "select", label: "Section height", default: "large", options: [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
      { value: "full", label: "Full screen" },
    ]},
    { id: "background_image", type: "image_picker", label: "Background image" },
    { id: "overlay_opacity", type: "range", label: "Overlay opacity", default: 0, min: 0, max: 100, step: 5, unit: "%" },
    { id: "text_alignment", type: "select", label: "Text alignment", default: "center", options: [
      { value: "left", label: "Left" },
      { value: "center", label: "Center" },
      { value: "right", label: "Right" },
    ]},
    { id: "color_scheme", type: "select", label: "Color scheme", default: "light", options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ]},
  ],
  presets: [
    {
      name: "Hero with CTA",
      category: "Hero",
      settings: { height: "large", text_alignment: "center" },
      blocks: [
        { type: "heading", settings: { text: "Welcome to our store", size: "large" } },
        { type: "subheading", settings: { text: "Discover amazing products" } },
        { type: "button", settings: { text: "Shop now", style: "primary" } },
      ],
    },
    {
      name: "Hero with Image",
      category: "Hero",
      settings: { height: "full", text_alignment: "left" },
      blocks: [
        { type: "heading", settings: { text: "New Collection", size: "xlarge" } },
        { type: "button", settings: { text: "Explore", style: "outline" } },
      ],
    },
  ],
}

// =============================================================================
// FEATURED COLLECTION SECTION SCHEMA
// =============================================================================

export const featuredCollectionSchema: SectionSchema = {
  name: "Featured Collection",
  tag: "section",
  class: "featured-collection-section",
  maxBlocks: 12,
  blocks: [
    {
      type: "product",
      name: "Product",
      settings: [
        { id: "product", type: "product", label: "Product" },
        { id: "show_vendor", type: "checkbox", label: "Show vendor", default: false },
        { id: "show_rating", type: "checkbox", label: "Show rating", default: true },
      ],
    },
  ],
  settings: [
    { id: "title", type: "text", label: "Heading", default: "Featured Collection" },
    { id: "collection", type: "collection", label: "Collection" },
    { id: "products_to_show", type: "range", label: "Products to show", default: 4, min: 2, max: 12, step: 1 },
    { id: "columns_desktop", type: "range", label: "Columns on desktop", default: 4, min: 2, max: 6, step: 1 },
    { id: "show_view_all", type: "checkbox", label: "Show view all button", default: true },
    { id: "enable_quick_add", type: "checkbox", label: "Enable quick add", default: true },
  ],
  presets: [
    {
      name: "Featured Collection",
      category: "Collection",
      settings: { title: "Featured Products", products_to_show: 4, columns_desktop: 4 },
      blocks: [],
    },
  ],
}

// =============================================================================
// RICH TEXT SECTION SCHEMA
// =============================================================================

export const richTextSectionSchema: SectionSchema = {
  name: "Rich Text",
  tag: "section",
  class: "rich-text-section",
  maxBlocks: 6,
  blocks: [
    {
      type: "heading",
      name: "Heading",
      limit: 1,
      settings: [
        { id: "text", type: "text", label: "Heading" },
        { id: "size", type: "select", label: "Size", default: "medium", options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ]},
      ],
    },
    {
      type: "text",
      name: "Text",
      settings: [
        { id: "text", type: "richtext", label: "Text" },
      ],
    },
    {
      type: "button",
      name: "Button",
      limit: 2,
      settings: [
        { id: "text", type: "text", label: "Button text" },
        { id: "link", type: "url", label: "Button link" },
        { id: "style", type: "select", label: "Style", default: "primary", options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
          { value: "link", label: "Link" },
        ]},
      ],
    },
  ],
  settings: [
    { id: "content_alignment", type: "select", label: "Content alignment", default: "center", options: [
      { value: "left", label: "Left" },
      { value: "center", label: "Center" },
      { value: "right", label: "Right" },
    ]},
    { id: "narrow_content", type: "checkbox", label: "Narrow content width", default: true },
    { id: "background_color", type: "color_background", label: "Background color" },
    { id: "padding_top", type: "range", label: "Top padding", default: 40, min: 0, max: 100, step: 4, unit: "px" },
    { id: "padding_bottom", type: "range", label: "Bottom padding", default: 40, min: 0, max: 100, step: 4, unit: "px" },
  ],
  presets: [
    {
      name: "Rich Text",
      category: "Text",
      settings: { content_alignment: "center", narrow_content: true },
      blocks: [
        { type: "heading", settings: { text: "Talk about your brand", size: "medium" } },
        { type: "text", settings: { text: "<p>Share information about your brand with your customers.</p>" } },
      ],
    },
  ],
}

// =============================================================================
// IMAGE WITH TEXT SECTION SCHEMA
// =============================================================================

export const imageWithTextSchema: SectionSchema = {
  name: "Image with Text",
  tag: "section",
  class: "image-with-text-section",
  maxBlocks: 4,
  blocks: [
    {
      type: "heading",
      name: "Heading",
      limit: 1,
      settings: [
        { id: "text", type: "text", label: "Heading" },
      ],
    },
    {
      type: "text",
      name: "Text",
      limit: 1,
      settings: [
        { id: "text", type: "richtext", label: "Text" },
      ],
    },
    {
      type: "button",
      name: "Button",
      limit: 1,
      settings: [
        { id: "text", type: "text", label: "Button text" },
        { id: "link", type: "url", label: "Button link" },
      ],
    },
  ],
  settings: [
    { id: "image", type: "image_picker", label: "Image" },
    { id: "image_position", type: "select", label: "Image position", default: "left", options: [
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
    ]},
    { id: "image_width", type: "select", label: "Image width", default: "medium", options: [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ]},
    { id: "content_alignment", type: "select", label: "Content alignment", default: "left", options: [
      { value: "left", label: "Left" },
      { value: "center", label: "Center" },
    ]},
    { id: "background_color", type: "color_background", label: "Background color" },
  ],
  presets: [
    {
      name: "Image with Text",
      category: "Image",
      settings: { image_position: "left", image_width: "medium" },
      blocks: [
        { type: "heading", settings: { text: "Image with text" } },
        { type: "text", settings: { text: "<p>Pair text with an image to focus on your chosen product, collection, or blog post.</p>" } },
        { type: "button", settings: { text: "Button label" } },
      ],
    },
  ],
}

// =============================================================================
// MULTICOLUMN SECTION SCHEMA
// =============================================================================

export const multicolumnSchema: SectionSchema = {
  name: "Multicolumn",
  tag: "section",
  class: "multicolumn-section",
  maxBlocks: 6,
  blocks: [
    {
      type: "column",
      name: "Column",
      settings: [
        { id: "image", type: "image_picker", label: "Image" },
        { id: "title", type: "text", label: "Heading" },
        { id: "text", type: "richtext", label: "Text" },
        { id: "link_text", type: "text", label: "Link text" },
        { id: "link_url", type: "url", label: "Link URL" },
      ],
    },
  ],
  settings: [
    { id: "title", type: "text", label: "Heading" },
    { id: "columns_desktop", type: "range", label: "Columns on desktop", default: 3, min: 2, max: 6, step: 1 },
    { id: "image_ratio", type: "select", label: "Image ratio", default: "square", options: [
      { value: "portrait", label: "Portrait" },
      { value: "square", label: "Square" },
      { value: "landscape", label: "Landscape" },
    ]},
    { id: "content_alignment", type: "select", label: "Content alignment", default: "left", options: [
      { value: "left", label: "Left" },
      { value: "center", label: "Center" },
    ]},
    { id: "background_color", type: "color_background", label: "Background color" },
  ],
  presets: [
    {
      name: "Multicolumn",
      category: "Text",
      settings: { title: "Multicolumn", columns_desktop: 3 },
      blocks: [
        { type: "column", settings: { title: "Column 1", text: "<p>Pair text with an image.</p>" } },
        { type: "column", settings: { title: "Column 2", text: "<p>Pair text with an image.</p>" } },
        { type: "column", settings: { title: "Column 3", text: "<p>Pair text with an image.</p>" } },
      ],
    },
  ],
}

// =============================================================================
// TESTIMONIALS SECTION SCHEMA
// =============================================================================

export const testimonialsSectionSchema: SectionSchema = {
  name: "Testimonials",
  tag: "section",
  class: "testimonials-section",
  maxBlocks: 9,
  blocks: [
    {
      type: "testimonial",
      name: "Testimonial",
      settings: [
        { id: "quote", type: "textarea", label: "Quote" },
        { id: "author", type: "text", label: "Author" },
        { id: "author_title", type: "text", label: "Author title" },
        { id: "avatar", type: "image_picker", label: "Avatar" },
        { id: "rating", type: "range", label: "Rating", default: 5, min: 1, max: 5, step: 1 },
      ],
    },
  ],
  settings: [
    { id: "title", type: "text", label: "Heading", default: "What our customers say" },
    { id: "layout", type: "select", label: "Layout", default: "carousel", options: [
      { value: "carousel", label: "Carousel" },
      { value: "grid", label: "Grid" },
    ]},
    { id: "columns_desktop", type: "range", label: "Columns on desktop", default: 3, min: 1, max: 4, step: 1 },
    { id: "show_rating", type: "checkbox", label: "Show rating", default: true },
    { id: "background_color", type: "color_background", label: "Background color" },
  ],
  presets: [
    {
      name: "Testimonials",
      category: "Social proof",
      settings: { title: "What our customers say", layout: "carousel" },
      blocks: [
        { type: "testimonial", settings: { quote: "Amazing product!", author: "John D.", rating: 5 } },
        { type: "testimonial", settings: { quote: "Best purchase ever.", author: "Sarah M.", rating: 5 } },
        { type: "testimonial", settings: { quote: "Highly recommend!", author: "Mike R.", rating: 5 } },
      ],
    },
  ],
}

// =============================================================================
// NEWSLETTER SECTION SCHEMA
// =============================================================================

export const newsletterSectionSchema: SectionSchema = {
  name: "Newsletter",
  tag: "section",
  class: "newsletter-section",
  maxBlocks: 0,
  blocks: [],
  settings: [
    { id: "heading", type: "text", label: "Heading", default: "Subscribe to our newsletter" },
    { id: "subheading", type: "textarea", label: "Subheading" },
    { id: "button_text", type: "text", label: "Button text", default: "Subscribe" },
    { id: "show_name_field", type: "checkbox", label: "Show name field", default: false },
    { id: "success_message", type: "text", label: "Success message", default: "Thanks for subscribing!" },
    { id: "background_color", type: "color_background", label: "Background color" },
    { id: "background_image", type: "image_picker", label: "Background image" },
  ],
  presets: [
    {
      name: "Newsletter",
      category: "Newsletter",
      settings: { heading: "Subscribe to our newsletter" },
      blocks: [],
    },
  ],
}

// =============================================================================
// CUSTOM CONTENT SECTION SCHEMA (Wix-like flexibility)
// =============================================================================

export const customContentSchema: SectionSchema = {
  name: "Custom Content",
  tag: "section",
  class: "custom-content-section",
  maxBlocks: 20,
  blocks: [
    {
      type: "text",
      name: "Text",
      settings: [
        { id: "content", type: "richtext", label: "Content" },
      ],
    },
    {
      type: "image",
      name: "Image",
      settings: [
        { id: "image", type: "image_picker", label: "Image" },
        { id: "alt", type: "text", label: "Alt text" },
        { id: "link", type: "url", label: "Link" },
      ],
    },
    {
      type: "button",
      name: "Button",
      settings: [
        { id: "text", type: "text", label: "Button text" },
        { id: "link", type: "url", label: "Link" },
        { id: "style", type: "select", label: "Style", default: "primary", options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
          { value: "outline", label: "Outline" },
        ]},
      ],
    },
    {
      type: "video",
      name: "Video",
      settings: [
        { id: "url", type: "video_url", label: "Video URL" },
        { id: "autoplay", type: "checkbox", label: "Autoplay", default: false },
      ],
    },
    {
      type: "spacer",
      name: "Spacer",
      settings: [
        { id: "height", type: "range", label: "Height", default: 40, min: 10, max: 200, step: 10, unit: "px" },
      ],
    },
    {
      type: "divider",
      name: "Divider",
      settings: [
        { id: "style", type: "select", label: "Style", default: "solid", options: [
          { value: "solid", label: "Solid" },
          { value: "dashed", label: "Dashed" },
          { value: "dotted", label: "Dotted" },
        ]},
      ],
    },
    {
      type: "html",
      name: "Custom HTML",
      settings: [
        { id: "html", type: "html", label: "HTML code" },
      ],
    },
  ],
  settings: [
    { id: "layout_mode", type: "select", label: "Layout mode", default: "stack", options: [
      { value: "stack", label: "Stack (vertical)" },
      { value: "grid", label: "Grid" },
      { value: "flex", label: "Flex" },
      { value: "absolute", label: "Freeform (absolute)" },
    ]},
    { id: "columns", type: "range", label: "Grid columns", default: 2, min: 1, max: 6, step: 1, info: "Only applies to grid layout" },
    { id: "gap", type: "range", label: "Gap", default: 24, min: 0, max: 100, step: 4, unit: "px" },
    { id: "min_height", type: "range", label: "Minimum height", default: 0, min: 0, max: 1000, step: 50, unit: "px" },
    { id: "background_color", type: "color_background", label: "Background color" },
    { id: "background_image", type: "image_picker", label: "Background image" },
    { id: "padding", type: "range", label: "Padding", default: 40, min: 0, max: 100, step: 4, unit: "px" },
  ],
  presets: [
    {
      name: "Custom Content - Stack",
      category: "Custom",
      settings: { layout_mode: "stack", gap: 24 },
      blocks: [],
    },
    {
      name: "Custom Content - Grid",
      category: "Custom",
      settings: { layout_mode: "grid", columns: 2, gap: 24 },
      blocks: [],
    },
    {
      name: "Custom Content - Freeform",
      category: "Custom",
      settings: { layout_mode: "absolute", min_height: 600 },
      blocks: [],
    },
  ],
}

// =============================================================================
// SCHEMA REGISTRY
// =============================================================================

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero: heroSectionSchema,
  "featured-collection": featuredCollectionSchema,
  "rich-text": richTextSectionSchema,
  "image-with-text": imageWithTextSchema,
  multicolumn: multicolumnSchema,
  testimonials: testimonialsSectionSchema,
  newsletter: newsletterSectionSchema,
  "custom-content": customContentSchema,
}

/**
 * Get all available section presets
 */
export function getAllSectionPresets(): Array<SectionPreset & { sectionType: string }> {
  const presets: Array<SectionPreset & { sectionType: string }> = []
  
  for (const [sectionType, schema] of Object.entries(SECTION_SCHEMAS)) {
    if (schema.presets) {
      for (const preset of schema.presets) {
        presets.push({ ...preset, sectionType })
      }
    }
  }
  
  return presets
}

/**
 * Get section schema by type
 */
export function getSectionSchema(type: string): SectionSchema | undefined {
  return SECTION_SCHEMAS[type]
}
