"use client"

import { useEditor, Element } from "@craftjs/core"
import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import {
  Type, ImageIcon, MousePointer, BoxIcon, ColumnsIcon,
  Sparkles, PanelTop, PanelBottom, FileText, ShoppingBag,
  Star, Shield, Mail, Megaphone, HelpCircle, Package,
  Play, Grid, MapPin,
} from "lucide-react"
import { cn } from "@/shared/utils"
import { TextBlock } from "../blocks/text"
import { ImageBlock } from "../blocks/image"
import { ButtonBlock } from "../blocks/button"
import { Container } from "../blocks/container"
import { Columns } from "../blocks/columns"
import { HeroBlock } from "../blocks/hero"
import { HeaderBlock } from "../blocks/header"
import { FooterBlock } from "../blocks/footer"
import { RichTextBlock } from "../blocks/rich-text"
import { ProductGridBlock } from "../blocks/product-grid"
import { FeaturedProductBlock } from "../blocks/featured-product"
import { TestimonialsBlock } from "../blocks/testimonials"
import { TrustSignalsBlock } from "../blocks/trust-signals"
import { NewsletterBlock } from "../blocks/newsletter"
import { PromoBannerBlock } from "../blocks/promo-banner"
import { FaqBlock } from "../blocks/faq"
import { VideoBlock } from "../blocks/video"
import { GalleryBlock } from "../blocks/gallery"
import { ContactInfoBlock } from "../blocks/contact-info"
import { craftRef } from "../craft-ref"

const categories = [
  {
    id: "layout",
    label: "Layout",
    items: [
      { name: "Container", desc: "Section wrapper", icon: BoxIcon, element: <Element canvas is={Container} background="#f5f5f5" padding={20} maxWidth="full" /> },
      { name: "Columns", desc: "Multi-column grid", icon: ColumnsIcon, element: <Element canvas is={Columns} columns={2} gap={16} /> },
    ],
  },
  {
    id: "sections",
    label: "Sections",
    items: [
      { name: "Header", desc: "Store navigation bar", icon: PanelTop, element: <HeaderBlock {...({} as any)} /> },
      { name: "Hero", desc: "Full-width hero banner", icon: Sparkles, element: <HeroBlock {...({} as any)} /> },
      { name: "Footer", desc: "Store footer links", icon: PanelBottom, element: <FooterBlock {...({} as any)} /> },
      { name: "Promo Banner", desc: "Promotional announcement", icon: Megaphone, element: <PromoBannerBlock {...({} as any)} /> },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      { name: "Product Grid", desc: "Product listing grid", icon: ShoppingBag, element: <ProductGridBlock {...({} as any)} /> },
      { name: "Featured Product", desc: "Single product spotlight", icon: Package, element: <FeaturedProductBlock {...({} as any)} /> },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { name: "Text", desc: "Heading or paragraph", icon: Type, element: <TextBlock text="Edit this text" fontSize={16} color="#000" alignment="left" tagName="p" /> },
      { name: "Rich Text", desc: "Formatted text block", icon: FileText, element: <RichTextBlock {...({} as any)} /> },
      { name: "Image", desc: "Image with caption", icon: ImageIcon, element: <ImageBlock src="" alt="" objectFit="cover" borderRadius={8} maxHeight={400} /> },
      { name: "Button", desc: "Call-to-action button", icon: MousePointer, element: <ButtonBlock text="Click me" href="#" variant="primary" size="md" fullWidth={false} /> },
      { name: "Video", desc: "YouTube or Vimeo embed", icon: Play, element: <VideoBlock {...({} as any)} /> },
      { name: "Gallery", desc: "Image gallery grid", icon: Grid, element: <GalleryBlock {...({} as any)} /> },
    ],
  },
  {
    id: "social",
    label: "Social Proof",
    items: [
      { name: "Testimonials", desc: "Customer reviews", icon: Star, element: <TestimonialsBlock {...({} as any)} /> },
      { name: "Trust Signals", desc: "Trust badges & icons", icon: Shield, element: <TrustSignalsBlock {...({} as any)} /> },
      { name: "Newsletter", desc: "Email signup form", icon: Mail, element: <NewsletterBlock {...({} as any)} /> },
      { name: "FAQ", desc: "Frequently asked questions", icon: HelpCircle, element: <FaqBlock {...({} as any)} /> },
      { name: "Contact Info", desc: "Address & contact details", icon: MapPin, element: <ContactInfoBlock {...({} as any)} /> },
    ],
  },
]

interface AddSectionModalProps {
  open: boolean
  onClose: () => void
}

export function AddSectionModal({ open, onClose }: AddSectionModalProps) {
  const { connectors, actions, query } = useEditor()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSearch("")
      setActiveCategory(null)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopImmediatePropagation(); onClose() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0)
    .filter((cat) => !activeCategory || cat.id === activeCategory)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex h-[520px] w-[640px] flex-col overflow-hidden rounded-lg border border-border/50 bg-background shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h3 className="text-[12px] font-semibold text-foreground">Add Section</h3>
          <button onClick={onClose} aria-label="Close" className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border/50 px-5 py-3">
          <div className="flex items-center gap-2 rounded border border-border/50 bg-muted/30 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocks…"
              className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/40"
              autoFocus
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 border-b border-border/50 px-5 py-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
              !activeCategory ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className={cn(
                "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                activeCategory === cat.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Block grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.map((cat) => (
            <div key={cat.id} className="mb-5 last:mb-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
                {cat.label}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {cat.items.map((block) => (
                  <div
                    key={block.name}
                    ref={craftRef((el) => connectors.create(el, block.element))}
                    onClick={() => {
                      const freshTree = query.parseReactElement(block.element).toNodeTree()
                      // Get all top-level node IDs to find the canvas
                      const rootNode = query.node("ROOT").get()
                      
                      // In Craft.js, the ROOT node wraps an <Element canvas> which is
                      // stored as a linked node. That linked node is the actual canvas.
                      const linkedIds = Object.values(rootNode.data.linkedNodes || {})
                      const childIds = rootNode.data.nodes || []
                      
                      // Try linked nodes first, then children, then ROOT
                      const candidates = [...linkedIds, ...childIds]
                      let targetId = "ROOT"
                      
                      for (const id of candidates) {
                        try {
                          if (query.node(id).get().data.isCanvas) {
                            targetId = id
                            break
                          }
                        } catch { /* skip */ }
                      }
                      
                      // If ROOT is itself a canvas (happens with saved JSON)
                      if (targetId === "ROOT") {
                        try {
                          if (query.node("ROOT").get().data.isCanvas) targetId = "ROOT"
                        } catch { /* skip */ }
                      }
                      
                      console.log("[AddSection] target:", targetId, "ROOT isCanvas:", rootNode.data.isCanvas, "linked:", linkedIds, "children:", childIds)
                      actions.addNodeTree(freshTree, targetId)
                      onClose()
                    }}
                    className="group flex cursor-pointer flex-col items-center gap-2 rounded border border-border/50 bg-muted/20 p-3 text-center transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm active:scale-[0.97]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-background shadow-sm ring-1 ring-border/50 transition-colors group-hover:ring-primary/30">
                      <block.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-foreground">{block.name}</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground/60">{block.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
