"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import type { GridProps } from "@/lib/craft-editor/types";
import { GridSettings } from "../settings";

const COLUMNS_MAP = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

const ALIGN_MAP = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
};

export function Grid({
    columns = 3,
    gap = 24,
    alignItems = "stretch",
    children,
}: GridProps & { children?: React.ReactNode }) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "grid w-full transition-all",
                COLUMNS_MAP[columns],
                ALIGN_MAP[alignItems],
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

Grid.craft = {
    displayName: "Grid",
    props: {
        columns: 3,
        gap: 24,
        alignItems: "stretch",
    },
    rules: {
        canDrag: () => true,
        canMoveIn: () => true,
    },
    related: {
        settings: GridSettings,
    },
};
