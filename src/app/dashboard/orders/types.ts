// Re-export from consolidated types — this file exists for backward compatibility
export {
  type OrderRow,
  type OrderStats,
  type AIInsight,
  type Order,
  type OrderAddress,
  type OrderCustomer,
  type OrderLine,
  type OrderEvent,
  type AIAnalysis,
  type ReturnRow,
  type ReturnStats,
  type ProductResult,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  RETURN_STATUSES,
} from "./_lib/types";

// Legacy — OrdersClientProps was only used here
export type { OrderRow as _OrderRow } from "./_lib/types";
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

import type { OrderRow, OrderStats, AIInsight } from "./_lib/types";
