/**
 * Design Tokens — Three-tier hierarchy (primitive → semantic → component).
 * All consumed via CSS custom properties with --v2- prefix.
 * Framework-agnostic — these are just constants and a CSS generator.
 */

// ─── Primitive Tokens ────────────────────────────────────────

/** 4px-based spacing scale */
export const SPACE = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120] as const

/** Grid system */
export const GRID = {
  columns: { desktop: 12, tablet: 8, mobile: 4 },
  gutter: { desktop: 24, tablet: 20, mobile: 16 },
  margin: { desktop: 24, tablet: 24, mobile: 16 },
} as const

/** Viewport breakpoints (matches v1 for consistency) */
export const BREAKPOINTS = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
} as const

/** Spacing slider step — ensures 4px grid alignment */
export const SPACING_STEP = 4

// ─── Semantic Tokens ─────────────────────────────────────────

export interface ThemeTokens {
  maxWidth: number
  sectionGapV: number
  sectionGapH: number
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingFont: string
  bodyFont: string
  borderRadius: number
}

export const DEFAULT_THEME: ThemeTokens = {
  maxWidth: 1200,
  sectionGapV: 48,
  sectionGapH: 24,
  primaryColor: "#005bd3",
  secondaryColor: "#1a1a2e",
  accentColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  headingFont: "Inter",
  bodyFont: "Inter",
  borderRadius: 8,
}

/** Convert theme tokens to CSS custom properties */
export function themeToCssVars(theme: Partial<ThemeTokens>): Record<string, string> {
  const t = { ...DEFAULT_THEME, ...theme }
  return {
    "--v2-max-width": `${t.maxWidth}px`,
    "--v2-section-gap-v": `${t.sectionGapV}px`,
    "--v2-section-gap-h": `${t.sectionGapH}px`,
    "--v2-primary": t.primaryColor,
    "--v2-secondary": t.secondaryColor,
    "--v2-accent": t.accentColor,
    "--v2-bg": t.backgroundColor,
    "--v2-text": t.textColor,
    "--v2-font-heading": t.headingFont,
    "--v2-font-body": t.bodyFont,
    "--v2-radius": `${t.borderRadius}px`,
  }
}
