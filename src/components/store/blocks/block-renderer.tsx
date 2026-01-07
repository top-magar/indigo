"use client"

import { memo, useMemo } from "react"
import dynamic from "next/dynamic"
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
import { FAQBlock } from "./faq"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveBlockWrapper } from "./responsive-block-wrapper"

// Lazy load heavy blocks to improve initial page load
// These blocks contain complex functionality that isn't needed immediately
const VideoBlock = dynamic(
  () => import("./video").then((mod) => mod.VideoBlock),
  {
    loading: () => (
      <div className="relative">
        <Skeleton className="aspect-video w-full rounded-lg" />
      </div>
    ),
  }
)

const GalleryBlock = dynamic(
  () => import("./gallery").then((mod) => mod.GalleryBlock),
  {
    loading: () => (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    ),
  }
)

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
 * Requirements: 10.2 - Blocks can be shown/hidden per viewport using responsiveVisibility
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
  // Render the block content based on type
  const renderBlockContent = () => {
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

      case "video":
        return <VideoBlock block={block} />

      case "faq":
        return <FAQBlock block={block} />

      case "gallery":
        return <GalleryBlock block={block} />

      default:
        return null
    }
  }

  const content = renderBlockContent()
  
  // If no content, return null
  if (!content) return null

  // Wrap with responsive visibility if the block has responsiveVisibility settings
  return (
    <ResponsiveBlockWrapper responsiveVisibility={block.responsiveVisibility}>
      {content}
    </ResponsiveBlockWrapper>
  )
})

// Export for use in other components
export { MemoizedBlockComponent }
