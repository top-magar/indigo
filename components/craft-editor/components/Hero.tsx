"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { Button as UIButton } from "@/components/ui/button";
import type { HeroProps } from "@/lib/craft-editor/types";
import { HeroSettings } from "../settings";

const HEIGHT_MAP = {
    small: "300px",
    medium: "450px",
    large: "600px",
    full: "100vh",
};

const LAYOUT_MAP = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
    split: "items-start text-left",
};

export function Hero({
    layout = "center",
    backgroundImage,
    backgroundColor = "#f8fafc",
    overlayOpacity = 0,
    height = "large",
    heading = "Welcome to Our Store",
    subheading = "Discover amazing products",
    description = "Shop the latest collection with free shipping on orders over $50",
    primaryButtonText = "Shop Now",
    primaryButtonLink = "/products",
    secondaryButtonText = "Learn More",
    secondaryButtonLink = "/about",
    textColor = "#0f172a",
}: HeroProps) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "relative flex flex-col justify-center transition-all w-full",
                LAYOUT_MAP[layout],
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{
                minHeight: HEIGHT_MAP[height],
                backgroundColor,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Overlay */}
            {overlayOpacity > 0 && (
                <div
                    className="absolute inset-0 bg-black pointer-events-none"
                    style={{ opacity: overlayOpacity / 100 }}
                />
            )}

            {/* Content */}
            <div className={cn(
                "relative z-10 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col gap-4",
                LAYOUT_MAP[layout]
            )}>
                {heading && (
                    <h1
                        className="font-bold"
                        style={{
                            fontSize: 48,
                            color: textColor,
                            textAlign: layout === "center" ? "center" : "left",
                        }}
                    >
                        {heading}
                    </h1>
                )}
                {subheading && (
                    <p
                        style={{
                            fontSize: 20,
                            color: textColor,
                            textAlign: layout === "center" ? "center" : "left",
                        }}
                    >
                        {subheading}
                    </p>
                )}
                {description && (
                    <p
                        style={{
                            fontSize: 16,
                            color: `${textColor}99`,
                            textAlign: layout === "center" ? "center" : "left",
                        }}
                    >
                        {description}
                    </p>
                )}
                <div className={cn(
                    "flex gap-4 mt-2",
                    layout === "center" && "justify-center"
                )}>
                    {primaryButtonText && (
                        <UIButton
                            size="lg"
                            onClick={(e) => enabled && e.preventDefault()}
                            data-href={primaryButtonLink}
                        >
                            {primaryButtonText}
                        </UIButton>
                    )}
                    {secondaryButtonText && (
                        <UIButton
                            variant="outline"
                            size="lg"
                            onClick={(e) => enabled && e.preventDefault()}
                            data-href={secondaryButtonLink}
                        >
                            {secondaryButtonText}
                        </UIButton>
                    )}
                </div>
            </div>
        </section>
    );
}

Hero.craft = {
    displayName: "Hero Section",
    props: {
        layout: "center",
        backgroundColor: "#f8fafc",
        overlayOpacity: 0,
        height: "large",
        heading: "Welcome to Our Store",
        subheading: "Discover amazing products",
        description: "Shop the latest collection with free shipping on orders over $50",
        primaryButtonText: "Shop Now",
        primaryButtonLink: "/products",
        secondaryButtonText: "Learn More",
        secondaryButtonLink: "/about",
        textColor: "#0f172a",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: HeroSettings,
    },
};
