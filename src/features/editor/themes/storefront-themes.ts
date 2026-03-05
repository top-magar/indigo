/**
 * Storefront Theme Presets
 * 
 * Based on Theme Factory skill pattern from awesome-claude-skills.
 * Each theme defines a brand hue (OKLCH), font pairing, and layout density.
 * The OKLCH token system auto-generates the full color scale from the hue.
 */

export interface StorefrontTheme {
  id: string;
  name: string;
  description: string;
  brandHue: number;        // 0-360 OKLCH hue
  headingFont: string;
  bodyFont: string;
  radius: "none" | "sm" | "md" | "lg" | "full";
  density: "compact" | "default" | "spacious";
  style: "minimal" | "bold" | "elegant" | "playful";
}

export const STOREFRONT_THEMES: StorefrontTheme[] = [
  {
    id: "himalayan-clarity",
    name: "Himalayan Clarity",
    description: "Clean, minimal commerce inspired by mountain air",
    brandHue: 185,  // teal
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    radius: "md",
    density: "default",
    style: "minimal",
  },
  {
    id: "kathmandu-sunset",
    name: "Kathmandu Sunset",
    description: "Warm, inviting tones for artisan and craft stores",
    brandHue: 25,   // warm orange
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    radius: "lg",
    density: "spacious",
    style: "elegant",
  },
  {
    id: "everest-bold",
    name: "Everest Bold",
    description: "High-contrast, bold design for tech and electronics",
    brandHue: 240,  // blue
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    radius: "sm",
    density: "compact",
    style: "bold",
  },
  {
    id: "terai-garden",
    name: "Terai Garden",
    description: "Fresh, organic feel for food and wellness brands",
    brandHue: 155,  // green
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    radius: "lg",
    density: "spacious",
    style: "playful",
  },
  {
    id: "indigo-night",
    name: "Indigo Night",
    description: "Deep, sophisticated palette for premium brands",
    brandHue: 270,  // purple/indigo
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    radius: "md",
    density: "default",
    style: "elegant",
  },
  {
    id: "ruby-bazaar",
    name: "Ruby Bazaar",
    description: "Vibrant, energetic design for fashion and lifestyle",
    brandHue: 0,    // red
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    radius: "md",
    density: "default",
    style: "bold",
  },
  {
    id: "snow-peak",
    name: "Snow Peak",
    description: "Ultra-minimal, monochrome for luxury goods",
    brandHue: 0,    // neutral (chroma near 0)
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    radius: "none",
    density: "spacious",
    style: "minimal",
  },
  {
    id: "golden-temple",
    name: "Golden Temple",
    description: "Rich, warm gold tones for jewelry and heritage brands",
    brandHue: 85,   // gold/amber
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
    radius: "sm",
    density: "default",
    style: "elegant",
  },
];

/** Generate CSS custom properties for a theme */
export function getThemeCSS(theme: StorefrontTheme): Record<string, string> {
  const radiusMap = { none: "0px", sm: "4px", md: "6px", lg: "8px", full: "9999px" };
  const spacingMap = { compact: "0.875", default: "1", spacious: "1.125" };

  return {
    "--ds-brand-hue": String(theme.brandHue),
    "--store-radius": radiusMap[theme.radius],
    "--store-spacing-scale": spacingMap[theme.density],
    "--store-heading-font": theme.headingFont,
    "--store-body-font": theme.bodyFont,
  };
}

/** Apply theme to a DOM element */
export function applyTheme(element: HTMLElement, theme: StorefrontTheme) {
  const css = getThemeCSS(theme);
  for (const [key, value] of Object.entries(css)) {
    element.style.setProperty(key, value);
  }
}
