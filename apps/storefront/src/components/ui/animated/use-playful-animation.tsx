"use client"

import { useReducedMotion, type Easing } from "framer-motion"
import { useMemo } from "react"

const easeInOut: Easing = "easeInOut"

type AnimationPreset = "bounce" | "spring" | "gentle" | "snappy" | "none"

const presets = {
  bounce: {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },
  spring: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },
  gentle: {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 },
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  snappy: {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: { type: "spring", stiffness: 600, damping: 20 },
  },
  none: {
    whileHover: {},
    whileTap: {},
    transition: {},
  },
}

export function usePlayfulAnimation(preset: AnimationPreset = "spring") {
  const shouldReduceMotion = useReducedMotion()
  return useMemo(() => {
    if (shouldReduceMotion) return presets.none
    return presets[preset]
  }, [preset, shouldReduceMotion])
}

export function useIconAnimation(variant: "spin" | "bounce" | "wiggle" = "bounce") {
  const shouldReduceMotion = useReducedMotion()
  return useMemo(() => {
    if (shouldReduceMotion) return {}
    const variants = {
      spin: { 
        whileHover: { rotate: 180 },
        transition: { type: "spring" as const, stiffness: 300, damping: 20 }
      },
      bounce: { 
        whileHover: { y: -2 }, 
        whileTap: { y: 1 },
        transition: { type: "spring" as const, stiffness: 400, damping: 17 }
      },
      // Multi-keyframe animations MUST use tween, not spring
      wiggle: { 
        whileHover: { rotate: [0, -5, 5, -5, 5, 0] },
        transition: { type: "tween" as const, duration: 0.5, ease: easeInOut }
      },
    }
    return variants[variant]
  }, [variant, shouldReduceMotion])
}
