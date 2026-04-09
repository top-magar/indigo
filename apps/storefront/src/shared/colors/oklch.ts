/**
 * OKLCH Color Utilities
 * 
 * Utilities for working with OKLCH colors - a perceptually uniform color space.
 * Based on the 4-layer product design color theory.
 * 
 * OKLCH format: oklch(lightness chroma hue)
 * - Lightness: 0-1 (0 = black, 1 = white)
 * - Chroma: 0-0.4 (0 = gray, higher = more saturated)
 * - Hue: 0-360 (color wheel degrees)
 */

export interface OklchColor {
  l: number // Lightness 0-1
  c: number // Chroma 0-0.4
  h: number // Hue 0-360
}

/**
 * Parse an OKLCH color string into components
 */
export function parseOklch(color: string): OklchColor | null {
  const match = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!match) return null
  
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3])
  }
}

/**
 * Convert OKLCH components to a CSS string
 */
export function toOklchString(color: OklchColor): string {
  return `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(0)})`
}

/**
 * Generate a themed version of a neutral color
 * Based on the OKLCH theming trick:
 * - Lightness: -0.03
 * - Chroma: +0.02
 * - Hue: set to desired theme hue
 */
export function themeNeutral(
  neutral: OklchColor,
  themeHue: number
): OklchColor {
  return {
    l: Math.max(0, neutral.l - 0.03),
    c: Math.min(0.4, neutral.c + 0.02),
    h: themeHue
  }
}

/**
 * Generate a complete themed neutral scale
 */
export function generateThemedNeutrals(themeHue: number): Record<string, string> {
  const neutrals: Record<string, OklchColor> = {
    'bg-base': { l: 1, c: 0, h: 0 },
    'bg-subtle': { l: 0.985, c: 0, h: 0 },
    'bg-muted': { l: 0.97, c: 0, h: 0 },
    'bg-emphasis': { l: 0.95, c: 0, h: 0 },
    'border-subtle': { l: 0.92, c: 0, h: 0 },
    'border-default': { l: 0.85, c: 0, h: 0 },
    'border-emphasis': { l: 0.75, c: 0, h: 0 },
    'text-primary': { l: 0.15, c: 0, h: 0 },
    'text-secondary': { l: 0.25, c: 0, h: 0 },
    'text-tertiary': { l: 0.40, c: 0, h: 0 },
  }

  const themed: Record<string, string> = {}
  for (const [key, color] of Object.entries(neutrals)) {
    themed[key] = toOklchString(themeNeutral(color, themeHue))
  }
  return themed
}

/**
 * Chart color hues for perceptually uniform data visualization
 * Incremented by ~25-30 degrees for good separation
 */
export const CHART_HUES = {
  red: 25,
  orange: 55,
  amber: 85,
  yellow: 100,
  lime: 130,
  green: 155,
  teal: 180,
  cyan: 200,
  blue: 240,
  indigo: 270,
  purple: 300,
  pink: 330,
} as const

export type ChartColorName = keyof typeof CHART_HUES

/**
 * Generate a perceptually uniform chart color
 * All colors have the same perceived brightness
 */
export function getChartColor(
  name: ChartColorName,
  options?: {
    lightness?: number // Default: 0.65
    chroma?: number    // Default: 0.15
  }
): string {
  const { lightness = 0.65, chroma = 0.15 } = options ?? {}
  const hue = CHART_HUES[name]
  
  // Adjust chroma for certain hues that appear more saturated
  const adjustedChroma = ['red'].includes(name) ? chroma + 0.05 : chroma
  
  return toOklchString({ l: lightness, c: adjustedChroma, h: hue })
}

/**
 * Generate N perceptually uniform colors for charts
 * Colors are evenly distributed around the hue wheel
 */
