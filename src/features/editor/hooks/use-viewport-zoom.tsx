"use client"

import { useState, useCallback, useEffect, useRef, createContext, useContext, type ReactNode } from "react"

export type Viewport = "desktop" | "tablet" | "mobile"

const VIEWPORT_PX: Record<Viewport, number> = { desktop: 1280, tablet: 768, mobile: 375 }

interface ViewportZoomValue {
  viewport: Viewport
  handleViewportChange: (v: Viewport) => void
  zoom: number
  setZoom: (z: number) => void
}

const ViewportZoomContext = createContext<ViewportZoomValue | null>(null)

export function useViewportZoomContext(): ViewportZoomValue {
  const ctx = useContext(ViewportZoomContext)
  if (!ctx) throw new Error("useViewportZoomContext must be used within ViewportZoomProvider")
  return ctx
}

export function ViewportZoomProvider({ canvasRef, children }: { canvasRef: React.RefObject<HTMLDivElement | null>; children: ReactNode }) {
  const value = useViewportZoom(canvasRef)
  return <ViewportZoomContext value={value}>{children}</ViewportZoomContext>
}

export function useViewportZoom(canvasRef?: React.RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const [zoom, setZoom] = useState(1)
  const [autoZoom, setAutoZoom] = useState(true)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  const handleViewportChange = useCallback((v: Viewport) => { setViewport(v); setAutoZoom(true) }, [])
  const handleZoomChange = useCallback((z: number) => { setAutoZoom(false); setZoom(z) }, [])

  // Auto-fit zoom when viewport exceeds available canvas space
  useEffect(() => {
    if (!autoZoom) return
    const canvas = canvasRef?.current
    if (!canvas) return
    const viewportPx = VIEWPORT_PX[viewport]
    const observe = () => {
      const available = canvas.clientWidth - 48
      if (available < viewportPx) {
        setZoom(Math.max(0.5, Math.floor((available / viewportPx) * 20) / 20))
      } else if (zoomRef.current < 1) {
        setZoom(1)
      }
    }
    const ro = new ResizeObserver(observe)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [viewport, autoZoom, canvasRef]) // eslint-disable-line react-hooks/exhaustive-deps

  return { viewport, handleViewportChange, zoom, setZoom: handleZoomChange }
}
