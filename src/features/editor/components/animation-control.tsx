"use client"

import { useEditor } from "@craftjs/core"
import { Zap } from "lucide-react"

export interface AnimationConfig {
  entrance: "none" | "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scaleUp" | "blur"
  hover: "none" | "lift" | "scale" | "glow" | "darken"
  duration: number // ms
  delay: number // ms
}

const ANIMATION_DEFAULTS: AnimationConfig = {
  entrance: "none",
  hover: "none",
  duration: 500,
  delay: 0,
}

const entranceOptions = [
  { value: "none", label: "None" },
  { value: "fadeIn", label: "Fade In" },
  { value: "slideUp", label: "Slide Up" },
  { value: "slideDown", label: "Slide Down" },
  { value: "slideLeft", label: "Slide Left" },
  { value: "slideRight", label: "Slide Right" },
  { value: "scaleUp", label: "Scale Up" },
  { value: "blur", label: "Blur In" },
] as const

const hoverOptions = [
  { value: "none", label: "None" },
  { value: "lift", label: "Lift (shadow + move)" },
  { value: "scale", label: "Scale Up" },
  { value: "glow", label: "Glow" },
  { value: "darken", label: "Darken" },
] as const

export function AnimationControl() {
  const { selectedId, animation, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId) return { selectedId: null, animation: ANIMATION_DEFAULTS }
    return {
      selectedId: nodeId,
      animation: { ...ANIMATION_DEFAULTS, ...state.nodes[nodeId]?.data.props?._animation } as AnimationConfig,
    }
  })

  const update = <K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) => {
    if (!selectedId) return
    actions.setProp(selectedId, (p: any) => {
      if (!p._animation) p._animation = { ...ANIMATION_DEFAULTS }
      p._animation[key] = value
    })
  }

  const hasAnimation = animation.entrance !== "none" || animation.hover !== "none"

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <Zap className="h-3 w-3" style={{ color: hasAnimation ? '#d97706' : 'var(--editor-icon-secondary)' }} />
        <p style={{ fontSize: 11, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--editor-text-secondary)' }}>Animation</p>
      </div>

      {/* Entrance */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)' }}>Entrance</span>
        <select
          value={animation.entrance}
          onChange={(e) => update("entrance", e.target.value as AnimationConfig["entrance"])}
          style={{ height: 32, padding: '0 8px', fontSize: 13, background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)', borderRadius: 4, color: 'var(--editor-text)' }}
        >
          {entranceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      {/* Hover */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)' }}>Hover Effect</span>
        <select
          value={animation.hover}
          onChange={(e) => update("hover", e.target.value as AnimationConfig["hover"])}
          style={{ height: 32, padding: '0 8px', fontSize: 13, background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)', borderRadius: 4, color: 'var(--editor-text)' }}
        >
          {hoverOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>

      {/* Duration + Delay — only show if animation is set */}
      {hasAnimation && (
        <>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)' }}>Duration</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--editor-text-secondary)' }}>{animation.duration}ms</span>
            </div>
            <input type="range" min={100} max={2000} step={50} value={animation.duration} onChange={(e) => update("duration", +e.target.value)} style={{ width: '100%', accentColor: 'var(--editor-accent)' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)' }}>Delay</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--editor-text-secondary)' }}>{animation.delay}ms</span>
            </div>
            <input type="range" min={0} max={1000} step={50} value={animation.delay} onChange={(e) => update("delay", +e.target.value)} style={{ width: '100%', accentColor: 'var(--editor-accent)' }} />
          </label>
        </>
      )}
    </div>
  )
}

/** CSS for entrance animations — inject once via <style> */
export const ANIMATION_STYLES = `
@keyframes indigo-fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes indigo-slideUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
@keyframes indigo-slideDown { from { opacity: 0; transform: translateY(-30px) } to { opacity: 1; transform: translateY(0) } }
@keyframes indigo-slideLeft { from { opacity: 0; transform: translateX(30px) } to { opacity: 1; transform: translateX(0) } }
@keyframes indigo-slideRight { from { opacity: 0; transform: translateX(-30px) } to { opacity: 1; transform: translateX(0) } }
@keyframes indigo-scaleUp { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
@keyframes indigo-blur { from { opacity: 0; filter: blur(10px) } to { opacity: 1; filter: blur(0) } }
`

export const ENTRANCE_KEYFRAMES: Record<string, string> = {
  fadeIn: "indigo-fadeIn",
  slideUp: "indigo-slideUp",
  slideDown: "indigo-slideDown",
  slideLeft: "indigo-slideLeft",
  slideRight: "indigo-slideRight",
  scaleUp: "indigo-scaleUp",
  blur: "indigo-blur",
}

export const HOVER_STYLES: Record<string, React.CSSProperties> = {
  lift: { transform: "translateY(-4px)", boxShadow: "0 8px 25px rgba(0,0,0,0.1)" },
  scale: { transform: "scale(1.03)" },
  glow: { boxShadow: "0 0 20px rgba(59,130,246,0.3)" },
  darken: { filter: "brightness(0.92)" },
}
