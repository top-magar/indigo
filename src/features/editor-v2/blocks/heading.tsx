import { EditableText } from "./editable-text"

interface HeadingProps {
  text: string; level: "h1" | "h2" | "h3" | "h4"; alignment: "left" | "center" | "right"; _sectionId?: string
}

export function HeadingBlock({ text, level, alignment, _sectionId }: HeadingProps) {
  const textAlign = alignment
  const style = { fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)" as never, color: "var(--store-color-text, #0f172a)", textAlign, margin: 0 } as const
  if (_sectionId) return <EditableText value={text} sectionId={_sectionId} propName="text" as={level} style={style} />
  const Tag = level
  return <Tag style={style}>{text}</Tag>
}
