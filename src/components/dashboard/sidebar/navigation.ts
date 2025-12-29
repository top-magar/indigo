import {
    DashboardSquare01Icon,
    ShoppingCart01Icon,
    AnalyticsUpIcon,
    Settings01Icon,
    PercentIcon,
    UserMultipleIcon,
    Layers01Icon,
    Tag01Icon,
} from "@hugeicons/core-free-icons";
import type { NavGroup, NavItem, NavSubItem, UserRole, PlanType } from "./types";

export function createNavigation(counts: {
    pendingOrders: number;
    lowStock: number;
    pendingReturns?: number;
}): NavGroup[] {
    return [
        {
            id: "main",
            label: "Main",
            items: [
                {
                    id: "dashboard",
                    title: "Dashboard",
                    href: "/dashboard",
                    icon: DashboardSquare01Icon,
                    keywords: ["home", "overview", "stats", "metrics"],
                },
                {
                    id: "orders",
                    title: "Orders",
                    href: "/dashboard/orders",
                    icon: ShoppingCart01Icon,
                    badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined,
                    badgeVariant: "warning",
                    keywords: ["sales", "purchases", "transactions", "fulfillment", "returns", "refunds"],
                    children: [
                        { id: "all-orders", title: "All Orders", href: "/dashboard/orders" },
                        { id: "returns", title: "Returns", href: "/dashboard/orders/returns", badge: counts.pendingReturns && counts.pendingReturns > 0 ? `${counts.pendingReturns}` : undefined },
                    ],
                },
            ],
        },
        {
            id: "catalog",
            label: "Catalog",
            items: [
                {
                    id: "products",
                    title: "Products",
                    href: "/dashboard/products",
                    icon: Tag01Icon,
                    keywords: ["items", "goods", "merchandise", "sku"],
                    children: [
                        { id: "all-products", title: "All Products", href: "/dashboard/products" },
                        { id: "collections", title: "Collections", href: "/dashboard/collections" },
                        { id: "categories", title: "Categories", href: "/dashboard/categories" },
                    ],
                },
                {
                    id: "inventory",
                    title: "Inventory",
                    href: "/dashboard/inventory",
                    icon: Layers01Icon,
                    badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
                    badgeVariant: counts.lowStock > 0 ? "warning" : undefined,
                    keywords: ["stock", "warehouse", "quantity", "tracking"],
                },
            ],
        },
        {
            id: "customers",
            label: "Customers",
            items: [
                {
                    id: "customers",
                    title: "Customers",
                    href: "/dashboard/customers",
                    icon: UserMultipleIcon,
                    keywords: ["users", "clients", "buyers", "audience", "groups"],
                    children: [
                        { id: "all-customers", title: "All Customers", href: "/dashboard/customers" },
                        { id: "customer-groups", title: "Groups", href: "/dashboard/customers/groups" },
                    ],
                },
            ],
        },
        {
            id: "promotions",
            label: "Promotions",
            items: [
                {
                    id: "discounts",
                    title: "Discounts",
                    href: "/dashboard/marketing/discounts",
                    icon: PercentIcon,
                    keywords: ["coupons", "promotions", "sales", "offers", "deals"],
                    children: [
                        { id: "all-discounts", title: "All Discounts", href: "/dashboard/marketing/discounts" },
                        { id: "campaigns", title: "Campaigns", href: "/dashboard/marketing/campaigns" },
                    ],
                },
            ],
        },
        {
            id: "insights",
            label: "Insights",
            items: [
                {
                    id: "analytics",
                    title: "Analytics",
                    href: "/dashboard/analytics",
                    icon: AnalyticsUpIcon,
                    keywords: ["reports", "insights", "metrics", "performance", "revenue"],
                    requiredPlan: ["trial", "pro"],
                },
            ],
        },

        {
            id: "settings",
            label: "Settings",
            items: [
                {
                    id: "settings",
                    title: "Settings",
                    href: "/dashboard/settings",
                    icon: Settings01Icon,
                    keywords: ["preferences", "config", "options", "general", "branding", "seo", "checkout", "account", "team", "notifications", "shipping", "payments", "domains"],
                    children: [
                        { id: "store-settings", title: "Store", href: "/dashboard/settings" },
                        { id: "storefront", title: "Storefront", href: "/storefront", external: true },
                        { id: "payments", title: "Payments", href: "/dashboard/settings/payments" },
                        { id: "checkout", title: "Checkout", href: "/dashboard/settings/checkout" },
                        { id: "shipping", title: "Shipping", href: "/dashboard/settings/shipping" },
                        { id: "domains", title: "Domains", href: "/dashboard/settings/domains" },
                        { id: "account", title: "Account", href: "/dashboard/settings/account" },
                        { id: "team", title: "Team", href: "/dashboard/settings/team" },
                        { id: "notifications", title: "Notifications", href: "/dashboard/settings/notifications" },
                    ],
                },
            ],
        },
    ];
}

export function canAccessItem(
    item: NavItem | NavSubItem,
    userRole: UserRole,
    planType: PlanType
): boolean {
    if (item.requiredRole && !item.requiredRole.includes(userRole)) {
        return false;
    }
    if (item.requiredPlan && !item.requiredPlan.includes(planType)) {
        return false;
    }
    return true;
}

export function formatCurrency(value: number, compact = true) {
    if (compact) {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return `${value}`;
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}
