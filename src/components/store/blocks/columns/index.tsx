"use client"

import { cn } from "@/lib/utils"
import type { ColumnsBlock as ColumnsBlockType, ColumnBlock as ColumnBlockType } from "@/types/blocks"

// ============================================================================
// COLUMNS BLOCK
// ============================================================================

interface ColumnsBlockProps {
  block: ColumnsBlockType
  children?: React.ReactNode
}

const GAP_MAP = {
  none: "gap-0",
  small: "gap-2 md:gap-4",
  medium: "gap-4 md:gap-6",
  large: "gap-6 md:gap-8",
}

const VERTICAL_ALIGN_MAP = {
  top: "items-start",
  center: "items-center",
  bottom: "items-end",
  stretch: "items-stretch",
}

export function ColumnsBlock({ block, children }: ColumnsBlockProps) {
  const { settings, variant } = block
  const {
    columns = 2,
    gap = "medium",
    verticalAlign = "stretch",
    reverseOnMobile = false,
    stackOnMobile = true,
  } = settings

  // Column count classes
  const columnClasses = {
    2: stackOnMobile ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2",
    3: stackOnMobile ? "grid-cols-1 md:grid-cols-3" : "grid-cols-3",
    4: stackOnMobile ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-4",
  }

  // Variant-specific column distributions
  const variantClasses = {
    equal: "",
    "left-heavy": "md:[grid-template-columns:2fr_1fr]",
    "right-heavy": "md:[grid-template-columns:1fr_2fr]",
    "sidebar-left": "md:[grid-template-columns:280px_1fr]",
    "sidebar-right": "md:[grid-template-columns:1fr_280px]",
  }

  return (
    <div
      className={cn(
        "grid w-full",
        columnClasses[columns as keyof typeof columnClasses],
        GAP_MAP[gap],
        VERTICAL_ALIGN_MAP[verticalAlign],
        variantClasses[variant as keyof typeof variantClasses],
        reverseOnMobile && stackOnMobile && "flex-col-reverse md:flex-row md:grid",
      )}
    >
      {children}
    </div>
  )
}

// ============================================================================
// COLUMN BLOCK
// ============================================================================

interface ColumnBlockProps {
  block: ColumnBlockType
  children?: React.ReactNode
}

const COLUMN_PADDING_MAP = {
  none: "",
  small: "p-2 md:p-4",
  medium: "p-4 md:p-6",
  large: "p-6 md:p-8",
}

const COLUMN_VERTICAL_ALIGN_MAP = {
  top: "justify-start",
  center: "justify-center",
  bottom: "justify-end",
}

const COLUMN_WIDTH_MAP = {
  auto: "",
  "1/4": "md:col-span-1",
  "1/3": "md:col-span-1",
  "1/2": "md:col-span-1",
  "2/3": "md:col-span-2",
  "3/4": "md:col-span-3",
}

export function ColumnBlock({ block, children }: ColumnBlockProps) {
  const { settings } = block
  const {
    width = "auto",
    padding = "none",
    backgroundColor,
    verticalAlign = "top",
  } = settings

  return (
    <div
      className={cn(
        "flex flex-col",
        COLUMN_PADDING_MAP[padding],
        COLUMN_VERTICAL_ALIGN_MAP[verticalAlign],
        COLUMN_WIDTH_MAP[width as keyof typeof COLUMN_WIDTH_MAP],
      )}
      style={{
        backgroundColor: backgroundColor || undefined,
      }}
    >
      {children}
    </div>
  )
}
