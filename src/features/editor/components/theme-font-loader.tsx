"use client"

import { useEffect } from "react"

/** Loads Google Fonts into document.head for the current theme */
export function ThemeFontLoader({ headingFont, bodyFont }: { headingFont?: string; bodyFont?: string }) {
  useEffect(() => {
    const fonts = [headingFont, bodyFont].filter((f): f is string => !!f && f !== "System UI")
    if (fonts.length === 0) return
    const params = fonts.map((f) => `family=${f.replace(/ /g, "+")}`).join("&")
    const href = `https://fonts.googleapis.com/css2?${params}&display=swap`

    // Avoid duplicates
    const existing = document.querySelector(`link[href="${href}"]`)
    if (existing) return

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    document.head.appendChild(link)
    return () => { link.remove() }
  }, [headingFont, bodyFont])

  return null
}
