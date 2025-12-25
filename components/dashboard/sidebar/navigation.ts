import {
    DashboardSquare01Icon,
    PackageIcon,
    ShoppingCart01Icon,
    AnalyticsUpIcon,
    Settings01Icon,
    MegaphoneIcon,
    UserMultipleIcon,
    PaintBrush01Icon,
} from "@hugeicons/core-free-icons";
import type { NavGroup, NavItem, NavSubItem, UserRole, PlanType } from "./types";

export function createNavigation(counts: {
    pendingOrders: number;
    lowStock: number;
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
                    keywords: ["sales", "purchases", "transactions", "fulfillment"],
                },
            ],
        },
        {
            id: "catalog",
            label: "Catalog",
            items: [
                {
                    id: "catalog",
                    title: "Catalog",
                    href: "/dashboard/products",
                    icon: PackageIcon,
                    badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
                    badgeVariant: counts.lowStock > 0 ? "warning" : undefined,
                    keywords: ["products", "inventory", "items", "stock", "sku", "categories", "collections", "taxonomy"],
                    children: [
                        { id: "products", title: "Products", href: "/dashboard/products" },
                        { id: "inventory", title: "Inventory", href: "/dashboard/inventory", badge: counts.lowStock > 0 ? `${counts.lowStock}` : undefined },
                        { id: "categories", title: "Categories", href: "/dashboard/categories" },
                        { id: "collections", title: "Collections", href: "/dashboard/collections" },
                    ],
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
                    keywords: ["users", "clients", "buyers", "audience"],
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
                    keywords: ["reports", "insights", "metrics", "performance"],
                    requiredPlan: ["trial", "pro"],
                },
                {
                    id: "marketing",
                    title: "Marketing",
                    href: "/dashboard/marketing",
                    icon: MegaphoneIcon,
                    isNew: true,
                    keywords: ["campaigns", "promotions", "ads", "email", "discounts", "coupons"],
                    children: [
                        { id: "marketing-overview", title: "Overview", href: "/dashboard/marketing" },
                        { id: "discounts", title: "Discounts", href: "/dashboard/marketing/discounts" },
                        { id: "campaigns", title: "Campaigns", href: "/dashboard/marketing/campaigns" },
                    ],
                },
            ],
        },
        {
            id: "storefront",
            label: "Storefront",
            items: [
                {
                    id: "store-editor",
                    title: "Page Builder",
                    href: "/dashboard/puck-editor",
                    icon: PaintBrush01Icon,
                    isNew: true,
                    keywords: ["pages", "design", "customize", "builder", "theme", "layout", "homepage", "puck"],
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
