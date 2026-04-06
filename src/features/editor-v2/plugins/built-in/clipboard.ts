import type { EditorPlugin } from "../types"
import type { DocumentNode } from "../../core/document"
import { getNode } from "../../core/document"

let clipboard: { type: string; props: Record<string, unknown> } | null = null

export const clipboardPlugin: EditorPlugin = {
  name: "clipboard",
  version: "1.0.0",
  init(api) {
    api.registerCommand({
      id: "clipboard:copy",
      label: "Copy",
      shortcut: "⌘C",
      execute: () => {
        const node = api.getSelectedNode()
        if (node && node.type !== "Root") clipboard = { type: node.type, props: { ...node.props } }
      },
    })

    api.registerCommand({
      id: "clipboard:paste",
      label: "Paste",
      shortcut: "⌘V",
      execute: () => {
        if (!clipboard) return
        const doc = api.getDocument()
        const selected = api.getSelectedNode()
        const parentId = selected?.parent ?? doc.rootId
        api.applyOperation({ type: "add_node", nodeType: clipboard.type, props: { ...clipboard.props }, parentId })
      },
    })

    api.registerCommand({
      id: "clipboard:duplicate",
      label: "Duplicate",
      shortcut: "⌘D",
      execute: () => {
        const node = api.getSelectedNode()
        if (!node || node.type === "Root" || !node.parent) return
        api.applyOperation({ type: "add_node", nodeType: node.type, props: { ...node.props }, parentId: node.parent })
      },
    })
  },
}
