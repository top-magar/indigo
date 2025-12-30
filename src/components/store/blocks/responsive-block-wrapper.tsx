"use client"

import { memo, type ReactNode } from "react"
import type { ResponsiveVisibility } from "@/types/blocks"
import { cn } from "@/lib/utils"

interface ResponsiveBlockWrapperProps {
  children: ReactNode
  responsiveVisibility?: ResponsiveVisibility
  className?: string
}

/**
 * Get Tailwind CSS classes for responsive visibility.
 */
function getResponsiveVisibilityClasses(visibility?: ResponsiveVisibility): string | null {
  if (!visibility) return null
  
  const { mobile, tablet, desktop } = visibility
  
  // If all are visible (or undefined), no classes needed
  if (mobile !== false && tablet !== false && desktop !== false) {
    return null
  }
  
  const classes: string[] = []
  
  // Mobile visibility (default, no prefix)
  if (mobile === false) {
    classes.push("hidden")
  }
  
  // Tablet visibility (md: prefix, 768px+)
  if (tablet === false) {
    classes.push("md:hidden")
  } else if (mobile === false) {
    classes.push("md:block")
  }
  
  // Desktop visibility (lg: prefix, 1024px+)
  if (desktop === false) {
    classes.push("lg:hidden")
  } else if (tablet === false || mobile === false) {
    classes.push("lg:block")
  }
  
  return classes.length > 0 ? classes.join(" ") : null
}

/**
 * ResponsiveBlockWrapper - Wraps a block component and applies responsive visibility.
 * 
 * Uses Tailwind CSS responsive classes to show/hide blocks based on viewport.
 * - Mobile: default (no prefix)
 * - Tablet: md: prefix (768px+)
 * - Desktop: lg: prefix (1024px+)
 * 
 * Requirements: 10.2 - Blocks can be shown/hidden per viewport
 */
export const ResponsiveBlockWrapper = memo(function ResponsiveBlockWrapper({
  children,
  responsiveVisibility,
  className,
}: ResponsiveBlockWrapperProps) {
  const visibilityClasses = getResponsiveVisibilityClasses(responsiveVisibility)
  
  // If no visibility restrictions, render children directly without wrapper
  if (!visibilityClasses) {
    return <>{children}</>
  }
  
  return (
    <div className={cn(visibilityClasses, className)}>
      {children}
    </div>
  )
})
