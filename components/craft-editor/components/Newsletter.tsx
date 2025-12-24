"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NewsletterProps } from "@/lib/craft-editor/types";
import { NewsletterSettings } from "../settings";

export function Newsletter({
    heading = "Subscribe to Our Newsletter",
    description = "Get the latest updates and exclusive offers",
    placeholder = "Enter your email",
    buttonText = "Subscribe",
    layout = "inline",
    backgroundColor,
}: NewsletterProps) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "py-12 px-6 transition-all w-full",
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
            style={{ backgroundColor }}
        >
            <div className="max-w-2xl mx-auto text-center">
                {heading && (
                    <h2 className="text-2xl font-bold">{heading}</h2>
                )}
                {description && (
                    <p className="mt-2 text-muted-foreground">{description}</p>
                )}
                
                <form
                    className={cn(
                        "mt-6",
                        layout === "inline" ? "flex gap-3 max-w-md mx-auto" : "space-y-3 max-w-sm mx-auto"
                    )}
                    onSubmit={(e) => e.preventDefault()}
                >
                    <Input
                        type="email"
                        placeholder={placeholder}
                        className={layout === "inline" ? "flex-1" : "w-full"}
                        disabled={enabled}
                    />
                    <Button
                        type="submit"
                        className={layout === "stacked" ? "w-full" : ""}
                        onClick={(e) => enabled && e.preventDefault()}
                    >
                        {buttonText}
                    </Button>
                </form>
            </div>
        </section>
    );
}

Newsletter.craft = {
    displayName: "Newsletter",
    props: {
        heading: "Subscribe to Our Newsletter",
        description: "Get the latest updates and exclusive offers",
        placeholder: "Enter your email",
        buttonText: "Subscribe",
        successMessage: "Thanks for subscribing!",
        layout: "inline",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: NewsletterSettings,
    },
};
