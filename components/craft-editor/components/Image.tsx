"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";
import type { ImageProps } from "@/lib/craft-editor/types";
import { ImageSettings } from "../settings";

export function Image({
    src = "",
    alt = "Image",
    width = "full",
    fixedWidth = 400,
    height = "auto",
    fixedHeight = 300,
    objectFit = "cover",
    borderRadius = 8,
}: ImageProps) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    const widthStyle = width === "full" ? "100%" : width === "auto" ? "auto" : `${fixedWidth}px`;
    const heightStyle = height === "auto" ? "auto" : `${fixedHeight}px`;

    if (!src) {
        return (
            <div
                ref={(ref) => { if (ref) connect(drag(ref)); }}
                className={cn(
                    "flex items-center justify-center bg-muted transition-all",
                    enabled && selected && "ring-2 ring-primary ring-inset",
                    enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                    enabled && "cursor-move"
                )}
                style={{
                    width: widthStyle,
                    height: heightStyle === "auto" ? "200px" : heightStyle,
                    borderRadius,
                }}
            >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <HugeiconsIcon icon={Image01Icon} className="h-10 w-10" />
                    <span className="text-sm">Add image URL</span>
                </div>
            </div>
        );
    }

    return (
        <img
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            src={src}
            alt={alt}
            className={cn(
                "transition-all",
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{
                width: widthStyle,
                height: heightStyle,
                objectFit,
                borderRadius,
            }}
        />
    );
}

Image.craft = {
    displayName: "Image",
    props: {
        src: "",
        alt: "Image",
        width: "full",
        fixedWidth: 400,
        height: "auto",
        fixedHeight: 300,
        objectFit: "cover",
        borderRadius: 8,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ImageSettings,
    },
};
