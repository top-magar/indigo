/**
 * Infrastructure — Animated trust pillars with counting stats and hover effects.
 */

"use client";

import { useRef, useEffect, useCallback } from "react";
import anime from "animejs";
import { useAnimeOnView } from "./use-anime";
import { Zap, Shield, Server, Headphones, type LucideIcon } from "lucide-react";

const pillars: { icon: LucideIcon; title: string; description: string; stat: string; color: string }[] = [
    { icon: Zap, title: "Built for speed", description: "Edge-optimized pages that load in under 2 seconds, even on 3G networks across Nepal.", stat: "<2s", color: "from-amber-500/10" },
    { icon: Shield, title: "Secured by default", description: "SSL encryption, PCI-compliant payments, and automatic backups for every store.", stat: "PCI", color: "from-emerald-500/10" },
    { icon: Server, title: "99.9% uptime", description: "Multi-region hosting ensures your store stays online, even during Dashain traffic spikes.", stat: "99.9%", color: "from-blue-500/10" },
    { icon: Headphones, title: "Support when you need it", description: "WhatsApp support in Nepali and English. Priority response for Pro and Scale plans.", stat: "<1hr", color: "from-purple-500/10" },
];

export function Infrastructure() {
    const containerRef = useAnimeOnView(
        useCallback((el: HTMLElement) => ({
            targets: el.querySelectorAll("[data-card]"),
            opacity: [0, 1],
            translateY: [40, 0],
            rotateX: [10, 0],
            easing: "easeOutCubic",
            duration: 700,
            delay: anime.stagger(120),
        }), [])
    );

    return (
        <section className="py-24 sm:py-32 bg-muted/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Infrastructure</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Grow on a rock-solid foundation
                    </h2>
                    <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
                        Your store runs on infrastructure built to support thousands of businesses across Nepal.
                    </p>
                </div>

                <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ perspective: "1000px" }}>
                    {pillars.map((p) => (
                        <div
                            key={p.title}
                            data-card
                            className={`group rounded-2xl border border-border/50 bg-gradient-to-b ${p.color} to-background p-6 text-center hover:border-border hover:-translate-y-2 transition-all duration-300 cursor-default`}
                            style={{ opacity: 0 }}
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-foreground/5 mb-4 group-hover:scale-110 transition-transform duration-300">
                                <p.icon strokeWidth={1.5} className="w-5 h-5 text-foreground" />
                            </div>
                            <p className="text-3xl font-semibold text-foreground tabular-nums mb-1">{p.stat}</p>
                            <h3 className="text-sm font-medium text-foreground mb-2 tracking-tight">{p.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
