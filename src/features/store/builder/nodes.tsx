"use client"

import type { JSX } from "react"
import {
  DecoratorNode,
  type NodeKey,
  type SerializedLexicalNode,
  type LexicalNode,
  type EditorConfig,
  type DOMExportOutput,
  $getNodeByKey,
} from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import type { SectionType, SectionConfig } from "@/features/store/section-registry"
import { SECTION_VARIANTS, SECTION_LABELS } from "@/features/store/section-registry"

// ── Serialized shape ──

export interface SerializedSectionNode extends SerializedLexicalNode {
  sectionType: SectionType
  variant: string
  content: Record<string, string>
  visible: boolean
  sectionId: string
}

// ── Inline preview components ──

function HeroPreview({ variant, content, color }: { variant: string; content: Record<string, string>; color: string }) {
  const title = content.title || "Welcome to our store"
  const subtitle = content.subtitle || "Discover amazing products"
  const cta = content.cta || "Shop Now"

  if (variant === "hero-minimal") {
    return (
      <div style={{ padding: "64px 24px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>{title}</h1>
        {subtitle && <p style={{ marginTop: 16, fontSize: 18, color: "#6b7280" }}>{subtitle}</p>}
        <button style={{ marginTop: 28, padding: "10px 28px", background: color, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500 }}>{cta}</button>
      </div>
    )
  }
  if (variant === "hero-split") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, padding: "48px 24px", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>{title}</h1>
          {subtitle && <p style={{ marginTop: 14, fontSize: 17, color: "#6b7280" }}>{subtitle}</p>}
          <button style={{ marginTop: 24, padding: "10px 28px", background: color, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500 }}>{cta}</button>
        </div>
        <div style={{ aspectRatio: "4/3", background: "#f3f4f6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 32 }}>🖼️</div>
      </div>
    )
  }
  // fullwidth
  return (
    <div style={{ background: content.imageUrl ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url(${content.imageUrl})` : color, backgroundSize: "cover", backgroundPosition: "center", padding: "72px 24px", color: "#fff" }}>
      <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1, maxWidth: 550 }}>{title}</h1>
      {subtitle && <p style={{ marginTop: 16, fontSize: 17, opacity: 0.85, maxWidth: 450 }}>{subtitle}</p>}
      <button style={{ marginTop: 28, padding: "10px 28px", background: "#fff", color: "#111", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500 }}>{cta}</button>
    </div>
  )
}

function ProductGridPreview({ variant, content, color }: { variant: string; content: Record<string, string>; color: string }) {
  const title = content.title || "Featured Products"
  const count = Math.min(Number(content.limit) || 4, 8)
  const cols = variant === "products-grid-4" ? 4 : 3

  return (
    <div style={{ padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{title}</h2>
        <span style={{ fontSize: 13, color, fontWeight: 500 }}>View all →</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>
            <div style={{ aspectRatio: "1", background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 24 }}>🖼️</div>
            <p style={{ fontWeight: 500, fontSize: 13, marginTop: 8 }}>Product {i + 1}</p>
            <p style={{ fontSize: 13, color, marginTop: 2 }}>Rs {(Math.random() * 900 + 100).toFixed(0)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoriesPreview({ variant, content, color }: { variant: string; content: Record<string, string>; color: string }) {
  const title = content.title || "Shop by Category"
  const cats = ["Clothing", "Electronics", "Home", "Beauty", "Footwear", "Accessories"]

  if (variant === "categories-full-bg") {
    return (
      <div style={{ padding: "40px 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{title}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {cats.slice(0, 3).map(cat => (
            <div key={cat} style={{ position: "relative", height: 160, borderRadius: 12, overflow: "hidden", background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
              <div style={{ position: "absolute", bottom: 14, left: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{cat}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Browse →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "40px 24px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${variant === "categories-icons" ? 4 : 3}, 1fr)`, gap: 12 }}>
        {cats.map(cat => (
          <div key={cat} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 18, textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${color}15`, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: `${color}30` }} />
            </div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{cat}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BannerPreview({ variant, content, color }: { variant: string; content: Record<string, string>; color: string }) {
  if (!content.title) return <div style={{ padding: "40px 24px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Banner — add a title to preview</div>

  if (variant === "banner-split") {
    return (
      <div style={{ padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 14, overflow: "hidden", background: `${color}08` }}>
          <div style={{ aspectRatio: "16/9", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 28 }}>🖼️</div>
          <div style={{ padding: 32, display: "flex", flexDirection: "column" as const, justifyContent: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{content.title}</h2>
            {content.subtitle && <p style={{ marginTop: 8, color: "#6b7280" }}>{content.subtitle}</p>}
            {content.cta && <button style={{ marginTop: 16, padding: "8px 20px", background: color, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, width: "fit-content" }}>{content.cta}</button>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: color, padding: "40px 24px", textAlign: "center", color: "#fff" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>{content.title}</h2>
      {content.subtitle && <p style={{ marginTop: 8, opacity: 0.85 }}>{content.subtitle}</p>}
      {content.cta && <button style={{ marginTop: 16, padding: "8px 20px", background: "#fff", color: "#111", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>{content.cta}</button>}
    </div>
  )
}

function TestimonialsPreview({ content, color }: { content: Record<string, string>; color: string }) {
  const title = content.title || "What Our Customers Say"
  const reviews = [
    { name: "Sita R.", text: "Amazing quality and fast delivery!" },
    { name: "Rajesh K.", text: "Best online shopping experience." },
    { name: "Anita S.", text: "Great products at affordable prices." },
  ]
  return (
    <div style={{ padding: "40px 24px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {reviews.map(r => (
          <div key={r.name} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
            <p style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>"{r.text}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>{r.name[0]}</div>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{r.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnnouncementPreview({ content, color }: { content: Record<string, string>; color: string }) {
  return (
    <div style={{ background: color, color: "#fff", textAlign: "center", padding: "8px 16px", fontSize: 13, fontWeight: 500 }}>
      {content.text || "Free shipping on orders over Rs 1,000!"}
    </div>
  )
}

// ── Section preview wrapper with selection + controls ──

function SectionNodeComponent({ nodeKey, sectionType, variant, content, visible, color }: {
  nodeKey: NodeKey
  sectionType: SectionType
  variant: string
  content: Record<string, string>
  visible: boolean
  color: string
}) {
  const [editor] = useLexicalComposerContext()

  const updateContent = (key: string, value: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as SectionNode | null
      if (node) node.setContent({ ...node.getContent(), [key]: value })
    })
  }

  const setVariant = (v: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as SectionNode | null
      if (node) node.setVariant(v)
    })
  }

  const toggleVisible = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as SectionNode | null
      if (node) node.setVisible(!node.getVisible())
    })
  }

  const remove = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as SectionNode | null
      if (node) node.remove()
    })
  }

  const variants = SECTION_VARIANTS[sectionType]
  const isFixed = sectionType === "header" || sectionType === "footer"

  const preview = (() => {
    switch (sectionType) {
      case "hero": return <HeroPreview variant={variant} content={content} color={color} />
      case "product-grid": return <ProductGridPreview variant={variant} content={content} color={color} />
      case "categories": return <CategoriesPreview variant={variant} content={content} color={color} />
      case "banner": return <BannerPreview variant={variant} content={content} color={color} />
      case "testimonials": return <TestimonialsPreview content={content} color={color} />
      case "announcement": return <AnnouncementPreview content={content} color={color} />
      case "header": return (
        <div style={{ borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>StoreName</span>
          <nav style={{ display: "flex", gap: 18, fontSize: 13, color: "#6b7280" }}>
            <span>Home</span><span>Products</span><span>Categories</span>
          </nav>
        </div>
      )
      case "footer": return (
        <div style={{ borderTop: "1px solid #e5e7eb", padding: "28px 24px", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
          © {new Date().getFullYear()} StoreName. All rights reserved.
        </div>
      )
      default: return null
    }
  })()

  return (
    <div
      style={{ opacity: visible ? 1 : 0.35, position: "relative", transition: "opacity 0.2s" }}
      data-section-type={sectionType}
    >
      {/* Section label bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
        background: "#f9fafb", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#6b7280",
      }}>
        <span style={{ cursor: "grab", userSelect: "none" }}>⠿</span>
        <span style={{ fontWeight: 600, color: "#374151" }}>{SECTION_LABELS[sectionType]}</span>
        <span style={{ fontSize: 10, background: "#f3f4f6", padding: "1px 6px", borderRadius: 4 }}>
          {variants.find(v => v.id === variant)?.name}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            style={{ fontSize: 10, padding: "2px 4px", border: "1px solid #e5e7eb", borderRadius: 4, background: "#fff" }}
          >
            {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <button onClick={toggleVisible} style={{ fontSize: 12, padding: "0 4px", background: "none", border: "none", cursor: "pointer" }}>
            {visible ? "👁" : "👁‍🗨"}
          </button>
          {!isFixed && (
            <button onClick={remove} style={{ fontSize: 12, padding: "0 4px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>✕</button>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff" }}>
        {preview}
      </div>
    </div>
  )
}

// ── Lexical DecoratorNode ──

export class SectionNode extends DecoratorNode<JSX.Element> {
  __sectionType: SectionType
  __variant: string
  __content: Record<string, string>
  __visible: boolean
  __sectionId: string

  static getType(): string { return "section" }

  static clone(node: SectionNode): SectionNode {
    return new SectionNode(node.__sectionType, node.__variant, node.__content, node.__visible, node.__sectionId, node.__key)
  }

  constructor(sectionType: SectionType, variant: string, content: Record<string, string>, visible: boolean, sectionId: string, key?: NodeKey) {
    super(key)
    this.__sectionType = sectionType
    this.__variant = variant
    this.__content = content
    this.__visible = visible
    this.__sectionId = sectionId
  }

  // Getters
  getSectionType(): SectionType { return this.__sectionType }
  getVariant(): string { return this.__variant }
  getContent(): Record<string, string> { return this.__content }
  getVisible(): boolean { return this.__visible }
  getSectionId(): string { return this.__sectionId }

  // Setters (writable)
  setVariant(v: string): void { const self = this.getWritable(); self.__variant = v }
  setContent(c: Record<string, string>): void { const self = this.getWritable(); self.__content = c }
  setVisible(v: boolean): void { const self = this.getWritable(); self.__visible = v }

  // Serialization → SectionConfig-compatible JSON
  exportJSON(): SerializedSectionNode {
    return {
      type: "section",
      version: 1,
      sectionType: this.__sectionType,
      variant: this.__variant,
      content: this.__content,
      visible: this.__visible,
      sectionId: this.__sectionId,
    }
  }

  static importJSON(json: SerializedSectionNode): SectionNode {
    return new SectionNode(json.sectionType, json.variant, json.content, json.visible, json.sectionId)
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement("div")
    div.style.margin = "0"
    return div
  }

  updateDOM(): boolean { return false }

  exportDOM(): DOMExportOutput {
    const el = document.createElement("div")
    el.setAttribute("data-section-type", this.__sectionType)
    return { element: el }
  }

  isInline(): boolean { return false }

  decorate(): JSX.Element {
    return (
      <SectionNodeComponent
        nodeKey={this.__key}
        sectionType={this.__sectionType}
        variant={this.__variant}
        content={this.__content}
        visible={this.__visible}
        color="#3b82f6"
      />
    )
  }
}

export function $createSectionNode(config: SectionConfig): SectionNode {
  return new SectionNode(config.type, config.variant, config.content, config.visible, config.id)
}

export function $isSectionNode(node: LexicalNode | null | undefined): node is SectionNode {
  return node instanceof SectionNode
}
