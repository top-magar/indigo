"use client";

import { useRef, useEffect, useState, type ReactNode, Children } from "react";
import { cn } from "@/lib/utils";

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

export function StaggeredList({
  children,
  className,
  stagger = 100,
  duration = 400,
  delay = 0,
  threshold = 0.1,
  once = true,
}: StaggeredListProps) {
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

  const childArray = Children.toArray(children);

  return (
    <div ref={ref} className={cn(className)}>
      {childArray.map((child, index) => (
        <div
          key={index}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: `all ${duration}ms ease-out ${delay + index * stagger}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
