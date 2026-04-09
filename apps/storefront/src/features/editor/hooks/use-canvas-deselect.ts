"use client"

import { useEditor } from "@craftjs/core"
import { useCallback } from "react"

/** Deselects all nodes when clicking the canvas background (dot pattern area) */
export function useCanvasDeselect() {
  const { actions } = useEditor()

  return useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background, not on a block
    if ((e.target as HTMLElement).closest("[data-craft-node-id]")) return
    actions.selectNode(undefined as unknown as string)
  }, [actions])
}
