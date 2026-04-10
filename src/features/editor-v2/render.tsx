import "./blocks"
import { getBlock } from "./registry"

interface SectionData {
  id?: string
  type: string
  props: Record<string, unknown>
}

export function RenderSections({ sections }: { sections: SectionData[] }) {
  return (
    <>
      {sections.map((s, i) => {
        const block = getBlock(s.type)
        if (!block) return null
        const Component = block.component
        return <Component key={s.id ?? i} {...s.props} />
      })}
    </>
  )
}
