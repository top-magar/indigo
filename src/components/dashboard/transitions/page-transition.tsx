"use client";

/**
 * Page Transition Component
 * Provides subtle fade + slide up animation for page content
 * 
 * Features:
 * - Fast duration (150-200ms) for snappy feel
 * - Respects prefers-reduced-motion
 * - Works without animation wrapper (graceful degradation)
 */

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface PageTransitionProps {
  /** Content to animate */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Animation duration in milliseconds (default: 180ms) */
  duration?: number;
  /** Slide distance in pixels (default: 8px for subtle effect) */
  distance?: number;
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number;
  /** Whether to disable animation entirely */
  disabled?: boolean;
}

const pageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -4,
  },
};

/**
 * PageTransition wraps page content with a subtle fade + slide up animation.
 * Designed to be fast and non-distracting while adding polish to navigation.
 * 
 * @example
 * ```tsx
 * <PageTransition>
 *   <DashboardContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  className,
  duration = 180,
  distance = 8,
  delay = 0,
  disabled = false,
}: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  // Skip animation if disabled or user prefers reduced motion
  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const customVariants: Variants = {
    hidden: {
      opacity: 0,
      y: distance,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -distance / 2,
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={distance === 8 ? pageVariants : customVariants}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.25, 0.1, 0.25, 1], // Smooth ease-out curve
      }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
