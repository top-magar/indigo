"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import type { ContainerProps } from "@/lib/craft-editor/types";
import { ContainerSettings } from "../settings";

const SHADOW_MAP = {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
};

export function Container({
    width = "full",
    fixedWidth = 400,
    padding = { top: 16, right: 16, bottom: 16, left: 16 },
    backgroundColor = "transparent",
    borderRadius = 0,
    shadow = "none",
    children,
}: ContainerProps & { children?: React.ReactNode }) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    const widthStyle = width === "full" ? "100%" : width === "auto" ? "auto" : `${fixedWidth}px`;

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "relative transition-all",
                enabled && "min-h-[60px]",
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{
                width: widthStyle,
                backgroundColor,
                borderRadius,
                boxShadow: SHADOW_MAP[shadow],
                paddingTop: padding.top,
                paddingRight: padding.right,
                paddingBottom: padding.bottom,
                paddingLeft: padding.left,
            }}
        >
            {children}
        </div>
    );
}

Container.craft = {
    displayName: "Container",
    props: {
        width: "full",
        fixedWidth: 400,
        padding: { top: 16, right: 16, bottom: 16, left: 16 },
        backgroundColor: "transparent",
        borderRadius: 0,
        shadow: "none",
    },
    rules: {
        canDrag: () => true,
        canMoveIn: () => true,
    },
    related: {
        settings: ContainerSettings,
    },
};
