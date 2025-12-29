"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavigationProgressProps {
  /**
   * Color of the progress bar
   * @default "hsl(var(--primary))"
   */
  color?: string
  /**
   * Height of the progress bar in pixels
   * @default 3
   */
  height?: number
  /**
   * Delay before showing the progress bar (ms)
   * @default 100
   */
  delay?: number
  /**
   * Z-index of the progress bar
   * @default 9999
   */
  zIndex?: number
}

/**
 * Global navigation progress bar that shows during route transitions.
 * Add this to your root layout for app-wide navigation feedback.
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <NavigationProgress />
 * ```
 */
export function NavigationProgress({
  color = "hsl(var(--primary))",
  height = 3,
  delay = 100,
  zIndex = 9999,
}: NavigationProgressProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Reset on route change
    setIsNavigating(false)
    setProgress(0)
  }, [pathname, searchParams])

  useEffect(() => {
    if (!isNavigating) return

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(30), 100)
    const timer2 = setTimeout(() => setProgress(60), 300)
    const timer3 = setTimeout(() => setProgress(80), 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isNavigating])

  // Listen for navigation start via click events on links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      if (!link) return
      
      const href = link.getAttribute("href")
      if (!href) return
      
      // Skip external links, hash links, and same-page links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank"
      ) {
        return
      }

      // Check if it's a different route
      const url = new URL(href, window.location.origin)
      if (url.pathname !== pathname || url.search !== searchParams.toString()) {
        // Delay showing progress to avoid flash for fast navigations
        const timer = setTimeout(() => {
          setIsNavigating(true)
          setProgress(10)
        }, delay)

        // Clean up if navigation completes quickly
        return () => clearTimeout(timer)
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [pathname, searchParams, delay])

  if (!isNavigating || progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 pointer-events-none"
      style={{ zIndex }}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-out",
          progress === 100 && "opacity-0"
        )}
        style={{
          height,
          width: `${progress}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}, 0 0 5px ${color}`,
        }}
      />
    </div>
  )
}
