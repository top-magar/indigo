/**
 * Next.js Client Instrumentation
 * 
 * This file runs on the client side before your application's frontend code starts.
 * Use it for global analytics, error tracking, and performance monitoring.
 * 
 * @see https://nextjs.org/docs/app/guides/analytics
 */

// Initialize analytics before the app starts
if (typeof window !== "undefined") {
  console.log("[Instrumentation] Client initialized")

  // Global error handler
  window.addEventListener("error", (event) => {
    // Ignore ResizeObserver loop errors - they're benign
    if (event.message?.includes("ResizeObserver loop")) {
      return
    }
    
    // Ignore empty error events (often from browser extensions or benign issues)
    if (!event.message && !event.error) {
      return
    }
    
    // Log error details - handle cases where properties might be undefined
    const errorDetails = {
      message: event.message || "Unknown error",
      filename: event.filename || "Unknown file",
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      error: event.error?.toString() || "No error object",
      stack: event.error?.stack || "No stack trace",
    }
    
    // Only log if we have a meaningful error message (not just empty strings)
    const hasContent = (event.message && event.message.trim() !== "") || 
                       (event.error && Object.keys(event.error).length > 0)
    if (hasContent) {
      console.error("[Client Error]", errorDetails)
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      reportError({
        type: "error",
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }
  })

  // Unhandled promise rejection handler
  window.addEventListener("unhandledrejection", (event) => {
    console.error("[Unhandled Rejection]", event.reason)

    // Send to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      reportError({
        type: "unhandledrejection",
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      })
    }
  })
}

/**
 * Report error to analytics/monitoring service
 */
function reportError(error: {
  type: string
  message: string
  stack?: string
  filename?: string
  lineno?: number
  colno?: number
}) {
  // Use sendBeacon for reliability
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics/error",
      JSON.stringify({
        ...error,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      })
    )
  }
}
