import type React from "react"

/** Convert a theme object into CSS custom properties for the store canvas */
export function themeToVars(t: Record<string, unknown>): React.CSSProperties {
  const vars: Record<string, string> = {}
  if (t?.primaryColor) vars["--store-primary"] = t.primaryColor as string
  if (t?.secondaryColor) vars["--store-secondary"] = t.secondaryColor as string
  if (t?.accentColor) vars["--store-accent"] = t.accentColor as string
  if (t?.backgroundColor) vars["--store-bg"] = t.backgroundColor as string
  if (t?.textColor) vars["--store-text"] = t.textColor as string
  if (t?.headingFont) vars["--store-font-heading"] = t.headingFont as string
  if (t?.bodyFont) vars["--store-font-body"] = t.bodyFont as string
  if (t?.borderRadius !== undefined && t?.borderRadius !== null) vars["--store-radius"] = `${t.borderRadius}px`
  if (t?.headingScale) vars["--store-heading-scale"] = `${t.headingScale}`
  if (t?.bodyScale) vars["--store-body-scale"] = `${t.bodyScale}`
  if (t?.headingLetterSpacing !== undefined) vars["--store-heading-tracking"] = `${t.headingLetterSpacing}em`
  if (t?.bodyLineHeight) vars["--store-body-leading"] = `${t.bodyLineHeight}`
  if (t?.maxWidth) vars["--store-max-width"] = `${t.maxWidth}px`
  if (t?.sectionSpacingV) vars["--store-section-gap-v"] = `${t.sectionSpacingV}px`
  if (t?.sectionSpacingH) vars["--store-section-gap-h"] = `${t.sectionSpacingH}px`
  if (t?.buttonShape) {
    const r = t.buttonShape === "square" ? "2px" : t.buttonShape === "pill" ? "999px" : "var(--store-radius, 8px)"
    vars["--store-btn-radius"] = r
  }
  if (t?.buttonStyle) vars["--store-btn-style"] = t.buttonStyle as string
  if (t?.buttonShadow && t.buttonShadow !== "none") {
    const shadows: Record<string, string> = { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 2px 6px rgba(0,0,0,0.1)", lg: "0 4px 12px rgba(0,0,0,0.15)" }
    vars["--store-btn-shadow"] = shadows[t.buttonShadow as string] || "none"
  }
  if (t?.revealOnScroll) vars["--store-reveal"] = "1"
  if (t?.hoverEffect && t.hoverEffect !== "none") vars["--store-hover-effect"] = t.hoverEffect as string
  if (t?.pageTransition && t.pageTransition !== "none") vars["--store-page-transition"] = t.pageTransition as string
  if (t?.backgroundColor) {
    const bg = t.backgroundColor as string
    const isDark = isColorDark(bg)
    vars["--store-placeholder-bg"] = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
    vars["--store-placeholder-text"] = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"
    vars["--store-border"] = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"
  }
  return vars as React.CSSProperties
}

function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "")
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
