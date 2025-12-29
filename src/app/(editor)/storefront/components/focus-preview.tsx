"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useEditorStore, selectViewport } from "@/lib/editor/store"
import type { StoreBlock, BlockType } from "@/types/blocks"
import type { Product } from "@/components/store/blocks/product-grid"
import type { FeaturedProduct } from "@/components/store/blocks/featured-product"
import { VIEWPORT_CONFIG, type Viewport } from "@/lib/editor/types"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  SmartPhone01Icon,
  LaptopIcon,
  ComputerIcon,
} from "@hugeicons/core-free-icons"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { BLOCK_ICONS, BLOCK_TEXT_COLORS } from "@/lib/editor/block-constants"

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
import { EditorCartProvider } from "@/lib/store/editor-cart-provider"

// Viewport icons mapping
const VIEWPORT_ICONS = {
  mobile: SmartPhone01Icon,
  tablet: LaptopIcon,
  desktop: ComputerIcon,
} as const

export interface FocusPreviewProps {
  block: StoreBlock
  storeSlug: string
  storeName: string
  products?: Product[]
  featuredProducts?: Record<string, FeaturedProduct>
  currency?: string
  cartItemCount?: number
  onExit: () => void
  onNewsletterSubscribe?: (email: string, name?: string) => Promise<void>
}

/**
 * FocusPreview renders a single block in isolation for focused editing.
 * Double-click a block to enter focus mode, showing just that block
 * centered in the preview area.
 */
export function FocusPreview({
  block,
  storeSlug,
  storeName,
  products = [],
  featuredProducts = {},
  currency = "USD",
  cartItemCount = 0,
  onExit,
  onNewsletterSubscribe,
}: FocusPreviewProps) {
  const viewport = useEditorStore(selectViewport)
  const { setViewport } = useEditorStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Get viewport dimensions
  const viewportConfig = VIEWPORT_CONFIG[viewport]
  const viewportWidth = viewportConfig.width

  // Calculate scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.clientWidth - 64 // padding
      const scaleX = containerWidth / viewportWidth
      const newScale = Math.min(1, scaleX)
      setScale(newScale)
    }

    updateScale()
    const resizeObserver = new ResizeObserver(updateScale)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [viewportWidth])

  const blockMeta = BLOCK_REGISTRY[block.type]
  const BlockIcon = BLOCK_ICONS[block.type]
  const blockColor = BLOCK_TEXT_COLORS[block.type]

  // Handle escape key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onExit])

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-muted/30">
      {/* Focus mode toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-3 py-2">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={onExit}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                <span className="text-sm">Exit Focus</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Back to full view (Esc)
            </TooltipContent>
          </Tooltip>

          {/* Block info */}
          <div className="flex items-center gap-2 px-3 border-l">
            <HugeiconsIcon icon={BlockIcon} className={cn("h-4 w-4", blockColor)} />
            <span className="text-sm font-medium">{blockMeta?.name}</span>
            {block.variant && blockMeta?.variants.length > 1 && (
              <span className="text-xs text-muted-foreground">
                ({blockMeta.variants.find(v => v.id === block.variant)?.name})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport switcher */}
          <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
            {(Object.keys(VIEWPORT_CONFIG) as Viewport[]).map((vp) => {
              const vpConfig = VIEWPORT_CONFIG[vp]
              const Icon = VIEWPORT_ICONS[vp]
              return (
                <Tooltip key={vp}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewport === vp ? "secondary" : "ghost"}
                      size="icon"
                      className={cn("h-7 w-7 rounded-sm", viewport === vp && "shadow-sm")}
                      onClick={() => setViewport(vp)}
                    >
                      <HugeiconsIcon icon={Icon} className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{vpConfig.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          {/* Focus mode indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium">Focus Mode</span>
          </div>
        </div>
      </div>

      {/* Preview container */}
      <div
        ref={containerRef}
        className="relative min-h-0 w-full min-w-0 flex-1 overflow-auto p-8 flex items-center justify-center"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      >
        {/* Viewport container */}
        <div
          className="origin-center transition-transform duration-300 ease-out"
          style={{
            width: viewportWidth,
            transform: `scale(${scale})`,
          }}
        >
          {/* Preview frame */}
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            {/* Browser chrome for desktop */}
            {viewport === 'desktop' && (
              <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-lg bg-background border px-3 py-1.5 text-xs text-muted-foreground">
                    <span className="text-primary font-medium">Focus:</span>
                    <span>{blockMeta?.name}</span>
                  </div>
                </div>
                <div className="w-[52px]" />
              </div>
            )}

            {/* Block content */}
            <EditorCartProvider itemCount={cartItemCount}>
              <div className="bg-background">
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
              </div>
            </EditorCartProvider>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="shrink-0 px-4 py-2 border-t bg-background/80 backdrop-blur-sm">
        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-medium">Esc</kbd> or click "Exit Focus" to return to full view
        </p>
      </div>
    </div>
  )
}

// Block component renderer
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
      if (!featuredProduct) {
        return (
          <div className="p-8 text-center text-muted-foreground">
            <p>No product selected</p>
          </div>
        )
      }
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

    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          <p>Unknown block type: {(block as StoreBlock).type}</p>
        </div>
      )
  }
}
