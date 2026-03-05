export type DashboardPeriod = "7d" | "30d" | "90d" | "1y";

export interface DashboardStats {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    customers: number;
    customersChange: number;
    avgOrderValue: number;
    avgOrderValueChange: number;
    currency: string;
}
