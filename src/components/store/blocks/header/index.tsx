"use client"

import type { HeaderBlock as HeaderBlockType } from "@/types/blocks"
import { ClassicHeader } from "./variants/classic"
import { CenteredHeader } from "./variants/centered"
import { MinimalHeader } from "./variants/minimal"
import { MegaMenuHeader } from "./variants/mega-menu"
import { AnnouncementHeader } from "./variants/announcement"

interface HeaderBlockProps {
  block: HeaderBlockType
  storeName: string
  storeSlug: string
  cartItemCount?: number
}

export function HeaderBlock({ block, storeName, storeSlug, cartItemCount = 0 }: HeaderBlockProps) {
  const props = {
    blockId: block.id,
    settings: block.settings,
    storeName,
    storeSlug,
    cartItemCount,
  }

  switch (block.variant) {
    case "classic":
      return <ClassicHeader {...props} />
    case "centered":
      return <CenteredHeader {...props} />
    case "minimal":
      return <MinimalHeader {...props} />
    case "mega-menu":
      return <MegaMenuHeader {...props} />
    case "announcement":
      return <AnnouncementHeader {...props} />
    default:
      return <ClassicHeader {...props} />
  }
}
