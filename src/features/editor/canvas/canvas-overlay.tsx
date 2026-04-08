"use client"

import { useOverlayState } from "../stores/overlay-store"

export function CanvasOverlay() {
  const { guides, spacing, dropZones } = useOverlayState()

  if (guides.length === 0 && spacing.length === 0 && dropZones.length === 0) return null

  return (
    <svg className="pointer-events-none absolute inset-0 z-40 overflow-visible" style={{ width: "100%", height: "100%" }}>
      {/* Snap guide lines */}
      {guides.map((g, i) =>
        g.axis === "x" ? (
          <line key={`g${i}`} x1={g.position} y1={0} x2={g.position} y2="100%" stroke="#2563eb" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
        ) : (
          <line key={`g${i}`} x1={0} y1={g.position} x2="100%" y2={g.position} stroke="#2563eb" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
        )
      )}

      {/* Spacing measurement lines */}
      {spacing.map((s, i) => {
        const isVertical = s.x1 === s.x2
        const midX = (s.x1 + s.x2) / 2
        const midY = (s.y1 + s.y2) / 2
        return (
          <g key={`s${i}`}>
            <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#f43f5e" strokeWidth={1} />
            {/* End caps */}
            {isVertical ? (
              <>
                <line x1={s.x1 - 4} y1={s.y1} x2={s.x1 + 4} y2={s.y1} stroke="#f43f5e" strokeWidth={1} />
                <line x1={s.x2 - 4} y1={s.y2} x2={s.x2 + 4} y2={s.y2} stroke="#f43f5e" strokeWidth={1} />
              </>
            ) : (
              <>
                <line x1={s.x1} y1={s.y1 - 4} x2={s.x1} y2={s.y1 + 4} stroke="#f43f5e" strokeWidth={1} />
                <line x1={s.x2} y1={s.y2 - 4} x2={s.x2} y2={s.y2 + 4} stroke="#f43f5e" strokeWidth={1} />
              </>
            )}
            {/* Label */}
            <rect x={midX - 14} y={midY - 8} width={28} height={16} rx={4} fill="#f43f5e" />
            <text x={midX} y={midY + 4} textAnchor="middle" fill="white" fontSize={10} fontWeight={600} fontFamily="system-ui">{s.label}</text>
          </g>
        )
      })}

      {/* Drop zone indicators */}
      {dropZones.map((d, i) => (
        <g key={`d${i}`}>
          <line x1={d.left} y1={d.y} x2={d.left + d.width} y2={d.y} stroke="#2563eb" strokeWidth={2} />
          <circle cx={d.left + d.width / 2} cy={d.y} r={4} fill="#2563eb" />
        </g>
      ))}
    </svg>
  )
}
