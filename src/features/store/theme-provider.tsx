"use client"

import type { ReactNode } from "react"
import { sanitizeCss } from "@/features/editor/lib/sanitize-html"
import { themeToVars } from "@/shared/renderer"

export interface StoreTheme {
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  headingFont?: string
  bodyFont?: string
  borderRadius?: number
  [key: string]: unknown
}

export function StoreThemeProvider({ theme, children }: { theme: StoreTheme; children: ReactNode }) {
  const vars = themeToVars(theme as Record<string, unknown>)
  return (
    <div className="store-theme-root" style={{ ...vars, backgroundColor: "var(--store-bg, #ffffff)", color: "var(--store-text, #111827)", fontFamily: "var(--store-font-body, Inter)" }}>
      <style>{`
        .store-theme-root h1,.store-theme-root h2,.store-theme-root h3,.store-theme-root h4 {
          letter-spacing: var(--store-heading-tracking, 0em);
          font-size: calc(1em * var(--store-heading-scale, 100) / 100);
          font-family: var(--store-font-heading, inherit);
        }
        .store-theme-root { line-height: var(--store-body-leading, 1.6); font-size: calc(16px * var(--store-body-scale, 100) / 100); }
        .store-theme-root > section, .store-theme-root > header, .store-theme-root > footer, .store-theme-root > div > section {
          margin-bottom: var(--store-section-gap-v, 0px);
          padding-left: var(--store-section-gap-h, 0px);
          padding-right: var(--store-section-gap-h, 0px);
        }
        .store-theme-root > section > div, .store-theme-root > div > section > div { max-width: var(--store-max-width, none); margin-left: auto; margin-right: auto; }
      `}</style>
      {typeof theme.customCss === "string" && <style>{sanitizeCss(theme.customCss)}</style>}
      {children}
    </div>
  )
}
