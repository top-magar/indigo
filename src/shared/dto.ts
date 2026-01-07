import "server-only"

/**
 * Data Transfer Objects (DTOs)
 * 
 * These types define the safe data shapes that can be passed from
 * Server Components to Client Components. They explicitly exclude
 * sensitive fields like passwords, tokens, and internal IDs.
 * 
 * Following Next.js data security best practices:
 * - Only expose necessary fields to the client
 * - Never include passwords, API keys, or tokens
 * - Use these DTOs when passing data to Client Components
 */

/**
 * Safe user data for client components
 * Excludes: password, password_hash, api_keys, tokens
 */
export interface UserDTO {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: string
  createdAt: string
}

/**
 * Transform raw user data to safe DTO
 */
export function toUserDTO(user: {
  id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  role?: string | null
  created_at?: string | null
}): UserDTO {
  return {
    id: user.id,
    email: user.email || "",
    fullName: user.full_name || null,
    avatarUrl: user.avatar_url || null,
    role: user.role || "user",
    createdAt: user.created_at || new Date().toISOString(),
  }
}

/**
 * Safe tenant data for client components
 * Excludes: stripe_secret_key, api_keys, internal settings
 */
export interface TenantDTO {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  currency: string
  plan: string
}

/**
 * Transform raw tenant data to safe DTO
 */
export function toTenantDTO(tenant: {
  id: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  currency?: string | null
  plan?: string | null
}): TenantDTO {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    description: tenant.description || null,
    logoUrl: tenant.logo_url || null,
    currency: tenant.currency || "USD",
    plan: tenant.plan || "free",
  }
}

/**
 * Safe product data for client components
 * Excludes: cost_price, supplier info, internal notes
 */
export interface ProductDTO {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compareAtPrice: number | null
  images: Array<{ url: string; alt?: string }>
  status: string
  quantity: number
  categoryName: string | null
}

/**
 * Transform raw product data to safe DTO
 */
export function toProductDTO(product: {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number | string
  compare_at_price?: number | string | null
  images?: Array<{ url: string; alt?: string }> | null
  status?: string | null
  quantity?: number | null
  category?: { name: string } | null
}): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || null,
    price: Number(product.price),
    compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
    images: product.images || [],
    status: product.status || "draft",
    quantity: product.quantity || 0,
    categoryName: product.category?.name || null,
  }
}

/**
 * Safe order data for client components
 * Excludes: internal notes, payment tokens, customer PII beyond necessary
 */
export interface OrderDTO {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  subtotal: number
  total: number
  customerName: string
  customerEmail: string
  createdAt: string
  itemCount: number
}

/**
 * Transform raw order data to safe DTO
 */
export function toOrderDTO(order: {
  id: string
  order_number: string
  status: string
  payment_status: string
  fulfillment_status: string
  subtotal: number | string
  total: number | string
  customer_name?: string | null
  customer_email?: string | null
  created_at: string
  items?: Array<unknown>
}): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    customerName: order.customer_name || "Guest",
    customerEmail: order.customer_email || "",
    createdAt: order.created_at,
    itemCount: order.items?.length || 0,
  }
}
