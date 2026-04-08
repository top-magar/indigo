/**
 * Theme-aware style resolver.
 * When a block prop is empty/default, falls back to --store-* CSS variables.
 * When explicitly set by the user, uses the explicit value.
 */

const THEME_DEFAULTS: Record<string, string> = {
  backgroundColor: "var(--store-bg, #ffffff)",
  textColor: "var(--store-text, #111827)",
  accentColor: "var(--store-accent, #3b82f6)",
  headingFont: "var(--store-font-heading, Inter)",
  bodyFont: "var(--store-font-body, Inter)",
  borderRadius: "var(--store-radius, 8px)",
  primaryColor: "var(--store-primary, #000000)",
  secondaryColor: "var(--store-secondary, #6b7280)",
}

/** Sentinel values that mean "use theme default" */
const EMPTY_VALUES = new Set(["", "transparent", undefined, null])

/**
 * Resolve a style prop: if explicitly set by user, use it.
 * If empty/default, return the CSS variable fallback.
 */
export function themeValue(prop: string, value: string | undefined | null): string {
  if (EMPTY_VALUES.has(value as string)) {
    return THEME_DEFAULTS[prop] ?? value ?? ""
  }
  return value ?? ""
}

/**
 * Resolve common style props for a block.
 * Usage: const s = resolveThemeStyles(props)
 * Then: style={{ backgroundColor: s.bg, color: s.text, fontFamily: s.headingFont }}
 */
export function resolveThemeStyles(props: Record<string, unknown>) {
  return {
    bg: themeValue("backgroundColor", props.backgroundColor as string),
    text: themeValue("textColor", props.textColor as string),
    accent: themeValue("accentColor", props.accentColor as string),
    headingFont: "var(--store-font-heading, Inter)",
    bodyFont: "var(--store-font-body, Inter)",
    radius: "var(--store-radius, 8px)",
    primary: themeValue("primaryColor", props.primaryColor as string),
  }
}
