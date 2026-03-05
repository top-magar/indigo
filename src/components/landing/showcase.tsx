/**
 * Showcase — Horizontal auto-scrolling store template carousel (Shopify-inspired).
 * Shows real merchant store previews with hover pause and anime.js entrance.
 */

"use client";

import { useCallback } from "react";
import { useAnimeOnView } from "./use-anime";
import anime from "animejs";

const stores = [
    { name: "Himalayan Threads", category: "Fashion", color: "from-rose-500/20 to-pink-500/20", accent: "bg-rose-500" },
    { name: "Kathmandu Bazaar", category: "Marketplace", color: "from-amber-500/20 to-orange-500/20", accent: "bg-amber-500" },
    { name: "Nepal Tea House", category: "Food & Drink", color: "from-emerald-500/20 to-green-500/20", accent: "bg-emerald-500" },
    { name: "Yeti Electronics", category: "Electronics", color: "from-blue-500/20 to-indigo-500/20", accent: "bg-blue-500" },
    { name: "Pashmina Palace", category: "Luxury", color: "from-purple-500/20 to-violet-500/20", accent: "bg-purple-500" },
    { name: "Everest Outdoors", category: "Sports", color: "from-cyan-500/20 to-sky-500/20", accent: "bg-cyan-500" },
    { name: "Thanka Art Studio", category: "Art & Craft", color: "from-yellow-500/20 to-amber-500/20", accent: "bg-yellow-500" },
    { name: "Durbar Spices", category: "Grocery", color: "from-red-500/20 to-rose-500/20", accent: "bg-red-500" },
];

function StoreCard({ store }: { store: (typeof stores)[0] }) {
    return (
        <div className="w-[300px] shrink-0 group">
            <div className={`rounded-2xl border border-border/50 overflow-hidden bg-gradient-to-br ${store.color} hover:border-border transition-all duration-300 hover:-translate-y-1`}>
                {/* Mock browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/30">
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                    <div className="ml-3 h-5 flex-1 rounded-md bg-foreground/5 flex items-center px-2">
                        <span className="text-[10px] text-muted-foreground/50 truncate">
                            {store.name.toLowerCase().replace(/\s+/g, "")}.indigo.store
                        </span>
                    </div>
                </div>

                {/* Mock store content */}
                <div className="p-5 space-y-3 h-[180px]">
                    <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md ${store.accent}/20`} />
                        <div className="h-3 w-24 rounded bg-foreground/10" />
                    </div>
                    <div className="h-2.5 w-full rounded bg-foreground/5" />
                    <div className="h-2.5 w-3/4 rounded bg-foreground/5" />
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square rounded-lg bg-foreground/5" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Label */}
            <div className="mt-3 px-1">
                <p className="text-sm font-medium text-foreground">{store.name}</p>
                <p className="text-xs text-muted-foreground">{store.category}</p>
            </div>
        </div>
    );
}

export function Showcase() {
    const headerRef = useAnimeOnView(
        useCallback((el: HTMLElement) => ({
            targets: el.querySelectorAll("[data-animate]"),
            opacity: [0, 1],
            translateY: [30, 0],
            easing: "easeOutCubic",
            duration: 600,
            delay: anime.stagger(100),
        }), [])
    );

    return (
        <section className="py-24 sm:py-32 overflow-hidden">
            <div ref={headerRef} className="max-w-7xl mx-auto px-6 mb-12">
                <p data-animate className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4" style={{ opacity: 0 }}>
                    Showcase
                </p>
                <div data-animate className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4" style={{ opacity: 0 }}>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Stores built with Indigo
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        From fashion to electronics — 12,000+ merchants trust Indigo to power their online business.
                    </p>
                </div>
            </div>

            {/* Scrolling carousel */}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

                <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] pl-6">
                    {[...stores, ...stores].map((store, i) => (
                        <StoreCard key={`${store.name}-${i}`} store={store} />
                    ))}
                </div>
            </div>
        </section>
    );
}
