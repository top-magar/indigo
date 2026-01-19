/**
 * Visual Editor V2 - Design Token Types
 * 
 * Design tokens for consistent styling across the editor.
 * Based on Vercel/Geist design system with OKLCH colors.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ColorTokens {
  // Brand colors
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Neutral scale (grayscale)
  neutral: ColorScale;
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    link: string;
  };
  
  // Border colors
  border: {
    default: string;
    muted: string;
    strong: string;
  };
}

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export interface TypographyTokens {
  fontFamilies: {
    heading: string;
    body: string;
    mono: string;
  };
  
  fontSizes: {
    xs: string;    // 12px
    sm: string;    // 14px
    base: string;  // 16px
    lg: string;    // 18px
    xl: string;    // 20px
    '2xl': string; // 24px
    '3xl': string; // 30px
    '4xl': string; // 36px
    '5xl': string; // 48px
    '6xl': string; // 60px
    '7xl': string; // 72px
  };
  
  fontWeights: {
    normal: number;   // 400
    medium: number;   // 500
    semibold: number; // 600
    bold: number;     // 700
  };
  
  lineHeights: {
    none: number;     // 1
    tight: number;    // 1.25
    snug: number;     // 1.375
    normal: number;   // 1.5
    relaxed: number;  // 1.625
    loose: number;    // 2
  };
  
  letterSpacings: {
    tighter: string;  // -0.05em
    tight: string;    // -0.025em
    normal: string;   // 0
    wide: string;     // 0.025em
    wider: string;    // 0.05em
    widest: string;   // 0.1em
  };
}

// ============================================================================
// SPACING TOKENS
// ============================================================================

export interface SpacingTokens {
  0: string;    // 0px
  px: string;   // 1px
  0.5: string;  // 2px
  1: string;    // 4px
  1.5: string;  // 6px
  2: string;    // 8px
  2.5: string;  // 10px
  3: string;    // 12px
  3.5: string;  // 14px
  4: string;    // 16px
  5: string;    // 20px
  6: string;    // 24px
  7: string;    // 28px
  8: string;    // 32px
  9: string;    // 36px
  10: string;   // 40px
  11: string;   // 44px
  12: string;   // 48px
  14: string;   // 56px
  16: string;   // 64px
  20: string;   // 80px
  24: string;   // 96px
  28: string;   // 112px
  32: string;   // 128px
  36: string;   // 144px
  40: string;   // 160px
  44: string;   // 176px
  48: string;   // 192px
  52: string;   // 208px
  56: string;   // 224px
  60: string;   // 240px
  64: string;   // 256px
  72: string;   // 288px
  80: string;   // 320px
  96: string;   // 384px
}

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export interface BorderRadiusTokens {
  none: string;   // 0
  sm: string;     // 4px
  md: string;     // 6px
  lg: string;     // 8px
  xl: string;     // 12px
  '2xl': string;  // 16px
  '3xl': string;  // 24px
  full: string;   // 9999px
}

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export interface BreakpointTokens {
  sm: string;   // 640px
  md: string;   // 768px
  lg: string;   // 1024px
  xl: string;   // 1280px
  '2xl': string; // 1536px
}

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export interface AnimationTokens {
  durations: {
    fast: string;     // 150ms
    normal: string;   // 200ms
    slow: string;     // 300ms
    slower: string;   // 500ms
  };
  
  easings: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    spring: string;
  };
}

// ============================================================================
// COMPLETE DESIGN TOKENS
// ============================================================================

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  breakpoints: BreakpointTokens;
  animation: AnimationTokens;
}
