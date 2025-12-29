"use client"

import { cn } from "@/lib/utils"
import type { RichTextBlock } from "@/types/blocks"
import { EditableRichText } from "@/components/store/blocks/rich-text-editor"

interface SimpleRichTextProps {
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
  narrow: "max-w-2xl",
  medium: "max-w-4xl",
  wide: "max-w-6xl",
}

const ALIGNMENT_MAP = {
  left: "text-left",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
}

export function SimpleRichText({ blockId, settings }: SimpleRichTextProps) {
  const { content, backgroundColor, textColor, padding, maxWidth, alignment } = settings

  return (
    <section
      className={cn("w-full px-4", PADDING_MAP[padding])}
      style={{
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
    >
      <div className={cn(MAX_WIDTH_MAP[maxWidth], ALIGNMENT_MAP[alignment])}>
        <EditableRichText
          blockId={blockId}
          fieldPath="settings.content"
          value={content}
          placeholder="Enter your content here..."
          className="prose prose-sm sm:prose-base max-w-none"
        />
      </div>
    </section>
  )
}
