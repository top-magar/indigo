/**
 * CTA — Animated final call-to-action with floating particles and gradient mesh.
 */

"use client";

import { useRef, useEffect } from "react";
import anime from "animejs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // Floating particles
        anime({
            targets: ref.current.querySelectorAll("[data-particle]"),
            translateY: () => anime.random(-30, 30),
            translateX: () => anime.random(-20, 20),
            opacity: [0, () => anime.random(2, 5) / 10],
            scale: [0, () => anime.random(5, 15) / 10],
            easing: "easeInOutSine",
            duration: () => anime.random(3000, 5000),
            delay: anime.stagger(200),
            direction: "alternate",
            loop: true,
        });

        // Pulsing orbs
        anime({
            targets: ref.current.querySelectorAll("[data-orb]"),
            scale: [1, 1.15],
            opacity: [0.1, 0.2],
            easing: "easeInOutSine",
            duration: 4000,
            direction: "alternate",
            loop: true,
            delay: anime.stagger(1000),
        });
    }, []);

    return (
        <section ref={ref} className="relative py-32 md:py-40 bg-foreground overflow-hidden">
            {/* Gradient mesh orbs */}
            <div className="pointer-events-none absolute inset-0">
                <div data-orb className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
                <div data-orb className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div data-orb className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px]" />
            </div>

            {/* Floating particles */}
            <div className="pointer-events-none absolute inset-0">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        data-particle
                        className="absolute w-1.5 h-1.5 rounded-full bg-background/20"
                        style={{
                            top: `${10 + (i * 31) % 80}%`,
                            left: `${5 + (i * 37) % 90}%`,
                            opacity: 0,
                        }}
                    />
                ))}
            </div>

            <div className="relative max-w-3xl mx-auto px-6 text-center">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-background tracking-tight leading-[0.95] mb-6">
                    Your store. Your rules.
                    <br />
                    <span className="text-background/30">Your success.</span>
                </h2>
                <Link href="/signup">
                    <Button
                        size="lg"
                        className="h-14 px-10 text-base rounded-full gap-2 bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-all duration-300 landing-btn"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
                <p className="mt-6 text-xs text-background/25 tracking-wide">
                    Start for free. No credit card required.
                </p>

                {/* Social proof reinforcement */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-background/20">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {["A", "B", "S", "P", "D"].map((l, i) => (
                                <div key={l} className="w-7 h-7 rounded-full bg-background/10 border-2 border-foreground flex items-center justify-center text-[10px] font-medium text-background/40" style={{ zIndex: 5 - i }}>
                                    {l}
                                </div>
                            ))}
                        </div>
                        <span className="text-xs">12,000+ merchants</span>
                    </div>
                    <span className="hidden sm:inline text-background/10">·</span>
                    <span className="text-xs">Rs 2.1B+ processed</span>
                    <span className="hidden sm:inline text-background/10">·</span>
                    <span className="text-xs">4.8★ average rating</span>
                </div>
            </div>
        </section>
    );
}
