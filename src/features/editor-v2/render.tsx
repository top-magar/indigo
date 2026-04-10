import "./blocks"
import { getBlock } from "./registry"

interface SectionData {
  id?: string
  type: string
  props: Record<string, unknown>
}

const SHADOW_MAP: Record<string, string> = {
  sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.07)",
  lg: "0 10px 15px rgba(0,0,0,0.1)", xl: "0 20px 25px rgba(0,0,0,0.1)",
}

function buildStyle(p: Record<string, unknown>): React.CSSProperties {
  const g = (k: string) => p[`_${k}`]
  const bgImg = g("backgroundImage") as string
  const bgOv = (g("backgroundOverlay") as number) ?? 0
  const shadow = g("shadow") as string
  return {
    paddingTop: (g("paddingTop") as number) || undefined,
    paddingBottom: (g("paddingBottom") as number) || undefined,
    paddingLeft: (g("paddingLeft") as number) || undefined,
    paddingRight: (g("paddingRight") as number) || undefined,
    maxWidth: (g("maxWidth") as number) || undefined,
    marginInline: (g("maxWidth") as number) ? "auto" : undefined,
    backgroundColor: (g("backgroundColor") as string) || undefined,
    backgroundImage: bgImg ? `${bgOv ? `linear-gradient(rgba(0,0,0,${bgOv / 100}),rgba(0,0,0,${bgOv / 100})),` : ""}url(${bgImg})` : undefined,
    backgroundSize: bgImg ? ((g("backgroundSize") as string) || "cover") : undefined,
    backgroundPosition: bgImg ? "center" : undefined,
    color: (g("textColor") as string) || undefined,
    borderRadius: (g("borderRadius") as number) || undefined,
    opacity: (g("opacity") as number) != null ? (g("opacity") as number) / 100 : undefined,
    boxShadow: shadow && shadow !== "none" ? SHADOW_MAP[shadow] : undefined,
  }
}

export function RenderSections({ sections }: { sections: SectionData[] }) {
  return (
    <>
      {sections.map((s, i) => {
        const block = getBlock(s.type)
        if (!block) return null
        const Component = block.component
        return (
          <div key={s.id ?? i} style={buildStyle(s.props)}>
            <Component {...s.props} />
          </div>
        )
      })}
    </>
  )
}
