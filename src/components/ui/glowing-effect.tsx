"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function GlowingEffect({
  children,
  className,
  blur = 0,
  borderWidth = 1,
  spread = 20,
  variant = "default",
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  borderWidth?: number;
  spread?: number;
  variant?: "default" | "white";
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  if (disabled) return <div className={className}>{children}</div>;

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  }

  const gradient =
    variant === "white"
      ? `conic-gradient(from 0deg at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.8) 0deg, transparent ${spread}deg, transparent 360deg)`
      : `conic-gradient(from 0deg at ${pos.x}px ${pos.y}px, #ef4444 0deg, #eab308 60deg, #22c55e 120deg, #3b82f6 180deg, #8b5cf6 240deg, #ec4899 300deg, #ef4444 360deg)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative", className)}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: opacity * 0.5,
          background: gradient,
          filter: blur ? `blur(${blur}px)` : undefined,
          maskImage: `radial-gradient(${spread * 8}px circle at ${pos.x}px ${pos.y}px, black 0%, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(${spread * 8}px circle at ${pos.x}px ${pos.y}px, black 0%, transparent 70%)`,
          padding: borderWidth,
        }}
      />
      <div className="relative rounded-[inherit] bg-card">{children}</div>
    </div>
  );
}
