"use client"

import { cn } from "@/lib/utils"
import type { RichTextBlock } from "@/types/blocks"
import { EditableRichText } from "@/components/store/blocks/rich-text-editor"

interface TwoColumnRichTextProps {
  blockId: string
  settings: RichTextBlock["settings"]
}

const PADDING_MAP = {
  none: "py-0",
  small: "py-4",
  medium: "py-8",
  large: "py-16",
}

const MAX_WIDTH_MAP = {
  full: "max-w-full",
  narrow: "max-w-4xl",
  medium: "max-w-5xl",
  wide: "max-w-7xl",
}

export function TwoColumnRichText({ blockId, settings }: TwoColumnRichTextProps) {
  const { content, backgroundColor, textColor, padding, maxWidth } = settings

  return (
    <section
      className={cn("w-full px-4", PADDING_MAP[padding])}
      style={{
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
    >
      <div className={cn(MAX_WIDTH_MAP[maxWidth], "mx-auto")}>
        <div className="columns-1 md:columns-2 gap-8">
          <EditableRichText
            blockId={blockId}
            fieldPath="settings.content"
            value={content}
            placeholder="Enter your content here..."
            className="prose prose-sm sm:prose-base max-w-none"
          />
        </div>
      </div>
    </section>
  )
}
