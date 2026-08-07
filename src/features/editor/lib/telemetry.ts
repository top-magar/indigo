import "server-only"
import { SpanStatusCode, trace } from "@opentelemetry/api"

/**
 * Editor telemetry.
 *
 * The editor previously emitted no spans at all, which left the two most
 * consequential code paths — the compare-and-swap draft save and page lease
 * acquisition — completely unobservable. Neither has unit tests either, so
 * until now the only signal that concurrency control worked was that nobody
 * had complained.
 *
 * These spans exist to answer operational questions that decide whether the
 * editor is safe to sell:
 *   - what fraction of saves come back `conflict`?
 *   - how often do two editors contend for the same page lease?
 *   - are saves failing outright, and with what error?
 *
 * Attribute names are namespaced `editor.*` so they can be turned into
 * dashboards without colliding with the `tenant.id` attributes already emitted
 * by withTenant() in infrastructure/db.ts.
 */

/** Attribute values accepted by the OpenTelemetry API. */
type SpanAttrs = Record<string, string | number | boolean>

const tracer = trace.getTracer("indigo.editor")

/**
 * Run an editor operation inside a span.
 *
 * `describe` maps the resolved value to outcome attributes. Editor actions
 * return discriminated results rather than throwing, so without it a failed
 * save and a successful one would look identical in traces.
 */
export async function withEditorSpan<T>(
  name: string,
  attributes: SpanAttrs,
  run: () => Promise<T>,
  describe?: (result: T) => SpanAttrs,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await run()
      if (describe) span.setAttributes(describe(result))
      return result
    } catch (error) {
      recordEditorError(error)
      throw error
    } finally {
      span.end()
    }
  })
}

/**
 * Attach an exception to the current span.
 *
 * Used where an action deliberately swallows a throw and returns a friendly
 * result instead — the user-facing message stays unchanged, but the underlying
 * error stops disappearing silently.
 */
export function recordEditorError(error: unknown): void {
  const span = trace.getActiveSpan()
  if (!span) return
  span.recordException(error instanceof Error ? error : new Error(String(error)))
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error instanceof Error ? error.message : String(error),
  })
}
