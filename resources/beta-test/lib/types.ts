export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  description: string | null
  currency: string
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  tenant_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "owner" | "admin" | "staff"
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  tenant_id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  quantity: number
  track_quantity: boolean
  allow_backorder: boolean
  weight: number | null
  weight_unit: string
  status: "draft" | "active" | "archived"
  images: ProductImage[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  category?: Category
}

export interface ProductImage {
  url: string
  alt: string
  position: number
}

export interface Customer {
  id: string
  tenant_id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  accepts_marketing: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  customer_id: string
  tenant_id: string
  type: "shipping" | "billing"
  first_name: string | null
  last_name: string | null
  company: string | null
  address_line1: string
  address_line2: string | null
  city: string
  state: string | null
  postal_code: string | null
  country: string
  phone: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  tenant_id: string
  customer_id: string | null
  order_number: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  payment_status: "pending" | "paid" | "partially_refunded" | "refunded" | "failed"
  fulfillment_status: "unfulfilled" | "partially_fulfilled" | "fulfilled"
  subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number
  currency: string
  shipping_address: AddressData | null
  billing_address: AddressData | null
  customer_email: string | null
  customer_name: string | null
  notes: string | null
  stripe_payment_intent_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  items?: OrderItem[]
  customer?: Customer
}

export interface AddressData {
  first_name: string
  last_name: string
  company?: string
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code?: string
  country: string
  phone?: string
}

export interface OrderItem {
  id: string
  order_id: string
  tenant_id: string
  product_id: string | null
  product_name: string
  product_sku: string | null
  product_image: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  total: number
}