export function generateChartPalette(
  count: number,
  options?: {
    lightness?: number
    chroma?: number
    startHue?: number
  }
): string[] {
  const { lightness = 0.65, chroma = 0.15, startHue = 25 } = options ?? {}
  const hueStep = 360 / count
  
  return Array.from({ length: count }, (_, i) => {
    const hue = (startHue + i * hueStep) % 360
    return toOklchString({ l: lightness, c: chroma, h: hue })
  })
}

/**
 * Adjust a color for dark mode using the "double the distance" rule
 * Dark colors need more distance to appear as different as light colors
 */
export function adjustForDarkMode(color: OklchColor): OklchColor {
  // For backgrounds: invert and stretch
  if (color.l > 0.5) {
    // Light color -> dark color
    // Double the distance from the base
    const distanceFromWhite = 1 - color.l
    return {
      l: 0.08 + distanceFromWhite * 2 * 0.2, // Map to 0.08-0.28 range
      c: color.c,
      h: color.h
    }
  }
  
  // For text: invert
  return {
    l: 1 - color.l,
    c: color.c,
    h: color.h
  }
}

/**
 * Generate a color scale (50-900) for a given hue
 * Useful for creating brand color ramps
 */
export function generateColorScale(hue: number): Record<string, string> {
  const scale: Record<string, OklchColor> = {
    '50': { l: 0.98, c: 0.02, h: hue },
    '100': { l: 0.95, c: 0.04, h: hue },
    '200': { l: 0.90, c: 0.08, h: hue },
    '300': { l: 0.82, c: 0.12, h: hue },
    '400': { l: 0.72, c: 0.15, h: hue },
    '500': { l: 0.62, c: 0.18, h: hue },
    '600': { l: 0.52, c: 0.16, h: hue },
    '700': { l: 0.45, c: 0.14, h: hue },
    '800': { l: 0.38, c: 0.12, h: hue },
    '900': { l: 0.30, c: 0.10, h: hue },
  }

  const result: Record<string, string> = {}
  for (const [key, color] of Object.entries(scale)) {
    result[key] = toOklchString(color)
  }
  return result
}

/**
 * Semantic color hues
 */
export const SEMANTIC_HUES = {
  success: 145,
  warning: 85,
  error: 25,
  info: 240,
} as const

/**
 * Get a semantic color at a specific shade
 */
export function getSemanticColor(
  type: keyof typeof SEMANTIC_HUES,
  shade: '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
): string {
  const scale = generateColorScale(SEMANTIC_HUES[type])
  return scale[shade]
}

/**
 * CSS custom property names for OKLCH colors
 */
export const OKLCH_CSS_VARS = {
  // Chart colors
  chartRed: '--oklch-chart-red',
  chartOrange: '--oklch-chart-orange',
  chartAmber: '--oklch-chart-amber',
  chartYellow: '--oklch-chart-yellow',
  chartLime: '--oklch-chart-lime',
  chartGreen: '--oklch-chart-green',
  chartTeal: '--oklch-chart-teal',
  chartCyan: '--oklch-chart-cyan',
  chartBlue: '--oklch-chart-blue',
  chartIndigo: '--oklch-chart-indigo',
  chartPurple: '--oklch-chart-purple',
  chartPink: '--oklch-chart-pink',
  
  // Backgrounds
  bgBase: '--oklch-bg-base',
  bgSubtle: '--oklch-bg-subtle',
  bgMuted: '--oklch-bg-muted',
  bgEmphasis: '--oklch-bg-emphasis',
  
  // Borders
  borderSubtle: '--oklch-border-subtle',
  borderDefault: '--oklch-border-default',
  borderEmphasis: '--oklch-border-emphasis',
  
  // Text
  textPrimary: '--oklch-text-primary',
  textSecondary: '--oklch-text-secondary',
  textTertiary: '--oklch-text-tertiary',
  textMuted: '--oklch-text-muted',
  textDisabled: '--oklch-text-disabled',
  
  // Brand
  brandHue: '--oklch-brand-hue',
} as const
