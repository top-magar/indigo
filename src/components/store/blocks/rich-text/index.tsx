"use client"

import type { RichTextBlock as RichTextBlockType } from "@/types/blocks"
import { SimpleRichText } from "./variants/simple"
import { CardRichText } from "./variants/card"
import { FullWidthRichText } from "./variants/full-width"

interface RichTextBlockProps {
  block: RichTextBlockType
}

export function RichTextBlock({ block }: RichTextBlockProps) {
  const props = {
    blockId: block.id,
    settings: block.settings,
  }

  switch (block.variant) {
    case "simple":
      return <SimpleRichText {...props} />
    case "card":
      return <CardRichText {...props} />
    case "full-width":
      return <FullWidthRichText {...props} />
    default:
      return <SimpleRichText {...props} />
  }
}
