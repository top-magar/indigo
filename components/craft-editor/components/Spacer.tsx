"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import type { SpacerProps } from "@/lib/craft-editor/types";
import { SpacerSettings } from "../settings";

export function Spacer({ height = 48 }: SpacerProps) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "transition-all w-full",
                enabled && "bg-muted/30 border border-dashed border-muted-foreground/20 rounded",
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{ height }}
        >
            {enabled && (
                <div className="h-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">{height}px</span>
                </div>
            )}
        </div>
    );
}

Spacer.craft = {
    displayName: "Spacer",
    props: {
        height: 48,
        mobileHeight: 24,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: SpacerSettings,
    },
};
