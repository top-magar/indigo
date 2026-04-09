import {
    LayoutDashboard,
    ShoppingCart,
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
                    keywords: ["sales", "purchases", "returns", "refunds", "fulfillment"],
                },
                {
                    id: "products",
                    title: "Products",
                    href: "/dashboard/products",
                    icon: Tag,
                    badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
                    badgeVariant: counts.lowStock > 0 ? "warning" : undefined,
                    keywords: ["items", "goods", "sku", "inventory", "stock", "collections", "categories"],
                    children: [
                        { id: "products-list", title: "All Products", href: "/dashboard/products" },
                        { id: "categories", title: "Categories", href: "/dashboard/categories" },
                        { id: "collections", title: "Collections", href: "/dashboard/collections" },
                        { id: "inventory", title: "Inventory", href: "/dashboard/inventory" },
                    ],
                },
                {
                    id: "customers",
                    title: "Customers",
                    href: "/dashboard/customers",
                    icon: Users,
                    keywords: ["users", "clients", "buyers"],
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
                    keywords: ["storefront", "editor", "design", "theme", "media", "pages"],
                    children: [
                        { id: "storefront-editor", title: "Storefront Editor", href: "/storefront", external: true },
                        { id: "media", title: "Media Library", href: "/dashboard/media" },
                    ],
                },
                {
                    id: "discounts",
                    title: "Discounts",
                    href: "/dashboard/marketing/discounts",
                    icon: Zap,
                    keywords: ["coupons", "vouchers", "sales", "promotions"],
                },
                {
                    id: "settings",
                    title: "Settings",
                    href: "/dashboard/settings",
                    icon: Settings,
                    keywords: ["preferences", "config", "payments", "shipping", "tax"],
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
