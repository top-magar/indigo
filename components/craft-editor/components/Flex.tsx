"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import type { FlexProps } from "@/lib/craft-editor/types";
import { FlexSettings } from "../settings";

const DIRECTION_MAP = {
    row: "flex-row",
    column: "flex-col",
};

const JUSTIFY_MAP = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
};

const ALIGN_MAP = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
};

export function Flex({
    direction = "row",
    justify = "start",
    align = "center",
    gap = 16,
    wrap = true,
    children,
}: FlexProps & { children?: React.ReactNode }) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "flex w-full transition-all",
                DIRECTION_MAP[direction],
                JUSTIFY_MAP[justify],
                ALIGN_MAP[align],
                wrap && "flex-wrap",
                enabled && "min-h-[60px]",
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{ gap }}
        >
            {children}
        </div>
    );
}

Flex.craft = {
    displayName: "Flex",
    props: {
        direction: "row",
        justify: "start",
        align: "center",
        gap: 16,
        wrap: true,
    },
    rules: {
        canDrag: () => true,
        canMoveIn: () => true,
    },
    related: {
        settings: FlexSettings,
    },
};
