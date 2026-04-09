"use client"

import Link from "next/link"
import { useLinkStatus } from "next/link"
import { cn } from "@/shared/utils"
import { Loader2 } from "lucide-react"
import { forwardRef, type ComponentProps } from "react"

interface NavLinkProps extends ComponentProps<typeof Link> {
  /**
   * Show loading indicator while navigating
   * @default true
   */
  showLoadingIndicator?: boolean
  /**
   * Position of the loading indicator
   * @default "right"
   */
  indicatorPosition?: "left" | "right"
  /**
   * Custom loading indicator component
   */
  loadingIndicator?: React.ReactNode
  /**
   * Delay before showing loading indicator (ms)
   * Helps avoid flashing for fast navigations
   * @default 100
   */
  loadingDelay?: number
}

/**
 * Enhanced Link component with navigation status feedback.
 * Shows a loading indicator when navigation is pending.
 * 
 * @example
 * ```tsx
 * <NavLink href="/dashboard">Dashboard</NavLink>
 * <NavLink href="/products" showLoadingIndicator={false}>Products</NavLink>
 * <NavLink href="/settings" indicatorPosition="left">Settings</NavLink>
 * ```
 */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      children,
      className,
      showLoadingIndicator = true,
      indicatorPosition = "right",
      loadingIndicator,
      loadingDelay = 100,
      ...props
    },
    ref
  ) => {
    const { pending } = useLinkStatus()

    const indicator = loadingIndicator ?? (
      <Loader2 
        className={cn(
          "h-3 w-3 animate-spin transition-opacity",
          // Debounce the indicator with CSS animation delay
          "opacity-0",
          pending && "opacity-100",
        )}
        style={{
          transitionDelay: pending ? `${loadingDelay}ms` : "0ms",
        }}
      />
    )

    return (
      <Link ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props}>
        {showLoadingIndicator && indicatorPosition === "left" && pending && indicator}
        {children}
        {showLoadingIndicator && indicatorPosition === "right" && pending && indicator}
      </Link>
    )
  }
)

NavLink.displayName = "NavLink"

/**
 * Hook to get navigation pending state for custom implementations
 */
export { useLinkStatus }
