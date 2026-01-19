"use client"

import { motion, type Variants, type Transition } from "framer-motion"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// ANIMATION PRESETS
// =============================================================================

const iconTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 17,
}

const gentleTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
}

// =============================================================================
// ANIMATED CHECK ICON
// =============================================================================

const checkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

interface AnimatedIconProps {
  size?: number
  className?: string
}

interface AnimatedCheckProps extends AnimatedIconProps {
  strokeWidth?: number
  animate?: boolean
}

export const AnimatedCheck = forwardRef<SVGSVGElement, AnimatedCheckProps>(
  ({ size = 16, strokeWidth = 2, animate = true, className }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
    >
      <motion.path
        d="M5 12l5 5L20 7"
        variants={checkVariants}
        initial={animate ? "hidden" : "visible"}
        animate="visible"
      />
    </svg>
  )
)
AnimatedCheck.displayName = "AnimatedCheck"

// =============================================================================
// ANIMATED X ICON
// =============================================================================

const xVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}

export const AnimatedX = forwardRef<SVGSVGElement, AnimatedCheckProps>(
  ({ size = 16, strokeWidth = 2, animate = true, className }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
    >
      <motion.path
        d="M18 6L6 18"
        variants={xVariants}
        initial={animate ? "hidden" : "visible"}
        animate="visible"
      />
      <motion.path
        d="M6 6l12 12"
        variants={xVariants}
        initial={animate ? "hidden" : "visible"}
        animate="visible"
        transition={{ delay: 0.1 }}
      />
    </svg>
  )
)
AnimatedX.displayName = "AnimatedX"

// =============================================================================
// ANIMATED ARROW ICON
// =============================================================================

interface AnimatedArrowProps extends AnimatedIconProps {
  direction?: "up" | "down" | "left" | "right"
}

const arrowRotation = { up: -90, down: 90, left: 180, right: 0 }

export const AnimatedArrow = forwardRef<SVGSVGElement, AnimatedArrowProps>(
  ({ size = 16, direction = "right", className }, ref) => (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      animate={{ rotate: arrowRotation[direction] }}
      transition={iconTransition}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </motion.svg>
  )
)
AnimatedArrow.displayName = "AnimatedArrow"

// =============================================================================
// ANIMATED PLUS/MINUS ICON
// =============================================================================

interface AnimatedPlusMinusProps extends AnimatedIconProps {
  isPlus?: boolean
}

export const AnimatedPlusMinus = forwardRef<SVGSVGElement, AnimatedPlusMinusProps>(
  ({ size = 16, isPlus = true, className }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
    >
      <motion.path d="M5 12h14" />
      <motion.path
        d="M12 5v14"
        animate={{ scaleY: isPlus ? 1 : 0, opacity: isPlus ? 1 : 0 }}
        transition={iconTransition}
        style={{ originY: 0.5 }}
      />
    </svg>
  )
)
AnimatedPlusMinus.displayName = "AnimatedPlusMinus"

// =============================================================================
// ANIMATED HAMBURGER ICON
// =============================================================================

interface AnimatedHamburgerProps extends AnimatedIconProps {
  isOpen?: boolean
}

export const AnimatedHamburger = forwardRef<SVGSVGElement, AnimatedHamburgerProps>(
  ({ size = 24, isOpen = false, className }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
    >
      <motion.path
        d="M4 6h16"
        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
        transition={iconTransition}
        style={{ originX: "50%", originY: "50%" }}
      />
      <motion.path
        d="M4 12h16"
        animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0 : 1 }}
        transition={iconTransition}
      />
      <motion.path
        d="M4 18h16"
        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
        transition={iconTransition}
        style={{ originX: "50%", originY: "50%" }}
      />
    </svg>
  )
)
AnimatedHamburger.displayName = "AnimatedHamburger"

// =============================================================================
// ANIMATED CHEVRON ICON
// =============================================================================

interface AnimatedChevronProps extends AnimatedIconProps {
  isOpen?: boolean
  direction?: "up" | "down" | "left" | "right"
}

export const AnimatedChevron = forwardRef<SVGSVGElement, AnimatedChevronProps>(
  ({ size = 16, isOpen = false, direction = "down", className }, ref) => {
    const baseRotation = { up: 180, down: 0, left: 90, right: -90 }
    const openOffset = 180

    return (
      <motion.svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("text-current", className)}
        animate={{ rotate: baseRotation[direction] + (isOpen ? openOffset : 0) }}
        transition={iconTransition}
      >
        <path d="m6 9 6 6 6-6" />
      </motion.svg>
    )
  }
)
AnimatedChevron.displayName = "AnimatedChevron"

// =============================================================================
// ANIMATED HEART ICON
// =============================================================================

interface AnimatedHeartProps extends AnimatedIconProps {
  filled?: boolean
}

