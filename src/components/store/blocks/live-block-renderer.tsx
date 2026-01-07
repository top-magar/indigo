"use client"

import { useEffect } from "react"
import type { StoreBlock, PageLayout, BlockType } from "@/types/blocks"
import { usePreviewMode } from "@/features/editor"
import { EditableBlockWrapper } from "./editable-block-wrapper"
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
import { VideoBlock } from "./video"
import { FAQBlock } from "./faq"
import { GalleryBlock } from "./gallery"

interface LiveBlockRendererProps {
  initialBlocks: StoreBlock[]
  storeName: string
  storeSlug: string
  cartItemCount?: number
  products?: Product[]
  featuredProducts?: Record<string, FeaturedProduct>
  currency?: string
  onNewsletterSubscribe?: (email: string, name?: string) => Promise<void>
}

export function LiveBlockRenderer({
  initialBlocks,
  storeName,
  storeSlug,
  cartItemCount = 0,
  products = [],
  featuredProducts = {},
  currency = "USD",
  onNewsletterSubscribe,
}: LiveBlockRendererProps) {
  const {
    blocks,
    selectedBlockId,
    highlightedBlockId,
    isInEditor,
    handleBlockClick,
    handleBlockHover,
    handleMoveUp,
    handleMoveDown,
    handleDuplicate,
    handleDelete,
    handleAddBelow,
  } = usePreviewMode(initialBlocks)

  // Prevent navigation when in editor mode - only show homepage preview
  useEffect(() => {
    if (!isInEditor) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      if (link) {
        const href = link.getAttribute("href")
        // Allow anchor links and javascript: links
        if (href?.startsWith("#") || href?.startsWith("javascript:")) return
        
        // Prevent all other navigation
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Prevent form submissions
    const handleSubmit = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener("click", handleClick, true)
    document.addEventListener("submit", handleSubmit, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("submit", handleSubmit, true)
    }
  }, [isInEditor])

  const visibleBlocks = blocks
    .filter((block) => block.visible)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="flex min-h-screen flex-col">
      {visibleBlocks.map((block, index) => (
        <EditableBlockWrapper
          key={block.id}
          blockId={block.id}
          blockType={block.type}
          blockIndex={index}
          totalBlocks={visibleBlocks.length}
          isSelected={selectedBlockId === block.id}
          isHighlighted={highlightedBlockId === block.id}
          isInEditor={isInEditor}
          onBlockClick={handleBlockClick}
          onBlockHover={handleBlockHover}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onAddBelow={handleAddBelow}
        >
          <BlockComponent
            block={block}
            storeName={storeName}
            storeSlug={storeSlug}
            cartItemCount={cartItemCount}
            products={products}
            featuredProducts={featuredProducts}
            currency={currency}
            onNewsletterSubscribe={onNewsletterSubscribe}
          />
        </EditableBlockWrapper>
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

function BlockComponent({
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
