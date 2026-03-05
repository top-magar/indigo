/**
 * CTA — Aceternity BackgroundBeamsWithCollision replacing anime.js particles.
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { BackgroundBeamsWithCollision } from "@/components/ui/aceternity/background-beams-with-collision";

export function CTA() {
    return (
        <BackgroundBeamsWithCollision className="relative py-32 md:py-40 bg-foreground overflow-hidden">
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
        </BackgroundBeamsWithCollision>
    );
}
