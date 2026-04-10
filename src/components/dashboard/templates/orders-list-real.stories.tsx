import type { Meta, StoryObj } from "@storybook/react";
import { OrdersListView } from "@/app/dashboard/orders/orders-client";
import type { OrderRow, OrderStats } from "@/app/dashboard/orders/types";

const noop = () => {};

const mockOrders: OrderRow[] = [
  {
    id: "ord-1", order_number: "ORD-1050", status: "processing", payment_status: "paid", fulfillment_status: "unfulfilled",
    customer_id: "c1", customer_name: "Jane Smith", customer_email: "jane@example.com",
    total: 149.97, subtotal: 139.98, shipping_total: 5.99, tax_total: 4.00, currency: "USD",
    items_count: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "ord-2", order_number: "ORD-1049", status: "pending", payment_status: "unpaid", fulfillment_status: "unfulfilled",
    customer_id: "c2", customer_name: "John Doe", customer_email: "john@example.com",
    total: 89.99, subtotal: 79.99, shipping_total: 5.00, tax_total: 5.00, currency: "USD",
    items_count: 1, created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ord-3", order_number: "ORD-1048", status: "completed", payment_status: "paid", fulfillment_status: "fulfilled",
    customer_id: "c3", customer_name: "Alice Johnson", customer_email: "alice@example.com",
    total: 245.00, subtotal: 230.00, shipping_total: 10.00, tax_total: 5.00, currency: "USD",
    items_count: 2, created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockStats: OrderStats = {
  total: 342, pending: 42, processing: 65, shipped: 30, completed: 180, cancelled: 25,
  revenue: 48250, unpaid: 3200, avgOrderValue: 141.08, conversionRate: 3.4, repeatCustomerRate: 35.8,
};

const defaultArgs = {
  orders: mockOrders,
  stats: mockStats,
  totalCount: 342,
  currentPage: 1,
  pageSize: 20,
  currency: "USD",
  searchValue: "",
  onSearchChange: noop,
  filters: {},
  onFilterChange: noop,
  dateRange: {},
  onDateRangeChange: noop,
  onClearFilters: noop,
  isFilterPending: false,
  selectedIds: [] as string[],
  isAllSelected: () => false,
  onToggleSelection: noop,
  onToggleAll: noop,
  onClearSelection: noop,
  onBulkAction: noop,
  onExport: noop,
  onRefresh: noop,
  onPageChange: noop,
  onNavigate: noop,
  isPending: false,
};

const meta: Meta<typeof OrdersListView> = {
  component: OrdersListView,
  title: "Pages/Dashboard/Orders List (Real)",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof OrdersListView>;

export const Default: Story = { args: defaultArgs };

export const Empty: Story = {
  args: { ...defaultArgs, orders: [], totalCount: 0, stats: { ...mockStats, total: 0, revenue: 0 } },
};

export const WithSelection: Story = {
  args: { ...defaultArgs, selectedIds: ["ord-1", "ord-2"] },
};
