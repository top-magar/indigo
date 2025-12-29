"use client"

import { memo, useMemo } from "react"
import type { StoreBlock, PageLayout } from "@/types/blocks"
import { HeaderBlock } from "./header"
import { HeroBlock } from "./hero"
import { FeaturedProductBlock, type FeaturedProduct } from "./featured-product"
import { ProductGridBlock, type Product } from "./product-grid"
import { PromoBannerBlock } from "./promotional-banner"
import { TestimonialsBlock } from "./testimonials"
import { TrustSignalsBlock } from "./trust-signals"
import { NewsletterBlock } from "./newsletter"
import { FooterBlock } from "./footer"
import { RichTextBlock } from "./rich-text"
import { ImageBlock } from "./image"
import { ButtonBlock } from "./button"
import { SpacerBlock } from "./spacer"
import { DividerBlock } from "./divider"
import { VideoBlock } from "./video"
import { FAQBlock } from "./faq"
import { CountdownBlock } from "./countdown"
import { GalleryBlock } from "./gallery"
import { IconBlock } from "./icon"

interface BlockRendererProps {
  layout: PageLayout
  storeName: string
  storeSlug: string
  cartItemCount?: number
  products?: Product[]
  featuredProducts?: Record<string, FeaturedProduct>
  currency?: string
  onNewsletterSubscribe?: (email: string, name?: string) => Promise<void>
}

export function BlockRenderer({
  layout,
  storeName,
  storeSlug,
  cartItemCount = 0,
  products = [],
  featuredProducts = {},
  currency = "USD",
  onNewsletterSubscribe,
}: BlockRendererProps) {
  // Memoize visible blocks to prevent unnecessary recalculations
  const visibleBlocks = useMemo(
    () => layout.blocks.filter((block) => block.visible).sort((a, b) => a.order - b.order),
    [layout.blocks]
  )

  return (
    <div className="flex min-h-screen flex-col">
      {visibleBlocks.map((block) => (
        <MemoizedBlockComponent
          key={block.id}
          block={block}
          storeName={storeName}
          storeSlug={storeSlug}
          cartItemCount={cartItemCount}
          products={products}
          featuredProducts={featuredProducts}
          currency={currency}
          onNewsletterSubscribe={onNewsletterSubscribe}
        />
      ))}
    </div>
  )
}

interface BlockComponentProps {
  block: StoreBlock
  storeName: string
  storeSlug: string
  cartItemCount: number
  products: Product[]
  featuredProducts: Record<string, FeaturedProduct>
  currency: string
  onNewsletterSubscribe?: (email: string, name?: string) => Promise<void>
}

/**
 * MemoizedBlockComponent - Memoized block renderer to prevent unnecessary re-renders.
 * Uses React.memo with default shallow comparison.
 * 
 * Requirements: 10.1 - Use React.memo to prevent unnecessary re-renders
 */
const MemoizedBlockComponent = memo(function BlockComponent({
  block,
  storeName,
  storeSlug,
  cartItemCount,
  products,
  featuredProducts,
  currency,
  onNewsletterSubscribe,
}: BlockComponentProps) {
  switch (block.type) {
    case "header":
      return (
        <HeaderBlock
          block={block}
          storeName={storeName}
          storeSlug={storeSlug}
          cartItemCount={cartItemCount}
        />
      )

    case "hero":
      const heroProduct = block.settings.featuredProductId
        ? featuredProducts[block.settings.featuredProductId]
        : undefined
      return <HeroBlock block={block} product={heroProduct} />

    case "featured-product":
      const featuredProduct = featuredProducts[block.settings.productId]
      if (!featuredProduct) return null
      return (
        <FeaturedProductBlock
          block={block}
          product={featuredProduct}
          storeSlug={storeSlug}
          currency={currency}
        />
      )

    case "product-grid":
      // Filter products based on collection or specific IDs
      let gridProducts = products
      if (block.settings.productIds?.length) {
        gridProducts = products.filter((p) => block.settings.productIds?.includes(p.id))
      }
      return (
        <ProductGridBlock
          block={block}
          products={gridProducts}
          storeSlug={storeSlug}
          currency={currency}
        />
      )

    case "promotional-banner":
      return <PromoBannerBlock block={block} />

    case "testimonials":
      return <TestimonialsBlock block={block} />

    case "trust-signals":
      return <TrustSignalsBlock block={block} />

    case "newsletter":
      return <NewsletterBlock block={block} onSubscribe={onNewsletterSubscribe} />

    case "footer":
      return <FooterBlock block={block} storeName={storeName} />

    case "rich-text":
      return <RichTextBlock block={block} />

    case "image":
      return <ImageBlock block={block} />

    case "button":
      return <ButtonBlock block={block} />

    case "spacer":
      return <SpacerBlock block={block} />

    case "divider":
      return <DividerBlock block={block} />

    case "video":
      return <VideoBlock block={block} />

    case "faq":
      return <FAQBlock block={block} />

    case "countdown":
      return <CountdownBlock block={block} />

    case "gallery":
      return <GalleryBlock block={block} />

    case "icon":
      return <IconBlock block={block} />

    default:
      return null
  }
})

// Export for use in other components
export { MemoizedBlockComponent }
