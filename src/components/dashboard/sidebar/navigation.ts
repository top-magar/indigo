import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    Settings,
    Percent,
    Users,
    Layers,
    Tag,
    Image,
    Paintbrush,
    Filter,
} from "lucide-react";
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
                    icon: LayoutDashboard,
                    keywords: ["home", "overview", "stats", "metrics"],
                },
                {
                    id: "orders",
                    title: "Orders",
                    href: "/dashboard/orders",
                    icon: ShoppingCart,
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
                    icon: Tag,
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
                    icon: Layers,
                    badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
                    badgeVariant: counts.lowStock > 0 ? "warning" : undefined,
                    keywords: ["stock", "warehouse", "quantity", "tracking"],
                },
                {
                    id: "attributes",
                    title: "Attributes",
                    href: "/dashboard/attributes",
                    icon: Filter,
                    keywords: ["size", "color", "material", "properties", "custom fields", "variants"],
                },
            ],
        },
        {
            id: "content",
            label: "Content",
            items: [
                {
                    id: "storefront",
                    title: "Storefront Editor",
                    href: "/storefront",
                    icon: Paintbrush,
                    external: true,
                    keywords: ["design", "theme", "customize", "visual", "editor", "layout", "branding"],
                },
                {
                    id: "media",
                    title: "Media",
                    href: "/dashboard/media",
                    icon: Image,
                    keywords: ["images", "files", "uploads", "assets", "photos", "videos", "library"],
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
                    icon: Users,
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
                    icon: Percent,
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
                    icon: TrendingUp,
                    keywords: ["reports", "insights", "metrics", "performance", "revenue"],
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
                    icon: Settings,
                    keywords: ["preferences", "config", "options", "general", "branding", "seo", "checkout", "account", "team", "notifications", "shipping", "payments", "domains"],
                    children: [
                        // Store
                        { id: "store-settings", title: "Store", href: "/dashboard/settings", group: "store" },
                        // Commerce
                        { id: "payments", title: "Payments", href: "/dashboard/settings/payments", group: "commerce" },
                        { id: "checkout", title: "Checkout", href: "/dashboard/settings/checkout", group: "commerce" },
                        { id: "shipping", title: "Shipping", href: "/dashboard/settings/shipping", group: "commerce" },
                        // Team & Account
                        { id: "account", title: "Account", href: "/dashboard/settings/account", group: "team" },
                        { id: "team", title: "Team", href: "/dashboard/settings/team", group: "team" },
                        // Advanced
                        { id: "domains", title: "Domains", href: "/dashboard/settings/domains", group: "advanced" },
                        { id: "notifications", title: "Notifications", href: "/dashboard/settings/notifications", group: "advanced" },
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
