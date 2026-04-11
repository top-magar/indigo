import { EditableText } from "./editable-text"

interface ParagraphProps {
  text: string; alignment: "left" | "center" | "right"; _sectionId?: string
}

export function ParagraphBlock({ text, alignment, _sectionId }: ParagraphProps) {
  const textAlign = alignment
  const style = { color: "var(--store-color-muted)", textAlign, margin: 0 } as const
  if (_sectionId) return <EditableText value={text} sectionId={_sectionId} propName="text" as="p" style={style} />
  return <p style={style}>{text}</p>
}
