/**
 * CSS Generator for Global Styles
 * Converts GlobalStyles configuration to CSS custom properties
 */

import type { GlobalStyles, TypographyConfig, ColorConfig, SpacingConfig, BorderRadiusConfig, ShadowConfig } from "./types";

/**
 * Generate CSS custom properties from typography configuration
 */
function generateTypographyVariables(typography: TypographyConfig): string[] {
  const variables: string[] = [];

  // Font families
  variables.push(`--font-heading: ${typography.fontFamily.heading};`);
  variables.push(`--font-body: ${typography.fontFamily.body};`);
  variables.push(`--font-mono: ${typography.fontFamily.mono};`);

  // Font scale
  variables.push(`--text-xs: ${typography.scale.xs};`);
  variables.push(`--text-sm: ${typography.scale.sm};`);
  variables.push(`--text-base: ${typography.scale.base};`);
  variables.push(`--text-lg: ${typography.scale.lg};`);
  variables.push(`--text-xl: ${typography.scale.xl};`);
  variables.push(`--text-2xl: ${typography.scale["2xl"]};`);
  variables.push(`--text-3xl: ${typography.scale["3xl"]};`);
  variables.push(`--text-4xl: ${typography.scale["4xl"]};`);

  // Line heights
  variables.push(`--leading-tight: ${typography.lineHeight.tight};`);
  variables.push(`--leading-normal: ${typography.lineHeight.normal};`);
  variables.push(`--leading-relaxed: ${typography.lineHeight.relaxed};`);

  // Font weights
  variables.push(`--font-normal: ${typography.fontWeight.normal};`);
  variables.push(`--font-medium: ${typography.fontWeight.medium};`);
  variables.push(`--font-semibold: ${typography.fontWeight.semibold};`);
  variables.push(`--font-bold: ${typography.fontWeight.bold};`);

  return variables;
}

/**
 * Generate CSS custom properties from color configuration
 */
function generateColorVariables(colors: ColorConfig): string[] {
  const variables: string[] = [];

  variables.push(`--color-primary: ${colors.primary};`);
  variables.push(`--color-primary-foreground: ${colors.primaryForeground};`);
  variables.push(`--color-secondary: ${colors.secondary};`);
  variables.push(`--color-secondary-foreground: ${colors.secondaryForeground};`);
  variables.push(`--color-accent: ${colors.accent};`);
  variables.push(`--color-accent-foreground: ${colors.accentForeground};`);
  variables.push(`--color-background: ${colors.background};`);
  variables.push(`--color-foreground: ${colors.foreground};`);
  variables.push(`--color-muted: ${colors.muted};`);
  variables.push(`--color-muted-foreground: ${colors.mutedForeground};`);
  variables.push(`--color-border: ${colors.border};`);
  variables.push(`--color-ring: ${colors.ring};`);
  variables.push(`--color-destructive: ${colors.destructive};`);
  variables.push(`--color-destructive-foreground: ${colors.destructiveForeground};`);
  variables.push(`--color-success: ${colors.success};`);
  variables.push(`--color-success-foreground: ${colors.successForeground};`);
  variables.push(`--color-warning: ${colors.warning};`);
  variables.push(`--color-warning-foreground: ${colors.warningForeground};`);

  return variables;
}

/**
 * Generate CSS custom properties from spacing configuration
 */
function generateSpacingVariables(spacing: SpacingConfig): string[] {
  const variables: string[] = [];

  variables.push(`--spacing-none: ${spacing.none};`);
  variables.push(`--spacing-xs: ${spacing.xs};`);
  variables.push(`--spacing-sm: ${spacing.sm};`);
  variables.push(`--spacing-md: ${spacing.md};`);
  variables.push(`--spacing-lg: ${spacing.lg};`);
  variables.push(`--spacing-xl: ${spacing.xl};`);
  variables.push(`--spacing-2xl: ${spacing["2xl"]};`);
  variables.push(`--spacing-3xl: ${spacing["3xl"]};`);

  return variables;
}

/**
 * Generate CSS custom properties from border radius configuration
 */
function generateBorderRadiusVariables(borderRadius: BorderRadiusConfig): string[] {
  const variables: string[] = [];

  variables.push(`--radius-none: ${borderRadius.none};`);
  variables.push(`--radius-sm: ${borderRadius.sm};`);
  variables.push(`--radius-md: ${borderRadius.md};`);
  variables.push(`--radius-lg: ${borderRadius.lg};`);
  variables.push(`--radius-xl: ${borderRadius.xl};`);
  variables.push(`--radius-full: ${borderRadius.full};`);

  return variables;
}

/**
 * Generate CSS custom properties from shadow configuration
 */
