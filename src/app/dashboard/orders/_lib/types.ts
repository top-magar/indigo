// ─── Order List ──────────────────────────────────────────

export interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  total: number;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  currency: string;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
  revenue: number;
  unpaid: number;
  avgOrderValue: number;
  conversionRate: number;
  repeatCustomerRate: number;
}

export interface AIInsight {
  id: string;
  type: "warning" | "opportunity" | "info" | "success";
  title: string;
  description: string;
  action?: { label: string; href: string };
}

// ─── Order Detail ────────────────────────────────────────

export interface OrderAddress {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface OrderCustomer {
  id?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isGuest: boolean;
  totalOrders?: number;
  totalSpent?: number;
}

export interface OrderLine {
  id: string;
  productName: string;
  productSku?: string | null;
  productImage?: string | null;
  quantity: number;
  quantityFulfilled: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderEvent {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user?: string | null;
}

export interface AIAnalysis {
  sentiment?: { score: number; label: "positive" | "neutral" | "negative"; confidence: number };
  riskScore?: number;
  recommendations?: string[];
  suggestedActions?: { label: string; action: string; priority: "high" | "medium" | "low" }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  customer: OrderCustomer;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  lines: OrderLine[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  customerNote?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  events: OrderEvent[];
  tags?: string[];
  aiAnalysis?: AIAnalysis;
}

// ─── Returns ─────────────────────────────────────────────

export type ReturnStatus =
  | "requested" | "approved" | "rejected" | "received"
  | "processing" | "refunded" | "completed" | "cancelled";

export interface ReturnRow {
  id: string;
  return_number: string;
  status: ReturnStatus;
  reason: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  refund_amount: number | null;
  refund_method: string;
  created_at: string;
  order: { id: string; order_number: string; total: number; currency: string } | null;
  customer: { id: string; email: string; first_name: string | null; last_name: string | null } | null;
  return_items: { id: string; quantity: number; order_item: { product_name: string; product_image: string | null; unit_price: number } | null }[];
}

export interface ReturnStats {
  total: number;
  requested: number;
  approved: number;
  processing: number;
  completed: number;
  rejected: number;
  totalRefunded: number;
}

// ─── Draft Orders ────────────────────────────────────────

export interface ProductResult {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  status: string;
}

// ─── Status Configs ──────────────────────────────────────

export const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const PAYMENT_STATUSES = [
  { value: "all", label: "All Payments" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partial" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
] as const;

export const RETURN_STATUSES = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "received", label: "Received" },
  { value: "processing", label: "Processing" },
  { value: "refunded", label: "Refunded" },
  { value: "completed", label: "Completed" },
] as const;

// ─── Payment / Lifecycle ─────────────────────────────────

export type PaymentMethod = "cod" | "esewa" | "khalti" | "stripe" | "bank_transfer" | "fonepay";

export interface OrderTransaction {
  id: string;
  type: "capture" | "refund" | "void";
  method: PaymentMethod | string;
  amount: number;
  status: "pending" | "completed" | "failed";
  reference?: string;
  created_at: string;
}

export interface Fulfillment {
  id: string;
  status: "pending" | "packing" | "ready" | "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "delivery_failed" | "returned";
  tracking_number?: string;
  courier_name?: string;
  rider_name?: string;
  rider_phone?: string;
  shipped_at?: string;
  delivered_at?: string;
  items: { order_item_id: string; quantity: number }[];
}

export function getPaymentMethodLabel(method: PaymentMethod | string): string {
  const labels: Record<string, string> = {
    cod: "Cash on Delivery", esewa: "eSewa", khalti: "Khalti",
    stripe: "Card", bank_transfer: "Bank Transfer", fonepay: "FonePay",
  };
  return labels[method] || method;
}

export function needsAction(order: { status: string; payment_status: string; fulfillment_status: string; payment_method?: string; verified_at?: string | null }): string | null {
  if (order.payment_method === "cod" && !order.verified_at && order.status === "pending") return "verify";
  if (order.status === "delivered" && order.payment_status === "pending") return "collect";
  if (order.payment_status === "paid" && order.fulfillment_status === "unfulfilled") return "fulfill";
  return null;
}
