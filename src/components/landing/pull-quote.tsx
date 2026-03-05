"use client";

import { useAnimeOnView } from "./use-anime";
import { useCallback } from "react";

export function PullQuote() {
    const ref = useAnimeOnView(
        useCallback(
            (el: HTMLElement) => [
                {
                    targets: el.querySelector("[data-quote]"),
                    opacity: [0, 1],
                    translateY: [30, 0],
                    easing: "easeOutCubic",
                    duration: 800,
                },
                {
                    targets: el.querySelector("[data-author]"),
                    opacity: [0, 1],
                    translateY: [15, 0],
                    easing: "easeOutCubic",
                    duration: 600,
                    delay: 400,
                },
            ],
            []
        )
    );

    return (
        <section ref={ref} className="py-24 sm:py-32 bg-[#09090b]">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <blockquote
                    data-quote
                    className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug text-white/90"
                    style={{ opacity: 0 }}
                >
                    &ldquo;We went from zero to 200 orders a day in three months. Indigo made e-commerce
                    possible for us in a market where no one else was building.&rdquo;
                </blockquote>
                <div data-author className="mt-8 flex items-center justify-center gap-3" style={{ opacity: 0 }}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-semibold text-white">
                        B
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-white/70">Bikash Thapa</p>
                        <p className="text-xs text-white/30">CEO, Kathmandu Bazaar</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
