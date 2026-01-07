"use client";

/**
 * Stagger Children Component
 * Animates children with a staggered delay for lists, cards, and table rows
 * 
 * Features:
 * - Configurable delay between items
 * - Fast animations (< 200ms per item)
 * - Respects prefers-reduced-motion
 * - Works with any child elements
 */

import React, { Children, type ElementType } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface StaggerChildrenProps {
  /** Children to animate with stagger effect */
  children: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
  /** Delay between each child animation in milliseconds (default: 50ms) */
  staggerDelay?: number;
  /** Duration of each child's animation in milliseconds (default: 150ms) */
  duration?: number;
  /** Initial delay before first child animates in milliseconds (default: 0) */
  initialDelay?: number;
  /** Whether to disable animation entirely */
  disabled?: boolean;
  /** Animation type: 'fade' | 'slide-up' | 'scale' (default: 'fade') */
  variant?: "fade" | "slide-up" | "scale";
  /** HTML element to render as container (default: 'div') */
  as?: ElementType;
}

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const variantMap = {
  fade: fadeVariants,
  "slide-up": slideUpVariants,
  scale: scaleVariants,
};

/**
 * StaggerChildren animates a list of children with a staggered delay.
 * Perfect for lists of cards, table rows, or any repeated content.
 * 
 * @example
 * ```tsx
 * <StaggerChildren staggerDelay={30} variant="slide-up">
 *   {products.map(product => (
 *     <ProductCard key={product.id} product={product} />
 *   ))}
 * </StaggerChildren>
 * ```
 */
export function StaggerChildren({
  children,
  className,
  staggerDelay = 50,
  duration = 150,
  initialDelay = 0,
  disabled = false,
  variant = "fade",
  as: Component = "div",
}: StaggerChildrenProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionComponent = motion[Component as keyof typeof motion] as typeof motion.div;

  // Skip animation if disabled or user prefers reduced motion
  if (disabled || prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const childVariants = variantMap[variant];
  const childArray = Children.toArray(children);

  return (
    <MotionComponent
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay / 1000,
            delayChildren: initialDelay / 1000,
          },
        },
      }}
    >
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          variants={childVariants}
          transition={{
            duration: duration / 1000,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </MotionComponent>
  );
}

/**
 * StaggerItem is used when you need more control over individual items.
 * Use with a parent motion container that has staggerChildren configured.
 */
export interface StaggerItemProps {
  /** Content to animate */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Animation variant (default: 'fade') */
  variant?: "fade" | "slide-up" | "scale";
  /** Duration in milliseconds (default: 150ms) */
  duration?: number;
}

export function StaggerItem({
  children,
  className,
  variant = "fade",
  duration = 150,
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variantMap[variant]}
      transition={{
        duration: duration / 1000,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default StaggerChildren;
