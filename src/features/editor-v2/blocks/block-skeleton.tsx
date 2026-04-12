"use client"

import React from "react"

/** Lightweight loading placeholder shown while a block component is lazy-loaded. */
export function BlockSkeleton() {
  return (
    <div className="animate-pulse rounded bg-muted/30 min-h-[48px] w-full" aria-hidden="true" />
  )
}

/** Pre-bound loading option for next/dynamic. Import in .ts files without JSX. */
export const blockLoadingOption = { loading: () => React.createElement(BlockSkeleton) }
