"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { HeroCenteredSettings } from "../settings/HeroCenteredSettings";

export interface HeroCenteredProps {
    heading?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonUrl?: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    backgroundImage?: string;
    overlayOpacity?: number;
    height?: "small" | "medium" | "large" | "full";
    textColor?: string;
    showTrustedBy?: boolean;
    trustedByText?: string;
}

const HEIGHT_MAP = {
    small: "min-h-[400px]",
    medium: "min-h-[500px]",
    large: "min-h-[600px]",
    full: "min-h-screen",
};

export function HeroCentered({
    heading = "Welcome to Our Store",
    description = "Discover amazing products curated just for you. Shop the latest trends with confidence.",
    primaryButtonText = "Shop Now",
    primaryButtonUrl = "/products",
    secondaryButtonText = "View Collections",
    secondaryButtonUrl = "/collections",
    backgroundImage = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
    overlayOpacity = 50,
    height = "large",
    textColor = "#ffffff",
    showTrustedBy = true,
    trustedByText = "Trusted by 10,000+ customers worldwide",
}: HeroCenteredProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "relative flex items-center justify-center",
                HEIGHT_MAP[height],
                selected && "ring-2 ring-primary ring-offset-2"
            )}
        >
            {/* Background Image */}
            {backgroundImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
            )}
            
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity / 100 }}
            />

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                <h1
                    className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6"
                    style={{ color: textColor }}
                >
                    {heading}
                </h1>
                <p
                    className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 opacity-90"
                    style={{ color: textColor }}
                >
                    {description}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    {primaryButtonText && (
                        <a
                            href={primaryButtonUrl}
                            className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-colors"
                        >
                            {primaryButtonText}
                        </a>
                    )}
                    {secondaryButtonText && (
                        <a
                            href={secondaryButtonUrl}
                            className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                        >
                            {secondaryButtonText}
                        </a>
                    )}
                </div>
                {showTrustedBy && (
                    <p
                        className="mt-10 text-sm opacity-70"
                        style={{ color: textColor }}
                    >
                        {trustedByText}
                    </p>
                )}
            </div>
        </section>
    );
}

HeroCentered.craft = {
    displayName: "Hero Centered",
    props: {
        heading: "Welcome to Our Store",
        description: "Discover amazing products curated just for you. Shop the latest trends with confidence.",
        primaryButtonText: "Shop Now",
        primaryButtonUrl: "/products",
        secondaryButtonText: "View Collections",
        secondaryButtonUrl: "/collections",
        backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop",
        overlayOpacity: 50,
        height: "large",
        textColor: "#ffffff",
        showTrustedBy: true,
        trustedByText: "Trusted by 10,000+ customers worldwide",
    },
    related: {
        settings: HeroCenteredSettings,
    },
};
