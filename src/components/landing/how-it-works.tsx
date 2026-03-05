/**
 * How It Works — Animated numbered steps with stagger reveal.
 */

"use client";

import { useCallback } from "react";
import anime from "animejs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAnimeOnView } from "./use-anime";

const steps = [
    { num: "1", title: "Create your store", description: "Pick a theme, add your products, and set prices. Takes under 5 minutes.", color: "bg-purple-500" },
    { num: "2", title: "Connect payments", description: "Link eSewa, Khalti, or bank transfer. Start accepting money immediately.", color: "bg-emerald-500" },
    { num: "3", title: "Set up shipping", description: "Connect Pathao for one-click delivery. Auto labels and tracking included.", color: "bg-blue-500" },
    { num: "4", title: "Start selling", description: "Share your store link. Orders flow in. Manage everything from one dashboard.", color: "bg-amber-500" },
];

export function HowItWorks() {
    const containerRef = useAnimeOnView(
        useCallback((el: HTMLElement) => [
            {
                targets: el.querySelectorAll("[data-step]"),
                opacity: [0, 1],
                translateY: [50, 0],
                scale: [0.9, 1],
                easing: "easeOutCubic",
                duration: 700,
                delay: anime.stagger(150),
            },
            {
                targets: el.querySelectorAll("[data-num]"),
                scale: [0, 1],
                rotate: ["-90deg", "0deg"],
                easing: "easeOutElastic(1, .6)",
                duration: 1000,
                delay: anime.stagger(150, { start: 200 }),
            },
        ], [])
    );

    return (
        <section className="py-24 sm:py-32 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
                    <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Getting started</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                            How to launch your store
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground">
                            Four steps. Five minutes. You&apos;re live.
                        </p>
                    </div>
                    <Link href="/signup">
                        <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                            Get Started <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>

                <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {steps.map((s, i) => (
                        <div
                            key={s.num}
                            data-step
                            className="group relative rounded-2xl border border-border/50 p-6 hover:border-border hover:-translate-y-2 transition-all duration-300"
                            style={{ opacity: 0 }}
                        >
                            {/* Connecting line */}
                            {i < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 -right-2 w-4 h-px bg-border/50 z-10" />
                            )}
                            <div
                                data-num
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${s.color} text-white text-sm font-semibold mb-4 group-hover:scale-110 transition-transform duration-300`}
                                style={{ transform: "scale(0)" }}
                            >
                                {s.num}
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">{s.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
