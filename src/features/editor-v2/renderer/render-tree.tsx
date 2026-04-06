/**
 * Storefront Renderer — Renders v2 document tree without editor chrome.
 * Used on the live storefront. No selection, no wrappers, no Zustand.
 * Can be a Server Component (pure function of props → JSX).
 */

import { createElement, type ReactNode } from "react"
import type { Document } from "../core/document"
import { getNode } from "../core/document"
import { getBlockOrNull } from "../core/registry"
import { themeToCssVars, type ThemeTokens } from "../core/tokens"
import { fromJSON, type SerializedDocument } from "../core/serializer"
import { registerBuiltInBlocks } from "../blocks"
import { AnimationWrapper } from "../wrappers/animation"
import { VisibilityWrapper } from "../wrappers/visibility"

// Ensure blocks are registered for the renderer
let registered = false
function ensureBlocks() { if (!registered) { registerBuiltInBlocks(); registered = true } }

interface RenderTreeProps {
  /** Serialized v2 document JSON */
  data: SerializedDocument
  /** Theme tokens */
  theme?: Partial<ThemeTokens>
}

export function RenderTree({ data, theme = {} }: RenderTreeProps) {
  ensureBlocks()
  const doc = fromJSON(data)
  const themeVars = themeToCssVars(theme)

  return (
    <div style={{ backgroundColor: themeVars["--v2-bg"], color: themeVars["--v2-text"], fontFamily: themeVars["--v2-font-body"], ...themeVars as React.CSSProperties }}>
      {renderChildren(doc, doc.rootId)}
    </div>
  )
}

function renderChildren(doc: Document, parentId: string): ReactNode {
  const parent = getNode(doc, parentId)
  return parent.children.map((childId) => renderNode(doc, childId))
}

function renderNode(doc: Document, nodeId: string): ReactNode {
  const node = getNode(doc, nodeId)
  const block = getBlockOrNull(node.type)
  if (!block) return null

  const props = { ...block.defaults, ...node.props }
  const p = node.props as Record<string, unknown>

  const children = node.children.length > 0 ? renderChildren(doc, nodeId) : undefined
  const blockElement = createElement(block.schema.render as React.ComponentType<Record<string, unknown>>, { ...props, key: nodeId, children })

  // Apply storefront-safe wrappers (animation + visibility, no selection/effects)
  return (
    <VisibilityWrapper key={nodeId} hidden={p._hidden as boolean}>
      <AnimationWrapper entrance={p._entrance as "none" | "fadeIn" | "slideUp"} trigger={p._trigger as "scroll" | "load"}>
        {blockElement}
      </AnimationWrapper>
    </VisibilityWrapper>
  )
}
