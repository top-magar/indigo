"use client"

import { useCallback, useEffect, useRef } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import {
  $getRoot,
  type EditorState,
  type LexicalEditor,
} from "lexical"
import { SectionNode, $createSectionNode, $isSectionNode } from "./nodes"
import {
  SECTION_VARIANTS,
  SECTION_LABELS,
  type SectionConfig,
  type SectionType,
} from "@/features/store/section-registry"

// ── Serializer: Lexical → SectionConfig[] ──

export function serializeToSections(editor: LexicalEditor): SectionConfig[] {
  const sections: SectionConfig[] = []
  editor.getEditorState().read(() => {
    const root = $getRoot()
    let order = 0
    for (const child of root.getChildren()) {
      if ($isSectionNode(child)) {
        sections.push({
          id: child.getSectionId(),
          type: child.getSectionType(),
          variant: child.getVariant(),
          content: child.getContent(),
          visible: child.getVisible(),
          order: order++,
        })
      }
    }
  })
  return sections
}

// ── Deserializer: SectionConfig[] → Lexical nodes ──

function LoadSectionsPlugin({ sections }: { sections: SectionConfig[] }) {
  const [editor] = useLexicalComposerContext()
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || sections.length === 0) return
    loaded.current = true

    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const sorted = [...sections].sort((a, b) => a.order - b.order)
      for (const s of sorted) {
        root.append($createSectionNode(s))
      }
    })
  }, [editor, sections])

  return null
}

// ── Add Section Toolbar ──

const ADDABLE_TYPES: SectionType[] = ["announcement", "hero", "product-grid", "categories", "banner", "testimonials"]

function AddSectionToolbar() {
  const [editor] = useLexicalComposerContext()

  const addSection = useCallback((type: SectionType) => {
    editor.update(() => {
      const variants = SECTION_VARIANTS[type]
      const node = $createSectionNode({
        id: `s-${Date.now()}`,
        type,
        variant: variants[0].id,
        content: {},
        visible: true,
        order: 0,
      })
      const root = $getRoot()
      root.append(node)
    })
  }, [editor])

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
      borderTop: "1px solid #e5e7eb", background: "#fafafa",
    }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginRight: 4 }}>Add:</span>
      {ADDABLE_TYPES.map(type => (
        <button
          key={type}
          onClick={() => addSection(type)}
          style={{
            fontSize: 11, padding: "4px 10px", border: "1px solid #e5e7eb",
            borderRadius: 6, background: "#fff", cursor: "pointer", fontWeight: 500,
            color: "#374151",
          }}
        >
          + {SECTION_LABELS[type]}
        </button>
      ))}
    </div>
  )
}

// ── Main Editor Component ──

function onError(error: Error) {
  console.error("[LexicalBuilder]", error)
}

export function LexicalSectionEditor({
  initialSections,
  onChange,
}: {
  initialSections: SectionConfig[]
  onChange: (sections: SectionConfig[]) => void
}) {
  const initialConfig = {
    namespace: "SectionBuilder",
    theme: {},
    nodes: [SectionNode],
    onError,
  }

  const handleChange = useCallback(
    (_editorState: EditorState, editor: LexicalEditor) => {
      onChange(serializeToSections(editor))
    },
    [onChange],
  )

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div style={{
        border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden",
        background: "#fff", fontFamily: "'Inter', sans-serif",
      }}>
        {/* Editor area — sections render inline via DecoratorNodes */}
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{ outline: "none", minHeight: 200 }}
              aria-label="Store section editor"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <LoadSectionsPlugin sections={initialSections} />
        <AddSectionToolbar />
      </div>
    </LexicalComposer>
  )
}
