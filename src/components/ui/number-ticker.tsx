"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}: {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  decimalPlaces?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState(direction === "down" ? value : 0);

  useEffect(() => {
    if (!inView) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setDisplay(direction === "down" ? 0 : value); return; }
    const start = direction === "down" ? value : 0;
    const end = direction === "down" ? 0 : value;
    const duration = 1000;
    const startTime = performance.now() + delay;

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, direction, delay]);

  return (
    <span ref={ref} className={className}>
      {Intl.NumberFormat("en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(display)}
    </span>
  );
}
