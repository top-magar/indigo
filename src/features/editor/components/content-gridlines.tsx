"use client"

import { useMemo } from "react"
import { useGridMeasure } from "../use-grid-measure"

export function ContentGridlines({ visible }: { visible: boolean }) {
  const g = useGridMeasure(visible)

  const lines = useMemo(() => {
    if (!g) return null
    const { frameLeft, frameWidth, maxW, padH, zoom } = g
    const scaledPad = padH * zoom

    let left: number, right: number, paddingLeft: number, paddingRight: number
    if (maxW <= 0 || maxW * zoom >= frameWidth) {
      left = frameLeft + scaledPad
      right = frameLeft + frameWidth - scaledPad
      paddingLeft = left
      paddingRight = right
    } else {
      const scaledMax = maxW * zoom
      const offset = (frameWidth - scaledMax) / 2
      left = frameLeft + offset
      right = frameLeft + frameWidth - offset
      paddingLeft = left + scaledPad
      paddingRight = right - scaledPad
    }
    return { left, right, paddingLeft, paddingRight, marginLeft: frameLeft, marginRight: frameLeft + frameWidth }
  }, [g])

  if (!visible || !lines || !g) return null

  return (
    <svg className="pointer-events-none absolute inset-0 z-30 overflow-visible" style={{ width: "100%", height: g.canvasScrollHeight }}>
      <line x1={lines.left} y1={0} x2={lines.left} y2="100%" stroke="#e5e7eb" strokeWidth={1} opacity={0.6} />
      <line x1={lines.right} y1={0} x2={lines.right} y2="100%" stroke="#e5e7eb" strokeWidth={1} opacity={0.6} />
      {lines.paddingLeft !== lines.left && (
        <>
          <line x1={lines.paddingLeft} y1={0} x2={lines.paddingLeft} y2="100%" stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
          <line x1={lines.paddingRight} y1={0} x2={lines.paddingRight} y2="100%" stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
        </>
      )}
      <rect x={lines.marginLeft} y={0} width={lines.left - lines.marginLeft} height="100%" fill="#f3f4f6" opacity={0.15} />
      <rect x={lines.right} y={0} width={lines.marginRight - lines.right} height="100%" fill="#f3f4f6" opacity={0.15} />
    </svg>
  )
}
