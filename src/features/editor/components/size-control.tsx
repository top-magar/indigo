"use client"

import { useEditor, ROOT_NODE } from "@craftjs/core"
import { useBreakpoint } from "../breakpoint-context"

export function SizeControl() {
  const breakpoint = useBreakpoint()

  const { selectedId, width, height, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId || nodeId === ROOT_NODE) return { selectedId: null, width: "" as number | "", height: "" as number | "" }
    const props = state.nodes[nodeId]?.data.props ?? {}
    const bp = breakpoint !== "desktop" ? props._responsive?.[breakpoint] ?? {} : {}
    return {
      selectedId: nodeId,
      width: bp._width ?? props._width ?? "" as number | "",
      height: bp._height ?? props._height ?? "" as number | "",
    }
  })

  if (!selectedId) return null

  const set = (key: "_width" | "_height", val: string) => {
    const num = val === "" ? undefined : Math.max(0, parseInt(val, 10) || 0)
    if (breakpoint !== "desktop") {
      actions.setProp(selectedId, (p: Record<string, unknown>) => {
        if (!p._responsive) p._responsive = {}
        const r = p._responsive as Record<string, Record<string, unknown>>
        if (!r[breakpoint]) r[breakpoint] = {}
        if (num === undefined) delete r[breakpoint][key]
        else r[breakpoint][key] = num
      })
    } else {
      actions.setProp(selectedId, (p: Record<string, unknown>) => {
        if (num === undefined) delete p[key]
        else p[key] = num
      })
    }
  }

  const inputStyle: React.CSSProperties = {
    height: 32, width: '100%', padding: '0 8px', fontSize: 13,
    background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
    borderRadius: 4, color: 'var(--editor-text)',
  }

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--editor-text-secondary)', marginBottom: 8 }}>Size</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <label>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--editor-text-disabled)', marginBottom: 2 }}>W</span>
          <input type="number" placeholder="auto" value={width} onChange={(e) => set("_width", e.target.value)} style={inputStyle} />
        </label>
        <label>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--editor-text-disabled)', marginBottom: 2 }}>H</span>
          <input type="number" placeholder="auto" value={height} onChange={(e) => set("_height", e.target.value)} style={inputStyle} />
        </label>
      </div>
    </div>
  )
}
