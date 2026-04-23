"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  withScale?: boolean;
  initialScale?: number;
  disabled?: boolean;
  direction?: "none" | "up" | "down" | "left" | "right";
  distance?: number;
  once?: boolean;
}

export function FadeIn({
  children,
  className,
  duration = 150,
  delay = 0,
  disabled = false,
}: FadeInProps) {
  if (disabled) return <div className={className}>{children}</div>;

  return (
    <div
      className={cn("animate-in fade-in", className)}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: delay ? `${delay}ms` : undefined,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}

export interface FadeInOnScrollProps extends Omit<FadeInProps, "once"> {
  threshold?: number;
  once?: boolean;
}

export function FadeInOnScroll(props: FadeInOnScrollProps) {
  return <FadeIn {...props} />;
}

export default FadeIn;
