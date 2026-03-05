/**
 * Solutions — Animated accordion with morphing isometric preview.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/shared/utils";
import anime from "animejs";
import Link from "next/link";
import { useStaggerUp } from "./use-anime";
import { ArrowRight, ChevronRight, Store, CreditCard, Truck, Megaphone, BarChart3, type LucideIcon } from "lucide-react";

interface Solution {
    icon: LucideIcon;
    title: string;
    description: string;
    stats: { label: string; value: string }[];
    color: string;
}

const solutions: Solution[] = [
    {
        icon: Store, title: "Online Store",
        description: "Sell products, manage inventory, and process orders — all from one dashboard.",
        stats: [{ label: "Products", value: "Unlimited" }, { label: "Themes", value: "12+" }, { label: "Setup", value: "5 min" }],
        color: "from-purple-500/20 to-transparent",
    },
    {
        icon: CreditCard, title: "Payments",
        description: "Accept eSewa, Khalti, IME Pay, ConnectIPS, and international cards. Same-day settlement.",
        stats: [{ label: "Methods", value: "6+" }, { label: "Settlement", value: "Same day" }, { label: "Fees", value: "From 1.5%" }],
        color: "from-emerald-500/20 to-transparent",
    },
    {
        icon: Truck, title: "Shipping",
        description: "One-click Pathao booking with auto labels, tracking, and customer SMS notifications.",
        stats: [{ label: "Partners", value: "4" }, { label: "Districts", value: "75" }, { label: "Labels", value: "Auto" }],
        color: "from-blue-500/20 to-transparent",
    },
    {
        icon: Megaphone, title: "Marketing",
        description: "WhatsApp, Viber, SMS alerts, and email campaigns. Sync with Facebook and Instagram Shop.",
        stats: [{ label: "Channels", value: "6+" }, { label: "Social sync", value: "FB & IG" }, { label: "Automation", value: "Built-in" }],
        color: "from-amber-500/20 to-transparent",
    },
    {
        icon: BarChart3, title: "Analytics",
        description: "Real-time revenue, orders, conversion rates, and top products. Data you can act on.",
        stats: [{ label: "Reports", value: "Real-time" }, { label: "Exports", value: "CSV" }, { label: "Insights", value: "AI" }],
        color: "from-indigo-500/20 to-transparent",
    },
];

export function Solutions() {
    const [open, setOpen] = useState(0);
    const previewRef = useRef<HTMLDivElement>(null);
    const headerRef = useStaggerUp();

    useEffect(() => {
        if (!previewRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        anime({
            targets: previewRef.current.querySelectorAll("[data-stat]"),
            opacity: [0, 1],
            translateY: [24, 0],
            rotateX: [15, 0],
            easing: "easeOutCubic",
            duration: 600,
            delay: anime.stagger(100),
        });

        // Animate the floating dots
        anime({
            targets: previewRef.current.querySelectorAll("[data-dot]"),
            scale: [0, 1],
            opacity: [0, 0.6],
            easing: "easeOutElastic(1, .6)",
            duration: 800,
            delay: anime.stagger(60, { start: 300 }),
        });
    }, [open]);

    const s = solutions[open];
    const Icon = s.icon;

    return (
        <section id="solutions" className="py-24 sm:py-32 bg-background scroll-mt-28">
            <div className="max-w-7xl mx-auto px-6">
                <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
                    <div className="max-w-2xl">
                        <p data-animate className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Solutions</p>
                        <h2 data-animate className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                            Add anything you need as you grow
                        </h2>
                    </div>
                    <Link href="/signup" data-animate className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        Get Started <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Accordion */}
                    <div className="space-y-0 divide-y divide-border/50">
                        {solutions.map((sol, i) => {
                            const SolIcon = sol.icon;
                            return (
                                <div key={sol.title}>
                                    <button
                                        onClick={() => setOpen(i)}
                                        className="w-full flex items-center gap-3 justify-between py-5 text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <SolIcon className={cn(
                                                "w-4 h-4 transition-colors",
                                                open === i ? "text-foreground" : "text-muted-foreground/50"
                                            )} />
                                            <h3 className={cn(
                                                "text-lg font-semibold transition-colors",
                                                open === i ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                            )}>
                                                {sol.title}
                                            </h3>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-4 h-4 transition-transform duration-300 text-muted-foreground",
                                            open === i && "rotate-90"
                                        )} />
                                    </button>
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-300",
                                        open === i ? "max-h-32 pb-5" : "max-h-0"
                                    )}>
                                        <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                                            {sol.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Isometric preview */}
                    <div
                        ref={previewRef}
                        className={cn("relative rounded-2xl border border-border/50 bg-gradient-to-br p-6 md:p-8 overflow-hidden", s.color)}
                        style={{ perspective: "800px" }}
                    >
                        {/* Floating decorative dots */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={`${open}-${i}`}
                                    data-dot
                                    className="absolute w-2 h-2 rounded-full bg-foreground/10"
                                    style={{
                                        top: `${15 + (i * 37) % 70}%`,
                                        left: `${10 + (i * 43) % 80}%`,
                                        transform: "scale(0)",
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative" style={{ transform: "rotateY(-2deg) rotateX(1deg)" }}>
                            <div className="flex items-center gap-2 mb-6">
                                <Icon className="w-5 h-5 text-foreground" />
                                <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    {s.title}
                                </h4>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {s.stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        data-stat
                                        className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm p-4 hover:-translate-y-1 transition-transform duration-300"
                                    >
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                                            {stat.label}
                                        </p>
                                        <p className="text-lg font-semibold text-foreground tracking-tight">
                                            {stat.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Animated progress bars */}
                            <div className="mt-6 space-y-2">
                                {[85, 65, 45].map((w, i) => (
                                    <div key={`${open}-${i}`} className="h-2 rounded-full bg-muted/20 overflow-hidden">
                                        <div
                                            data-stat
                                            className="h-full rounded-full bg-foreground/15"
                                            style={{ width: `${w}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
