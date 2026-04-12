"use client"
import { useEffect } from "react"
import { useEditorV3Store } from "../../stores/store"

/** Fonts that don't need Google Fonts links */
const SYSTEM_FONTS = new Set([
  "arial", "helvetica", "georgia", "times new roman", "courier new",
  "verdana", "trebuchet ms", "system-ui", "sans-serif", "serif", "monospace",
])

function extractGoogleFonts(): Set<string> {
  const fonts = new Set<string>()
  const s = useEditorV3Store.getState()
  for (const decl of s.styleDeclarations.values()) {
    if (decl.property === "fontFamily" && decl.value.type === "keyword") {
      const primary = decl.value.value.split(",")[0].trim().replace(/['"]/g, "")
      if (primary && !SYSTEM_FONTS.has(primary.toLowerCase())) fonts.add(primary)
    }
  }
  return fonts
}

/** Injects/removes Google Fonts <link> tags in document head */
export function useGoogleFonts() {
  useEffect(() => {
    const update = () => {
      const fonts = extractGoogleFonts()
      // Remove stale links
      document.querySelectorAll("link[data-v3-font]").forEach((el) => {
        if (!fonts.has(el.getAttribute("data-v3-font")!)) el.remove()
      })
      // Add missing links
      for (const font of fonts) {
        if (document.querySelector(`link[data-v3-font="${font}"]`)) continue
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700&display=swap`
        link.setAttribute("data-v3-font", font)
        document.head.appendChild(link)
      }
    }
    update()
    return useEditorV3Store.subscribe(update)
  }, [])
}
