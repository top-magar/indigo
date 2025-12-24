"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import ContentEditable from "react-contenteditable";
import { useCallback, useRef } from "react";
import type { TextProps } from "@/lib/craft-editor/types";
import { TextSettings } from "../settings";

const FONT_WEIGHT_MAP = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
};

export function Text({
    text = "Edit this text",
    tagName = "p",
    fontSize = 16,
    fontWeight = "normal",
    textAlign = "left",
    color = "inherit",
    lineHeight = 1.6,
}: TextProps) {
    const { connectors: { connect, drag }, selected, hovered, actions: { setProp } } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
    const contentRef = useRef<HTMLElement>(null);

    const handleChange = useCallback((e: { target: { value: string } }) => {
        setProp((props: TextProps) => {
            props.text = e.target.value;
        }, 500);
    }, [setProp]);

    return (
        <ContentEditable
            innerRef={(ref: HTMLElement | null) => {
                if (ref) {
                    connect(drag(ref));
                    (contentRef as React.MutableRefObject<HTMLElement | null>).current = ref;
                }
            }}
            html={text || ""}
            disabled={!enabled || !selected}
            onChange={handleChange}
            tagName={tagName}
            className={cn(
                "outline-none transition-all",
                enabled && selected && "ring-2 ring-primary ring-inset bg-primary/5",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{
                fontSize,
                fontWeight: FONT_WEIGHT_MAP[fontWeight],
                textAlign,
                color,
                lineHeight,
            }}
        />
    );
}

Text.craft = {
    displayName: "Text",
    props: {
        text: "Edit this text",
        tagName: "p",
        fontSize: 16,
        fontWeight: "normal",
        textAlign: "left",
        color: "inherit",
        lineHeight: 1.6,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: TextSettings,
    },
};
