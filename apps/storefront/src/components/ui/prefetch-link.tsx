"use client"

import Link, { LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { useState, forwardRef, type ComponentProps } from "react"
import { cn } from "@/shared/utils"

/**
 * HoverPrefetchLink - Only prefetches on hover
 * 
 * Use for large lists (product grids, infinite scroll tables) where
 * prefetching all links in viewport would be wasteful.
 * 
 * @example
 * ```tsx
 * // Product grid with many items
 * {products.map(product => (
 *   <HoverPrefetchLink key={product.id} href={`/products/${product.slug}`}>
 *     {product.name}
 *   </HoverPrefetchLink>
 * ))}
 * ```
 */
export const HoverPrefetchLink = forwardRef<
  HTMLAnchorElement,
  ComponentProps<typeof Link>
>(({ children, className, ...props }, ref) => {
  const [active, setActive] = useState(false)

  return (
    <Link
      ref={ref}
      {...props}
      prefetch={active ? undefined : false}
      onMouseEnter={() => setActive(true)}
      className={className}
    >
      {children}
    </Link>
  )
})

HoverPrefetchLink.displayName = "HoverPrefetchLink"

/**
 * NoPrefetchLink - Never prefetches
 * 
 * Use for low-priority links like footer navigation where
 * prefetching is unnecessary.
 * 
 * @example
 * ```tsx
 * // Footer links
 * <NoPrefetchLink href="/privacy">Privacy Policy</NoPrefetchLink>
 * <NoPrefetchLink href="/terms">Terms of Service</NoPrefetchLink>
 * ```
 */
export const NoPrefetchLink = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentProps<typeof Link>, "prefetch">
>(({ children, className, ...props }, ref) => {
  return (
    <Link ref={ref} {...props} prefetch={false} className={className}>
      {children}
    </Link>
  )
})

NoPrefetchLink.displayName = "NoPrefetchLink"

/**
 * ManualPrefetchLink - Prefetches on mount
 * 
 * Use when you need to ensure a route is prefetched immediately
 * when the component mounts, regardless of viewport visibility.
 * 
 * @example
 * ```tsx
 * // Critical navigation that should always be ready
 * <ManualPrefetchLink href="/dashboard">Dashboard</ManualPrefetchLink>
 * ```
 */
export function ManualPrefetchLink({
  href,
  children,
  className,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  const router = useRouter()
  const [hasPrefetched, setHasPrefetched] = useState(false)

  // Prefetch on mount
  if (!hasPrefetched && typeof window !== "undefined") {
    router.prefetch(href)
    setHasPrefetched(true)
  }

  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        router.push(href)
      }}
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}

/**
 * PrefetchOnVisible - Prefetches when element enters viewport
 * 
 * Use for below-the-fold content that should prefetch when scrolled into view.
 * 
 * @example
 * ```tsx
 * <PrefetchOnVisible href="/features">
 *   Learn about features
 * </PrefetchOnVisible>
 * ```
 */
export const PrefetchOnVisible = forwardRef<
  HTMLAnchorElement,
  ComponentProps<typeof Link> & { rootMargin?: string }
>(({ children, className, href, rootMargin = "100px", ...props }, ref) => {
  const router = useRouter()
  const [hasPrefetched, setHasPrefetched] = useState(false)

  return (
    <Link
      ref={(node) => {
        // Handle forwarded ref
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node

        // Set up intersection observer
        if (node && !hasPrefetched && typeof IntersectionObserver !== "undefined") {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0]?.isIntersecting) {
                router.prefetch(typeof href === "string" ? href : href.pathname || "")
                setHasPrefetched(true)
                observer.disconnect()
              }
            },
            { rootMargin }
          )
          observer.observe(node)
        }
      }}
      href={href}
      prefetch={false}
      className={className}
      {...props}
    >
      {children}
    </Link>
  )
})

PrefetchOnVisible.displayName = "PrefetchOnVisible"

/**
 * CardPrefetchLink - Prefetches when hovering anywhere on parent card
 * 
 * Use for product cards where the entire card should trigger prefetch.
 * 
 * @example
 * ```tsx
 * <div onMouseEnter={() => prefetch("/product/123")}>
 *   <CardPrefetchLink href="/product/123">
 *     <ProductCard />
 *   </CardPrefetchLink>
 * </div>
 * ```
 */
export function useCardPrefetch(href: string) {
  const router = useRouter()
  const [hasPrefetched, setHasPrefetched] = useState(false)

  const prefetch = () => {
    if (!hasPrefetched) {
      router.prefetch(href)
      setHasPrefetched(true)
    }
  }

  return { prefetch, hasPrefetched }
}
