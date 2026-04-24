import {
    LayoutDashboard,
    ShoppingCart,
    Settings,
    Users,
    Tag,
    Store,
    Megaphone,
    BarChart3,
    Star,
    CreditCard,
    Truck,
    Receipt,
    Globe,
    UserCog,
    Bell,
    ShoppingBag,
    Image,
    FileText,
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
                    keywords: ["home", "overview", "dashboard", "stats"],
                },
                {
                    id: "orders",
                    title: "Orders",
                    href: "/dashboard/orders",
                    icon: ShoppingCart,
                    badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined,
                    badgeVariant: "warning",
                    keywords: ["sales", "purchases", "returns", "refunds", "fulfillment"],
                    children: [
                        { id: "orders-list", title: "All Orders", href: "/dashboard/orders" },
                        { id: "returns", title: "Returns", href: "/dashboard/orders/returns" },
                        { id: "abandoned", title: "Abandoned Carts", href: "/dashboard/orders/abandoned" },
                    ],
                },
                {
                    id: "products",
                    title: "Products",
                    href: "/dashboard/products",
                    icon: Tag,
                    badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
                    badgeVariant: counts.lowStock > 0 ? "warning" : undefined,
                    keywords: ["items", "goods", "sku", "inventory", "stock"],
                    children: [
                        { id: "products-list", title: "All Products", href: "/dashboard/products" },
                        { id: "categories", title: "Categories", href: "/dashboard/categories" },
                        { id: "collections", title: "Collections", href: "/dashboard/collections" },
                        { id: "inventory", title: "Inventory", href: "/dashboard/inventory" },
                        { id: "attributes", title: "Attributes", href: "/dashboard/attributes" },
                        { id: "gift-cards", title: "Gift Cards", href: "/dashboard/gift-cards" },
                    ],
                },
                {
                    id: "customers",
                    title: "Customers",
                    href: "/dashboard/customers",
                    icon: Users,
                    keywords: ["users", "clients", "buyers", "groups", "segments"],
                    children: [
                        { id: "customers-list", title: "All Customers", href: "/dashboard/customers" },
                        { id: "customer-groups", title: "Groups", href: "/dashboard/customers/groups" },
                    ],
                },
            ],
        },
        {
            id: "storefront",
            label: "Storefront",
            items: [
                {
                    id: "pages",
                    title: "Website",
                    href: "/dashboard/pages",
                    icon: Globe,
                    keywords: ["website", "pages", "editor", "builder", "storefront", "site"],
                },
                {
                    id: "media",
                    title: "Media",
                    href: "/dashboard/media",
                    icon: Image,
                    keywords: ["media", "images", "files", "uploads", "assets"],
                },
            ],
        },
        {
            id: "marketing",
            label: "Marketing",
            items: [
                {
                    id: "discounts",
                    title: "Discounts",
                    href: "/dashboard/marketing/discounts",
                    icon: ShoppingBag,
                    keywords: ["discounts", "coupons", "vouchers", "sales", "promotions"],
                },
                {
                    id: "campaigns",
                    title: "Campaigns",
                    href: "/dashboard/marketing/campaigns",
                    icon: Megaphone,
                    keywords: ["campaigns", "email", "marketing", "automation"],
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
                    icon: BarChart3,
                    keywords: ["reports", "stats", "metrics", "revenue"],
                },
                {
                    id: "reviews",
                    title: "Reviews",
                    href: "/dashboard/reviews",
                    icon: Star,
                    keywords: ["ratings", "feedback", "testimonials"],
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
                    keywords: ["preferences", "config", "store", "general"],
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
    if (item.requiredRole && !item.requiredRole.includes(userRole)) return false;
    if (item.requiredPlan && !item.requiredPlan.includes(planType)) return false;
    return true;
}
