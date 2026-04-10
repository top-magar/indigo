import { sanitizeHtml } from "../../editor/lib/sanitize-html"

interface RichTextProps {
  content: string; maxWidth: number; alignment: "left" | "center" | "right"; fontSize: number
}

export function RichText({ content, maxWidth, alignment, fontSize }: RichTextProps) {
  return (
    <div style={{ textAlign: alignment }}>
      <div
        style={{ maxWidth, margin: alignment === "center" ? "0 auto" : undefined, fontSize, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    </div>
  )
}
