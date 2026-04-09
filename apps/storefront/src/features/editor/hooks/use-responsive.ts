"use client"

import { useBreakpoint, type Breakpoint } from "../breakpoint-context"

/** Returns a value based on current breakpoint: desktop → tablet → mobile */
export function useResponsive<T>(desktop: T, tablet: T, mobile: T): T {
  const bp = useBreakpoint()
  if (bp === "mobile") return mobile
  if (bp === "tablet") return tablet
  return desktop
}

/** Common responsive overrides for block styles */
export function useResponsiveStyles(): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  bp: Breakpoint
  /** Scale a pixel value down for smaller viewports */
  scale: (desktop: number, tablet?: number, mobile?: number) => number
  /** Reduce columns for smaller viewports */
  columns: (desktop: number) => number
  /** Grid columns for current breakpoint */
  gridColumns: number
  /** Grid gutter for current breakpoint */
  gridGutter: number
} {
  const bp = useBreakpoint()
  const isMobile = bp === "mobile"
  const isTablet = bp === "tablet"
  const isDesktop = bp === "desktop"

  return {
    isMobile, isTablet, isDesktop, bp,
    scale: (d, t, m) => isMobile ? (m ?? Math.round(d * 0.6)) : isTablet ? (t ?? Math.round(d * 0.8)) : d,
    columns: (d) => isMobile ? 1 : isTablet ? Math.min(d, 2) : d,
    /** Grid columns for current breakpoint */
    gridColumns: isMobile ? 4 : isTablet ? 8 : 12,
    /** Grid gutter for current breakpoint */
    gridGutter: isMobile ? 16 : isTablet ? 20 : 24,
  }
}
