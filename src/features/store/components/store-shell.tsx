"use client"

import type { ReactNode } from "react"

interface StoreShellProps {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
  storeSlug: string
}

/** Wraps all store pages with header/footer. */
export function StoreShell({ header, footer, children }: StoreShellProps) {
  return (
    <div className="store-theme flex min-h-screen flex-col">
      {header}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      {footer}
    </div>
  )
}
