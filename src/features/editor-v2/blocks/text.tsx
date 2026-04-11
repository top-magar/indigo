import { EditableText } from "./editable-text"

interface TextProps {
  text: string; fontSize: number; fontWeight: number; color: string
  alignment: "left" | "center" | "right"; tagName: "p" | "h1" | "h2" | "h3" | "h4" | "span"
  _sectionId?: string
}

export function Text({ text, fontSize, fontWeight, color, alignment, tagName, _sectionId }: TextProps) {
  const Tag = tagName
  const style = { fontSize, fontWeight, color, margin: 0, lineHeight: 1.6 }
  return (
    <div className="px-6 py-4" style={{ textAlign: alignment }}>
      {_sectionId ? (
        <EditableText sectionId={_sectionId} propName="text" value={text} as={tagName} style={style} />
      ) : (
        <Tag style={style}>{text}</Tag>
      )}
    </div>
  )
}
