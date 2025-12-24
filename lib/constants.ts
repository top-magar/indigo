/**
 * Application constants
 */

// Stock thresholds
export const LOW_STOCK_THRESHOLD = 10;
export const OUT_OF_STOCK_THRESHOLD = 0;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Order statuses with labels and colors
export const ORDER_STATUSES = {
    pending: {
        label: "Pending",
        color: "chart-4",
        description: "Order received, awaiting processing",
    },
    processing: {
        label: "Processing",
        color: "chart-1",
        description: "Order is being prepared",
    },
    shipped: {
        label: "Shipped",
        color: "chart-3",
        description: "Order has been shipped",
    },
    completed: {
        label: "Completed",
        color: "chart-2",
        description: "Order delivered successfully",
    },
    cancelled: {
        label: "Cancelled",
        color: "destructive",
        description: "Order was cancelled",
    },
} as const;

// Stock statuses
export const STOCK_STATUSES = {
    in: {
        label: "In Stock",
        color: "chart-2",
    },
    low: {
        label: "Low Stock",
        color: "chart-4",
    },
    out: {
        label: "Out of Stock",
        color: "destructive",
    },
} as const;

// Plan features
export const PLAN_FEATURES = {
    free: {
        name: "Free",
        products: 10,
        orders: 50,
        storage: "100MB",
        support: "Community",
    },
    trial: {
        name: "Pro Trial",
        products: "Unlimited",
        orders: "Unlimited",
        storage: "10GB",
        support: "Priority",
        trialDays: 14,
    },
    pro: {
        name: "Pro",
        products: "Unlimited",
        orders: "Unlimited",
        storage: "50GB",
        support: "Priority",
        price: 2999, // NPR per month
    },
} as const;

// Date format options
export const DATE_FORMATS = {
    short: { month: "short", day: "numeric" } as const,
    medium: { month: "short", day: "numeric", year: "numeric" } as const,
    long: { weekday: "long", month: "long", day: "numeric", year: "numeric" } as const,
    time: { hour: "numeric", minute: "2-digit" } as const,
    datetime: { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" } as const,
};

// API routes
export const API_ROUTES = {
    dashboard: {
        stats: "/api/dashboard/stats",
    },
    public: {
        products: "/api/public/products",
        checkout: "/api/public/checkout",
    },
    onboarding: "/api/onboarding",
} as const;

// Navigation routes
export const ROUTES = {
    home: "/",
    login: "/login",
    dashboard: {
        home: "/dashboard",
        orders: "/dashboard/orders",
        products: "/dashboard/products",
        newProduct: "/dashboard/products/new",
    },
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
    search: "k",
    newProduct: "n",
    toggleSidebar: "b",
    settings: ",",
} as const;
