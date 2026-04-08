"use client"

import { useEditor, Element } from "@craftjs/core"
import { useState } from "react"
import { scrollToLastChild } from "../lib/scroll-to-node"
import { useCanvasAdapter } from "../lib/canvas-adapter"
import { Search, Plus } from "lucide-react"
import {
  Type, ImageIcon, MousePointer, BoxIcon, ColumnsIcon,
  Sparkles, PanelTop, PanelBottom, FileText, ShoppingBag,
  Star, Shield, Mail, Megaphone, HelpCircle, Package,
  Play, Grid, MapPin, SplitSquareHorizontal, GalleryHorizontalEnd,
  LayoutList, LayoutGrid, Minus,
  Timer, BarChart3, MessageSquarePlus,
} from "lucide-react"

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
import { CountdownBlock } from "../blocks/countdown"
import { StockCounterBlock } from "../blocks/stock-counter"
import { PopupBlock } from "../blocks/popup"
import { craftRef } from "../lib/craft-ref"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const categories = [
  {
    id: "templates", label: "Templates",
    items: [
      { name: "Hero + CTA", desc: "Bold hero with call-to-action", icon: Sparkles, element: <HeroBlock {...({ title: "Welcome to Our Store", subtitle: "Discover amazing products curated just for you", ctaText: "Shop Now", ctaLink: "/products", backgroundImage: "", overlayOpacity: 40, height: 500 } as any)} /> },
      { name: "Product Showcase", desc: "Featured products grid", icon: ShoppingBag, element: <ProductGridBlock {...({ heading: "Featured Products", columns: 4, rows: 1, showPrice: true, showBadge: true } as any)} /> },
      { name: "Social Proof", desc: "Testimonials + trust badges", icon: Star, element: <TestimonialsBlock {...({ heading: "What Our Customers Say", layout: "grid", columns: 3 } as any)} /> },
      { name: "Newsletter CTA", desc: "Email signup with heading", icon: Mail, element: <NewsletterBlock {...({ heading: "Stay in the Loop", subheading: "Get exclusive deals and new arrivals straight to your inbox", buttonText: "Subscribe", backgroundColor: "#f8fafc" } as any)} /> },
      { name: "FAQ Section", desc: "Common questions accordion", icon: HelpCircle, element: <FaqBlock {...({ heading: "Frequently Asked Questions" } as any)} /> },
      { name: "Video Feature", desc: "Full-width video embed", icon: Play, element: <VideoBlock {...({ url: "", heading: "See It in Action", aspectRatio: "16:9" } as any)} /> },
    ],
  },
  {
    id: "layout", label: "Layout",
    items: [
      { name: "Container", desc: "Section wrapper", icon: BoxIcon, element: <Element canvas is={Container} {...({} as any)} /> },
      { name: "Columns", desc: "Multi-column grid", icon: ColumnsIcon, element: <Element canvas is={Columns} {...({} as any)} /> },
    ],
  },
  {
    id: "sections", label: "Sections",
    items: [
      { name: "Header", desc: "Store navigation bar", icon: PanelTop, element: <HeaderBlock {...({} as any)} /> },
      { name: "Hero", desc: "Full-width hero banner", icon: Sparkles, element: <HeroBlock {...({} as any)} /> },
      { name: "Hero — Split", desc: "Image + text side by side", icon: Sparkles, element: <HeroBlock {...({ variant: "split" } as any)} /> },
      { name: "Hero — Dark", desc: "Dark background hero", icon: Sparkles, element: <HeroBlock {...({ variant: "full", backgroundColor: "#0f172a", textColor: "#f1f5f9" } as any)} /> },
      { name: "Footer", desc: "Store footer links", icon: PanelBottom, element: <FooterBlock {...({} as any)} /> },
      { name: "Promo Banner", desc: "Promotional announcement", icon: Megaphone, element: <PromoBannerBlock {...({} as any)} /> },
      { name: "Image with Text", desc: "Split image + text layout", icon: SplitSquareHorizontal, element: <ImageWithTextBlock {...({} as any)} /> },
      { name: "Slideshow", desc: "Rotating hero carousel", icon: GalleryHorizontalEnd, element: <SlideshowBlock {...({} as any)} /> },
      { name: "Collage", desc: "Asymmetric image grid", icon: LayoutGrid, element: <CollageBlock {...({} as any)} /> },
      { name: "Divider", desc: "Spacer with optional line", icon: Minus, element: <DividerBlock {...({} as any)} /> },
    ],
  },
  {
    id: "commerce", label: "Commerce",
    items: [
      { name: "Product Grid", desc: "Product listing grid", icon: ShoppingBag, element: <ProductGridBlock {...({} as any)} /> },
      { name: "Featured Product", desc: "Single product spotlight", icon: Package, element: <FeaturedProductBlock {...({} as any)} /> },
      { name: "Collection List", desc: "Category cards grid", icon: LayoutList, element: <CollectionListBlock {...({} as any)} /> },
      { name: "Countdown Timer", desc: "Urgency countdown clock", icon: Timer, element: <CountdownBlock {...({} as any)} /> },
      { name: "Stock Counter", desc: "Low stock urgency indicator", icon: BarChart3, element: <StockCounterBlock {...({} as any)} /> },
    ],
  },
  {
    id: "content", label: "Content",
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
    id: "social", label: "Social Proof",
    items: [
      { name: "Testimonials", desc: "Customer reviews", icon: Star, element: <TestimonialsBlock {...({} as any)} /> },
      { name: "Trust Signals", desc: "Trust badges & icons", icon: Shield, element: <TrustSignalsBlock {...({} as any)} /> },
      { name: "Newsletter", desc: "Email signup form", icon: Mail, element: <NewsletterBlock {...({} as any)} /> },
      { name: "FAQ", desc: "Frequently asked questions", icon: HelpCircle, element: <FaqBlock {...({} as any)} /> },
      { name: "Contact Info", desc: "Address & contact details", icon: MapPin, element: <ContactInfoBlock {...({} as any)} /> },
    ],
  },
  {
    id: "interactive", label: "Interactive",
    items: [
      { name: "Popup / Lightbox", desc: "Triggered modal overlay", icon: MessageSquarePlus, element: <PopupBlock {...({} as any)} /> },
    ],
  },
]

