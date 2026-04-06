"use client"

import type { ReactNode } from "react"

interface LayoutProps {
  widthMode?: "fixed" | "fill" | "hug"
  width?: number
  sticky?: "none" | "top" | "bottom"
  children: ReactNode
}

export function LayoutWrapper({ widthMode = "fixed", width, sticky = "none", children }: LayoutProps) {
  const style: React.CSSProperties = {
    ...(widthMode === "fill" ? { width: "100%" } : widthMode === "hug" ? { width: "fit-content" } : width ? { width } : {}),
    ...(sticky === "top" ? { position: "sticky", top: 0, zIndex: 40 } : sticky === "bottom" ? { position: "sticky", bottom: 0, zIndex: 40 } : {}),
  }

  const hasStyle = Object.keys(style).length > 0
  return hasStyle ? <div style={style}>{children}</div> : <>{children}</>
}
