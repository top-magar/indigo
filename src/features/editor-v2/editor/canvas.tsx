"use client"

import { createElement, useState, type ReactNode } from "react"
import type { Document } from "../core/document"
import { getNode } from "../core/document"
import { getBlockOrNull } from "../core/registry"
import { SelectionWrapper } from "../wrappers/selection"
import { LayoutWrapper } from "../wrappers/layout"
import { EffectsWrapper } from "../wrappers/effects"
import { VisibilityWrapper } from "../wrappers/visibility"
import { AnimationWrapper } from "../wrappers/animation"

interface CanvasProps {
  document: Document
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
  onDelete: (id: string) => void
  onMove: (nodeId: string, targetParentId: string, index: number) => void
}

export function EditorCanvas({ document: doc, selectedId, hoveredId, onSelect, onHover, onDelete, onMove }: CanvasProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ parentId: string; index: number } | null>(null)

  function handleDragStart(nodeId: string) { setDraggedId(nodeId) }
  function handleDragEnd() { setDraggedId(null); setDropTarget(null) }

  function handleDrop(parentId: string, index: number) {
    if (draggedId) onMove(draggedId, parentId, index)
    setDraggedId(null)
    setDropTarget(null)
  }

  function renderDropZone(parentId: string, index: number) {
    const isActive = dropTarget?.parentId === parentId && dropTarget?.index === index
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setDropTarget({ parentId, index }) }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(e) => { e.preventDefault(); handleDrop(parentId, index) }}
        style={{ height: isActive ? 4 : 2, margin: "0 8px", transition: "all 150ms", backgroundColor: isActive ? "#005bd3" : "transparent", borderRadius: 2 }}
      />
    )
  }

  function renderChildren(parentId: string, childIds: readonly string[]): ReactNode {
    return (
      <>
        {childIds.map((childId, i) => (
          <div key={childId}>
            {draggedId && draggedId !== childId && renderDropZone(parentId, i)}
            {renderNode(childId)}
          </div>
        ))}
        {draggedId && renderDropZone(parentId, childIds.length)}
      </>
    )
  }

  function renderNode(nodeId: string): ReactNode {
    const node = getNode(doc, nodeId)

    if (node.type === "Root") {
      return (
        <div onClick={() => onSelect(null)} style={{ minHeight: "100vh" }}>
          {renderChildren(nodeId, node.children)}
        </div>
      )
    }

    const block = getBlockOrNull(node.type)
    if (!block) return <div key={nodeId} style={{ padding: 16, color: "#ef4444", fontSize: 12 }}>Unknown: {node.type}</div>

    const props = { ...block.defaults, ...node.props }
    const childContent = node.children.length > 0 ? renderChildren(nodeId, node.children) : undefined
    const blockElement = createElement(block.schema.render as React.ComponentType<Record<string, unknown>>, { ...props, key: nodeId, children: childContent })
    const p = node.props as Record<string, unknown>
    const isDragged = draggedId === nodeId

    return (
      <div
        key={nodeId}
        draggable
        onDragStart={(e) => { e.stopPropagation(); handleDragStart(nodeId) }}
        onDragEnd={handleDragEnd}
        style={{ opacity: isDragged ? 0.4 : 1, transition: "opacity 150ms" }}
      >
        <VisibilityWrapper hidden={p._hidden as boolean} editorMode>
          <SelectionWrapper nodeId={nodeId} blockName={block.schema.name} isSelected={selectedId === nodeId} isHovered={hoveredId === nodeId} onSelect={onSelect} onHover={onHover} onDelete={onDelete}>
            <LayoutWrapper widthMode={p._widthMode as "fixed" | "fill" | "hug"} width={p._width as number} sticky={p._sticky as "none" | "top" | "bottom"}>
              <EffectsWrapper shadow={p._shadow as string} opacity={p._opacity as number} blur={p._blur as number} borderRadius={p._borderRadius as number}>
                <AnimationWrapper entrance={p._entrance as "none" | "fadeIn" | "slideUp"} trigger={p._trigger as "scroll" | "load"}>
                  {blockElement}
                </AnimationWrapper>
              </EffectsWrapper>
            </LayoutWrapper>
          </SelectionWrapper>
        </VisibilityWrapper>
      </div>
    )
  }

  return renderNode(doc.rootId)
}
