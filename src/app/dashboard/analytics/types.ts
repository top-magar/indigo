export type DateRange = "today" | "7d" | "30d" | "90d" | "12m" | "year" | "custom";

export interface AnalyticsOverview {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    avgOrderValue: number;
    avgOrderValueChange: number;
    customers: number;
    customersChange: number;
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface TopProduct {
    id: string;
    name: string;
    image: string | null;
    revenue: number;
    quantity: number;
}

export interface TopCategory {
    id: string;
    name: string;
    revenue: number;
    orders: number;
    percentage: number;
}

export interface OrdersByStatus {
    status: string;
    count: number;
    percentage: number;
}

export interface CustomerSegment {
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
}

export interface AnalyticsData {
    overview: AnalyticsOverview;
    revenueChart: RevenueDataPoint[];
    topProducts: TopProduct[];
    topCategories: TopCategory[];
    ordersByStatus: OrdersByStatus[];
    customerSegments: CustomerSegment[];
    recentOrders: Array<{
        id: string;
        order_number: string;
        total: number;
        status: string;
        created_at: string;
        customer_name: string | null;
    }>;
}

// Lightweight row types for analytics helper functions (Supabase query results)
export interface OrderRow {
    id: string;
    total: string | number;
    status: string;
    payment_status: string;
    created_at: string;
    customer_id: string | null;
}

export interface OrderItemRow {
    product_id: string | null;
    total_price: string | number;
    quantity: number;
    order_id: string;
}

export interface ProductRow {
    id: string;
    name: string;
    image: string | null;
    images: Array<{ url: string }> | null;
    category_id: string | null;
}

export interface CategoryRow {
    id: string;
    name: string;
}

export interface CustomerRow {
    id: string;
    created_at: string;
}
