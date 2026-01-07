/**
 * SEO & Meta Management Type Definitions
 * Per-page SEO configuration with schema markup generation
 */

// Open Graph types
export type OGType = "website" | "article" | "product" | "profile";

// Twitter card types
export type TwitterCardType = "summary" | "summary_large_image" | "app" | "player";

// Schema.org types for ecommerce
export type SchemaType =
  | "Organization"
  | "WebSite"
  | "WebPage"
  | "Product"
  | "FAQPage"
  | "BreadcrumbList"
  | "LocalBusiness"
  | "Article"
  | "CollectionPage"
  | "ItemList";

// Basic meta tags
export interface MetaTags {
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  robots?: {
    index: boolean;
    follow: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    noimageindex?: boolean;
  };
  canonicalUrl?: string;
  alternateLanguages?: Array<{
    hreflang: string;
    href: string;
  }>;
}

// Open Graph meta tags
export interface OpenGraphMeta {
  type: OGType;
  title?: string; // Falls back to meta title
  description?: string; // Falls back to meta description
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  url?: string;
  siteName?: string;
  locale?: string;
  // Product-specific
  price?: string;
  currency?: string;
  availability?: "in stock" | "out of stock" | "preorder";
}

// Twitter card meta tags
export interface TwitterMeta {
  card: TwitterCardType;
  site?: string; // @username
  creator?: string; // @username
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

// Schema.org structured data
export interface SchemaMarkup {
  type: SchemaType;
  data: Record<string, unknown>;
}

// Organization schema
export interface OrganizationSchema {
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[]; // Social media links
  contactPoint?: {
    "@type": "ContactPoint";
    telephone?: string;
    email?: string;
    contactType: string;
  };
}

// Product schema
export interface ProductSchema {
  "@type": "Product";
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  brand?: {
    "@type": "Brand";
    name: string;
  };
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
    url?: string;
    priceValidUntil?: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

// FAQ schema
export interface FAQSchema {
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

// Breadcrumb schema
export interface BreadcrumbSchema {
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

// Complete page SEO configuration
export interface PageSEO {
  meta: MetaTags;
  openGraph: OpenGraphMeta;
  twitter: TwitterMeta;
  schemas: SchemaMarkup[];
  // Advanced settings
  structuredData?: Record<string, unknown>; // Custom JSON-LD
  preconnect?: string[]; // URLs to preconnect
  prefetch?: string[]; // URLs to prefetch
}

// Default SEO values
export const DEFAULT_META_TAGS: MetaTags = {
  title: "",
  description: "",
  keywords: [],
  robots: {
    index: true,
    follow: true,
  },
};

export const DEFAULT_OPEN_GRAPH: OpenGraphMeta = {
  type: "website",
};

export const DEFAULT_TWITTER: TwitterMeta = {
  card: "summary_large_image",
};

export const DEFAULT_PAGE_SEO: PageSEO = {
  meta: DEFAULT_META_TAGS,
  openGraph: DEFAULT_OPEN_GRAPH,
  twitter: DEFAULT_TWITTER,
  schemas: [],
};

// SEO validation rules
export const SEO_LIMITS = {
  title: {
    min: 30,
    max: 60,
    recommended: 55,
  },
  description: {
    min: 120,
    max: 160,
    recommended: 155,
  },
  keywords: {
    max: 10,
  },
};

// SEO validation result
export interface SEOValidation {
  field: string;
  status: "good" | "warning" | "error";
  message: string;
  value?: number;
  limit?: number;
}

// Validate SEO fields
export function validateSEO(seo: PageSEO): SEOValidation[] {
  const validations: SEOValidation[] = [];

  // Title validation
  const titleLength = seo.meta.title.length;
  if (titleLength === 0) {
    validations.push({
      field: "title",
      status: "error",
      message: "Title is required for SEO",
      value: titleLength,
    });
  } else if (titleLength < SEO_LIMITS.title.min) {
    validations.push({
      field: "title",
      status: "warning",
      message: `Title is too short (${titleLength}/${SEO_LIMITS.title.min} min)`,
      value: titleLength,
      limit: SEO_LIMITS.title.min,
    });
  } else if (titleLength > SEO_LIMITS.title.max) {
    validations.push({
      field: "title",
      status: "warning",
      message: `Title may be truncated (${titleLength}/${SEO_LIMITS.title.max} max)`,
      value: titleLength,
      limit: SEO_LIMITS.title.max,
    });
  } else {
    validations.push({
      field: "title",
      status: "good",
      message: "Title length is optimal",
      value: titleLength,
    });
  }

  // Description validation
  const descLength = seo.meta.description.length;
  if (descLength === 0) {
    validations.push({
      field: "description",
      status: "error",
      message: "Description is required for SEO",
      value: descLength,
    });
  } else if (descLength < SEO_LIMITS.description.min) {
    validations.push({
      field: "description",
      status: "warning",
      message: `Description is too short (${descLength}/${SEO_LIMITS.description.min} min)`,
      value: descLength,
      limit: SEO_LIMITS.description.min,
    });
  } else if (descLength > SEO_LIMITS.description.max) {
    validations.push({
      field: "description",
      status: "warning",
      message: `Description may be truncated (${descLength}/${SEO_LIMITS.description.max} max)`,
      value: descLength,
      limit: SEO_LIMITS.description.max,
    });
  } else {
    validations.push({
      field: "description",
      status: "good",
      message: "Description length is optimal",
      value: descLength,
    });
  }

  // OG Image validation
  if (!seo.openGraph.image) {
    validations.push({
      field: "ogImage",
      status: "warning",
      message: "Adding an OG image improves social sharing",
    });
  } else {
    validations.push({
      field: "ogImage",
      status: "good",
      message: "OG image is set",
    });
  }

  return validations;
}

// Generate JSON-LD script content
export function generateJSONLD(schemas: SchemaMarkup[]): string {
  if (schemas.length === 0) return "";

  const jsonLD = schemas.map((schema) => ({
    "@context": "https://schema.org",
    ...schema.data,
  }));

  return JSON.stringify(jsonLD.length === 1 ? jsonLD[0] : jsonLD);
}
