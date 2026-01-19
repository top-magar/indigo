'use client'

import { useMemo } from 'react'
import {
  generateChartPalette,
  getChartColor,
  CHART_HUES,
  type ChartColorName,
} from '@/shared/colors/oklch'

interface UseChartColorsOptions {
  /** Number of colors to generate (for dynamic palettes) */
  count?: number
  /** Lightness value 0-1 (default: 0.65) */
  lightness?: number
  /** Chroma/saturation value 0-0.4 (default: 0.15) */
  chroma?: number
  /** Starting hue for generated palettes (default: 25 - red) */
  startHue?: number
}

interface ChartColors {
  /** Get a specific named chart color */
  get: (name: ChartColorName) => string
  /** Array of all named chart colors */
  all: string[]
  /** Generate N evenly-spaced colors */
  generate: (count: number) => string[]
  /** Named color map */
  named: Record<ChartColorName, string>
  /** CSS variable references for use in styles */
  vars: Record<ChartColorName, string>
}

/**
 * Hook for generating perceptually uniform chart colors using OKLCH
 * 
 * @example
 * ```tsx
 * const { get, all, generate, named, vars } = useChartColors()
 * 
 * // Get a specific color
 * const blueColor = get('blue')
 * 
 * // Use all 12 named colors
 * const pieColors = all
 * 
 * // Generate 5 evenly-spaced colors
 * const lineColors = generate(5)
 * 
 * // Use CSS variables
 * <div style={{ backgroundColor: vars.green }} />
 * ```
 */
export function useChartColors(options?: UseChartColorsOptions): ChartColors {
  const { lightness = 0.65, chroma = 0.15, startHue = 25 } = options ?? {}

  return useMemo(() => {
    // Generate named colors
    const named = Object.fromEntries(
      Object.keys(CHART_HUES).map((name) => [
        name,
        getChartColor(name as ChartColorName, { lightness, chroma }),
      ])
    ) as Record<ChartColorName, string>

    // CSS variable references
    const vars = Object.fromEntries(
      Object.keys(CHART_HUES).map((name) => [
        name,
        `var(--oklch-chart-${name})`,
      ])
    ) as Record<ChartColorName, string>

    return {
      get: (name: ChartColorName) => named[name],
      all: Object.values(named),
      generate: (count: number) =>
        generateChartPalette(count, { lightness, chroma, startHue }),
      named,
      vars,
    }
  }, [lightness, chroma, startHue])
}

/**
 * Preset chart color palettes for common use cases
 */
export const CHART_PRESETS = {
  /** 6 colors for pie/donut charts */
  pie: ['blue', 'green', 'amber', 'purple', 'cyan', 'pink'] as ChartColorName[],
  
  /** 4 colors for comparison charts */
  comparison: ['blue', 'green', 'amber', 'red'] as ChartColorName[],
  
  /** 3 colors for simple charts */
  simple: ['blue', 'green', 'amber'] as ChartColorName[],
  
  /** Sequential blues for single-hue charts */
  sequential: ['cyan', 'blue', 'indigo'] as ChartColorName[],
  
  /** Diverging for positive/negative */
  diverging: ['green', 'amber', 'red'] as ChartColorName[],
  
  /** Status colors */
  status: ['green', 'amber', 'red', 'blue'] as ChartColorName[],
} as const

/**
 * Get a preset palette of chart colors
 */
export function useChartPreset(
  preset: keyof typeof CHART_PRESETS,
  options?: Omit<UseChartColorsOptions, 'count'>
): string[] {
  const { get } = useChartColors(options)
  
  return useMemo(() => {
    return CHART_PRESETS[preset].map((name) => get(name))
  }, [preset, get])
}

export type { ChartColorName }
