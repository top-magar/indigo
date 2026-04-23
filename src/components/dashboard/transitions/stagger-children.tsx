"use client";

import React, { Children, type ElementType } from "react";
import { cn } from "@/shared/utils";

export interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  duration?: number;
  initialDelay?: number;
  disabled?: boolean;
  variant?: "fade" | "slide-up" | "scale";
  as?: ElementType;
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 50,
  duration = 150,
  initialDelay = 0,
  disabled = false,
  as: Component = "div",
}: StaggerChildrenProps) {
  const childArray = Children.toArray(children);

  if (disabled) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component className={className}>
      {childArray.map((child, i) => (
        <div
          key={i}
          className="animate-in fade-in"
          style={{
            animationDuration: `${duration}ms`,
            animationDelay: `${initialDelay + i * staggerDelay}ms`,
            animationFillMode: "both",
          }}
        >
          {child}
        </div>
      ))}
    </Component>
  );
}

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fade" | "slide-up" | "scale";
  duration?: number;
}

export function StaggerItem({
  children,
  className,
  duration = 150,
}: StaggerItemProps) {
  return (
    <div
      className={cn("animate-in fade-in", className)}
      style={{ animationDuration: `${duration}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

export default StaggerChildren;
