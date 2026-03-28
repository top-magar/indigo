import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    Settings,
    Users,
    Tag,
    Paintbrush,
    Zap,
} from "lucide-react";
import type { NavGroup } from "./types";

export function createNavigation(counts: {
    pendingOrders: number;
    lowStock: number;
}): NavGroup[] {
    return [
        {
            id: "daily",
            label: "",
            items: [
                {
                    id: "home",
                    title: "Home",
                    href: "/dashboard",
                    icon: LayoutDashboard,
                    keywords: ["home", "overview", "dashboard", "stats", "metrics"],
                },
                {
                    id: "orders",
                    title: "Orders",
                    href: "/dashboard/orders",
                    icon: ShoppingCart,
                    badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined,
                    badgeVariant: "warning",
                    keywords: ["sales", "purchases", "returns", "refunds", "abandoned", "fulfillment"],
                },
                {
                    id: "products",
                    title: "Products",
                    href: "/dashboard/products",
                    icon: Tag,
                    badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
                    badgeVariant: counts.lowStock > 0 ? "warning" : undefined,
                    keywords: ["items", "goods", "sku", "inventory", "stock", "collections", "categories", "variants", "attributes", "reviews"],
                },
                {
                    id: "customers",
                    title: "Customers",
                    href: "/dashboard/customers",
                    icon: Users,
                    keywords: ["users", "clients", "buyers", "groups", "segments"],
                },
            ],
        },
        {
            id: "grow",
            label: "Grow",
            items: [
                {
                    id: "marketing",
                    title: "Marketing",
                    href: "/dashboard/marketing",
                    icon: Zap,
                    keywords: ["campaigns", "promotions", "discounts", "coupons", "gift cards", "automations"],
                },
                {
                    id: "analytics",
                    title: "Analytics",
                    href: "/dashboard/analytics",
                    icon: TrendingUp,
                    keywords: ["reports", "metrics", "insights", "revenue", "finances", "payouts"],
                },
            ],
        },
        {
            id: "manage",
            label: "Manage",
            items: [
                {
                    id: "content",
                    title: "Content",
                    href: "/storefront",
                    icon: Paintbrush,
                    external: true,
                    keywords: ["storefront", "editor", "design", "theme", "media", "images", "pages", "cms"],
                    children: [
                        { id: "storefront-editor", title: "Storefront Editor", href: "/storefront", external: true },
                        { id: "media", title: "Media Library", href: "/dashboard/media" },
                        { id: "pages", title: "Pages", href: "/dashboard/pages" },
                    ],
                },
                {
                    id: "settings",
                    title: "Settings",
                    href: "/dashboard/settings",
                    icon: Settings,
                    keywords: ["preferences", "config", "general", "payments", "shipping", "tax", "team", "account", "domains", "notifications"],
                    children: [
                        { id: "store-settings", title: "General", href: "/dashboard/settings" },
                        { id: "account", title: "Account", href: "/dashboard/settings/account" },
                        { id: "team", title: "Team", href: "/dashboard/settings/team" },
                        { id: "payments", title: "Payments", href: "/dashboard/settings/payments" },
                        { id: "checkout", title: "Checkout", href: "/dashboard/settings/checkout" },
                        { id: "shipping", title: "Shipping", href: "/dashboard/settings/shipping" },
                        { id: "tax", title: "Tax", href: "/dashboard/settings/tax" },
                        { id: "currency", title: "Currency", href: "/dashboard/settings/currency" },
                        { id: "domains", title: "Domains", href: "/dashboard/settings/domains" },
                        { id: "notifications", title: "Notifications", href: "/dashboard/settings/notifications" },
                        { id: "storefront", title: "Storefront", href: "/dashboard/settings/storefront" },
                        { id: "ai-services", title: "AI Services", href: "/dashboard/settings/ai-services" },
                    ],
                },
            ],
        },
    ];
}

export function canAccessItem(
    item: { requiredRole?: string[]; requiredPlan?: string[] },
    userRole: string,
    planType: string
): boolean {
    if (item.requiredRole && !item.requiredRole.includes(userRole)) {
        return false;
    }
    if (item.requiredPlan && !item.requiredPlan.includes(planType)) {
        return false;
    }
    return true;
}
