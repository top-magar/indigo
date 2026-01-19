"use client"

import { motion, type HTMLMotionProps, type Easing } from "framer-motion"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// ANIMATED BUTTON
// =============================================================================

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "bounce" | "pulse" | "glow" | "shake"
}

const easeInOut: Easing = "easeInOut"

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    // Variants with multi-keyframe animations need tween, not spring
    const needsTween = variant === "pulse" || variant === "shake"
    
    const variants = {
      default: {
        whileHover: { scale: 1.02, y: -1 },
        whileTap: { scale: 0.98 },
      },
      bounce: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95, y: 2 },
      },
      pulse: {
        // Multi-keyframe: [1, 1.02, 1]
        whileHover: { scale: [1, 1.02, 1] },
        whileTap: { scale: 0.98 },
      },
      glow: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      },
      shake: {
        // Multi-keyframe: [0, -2, 2, -2, 2, 0]
        whileHover: { x: [0, -2, 2, -2, 2, 0] },
        whileTap: { scale: 0.98 },
      },
    }

    const selectedVariant = variants[variant]

    // Use tween for multi-keyframe animations, spring for others
    const transition = needsTween
      ? { type: "tween" as const, duration: variant === "shake" ? 0.4 : 0.3, ease: easeInOut }
      : { type: "spring" as const, stiffness: 400, damping: 17 }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "inline-flex items-center justify-center gap-2",
          "h-10 px-4 rounded-md text-sm font-medium",
          "bg-[var(--ds-gray-1000)] text-white",
          "hover:bg-[var(--ds-gray-900)]",
          "focus-visible:outline-none focus-visible:ring-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "transition-colors duration-150",
          className
        )}
        whileHover={selectedVariant.whileHover}
        whileTap={selectedVariant.whileTap}
        transition={transition}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
AnimatedButton.displayName = "AnimatedButton"

// =============================================================================
// ANIMATED ICON BUTTON
// =============================================================================

interface AnimatedIconButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "spin" | "bounce" | "wiggle"
}

export const AnimatedIconButton = forwardRef<HTMLButtonElement, AnimatedIconButtonProps>(
  ({ variant = "default", className, children, ...props }, ref) => {
    // For wiggle variant, we need to use tween animation (not spring) because it has multiple keyframes
    const isWiggle = variant === "wiggle"
    
    const iconVariants = {
      default: {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.9 },
      },
      spin: {
        whileHover: { rotate: 180, scale: 1.1 },
        whileTap: { scale: 0.9 },
      },
      bounce: {
        whileHover: { y: -3 },
        whileTap: { y: 2, scale: 0.95 },
      },
      wiggle: {
        // Multi-keyframe animations MUST use tween, not spring
        whileHover: { rotate: [0, -10, 10, -10, 10, 0] },
        whileTap: { scale: 0.9 },
      },
    }

    const selectedVariant = iconVariants[variant]

    // Use tween for wiggle (multi-keyframe), spring for others
    const transition = isWiggle
      ? { type: "tween" as const, duration: 0.5, ease: easeInOut }
      : { type: "spring" as const, stiffness: 400, damping: 17 }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          "h-9 w-9 rounded-md",
          "text-[var(--ds-gray-600)]",
          "hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-gray-900)]",
          "focus-visible:outline-none focus-visible:ring-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "transition-colors duration-150",
          className
        )}
        whileHover={selectedVariant.whileHover}
        whileTap={selectedVariant.whileTap}
        transition={transition}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
AnimatedIconButton.displayName = "AnimatedIconButton"