function generateShadowVariables(shadows: ShadowConfig): string[] {
  const variables: string[] = [];

  variables.push(`--shadow-none: ${shadows.none};`);
  variables.push(`--shadow-sm: ${shadows.sm};`);
  variables.push(`--shadow-md: ${shadows.md};`);
  variables.push(`--shadow-lg: ${shadows.lg};`);
  variables.push(`--shadow-xl: ${shadows.xl};`);

  return variables;
}

/**
 * Generate CSS custom properties from custom variables
 */
function generateCustomVariables(customVariables?: Record<string, string>): string[] {
  if (!customVariables) return [];

  return Object.entries(customVariables).map(([key, value]) => {
    // Ensure the key starts with --
    const cssKey = key.startsWith("--") ? key : `--${key}`;
    return `${cssKey}: ${value};`;
  });
}

/**
 * Generate all CSS custom properties from GlobalStyles
 * Returns an array of CSS variable declarations
 */
export function generateCSSVariables(styles: GlobalStyles): string[] {
  const variables: string[] = [];

  variables.push(...generateTypographyVariables(styles.typography));
  variables.push(...generateColorVariables(styles.colors));
  variables.push(...generateSpacingVariables(styles.spacing));
  variables.push(...generateBorderRadiusVariables(styles.borderRadius));
  variables.push(...generateShadowVariables(styles.shadows));
  variables.push(...generateCustomVariables(styles.customVariables));

  return variables;
}

/**
 * Generate a complete CSS string with :root selector
 * Can be injected into a style tag for the preview
 */
export function generateCSSString(styles: GlobalStyles): string {
  const variables = generateCSSVariables(styles);
  return `:root {\n  ${variables.join("\n  ")}\n}`;
}

/**
 * Generate CSS string for a specific selector (e.g., for scoped styles)
 */
export function generateScopedCSS(styles: GlobalStyles, selector: string): string {
  const variables = generateCSSVariables(styles);
  return `${selector} {\n  ${variables.join("\n  ")}\n}`;
}

/**
 * Generate a CSS variables object for inline style injection
 * Useful for React's style prop or CSS-in-JS solutions
 */
export function generateCSSVariablesObject(styles: GlobalStyles): Record<string, string> {
  const variables = generateCSSVariables(styles);
  const result: Record<string, string> = {};

  for (const variable of variables) {
    const [key, ...valueParts] = variable.replace(";", "").split(": ");
    const value = valueParts.join(": "); // Handle values that contain colons
    result[key.trim()] = value.trim();
  }

  return result;
}

/**
 * Generate a style element that can be inserted into the document
 */
export function createStyleElement(styles: GlobalStyles, id = "global-styles"): HTMLStyleElement {
  const styleElement = document.createElement("style");
  styleElement.id = id;
  styleElement.textContent = generateCSSString(styles);
  return styleElement;
}

/**
 * Update or create a style element in the document
 */
export function injectStyles(styles: GlobalStyles, id = "global-styles"): void {
  const existingStyle = document.getElementById(id);
  const cssString = generateCSSString(styles);

  if (existingStyle) {
    existingStyle.textContent = cssString;
  } else {
    const styleElement = document.createElement("style");
    styleElement.id = id;
    styleElement.textContent = cssString;
    document.head.appendChild(styleElement);
  }
}

/**
 * Remove injected styles from the document
 */
export function removeStyles(id = "global-styles"): void {
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }
}

/**
 * Generate CSS for font imports (Google Fonts)
 * Returns a link element href for Google Fonts
 */
export function generateGoogleFontsUrl(styles: GlobalStyles): string {
  const fonts = new Set<string>();

  // Extract font family names (first font in the stack)
  const extractFontName = (fontStack: string): string | null => {
    const firstFont = fontStack.split(",")[0].trim();
    // Remove quotes if present
    const fontName = firstFont.replace(/['"]/g, "");
    // Skip system fonts
    const systemFonts = ["system-ui", "sans-serif", "serif", "monospace", "cursive", "fantasy"];
    if (systemFonts.includes(fontName.toLowerCase())) {
      return null;
    }
    return fontName;
  };

  const headingFont = extractFontName(styles.typography.fontFamily.heading);
  const bodyFont = extractFontName(styles.typography.fontFamily.body);
  const monoFont = extractFontName(styles.typography.fontFamily.mono);

  if (headingFont) fonts.add(headingFont);
  if (bodyFont) fonts.add(bodyFont);
  if (monoFont) fonts.add(monoFont);

  if (fonts.size === 0) return "";

  // Build Google Fonts URL
  const fontFamilies = Array.from(fonts)
    .map((font) => {
      const weights = "400;500;600;700;800";
      return `family=${font.replace(/ /g, "+")}:wght@${weights}`;
    })
    .join("&");

  return `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
}

/**
 * Generate a complete HTML snippet for font loading
 */
export function generateFontLinkTag(styles: GlobalStyles): string {
  const url = generateGoogleFontsUrl(styles);
  if (!url) return "";
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${url}" rel="stylesheet">`;
}
