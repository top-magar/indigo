/**
 * Document Model — Framework-agnostic tree structure.
 * Zero React imports. Zero framework dependencies.
 * This is the "domain core" in Clean Architecture terms.
 */

/** A single node in the document tree */
export interface DocumentNode {
  readonly id: string
  readonly type: string
  readonly props: Readonly<Record<string, unknown>>
  readonly children: readonly string[]
  readonly parent: string | null
}

/** The full document — a flat map of nodes with a root pointer */
export interface Document {
  readonly rootId: string
  readonly nodes: Readonly<Record<string, DocumentNode>>
}

/** Create an empty document with a root container */
export function createDocument(): Document {
  const rootId = generateId()
  return {
    rootId,
    nodes: {
      [rootId]: { id: rootId, type: "Root", props: {}, children: [], parent: null },
    },
  }
}

/** Get a node by ID (throws if missing) */
export function getNode(doc: Document, id: string): DocumentNode {
  const node = doc.nodes[id]
  if (!node) throw new Error(`Node not found: ${id}`)
  return node
}

/** Get children nodes of a parent */
export function getChildren(doc: Document, parentId: string): DocumentNode[] {
  return getNode(doc, parentId).children.map((id) => getNode(doc, id))
}

/** Get the parent node (null for root) */
export function getParent(doc: Document, id: string): DocumentNode | null {
  const node = getNode(doc, id)
  return node.parent ? getNode(doc, node.parent) : null
}

/** Walk the tree depth-first, calling fn for each node */
export function walkTree(doc: Document, fromId: string, fn: (node: DocumentNode, depth: number) => void, depth = 0): void {
  const node = getNode(doc, fromId)
  fn(node, depth)
  for (const childId of node.children) {
    walkTree(doc, childId, fn, depth + 1)
  }
}

/** Immutable node update */
export function updateNode(doc: Document, id: string, patch: Partial<DocumentNode>): Document {
  const existing = getNode(doc, id)
  return {
    ...doc,
    nodes: { ...doc.nodes, [id]: { ...existing, ...patch } },
  }
}

/** Generate a short unique ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}
