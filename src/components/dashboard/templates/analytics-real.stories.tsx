import type { Meta, StoryObj } from "@storybook/react";
import { AnalyticsDashboardView } from "@/app/dashboard/analytics/analytics-client";
import type { AnalyticsData } from "@/app/dashboard/analytics/types";

const mockData: AnalyticsData = {
  overview: {
    revenue: 48250,
    revenueChange: 12.5,
    orders: 342,
    ordersChange: 8.3,
    avgOrderValue: 141.08,
    avgOrderValueChange: 3.9,
    customers: 218,
    customersChange: 15.2,
    conversionRate: 3.4,
    conversionRateChange: 0.5,
    itemsPerOrder: 2.3,
  },
  revenueChart: [
    { date: "2026-04-01", revenue: 1200, orders: 8 },
    { date: "2026-04-02", revenue: 1800, orders: 12 },
    { date: "2026-04-03", revenue: 950, orders: 6 },
    { date: "2026-04-04", revenue: 2100, orders: 15 },
    { date: "2026-04-05", revenue: 1600, orders: 11 },
    { date: "2026-04-06", revenue: 2400, orders: 18 },
    { date: "2026-04-07", revenue: 1900, orders: 13 },
  ],
  topProducts: [
    { id: "p1", name: "Classic T-Shirt", image: null, revenue: 8400, quantity: 280, orders: 195 },
    { id: "p2", name: "Denim Jacket", image: null, revenue: 6300, quantity: 70, orders: 68 },
    { id: "p3", name: "Canvas Sneakers", image: null, revenue: 4500, quantity: 90, orders: 85 },
  ],
  topCategories: [
    { id: "c1", name: "Apparel", revenue: 22000, orders: 180, percentage: 45.6 },
    { id: "c2", name: "Footwear", revenue: 12000, orders: 95, percentage: 24.9 },
    { id: "c3", name: "Accessories", revenue: 8000, orders: 67, percentage: 16.6 },
  ],
  ordersByStatus: [
    { status: "completed", count: 210, percentage: 61.4 },
    { status: "processing", count: 65, percentage: 19.0 },
    { status: "pending", count: 42, percentage: 12.3 },
    { status: "cancelled", count: 25, percentage: 7.3 },
  ],
  customerSegments: [
    { segment: "New", count: 120, revenue: 15000, percentage: 55.0 },
    { segment: "Returning", count: 78, revenue: 25000, percentage: 35.8 },
    { segment: "VIP", count: 20, revenue: 8250, percentage: 9.2 },
  ],
  recentOrders: [
    { id: "o1", order_number: "ORD-1050", total: 89.99, status: "processing", created_at: new Date().toISOString(), customer_name: "Jane Smith" },
    { id: "o2", order_number: "ORD-1049", total: 245.00, status: "completed", created_at: new Date(Date.now() - 3600000).toISOString(), customer_name: "John Doe" },
  ],
};

const emptyData: AnalyticsData = {
  overview: { revenue: 0, revenueChange: 0, orders: 0, ordersChange: 0, avgOrderValue: 0, avgOrderValueChange: 0, customers: 0, customersChange: 0, conversionRate: 0, conversionRateChange: 0, itemsPerOrder: 0 },
  revenueChart: [],
  topProducts: [],
  topCategories: [],
  ordersByStatus: [],
  customerSegments: [],
  recentOrders: [],
};

const meta: Meta<typeof AnalyticsDashboardView> = {
  component: AnalyticsDashboardView,
  title: "Pages/Dashboard/Analytics (Real)",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof AnalyticsDashboardView>;

export const Default: Story = {
  args: { data: mockData, currency: "USD", dateRange: "30d" },
};

export const Empty: Story = {
  args: { data: emptyData, currency: "USD", dateRange: "7d" },
};

export const FreeTier: Story = {
  args: { data: mockData, currency: "USD", dateRange: "30d", isFreeTier: true },
};
