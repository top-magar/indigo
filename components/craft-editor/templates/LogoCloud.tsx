"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { LogoCloudSettings } from "../settings/LogoCloudSettings";

export interface Logo {
    name: string;
    url?: string;
}

export interface LogoCloudProps {
    heading?: string;
    logos?: Logo[];
    layout?: "grid" | "inline" | "marquee";
    grayscale?: boolean;
    backgroundColor?: string;
}

const DEFAULT_LOGOS: Logo[] = [
    { name: "Vercel" },
    { name: "Stripe" },
    { name: "Shopify" },
    { name: "Notion" },
    { name: "Linear" },
    { name: "Figma" },
];

// Simple placeholder logos using text
function LogoPlaceholder({ name, grayscale }: { name: string; grayscale: boolean }) {
    return (
        <div
            className={cn(
                "flex items-center justify-center h-12 px-6 rounded-lg border bg-background",
                grayscale && "opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
            )}
        >
            <span className="font-semibold text-muted-foreground">{name}</span>
        </div>
    );
}

export function LogoCloud({
    heading = "Trusted by leading brands",
    logos = DEFAULT_LOGOS,
    layout = "grid",
    grayscale = true,
    backgroundColor = "#ffffff",
}: LogoCloudProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "py-12 lg:py-16",
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{ backgroundColor }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {heading && (
                    <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                        {heading}
                    </p>
                )}

                {layout === "grid" && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {logos.map((logo, index) => (
                            <div key={index} className="flex items-center justify-center">
                                {logo.url ? (
                                    <a href={logo.url} className="block">
                                        <LogoPlaceholder name={logo.name} grayscale={grayscale} />
                                    </a>
                                ) : (
                                    <LogoPlaceholder name={logo.name} grayscale={grayscale} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {layout === "inline" && (
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                        {logos.map((logo, index) => (
                            <div key={index}>
                                {logo.url ? (
                                    <a href={logo.url} className="block">
                                        <LogoPlaceholder name={logo.name} grayscale={grayscale} />
                                    </a>
                                ) : (
                                    <LogoPlaceholder name={logo.name} grayscale={grayscale} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {layout === "marquee" && (
                    <div className="relative overflow-hidden">
                        <div className="flex animate-marquee space-x-8">
                            {[...logos, ...logos].map((logo, index) => (
                                <div key={index} className="flex-shrink-0">
                                    {logo.url ? (
                                        <a href={logo.url} className="block">
                                            <LogoPlaceholder name={logo.name} grayscale={grayscale} />
                                        </a>
                                    ) : (
                                        <LogoPlaceholder name={logo.name} grayscale={grayscale} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

LogoCloud.craft = {
    displayName: "Logo Cloud",
    props: {
        heading: "Trusted by leading brands",
        logos: DEFAULT_LOGOS,
        layout: "grid",
        grayscale: true,
        backgroundColor: "#ffffff",
    },
    related: {
        settings: LogoCloudSettings,
    },
};
