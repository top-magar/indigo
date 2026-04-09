/**
 * Cookie utilities for storefront
 * Inspired by Medusa's cookie management pattern
 */
import "server-only"
import { cookies } from "next/headers"

// Cookie names
const CART_COOKIE = "_indigo_cart_id"
const CACHE_ID_COOKIE = "_indigo_cache_id"

/**
 * Get cart ID from cookie
 */
export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value
}

/**
 * Set cart ID cookie
 */
export async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, cartId, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

/**
 * Remove cart ID cookie
 */
export async function removeCartId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, "", {
    maxAge: -1,
    path: "/",
  })
}

/**
 * Get or create cache ID for per-user cache tags
 */
export async function getCacheId(): Promise<string> {
  const cookieStore = await cookies()
  let cacheId = cookieStore.get(CACHE_ID_COOKIE)?.value

  if (!cacheId) {
    cacheId = crypto.randomUUID()
    cookieStore.set(CACHE_ID_COOKIE, cacheId, {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  }

  return cacheId
}

/**
 * Generate a cache tag with tenant and cache ID scope
 * This allows per-tenant, per-user cache invalidation
 */
export async function getCacheTag(tag: string, tenantId?: string): Promise<string> {
  const cacheId = await getCacheId()
  if (tenantId) {
    return `${tag}-${tenantId}-${cacheId}`
  }
  return `${tag}-${cacheId}`
}

/**
 * Get cache options for fetch/query
 */
export async function getCacheOptions(tag: string, tenantId?: string): Promise<{ tags: string[] }> {
  const cacheTag = await getCacheTag(tag, tenantId)
  return { tags: [cacheTag] }
}
