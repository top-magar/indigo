/**
 * JSON-LD Structured Data Components
 * 
 * Provides structured data for search engines and AI to understand page content.
 * Implements Schema.org vocabulary for e-commerce entities.
 * 
 * @see https://nextjs.org/docs/app/guides/json-ld
 * @see https://schema.org/
 */

/**
 * Sanitize string to prevent XSS in JSON-LD
 * Replaces < with unicode equivalent
 */
function sanitizeJsonLd(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj.replace(/</g, '\\u003c')
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeJsonLd)
  }
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeJsonLd(value)
    }
    return sanitized
  }
  return obj
}

/**
 * Render JSON-LD script tag
 */
function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  const sanitizedData = sanitizeJsonLd(data)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(sanitizedData),
      }}
    />
  )
}

// =============================================================================
// ORGANIZATION
// =============================================================================

export interface OrganizationJsonLdProps {
  name: string
  url: string
  logo?: string
  description?: string
  sameAs?: string[] // Social media URLs
  contactPoint?: {
    telephone?: string
    email?: string
    contactType?: string
  }
}

/**
 * Organization structured data
 * Use in root layout for the platform or store layout for individual stores
 */
export function OrganizationJsonLd({
  name,
  url,
  logo,
  description,
  sameAs,
  contactPoint,
}: OrganizationJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
  }

  if (logo) data.logo = logo
  if (description) data.description = description
  if (sameAs?.length) data.sameAs = sameAs
  if (contactPoint) {
    data.contactPoint = {
      '@type': 'ContactPoint',
      ...contactPoint,
    }
  }

  return <JsonLdScript data={data} />
}

// =============================================================================
// WEBSITE
// =============================================================================

export interface WebsiteJsonLdProps {
  name: string
  url: string
  description?: string
  searchUrl?: string // URL template for search, e.g., "https://example.com/search?q={search_term_string}"
}

/**
 * Website structured data with optional search action
 */
export function WebsiteJsonLd({
  name,
  url,
  description,
  searchUrl,
}: WebsiteJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
  }

  if (description) data.description = description
  
  if (searchUrl) {
    data.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    }
  }

  return <JsonLdScript data={data} />
}

// =============================================================================
// PRODUCT
// =============================================================================

export interface ProductJsonLdProps {
  name: string
  description?: string
  image?: string | string[]
  sku?: string
  brand?: string
  price: number
  priceCurrency: string
  availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued'
  url: string
  category?: string
  rating?: {
    ratingValue: number
    reviewCount: number
  }
  offers?: {
    price: number
    priceCurrency: string
    availability: string
    url: string
    priceValidUntil?: string
    seller?: {
      name: string
      url?: string
    }
  }[]
}

/**
 * Product structured data for product detail pages
 * Helps search engines display rich product snippets
 */
export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  brand,
  price,
  priceCurrency,
  availability,
  url,
  category,
  rating,
  offers,
}: ProductJsonLdProps) {
  const availabilityUrl = `https://schema.org/${availability}`
  
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
    offers: offers?.length ? offers.map(offer => ({
      '@type': 'Offer',
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      availability: `https://schema.org/${offer.availability}`,
      url: offer.url,
      priceValidUntil: offer.priceValidUntil,
      seller: offer.seller ? {
        '@type': 'Organization',
        name: offer.seller.name,
        url: offer.seller.url,
      } : undefined,
    })) : {
      '@type': 'Offer',
      price,
      priceCurrency,
      availability: availabilityUrl,
      url,
    },
  }

  if (description) data.description = description
  if (image) data.image = image
  if (sku) data.sku = sku
  if (brand) {
    data.brand = {
      '@type': 'Brand',
      name: brand,
    }
  }
  if (category) data.category = category
  if (rating) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.ratingValue,
      reviewCount: rating.reviewCount,
    }
  }

  return <JsonLdScript data={data} />
}

// =============================================================================
// BREADCRUMB
// =============================================================================

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb structured data
 * Helps search engines understand site hierarchy
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <JsonLdScript data={data} />
}

// =============================================================================
// LOCAL BUSINESS / STORE
// =============================================================================

export interface LocalBusinessJsonLdProps {
  name: string
  description?: string
  url: string
  logo?: string
  image?: string | string[]
  telephone?: string
  email?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: string[] // e.g., ["Mo-Fr 09:00-17:00", "Sa 10:00-14:00"]
  priceRange?: string // e.g., "$$"
}

/**
 * Local Business / Store structured data
 * Use for stores with physical locations
 */
export function LocalBusinessJsonLd({
  name,
  description,
  url,
  logo,
  image,
  telephone,
  email,
  address,
  geo,
  openingHours,
  priceRange,
}: LocalBusinessJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name,
    url,
  }

  if (description) data.description = description
  if (logo) data.logo = logo
  if (image) data.image = image
  if (telephone) data.telephone = telephone
  if (email) data.email = email
  if (priceRange) data.priceRange = priceRange
  if (openingHours) data.openingHoursSpecification = openingHours
  
  if (address) {
    data.address = {
      '@type': 'PostalAddress',
      ...address,
    }
  }
  
  if (geo) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    }
  }

  return <JsonLdScript data={data} />
}

// =============================================================================
// ITEM LIST (Product Collection)
// =============================================================================

export interface ItemListJsonLdProps {
  name: string
  description?: string
  url: string
  items: {
    name: string
    url: string
    image?: string
    position: number
  }[]
}

/**
 * ItemList structured data for product collections/categories
 */
export function ItemListJsonLd({
  name,
  description,
  url,
  items,
}: ItemListJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
      image: item.image,
    })),
  }

  if (description) data.description = description

  return <JsonLdScript data={data} />
}

// =============================================================================
// FAQ
// =============================================================================

export interface FAQJsonLdProps {
  questions: {
    question: string
    answer: string
  }[]
}

/**
 * FAQ structured data
 * Use on FAQ pages or product pages with Q&A sections
 */
export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }

  return <JsonLdScript data={data} />
}