export function AddSectionPanel() {
  const { connectors, actions, query } = useEditor()
  const adapter = useCanvasAdapter()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = categories
    .map((cat) => ({ ...cat, items: cat.items.filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())) }))
    .filter((cat) => cat.items.length > 0)
    .filter((cat) => !activeCategory || cat.id === activeCategory)

  const addBlock = (element: React.ReactElement) => {
    const freshTree = query.parseReactElement(element).toNodeTree()
    const rootNode = query.node("ROOT").get()
    const linkedIds = Object.values(rootNode.data.linkedNodes || {})
    const childIds = rootNode.data.nodes || []
    let targetId = "ROOT"
    for (const id of [...linkedIds, ...childIds]) {
      try { if (query.node(id).get().data.isCanvas) { targetId = id; break } } catch {}
    }
    actions.addNodeTree(freshTree, targetId)
    scrollToLastChild(adapter, targetId)
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 h-11 px-3 shrink-0">
        <Plus className="w-4 h-4 text-muted-foreground" />
        <span className="text-[13px] font-semibold text-foreground">Add Section</span>
      </div>
      <Separator />
      {/* Search */}
      <div className="px-3 pt-2 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blocks…" className="h-8 pl-8 text-xs" />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-1 px-3 pb-2 overflow-x-auto shrink-0">
        <Button variant={!activeCategory ? "default" : "ghost"} className="h-6 text-[11px] px-2 shrink-0" onClick={() => setActiveCategory(null)}>All</Button>
        {categories.map((cat) => (
          <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "ghost"} className="h-6 text-[11px] px-2 shrink-0"
            onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}>{cat.label}</Button>
        ))}
      </div>

      {/* Block list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 pb-3">
          {filtered.map((cat) => (
            <div key={cat.id} className="mb-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{cat.label}</p>
              <div className="flex flex-col gap-1">
                {cat.items.map((block) => (
                  <div key={block.name}
                    ref={craftRef((el) => connectors.create(el, block.element))}
                    onClick={() => addBlock(block.element)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-md border cursor-pointer transition-all hover:border-blue-600 hover:bg-blue-50"
                    style={{ borderColor: 'var(--editor-border)' }}>
                    <block.icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate text-foreground">{block.name}</p>
                      <p className="text-[11px] truncate text-muted-foreground">{block.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
