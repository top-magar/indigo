"use client"

import { cn } from "@/shared/utils"
import type { DividerBlock as DividerBlockType } from "@/types/blocks"

interface DividerBlockProps {
  block: DividerBlockType
}

const STYLE_CLASSES = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
  gradient: "", // Handled separately with background
}

const WIDTH_CLASSES = {
  full: "w-full",
  medium: "w-3/4",
  short: "w-1/2",
}

const MARGIN_CLASSES = {
  none: "my-0",
  small: "my-2 md:my-4",
  medium: "my-4 md:my-6",
  large: "my-6 md:my-8",
}

const THICKNESS_MAP = {
  thin: 1,
  medium: 2,
  thick: 4,
}

export function DividerBlock({ block }: DividerBlockProps) {
  const { settings, variant } = block
  const {
    color,
    thickness = 1,
    width = "full",
    margin = "medium",
  } = settings

  const dividerStyle = variant || "solid"
  const actualThickness = typeof thickness === "number" 
    ? thickness 
    : THICKNESS_MAP[thickness as keyof typeof THICKNESS_MAP] || 1

  // Gradient variant uses a different approach
  if (dividerStyle === "gradient") {
    return (
      <div
        className={cn(
          "mx-auto",
          WIDTH_CLASSES[width as keyof typeof WIDTH_CLASSES],
          MARGIN_CLASSES[margin as keyof typeof MARGIN_CLASSES],
        )}
        style={{ height: actualThickness }}
        role="separator"
        aria-orientation="horizontal"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: color 
              ? `linear-gradient(90deg, transparent, ${color}, transparent)`
              : "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)",
          }}
        />
      </div>
    )
  }

  return (
    <hr
      className={cn(
        "border-t mx-auto",
        STYLE_CLASSES[dividerStyle as keyof typeof STYLE_CLASSES],
        WIDTH_CLASSES[width as keyof typeof WIDTH_CLASSES],
        MARGIN_CLASSES[margin as keyof typeof MARGIN_CLASSES],
      )}
      style={{
        borderColor: color || undefined,
        borderTopWidth: actualThickness,
      }}
      role="separator"
      aria-orientation="horizontal"
    />
  )
}
