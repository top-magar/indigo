"use client"

import type { ProductGridBlock as ProductGridBlockType } from "@/types/blocks"
import { StandardGrid } from "./variants/standard"
import { FeaturedGrid } from "./variants/featured"
import { CarouselGrid } from "./variants/carousel"
import { ListView } from "./variants/list"
import { MasonryGrid } from "./variants/masonry"

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image: string
  images?: string[]
  rating?: number
  reviewCount?: number
}

interface ProductGridBlockProps {
  block: ProductGridBlockType
  products: Product[]
  storeSlug: string
  currency?: string
}

export function ProductGridBlock({ block, products, storeSlug, currency = "USD" }: ProductGridBlockProps) {
  const props = {
    blockId: block.id,
    settings: block.settings,
    products,
    storeSlug,
    currency,
  }

  switch (block.variant) {
    case "standard":
      return <StandardGrid {...props} />
    case "featured-grid":
      return <FeaturedGrid {...props} />
    case "carousel":
      return <CarouselGrid {...props} />
    case "list":
      return <ListView {...props} />
    case "masonry":
      return <MasonryGrid {...props} />
    default:
      return <StandardGrid {...props} />
  }
}
