"use client"

// Preview Sync Hook - Synchronizes block builder changes with preview iframe
import { useEffect, useRef } from "react"
import { useBuilderStore } from "./use-builder-store"
import { builderBlocksToStoreBlocks } from "../utils/block-converter"

export function usePreviewSync() {
  const { document } = useBuilderStore()
  const previewFrameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!document || !previewFrameRef.current) return

    // Convert builder blocks to store blocks
    const storeBlocks = builderBlocksToStoreBlocks(document.blocks)

    // Send updated blocks to preview iframe
    const message = {
      type: "BLOCK_BUILDER_UPDATE",
      blocks: storeBlocks,
      timestamp: Date.now(),
    }

    try {
      previewFrameRef.current.contentWindow?.postMessage(message, "*")
    } catch (error) {
      console.warn("Failed to send message to preview iframe:", error)
    }
  }, [document])

  return { previewFrameRef }
}