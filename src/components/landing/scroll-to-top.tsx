/**
 * ScrollToTop — Floating back-to-top button that appears after scrolling.
 */

"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/shared/utils";

export function ScrollToTop() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > 600);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className={cn(
                "fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-foreground/80 text-background flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-foreground hover:scale-110",
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
        >
            <ArrowUp className="w-4 h-4" />
        </button>
    );
}
