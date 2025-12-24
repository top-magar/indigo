"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { StatsSectionSettings } from "../settings/StatsSectionSettings";

export interface Stat {
    value: string;
    label: string;
    description?: string;
}

export interface StatsSectionProps {
    heading?: string;
    subheading?: string;
    stats?: Stat[];
    layout?: "grid" | "inline" | "cards";
    backgroundColor?: string;
    accentColor?: string;
}

const DEFAULT_STATS: Stat[] = [
    { value: "10K+", label: "Happy Customers", description: "Worldwide" },
    { value: "50K+", label: "Products Sold", description: "And counting" },
    { value: "99%", label: "Satisfaction Rate", description: "5-star reviews" },
    { value: "24/7", label: "Support", description: "Always available" },
];

export function StatsSection({
    heading = "Trusted by thousands",
    subheading = "Our numbers speak for themselves",
    stats = DEFAULT_STATS,
    layout = "grid",
    backgroundColor = "#0f172a",
    accentColor = "#3b82f6",
}: StatsSectionProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const isDark = backgroundColor === "#0f172a" || backgroundColor === "#000000" || backgroundColor === "#18181b";
    const textColor = isDark ? "#ffffff" : "#0f172a";
    const mutedColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.6)";

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "py-16 lg:py-24",
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{ backgroundColor }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {(heading || subheading) && (
                    <div className="text-center mb-12 lg:mb-16">
                        {heading && (
                            <h2
                                className="text-3xl font-bold tracking-tight sm:text-4xl"
                                style={{ color: textColor }}
                            >
                                {heading}
                            </h2>
                        )}
                        {subheading && (
                            <p
                                className="mt-4 text-lg"
                                style={{ color: mutedColor }}
                            >
                                {subheading}
                            </p>
                        )}
                    </div>
                )}

                {layout === "grid" && (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p
                                    className="text-4xl font-bold lg:text-5xl"
                                    style={{ color: accentColor }}
                                >
                                    {stat.value}
                                </p>
                                <p
                                    className="mt-2 text-lg font-semibold"
                                    style={{ color: textColor }}
                                >
                                    {stat.label}
                                </p>
                                {stat.description && (
                                    <p
                                        className="mt-1 text-sm"
                                        style={{ color: mutedColor }}
                                    >
                                        {stat.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {layout === "inline" && (
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 lg:gap-x-16">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p
                                    className="text-4xl font-bold lg:text-5xl"
                                    style={{ color: accentColor }}
                                >
                                    {stat.value}
                                </p>
                                <p
                                    className="mt-2 font-semibold"
                                    style={{ color: textColor }}
                                >
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {layout === "cards" && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="rounded-2xl p-6 text-center"
                                style={{
                                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                                    borderWidth: 1,
                                }}
                            >
                                <p
                                    className="text-3xl font-bold lg:text-4xl"
                                    style={{ color: accentColor }}
                                >
                                    {stat.value}
                                </p>
                                <p
                                    className="mt-2 font-semibold"
                                    style={{ color: textColor }}
                                >
                                    {stat.label}
                                </p>
                                {stat.description && (
                                    <p
                                        className="mt-1 text-sm"
                                        style={{ color: mutedColor }}
                                    >
                                        {stat.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

StatsSection.craft = {
    displayName: "Stats",
    props: {
        heading: "Trusted by thousands",
        subheading: "Our numbers speak for themselves",
        stats: DEFAULT_STATS,
        layout: "grid",
        backgroundColor: "#0f172a",
        accentColor: "#3b82f6",
    },
    related: {
        settings: StatsSectionSettings,
    },
};
