"use client"

import { useBuilderStore } from "../../hooks/use-builder-store"
import { usePreviewSync } from "../../hooks/use-preview-sync"
import { cn } from "@/shared/utils"

interface PreviewFrameProps {
  storeSlug: string
  storeName: string
}

export function PreviewFrame({ storeSlug, storeName }: PreviewFrameProps) {
  const { viewport } = useBuilderStore()
  const { previewFrameRef } = usePreviewSync()

  const previewUrl = `/store/${storeSlug}?editor=true`

  return (
    <div className="h-full bg-muted/30 p-4">
      <div className="h-full flex items-center justify-center">
        <div
          className={cn(
            "bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300",
            viewport === "desktop" && "w-full h-full max-w-none",
            viewport === "tablet" && "w-[768px] h-[1024px] max-h-full",
            viewport === "mobile" && "w-[375px] h-[667px] max-h-full"
          )}
        >
          <iframe
            ref={previewFrameRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title={`${storeName} Preview`}
          />
        </div>
      </div>
    </div>
  )
}