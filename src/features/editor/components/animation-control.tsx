"use client"

import { useEditor } from "@craftjs/core"
import { Zap } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export interface AnimationConfig {
  entrance: "none" | "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scaleUp" | "blur"
  hover: "none" | "lift" | "scale" | "glow" | "darken"
  duration: number
  delay: number
}

const ANIMATION_DEFAULTS: AnimationConfig = { entrance: "none", hover: "none", duration: 500, delay: 0 }

const entranceOptions = [
  { value: "none", label: "None" }, { value: "fadeIn", label: "Fade In" },
  { value: "slideUp", label: "Slide Up" }, { value: "slideDown", label: "Slide Down" },
  { value: "slideLeft", label: "Slide Left" }, { value: "slideRight", label: "Slide Right" },
  { value: "scaleUp", label: "Scale Up" }, { value: "blur", label: "Blur In" },
] as const

const hoverOptions = [
  { value: "none", label: "None" }, { value: "lift", label: "Lift (shadow + move)" },
  { value: "scale", label: "Scale Up" }, { value: "glow", label: "Glow" }, { value: "darken", label: "Darken" },
] as const

export function AnimationControl() {
  const { selectedId, animation, actions } = useEditor((state) => {
    const [nodeId] = state.events.selected
    if (!nodeId) return { selectedId: null, animation: ANIMATION_DEFAULTS }
    return { selectedId: nodeId, animation: { ...ANIMATION_DEFAULTS, ...state.nodes[nodeId]?.data.props?._animation } as AnimationConfig }
  })

  const update = <K extends keyof AnimationConfig>(key: K, value: AnimationConfig[K]) => {
    if (!selectedId) return
    actions.setProp(selectedId, (p: any) => { if (!p._animation) p._animation = { ...ANIMATION_DEFAULTS }; p._animation[key] = value })
  }

  const hasAnimation = animation.entrance !== "none" || animation.hover !== "none"

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <Zap className="h-3 w-3" style={{ color: hasAnimation ? '#d97706' : 'var(--editor-icon-secondary)' }} />
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--editor-text-secondary)' }}>Animation</p>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs font-medium" style={{ color: 'var(--editor-text-secondary)' }}>Entrance</Label>
        <select value={animation.entrance} onChange={(e) => update("entrance", e.target.value as AnimationConfig["entrance"])}
          className="h-8 px-2 text-[13px] rounded border cursor-pointer" style={{ background: 'var(--editor-input-bg)', borderColor: 'var(--editor-border)', color: 'var(--editor-text)' }}>
          {entranceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs font-medium" style={{ color: 'var(--editor-text-secondary)' }}>Hover Effect</Label>
        <select value={animation.hover} onChange={(e) => update("hover", e.target.value as AnimationConfig["hover"])}
          className="h-8 px-2 text-[13px] rounded border cursor-pointer" style={{ background: 'var(--editor-input-bg)', borderColor: 'var(--editor-border)', color: 'var(--editor-text)' }}>
          {hoverOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {hasAnimation && (
        <>
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <Label className="text-xs font-medium" style={{ color: 'var(--editor-text-secondary)' }}>Duration</Label>
              <span className="text-[11px] font-mono" style={{ color: 'var(--editor-text-secondary)' }}>{animation.duration}ms</span>
            </div>
            <Slider min={100} max={2000} step={50} value={[animation.duration]} onValueChange={([v]) => update("duration", v)} className="h-4" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <Label className="text-xs font-medium" style={{ color: 'var(--editor-text-secondary)' }}>Delay</Label>
              <span className="text-[11px] font-mono" style={{ color: 'var(--editor-text-secondary)' }}>{animation.delay}ms</span>
            </div>
            <Slider min={0} max={1000} step={50} value={[animation.delay]} onValueChange={([v]) => update("delay", v)} className="h-4" />
          </div>
        </>
      )}
    </div>
  )
}

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
  fadeIn: "indigo-fadeIn", slideUp: "indigo-slideUp", slideDown: "indigo-slideDown",
  slideLeft: "indigo-slideLeft", slideRight: "indigo-slideRight", scaleUp: "indigo-scaleUp", blur: "indigo-blur",
}

export const HOVER_STYLES: Record<string, React.CSSProperties> = {
  lift: { transform: "translateY(-4px)", boxShadow: "0 8px 25px rgba(0,0,0,0.1)" },
  scale: { transform: "scale(1.03)" },
  glow: { boxShadow: "0 0 20px rgba(59,130,246,0.3)" },
  darken: { filter: "brightness(0.92)" },
}
