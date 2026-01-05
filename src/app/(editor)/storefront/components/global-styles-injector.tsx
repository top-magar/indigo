"use client"

import { useEffect } from "react"
import { useGlobalStylesStore, selectGlobalStyles } from "@/lib/editor/global-styles/store"
import { generateCSSVariables } from "@/lib/editor/global-styles/css-generator"

/**
 * Injects global styles as CSS variables into the document
 * This component should be rendered once at the editor root level
 */
export function GlobalStylesInjector() {
  const styles = useGlobalStylesStore(selectGlobalStyles)

  useEffect(() => {
    // Generate CSS variables from global styles
    const cssVariables = generateCSSVariables(styles)
    
    // Find or create the style element
    let styleEl = document.getElementById("global-styles-injector") as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = "global-styles-injector"
      document.head.appendChild(styleEl)
    }
    
    // Update the style content
    styleEl.textContent = `:root {\n${cssVariables.join("\n")}\n}`
    
    // Cleanup on unmount
    return () => {
      const el = document.getElementById("global-styles-injector")
      if (el) {
        el.remove()
      }
    }
  }, [styles])

  return null // This component doesn't render anything
}
