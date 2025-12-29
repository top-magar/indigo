"use client"

import { cn } from "@/lib/utils"
import type { SpacerBlock as SpacerBlockType } from "@/types/blocks"

interface SpacerBlockProps {
  block: SpacerBlockType
}

// Height values in pixels for each preset
const HEIGHT_MAP: Record<string, number> = {
  xsmall: 8,
  small: 16,
  medium: 32,
  large: 48,
  xlarge: 64,
  xxlarge: 96,
}

export function SpacerBlock({ block }: SpacerBlockProps) {
  const { settings } = block
  const { height = "medium", customHeight, showOnMobile = true } = settings

  // Determine the actual height in pixels
  const spacerHeight = height === "custom" && customHeight 
    ? customHeight 
    : HEIGHT_MAP[height as string] || 32

  return (
    <div
      className={cn(
        "w-full transition-all",
        !showOnMobile && "hidden md:block",
      )}
      style={{ height: spacerHeight }}
      aria-hidden="true"
      role="presentation"
      data-spacer-height={spacerHeight}
    />
  )
}
