/**
 * AnnouncementBar — Shopify-style dismissible promo banner.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

export function AnnouncementBar() {
    const [dismissed, setDismissed] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        let last = 0;
        const onScroll = () => {
            const y = window.scrollY;
            setHidden(y > 100 && y > last);
            last = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (dismissed) return null;

    return (
        <div
            id="announcement-bar"
            className="sticky top-0 bg-foreground text-background text-center text-xs py-2.5 px-10 z-[60] transition-transform duration-300"
            style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
        >            <span className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">Dashain Sale — 30% off Pro & Scale plans.</span>
                <Link href="/signup" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
                    Claim offer →
                </Link>
            </span>
            <button
                onClick={() => setDismissed(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-60 transition-opacity"
                aria-label="Dismiss announcement"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
