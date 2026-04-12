/**
 * Editor V2 Design Tokens
 *
 * Single source of truth for the editor's visual system.
 * These tokens define the storefront themes users can apply.
 *
 * Each preset is a complete theme: colors, typography, spacing, and shape.
 * Colors use hex for browser compatibility (OKLCH is used for generation only).
 */

export interface ThemePreset {
  id: string
  name: string
  description: string
  colors: [string, string, string]
  theme: ThemeValues
}

export interface ThemeValues {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedColor: string
  headingFont: string
  bodyFont: string
  headingWeight: string
  baseSize: number
  lineHeight: number
  letterSpacing: number
  borderRadius: number
  buttonStyle: "rounded" | "pill" | "sharp"
  sectionSpacing: number
  containerWidth: number
  mode?: string
  darkBg?: string
  darkText?: string
  darkSurface?: string
}

/**
 * 6 preset themes — each with a distinct personality.
 *
 * Design principles (from frontend-design skill):
 * - Distinctive typography (no Inter/Arial/Roboto defaults)
 * - Dominant colors with sharp accents
 * - Intentional shape language (radius + button style)
 * - Each theme feels like a different brand
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "studio",
    name: "Studio",
    description: "Clean editorial — sharp type, restrained palette",
    colors: ["#18181b", "#e4e4e7", "#f59e0b"],
    theme: {
      primaryColor: "#18181b",
      secondaryColor: "#52525b",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      surfaceColor: "#fafafa",
      textColor: "#09090b",
      mutedColor: "#a1a1aa",
      headingFont: "Sora",
      bodyFont: "Source Sans 3",
      headingWeight: "700",
      baseSize: 16,
      lineHeight: 1.6,
      letterSpacing: -0.2,
      borderRadius: 6,
      buttonStyle: "rounded",
      sectionSpacing: 64,
      containerWidth: 1120,
    },
  },
  {
    id: "luxe",
    name: "Luxe",
    description: "High-end serif — warm neutrals, gold accents",
    colors: ["#1c1917", "#c9a96e", "#f5f0eb"],
    theme: {
      primaryColor: "#1c1917",
      secondaryColor: "#c9a96e",
      accentColor: "#b45309",
      backgroundColor: "#faf8f5",
      surfaceColor: "#f5f0eb",
      textColor: "#1c1917",
      mutedColor: "#78716c",
      headingFont: "Cormorant Garamond",
      bodyFont: "Nunito Sans",
      headingWeight: "600",
      baseSize: 17,
      lineHeight: 1.7,
      letterSpacing: 0.3,
      borderRadius: 2,
      buttonStyle: "sharp",
      sectionSpacing: 80,
      containerWidth: 1060,
    },
  },
  {
    id: "pop",
    name: "Pop",
    description: "Bold and energetic — saturated colors, chunky shapes",
    colors: ["#dc2626", "#7c3aed", "#facc15"],
    theme: {
      primaryColor: "#dc2626",
      secondaryColor: "#7c3aed",
      accentColor: "#facc15",
      backgroundColor: "#fffbeb",
      surfaceColor: "#fef3c7",
      textColor: "#1c1917",
      mutedColor: "#78716c",
      headingFont: "Bricolage Grotesque",
      bodyFont: "DM Sans",
      headingWeight: "800",
      baseSize: 16,
      lineHeight: 1.5,
      letterSpacing: -0.5,
      borderRadius: 16,
      buttonStyle: "pill",
      sectionSpacing: 56,
      containerWidth: 1280,
    },
  },
  {
    id: "mono",
    name: "Mono",
    description: "Developer-friendly — monospace accents, minimal chrome",
    colors: ["#0f172a", "#475569", "#22d3ee"],
    theme: {
      primaryColor: "#0f172a",
      secondaryColor: "#475569",
      accentColor: "#22d3ee",
      backgroundColor: "#ffffff",
      surfaceColor: "#f8fafc",
      textColor: "#0f172a",
      mutedColor: "#94a3b8",
      headingFont: "JetBrains Mono",
      bodyFont: "IBM Plex Sans",
      headingWeight: "700",
      baseSize: 15,
      lineHeight: 1.6,
      letterSpacing: 0,
      borderRadius: 4,
      buttonStyle: "sharp",
      sectionSpacing: 48,
      containerWidth: 960,
    },
  },
  {
    id: "bloom",
    name: "Bloom",
    description: "Soft organic — rounded shapes, earthy greens",
    colors: ["#166534", "#65a30d", "#fbbf24"],
    theme: {
      primaryColor: "#166534",
      secondaryColor: "#65a30d",
      accentColor: "#fbbf24",
      backgroundColor: "#fefce8",
      surfaceColor: "#f7fee7",
      textColor: "#14532d",
      mutedColor: "#4d7c0f",
      headingFont: "Fraunces",
      bodyFont: "Outfit",
      headingWeight: "600",
      baseSize: 17,
      lineHeight: 1.7,
      letterSpacing: 0,
      borderRadius: 12,
      buttonStyle: "rounded",
      sectionSpacing: 72,
      containerWidth: 1140,
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark mode — deep navy, neon accents, atmospheric",
    colors: ["#a78bfa", "#f472b6", "#38bdf8"],
    theme: {
      primaryColor: "#a78bfa",
      secondaryColor: "#f472b6",
      accentColor: "#38bdf8",
      backgroundColor: "#0c0a1a",
      surfaceColor: "#1a1730",
      textColor: "#e8e5f5",
      mutedColor: "#8b85a8",
      headingFont: "Clash Display",
      bodyFont: "Satoshi",
      headingWeight: "700",
      baseSize: 16,
      lineHeight: 1.6,
      letterSpacing: 0,
      borderRadius: 10,
      buttonStyle: "rounded",
      sectionSpacing: 64,
      containerWidth: 1200,
      mode: "dark",
      darkBg: "#0c0a1a",
      darkText: "#e8e5f5",
      darkSurface: "#1a1730",
    } as ThemeValues,
  },
]

/** Google Fonts URL for all preset fonts */
export const PRESET_FONT_FAMILIES = [
  "Sora", "Source Sans 3",
  "Cormorant Garamond", "Nunito Sans",
  "Bricolage Grotesque", "DM Sans",
  "JetBrains Mono", "IBM Plex Sans",
  "Fraunces", "Outfit",
  "Clash Display", "Satoshi",
] as const
