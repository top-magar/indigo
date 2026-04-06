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
  // Reverse map: v2 name → v1 name
  const V2_TO_V1: Record<string, string> = {}
  for (const [v1, v2] of Object.entries(V1_TO_V2)) { if (!V2_TO_V1[v2]) V2_TO_V1[v2] = v1 }

  const craft: CraftJSON = {}
  for (const [id, node] of Object.entries(doc.nodes)) {
    const resolvedName = node.type === "Root" ? "Container" : (V2_TO_V1[node.type] ?? node.type)
    craft[id] = {
      type: { resolvedName },
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

/** Map v1 block names (e.g. "HeroBlock") to v2 names (e.g. "Hero") */
const V1_TO_V2: Record<string, string> = {
  HeroBlock: "Hero", HeaderBlock: "Header", FooterBlock: "Footer",
  ProductGridBlock: "ProductGrid", FeaturedProductBlock: "FeaturedProduct",
  CollectionListBlock: "CollectionList", NewsletterBlock: "Newsletter",
  FaqBlock: "FAQ", TestimonialsBlock: "Testimonials",
  ImageBlock: "Image", TextBlock: "Text", ButtonBlock: "Button",
  ColumnsBlock: "Columns", Container: "Root",
  // v1 blocks not yet ported — render as placeholder
  VideoBlock: "Text", PromoBannerBlock: "Text", ImageWithTextBlock: "Text",
  SlideshowBlock: "Hero", CollageBlock: "Image", TrustSignalsBlock: "Text",
  ContactInfoBlock: "Text", CountdownBlock: "Text", GalleryBlock: "Image",
  RichTextBlock: "Text", DividerBlock: "Text", StockCounterBlock: "Text",
  PopupBlock: "Text",
}

function mapBlockName(v1Name: string): string {
  return V1_TO_V2[v1Name] ?? v1Name
}

/** Import a Craft.js JSON document into v2 format */
export function fromCraftJSON(craft: CraftJSON): Document {
  const nodes: Record<string, DocumentNode> = {}
  const rootId = "ROOT" in craft ? "ROOT" : Object.keys(craft)[0]

  for (const [id, cNode] of Object.entries(craft)) {
    const rawType = cNode.type?.resolvedName ?? "Container"
    const type = id === rootId ? "Root" : mapBlockName(rawType)
    nodes[id] = {
      id,
      type,
      props: cNode.props ?? {},
      children: [...(cNode.nodes ?? []), ...Object.values(cNode.linkedNodes ?? {})],
      parent: cNode.parent === "ROOT" && id !== rootId ? rootId : cNode.parent ?? null,
    }
  }

  return { rootId, nodes }
}
