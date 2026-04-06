"use client"

import { useEditorStore } from "./store"
import { getNode } from "../core/document"
import { getBlockOrNull } from "../core/registry"
import { ChevronRight, GripVertical, Eye, EyeOff } from "lucide-react"

export function LayersPanel() {
  const doc = useEditorStore((s) => s.document)
  const selectedId = useEditorStore((s) => s.selectedId)
  const select = useEditorStore((s) => s.select)
  const apply = useEditorStore((s) => s.apply)
  const root = getNode(doc, doc.rootId)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[12px] font-semibold">Layers</span>
      </div>
      <div className="py-1">
        {root.children.map((childId, i) => (
          <LayerRow key={childId} nodeId={childId} depth={0} index={i} selectedId={selectedId} onSelect={select} doc={doc} apply={apply} />
        ))}
        {root.children.length === 0 && <p className="px-3 py-4 text-[11px] text-muted-foreground text-center">No blocks yet</p>}
      </div>
    </div>
  )
}

interface LayerRowProps {
  nodeId: string
  depth: number
  index: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  doc: ReturnType<typeof useEditorStore.getState>["document"]
  apply: ReturnType<typeof useEditorStore.getState>["apply"]
}

function LayerRow({ nodeId, depth, selectedId, onSelect, doc, apply }: LayerRowProps) {
  const node = getNode(doc, nodeId)
  const block = getBlockOrNull(node.type)
  const name = block?.schema.name ?? node.type
  const isSelected = selectedId === nodeId
  const isHidden = (node.props as Record<string, unknown>)._hidden as boolean

  return (
    <>
      <div
        onClick={() => onSelect(nodeId)}
        onContextMenu={(e) => { e.preventDefault(); onSelect(nodeId) }}
        className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent/50 transition-colors group"
        style={{ paddingLeft: 8 + depth * 16, backgroundColor: isSelected ? "rgba(0,91,211,0.08)" : undefined, borderLeft: isSelected ? "2px solid var(--v2-editor-accent, #005bd3)" : "2px solid transparent" }}
      >
        <GripVertical size={10} className="text-muted-foreground/40 shrink-0" />
        {node.children.length > 0 && <ChevronRight size={10} className="text-muted-foreground shrink-0" />}
        <span className="text-[11px] font-medium flex-1 truncate">{name}</span>
        <button
          onClick={(e) => { e.stopPropagation(); apply({ type: "update_props", nodeId, props: { _hidden: !isHidden } }) }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          title={isHidden ? "Show" : "Hide"}
        >
          {isHidden ? <EyeOff size={11} className="text-muted-foreground" /> : <Eye size={11} className="text-muted-foreground" />}
        </button>
      </div>
      {node.children.map((childId, i) => (
        <LayerRow key={childId} nodeId={childId} depth={depth + 1} index={i} selectedId={selectedId} onSelect={onSelect} doc={doc} apply={apply} />
      ))}
    </>
  )
}
