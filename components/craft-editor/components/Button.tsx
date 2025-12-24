"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { Button as UIButton } from "@/components/ui/button";
import type { ButtonProps } from "@/lib/craft-editor/types";
import { ButtonSettings } from "../settings";

const VARIANT_MAP = {
    primary: "default",
    secondary: "secondary",
    outline: "outline",
    ghost: "ghost",
} as const;

const SIZE_MAP = {
    sm: "sm",
    md: "default",
    lg: "lg",
} as const;

export function Button({
    text = "Click me",
    href = "#",
    variant = "primary",
    size = "md",
    fullWidth = false,
}: ButtonProps) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <UIButton
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            variant={VARIANT_MAP[variant]}
            size={SIZE_MAP[size]}
            className={cn(
                "transition-all",
                fullWidth && "w-full",
                enabled && selected && "ring-2 ring-primary ring-offset-2",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-offset-2",
                enabled && "cursor-move"
            )}
            onClick={(e) => enabled && e.preventDefault()}
            data-href={href}
        >
            {text}
        </UIButton>
    );
}

Button.craft = {
    displayName: "Button",
    props: {
        text: "Click me",
        href: "#",
        variant: "primary",
        size: "md",
        fullWidth: false,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ButtonSettings,
    },
};
