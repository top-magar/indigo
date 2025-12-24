"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { Button as UIButton } from "@/components/ui/button";
import type { BannerProps } from "@/lib/craft-editor/types";
import { BannerSettings } from "../settings";

const HEIGHT_MAP = {
    small: "h-48",
    medium: "h-64",
    large: "h-96",
};

const POSITION_MAP = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
};

export function Banner({
    image,
    heading = "Special Offer",
    description = "Get 20% off on all products",
    buttonText = "Shop Now",
    buttonLink = "#",
    height = "medium",
    textPosition = "center",
    overlayColor = "#000000",
    overlayOpacity = 40,
}: BannerProps) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "relative flex flex-col justify-center overflow-hidden transition-all w-full",
                HEIGHT_MAP[height],
                POSITION_MAP[textPosition],
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{
                backgroundImage: image ? `url(${image})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            data-link={buttonLink}
        >
            {!image && <div className="absolute inset-0 bg-linear-to-r from-gray-700 to-gray-900" />}
            
            {/* Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundColor: overlayColor,
                    opacity: overlayOpacity / 100,
                }}
            />

            {/* Content */}
            <div className={cn("relative z-10 flex flex-col gap-4 p-8", POSITION_MAP[textPosition])}>
                {heading && (
                    <h2 className="text-3xl font-bold text-white">{heading}</h2>
                )}
                {description && (
                    <p className="max-w-xl text-lg text-white/90">{description}</p>
                )}
                {buttonText && (
                    <UIButton
                        variant="secondary"
                        size="lg"
                        className="mt-2"
                        onClick={(e) => enabled && e.preventDefault()}
                    >
                        {buttonText}
                    </UIButton>
                )}
            </div>
        </section>
    );
}

Banner.craft = {
    displayName: "Banner",
    props: {
        heading: "Special Offer",
        description: "Get 20% off on all products",
        buttonText: "Shop Now",
        buttonLink: "#",
        height: "medium",
        textPosition: "center",
        overlayColor: "#000000",
        overlayOpacity: 40,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: BannerSettings,
    },
};
