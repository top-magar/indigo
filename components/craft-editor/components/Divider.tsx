"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import type { DividerProps } from "@/lib/craft-editor/types";
import { DividerSettings } from "../settings";

const WIDTH_MAP = {
    full: "w-full",
    medium: "w-2/3 mx-auto",
    short: "w-1/3 mx-auto",
};

export function Divider({
    style = "solid",
    color = "#e5e7eb",
    thickness = 1,
    width = "full",
    margin = 24,
}: DividerProps) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "transition-all",
                enabled && selected && "ring-2 ring-primary ring-inset rounded",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset rounded",
                enabled && "cursor-move"
            )}
            style={{ padding: `${margin}px 0` }}
        >
            <hr
                className={WIDTH_MAP[width]}
                style={{
                    borderStyle: style,
                    borderColor: color,
                    borderTopWidth: thickness,
                }}
            />
        </div>
    );
}

Divider.craft = {
    displayName: "Divider",
    props: {
        style: "solid",
        color: "#e5e7eb",
        thickness: 1,
        width: "full",
        margin: 24,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: DividerSettings,
    },
};
