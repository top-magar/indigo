"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/shared/utils";

export function MovingBorder({
  children,
  className,
  containerClassName,
  duration = 3000,
  borderRadius = "0.75rem",
  borderWidth = 1.5,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  duration?: number;
  borderRadius?: string;
  borderWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    let start: number;
    let id: number;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const tick = (ts: number) => {
      if (!start) start = ts;
      setAngle(((ts - start) / duration) * 360 % 360);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [duration]);

  const gradient = `conic-gradient(from ${angle}deg, transparent 0%, var(--ds-blue-500) 5%, var(--ds-purple-500) 10%, var(--ds-pink-500) 15%, var(--ds-amber-500) 20%, transparent 30%)`;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", containerClassName)}
      style={{ borderRadius, padding: borderWidth }}
    >
      <div
        className="absolute inset-0"
        style={{ background: gradient }}
      />
      <div
        className={cn("relative", className)}
        style={{ borderRadius: `calc(${borderRadius} - ${borderWidth}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
