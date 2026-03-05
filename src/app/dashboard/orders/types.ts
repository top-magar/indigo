// ============================================================================
// Order Types
// ============================================================================

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
  sentiment_score?: number;
  risk_score?: number;
  ai_insights?: string[];
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
  action?: {
    label: string;
    href: string;
  };
}

export interface OrdersClientProps {
  orders: OrderRow[];
  stats: OrderStats;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currency: string;
  aiInsights?: AIInsight[];
  filters?: {
    status?: string;
    payment?: string;
    search?: string;
    from?: string;
    to?: string;
  };
}

// ============================================================================
// Status Configuration
// ============================================================================

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
