"use client";

/**
 * Motion Wrapper Component
 * Wraps blocks with Framer Motion animations for entrance, scroll, and hover effects
 */

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { BlockAnimation } from "./types";
import { DEFAULT_BLOCK_ANIMATION } from "./types";
import { useInViewAnimation } from "./use-scroll-animation";

interface MotionWrapperProps {
  /** Animation configuration for the block */
  animation?: BlockAnimation;
  /** Content to be animated */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is in editor preview mode */
  isEditorPreview?: boolean;
}

/**
 * MotionWrapper Component
 * Wraps children with Framer Motion animations based on BlockAnimation config
 */
export function MotionWrapper({
  animation,
  children,
  className,
}: MotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  // Merge with defaults
  const config = useMemo(() => ({
    ...DEFAULT_BLOCK_ANIMATION,
    ...animation,
    entrance: { ...DEFAULT_BLOCK_ANIMATION.entrance, ...animation?.entrance },
    hover: { ...DEFAULT_BLOCK_ANIMATION.hover, ...animation?.hover },
  }), [animation]);

  // Check if animations should be disabled
  const shouldDisableAnimations = config.respectReducedMotion && prefersReducedMotion;

  // Get in-view detection for entrance animations
  const { ref: inViewRef, isInView: hasEnteredView } = useInViewAnimation({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Determine if any animation is active
  const hasEntranceAnimation = config.entrance.type !== "none";
  const hasHoverAnimation = config.hover.type !== "none";
  const hasAnyAnimation = hasEntranceAnimation || hasHoverAnimation;

  // If no animations or reduced motion, render without motion wrapper
  if (!hasAnyAnimation || shouldDisableAnimations) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  // Build entrance variants
  const entranceVariants = useMemo(() => {
    const { type, duration = 500, delay = 0, distance = 20, scale = 0.95 } = config.entrance;
    const baseTransition = {
      duration: duration / 1000,
      delay: delay / 1000,
      ease: [0, 0, 0.58, 1] as [number, number, number, number],
    };

    switch (type) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: baseTransition },
        };
      case "slide-up":
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0, transition: baseTransition },
        };
      case "slide-down":
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0, transition: baseTransition },
        };
      case "zoom-in":
        return {
          hidden: { opacity: 0, scale },
          visible: { opacity: 1, scale: 1, transition: baseTransition },
        };
      default:
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 },
        };
    }
  }, [config.entrance]);

  // Build hover props
  const hoverProps = useMemo(() => {
    const { type, intensity = 50, duration = 200 } = config.hover;
    const intensityFactor = intensity / 100;

    if (type === "none") return {};

    switch (type) {
      case "lift":
        return {
          whileHover: {
            y: -intensityFactor * 10,
            boxShadow: `0 ${intensityFactor * 20}px ${intensityFactor * 40}px rgba(0, 0, 0, ${intensityFactor * 0.15})`,
          },
          transition: { duration: duration / 1000 },
        };
      case "scale":
        return {
          whileHover: { scale: 1 + intensityFactor * 0.05 },
          transition: { duration: duration / 1000 },
        };
      default:
        return {};
    }
  }, [config.hover]);

  return (
    <motion.div
      ref={inViewRef}
      className={className}
      initial={hasEntranceAnimation ? "hidden" : undefined}
      animate={hasEntranceAnimation ? (hasEnteredView ? "visible" : "hidden") : undefined}
      variants={entranceVariants}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
}

/**
 * HOC version for wrapping existing components
 */
export function withMotionWrapper<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultAnimation?: BlockAnimation
) {
  const WithMotion = React.forwardRef<HTMLDivElement, P & { animation?: BlockAnimation }>(
    ({ animation, ...props }, _ref) => {
      return (
        <MotionWrapper animation={animation ?? defaultAnimation}>
          <WrappedComponent {...(props as P)} />
        </MotionWrapper>
      );
    }
  );

  WithMotion.displayName = `WithMotion(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return WithMotion;
}

export default MotionWrapper;
