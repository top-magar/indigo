import { NextRequest, NextResponse } from "next/server"

/**
 * Web Vitals Analytics Endpoint
 * 
 * Receives Core Web Vitals metrics from the client.
 * In production, you would store these in a database or
 * forward to an analytics service.
 * 
 * @see https://nextjs.org/docs/app/guides/analytics
 */

interface WebVitalMetric {
  id: string
  name: "TTFB" | "FCP" | "LCP" | "FID" | "CLS" | "INP"
  value: number
  rating?: "good" | "needs-improvement" | "poor"
  delta?: number
  navigationType?: string
  page?: string
  timestamp?: number
}

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json()

    // Validate required fields
    if (!metric.name || typeof metric.value !== "number") {
      return NextResponse.json(
        { error: "Invalid metric data" },
        { status: 400 }
      )
    }

    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Web Vital received:", {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        page: metric.page,
      })
    }

    // In production, you would:
    // 1. Store in database for historical analysis
    // 2. Forward to analytics service (DataDog, New Relic, etc.)
    // 3. Aggregate for dashboards
    
    // Example: Store in database
    // await db.insert(webVitalsMetrics).values({
    //   metricId: metric.id,
    //   name: metric.name,
    //   value: metric.value,
    //   rating: metric.rating,
    //   page: metric.page,
    //   timestamp: new Date(metric.timestamp || Date.now()),
    // })

    // Example: Forward to external service
    // await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
    //   method: "POST",
    //   body: JSON.stringify(metric),
    //   headers: { "Content-Type": "application/json" },
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Analytics] Error processing metric:", error)
    return NextResponse.json(
      { error: "Failed to process metric" },
      { status: 500 }
    )
  }
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "web-vitals" })
}
