/**
 * useAnimeOnView — Trigger anime.js animations when elements scroll into view.
 * Respects prefers-reduced-motion.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import anime from "animejs";

type AnimeParams = anime.AnimeParams;

export function useAnimeOnView(
    getParams: (el: HTMLElement) => AnimeParams | AnimeParams[],
    options?: { threshold?: number; once?: boolean }
) {
    const ref = useRef<HTMLDivElement>(null);
    const hasRun = useRef(false);

    const animate = useCallback(() => {
        if (!ref.current) return;
        const params = getParams(ref.current);
        if (Array.isArray(params)) {
            params.forEach((p) => anime(p));
        } else {
            anime(params);
        }
    }, [getParams]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect reduced motion
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !(options?.once !== false && hasRun.current)) {
                    hasRun.current = true;
                    animate();
                }
            },
            { threshold: options?.threshold ?? 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [animate, options?.threshold, options?.once]);

    return ref;
}

/** Stagger-fade-up children of a container */
export function useStaggerUp(delay = 80) {
    return useAnimeOnView(
        useCallback(
            (el: HTMLElement) => ({
                targets: el.querySelectorAll("[data-animate]"),
                opacity: [0, 1],
                translateY: [30, 0],
                easing: "easeOutCubic",
                duration: 700,
                delay: anime.stagger(delay),
            }),
            [delay]
        )
    );
}

/** Counter animation for stat numbers */
export function useCountUp(selector = "[data-count]") {
    return useAnimeOnView(
        useCallback(
            (el: HTMLElement) => {
                const targets = el.querySelectorAll(selector);
                const anims: AnimeParams[] = [];
                targets.forEach((t) => {
                    const end = parseFloat(t.getAttribute("data-count") || "0");
                    const suffix = t.getAttribute("data-suffix") || "";
                    const prefix = t.getAttribute("data-prefix") || "";
                    anims.push({
                        targets: { val: 0 },
                        val: end,
                        round: end % 1 === 0 ? 1 : 10,
                        easing: "easeOutExpo",
                        duration: 1800,
                        update(anim) {
                            const obj = anim.animatables[0].target as unknown as { val: number };
                            t.textContent = `${prefix}${obj.val.toLocaleString()}${suffix}`;
                        },
                    });
                });
                return anims;
            },
            [selector]
        )
    );
}
