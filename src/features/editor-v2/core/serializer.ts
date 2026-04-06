/**
 * Serializer — JSON ↔ Document tree conversion.
 * Includes Craft.js compatibility layer for v1 storefront rendering.
 */

import type { Document, DocumentNode } from "./document"
import { generateId } from "./document"

// ─── Native v2 Format ────────────────────────────────────────

export interface SerializedNode {
  type: string
  props: Record<string, unknown>
  children: string[]
  parent: string | null
}

export type SerializedDocument = {
  version: 2
  rootId: string
  nodes: Record<string, SerializedNode>
}

/** Serialize a document to JSON-safe format */
export function toJSON(doc: Document): SerializedDocument {
  const nodes: Record<string, SerializedNode> = {}
  for (const [id, node] of Object.entries(doc.nodes)) {
    nodes[id] = { type: node.type, props: { ...node.props }, children: [...node.children], parent: node.parent }
  }
  return { version: 2, rootId: doc.rootId, nodes }
}

/** Deserialize from JSON to a Document */
export function fromJSON(data: SerializedDocument): Document {
  const nodes: Record<string, DocumentNode> = {}
  for (const [id, node] of Object.entries(data.nodes)) {
    nodes[id] = { id, type: node.type, props: node.props, children: node.children, parent: node.parent }
  }
  return { rootId: data.rootId, nodes }
}

// ─── Craft.js Compatibility ──────────────────────────────────

interface CraftNode {
  type: { resolvedName: string }
  isCanvas?: boolean
  props: Record<string, unknown>
  nodes: string[]
  linkedNodes?: Record<string, string>
  parent?: string | null
  displayName?: string
}

type CraftJSON = Record<string, CraftNode>

/** Convert v2 document to Craft.js JSON (for StorefrontLite rendering) */
export function toCraftJSON(doc: Document): CraftJSON {
  const craft: CraftJSON = {}
  for (const [id, node] of Object.entries(doc.nodes)) {
    craft[id] = {
      type: { resolvedName: node.type === "Root" ? "Container" : node.type },
      isCanvas: node.type === "Root" || node.children.length > 0,
      props: { ...node.props },
      nodes: [...node.children],
      parent: node.parent ?? "ROOT",
      displayName: node.type,
    }
  }
  // Craft.js expects "ROOT" as the root key
  if (doc.rootId !== "ROOT") {
    craft["ROOT"] = craft[doc.rootId]
    delete craft[doc.rootId]
    // Fix parent references
    for (const node of Object.values(craft)) {
      if (node.parent === doc.rootId) node.parent = "ROOT"
      node.nodes = node.nodes.map((n) => (n === doc.rootId ? "ROOT" : n))
    }
    craft["ROOT"].parent = null
  }
  return craft
}

/** Import a Craft.js JSON document into v2 format */
export function fromCraftJSON(craft: CraftJSON): Document {
  const nodes: Record<string, DocumentNode> = {}
  const rootId = "ROOT" in craft ? "ROOT" : Object.keys(craft)[0]

  for (const [id, cNode] of Object.entries(craft)) {
    const type = cNode.type?.resolvedName ?? "Container"
    nodes[id] = {
      id,
      type: id === rootId ? "Root" : type,
      props: cNode.props ?? {},
      children: [...(cNode.nodes ?? []), ...Object.values(cNode.linkedNodes ?? {})],
      parent: cNode.parent === "ROOT" && id !== rootId ? rootId : cNode.parent ?? null,
    }
  }

  return { rootId, nodes }
}
