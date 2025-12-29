"use client"

import { useReportWebVitals } from "next/web-vitals"

/**
 * Web Vitals Analytics Component
 * 
 * Tracks Core Web Vitals metrics:
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - INP (Interaction to Next Paint)
 * 
 * @see https://nextjs.org/docs/app/guides/analytics
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      })
    }

    // Send to analytics endpoint
    sendToAnalytics(metric)
  })

  return null
}

/**
 * Send metrics to analytics service
 * Uses sendBeacon for reliability, falls back to fetch
 */
function sendToAnalytics(metric: {
  id: string
  name: string
  value: number
  rating?: string
  delta?: number
  navigationType?: string
}) {
  const body = JSON.stringify({
    ...metric,
    page: typeof window !== "undefined" ? window.location.pathname : "",
    timestamp: Date.now(),
  })

  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
    return
  }

  const url = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || "/api/analytics/vitals"

  // Use sendBeacon for reliability (doesn't block page unload)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else if (typeof fetch !== "undefined") {
    fetch(url, {
      body,
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // Silently fail - analytics shouldn't break the app
    })
  }
}

/**
 * Google Analytics integration
 * Call this if you have GA4 set up
 */
export function sendToGoogleAnalytics(metric: {
  id: string
  name: string
  value: number
}) {
  if (typeof window === "undefined" || !("gtag" in window)) return

  const gtag = (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag

  gtag("event", metric.name, {
    // Google Analytics metrics must be integers
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    // Unique ID for this particular metric instance
    event_label: metric.id,
    // Avoid affecting bounce rate
    non_interaction: true,
  })
}

/**
 * Vercel Analytics integration
 * Automatically works if @vercel/analytics is installed
 */
export function sendToVercelAnalytics(metric: {
  name: string
  value: number
}) {
  // Vercel Analytics auto-captures Web Vitals when installed
  // This is a manual fallback if needed
  if (typeof window === "undefined") return

  const vercelAnalytics = (window as typeof window & { va?: (event: string, data: unknown) => void }).va
  if (vercelAnalytics) {
    vercelAnalytics("vitals", {
      metric: metric.name,
      value: metric.value,
    })
  }
}
