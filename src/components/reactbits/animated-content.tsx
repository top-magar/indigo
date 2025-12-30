"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimationType = "fade" | "slide" | "scale" | "blur" | "rotate";

interface AnimatedContentProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  stagger?: number;
  threshold?: number;
  once?: boolean;
}

export function AnimatedContent({
  children,
  className,
  animation = "fade",
  duration = 600,
  delay = 0,
  threshold = 0.1,
  once = true,
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getInitialStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
    };

    if (!isVisible) {
      switch (animation) {
        case "fade":
          return { ...base, opacity: 0 };
        case "slide":
          return { ...base, opacity: 0, transform: "translateY(30px)" };
        case "scale":
          return { ...base, opacity: 0, transform: "scale(0.9)" };
        case "blur":
          return { ...base, opacity: 0, filter: "blur(10px)" };
        case "rotate":
          return { ...base, opacity: 0, transform: "rotate(-5deg) scale(0.95)" };
        default:
          return { ...base, opacity: 0 };
      }
    }

    return {
      ...base,
      opacity: 1,
      transform: "none",
      filter: "none",
    };
  };

  return (
    <div ref={ref} className={cn(className)} style={getInitialStyles()}>
      {children}
    </div>
  );
}
