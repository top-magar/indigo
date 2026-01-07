"use client";

/**
 * Fade In Component
 * Simple fade-in animation wrapper for individual elements
 * 
 * Features:
 * - Minimal, non-distracting animation
 * - Fast duration (< 200ms)
 * - Respects prefers-reduced-motion
 * - Optional scale effect for emphasis
 */

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface FadeInProps {
  /** Content to animate */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Animation duration in milliseconds (default: 150ms) */
  duration?: number;
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number;
  /** Whether to include a subtle scale effect (default: false) */
  withScale?: boolean;
  /** Initial scale when withScale is true (default: 0.98) */
  initialScale?: number;
  /** Whether to disable animation entirely */
  disabled?: boolean;
  /** Direction to fade from: 'none' | 'up' | 'down' | 'left' | 'right' (default: 'none') */
  direction?: "none" | "up" | "down" | "left" | "right";
  /** Distance to travel when direction is set (default: 8px) */
  distance?: number;
  /** Whether to animate only once when entering viewport */
  once?: boolean;
}

const getDirectionOffset = (
  direction: FadeInProps["direction"],
  distance: number
): { x?: number; y?: number } => {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
};

/**
 * FadeIn provides a simple fade animation for individual elements.
 * Use for elements that should appear smoothly without complex animations.
 * 
 * @example
 * ```tsx
 * // Simple fade
 * <FadeIn>
 *   <Card>Content</Card>
 * </FadeIn>
 * 
 * // Fade with slide up
 * <FadeIn direction="up" distance={12}>
 *   <Notification />
 * </FadeIn>
 * 
 * // Fade with scale for emphasis
 * <FadeIn withScale>
 *   <Modal />
 * </FadeIn>
 * ```
 */
export function FadeIn({
  children,
  className,
  duration = 150,
  delay = 0,
  withScale = false,
  initialScale = 0.98,
  disabled = false,
  direction = "none",
  distance = 8,
  once = true,
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  // Skip animation if disabled or user prefers reduced motion
  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const directionOffset = getDirectionOffset(direction, distance);

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...(withScale && { scale: initialScale }),
      ...directionOffset,
    },
    visible: {
      opacity: 1,
      ...(withScale && { scale: 1 }),
      ...(direction !== "none" && { x: 0, y: 0 }),
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      viewport={once ? { once: true } : undefined}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeInOnScroll animates when the element enters the viewport.
 * Useful for content below the fold.
 */
export interface FadeInOnScrollProps extends Omit<FadeInProps, "once"> {
  /** Threshold for triggering animation (0-1, default: 0.1) */
  threshold?: number;
  /** Whether to animate only once (default: true) */
  once?: boolean;
}

export function FadeInOnScroll({
  children,
  className,
  duration = 150,
  delay = 0,
  withScale = false,
  initialScale = 0.98,
  disabled = false,
  direction = "none",
  distance = 8,
  threshold = 0.1,
  once = true,
}: FadeInOnScrollProps) {
  const prefersReducedMotion = useReducedMotion();

  // Skip animation if disabled or user prefers reduced motion
  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const directionOffset = getDirectionOffset(direction, distance);

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...(withScale && { scale: initialScale }),
      ...directionOffset,
    },
    visible: {
      opacity: 1,
      ...(withScale && { scale: 1 }),
      ...(direction !== "none" && { x: 0, y: 0 }),
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={variants}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
