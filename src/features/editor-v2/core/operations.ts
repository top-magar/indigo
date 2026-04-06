/**
 * Operations — Serializable atomic mutations on the document tree.
 * Every mutation is an operation. Operations enable:
 * - Undo/redo (reverse the operation)
 * - Future CRDT collaboration (send operations to peers)
 * - AI integration (AI produces operations, not raw tree mutations)
 */

import type { Document, DocumentNode } from "./document"
import { getNode, generateId, updateNode } from "./document"

// ─── Operation Types ─────────────────────────────────────────

export interface AddNodeOp {
  readonly type: "add_node"
  readonly nodeType: string
  readonly props: Record<string, unknown>
  readonly parentId: string
  readonly index?: number
  /** Filled after apply — the ID of the created node */
  nodeId?: string
}

export interface DeleteNodeOp {
  readonly type: "delete_node"
  readonly nodeId: string
}

export interface MoveNodeOp {
  readonly type: "move_node"
  readonly nodeId: string
  readonly newParentId: string
  readonly index?: number
}

export interface UpdatePropsOp {
  readonly type: "update_props"
  readonly nodeId: string
  readonly props: Record<string, unknown>
}

export interface ReorderChildrenOp {
  readonly type: "reorder_children"
  readonly parentId: string
  readonly childIds: readonly string[]
}

export type Operation = AddNodeOp | DeleteNodeOp | MoveNodeOp | UpdatePropsOp | ReorderChildrenOp

// ─── Apply Operations ────────────────────────────────────────

/** Apply an operation to a document, returning the new document */
export function applyOperation(doc: Document, op: Operation): Document {
  switch (op.type) {
    case "add_node":
      return applyAddNode(doc, op)
    case "delete_node":
      return applyDeleteNode(doc, op)
    case "move_node":
      return applyMoveNode(doc, op)
    case "update_props":
      return applyUpdateProps(doc, op)
    case "reorder_children":
      return applyReorderChildren(doc, op)
  }
}

function applyAddNode(doc: Document, op: AddNodeOp): Document {
  const id = op.nodeId ?? generateId()
  ;(op as { nodeId: string }).nodeId = id

  const parent = getNode(doc, op.parentId)
  const children = [...parent.children]
  const index = op.index ?? children.length
  children.splice(index, 0, id)

  const newNode: DocumentNode = { id, type: op.nodeType, props: op.props, children: [], parent: op.parentId }

  return {
    ...doc,
    nodes: {
      ...doc.nodes,
      [id]: newNode,
      [op.parentId]: { ...parent, children },
    },
  }
}

function applyDeleteNode(doc: Document, op: DeleteNodeOp): Document {
  const node = getNode(doc, op.nodeId)
  if (!node.parent) throw new Error("Cannot delete root node")

  const parent = getNode(doc, node.parent)
  const nodes = { ...doc.nodes }

  // Remove node and all descendants
  const toRemove = [op.nodeId]
  while (toRemove.length > 0) {
    const id = toRemove.pop()!
    const n = nodes[id]
    if (n) {
      toRemove.push(...n.children)
      delete nodes[id]
    }
  }

  // Remove from parent's children
  nodes[node.parent] = { ...parent, children: parent.children.filter((c) => c !== op.nodeId) }

  return { ...doc, nodes }
}

function applyMoveNode(doc: Document, op: MoveNodeOp): Document {
  const node = getNode(doc, op.nodeId)
  if (!node.parent) throw new Error("Cannot move root node")

  // Remove from old parent
  const oldParent = getNode(doc, node.parent)
  const oldChildren = oldParent.children.filter((c) => c !== op.nodeId)

  // Add to new parent
  const newParent = op.newParentId === node.parent
    ? { ...oldParent, children: oldChildren }
    : getNode(doc, op.newParentId)
  const newChildren = op.newParentId === node.parent ? [...oldChildren] : [...newParent.children]
  const index = op.index ?? newChildren.length
  newChildren.splice(index, 0, op.nodeId)

  return {
    ...doc,
    nodes: {
      ...doc.nodes,
      [op.nodeId]: { ...node, parent: op.newParentId },
      [node.parent]: { ...(op.newParentId === node.parent ? newParent : oldParent), children: op.newParentId === node.parent ? newChildren : oldChildren },
      ...(op.newParentId !== node.parent ? { [op.newParentId]: { ...newParent, children: newChildren } } : {}),
    },
  }
}

function applyUpdateProps(doc: Document, op: UpdatePropsOp): Document {
  const node = getNode(doc, op.nodeId)
  return updateNode(doc, op.nodeId, { props: { ...node.props, ...op.props } })
}

function applyReorderChildren(doc: Document, op: ReorderChildrenOp): Document {
  return updateNode(doc, op.parentId, { children: op.childIds })
}
