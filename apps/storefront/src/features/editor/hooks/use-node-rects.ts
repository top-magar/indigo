"use client"

import { useCallback } from "react"
import { useCanvasAdapter, type NodeRect } from "../lib/canvas-adapter"

export type { NodeRect }

/** Query all visible craft node rects via the canvas adapter. */
export function useNodeRects() {
  const adapter = useCanvasAdapter()
  return useCallback((excludeId?: string): NodeRect[] => adapter.getAllNodeRects(excludeId), [adapter])
}
