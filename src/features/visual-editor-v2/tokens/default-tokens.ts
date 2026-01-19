/**
 * Visual Editor V2 - Default Design Tokens
 * 
 * Based on Vercel/Geist design system with OKLCH colors.
 */

import type { DesignTokens } from '../types/tokens';

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    brand: {
      primary: 'var(--ds-gray-1000)',
      secondary: 'var(--ds-gray-800)',
      accent: 'var(--ds-blue-600)',
    },
    semantic: {
      success: 'var(--ds-green-600)',
      warning: 'var(--ds-amber-600)',
      error: 'var(--ds-red-600)',
      info: 'var(--ds-blue-600)',
    },
    neutral: {
      50: 'var(--ds-gray-50)',
      100: 'var(--ds-gray-100)',
      200: 'var(--ds-gray-200)',
      300: 'var(--ds-gray-300)',
      400: 'var(--ds-gray-400)',
      500: 'var(--ds-gray-500)',
      600: 'var(--ds-gray-600)',
      700: 'var(--ds-gray-700)',
      800: 'var(--ds-gray-800)',
      900: 'var(--ds-gray-900)',
      950: 'var(--ds-gray-1000)',
    },
    background: {
      primary: 'var(--ds-background)',
      secondary: 'var(--ds-gray-100)',
      tertiary: 'var(--ds-gray-200)',
      inverse: 'var(--ds-gray-1000)',
    },
    text: {
      primary: 'var(--ds-gray-1000)',
      secondary: 'var(--ds-gray-700)',
      muted: 'var(--ds-gray-500)',
      inverse: 'white',
      link: 'var(--ds-blue-600)',
    },
    border: {
      default: 'var(--ds-gray-200)',
      muted: 'var(--ds-gray-100)',
      strong: 'var(--ds-gray-300)',
    },
  },
  typography: {
    fontFamilies: {
      heading: 'var(--font-geist-sans), system-ui, sans-serif',
      body: 'var(--font-geist-sans), system-ui, sans-serif',
      mono: 'var(--font-geist-mono), monospace',
    },
    fontSizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
      '7xl': '72px',
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  spacing: {
    0: '0px',
    px: '1px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
    72: '288px',
    80: '320px',
    96: '384px',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  animation: {
    durations: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easings: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
};

/**
 * Create custom design tokens by merging with defaults
 */
export function createDesignTokens(overrides: Partial<DesignTokens>): DesignTokens {
  return {
    ...DEFAULT_DESIGN_TOKENS,
    ...overrides,
    colors: {
      ...DEFAULT_DESIGN_TOKENS.colors,
      ...overrides.colors,
    },
    typography: {
      ...DEFAULT_DESIGN_TOKENS.typography,
      ...overrides.typography,
    },
  };
}
