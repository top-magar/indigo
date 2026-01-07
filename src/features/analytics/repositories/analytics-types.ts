/**
 * Analytics Types
 * 
 * Type definitions for all analytics data structures used in the dashboard.
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 */

// ============================================================================
// Period & Granularity Types
// ============================================================================

/**
 * Predefined time periods for analytics queries
 */
export type AnalyticsPeriod = 'today' | '7d' | '30d' | '90d' | 'year' | 'custom';

/**
 * Granularity for time-series data
 */
export type AnalyticsGranularity = 'hour' | 'day' | 'week' | 'month';

/**
 * Date range for custom period queries
 */
export interface DateRange {
    startDate: Date;
    endDate: Date;
}

// ============================================================================
// Revenue Analytics
// ============================================================================

/**
 * Revenue data point for time-series charts
 */
export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
}

/**
 * Revenue by period response
 */
export interface RevenueByPeriod {
    data: RevenueDataPoint[];
    totals: {
        revenue: number;
        orders: number;
        avgOrderValue: number;
    };
    comparison?: {
        revenue: number;
        revenueChange: number;
        orders: number;
        ordersChange: number;
    };
}

// ============================================================================
// Product Analytics
// ============================================================================

/**
 * Top product performance data
 */
export interface TopProductData {
    id: string;
    name: string;
    sku: string | null;
    imageUrl: string | null;
    revenue: number;
    quantity: number;
    orders: number;
    avgPrice: number;
    revenueShare: number;
}

/**
 * Top products response
 */
export interface TopProductsResponse {
    products: TopProductData[];
    totalRevenue: number;
    totalQuantity: number;
}

// ============================================================================
// Customer Analytics
// ============================================================================

/**
 * Customer segment types
 */
export type CustomerSegmentType = 'new' | 'returning' | 'loyal' | 'vip' | 'at_risk' | 'churned';

/**
 * Customer metrics data
 */
export interface CustomerMetrics {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    avgLifetimeValue: number;
    avgOrdersPerCustomer: number;
    repeatPurchaseRate: number;
    segments: CustomerSegmentData[];
    comparison?: {
        newCustomersChange: number;
        returningCustomersChange: number;
        ltvChange: number;
    };
}

/**
 * Customer segment breakdown
 */
export interface CustomerSegmentData {
    segment: CustomerSegmentType;
    label: string;
    count: number;
    percentage: number;
    revenue: number;
    avgOrderValue: number;
}

// ============================================================================
// Conversion Funnel
// ============================================================================

/**
 * Funnel stage types
 */
export type FunnelStage = 'views' | 'cart' | 'checkout' | 'purchase';

/**
 * Funnel stage data
 */
export interface FunnelStageData {
    stage: FunnelStage;
    label: string;
    count: number;
    value: number;
    conversionRate: number;
    dropoffRate: number;
}

/**
 * Conversion funnel response
 */
export interface ConversionFunnelData {
    stages: FunnelStageData[];
    overallConversionRate: number;
    avgTimeToConvert: number | null;
}

// ============================================================================
// Category Analytics
// ============================================================================

/**
 * Sales by category data
 */
export interface CategorySalesData {
    id: string;
    name: string;
    revenue: number;
    orders: number;
    quantity: number;
    percentage: number;
    avgOrderValue: number;
    productCount: number;
}

/**
 * Sales by category response
 */
export interface SalesByCategoryResponse {
    categories: CategorySalesData[];
    totalRevenue: number;
    uncategorizedRevenue: number;
}

// ============================================================================
// Order Analytics
// ============================================================================

/**
 * Order status types (matching schema)
 */
export type OrderStatusType = 
    | 'pending' 
    | 'confirmed' 
    | 'processing' 
    | 'shipped' 
    | 'delivered' 
    | 'cancelled' 
    | 'returned' 
    | 'refunded';

/**
 * Orders by status data
 */
export interface OrdersByStatusData {
    status: OrderStatusType;
    count: number;
    percentage: number;
    value: number;
}

/**
 * Orders by status response
 */
export interface OrdersByStatusResponse {
    statuses: OrdersByStatusData[];
    totalOrders: number;
    totalValue: number;
}

// ============================================================================
// Dashboard Overview
// ============================================================================

/**
 * Dashboard overview metrics
 */
export interface DashboardOverview {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    avgOrderValue: number;
    avgOrderValueChange: number;
    customers: number;
    customersChange: number;
    conversionRate: number;
    conversionRateChange: number;
    itemsPerOrder: number;
}

// ============================================================================
// Chart Configuration
// ============================================================================

/**
 * Chart color configuration using design system variables
 */
export const CHART_COLORS = {
    primary: 'var(--chart-1)',
    secondary: 'var(--chart-2)',
    tertiary: 'var(--chart-3)',
    quaternary: 'var(--chart-4)',
    quinary: 'var(--chart-5)',
} as const;

/**
 * Status color mapping
 */
export const STATUS_COLORS: Record<OrderStatusType, string> = {
    pending: 'var(--chart-4)',
    confirmed: 'var(--chart-1)',
    processing: 'var(--chart-2)',
    shipped: 'var(--chart-3)',
    delivered: 'var(--chart-2)',
    cancelled: 'var(--destructive)',
    returned: 'var(--chart-5)',
    refunded: 'var(--muted)',
};

/**
 * Segment color mapping
 */
export const SEGMENT_COLORS: Record<CustomerSegmentType, string> = {
    new: 'var(--chart-1)',
    returning: 'var(--chart-2)',
    loyal: 'var(--chart-3)',
    vip: 'var(--chart-4)',
    at_risk: 'var(--chart-5)',
    churned: 'var(--destructive)',
};
