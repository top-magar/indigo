"use client"

import { useEffect, useRef } from "react"
import { useEditor } from "@craftjs/core"
import type { ParentMessage, NodeInfo, RectData } from "../lib/bridge-types"

/** Runs inside the iframe. Receives commands from parent, sends state updates back. */
export function IframeBridgeReceiver() {
  const { actions, query } = useEditor()
  const actionsRef = useRef(actions)
  const queryRef = useRef(query)
  actionsRef.current = actions
  queryRef.current = query

  // Listen for parent commands
  useEffect(() => {
    const handler = (e: MessageEvent<ParentMessage>) => {
      const msg = e.data
      if (!msg?.type) return
      const a = actionsRef.current
      const q = queryRef.current

      switch (msg.type) {
        case "select": a.selectNode(msg.id); break
        case "deselect": a.clearEvents(); break
        case "delete": a.delete(msg.id); break
        case "move": a.move(msg.id, msg.targetParent, msg.index); break
        case "duplicate": {
          const n = q.node(msg.id).get()
          const parent = n.data.parent as string
          const siblings = q.node(parent).get().data.nodes as string[]
          const idx = siblings.indexOf(msg.id)
          const tree = q.node(msg.id).toNodeTree()
          a.addNodeTree(tree, parent, idx + 1)
          break
        }
        case "setProp": a.setProp(msg.id, (p: Record<string, unknown>) => { p[msg.key] = msg.value }); break
        case "setHidden": a.setHidden(msg.id, msg.hidden); break
        case "deserialize": a.deserialize(msg.json); break
        case "serialize": window.parent.postMessage({ type: "serialize:result", json: q.serialize() }, "*"); break
        case "undo": a.history.undo(); break
        case "redo": a.history.redo(); break
        case "getNodeRect": {
          const rects = collectRects()
          window.parent.postMessage({ type: "node:rect", rects }, "*")
          break
        }
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Send selection changes to parent
  const { selectedId, hoveredId, canUndo, canRedo } = useEditor((state) => {
    const [sel] = state.events.selected
    const [hov] = state.events.hovered
    return {
      selectedId: (sel || null) as string | null,
      hoveredId: (hov || null) as string | null,
      canUndo: state.options?.enabled ? query.history.canUndo() : false,
      canRedo: state.options?.enabled ? query.history.canRedo() : false,
    }
  })

  const prevSelRef = useRef<string | null>(null)
  useEffect(() => {
    if (selectedId === prevSelRef.current) return
    prevSelRef.current = selectedId
    const node = selectedId ? buildNodeInfo(selectedId, query) : null
    window.parent.postMessage({ type: "node:selected", id: selectedId, node }, "*")
  }, [selectedId, query])

  useEffect(() => {
    if (!hoveredId) { window.parent.postMessage({ type: "node:hovered", id: null, rect: null }, "*"); return }
    const el = document.querySelector(`[data-craft-node-id="${hoveredId}"]`)
    if (!el) return
    const r = el.getBoundingClientRect()
    window.parent.postMessage({ type: "node:hovered", id: hoveredId, rect: { id: hoveredId, top: r.top, left: r.left, width: r.width, height: r.height } }, "*")
  }, [hoveredId])

  useEffect(() => {
    window.parent.postMessage({ type: "state:canUndo", canUndo, canRedo }, "*")
  }, [canUndo, canRedo])

  // Send ready signal
  useEffect(() => {
    window.parent.postMessage({ type: "ready" }, "*")
  }, [])

  return null
}

function buildNodeInfo(id: string, query: ReturnType<typeof useEditor>["query"]): NodeInfo | null {
  try {
    const node = query.node(id).get()
    return {
      id,
      name: (node.data.displayName || node.data.name || "") as string,
      parentId: (node.data.parent || null) as string | null,
      props: (node.data.props ?? {}) as Record<string, unknown>,
      isCanvas: !!node.data.isCanvas,
      children: (node.data.nodes || []) as string[],
      hidden: !!node.data.hidden,
      locked: !!node.data.custom?.locked,
    }
  } catch { return null }
}

function collectRects(): RectData[] {
  const rects: RectData[] = []
  document.querySelectorAll("[data-craft-node-id]").forEach((el) => {
    const id = (el as HTMLElement).dataset.craftNodeId
    if (!id || id === "ROOT") return
    const r = el.getBoundingClientRect()
    rects.push({ id, top: r.top, left: r.left, width: r.width, height: r.height })
  })
  return rects
}
