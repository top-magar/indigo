import {
    Tag01Icon,
    CreditCardIcon,
    PaintBrushIcon,
    DeliveryTruck01Icon,
    RocketIcon,
} from "@hugeicons/core-free-icons";

export interface SetupStep {
    id: string;
    title: string;
    description: string;
    href: string;
    ctaText: string;
    completed: boolean;
    icon: typeof Tag01Icon;
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
            icon: Tag01Icon,
            iconColor: "chart-1",
        },
        {
            id: "setup-payments",
            title: "Set up payments",
            description: "Connect a payment provider to accept payments from customers. We support eSewa, Khalti, and Stripe.",
            href: "/dashboard/settings/payments",
            ctaText: "Set up payments",
            completed: data.hasPayments,
            icon: CreditCardIcon,
            iconColor: "chart-2",
        },
        {
            id: "customize-store",
            title: "Customize your storefront",
            description: "Make your store unique with your brand colors, logo, and layout using our visual editor.",
            href: "/storefront",
            ctaText: "Customize store",
            completed: data.hasCustomizedStore,
            icon: PaintBrushIcon,
            iconColor: "chart-5",
        },
        {
            id: "setup-shipping",
            title: "Configure shipping",
            description: "Set up shipping zones and rates so customers know what to expect at checkout.",
            href: "/dashboard/settings/shipping",
            ctaText: "Set up shipping",
            completed: data.hasShipping,
            icon: DeliveryTruck01Icon,
            iconColor: "chart-4",
        },
        {
            id: "launch-store",
            title: "Launch your store",
            description: "Your store is ready! Make it live and start sharing with customers.",
            href: "/dashboard/settings",
            ctaText: "Launch store",
            completed: data.isLaunched,
            icon: RocketIcon,
            iconColor: "primary",
        },
    ];
}
