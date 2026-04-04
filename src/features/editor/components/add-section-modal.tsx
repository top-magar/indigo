"use client"

import { useEditor, Element } from "@craftjs/core"
import { useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import {
  Type, ImageIcon, MousePointer, BoxIcon, ColumnsIcon,
  Sparkles, PanelTop, PanelBottom, FileText, ShoppingBag,
  Star, Shield, Mail, Megaphone, HelpCircle, Package,
  Play, Grid, MapPin, SplitSquareHorizontal, GalleryHorizontalEnd,
  LayoutList, LayoutGrid, Minus,
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
import { ImageWithTextBlock } from "../blocks/image-with-text"
import { SlideshowBlock } from "../blocks/slideshow"
import { CollectionListBlock } from "../blocks/collection-list"
import { CollageBlock } from "../blocks/collage"
import { DividerBlock } from "../blocks/divider"
import { craftRef } from "../craft-ref"

/** Mini wireframe thumbnails for the Add Section modal */
function BlockPreview({ name }: { name: string }) {
  const bar = "h-1 rounded-full bg-gray-300"
  const box = "rounded bg-gray-200"
  switch (name) {
    case "Hero": case "Hero + CTA":
      return <div className="flex w-full flex-col items-center gap-1 p-2"><div className={`${bar} w-12`} /><div className={`${bar} w-8`} /><div className="mt-0.5 h-2 w-8 rounded bg-blue-200" /></div>
    case "Header":
      return <div className="flex w-full items-center gap-2 px-2"><div className="h-2 w-2 rounded bg-blue-200" /><div className={`${bar} w-6`} /><div className="ml-auto flex gap-1"><div className={`${bar} w-3`} /><div className={`${bar} w-3`} /></div></div>
    case "Footer":
      return <div className="flex w-full gap-3 px-2"><div className="flex flex-col gap-0.5"><div className={`${bar} w-6`} /><div className={`${bar} w-4`} /></div><div className="flex flex-col gap-0.5"><div className={`${bar} w-5`} /><div className={`${bar} w-4`} /></div></div>
    case "Product Grid": case "Product Showcase":
      return <div className="grid w-full grid-cols-3 gap-1 px-2"><div className={`${box} h-6`} /><div className={`${box} h-6`} /><div className={`${box} h-6`} /></div>
    case "Featured Product":
      return <div className="flex w-full gap-2 px-2"><div className={`${box} h-8 w-8`} /><div className="flex flex-col gap-0.5"><div className={`${bar} w-8`} /><div className={`${bar} w-5`} /><div className="mt-0.5 h-1.5 w-6 rounded bg-blue-200" /></div></div>
    case "Columns":
      return <div className="grid w-full grid-cols-2 gap-1 px-2"><div className={`${box} h-8`} /><div className={`${box} h-8`} /></div>
    case "Container":
      return <div className="mx-2 flex h-8 w-full items-center justify-center rounded border border-dashed border-gray-300"><span className="text-[8px] text-gray-300">{ }</span></div>
    case "Testimonials": case "Social Proof":
      return <div className="flex w-full gap-1 px-2">{[0,1,2].map(i => <div key={i} className="flex flex-1 flex-col items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-gray-300" /><div className={`${bar} w-full`} /></div>)}</div>
    case "Trust Signals":
      return <div className="flex w-full justify-center gap-2 px-2">{[0,1,2,3].map(i => <div key={i} className="h-3 w-3 rounded bg-gray-200" />)}</div>
    case "Newsletter": case "Newsletter CTA":
      return <div className="flex w-full flex-col items-center gap-1 p-2"><div className={`${bar} w-10`} /><div className="flex gap-1"><div className="h-2 w-12 rounded bg-gray-200 ring-1 ring-gray-200" /><div className="h-2 w-4 rounded bg-blue-200" /></div></div>
    case "FAQ": case "FAQ Section":
      return <div className="flex w-full flex-col gap-0.5 px-2">{[0,1,2].map(i => <div key={i} className="flex items-center gap-1"><div className="h-0.5 w-0.5 rounded-full bg-gray-300" /><div className={`${bar} flex-1`} /></div>)}</div>
    case "Video": case "Video Feature":
      return <div className="flex h-8 w-full items-center justify-center rounded bg-gray-200 mx-2"><Play className="h-3 w-3 text-gray-300" /></div>
    case "Gallery":
      return <div className="grid w-full grid-cols-3 gap-0.5 px-2"><div className={`${box} col-span-2 row-span-2 h-8`} /><div className={`${box} h-[15px]`} /><div className={`${box} h-[15px]`} /></div>
    case "Promo Banner":
      return <div className="flex w-full items-center justify-between rounded bg-blue-50 px-2 py-1"><div className={`${bar} w-10`} /><div className="h-1.5 w-4 rounded bg-blue-200" /></div>
    case "Text":
      return <div className="flex w-full flex-col gap-0.5 px-2"><div className={`${bar} w-12`} /><div className={`${bar} w-full`} /><div className={`${bar} w-10`} /></div>
    case "Rich Text":
      return <div className="flex w-full flex-col gap-0.5 px-2"><div className={`${bar} w-8`} /><div className={`${bar} w-full`} /><div className={`${bar} w-full`} /><div className={`${bar} w-6`} /></div>
    case "Image":
      return <div className="flex h-8 w-full items-center justify-center rounded bg-gray-200 mx-2"><ImageIcon className="h-3 w-3 text-gray-300" /></div>
    case "Button":
      return <div className="flex w-full justify-center p-2"><div className="h-3 w-14 rounded bg-blue-200" /></div>
    case "Contact Info":
      return <div className="flex w-full flex-col gap-0.5 px-2"><div className="flex items-center gap-1"><MapPin className="h-2 w-2 text-gray-300" /><div className={`${bar} w-10`} /></div><div className="flex items-center gap-1"><Mail className="h-2 w-2 text-gray-300" /><div className={`${bar} w-12`} /></div></div>
    default:
      return <div className="flex h-8 w-full items-center justify-center"><span className="text-[9px] text-gray-300">Preview</span></div>
  }
}

const categories = [
  {
    id: "templates",
    label: "Templates",
    items: [
      {
        name: "Hero + CTA",
        desc: "Bold hero with call-to-action",
        icon: Sparkles,
        element: <HeroBlock {...({ title: "Welcome to Our Store", subtitle: "Discover amazing products curated just for you", ctaText: "Shop Now", ctaLink: "/products", backgroundImage: "", overlayOpacity: 40, height: 500 } as any)} />,
      },
      {
        name: "Product Showcase",
        desc: "Featured products grid",
        icon: ShoppingBag,
        element: <ProductGridBlock {...({ heading: "Featured Products", columns: 4, rows: 1, showPrice: true, showBadge: true } as any)} />,
      },
      {
        name: "Social Proof",
        desc: "Testimonials + trust badges",
        icon: Star,
        element: <TestimonialsBlock {...({ heading: "What Our Customers Say", layout: "grid", columns: 3 } as any)} />,
      },
      {
        name: "Newsletter CTA",
        desc: "Email signup with heading",
        icon: Mail,
        element: <NewsletterBlock {...({ heading: "Stay in the Loop", subheading: "Get exclusive deals and new arrivals straight to your inbox", buttonText: "Subscribe", backgroundColor: "#f8fafc" } as any)} />,
      },
      {
        name: "FAQ Section",
        desc: "Common questions accordion",
        icon: HelpCircle,
        element: <FaqBlock {...({ heading: "Frequently Asked Questions" } as any)} />,
      },
      {
        name: "Video Feature",
        desc: "Full-width video embed",
        icon: Play,
        element: <VideoBlock {...({ url: "", heading: "See It in Action", aspectRatio: "16:9" } as any)} />,
      },
    ],
  },
  {
    id: "layout",
    label: "Layout",
    items: [
      { name: "Container", desc: "Section wrapper", icon: BoxIcon, element: <Element canvas is={Container} {...({} as any)} /> },
      { name: "Columns", desc: "Multi-column grid", icon: ColumnsIcon, element: <Element canvas is={Columns} {...({} as any)} /> },
    ],
  },
  {
    id: "sections",
    label: "Sections",
    items: [
      { name: "Header", desc: "Store navigation bar", icon: PanelTop, element: <HeaderBlock {...({} as any)} /> },
      { name: "Hero", desc: "Full-width hero banner", icon: Sparkles, element: <HeroBlock {...({} as any)} /> },
      { name: "Hero — Split", desc: "Image + text side by side", icon: Sparkles, element: <HeroBlock {...({ variant: "split", heading: "Your Headline", subheading: "Supporting text goes here", ctaText: "Shop Now", ctaHref: "/products" } as any)} /> },
      { name: "Hero — Dark", desc: "Dark background hero", icon: Sparkles, element: <HeroBlock {...({ variant: "full", heading: "Bold Statement", subheading: "Make an impact with a dark hero", backgroundColor: "#0f172a", textColor: "#f1f5f9", ctaText: "Explore", ctaHref: "/products", ctaStyle: "outline", ctaColor: "#f1f5f9", ctaBackground: "transparent" } as any)} /> },
      { name: "Footer", desc: "Store footer links", icon: PanelBottom, element: <FooterBlock {...({} as any)} /> },
      { name: "Promo Banner", desc: "Promotional announcement", icon: Megaphone, element: <PromoBannerBlock {...({} as any)} /> },
      { name: "Image with Text", desc: "Split image + text layout", icon: SplitSquareHorizontal, element: <ImageWithTextBlock {...({} as any)} /> },
      { name: "Slideshow", desc: "Rotating hero carousel", icon: GalleryHorizontalEnd, element: <SlideshowBlock {...({} as any)} /> },
      { name: "Collage", desc: "Asymmetric image grid", icon: LayoutGrid, element: <CollageBlock {...({} as any)} /> },
      { name: "Divider", desc: "Spacer with optional line", icon: Minus, element: <DividerBlock {...({} as any)} /> },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      { name: "Product Grid", desc: "Product listing grid", icon: ShoppingBag, element: <ProductGridBlock {...({} as any)} /> },
      { name: "Featured Product", desc: "Single product spotlight", icon: Package, element: <FeaturedProductBlock {...({} as any)} /> },
      { name: "Collection List", desc: "Category cards grid", icon: LayoutList, element: <CollectionListBlock {...({} as any)} /> },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { name: "Text", desc: "Heading or paragraph", icon: Type, element: <TextBlock {...({} as any)} /> },
      { name: "Rich Text", desc: "Formatted text block", icon: FileText, element: <RichTextBlock {...({} as any)} /> },
      { name: "Image", desc: "Image with caption", icon: ImageIcon, element: <ImageBlock {...({} as any)} /> },
      { name: "Button", desc: "Call-to-action button", icon: MousePointer, element: <ButtonBlock {...({} as any)} /> },
      { name: "Video", desc: "YouTube or Vimeo embed", icon: Play, element: <VideoBlock {...({} as any)} /> },
      { name: "Gallery", desc: "Image gallery grid", icon: Grid, element: <GalleryBlock {...({} as any)} /> },
    ],
  },
  {
    id: "social",
    label: "Social Proof",
    items: [
      { name: "Testimonials", desc: "Customer reviews", icon: Star, element: <TestimonialsBlock {...({} as any)} /> },
      { name: "Testimonials — Cards", desc: "Card-style reviews", icon: Star, element: <TestimonialsBlock {...({ variant: "grid", cardStyle: "bordered", showRating: true, showAvatar: true } as any)} /> },
      { name: "Trust Signals", desc: "Trust badges & icons", icon: Shield, element: <TrustSignalsBlock {...({} as any)} /> },
      { name: "Newsletter", desc: "Email signup form", icon: Mail, element: <NewsletterBlock {...({} as any)} /> },
      { name: "Newsletter — Card", desc: "Card-style signup", icon: Mail, element: <NewsletterBlock {...({ variant: "card", backgroundColor: "#111827", textColor: "#f1f5f9" } as any)} /> },
      { name: "FAQ", desc: "Frequently asked questions", icon: HelpCircle, element: <FaqBlock {...({} as any)} /> },
      { name: "Contact Info", desc: "Address & contact details", icon: MapPin, element: <ContactInfoBlock {...({} as any)} /> },
    ],
  },
]

function CategoryTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: 500, transition: 'all 0.1s',
        background: active ? 'var(--editor-fill-brand)' : 'none',
        color: active ? 'white' : 'var(--editor-text-secondary)',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'none' }}
    >
      {label}
    </button>
  )
}

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        style={{
          width: 640, height: 520, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRadius: 12, background: 'var(--editor-surface)',
          border: '1px solid var(--editor-border)',
          boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--editor-border)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 650, color: 'var(--editor-text)' }}>Add Section</h3>
          <button onClick={onClose} aria-label="Close" style={{ padding: 4, borderRadius: 'var(--editor-radius)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--editor-icon-secondary)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--editor-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', height: 36, borderRadius: 'var(--editor-radius)', border: '1px solid var(--editor-border)', background: 'var(--editor-input-bg)' }}>
            <Search className="h-4 w-4" style={{ color: 'var(--editor-icon-secondary)', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocks…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--editor-text)' }}
              autoFocus
            />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 20px', borderBottom: '1px solid var(--editor-border)', overflowX: 'auto' }}>
          <CategoryTab active={!activeCategory} onClick={() => setActiveCategory(null)} label="All" />
          {categories.map((cat) => (
            <CategoryTab key={cat.id} active={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)} label={cat.label} />
          ))}
        </div>

        {/* Block grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {filtered.map((cat) => (
            <div key={cat.id} style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 8, fontSize: 11, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--editor-text-secondary)' }}>
                {cat.label}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
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
                    className="group"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: 12, borderRadius: 'var(--editor-radius)',
                      border: '1px solid var(--editor-border)',
                      background: 'var(--editor-surface)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--editor-accent)'
                      e.currentTarget.style.background = 'var(--editor-accent-light)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--editor-border)'
                      e.currentTarget.style.background = 'var(--editor-surface)'
                    }}
                  >
                    {/* Mini wireframe preview */}
                    <div style={{
                      display: 'flex', height: 52, width: '100%', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 6, background: 'var(--editor-surface-secondary)',
                      overflow: 'hidden',
                    }}>
                      <BlockPreview name={block.name} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--editor-text)' }}>{block.name}</p>
                      <p style={{ marginTop: 2, fontSize: 11, color: 'var(--editor-text-secondary)', lineHeight: '14px' }}>{block.desc}</p>
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
