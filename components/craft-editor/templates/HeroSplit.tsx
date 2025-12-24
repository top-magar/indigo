"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { HeroSplitSettings } from "../settings/HeroSplitSettings";

export interface HeroSplitProps {
    heading?: string;
    subheading?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonUrl?: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    imageSrc?: string;
    imageAlt?: string;
    imagePosition?: "left" | "right";
    backgroundColor?: string;
    textColor?: string;
    showBadge?: boolean;
    badgeText?: string;
}

export function HeroSplit({
    heading = "Build something amazing",
    subheading = "Introducing our new collection",
    description = "Create beautiful, responsive storefronts with our drag-and-drop editor. No coding required.",
    primaryButtonText = "Get Started",
    primaryButtonUrl = "/products",
    secondaryButtonText = "Learn More",
    secondaryButtonUrl = "/about",
    imageSrc = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    imageAlt = "Hero image",
    imagePosition = "right",
    backgroundColor = "#ffffff",
    textColor = "#0f172a",
    showBadge = true,
    badgeText = "New Release",
}: HeroSplitProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const contentSection = (
        <div className="flex flex-col justify-center space-y-6 lg:space-y-8">
            {showBadge && (
                <div className="inline-flex">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {badgeText}
                    </span>
                </div>
            )}
            {subheading && (
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {subheading}
                </p>
            )}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: textColor }}>
                {heading}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
                {description}
            </p>
            <div className="flex flex-wrap gap-4">
                {primaryButtonText && (
                    <a
                        href={primaryButtonUrl}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        {primaryButtonText}
                    </a>
                )}
                {secondaryButtonText && (
                    <a
                        href={secondaryButtonUrl}
                        className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        {secondaryButtonText}
                    </a>
                )}
            </div>
        </div>
    );

    const imageSection = (
        <div className="relative aspect-4/3 lg:aspect-square overflow-hidden rounded-2xl">
            <img
                src={imageSrc}
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
            />
        </div>
    );

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
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {imagePosition === "left" ? (
                        <>
                            {imageSection}
                            {contentSection}
                        </>
                    ) : (
                        <>
                            {contentSection}
                            {imageSection}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

HeroSplit.craft = {
    displayName: "Hero Split",
    props: {
        heading: "Build something amazing",
        subheading: "Introducing our new collection",
        description: "Create beautiful, responsive storefronts with our drag-and-drop editor. No coding required.",
        primaryButtonText: "Get Started",
        primaryButtonUrl: "/products",
        secondaryButtonText: "Learn More",
        secondaryButtonUrl: "/about",
        imageSrc: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
        imageAlt: "Hero image",
        imagePosition: "right",
        backgroundColor: "#ffffff",
        textColor: "#0f172a",
        showBadge: true,
        badgeText: "New Release",
    },
    related: {
        settings: HeroSplitSettings,
    },
};
