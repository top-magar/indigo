export type ThemeConfig = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  mode: "light" | "dark";
};

export const defaultThemeConfig: ThemeConfig = {
  primaryColor: "#10b981",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  headingFont: "Inter",
  bodyFont: "Inter",
  borderRadius: "8px",
  mode: "light",
};

/**
 * Generates a React.CSSProperties object containing the mapped CSS variables
 * for a given ThemeConfig.
 */
export function generateThemeCssVars(theme: Record<string, string> | null | undefined): React.CSSProperties {
  const t = { ...defaultThemeConfig, ...theme };
  
  return {
    "--color-primary": t.primaryColor,
    "--color-background": t.backgroundColor,
    "--color-text": t.textColor,
    "--font-heading": t.headingFont,
    "--font-body": t.bodyFont,
    "--radius-base": t.borderRadius,
  } as React.CSSProperties;
}

/**
 * Returns a CSS string for injecting global theme variables in a <style> tag.
 */
export function generateThemeStyleString(theme: Record<string, string> | null | undefined, selector = ":root"): string {
  const vars = generateThemeCssVars(theme);
  const rules = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
    
  return `${selector} {\n${rules}\n}`;
}
