"use client"

import { useEffect, useRef, useCallback } from "react"
import { useEditorStore } from "../store"

const VIEWPORT_WIDTHS = { desktop: "100%", tablet: "768px", mobile: "375px" } as const

export function IframePreview() {
  const ref = useRef<HTMLIFrameElement>(null)
  const ready = useRef(false)
  const { sections, theme, viewport, zoom, setPreviewMode } = useEditorStore()

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

  useEffect(() => { send() }, [send])

  // Escape to exit preview
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewMode(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [setPreviewMode])

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 shrink-0">
        <span className="text-xs text-muted-foreground">Preview Mode — Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[10px]">Esc</kbd> to exit</span>
        <button onClick={() => setPreviewMode(false)} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
      </div>
      <div className="flex-1 flex items-start justify-center overflow-auto bg-gray-100">
        <iframe
          ref={ref}
          src="/editor-v2/preview"
          className="bg-white border-0"
          style={{
            width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px",
            height: "100%",
            minHeight: "100vh",
          }}
          title="Page Preview"
        />
      </div>
    </div>
  )
}
