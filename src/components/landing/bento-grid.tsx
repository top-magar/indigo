/**
 * BentoGrid — Asymmetric 2-column feature cards with illustrations (Spline-inspired).
 * Visual feature highlights between existing sections.
 */

"use client";

import { useCallback } from "react";
import { useAnimeOnView } from "./use-anime";
import anime from "animejs";
import { Zap, Shield, Palette, Globe } from "lucide-react";

const cards = [
    {
        icon: Zap,
        title: "Lightning fast checkout",
        description: "One-tap payments with eSewa & Khalti. Customers buy in seconds, not minutes.",
        span: "sm:col-span-2 md:col-span-2 md:row-span-2",
        gradient: "from-amber-500/10 via-transparent to-transparent",
        features: ["One-tap eSewa pay", "Khalti QR scan", "Auto-fill addresses", "Guest checkout"],
    },
    {
        icon: Shield,
        title: "Bank-grade security",
        description: "SSL encryption, PCI compliance, and fraud detection built in.",
        span: "sm:col-span-1 md:col-span-1",
        gradient: "from-emerald-500/10 via-transparent to-transparent",
    },
    {
        icon: Palette,
        title: "Drag & drop editor",
        description: "Build your storefront visually. No code needed.",
        span: "sm:col-span-1 md:col-span-1",
        gradient: "from-purple-500/10 via-transparent to-transparent",
    },
    {
        icon: Globe,
        title: "Multi-language & currency",
        description: "Sell in Nepali, English, or Hindi. Accept NPR, USD, and INR.",
        span: "sm:col-span-2 md:col-span-2",
        gradient: "from-blue-500/10 via-transparent to-transparent",
        features: ["नेपाली", "English", "हिन्दी"],
    },
];

export function BentoGrid() {
    const ref = useAnimeOnView(
        useCallback((el: HTMLElement) => ({
            targets: el.querySelectorAll("[data-card]"),
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.97, 1],
            easing: "easeOutCubic",
            duration: 600,
            delay: anime.stagger(100),
        }), [])
    );

    return (
        <section className="py-24 sm:py-32 bg-muted/20">
            <div ref={ref} className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p data-card className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4" style={{ opacity: 0 }}>
                        Why Indigo
                    </p>
                    <h2 data-card className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]" style={{ opacity: 0 }}>
                        Built different for Nepal
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            data-card
                            className={`${card.span} rounded-2xl border border-border/50 bg-gradient-to-br ${card.gradient} bg-background p-6 md:p-8 hover:border-border transition-all duration-300 group`}
                            style={{ opacity: 0 }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
                                <card.icon className="w-5 h-5 text-foreground/70" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>

                            {card.features && (
                                <div className="flex flex-wrap gap-2 mt-5">
                                    {card.features.map((f) => (
                                        <span key={f} className="px-3 py-1.5 rounded-full bg-foreground/5 text-xs font-medium text-foreground/70">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
