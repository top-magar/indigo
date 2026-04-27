/**
 * BentoGrid — Aceternity WobbleCard replacing anime.js bento cards.
 */

"use client";

import { WobbleCard } from "@/components/ui/aceternity/wobble-card";
import { Zap, Shield, Palette, Globe } from "lucide-react";

const cards = [
    {
        icon: Zap,
        title: "Lightning fast checkout",
        description: "One-tap payments with Nepal's top digital wallets. Customers buy in seconds, not minutes.",
        span: "col-span-1 lg:col-span-2 lg:row-span-2 min-h-[300px] lg:min-h-[400px]",
        containerClassName: "bg-amber-900",
        features: ["One-tap wallet pay", "QR scan checkout", "Auto-fill addresses", "Guest checkout"],
    },
    {
        icon: Shield,
        title: "Bank-grade security",
        description: "SSL encryption, PCI compliance, and fraud detection built in.",
        span: "col-span-1 min-h-[200px]",
        containerClassName: "bg-emerald-900",
    },
    {
        icon: Palette,
        title: "Drag & drop editor",
        description: "Build your storefront visually. No code needed.",
        span: "col-span-1 min-h-[200px]",
        containerClassName: "bg-purple-900",
    },
    {
        icon: Globe,
        title: "Multi-language & currency",
        description: "Sell in Nepali, English, or Hindi. Accept NPR, USD, and INR.",
        span: "col-span-1 lg:col-span-2 min-h-[200px]",
        containerClassName: "bg-blue-900",
        features: ["नेपाली", "English", "हिन्दी"],
    },
];

export function BentoGrid() {
    return (
        <section className="py-24 sm:py-32 bg-muted/20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Why Indigo</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Built different for Nepal
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <WobbleCard key={card.title} containerClassName={`${card.span} ${card.containerClassName}`}>
                            <div className="max-w-xs">
                                <card.icon className="w-5 h-5 text-white-700 mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                                <p className="text-sm text-neutral-200 leading-relaxed">{card.description}</p>
                                {card.features && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {card.features.map((f) => (
                                            <span key={f} className="px-3 py-1.5 rounded-full bg-white-100 text-xs font-medium text-white-700">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </WobbleCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
