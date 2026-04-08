"use client"

import type { CSSProperties, ReactNode } from "react"

interface SectionWrapperProps {
  /** Vertical padding top (px) */
  paddingTop: number
  /** Vertical padding bottom (px) */
  paddingBottom: number
  /** Full-width background color/gradient */
  background?: string
  /** Text color */
  color?: string
  /** Skip maxWidth constraint (full bleed) */
  fullWidth?: boolean
  /** Extra styles on the outer wrapper */
  outerStyle?: CSSProperties
  /** Extra styles on the inner content container */
  innerStyle?: CSSProperties
  children: ReactNode
}

/**
 * Shared layout wrapper for section blocks.
 * Outer div: full-width background.
 * Inner div: constrained by --store-max-width + --store-section-gap-h.
 */
export function SectionWrapper({ paddingTop, paddingBottom, background, color, fullWidth, outerStyle, innerStyle, children }: SectionWrapperProps) {
  const outer: CSSProperties = {
    background: background || undefined,
    color: color || undefined,
    padding: `${paddingTop}px var(--store-section-gap-h, 24px) ${paddingBottom}px`,
    ...outerStyle,
  }

  if (fullWidth) {
    return <div style={outer}>{children}</div>
  }

  return (
    <div style={outer}>
      <div style={{ maxWidth: "var(--store-max-width, 1200px)", margin: "0 auto", ...innerStyle }}>
        {children}
      </div>
    </div>
  )
}
