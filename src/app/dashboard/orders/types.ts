// Re-export from consolidated types — backward compatibility
export {
  type OrderRow,
  type OrderStats,
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

export interface OrdersClientProps {
  orders: import("./_lib/types").OrderRow[];
  stats: import("./_lib/types").OrderStats;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currency: string;
  filters?: {
    status?: string;
    payment?: string;
    search?: string;
    from?: string;
    to?: string;
  };
}
