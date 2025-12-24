"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FeatureGridSettings } from "../settings/FeatureGridSettings";

export interface Feature {
    icon: "truck" | "shield" | "refresh" | "clock" | "heart" | "star" | "gift" | "credit-card";
    title: string;
    description: string;
}

export interface FeatureGridProps {
    heading?: string;
    subheading?: string;
    features?: Feature[];
    columns?: 2 | 3 | 4;
    backgroundColor?: string;
    iconStyle?: "filled" | "outlined" | "minimal";
}

const ICONS = {
    truck: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    ),
    shield: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    refresh: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    ),
    clock: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    heart: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    star: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    ),
    gift: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
    ),
    "credit-card": (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    ),
};

const DEFAULT_FEATURES: Feature[] = [
    { icon: "truck", title: "Free Shipping", description: "Free shipping on all orders over $50" },
    { icon: "shield", title: "Secure Payment", description: "Your payment information is safe with us" },
    { icon: "refresh", title: "Easy Returns", description: "30-day hassle-free return policy" },
    { icon: "clock", title: "24/7 Support", description: "Round the clock customer support" },
];

const COLUMNS_MAP = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function FeatureGrid({
    heading = "Why Choose Us",
    subheading = "We're committed to providing the best shopping experience",
    features = DEFAULT_FEATURES,
    columns = 4,
    backgroundColor = "#f8fafc",
    iconStyle = "filled",
}: FeatureGridProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const getIconClasses = () => {
        switch (iconStyle) {
            case "filled":
                return "bg-primary text-primary-foreground";
            case "outlined":
                return "border-2 border-primary text-primary";
            case "minimal":
                return "text-primary";
            default:
                return "bg-primary text-primary-foreground";
        }
    };

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "py-16 lg:py-24",
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{ backgroundColor }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {(heading || subheading) && (
                    <div className="text-center mb-12 lg:mb-16">
                        {heading && (
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {heading}
                            </h2>
                        )}
                        {subheading && (
                            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                                {subheading}
                            </p>
                        )}
                    </div>
                )}
                <div className={cn("grid gap-8", COLUMNS_MAP[columns])}>
                    {features.map((feature, index) => (
                        <div key={index} className="text-center">
                            <div className={cn(
                                "mx-auto flex h-14 w-14 items-center justify-center rounded-xl mb-4",
                                getIconClasses()
                            )}>
                                {ICONS[feature.icon]}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

FeatureGrid.craft = {
    displayName: "Feature Grid",
    props: {
        heading: "Why Choose Us",
        subheading: "We're committed to providing the best shopping experience",
        features: DEFAULT_FEATURES,
        columns: 4,
        backgroundColor: "#f8fafc",
        iconStyle: "filled",
    },
    related: {
        settings: FeatureGridSettings,
    },
};
