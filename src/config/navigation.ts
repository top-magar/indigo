import {
    Home01Icon,
    Package01Icon,
    ShoppingCart01Icon,
    Settings01Icon,
} from "@hugeicons/core-free-icons";

export const dashboardNav = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home01Icon,
    },
    {
        title: "Products",
        href: "/dashboard/products",
        icon: Package01Icon,
    },
    {
        title: "Orders",
        href: "/dashboard/orders",
        icon: ShoppingCart01Icon,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings01Icon,
    },
] as const;

export type NavItem = (typeof dashboardNav)[number];
