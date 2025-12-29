"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * Page View Tracker
 * 
 * Tracks page views on client-side navigation.
 * Uses useEffect to avoid triggering during prefetch.
 * 
 * @see https://nextjs.org/docs/app/guides/analytics#triggering-unwanted-side-effects-during-prefetching
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Construct full URL
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    // Track page view
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}

/**
 * Track a page view
 */
function trackPageView(url: string) {
  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    console.log("[Analytics] Page view:", url)
    return
  }

  // Google Analytics
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag
    gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
      page_path: url,
    })
  }

  // Custom analytics endpoint
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics/pageview",
      JSON.stringify({
        url,
        referrer: document.referrer,
        timestamp: Date.now(),
      })
    )
  }
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>
) {
  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    console.log("[Analytics] Event:", eventName, eventData)
    return
  }

  // Google Analytics
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag
    gtag("event", eventName, eventData)
  }

  // Custom analytics endpoint
  if (typeof fetch !== "undefined") {
    fetch("/api/analytics/event", {
      method: "POST",
      body: JSON.stringify({
        event: eventName,
        data: eventData,
        page: typeof window !== "undefined" ? window.location.pathname : "",
        timestamp: Date.now(),
      }),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {
      // Silently fail
    })
  }
}
