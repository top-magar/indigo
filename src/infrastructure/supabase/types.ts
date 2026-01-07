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

// Collections - for grouping products (e.g., "Summer Sale", "Best Sellers", "New Arrivals")
export interface Collection {
  id: string
  tenant_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  conditions: CollectionCondition[] | null // For automatic collections
  type: "manual" | "automatic"
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  products_count?: number
}

export interface CollectionCondition {
  field: "tag" | "category" | "price" | "title" | "vendor"
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than"
  value: string
}

export interface CollectionProduct {
  id: string
  collection_id: string
  product_id: string
  position: number
  created_at: string
  product?: Product
}

// =====================================================
// ADVANCED COMMERCE FEATURES
// =====================================================

// Product Options (Size, Color, Material, etc.)
export interface ProductOption {
  id: string
  tenant_id: string
  product_id: string
  name: string
  position: number
  created_at: string
  updated_at: string
  values?: ProductOptionValue[]
}

export interface ProductOptionValue {
  id: string
  tenant_id: string
  option_id: string
  value: string
  position: number
  created_at: string
}

// Product Variants
export interface ProductVariant {
  id: string
  tenant_id: string
  product_id: string
  title: string
  sku: string | null
  barcode: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  quantity: number
  weight: number | null
  weight_unit: string
  requires_shipping: boolean
  is_default: boolean
  position: number
  image_url: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  option_values?: VariantOptionValue[]
}

export interface VariantOptionValue {
  id: string
  variant_id: string
  option_value_id: string
  created_at: string
  option_value?: ProductOptionValue
}

// Product Tags
export interface ProductTag {
  id: string
  tenant_id: string
  name: string
  slug: string
  created_at: string
}

export interface ProductTagAssignment {
  id: string
  product_id: string
  tag_id: string
  created_at: string
}

// Currencies
export interface Currency {
  code: string
  name: string
  symbol: string
  decimal_places: number
  is_active: boolean
}

export interface TenantCurrency {
  id: string
  tenant_id: string
  currency_code: string
  exchange_rate: number
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  currency?: Currency
}

// Product Prices (Multi-currency)
export interface ProductPrice {
  id: string
  tenant_id: string
  product_id: string | null
  variant_id: string | null
  currency_code: string
  price: number
  compare_at_price: number | null
  created_at: string
  updated_at: string
}

// Shipping Zones
export interface ShippingZone {
  id: string
  tenant_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  countries?: ShippingZoneCountry[]
  rates?: ShippingRate[]
}

export interface ShippingZoneCountry {
  id: string
  zone_id: string
  country_code: string
  country_name: string
  created_at: string
}

export interface ShippingRate {
  id: string
  tenant_id: string
  zone_id: string
  name: string
  description: string | null
  rate_type: "flat" | "weight" | "price" | "item"
  price: number
  min_weight: number | null
  max_weight: number | null
  min_order_total: number | null
  max_order_total: number | null
  price_per_kg: number | null
  price_per_item: number | null
  free_shipping_threshold: number | null
  estimated_days_min: number | null
  estimated_days_max: number | null
  is_active: boolean
  position: number
  created_at: string
  updated_at: string
}

// Customer Groups
export interface CustomerGroup {
  id: string
  tenant_id: string
  name: string
  description: string | null
  discount_percentage: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  members_count?: number
}

export interface CustomerGroupMember {
  id: string
  customer_id: string
  group_id: string
  created_at: string
  customer?: Customer
}

// Returns & Refunds
export type ReturnStatus = 
  | "requested" 
  | "approved" 
  | "rejected" 
  | "received" 
  | "processing" 
  | "refunded" 
  | "completed" 
  | "cancelled"

export type ReturnReason = 
  | "defective" 
  | "wrong_item" 
  | "not_as_described" 
  | "changed_mind" 
  | "damaged_in_shipping" 
  | "other"

export type ItemCondition = "unopened" | "opened" | "damaged" | "defective"

export interface Return {
  id: string
  tenant_id: string
  order_id: string
  customer_id: string | null
  return_number: string
  status: ReturnStatus
  reason: ReturnReason | null
  customer_notes: string | null
  admin_notes: string | null
  refund_amount: number | null
  refund_method: "original" | "store_credit" | "manual"
  shipping_paid_by: "customer" | "store"
  tracking_number: string | null
  received_at: string | null
  refunded_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  items?: ReturnItem[]
  order?: Order
  customer?: Customer
}

export interface ReturnItem {
  id: string
  return_id: string
  order_item_id: string
  quantity: number
  reason: string | null
  condition: ItemCondition
  refund_amount: number | null
  created_at: string
  order_item?: OrderItem
}

// Store Credits
export interface StoreCredit {
  id: string
  tenant_id: string
  customer_id: string
  amount: number
  balance: number
  currency_code: string
  reason: string | null
  source_type: string | null
  source_id: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  transactions?: StoreCreditTransaction[]
}

export interface StoreCreditTransaction {
  id: string
  store_credit_id: string
  type: "credit" | "debit"
  amount: number
  balance_after: number
  order_id: string | null
  notes: string | null
  created_at: string
}
