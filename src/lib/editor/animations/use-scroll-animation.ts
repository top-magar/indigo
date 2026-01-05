/**
 * Scroll Animation Hook
 * Uses Intersection Observer for scroll-triggered animations
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { ScrollAnimation } from "./types";

interface UseScrollAnimationOptions {
  animation?: ScrollAnimation;
  respectReducedMotion?: boolean;
}

interface ScrollAnimationResult {
  ref: React.RefObject<HTMLDivElement | null>;
  isInView: boolean;
  scrollProgress: MotionValue<number> | number;
  parallaxY: MotionValue<number>;
  fadeOpacity: MotionValue<number>;
  scaleValue: MotionValue<number>;
}

/**
 * Hook for scroll-triggered animations using Intersection Observer
 */
export function useScrollAnimation({
  animation,
  respectReducedMotion = true,
}: UseScrollAnimationOptions): ScrollAnimationResult {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Check if animations should be disabled
  const shouldDisableAnimations = respectReducedMotion && prefersReducedMotion;
  const isAnimationEnabled = animation?.type && animation.type !== "none" && !shouldDisableAnimations;

  // Scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [
      `start ${100 - (animation?.triggerStart ?? 20)}%`,
      `end ${100 - (animation?.triggerEnd ?? 80)}%`,
    ],
  });

  // Calculate intensity factor (0-1 range from 0-100)
  const intensity = (animation?.intensity ?? 50) / 100;

  // Transform values based on animation type
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [intensity * 100, -intensity * 100]
  );

  const fadeOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0]
  );

  const scaleValue = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1 - intensity * 0.3, 1, 1 - intensity * 0.3]
  );

  // Intersection Observer for visibility detection
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    isInView,
    scrollProgress: isAnimationEnabled ? scrollYProgress : 0,
    parallaxY,
    fadeOpacity,
    scaleValue,
  };
}

/**
 * Simple hook for detecting when an element enters the viewport
 */
export function useInViewAnimation(options?: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options ?? {};

  useEffect(() => {
    if (!ref.current) return;
    if (triggerOnce && hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        if (inView && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref, isInView: triggerOnce ? hasTriggered || isInView : isInView };
}

export default useScrollAnimation;
