"use client"

import { cn } from "@/shared/utils"
import type { SectionBlock as SectionBlockType } from "@/types/blocks"

interface SectionBlockProps {
  block: SectionBlockType
  children?: React.ReactNode
}

const PADDING_MAP = {
  none: "",
  small: "py-4",
  medium: "py-8 md:py-12",
  large: "py-12 md:py-16",
  xlarge: "py-16 md:py-24",
}

const MAX_WIDTH_MAP = {
  full: "max-w-none",
  contained: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  narrow: "max-w-4xl mx-auto px-4 sm:px-6",
}

const VERTICAL_ALIGN_MAP = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
}

export function SectionBlock({ block, children }: SectionBlockProps) {
  const { settings, variant } = block
  const {
    backgroundColor,
    backgroundImage,
    backgroundOverlay,
    padding = "medium",
    maxWidth = "contained",
    verticalAlign = "top",
    minHeight,
    anchor,
  } = settings

  const hasBackground = backgroundColor || backgroundImage

  return (
    <section
      id={anchor}
      className={cn(
        "relative w-full",
        PADDING_MAP[padding],
        variant === "full-width" && "px-0",
      )}
      style={{
        backgroundColor: backgroundColor || undefined,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: minHeight || undefined,
      }}
    >
      {/* Background overlay */}
      {backgroundImage && backgroundOverlay && backgroundOverlay > 0 && (
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: backgroundOverlay / 100 }}
          aria-hidden="true"
        />
      )}

      {/* Content container */}
      <div
        className={cn(
          "relative flex flex-col",
          MAX_WIDTH_MAP[maxWidth],
          VERTICAL_ALIGN_MAP[verticalAlign],
          minHeight && "min-h-full",
        )}
      >
        {children}
      </div>
    </section>
  )
}
