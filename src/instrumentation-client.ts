/**
 * Next.js Client Instrumentation
 * 
 * This file runs on the client side for browser-specific monitoring.
 * Use it to set up client-side analytics, error tracking, and performance monitoring.
 * 
 * @see https://nextjs.org/docs/app/guides/instrumentation
 */

// Web Vitals reporting
export function reportWebVitals(metric: {
  id: string
  name: string
  startTime: number
  value: number
  label: 'web-vital' | 'custom'
}) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value)
  }

  // Send to analytics service
  // Examples: Google Analytics, Vercel Analytics, custom endpoint
  
  // Vercel Analytics (if using @vercel/analytics)
  // import { track } from '@vercel/analytics'
  // track(metric.name, { value: metric.value })

  // Google Analytics
  // window.gtag?.('event', metric.name, {
  //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //   event_label: metric.id,
  //   non_interaction: true,
  // })

  // Custom analytics endpoint
  // fetch('/api/analytics/vitals', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  //   headers: { 'Content-Type': 'application/json' },
  // })
}

// Client-side error boundary logging
if (typeof window !== 'undefined') {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('[Client Error]', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
    
    // Send to error tracking service
    // reportClientError(event.error)
  })

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Rejection]', event.reason)
    
    // Send to error tracking service
    // reportClientError(event.reason)
  })
}
