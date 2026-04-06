"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"

interface SelectionProps {
  nodeId: string
  blockName: string
  isSelected: boolean
  isHovered: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  onDelete: (id: string) => void
  children: ReactNode
}

export function SelectionWrapper({ nodeId, blockName, isSelected, isHovered, onSelect, onHover, onDelete, children }: SelectionProps) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(nodeId) }}
      onMouseEnter={() => onHover(nodeId)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: "relative",
        outline: isSelected ? "2px solid #005bd3" : isHovered ? "1px solid rgba(0,91,211,0.3)" : "none",
        outlineOffset: -1,
        cursor: "pointer",
      }}
      data-v2-node={nodeId}
    >
      {(isSelected || isHovered) && (
        <div style={{ position: "absolute", top: -20, left: 0, zIndex: 50, display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", fontSize: 10, fontWeight: 600, backgroundColor: "#005bd3", color: "#fff", borderRadius: "4px 4px 0 0", whiteSpace: "nowrap", pointerEvents: "auto" }}>
          {blockName}
          {isSelected && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(nodeId) }} style={{ display: "flex", alignItems: "center", background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}>
              <X size={10} />
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
