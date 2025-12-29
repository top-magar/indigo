/**
 * OpenTelemetry Utilities
 * 
 * Helper functions for creating custom spans and adding telemetry
 * to your application code.
 * 
 * @see https://nextjs.org/docs/app/guides/open-telemetry
 * 
 * @example
 * // Wrap an async function with tracing
 * const result = await withSpan('fetchProducts', async (span) => {
 *   span.setAttribute('tenant.id', tenantId)
 *   return await db.query.products.findMany()
 * })
 * 
 * @example
 * // Add attributes to current span
 * addSpanAttributes({ 'user.id': userId, 'tenant.slug': slug })
 */

import { trace, SpanStatusCode, type Span, type Attributes } from "@opentelemetry/api"

// Get the tracer for the application
const tracer = trace.getTracer("indigo-platform")

/**
 * Execute a function within a traced span
 * 
 * @param name - Name of the span (e.g., 'fetchProducts', 'processOrder')
 * @param fn - Async function to execute within the span
 * @param attributes - Optional attributes to add to the span
 * @returns The result of the function
 */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Attributes
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      // Add initial attributes
      if (attributes) {
        span.setAttributes(attributes)
      }

      // Execute the function
      const result = await fn(span)

      // Mark as successful
      span.setStatus({ code: SpanStatusCode.OK })

      return result
    } catch (error) {
      // Record the error
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      })

      if (error instanceof Error) {
        span.recordException(error)
      }

      throw error
    } finally {
      span.end()
    }
  })
}

/**
 * Execute a synchronous function within a traced span
 */
export function withSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  attributes?: Attributes
): T {
  const span = tracer.startSpan(name)

  try {
    if (attributes) {
      span.setAttributes(attributes)
    }

    const result = fn(span)
    span.setStatus({ code: SpanStatusCode.OK })

    return result
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : "Unknown error",
    })

    if (error instanceof Error) {
      span.recordException(error)
    }

    throw error
  } finally {
    span.end()
  }
}

/**
 * Add attributes to the current active span
 * Useful for adding context without creating a new span
 */
export function addSpanAttributes(attributes: Attributes): void {
  const span = trace.getActiveSpan()
  if (span) {
    span.setAttributes(attributes)
  }
}

/**
 * Add an event to the current active span
 * Events are timestamped annotations within a span
 */
export function addSpanEvent(name: string, attributes?: Attributes): void {
  const span = trace.getActiveSpan()
  if (span) {
    span.addEvent(name, attributes)
  }
}

/**
 * Record an exception on the current active span
 */
export function recordSpanException(error: Error): void {
  const span = trace.getActiveSpan()
  if (span) {
    span.recordException(error)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    })
  }
}

/**
 * Create a traced database query wrapper
 * 
 * @example
 * const products = await tracedQuery('products.findMany', async () => {
 *   return db.query.products.findMany({ where: eq(products.tenantId, tenantId) })
 * }, { 'db.table': 'products', 'tenant.id': tenantId })
 */
export async function tracedQuery<T>(
  operation: string,
  query: () => Promise<T>,
  attributes?: Attributes
): Promise<T> {
  return withSpan(`db.${operation}`, async (span) => {
    span.setAttribute("db.system", "postgresql")
    span.setAttribute("db.operation", operation)

    if (attributes) {
      span.setAttributes(attributes)
    }

    const startTime = performance.now()
    const result = await query()
    const duration = performance.now() - startTime

    span.setAttribute("db.duration_ms", duration)

    return result
  })
}

/**
 * Create a traced external API call wrapper
 * 
 * @example
 * const data = await tracedFetch('stripe.createPaymentIntent', async () => {
 *   return stripe.paymentIntents.create({ amount: 1000, currency: 'usd' })
 * }, { 'payment.amount': 1000 })
 */
export async function tracedFetch<T>(
  operation: string,
  fetchFn: () => Promise<T>,
  attributes?: Attributes
): Promise<T> {
  return withSpan(`external.${operation}`, async (span) => {
    span.setAttribute("http.request.method", "POST")

    if (attributes) {
      span.setAttributes(attributes)
    }

    const startTime = performance.now()
    const result = await fetchFn()
    const duration = performance.now() - startTime

    span.setAttribute("http.duration_ms", duration)

    return result
  })
}

/**
 * Tenant-aware span wrapper
 * Automatically adds tenant context to spans
 */
export async function withTenantSpan<T>(
  name: string,
  tenantId: string,
  tenantSlug: string,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  return withSpan(name, fn, {
    "tenant.id": tenantId,
    "tenant.slug": tenantSlug,
  })
}
