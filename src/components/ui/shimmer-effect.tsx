"use client";

import { cn } from "@/shared/utils";

interface ShimmerEffectProps {
  className?: string;
  height?: string | number;
  width?: string | number;
}

export function ShimmerEffect({
  className,
  height = "100%",
  width = "100%",
}: ShimmerEffectProps) {
  return (
    <div
      className={cn("relative overflow-hidden bg-muted rounded-lg", className)}
      style={{ height, width }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
