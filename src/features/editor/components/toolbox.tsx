"use client"

import { useEditor, Element } from "@craftjs/core"
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
import {
  Type, ImageIcon, MousePointer, BoxIcon, ColumnsIcon,
  Sparkles, PanelTop, PanelBottom, FileText, ShoppingBag,
  Star, Shield, Mail, Megaphone, HelpCircle, Package,
  Play, Grid, MapPin,
} from "lucide-react"
import { craftRef } from "../craft-ref"

const sections = [
  {
    label: "Layout",
    items: [
      { name: "Container", icon: BoxIcon, element: <Element canvas is={Container} {...({} as any)} /> },
      { name: "Columns", icon: ColumnsIcon, element: <Element canvas is={Columns} {...({} as any)} /> },
    ],
  },
  {
    label: "Sections",
    items: [
      { name: "Header", icon: PanelTop, element: <HeaderBlock {...({} as any)} /> },
      { name: "Hero", icon: Sparkles, element: <HeroBlock {...({} as any)} /> },
      { name: "Footer", icon: PanelBottom, element: <FooterBlock {...({} as any)} /> },
      { name: "Promo Banner", icon: Megaphone, element: <PromoBannerBlock {...({} as any)} /> },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Product Grid", icon: ShoppingBag, element: <ProductGridBlock {...({} as any)} /> },
      { name: "Featured Product", icon: Package, element: <FeaturedProductBlock {...({} as any)} /> },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Text", icon: Type, element: <TextBlock {...({} as any)} /> },
      { name: "Rich Text", icon: FileText, element: <RichTextBlock {...({} as any)} /> },
      { name: "Image", icon: ImageIcon, element: <ImageBlock {...({} as any)} /> },
      { name: "Button", icon: MousePointer, element: <ButtonBlock {...({} as any)} /> },
      { name: "Video", icon: Play, element: <VideoBlock {...({} as any)} /> },
      { name: "Gallery", icon: Grid, element: <GalleryBlock {...({} as any)} /> },
      { name: "Testimonials", icon: Star, element: <TestimonialsBlock {...({} as any)} /> },
      { name: "Trust Signals", icon: Shield, element: <TrustSignalsBlock {...({} as any)} /> },
      { name: "Newsletter", icon: Mail, element: <NewsletterBlock {...({} as any)} /> },
      { name: "FAQ", icon: HelpCircle, element: <FaqBlock {...({} as any)} /> },
      { name: "Contact Info", icon: MapPin, element: <ContactInfoBlock {...({} as any)} /> },
    ],
  },
]

export function Toolbox() {
  const { connectors } = useEditor()

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="px-1">
        <h2 className="text-[12px] font-semibold text-foreground">Blocks</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Drag to canvas to add</p>
      </div>
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
            {section.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {section.items.map((block) => (
              <div
                key={block.name}
                ref={craftRef((el) => connectors.create(el, block.element))}
                className="group flex cursor-grab flex-col items-center gap-1.5 rounded border border-border/50 bg-muted/30 px-2 py-3 text-center transition-all hover:border-primary/30 hover:bg-accent hover:shadow-sm active:scale-[0.97] active:cursor-grabbing"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-background shadow-sm ring-1 ring-border/50 transition-colors group-hover:ring-primary/30">
                  <block.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-[11px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
                  {block.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
