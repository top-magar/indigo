"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SmartPhone01Icon,
  LaptopIcon,
  ComputerIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useEditorPreview } from "@/lib/editor"
import { useEditorStore, selectViewport } from "@/lib/editor/store"
import { VIEWPORT_CONFIG } from "@/lib/editor/types"

interface LivePreviewProps {
  storeUrl: string
  onBlockSelect?: (blockId: string) => void
  zoom?: number
  onZoomChange?: (zoom: number) => void
}

export function LivePreview({ storeUrl, onBlockSelect, zoom: externalZoom, onZoomChange }: LivePreviewProps) {
  const viewport = useEditorStore(selectViewport)
  const [isLoading, setIsLoading] = useState(true)
  const [autoScale, setAutoScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const { iframeRef, isPreviewReady, handleIframeLoad, scrollToBlock } = useEditorPreview({
    onBlockClick: (blockId) => {
      onBlockSelect?.(blockId)
    },
  })

  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)

  const config = VIEWPORT_CONFIG[viewport]
  const effectiveScale = externalZoom ?? autoScale

  // Calculate scale to fit container (only when no external zoom)
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || externalZoom !== undefined) return
      const containerWidth = containerRef.current.clientWidth - 64
      const containerHeight = containerRef.current.clientHeight - 64
      const viewportWidth = config.width
      const viewportHeight = config.height + (viewport === "desktop" ? 40 : 0)

      const scaleX = containerWidth / viewportWidth
      const scaleY = containerHeight / viewportHeight
      const newScale = Math.min(1, scaleX, scaleY)
      setAutoScale(newScale)
    }

    updateScale()
    const resizeObserver = new ResizeObserver(() => updateScale())
    if (containerRef.current) resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [viewport, config, externalZoom])

  // Scroll to selected block when it changes
  useEffect(() => {
    if (selectedBlockId && isPreviewReady) scrollToBlock(selectedBlockId)
  }, [selectedBlockId, isPreviewReady, scrollToBlock])

  // Pinch-to-zoom gesture handler
  useEffect(() => {
    const container = containerRef.current
    if (!container || !onZoomChange) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const currentZoom = externalZoom ?? autoScale
        const delta = -e.deltaY * 0.01
        const newZoom = Math.min(1.5, Math.max(0.25, currentZoom + delta))
        onZoomChange(newZoom)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [externalZoom, autoScale, onZoomChange])

  const handleLoad = useCallback(() => { setIsLoading(false); handleIframeLoad() }, [handleIframeLoad])

  const editorUrl = `${storeUrl}?editor=true`

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden">
      {/* Preview container with dotted background */}
      <div
        ref={containerRef}
        className="relative min-h-0 w-full min-w-0 flex-1 overflow-auto p-8"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`, backgroundSize: '24px 24px' }}
      >
        {/* Connection status indicator */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm">
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            isPreviewReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
          )} />
          <span className="text-[10px] font-medium text-muted-foreground">
            {isPreviewReady ? "Live" : "Connecting..."}
          </span>
        </div>

        {/* Viewport container */}
        <div 
          className="mx-auto origin-top transition-transform duration-300 ease-out" 
          style={{ width: config.width, transform: `scale(${effectiveScale})` }}
        >
          <div className={cn(
            "overflow-hidden bg-background transition-all duration-300",
            viewport === "mobile" && "rounded-[3rem] border-12 border-gray-900 dark:border-gray-700 shadow-2xl",
            viewport === "tablet" && "rounded-[1.5rem] border-8 border-gray-800 dark:border-gray-600 shadow-2xl",
            viewport === "desktop" && "rounded-xl border border-border shadow-2xl"
          )}>
            {/* Mobile notch */}
            {viewport === "mobile" && (
              <div className="relative h-7 bg-gray-900 dark:bg-gray-700">
                <div className="absolute left-1/2 top-1 -translate-x-1/2 h-5 w-28 rounded-full bg-black" />
              </div>
            )}
            
            {/* Desktop browser chrome */}
            {viewport === "desktop" && (
              <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-lg bg-background border px-3 py-1.5 text-xs text-muted-foreground max-w-md w-full">
                    <div className="h-3 w-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="truncate">{storeUrl}</span>
                    {isPreviewReady && <Badge variant="secondary" className="ml-auto text-[9px] h-4">Live</Badge>}
                  </div>
                </div>
                <div className="w-[52px]" />
              </div>
            )}
            
            {/* Iframe content */}
            <div className="relative bg-background" style={{ height: viewport === "mobile" ? config.height - 48 : config.height - (viewport === "desktop" ? 40 : 0) }}>
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full border-2 border-muted" />
                      <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                    <span className="text-sm text-muted-foreground">Loading preview...</span>
                  </div>
                </div>
              )}
              <iframe ref={iframeRef} src={editorUrl} className="h-full w-full" onLoad={handleLoad} title="Store Preview" />
            </div>
            
            {/* Mobile home indicator */}
            {viewport === "mobile" && (
              <div className="flex h-5 items-center justify-center bg-gray-900 dark:bg-gray-700">
                <div className="h-1 w-32 rounded-full bg-white/30" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
