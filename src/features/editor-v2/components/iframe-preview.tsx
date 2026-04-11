"use client"

import { useEffect, useRef, useCallback } from "react"
import { useEditorStore } from "../store"

const VIEWPORT_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "375px" } as const

export function IframePreview() {
  const ref = useRef<HTMLIFrameElement>(null)
  const ready = useRef(false)
  const { sections, theme, viewport, zoom } = useEditorStore()

  const send = useCallback(() => {
    if (!ready.current || !ref.current?.contentWindow) return
    ref.current.contentWindow.postMessage({ type: "editor-preview-update", sections, theme }, "*")
  }, [sections, theme])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "editor-preview-ready") { ready.current = true; send() }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [send])

  // Send updates whenever sections or theme change
  useEffect(() => { send() }, [send])

  return (
    <div className="flex items-start justify-center h-full overflow-auto overscroll-contain p-8 pb-20 bg-[#f5f5f5]">
      <iframe
        ref={ref}
        src="/editor-v2/preview"
        className="bg-white shadow-sm rounded-lg border-0 transition-all duration-300"
        style={{
          width: VIEWPORT_WIDTHS[viewport],
          maxWidth: VIEWPORT_WIDTHS[viewport],
          height: "100%",
          minHeight: "600px",
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
        title="Page Preview"
      />
    </div>
  )
}
