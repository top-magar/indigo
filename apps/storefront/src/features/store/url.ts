/**
 * Generate store-internal URLs that work for both:
 * - Path-based routing: /store/myshop/products
 * - Subdomain routing: myshop.domain.com/products (rewritten to /store/myshop/products)
 *
 * The rewrite in next.config.ts maps subdomain requests to /store/[slug],
 * so Next.js always sees /store/[slug]/... internally. Links using /store/slug/...
 * work for both modes because:
 * - Path-based: browser navigates to /store/slug/products directly
 * - Subdomain: browser navigates to /store/slug/products, but the URL bar shows /products
 *   because Next.js rewrites are transparent to the client
 *
 * This utility exists so we have ONE place to change if the routing strategy changes.
 */
export function storeHref(slug: string, path: string = ""): string {
  const clean = path.startsWith("/") ? path : `/${path}`
  return `/store/${slug}${clean === "/" ? "" : clean}`
}

/** Base URL for a store (for og:url, canonical, etc.) */
export function storeBaseUrl(slug: string): string {
  const domain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
  if (domain && domain !== "localhost:3000" && domain !== "localhost") {
    return `https://${slug}.${domain}`
  }
  return `/store/${slug}`
}
