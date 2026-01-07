"use client"

import { cn } from "@/shared/utils"
import type { RichTextBlock } from "@/types/blocks"
import { EditableRichText } from "@/components/store/blocks/rich-text-editor"

interface HighlightRichTextProps {
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

export function HighlightRichText({ blockId, settings }: HighlightRichTextProps) {
  const { content, backgroundColor, textColor, padding, maxWidth, alignment } = settings

  return (
    <section className={cn("w-full px-4", PADDING_MAP[padding])}>
      <div
        className={cn(
          MAX_WIDTH_MAP[maxWidth],
          "mx-auto rounded-lg border-l-4 border-primary bg-primary/5 p-6",
          alignment === "center" && "text-center",
          alignment === "right" && "text-right"
        )}
        style={{
          backgroundColor: backgroundColor || undefined,
          color: textColor || undefined,
        }}
      >
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
