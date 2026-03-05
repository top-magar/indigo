/**
 * Testimonials — Animated cards with stagger reveal and hover effects.
 */

"use client";

import { useCallback } from "react";
import anime from "animejs";
import { Star } from "lucide-react";
import { useAnimeOnView } from "./use-anime";

const testimonials = [
    {
        business: "Kathmandu Kicks", quote: "Setting up eSewa took me 5 minutes. My sales doubled in the first month.",
        name: "Aarati Sharma", role: "Founder", metric: "2× sales", initial: "A", color: "from-purple-500/10",
    },
    {
        business: "Nepal Organic Tea", quote: "Inventory syncs perfectly across Instagram and my website. Zero overselling since we switched.",
        name: "Rajesh Hamal", role: "CEO", metric: "0 oversells", initial: "R", color: "from-emerald-500/10",
    },
    {
        business: "Pokhara Adventure Gear", quote: "Pathao integration saves us 3 hours every single day. We ship 200+ orders now.",
        name: "Sita Gurung", role: "Operations Lead", metric: "3 hrs saved/day", initial: "S", color: "from-blue-500/10",
    },
    {
        business: "Bhaktapur Pottery", quote: "We went from local market to shipping internationally. Indigo handles multi-currency beautifully.",
        name: "Deepak Prajapati", role: "Artisan & Owner", metric: "5 countries", initial: "D", color: "from-amber-500/10",
    },
    {
        business: "Thamel Fashion House", quote: "The visual editor let us redesign our store in an afternoon. No developer needed.",
        name: "Priya Maharjan", role: "Creative Director", metric: "4hr redesign", initial: "P", color: "from-rose-500/10",
    },
    {
        business: "Himalayan Honey Co.", quote: "Real-time analytics showed us our best products. Revenue up 40% in two months.",
        name: "Binod Tamang", role: "Co-founder", metric: "+40% revenue", initial: "B", color: "from-indigo-500/10",
    },
];

export function Testimonials() {
    const containerRef = useAnimeOnView(
        useCallback((el: HTMLElement) => [
            {
                targets: el.querySelectorAll("[data-card]"),
                opacity: [0, 1],
                translateY: [40, 0],
                rotateY: [-5, 0],
                easing: "easeOutCubic",
                duration: 700,
                delay: anime.stagger(150),
            },
            {
                targets: el.querySelectorAll("[data-star]"),
                scale: [0, 1],
                opacity: [0, 1],
                easing: "easeOutElastic(1, .5)",
                duration: 600,
                delay: anime.stagger(30, { start: 400 }),
            },
            {
                targets: el.querySelectorAll("[data-badge]"),
                scale: [0, 1],
                easing: "easeOutBack",
                duration: 500,
                delay: anime.stagger(150, { start: 600 }),
            },
        ], [])
    );

    return (
        <section className="py-24 sm:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Testimonials</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Thriving with Indigo
                    </h2>
                </div>

                <div ref={containerRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ perspective: "1000px" }}>
                    {testimonials.map((t) => (
                        <div
                            key={t.business}
                            data-card
                            className={`group rounded-2xl border border-border/50 bg-gradient-to-b ${t.color} to-transparent p-8 flex flex-col hover:border-border hover:-translate-y-2 transition-all duration-300`}
                            style={{ opacity: 0 }}
                        >
                            <p className="text-lg font-semibold text-foreground tracking-tight mb-3">{t.business}</p>

                            <div className="flex gap-0.5 mb-4">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} data-star strokeWidth={0} fill="currentColor" className="w-3.5 h-3.5 text-foreground" style={{ transform: "scale(0)" }} />
                                ))}
                            </div>

                            <blockquote className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1">
                                &ldquo;{t.quote}&rdquo;
                            </blockquote>

                            <div className="mb-6">
                                <span
                                    data-badge
                                    className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1"
                                    style={{ transform: "scale(0)" }}
                                >
                                    {t.metric}
                                </span>
                            </div>

                            <div className="pt-5 border-t border-border/30 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-xs font-medium text-foreground group-hover:bg-foreground/10 transition-colors">
                                    {t.initial}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
