/**
 * Schema.org JSON-LD Generators
 * Functions to generate structured data from block content and configurations
 */

import type {
  SchemaMarkup,
  OrganizationSchema,
  ProductSchema,
  FAQSchema,
  BreadcrumbSchema,
} from './types';

// =============================================================================
// CONFIGURATION INTERFACES
// =============================================================================

export interface OrganizationConfig {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  socialLinks?: string[];
  contactEmail?: string;
  contactPhone?: string;
  contactType?: string;
}

export interface ProductData {
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  brandName?: string;
  price?: string;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued';
  url?: string;
  priceValidUntil?: string;
  ratingValue?: number;
  reviewCount?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

// =============================================================================
// SCHEMA GENERATORS
// =============================================================================

/**
 * Generate Organization schema.org JSON-LD
 */
export function generateOrganizationSchema(
  config: OrganizationConfig
): SchemaMarkup {
  const schema: OrganizationSchema = {
    '@type': 'Organization',
    name: config.name,
    url: config.url,
  };

  if (config.logo) {
    schema.logo = config.logo;
  }

  if (config.description) {
    schema.description = config.description;
  }

  if (config.socialLinks && config.socialLinks.length > 0) {
    schema.sameAs = config.socialLinks;
  }

  if (config.contactEmail || config.contactPhone) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      contactType: config.contactType || 'customer service',
    };

    if (config.contactEmail) {
      schema.contactPoint.email = config.contactEmail;
    }

    if (config.contactPhone) {
      schema.contactPoint.telephone = config.contactPhone;
    }
  }

  return {
    type: 'Organization',
    data: schema as unknown as Record<string, unknown>,
  };
}

/**
 * Generate Product schema.org JSON-LD
 */
export function generateProductSchema(product: ProductData): SchemaMarkup {
  const schema: ProductSchema = {
    '@type': 'Product',
    name: product.name,
  };

  if (product.description) {
    schema.description = product.description;
  }

  if (product.image) {
    schema.image = product.image;
  }

  if (product.sku) {
    schema.sku = product.sku;
  }

  if (product.brandName) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brandName,
    };
  }

  if (product.price && product.currency) {
    const availabilityMap: Record<string, string> = {
      InStock: 'https://schema.org/InStock',
      OutOfStock: 'https://schema.org/OutOfStock',
      PreOrder: 'https://schema.org/PreOrder',
      Discontinued: 'https://schema.org/Discontinued',
    };

    schema.offers = {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.availability
        ? availabilityMap[product.availability]
        : 'https://schema.org/InStock',
    };

    if (product.url) {
      schema.offers.url = product.url;
    }

    if (product.priceValidUntil) {
      schema.offers.priceValidUntil = product.priceValidUntil;
    }
  }

  if (
    product.ratingValue !== undefined &&
    product.reviewCount !== undefined &&
    product.reviewCount > 0
  ) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.ratingValue,
      reviewCount: product.reviewCount,
    };
  }

  return {
    type: 'Product',
    data: schema as unknown as Record<string, unknown>,
  };
}

/**
 * Generate FAQPage schema.org JSON-LD
 */
export function generateFAQSchema(faqs: FAQItem[]): SchemaMarkup {
  const schema: FAQSchema = {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return {
    type: 'FAQPage',
    data: schema as unknown as Record<string, unknown>,
  };
}

/**
 * Generate BreadcrumbList schema.org JSON-LD
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): SchemaMarkup {
  const schema: BreadcrumbSchema = {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };

  return {
    type: 'BreadcrumbList',
    data: schema as unknown as Record<string, unknown>,
  };
}
