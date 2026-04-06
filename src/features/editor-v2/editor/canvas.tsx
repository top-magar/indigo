"use client"

/**
 * Editor Canvas — Renders the document tree with composable wrappers.
 * Each node: Visibility → Selection → Layout → Effects → Animation → BlockRender
 */

import { createElement, type ReactNode } from "react"
import type { Document, DocumentNode } from "../core/document"
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
  onDrop?: (nodeId: string, targetParentId: string, index: number) => void
}

export function EditorCanvas({ document: doc, selectedId, hoveredId, onSelect, onHover, onDelete }: CanvasProps) {
  function renderNode(nodeId: string): ReactNode {
    const node = getNode(doc, nodeId)

    // Root node — just render children
    if (node.type === "Root") {
      return (
        <div onClick={() => onSelect(null)} style={{ minHeight: "100vh" }}>
          {node.children.map((childId) => renderNode(childId))}
        </div>
      )
    }

    const block = getBlockOrNull(node.type)
    if (!block) return <div key={nodeId} style={{ padding: 16, color: "#ef4444", fontSize: 12 }}>Unknown block: {node.type}</div>

    const props = { ...block.defaults, ...node.props }

    // Render children for container blocks
    const childContent = node.children.length > 0
      ? node.children.map((childId) => renderNode(childId))
      : undefined

    // Block render component
    const blockElement = createElement(
      block.schema.render as React.ComponentType<Record<string, unknown>>,
      { ...props, key: nodeId, children: childContent },
    )

    // Wrapper pipeline: Visibility → Selection → Layout → Effects → Animation → Block
    const p = node.props as Record<string, unknown>

    return (
      <VisibilityWrapper key={nodeId} hidden={p._hidden as boolean} editorMode>
        <SelectionWrapper
          nodeId={nodeId}
          blockName={block.schema.name}
          isSelected={selectedId === nodeId}
          isHovered={hoveredId === nodeId}
          onSelect={onSelect}
          onHover={onHover}
          onDelete={onDelete}
        >
          <LayoutWrapper widthMode={p._widthMode as "fixed" | "fill" | "hug"} width={p._width as number} sticky={p._sticky as "none" | "top" | "bottom"}>
            <EffectsWrapper shadow={p._shadow as string} opacity={p._opacity as number} blur={p._blur as number} borderRadius={p._borderRadius as number}>
              <AnimationWrapper entrance={p._entrance as "none" | "fadeIn" | "slideUp"} trigger={p._trigger as "scroll" | "load"}>
                {blockElement}
              </AnimationWrapper>
            </EffectsWrapper>
          </LayoutWrapper>
        </SelectionWrapper>
      </VisibilityWrapper>
    )
  }

  return renderNode(doc.rootId)
}
