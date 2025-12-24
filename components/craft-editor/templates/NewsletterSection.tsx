"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { NewsletterSectionSettings } from "../settings/NewsletterSectionSettings";

export interface NewsletterSectionProps {
    heading?: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
    layout?: "inline" | "stacked" | "split";
    backgroundColor?: string;
    showPrivacyNote?: boolean;
    privacyNote?: string;
}

export function NewsletterSection({
    heading = "Subscribe to our newsletter",
    description = "Get the latest updates, exclusive offers, and insider tips delivered straight to your inbox.",
    placeholder = "Enter your email",
    buttonText = "Subscribe",
    layout = "stacked",
    backgroundColor = "#f8fafc",
    showPrivacyNote = true,
    privacyNote = "We respect your privacy. Unsubscribe at any time.",
}: NewsletterSectionProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

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
                {layout === "stacked" && (
                    <div className="max-w-xl mx-auto text-center">
                        {heading && (
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {heading}
                            </h2>
                        )}
                        {description && (
                            <p className="mt-4 text-lg text-muted-foreground">
                                {description}
                            </p>
                        )}
                        <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder={placeholder}
                                className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                {buttonText}
                            </button>
                        </form>
                        {showPrivacyNote && (
                            <p className="mt-4 text-sm text-muted-foreground">
                                {privacyNote}
                            </p>
                        )}
                    </div>
                )}

                {layout === "inline" && (
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div className="lg:max-w-lg">
                            {heading && (
                                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    {heading}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-2 text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                        <div className="lg:max-w-md w-full">
                            <form className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder={placeholder}
                                    className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                    type="submit"
                                    className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                                >
                                    {buttonText}
                                </button>
                            </form>
                            {showPrivacyNote && (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {privacyNote}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {layout === "split" && (
                    <div className="rounded-2xl bg-primary p-8 lg:p-12">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                            <div className="lg:max-w-lg">
                                {heading && (
                                    <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                                        {heading}
                                    </h2>
                                )}
                                {description && (
                                    <p className="mt-2 text-primary-foreground/80">
                                        {description}
                                    </p>
                                )}
                            </div>
                            <div className="lg:max-w-md w-full">
                                <form className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        placeholder={placeholder}
                                        className="flex-1 rounded-lg bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
                                    >
                                        {buttonText}
                                    </button>
                                </form>
                                {showPrivacyNote && (
                                    <p className="mt-3 text-sm text-primary-foreground/70">
                                        {privacyNote}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

NewsletterSection.craft = {
    displayName: "Newsletter",
    props: {
        heading: "Subscribe to our newsletter",
        description: "Get the latest updates, exclusive offers, and insider tips delivered straight to your inbox.",
        placeholder: "Enter your email",
        buttonText: "Subscribe",
        layout: "stacked",
        backgroundColor: "#f8fafc",
        showPrivacyNote: true,
        privacyNote: "We respect your privacy. Unsubscribe at any time.",
    },
    related: {
        settings: NewsletterSectionSettings,
    },
};
