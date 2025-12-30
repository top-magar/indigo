"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "rgba(255, 255, 255, 0.2)",
  shimmerSize = "0.1em",
  borderRadius = "0.5rem",
  shimmerDuration = "2s",
  background = "hsl(var(--primary))",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden px-6 py-3 font-medium text-primary-foreground transition-colors",
        "hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={{
        borderRadius,
        background,
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <span
          className="absolute inset-0 -translate-x-full animate-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            animationDuration: shimmerDuration,
          }}
        />
      </span>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer ${shimmerDuration} infinite;
        }
      `}</style>
    </button>
  );
}
