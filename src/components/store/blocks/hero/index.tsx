"use client"

import type { HeroBlock as HeroBlockType } from "@/types/blocks"
import { FullWidthHero } from "./variants/full-width"
import { SplitHero } from "./variants/split"
import { VideoHero } from "./variants/video"
import { MinimalTextHero } from "./variants/minimal-text"
import { ProductShowcaseHero } from "./variants/product-showcase"

interface HeroBlockProps {
  block: HeroBlockType
  product?: {
    id: string
    name: string
    price: number
    image: string
    slug: string
  }
}

export function HeroBlock({ block, product }: HeroBlockProps) {
  const props = {
    blockId: block.id,
    settings: block.settings,
    product,
  }

  switch (block.variant) {
    case "full-width":
      return <FullWidthHero {...props} />
    case "split":
      return <SplitHero {...props} />
    case "video":
      return <VideoHero {...props} />
    case "minimal-text":
      return <MinimalTextHero {...props} />
    case "product-showcase":
      return <ProductShowcaseHero {...props} />
    default:
      return <FullWidthHero {...props} />
  }
}
