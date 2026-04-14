import {
    Tag,
    CreditCard,
    Paintbrush,
    Truck,
    Rocket,
    type LucideIcon,
} from "lucide-react";

// Icon name type for serialization across server/client boundary
export type SetupStepIconName = "tag" | "credit-card" | "paintbrush" | "truck" | "rocket";

// Map icon names to actual Lucide components (used in client components)
export const SETUP_STEP_ICONS: Record<SetupStepIconName, LucideIcon> = {
    "tag": Tag,
    "credit-card": CreditCard,
    "paintbrush": Paintbrush,
    "truck": Truck,
    "rocket": Rocket,
};

export interface SetupStep {
    id: string;
    title: string;
    description: string;
    href: string;
    ctaText: string;
    completed: boolean;
    iconName: SetupStepIconName;  // Use string name instead of component
    iconColor: string;
}

// Default setup steps factory - can be used in server components
export function createSetupSteps(data: {
    hasProducts: boolean;
    hasPayments: boolean;
    hasCustomizedStore: boolean;
    hasShipping: boolean;
    isLaunched: boolean;
}): SetupStep[] {
    return [
        {
            id: "add-product",
            title: "Add your first product",
            description: "Products are what you sell. Add photos, prices, and descriptions to showcase your items.",
            href: "/dashboard/products/new",
            ctaText: "Add product",
            completed: data.hasProducts,
            iconName: "tag",
            iconColor: "info",
        },
        {
            id: "setup-payments",
            title: "Set up payments",
            description: "Configure a payment method to accept payments from customers. Supports Cash on Delivery and Bank Transfer.",
            href: "/dashboard/settings/payments",
            ctaText: "Set up payments",
            completed: data.hasPayments,
            iconName: "credit-card",
            iconColor: "success",
        },
        {
            id: "customize-store",
            title: "Customize your storefront",
            description: "Make your store unique with your brand colors, logo, and layout in Store Appearance settings.",
            href: "/dashboard/settings/storefront",
            ctaText: "Customize store",
            completed: data.hasCustomizedStore,
            iconName: "paintbrush",
            iconColor: "purple",
        },
        {
            id: "setup-shipping",
            title: "Configure shipping",
            description: "Set up shipping zones and rates so customers know what to expect at checkout.",
            href: "/dashboard/settings/shipping",
            ctaText: "Set up shipping",
            completed: data.hasShipping,
            iconName: "truck",
            iconColor: "warning",
        },
        {
            id: "launch-store",
            title: "Launch your store",
            description: "Your store is ready! Make it live and start sharing with customers.",
            href: "/dashboard/settings",
            ctaText: "Launch store",
            completed: data.isLaunched,
            iconName: "rocket",
            iconColor: "primary",
        },
    ];
}
