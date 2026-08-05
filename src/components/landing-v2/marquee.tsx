"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Children } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  maskEdges?: boolean;
  gap?: number;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  duplicate?: boolean;
  label?: string;
  style?: CSSProperties;
};

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

export function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
  maskEdges = true,
  gap = 16,
  pauseOnHover = true,
  pauseOnFocus = true,
  duplicate = true,
  label,
  style,
}: MarqueeProps) {
  const reducedMotion = useReducedMotionPreference();
  const [paused, setPaused] = useState(false);

  const trackStyle: CSSProperties = reducedMotion
    ? { animation: "none" }
    : {
        animationDuration: `${duration}s`,
        animationDirection: reverse ? "reverse" : undefined,
        animationPlayState: paused ? "paused" : undefined,
      };

  const groupStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    columnGap: gap,
    paddingRight: gap,
  };

  const maskStyle: CSSProperties | undefined = maskEdges
    ? {
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : undefined;

  const renderGroup = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="lv2-marquee__group"
      style={groupStyle}
    >
      {Children.map(children, (child, index) => (
        <li className="lv2-marquee__item" key={index} style={{ flexShrink: 0 }}>
          {child}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      role={label ? "region" : undefined}
      aria-label={label}
      className={cn("lv2-marquee", className)}
      data-direction={reverse ? "reverse" : "normal"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      style={{ overflow: "hidden", ...maskStyle, ...style }}
    >
      <div
        className="lv2-marquee__track animate-marquee"
        data-paused={paused ? "true" : "false"}
        onBlur={
          pauseOnFocus && !reducedMotion
            ? () => setPaused(false)
            : undefined
        }
        onFocus={
          pauseOnFocus && !reducedMotion ? () => setPaused(true) : undefined
        }
        onMouseEnter={
          pauseOnHover && !reducedMotion
            ? () => setPaused(true)
            : undefined
        }
        onMouseLeave={
          pauseOnHover && !reducedMotion ? () => setPaused(false) : undefined
        }
        style={{ display: "flex", width: "max-content", ...trackStyle }}
      >
        {renderGroup(false)}
        {duplicate && !reducedMotion ? renderGroup(true) : null}
      </div>
    </div>
  );
}
