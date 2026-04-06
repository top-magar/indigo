"use client"

import type { ReactNode } from "react"

interface EffectsProps {
  shadow?: string
  opacity?: number
  blur?: number
  borderRadius?: number
  children: ReactNode
}

const shadowMap: Record<string, string> = { sm: "0 1px 3px rgba(0,0,0,0.1)", md: "0 4px 12px rgba(0,0,0,0.1)", lg: "0 10px 30px rgba(0,0,0,0.12)" }

export function EffectsWrapper({ shadow, opacity, blur, borderRadius, children }: EffectsProps) {
  const style: React.CSSProperties = {
    ...(shadow && shadow !== "none" ? { boxShadow: shadowMap[shadow] ?? shadow } : {}),
    ...(opacity !== undefined && opacity < 100 ? { opacity: opacity / 100 } : {}),
    ...(blur ? { backdropFilter: `blur(${blur}px)` } : {}),
    ...(borderRadius ? { borderRadius, overflow: "hidden" as const } : {}),
  }

  const hasStyle = Object.keys(style).length > 0
  return hasStyle ? <div style={style}>{children}</div> : <>{children}</>
}
