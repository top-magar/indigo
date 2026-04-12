"use client"
import React from "react"
import "./blocks"
import { getBlock } from "./registry"
import { buildSectionStyle } from "./build-style"
import { BlockModeProvider } from "./blocks/data-context"

interface SectionData {
  id?: string
  type: string
  props: Record<string, unknown>
  children?: Record<string, SectionData[]>
}

function SectionsInner({ sections }: { sections: SectionData[] }) {
  return (
    <>
      {sections.map((s, i) => {
        const block = getBlock(s.type)
        if (!block) return null
        const Component = block.component
        const slots = s.children ? Object.fromEntries(
          Object.entries(s.children).map(([slot, children]) => [slot, <SectionsInner key={slot} sections={children} />])
        ) : undefined
        const Tag = ((s.props._htmlTag as string) || "div") as "div"
        return (
          <Tag key={s.id ?? i} style={buildSectionStyle(s.props, "desktop")}>
            <Component {...s.props} _slots={slots} />
          </Tag>
        )
      })}
    </>
  )
}

export function RenderSections({ sections, slug = "" }: { sections: SectionData[]; slug?: string }) {
  return (
    <BlockModeProvider value={{ mode: "live", slug }}>
      <SectionsInner sections={sections} />
    </BlockModeProvider>
  )
}
