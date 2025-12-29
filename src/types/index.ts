/**
 * Common types used across the application
 */

// Order status types
export type OrderStatus = 
    | "pending" 
    | "processing" 
    | "shipped" 
    | "completed" 
    | "cancelled";

// Stock status types
export type StockStatus = "in" | "low" | "out";

// Plan types for subscription
export type PlanType = "free" | "trial" | "pro";

// Database entity types (inferred from schema)
export type { 
    // Re-export from schema if needed
} from "@/db/schema";

// API response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Pagination types
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Form action result types
export interface ActionResult {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
}

// Dashboard stats types
export interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalProducts: number;
    conversionRate: number;
    profit: number;
}

// Chart data types
export interface ChartDataPoint {
    date: string;
    current: number;
    previous?: number;
}

// Navigation item types
export interface NavItem {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    disabled?: boolean;
    external?: boolean;
    children?: NavItem[];
}
