"use client"
import { useEffect } from "react"
import { useEditorV3Store } from "../../stores/store"

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

/** Injects/removes Google Fonts <link> tags into the given document's head.
 *  Pass the iframe's contentDocument to isolate fonts to the canvas. */
export function useGoogleFonts(targetDoc?: Document | null) {
  useEffect(() => {
    const doc = targetDoc ?? document
    const update = () => {
      if (!doc.head) return
      const fonts = extractGoogleFonts()
      doc.querySelectorAll("link[data-v3-font]").forEach((el) => {
        if (!fonts.has(el.getAttribute("data-v3-font")!)) el.remove()
      })
      for (const font of fonts) {
        if (doc.querySelector(`link[data-v3-font="${font}"]`)) continue
        const link = doc.createElement("link")
        link.rel = "stylesheet"
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700&display=swap`
        link.setAttribute("data-v3-font", font)
        doc.head.appendChild(link)
      }
    }
    update()
    return useEditorV3Store.subscribe(update)
  }, [targetDoc])
}
