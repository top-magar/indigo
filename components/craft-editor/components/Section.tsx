"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import type { SectionProps } from "@/lib/craft-editor/types";
import { SectionSettings } from "../settings";

const MAX_WIDTH_MAP = {
    full: "100%",
    container: "1280px",
    narrow: "768px",
};

const VERTICAL_ALIGN_MAP = {
    top: "flex-start",
    center: "center",
    bottom: "flex-end",
};

export function Section({
    backgroundColor = "transparent",
    backgroundImage,
    backgroundOverlay = 0,
    padding = { top: 48, right: 24, bottom: 48, left: 24 },
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    minHeight = 200,
    maxWidth = "container",
    verticalAlign = "top",
    children,
}: SectionProps & { children?: React.ReactNode }) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "relative w-full transition-all",
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{
                backgroundColor,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                marginTop: margin.top,
                marginBottom: margin.bottom,
            }}
        >
            {/* Background Overlay */}
            {backgroundOverlay > 0 && (
                <div
                    className="absolute inset-0 bg-black pointer-events-none"
                    style={{ opacity: backgroundOverlay / 100 }}
                />
            )}

            {/* Content Container */}
            <div
                className="relative z-10 mx-auto w-full flex flex-col"
                style={{
                    maxWidth: MAX_WIDTH_MAP[maxWidth],
                    minHeight,
                    paddingTop: padding.top,
                    paddingRight: padding.right,
                    paddingBottom: padding.bottom,
                    paddingLeft: padding.left,
                    justifyContent: VERTICAL_ALIGN_MAP[verticalAlign],
                }}
            >
                {children}
            </div>
        </section>
    );
}

Section.craft = {
    displayName: "Section",
    props: {
        backgroundColor: "transparent",
        padding: { top: 48, right: 24, bottom: 48, left: 24 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        minHeight: 200,
        maxWidth: "container",
        verticalAlign: "top",
    },
    rules: {
        canDrag: () => true,
        canMoveIn: () => true,
    },
    related: {
        settings: SectionSettings,
    },
};
