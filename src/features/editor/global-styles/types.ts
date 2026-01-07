/**
 * Global Styles Type Definitions
 * Centralized design token management for brand consistency
 */

// Typography configuration
export interface TypographyConfig {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  scale: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

// Color palette configuration
export interface ColorConfig {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
}

// Spacing scale configuration
export interface SpacingConfig {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
}

// Border radius configuration
export interface BorderRadiusConfig {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

// Shadow configuration
export interface ShadowConfig {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

// Complete global styles interface
export interface GlobalStyles {
  id?: string;
  name: string;
  typography: TypographyConfig;
  colors: ColorConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  // Custom CSS variables for advanced users
  customVariables?: Record<string, string>;
}

// Theme preset type
export type ThemePreset = "minimal" | "bold" | "elegant" | "playful" | "corporate";

// Global styles state for the editor
export interface GlobalStylesState {
  styles: GlobalStyles;
  isDirty: boolean;
  activePreset: ThemePreset | "custom";
}

// CSS variable mapping
export const CSS_VARIABLE_MAP: Record<string, string> = {
  // Typography
  "typography.fontFamily.heading": "--font-heading",
  "typography.fontFamily.body": "--font-body",
  "typography.fontFamily.mono": "--font-mono",
  "typography.scale.xs": "--text-xs",
  "typography.scale.sm": "--text-sm",
  "typography.scale.base": "--text-base",
  "typography.scale.lg": "--text-lg",
  "typography.scale.xl": "--text-xl",
  "typography.scale.2xl": "--text-2xl",
  "typography.scale.3xl": "--text-3xl",
  "typography.scale.4xl": "--text-4xl",
  // Colors
  "colors.primary": "--color-primary",
  "colors.primaryForeground": "--color-primary-foreground",
  "colors.secondary": "--color-secondary",
  "colors.secondaryForeground": "--color-secondary-foreground",
  "colors.accent": "--color-accent",
  "colors.accentForeground": "--color-accent-foreground",
  "colors.background": "--color-background",
  "colors.foreground": "--color-foreground",
  "colors.muted": "--color-muted",
  "colors.mutedForeground": "--color-muted-foreground",
  "colors.border": "--color-border",
  "colors.ring": "--color-ring",
  // Spacing
  "spacing.xs": "--spacing-xs",
  "spacing.sm": "--spacing-sm",
  "spacing.md": "--spacing-md",
  "spacing.lg": "--spacing-lg",
  "spacing.xl": "--spacing-xl",
  // Border radius
  "borderRadius.sm": "--radius-sm",
  "borderRadius.md": "--radius-md",
  "borderRadius.lg": "--radius-lg",
  "borderRadius.xl": "--radius-xl",
  "borderRadius.full": "--radius-full",
  // Shadows
  "shadows.sm": "--shadow-sm",
  "shadows.md": "--shadow-md",
  "shadows.lg": "--shadow-lg",
  "shadows.xl": "--shadow-xl",
};
