"use client"

import type { ReactNode } from "react"

interface VisibilityProps {
  hidden?: boolean
  /** In editor, hidden blocks show at reduced opacity instead of disappearing */
  editorMode?: boolean
  children: ReactNode
}

export function VisibilityWrapper({ hidden, editorMode, children }: VisibilityProps) {
  if (hidden && !editorMode) return null
  if (hidden && editorMode) return <div style={{ opacity: 0.3, pointerEvents: "none" }}>{children}</div>
  return <>{children}</>
}
