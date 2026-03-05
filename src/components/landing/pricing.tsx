/**
 * Pricing — Animated cards with counting prices and stagger reveal.
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/shared/utils";
import anime from "animejs";
import { Button } from "@/components/ui/button";
import { Check, Minus, ChevronDown } from "lucide-react";
import { useAnimeOnView } from "./use-anime";

const plans = [
    {
        id: "hobby", name: "Hobby", description: "Test the waters",
        price: { monthly: 0, yearly: 0 },
        features: ["Up to 50 products", "Store theme", "Cash on delivery", "Order management", "Community support"],
        cta: "Start Free", highlighted: false,
    },
    {
        id: "pro", name: "Pro", description: "For serious sellers",
        price: { monthly: 2500, yearly: 25000 },
        features: ["Unlimited products", "eSewa, Khalti & IME Pay", "Custom domain", "Real-time analytics", "Priority WhatsApp support", "FB & Instagram sync"],
        cta: "Start 14-Day Trial", highlighted: true,
    },
    {
        id: "scale", name: "Scale", description: "High volume brands",
        price: { monthly: 6000, yearly: 60000 },
        features: ["Everything in Pro", "Multi-store dashboard", "Developer API", "Dedicated success manager", "99.9% uptime SLA"],
        cta: "Talk to Sales", highlighted: false,
    },
];

type V = true | false | string;
const compareRows: [string, V, V, V][] = [
    ["Products", "50", "Unlimited", "Unlimited"],
    ["Store themes", "1", "All", "All + custom"],
    ["Custom domain", false, true, true],
    ["eSewa & Khalti", false, true, true],
    ["Cash on delivery", true, true, true],
    ["Real-time analytics", false, true, true],
    ["FB & Instagram sync", false, true, true],
    ["Multi-store dashboard", false, false, true],
    ["Developer API", false, false, true],
    ["Dedicated success manager", false, false, true],
    ["99.9% uptime SLA", false, false, true],
    ["Support", "Community", "Priority WhatsApp", "Dedicated"],
];

export function Pricing() {
    const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
    const [showCompare, setShowCompare] = useState(false);
    const priceRefs = useRef<(HTMLSpanElement | null)[]>([]);

    // Animate prices on billing toggle
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        priceRefs.current.forEach((el) => {
            if (!el) return;
            anime({
                targets: el,
                opacity: [0.3, 1],
                translateY: [billing === "yearly" ? -8 : 8, 0],
                easing: "easeOutCubic",
                duration: 300,
            });
        });
    }, [billing]);

    const containerRef = useAnimeOnView(
        useCallback((el: HTMLElement) => [
            {
                targets: el.querySelectorAll("[data-plan]"),
                opacity: [0, 1],
                translateY: [50, 0],
                easing: "easeOutCubic",
                duration: 700,
                delay: anime.stagger(120),
            },
            {
                targets: el.querySelectorAll("[data-feature]"),
                opacity: [0, 1],
                translateX: [-10, 0],
                easing: "easeOutCubic",
                duration: 400,
                delay: anime.stagger(30, { start: 500 }),
            },
        ], [])
    );

    return (
        <section id="pricing" className="py-24 sm:py-32 bg-background scroll-mt-28">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="max-w-2xl mb-16">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Pricing</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1] mb-6">
                        Simple pricing.
                        <br />
                        <span className="text-muted-foreground">No surprises.</span>
                    </h2>
                </div>

                {/* Billing toggle */}
                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 mb-16">
                    {(["monthly", "yearly"] as const).map((b) => (
                        <button
                            key={b}
                            onClick={() => setBilling(b)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                                billing === b ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {b === "monthly" ? "Monthly" : "Yearly"}{" "}
                            {b === "yearly" && <span className="text-xs text-emerald-500">−20%</span>}
                        </button>
                    ))}
                </div>

                {/* Plan grid */}
                <div ref={containerRef} className="grid md:grid-cols-3 gap-4">
                    {plans.map((plan, idx) => (
                        <div
                            key={plan.id}
                            data-plan
                            className={cn(
                                "relative rounded-2xl border p-8 flex flex-col hover:-translate-y-1 transition-all duration-300",
                                plan.highlighted
                                    ? "border-foreground/20 bg-foreground/[0.02] ring-1 ring-foreground/10"
                                    : "border-border/50 hover:border-border"
                            )}
                            style={{ opacity: 0 }}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">{plan.name}</p>
                            <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                            <div className="mb-8">
                                <span
                                    ref={(el) => { priceRefs.current[idx] = el; }}
                                    className="inline-block text-4xl md:text-5xl font-semibold text-foreground tracking-tight tabular-nums"
                                >
                                    {plan.price[billing] === 0 ? "Free" : `Rs ${plan.price[billing].toLocaleString()}`}
                                </span>
                                {plan.price[billing] > 0 && (
                                    <span className="text-sm text-muted-foreground ml-1">/{billing === "monthly" ? "mo" : "yr"}</span>
                                )}
                            </div>

                            <Link href={plan.cta === "Talk to Sales" ? "mailto:sales@indigo.com.np" : "/login"} className="block mb-10">
                                <Button variant={plan.highlighted ? "default" : "outline"} className="w-full h-11 rounded-full text-sm">
                                    {plan.cta}
                                </Button>
                            </Link>

                            <ul className="space-y-3">
                                {plan.features.map((f) => (
                                    <li key={f} data-feature className="flex items-start gap-3 text-sm text-muted-foreground" style={{ opacity: 0 }}>
                                        <Check strokeWidth={1.5} className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Compare all features */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => setShowCompare(!showCompare)}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Compare all features
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showCompare && "rotate-180")} />
                    </button>

                    {showCompare && (
                        <div className="mt-8 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="py-3 pr-4 text-muted-foreground font-medium w-1/3">Feature</th>
                                        {plans.map((p) => (
                                            <th key={p.id} className="py-3 px-4 text-foreground font-medium text-center">{p.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {compareRows.map(([label, ...vals]) => (
                                        <tr key={label as string} className="border-b border-border/30">
                                            <td className="py-3 pr-4 text-muted-foreground">{label}</td>
                                            {vals.map((v, i) => (
                                                <td key={i} className="py-3 px-4 text-center">
                                                    {v === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> :
                                                     v === false ? <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" /> :
                                                     <span className="text-foreground/80">{v}</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
