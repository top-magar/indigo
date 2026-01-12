/**
 * Vercel/Geist Animation Constants for Framer Motion
 * 
 * Standardized animation values based on Vercel's design system.
 * Use these constants in all Framer Motion components for consistency.
 */

// Duration constants (in seconds for Framer Motion)
export const DURATION = {
  fast: 0.1,
  normal: 0.15,
  moderate: 0.2,
  slow: 0.25,
  slower: 0.3,
  slowest: 0.35,
} as const;

// Easing constants (cubic-bezier arrays for Framer Motion)
export const EASE = {
  out: "easeOut" as const,
  outCubic: [0.33, 1, 0.68, 1] as const,
  inOut: "easeInOut" as const,
  inOutCubic: [0.65, 0, 0.35, 1] as const,
  outExpo: [0.19, 1, 0.22, 1] as const,
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  linear: "linear" as const,
} as const;

// Spring configurations
export const SPRING = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 25 },
  gentle: { type: "spring" as const, stiffness: 200, damping: 20 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15 },
} as const;

// Transition presets
export const TRANSITION = {
  micro: { duration: DURATION.normal, ease: EASE.out },
  standard: { duration: DURATION.normal, ease: EASE.outCubic },
  content: { duration: DURATION.moderate, ease: EASE.out },
  modal: { duration: DURATION.slower, ease: EASE.outCubic },
  page: { duration: DURATION.moderate, ease: EASE.outCubic },
  stagger: { staggerChildren: 0.05, delayChildren: 0.1 },
} as const;

// Animation variants
export const VARIANTS = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 },
  },
  fadeScale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
  },
  dropdown: {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
  },
} as const;

// Hover/tap animations
export const HOVER = {
  lift: { y: -2 },
  scale: { scale: 1.02 },
  shift: { x: 2 },
} as const;

export const TAP = {
  press: { scale: 0.98 },
  pressDeep: { scale: 0.95 },
} as const;

// Stagger delays (in seconds)
export const STAGGER = {
  fast: 0.03,
  normal: 0.05,
  slow: 0.08,
} as const;
