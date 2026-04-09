"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { storeHref } from "@/features/store/url"

interface StoreShellProps {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
  storeSlug: string
}

/** Wraps sub-pages with header/footer but skips the homepage (editor provides its own). */
export function StoreShell({ header, footer, children, storeSlug }: StoreShellProps) {
  const pathname = usePathname()
  const isHomepage = pathname === storeHref(storeSlug) || pathname === storeHref(storeSlug, "/")

  if (isHomepage) return <>{children}</>

  // If no header/footer provided (global sections disabled), just render children
  if (!header && !footer) return <>{children}</>

  return (
    <div className="flex min-h-screen flex-col">
      {header}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      {footer}
    </div>
  )
}
