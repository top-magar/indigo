"use client"
import { useCallback, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Italic, Strikethrough, Link2 } from "lucide-react"
import { useEditorV3Store } from "../../stores/store"
import type { InstanceId } from "../../types"

/** Minimal floating toolbar for inline rich text editing */
function MiniToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null
  return (
    <div style={{
      display: "flex", gap: 1, background: "#1e293b", borderRadius: 5, padding: "2px 3px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)", marginBottom: 4,
    }}>
      {[
        { icon: Bold, cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
        { icon: Italic, cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
        { icon: Strikethrough, cmd: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike") },
      ].map(({ icon: Icon, cmd, active }, i) => (
        <button key={i} onClick={cmd} style={{
          width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
          background: active ? "#334155" : "transparent", border: "none", borderRadius: 3,
          color: active ? "#fff" : "#94a3b8", cursor: "pointer",
        }}>
          <Icon size={13} />
        </button>
      ))}
    </div>
  )
}

export function InlineRichText({ instanceId, initialContent, onSave }: {
  instanceId: InstanceId
  initialContent: string
  onSave: (html: string) => void
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, bulletList: false, orderedList: false, horizontalRule: false })],
    content: initialContent,
    editorProps: {
      attributes: { style: "outline: none; min-height: 1em;" },
    },
  })

  // Save on blur
  const handleBlur = useCallback(() => {
    if (!editor) return
    const html = editor.getHTML()
    // Strip wrapper <p> tags for inline text
    const clean = html.replace(/^<p>/, "").replace(/<\/p>$/, "")
    onSave(clean)
  }, [editor, onSave])

  useEffect(() => {
    if (!editor) return
    editor.on("blur", handleBlur)
    return () => { editor.off("blur", handleBlur) }
  }, [editor, handleBlur])

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <MiniToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
