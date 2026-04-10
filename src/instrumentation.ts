/**
 * Next.js Instrumentation with OpenTelemetry
 * 
 * This file is called once when a new Next.js server instance is initiated.
 * Sets up distributed tracing, monitoring, and observability.
 * 
 * @see https://nextjs.org/docs/app/guides/instrumentation
 * @see https://nextjs.org/docs/app/guides/open-telemetry
 */

import { registerOTel } from "@vercel/otel"
import { initializeServiceProviders } from "@/infrastructure/services/init"
import { validateEnv } from "@/lib/env"
import * as Sentry from "@sentry/nextjs"

export async function register() {
  // Validate environment variables at startup
  validateEnv()

  // Register OpenTelemetry for distributed tracing
  // This works on both Vercel and self-hosted environments
  registerOTel({
    serviceName: "indigo-platform",
    // Optionally configure attributes for all spans
    attributes: {
      "deployment.environment": process.env.NODE_ENV || "development",
    },
  })

  // Log server startup
  console.log(`[Instrumentation] Next.js server starting...`)
  console.log(`[Instrumentation] Environment: ${process.env.NODE_ENV}`)
  console.log(`[Instrumentation] Runtime: ${process.env.NEXT_RUNTIME || "nodejs"}`)
  console.log(`[Instrumentation] OpenTelemetry registered for: indigo-platform`)

  // Runtime-specific initialization
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config")
    await registerNodejsInstrumentation()
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config")
    await registerEdgeInstrumentation()
  }
}

/**
 * Node.js runtime instrumentation
 * Called only when running in Node.js environment
 */
async function registerNodejsInstrumentation() {
  // Log Node.js specific info - use globalThis to avoid static analysis issues
  const nodeProcess = globalThis.process as NodeJS.Process | undefined
  if (nodeProcess?.version) {
    console.log(`[Instrumentation] Node.js version: ${nodeProcess.version}`)
  }

  // Initialize service providers (AWS, local, etc.) - only in Node.js runtime
  await initializeServiceProviders()

  // Database connection warming (optional)
  // Uncomment to pre-warm database connections on server start
  // await warmDatabaseConnections()
}

/**
 * Edge runtime instrumentation
 * Called only when running in Edge environment
 */
async function registerEdgeInstrumentation() {
  console.log(`[Instrumentation] Edge runtime initialized`)
}

/**
 * Pre-warm database connections
 * Reduces cold start latency by establishing connections early
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function warmDatabaseConnections() {
  try {
    const { db } = await import("@/infrastructure/db")
    await db.execute("SELECT 1")
    console.log(`[Instrumentation] Database connection warmed`)
  } catch (error) {
    console.error(`[Instrumentation] Failed to warm database:`, error)
  }
}

export const onRequestError = Sentry.captureRequestError;
