"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
  disabled?: boolean;
}

export function PageTransition({
  children,
  className,
  duration = 180,
  delay = 0,
  disabled = false,
}: PageTransitionProps) {
  if (disabled) return <div className={className}>{children}</div>;

  return (
    <div
      className={cn("animate-in fade-in slide-in-from-bottom-1", className)}
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

export default PageTransition;
