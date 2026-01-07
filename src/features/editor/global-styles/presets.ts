/**
 * Theme Presets for Global Styles
 * Pre-configured design systems for different brand aesthetics
 */

import type { GlobalStyles, ThemePreset } from "./types";

/**
 * Minimal Theme
 * Clean, modern aesthetic with subtle design elements
 */
export const minimalPreset: GlobalStyles = {
  name: "Minimal",
  typography: {
    fontFamily: {
      heading: "Inter, system-ui, sans-serif",
      body: "Inter, system-ui, sans-serif",
      mono: "JetBrains Mono, Consolas, monospace",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  colors: {
    primary: "#18181b",
    primaryForeground: "#fafafa",
    secondary: "#f4f4f5",
    secondaryForeground: "#18181b",
    accent: "#e4e4e7",
    accentForeground: "#18181b",
    background: "#ffffff",
    foreground: "#09090b",
    muted: "#f4f4f5",
    mutedForeground: "#71717a",
    border: "#e4e4e7",
    ring: "#18181b",
    destructive: "#ef4444",
    destructiveForeground: "#fafafa",
    success: "#22c55e",
    successForeground: "#fafafa",
    warning: "#f59e0b",
    warningForeground: "#fafafa",
  },
  spacing: {
    none: "0",
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.375rem",
    xl: "0.5rem",
    full: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
};

/**
 * Bold Theme
 * Strong, impactful design with high contrast
 */
export const boldPreset: GlobalStyles = {
  name: "Bold",
  typography: {
    fontFamily: {
      heading: "Poppins, sans-serif",
      body: "Poppins, sans-serif",
      mono: "Fira Code, Consolas, monospace",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.25rem",
      xl: "1.5rem",
      "2xl": "2rem",
      "3xl": "2.5rem",
      "4xl": "3.5rem",
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 800,
    },
  },
  colors: {
    primary: "#7c3aed",
    primaryForeground: "#ffffff",
    secondary: "#1e1b4b",
    secondaryForeground: "#ffffff",
    accent: "#f97316",
    accentForeground: "#ffffff",
    background: "#0f0f0f",
    foreground: "#ffffff",
    muted: "#262626",
    mutedForeground: "#a3a3a3",
    border: "#404040",
    ring: "#7c3aed",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    success: "#16a34a",
    successForeground: "#ffffff",
    warning: "#eab308",
    warningForeground: "#0f0f0f",
  },
  spacing: {
    none: "0",
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1.25rem",
    lg: "2rem",
    xl: "3rem",
    "2xl": "4rem",
    "3xl": "6rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 2px 4px 0 rgb(124 58 237 / 0.1)",
    md: "0 4px 12px -2px rgb(124 58 237 / 0.2)",
    lg: "0 8px 24px -4px rgb(124 58 237 / 0.25)",
    xl: "0 16px 48px -8px rgb(124 58 237 / 0.3)",
  },
};

/**
 * Elegant Theme
 * Sophisticated, refined aesthetic with serif typography
 */
export const elegantPreset: GlobalStyles = {
  name: "Elegant",
  typography: {
    fontFamily: {
      heading: "Playfair Display, serif",
      body: "Lora, Georgia, serif",
      mono: "IBM Plex Mono, Consolas, monospace",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.375rem",
      "2xl": "1.75rem",
      "3xl": "2.25rem",
      "4xl": "3rem",
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.9,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  colors: {
    primary: "#1c1917",
    primaryForeground: "#fafaf9",
    secondary: "#f5f5f4",
    secondaryForeground: "#1c1917",
    accent: "#b45309",
    accentForeground: "#fafaf9",
    background: "#fafaf9",
    foreground: "#1c1917",
    muted: "#e7e5e4",
    mutedForeground: "#78716c",
    border: "#d6d3d1",
    ring: "#b45309",
    destructive: "#b91c1c",
    destructiveForeground: "#fafaf9",
    success: "#15803d",
    successForeground: "#fafaf9",
    warning: "#ca8a04",
    warningForeground: "#1c1917",
  },
  spacing: {
    none: "0",
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.75rem",
    xl: "2.5rem",
    "2xl": "3.5rem",
    "3xl": "5rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.1875rem",
    lg: "0.25rem",
    xl: "0.375rem",
    full: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 1px 3px 0 rgb(28 25 23 / 0.04)",
    md: "0 4px 8px -2px rgb(28 25 23 / 0.08)",
    lg: "0 8px 16px -4px rgb(28 25 23 / 0.1)",
    xl: "0 16px 32px -8px rgb(28 25 23 / 0.12)",
  },
};

/**
 * Playful Theme
 * Fun, energetic design with rounded elements
 */
export const playfulPreset: GlobalStyles = {
  name: "Playful",
  typography: {
    fontFamily: {
      heading: "Nunito, sans-serif",
      body: "Nunito, sans-serif",
      mono: "Source Code Pro, Consolas, monospace",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.375rem",
      "2xl": "1.75rem",
      "3xl": "2.25rem",
      "4xl": "3rem",
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.6,
      relaxed: 1.8,
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      semibold: 700,
      bold: 800,
    },
  },
  colors: {
    primary: "#ec4899",
    primaryForeground: "#ffffff",
    secondary: "#8b5cf6",
    secondaryForeground: "#ffffff",
    accent: "#06b6d4",
    accentForeground: "#ffffff",
    background: "#fefce8",
    foreground: "#1e1b4b",
    muted: "#fef3c7",
    mutedForeground: "#6b7280",
    border: "#fde68a",
    ring: "#ec4899",
    destructive: "#f43f5e",
    destructiveForeground: "#ffffff",
    success: "#10b981",
    successForeground: "#ffffff",
    warning: "#f59e0b",
    warningForeground: "#1e1b4b",
  },
  spacing: {
    none: "0",
    xs: "0.375rem",
    sm: "0.625rem",
    md: "1.125rem",
    lg: "1.75rem",
    xl: "2.5rem",
    "2xl": "3.5rem",
    "3xl": "5rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 2px 4px 0 rgb(236 72 153 / 0.1)",
    md: "0 4px 8px -2px rgb(236 72 153 / 0.15), 0 2px 4px -2px rgb(139 92 246 / 0.1)",
    lg: "0 8px 16px -4px rgb(236 72 153 / 0.2), 0 4px 8px -4px rgb(139 92 246 / 0.15)",
    xl: "0 16px 32px -8px rgb(236 72 153 / 0.25), 0 8px 16px -8px rgb(139 92 246 / 0.2)",
  },
};

/**
 * Corporate Theme
 * Professional, trustworthy design for business
 */
export const corporatePreset: GlobalStyles = {
  name: "Corporate",
  typography: {
    fontFamily: {
      heading: "IBM Plex Sans, sans-serif",
      body: "IBM Plex Sans, sans-serif",
      mono: "IBM Plex Mono, Consolas, monospace",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "2rem",
      "4xl": "2.5rem",
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  colors: {
    primary: "#0f172a",
    primaryForeground: "#f8fafc",
    secondary: "#1e40af",
    secondaryForeground: "#ffffff",
    accent: "#0284c7",
    accentForeground: "#ffffff",
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    ring: "#1e40af",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    success: "#059669",
    successForeground: "#ffffff",
    warning: "#d97706",
    warningForeground: "#ffffff",
  },
  spacing: {
    none: "0",
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.375rem",
    xl: "0.5rem",
    full: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(15 23 42 / 0.05)",
    md: "0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)",
    lg: "0 10px 15px -3px rgb(15 23 42 / 0.1), 0 4px 6px -4px rgb(15 23 42 / 0.08)",
    xl: "0 20px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.08)",
  },
};

/**
 * Map of all available presets
 */
export const themePresets: Record<ThemePreset, GlobalStyles> = {
  minimal: minimalPreset,
  bold: boldPreset,
  elegant: elegantPreset,
  playful: playfulPreset,
  corporate: corporatePreset,
};

/**
 * Get a preset by name
 */
export function getPreset(preset: ThemePreset): GlobalStyles {
  return themePresets[preset];
}

/**
 * Get all preset names
 */
export function getPresetNames(): ThemePreset[] {
  return Object.keys(themePresets) as ThemePreset[];
}

/**
 * Default preset to use when initializing
 */
export const defaultPreset: ThemePreset = "minimal";

/**
 * Get the default global styles
 */
export function getDefaultStyles(): GlobalStyles {
  return { ...themePresets[defaultPreset] };
}
