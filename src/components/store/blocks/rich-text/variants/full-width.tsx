"use client"

import { cn } from "@/shared/utils"
import type { RichTextBlock } from "@/types/blocks"
import { EditableRichText } from "@/components/store/blocks/rich-text-editor"

interface FullWidthRichTextProps {
  blockId: string
  settings: RichTextBlock["settings"]
}

const PADDING_MAP = {
  none: "py-0",
  small: "py-6",
  medium: "py-12",
  large: "py-20",
}

const MAX_WIDTH_MAP = {
  full: "max-w-full",
  narrow: "max-w-2xl",
  medium: "max-w-4xl",
  wide: "max-w-6xl",
}

export function FullWidthRichText({ blockId, settings }: FullWidthRichTextProps) {
  const { content, backgroundColor, textColor, padding, maxWidth, alignment } = settings

  return (
    <section
      className={cn("w-full", PADDING_MAP[padding])}
      style={{
        backgroundColor: backgroundColor || "hsl(var(--muted))",
        color: textColor || undefined,
      }}
    >
      <div
        className={cn(
          "mx-auto px-4",
          MAX_WIDTH_MAP[maxWidth],
          alignment === "center" && "text-center",
          alignment === "right" && "text-right"
        )}
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