export const AnimatedHeart = forwardRef<SVGSVGElement, AnimatedHeartProps>(
  ({ size = 16, filled = false, className }, ref) => (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      animate={{ scale: filled ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </motion.svg>
  )
)
AnimatedHeart.displayName = "AnimatedHeart"

// =============================================================================
// ANIMATED STAR ICON
// =============================================================================

interface AnimatedStarProps extends AnimatedIconProps {
  filled?: boolean
}

export const AnimatedStar = forwardRef<SVGSVGElement, AnimatedStarProps>(
  ({ size = 16, filled = false, className }, ref) => (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      animate={{ scale: filled ? [1, 1.15, 1] : 1, rotate: filled ? [0, 15, 0] : 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </motion.svg>
  )
)
AnimatedStar.displayName = "AnimatedStar"

// =============================================================================
// ANIMATED BELL ICON
// =============================================================================

interface AnimatedBellProps extends AnimatedIconProps {
  hasNotification?: boolean
  ring?: boolean
}

export const AnimatedBell = forwardRef<SVGSVGElement, AnimatedBellProps>(
  ({ size = 16, hasNotification = false, ring = false, className }, ref) => (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      animate={ring ? { rotate: [0, 15, -15, 10, -10, 5, -5, 0] } : {}}
      transition={{ duration: 0.5, type: "tween", ease: "easeInOut" }}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      {hasNotification && (
        <motion.circle
          cx="18"
          cy="6"
          r="4"
          fill="var(--ds-red-600)"
          stroke="none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={iconTransition}
        />
      )}
    </motion.svg>
  )
)
AnimatedBell.displayName = "AnimatedBell"

// =============================================================================
// ANIMATED COPY ICON
// =============================================================================

interface AnimatedCopyProps extends AnimatedIconProps {
  copied?: boolean
}

export const AnimatedCopy = forwardRef<SVGSVGElement, AnimatedCopyProps>(
  ({ size = 16, copied = false, className }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
    >
      <motion.g
        animate={{ opacity: copied ? 0 : 1, scale: copied ? 0.8 : 1 }}
        transition={gentleTransition}
      >
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </motion.g>
      <motion.path
        d="M5 12l5 5L20 7"
        animate={{ opacity: copied ? 1 : 0, pathLength: copied ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </svg>
  )
)
AnimatedCopy.displayName = "AnimatedCopy"

// =============================================================================
// ANIMATED LOADING SPINNER
// =============================================================================

export const AnimatedSpinner = forwardRef<SVGSVGElement, AnimatedIconProps>(
  ({ size = 16, className }, ref) => (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </motion.svg>
  )
)
AnimatedSpinner.displayName = "AnimatedSpinner"

// =============================================================================
// ANIMATED SUCCESS CIRCLE
// =============================================================================

interface AnimatedSuccessProps extends AnimatedIconProps {
  animate?: boolean
}

export const AnimatedSuccess = forwardRef<SVGSVGElement, AnimatedSuccessProps>(
  ({ size = 48, animate = true, className }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-[var(--ds-green-600)]", className)}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M8 12l3 3 5-6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  )
)
AnimatedSuccess.displayName = "AnimatedSuccess"

// =============================================================================
// ANIMATED ERROR CIRCLE
// =============================================================================

export const AnimatedError = forwardRef<SVGSVGElement, AnimatedSuccessProps>(
  ({ size = 48, animate = true, className }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-[var(--ds-red-600)]", className)}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M15 9l-6 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.3, ease: "easeOut" }}
      />
      <motion.path
        d="M9 9l6 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.4, ease: "easeOut" }}
      />
    </svg>
  )
)
AnimatedError.displayName = "AnimatedError"

// =============================================================================
// ANIMATED BOOKMARK ICON
// =============================================================================

interface AnimatedBookmarkProps extends AnimatedIconProps {
  filled?: boolean
}

export const AnimatedBookmark = forwardRef<SVGSVGElement, AnimatedBookmarkProps>(
  ({ size = 16, filled = false, className }, ref) => (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      animate={{ scale: filled ? [1, 1.1, 1] : 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </motion.svg>
  )
)
AnimatedBookmark.displayName = "AnimatedBookmark"

// =============================================================================
// ANIMATED TRASH ICON
// =============================================================================

interface AnimatedTrashProps extends AnimatedIconProps {
  shake?: boolean
}

export const AnimatedTrash = forwardRef<SVGSVGElement, AnimatedTrashProps>(
  ({ size = 16, shake = false, className }, ref) => (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      animate={shake ? { x: [0, -2, 2, -2, 2, 0] } : {}}
      transition={{ duration: 0.4, type: "tween", ease: "easeInOut" }}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <motion.line
        x1="10"
        y1="11"
        x2="10"
        y2="17"
        animate={shake ? { scaleY: [1, 0.8, 1] } : {}}
        transition={{ duration: 0.3, type: "tween", ease: "easeInOut" }}
      />
      <motion.line
        x1="14"
        y1="11"
        x2="14"
        y2="17"
        animate={shake ? { scaleY: [1, 0.8, 1] } : {}}
        transition={{ duration: 0.3, delay: 0.1, type: "tween", ease: "easeInOut" }}
      />
    </motion.svg>
  )
)
AnimatedTrash.displayName = "AnimatedTrash"
