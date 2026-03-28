"use client"

import type { CSSProperties, ReactNode } from "react"

export interface StoreTheme {
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  headingFont?: string
  bodyFont?: string
  borderRadius?: number
}

const defaults: Required<StoreTheme> = {
  primaryColor: "#000000",
  secondaryColor: "#6b7280",
  accentColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  headingFont: "Inter",
  bodyFont: "Inter",
  borderRadius: 8,
}

export function themeToVars(theme: StoreTheme): CSSProperties {
  const t = { ...defaults, ...theme }
  return {
    "--store-primary": t.primaryColor,
    "--store-secondary": t.secondaryColor,
    "--store-accent": t.accentColor,
    "--store-bg": t.backgroundColor,
    "--store-text": t.textColor,
    "--store-font-heading": t.headingFont,
    "--store-font-body": t.bodyFont,
    "--store-radius": `${t.borderRadius}px`,
  } as CSSProperties
}

export function StoreThemeProvider({
  theme,
  children,
}: {
  theme: StoreTheme
  children: ReactNode
}) {
  return (
    <div style={{ ...themeToVars(theme), backgroundColor: "var(--store-bg)", color: "var(--store-text)", fontFamily: "var(--store-font-body)" }}>
      {children}
    </div>
  )
}
