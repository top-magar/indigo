"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { CTABannerSettings } from "../settings/CTABannerSettings";

export interface CTABannerProps {
    heading?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    layout?: "centered" | "split" | "minimal";
    backgroundColor?: string;
    backgroundImage?: string;
    overlayOpacity?: number;
    textColor?: string;
}

export function CTABanner({
    heading = "Ready to get started?",
    description = "Join thousands of satisfied customers and transform your shopping experience today.",
    buttonText = "Get Started",
    buttonUrl = "/signup",
    secondaryButtonText = "Contact Sales",
    secondaryButtonUrl = "/contact",
    layout = "centered",
    backgroundColor = "#0f172a",
    backgroundImage,
    overlayOpacity = 0,
    textColor = "#ffffff",
}: CTABannerProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "relative py-16 lg:py-24 overflow-hidden",
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{ backgroundColor }}
        >
            {/* Background Image */}
            {backgroundImage && (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: overlayOpacity / 100 }}
                    />
                </>
            )}

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {layout === "centered" && (
                    <div className="text-center">
                        <h2
                            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
                            style={{ color: textColor }}
                        >
                            {heading}
                        </h2>
                        {description && (
                            <p
                                className="mt-4 text-lg max-w-2xl mx-auto opacity-90"
                                style={{ color: textColor }}
                            >
                                {description}
                            </p>
                        )}
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            {buttonText && (
                                <a
                                    href={buttonUrl}
                                    className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-colors"
                                >
                                    {buttonText}
                                </a>
                            )}
                            {secondaryButtonText && (
                                <a
                                    href={secondaryButtonUrl}
                                    className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
                                    style={{ color: textColor }}
                                >
                                    {secondaryButtonText}
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {layout === "split" && (
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div className="lg:max-w-xl">
                            <h2
                                className="text-3xl font-bold tracking-tight sm:text-4xl"
                                style={{ color: textColor }}
                            >
                                {heading}
                            </h2>
                            {description && (
                                <p
                                    className="mt-4 text-lg opacity-90"
                                    style={{ color: textColor }}
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {buttonText && (
                                <a
                                    href={buttonUrl}
                                    className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-colors"
                                >
                                    {buttonText}
                                </a>
                            )}
                            {secondaryButtonText && (
                                <a
                                    href={secondaryButtonUrl}
                                    className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
                                    style={{ color: textColor }}
                                >
                                    {secondaryButtonText}
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {layout === "minimal" && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div>
                            <h2
                                className="text-2xl font-bold tracking-tight"
                                style={{ color: textColor }}
                            >
                                {heading}
                            </h2>
                            {description && (
                                <p
                                    className="mt-2 opacity-90"
                                    style={{ color: textColor }}
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                        {buttonText && (
                            <a
                                href={buttonUrl}
                                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
                            >
                                {buttonText}
                            </a>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

CTABanner.craft = {
    displayName: "CTA Banner",
    props: {
        heading: "Ready to get started?",
        description: "Join thousands of satisfied customers and transform your shopping experience today.",
        buttonText: "Get Started",
        buttonUrl: "/signup",
        secondaryButtonText: "Contact Sales",
        secondaryButtonUrl: "/contact",
        layout: "centered",
        backgroundColor: "#0f172a",
        backgroundImage: "",
        overlayOpacity: 0,
        textColor: "#ffffff",
    },
    related: {
        settings: CTABannerSettings,
    },
};
