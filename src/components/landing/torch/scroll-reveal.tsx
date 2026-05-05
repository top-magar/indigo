"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ScrollReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If element is already in viewport on mount, show immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: animated ? 1 : 0,
        transform: animated ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {children}
    </div>
  );
}
