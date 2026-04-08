/** Message types for parent ↔ iframe communication */

// ── Parent → Iframe ──

export type ParentMessage =
  | { type: "select"; id: string }
  | { type: "deselect" }
  | { type: "delete"; id: string }
  | { type: "move"; id: string; targetParent: string; index: number }
  | { type: "duplicate"; id: string }
  | { type: "setProp"; id: string; key: string; value: unknown }
  | { type: "setHidden"; id: string; hidden: boolean }
  | { type: "deserialize"; json: string }
  | { type: "serialize" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "addNodeTree"; tree: string; parentId: string; index?: number }
  | { type: "getNodeRect"; id: string }

// ── Iframe → Parent ──

export interface NodeInfo {
  id: string
  name: string
  parentId: string | null
  props: Record<string, unknown>
  isCanvas: boolean
  children: string[]
  hidden: boolean
  locked: boolean
}

export interface RectData {
  id: string
  top: number; left: number; width: number; height: number
}

export type IframeMessage =
  | { type: "ready" }
  | { type: "node:selected"; id: string | null; node: NodeInfo | null }
  | { type: "node:hovered"; id: string | null; rect: RectData | null }
  | { type: "node:rect"; rects: RectData[] }
  | { type: "tree:changed"; nodes: Record<string, NodeInfo> }
  | { type: "serialize:result"; json: string }
  | { type: "state:canUndo"; canUndo: boolean; canRedo: boolean }
  | { type: "scroll"; scrollTop: number; scrollLeft: number; scrollHeight: number }

export const BRIDGE_CHANNEL = "indigo-editor-bridge"
