/**
 * OKLCH Color System
 * 
 * Perceptually uniform colors using OKLCH color space.
 * Based on the 4-layer product design color theory.
 */

export {
  // Types
  type OklchColor,
  type ChartColorName,
  
  // Parsing & conversion
  parseOklch,
  toOklchString,
  
  // Theming
  themeNeutral,
  generateThemedNeutrals,
  
  // Chart colors
  CHART_HUES,
  getChartColor,
  generateChartPalette,
  
  // Semantic colors
  SEMANTIC_HUES,
  getSemanticColor,
  generateColorScale,
  
  // Dark mode
  adjustForDarkMode,
  
  // CSS variables
  OKLCH_CSS_VARS,
} from './oklch'
