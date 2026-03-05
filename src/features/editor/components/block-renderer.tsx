"use client"

/**
 * Dynamic Block Renderer — eliminates the hardcoded switch statement.
 * 
 * Technique: Few-Shot Prompting (Ch. 7) — one pattern, all blocks follow it.
 * Every block component is registered here. Adding a new block = one registry entry.
 */

import { memo, useMemo, type ReactNode } from "react"
import type { StoreBlock, ContainerBlock } from "@/types/blocks"
import { getResolvedSettings } from "@/types/blocks"
import type { Viewport } from "../types"

// Block components
import { HeaderBlock } from "@/components/store/blocks/header"
import { HeroBlock } from "@/components/store/blocks/hero"
import { FeaturedProductBlock } from "@/components/store/blocks/featured-product"
import { ProductGridBlock } from "@/components/store/blocks/product-grid"
import { PromoBannerBlock } from "@/components/store/blocks/promotional-banner"
import { TestimonialsBlock } from "@/components/store/blocks/testimonials"
import { TrustSignalsBlock } from "@/components/store/blocks/trust-signals"
import { NewsletterBlock } from "@/components/store/blocks/newsletter"
import { FooterBlock } from "@/components/store/blocks/footer"
import { RichTextBlock } from "@/components/store/blocks/rich-text"
import { SectionBlock } from "@/components/store/blocks/section"
import { ColumnsBlock, ColumnBlock } from "@/components/store/blocks/columns"
import { ImageBlock } from "@/components/store/blocks/image"
import { ButtonBlock } from "@/components/store/blocks/button"
import { VideoBlock } from "@/components/store/blocks/video"
import { FAQBlock } from "@/components/store/blocks/faq"
import { GalleryBlock } from "@/components/store/blocks/gallery"
import ContactInfoBlock from "@/components/store/blocks/contact-info"
import type { Product } from "@/components/store/blocks/product-grid"
import type { FeaturedProduct } from "@/components/store/blocks/featured-product"

// ─── Context ────────────────────────────────────────────────────────────────

export interface BlockRenderContext {
  viewport: Viewport
  storeName: string
  storeSlug: string
  cartItemCount?: number
  products?: Product[]
  featuredProducts?: Record<string, FeaturedProduct>
  currency?: string
  onNewsletterSubscribe?: (email: string, name?: string) => Promise<void>
}

// ─── Renderer registry ──────────────────────────────────────────────────────
// Each renderer casts `block` to `any` at the boundary — same as the original
// code's `as unknown as Parameters<typeof X>[0]['block']` pattern, but shorter.

type Renderer = (b: any, ctx: BlockRenderContext, rc: (c: StoreBlock[]) => ReactNode) => ReactNode

const R: Record<string, Renderer> = {
  header: (b, ctx) => <HeaderBlock block={b} storeName={ctx.storeName} storeSlug={ctx.storeSlug} cartItemCount={ctx.cartItemCount} />,
  hero: (b, ctx) => <HeroBlock block={b} product={b.settings.featuredProductId ? ctx.featuredProducts?.[b.settings.featuredProductId] : undefined} />,
  "featured-product": (b, ctx) => {
    const p = ctx.featuredProducts?.[b.settings.productId]
    return p ? <FeaturedProductBlock block={b} product={p} storeSlug={ctx.storeSlug} currency={ctx.currency} /> : null
  },
  "product-grid": (b, ctx) => {
    let p = ctx.products ?? []
    if (b.settings.productIds?.length) p = p.filter((x: Product) => b.settings.productIds?.includes(x.id))
    return <ProductGridBlock block={b} products={p} storeSlug={ctx.storeSlug} currency={ctx.currency} />
  },
  "promotional-banner": (b) => <PromoBannerBlock block={b} />,
  testimonials: (b) => <TestimonialsBlock block={b} />,
  "trust-signals": (b) => <TrustSignalsBlock block={b} />,
  newsletter: (b, ctx) => <NewsletterBlock block={b} onSubscribe={ctx.onNewsletterSubscribe} />,
  footer: (b, ctx) => <FooterBlock block={b} storeName={ctx.storeName} />,
  "rich-text": (b) => <RichTextBlock block={b} />,
  image: (b) => <ImageBlock block={b} />,
  button: (b) => <ButtonBlock block={b} />,
  video: (b) => <VideoBlock block={b} />,
  faq: (b) => <FAQBlock block={b} />,
  gallery: (b) => <GalleryBlock block={b} />,
  "contact-info": (b) => <ContactInfoBlock settings={b.settings} />,
  section: (b, _, rc) => (
    <SectionBlock block={b}>{rc("children" in b ? (b as ContainerBlock).children : [])}</SectionBlock>
  ),
  columns: (b, _, rc) => (
    <ColumnsBlock block={b}>
      {("children" in b ? (b as ContainerBlock).children : []).map((col: StoreBlock) => (
        <ColumnBlock key={col.id} block={col as any}>
          {rc("children" in col ? (col as ContainerBlock).children : [])}
        </ColumnBlock>
      ))}
    </ColumnsBlock>
  ),
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function registerBlockRenderer(type: string, renderer: Renderer) {
  R[type] = renderer
}

interface Props {
  block: StoreBlock
  ctx: BlockRenderContext
}

export const BlockRenderer = memo(function BlockRenderer({ block: raw, ctx }: Props) {
  const block = useMemo(() => {
    if (ctx.viewport === "desktop" || !raw.responsiveOverrides) return raw
    return { ...raw, settings: getResolvedSettings(raw, ctx.viewport) }
  }, [raw, ctx.viewport]) as StoreBlock

  const renderChildren = (children: StoreBlock[]) =>
    children.map((child) => <BlockRenderer key={child.id} block={child} ctx={ctx} />)

  const renderer = R[block.type]
  if (!renderer) return null
  return <>{renderer(block, ctx, renderChildren)}</>
})
