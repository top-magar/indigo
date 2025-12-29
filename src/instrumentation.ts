/**
 * Next.js Instrumentation
 * 
 * This file is called once when a new Next.js server instance is initiated.
 * Use it to set up monitoring, logging, and other observability tools.
 * 
 * @see https://nextjs.org/docs/app/guides/instrumentation
 */

export async function register() {
  // Log server startup
  console.log(`[Instrumentation] Next.js server starting...`)
  console.log(`[Instrumentation] Environment: ${process.env.NODE_ENV}`)
  console.log(`[Instrumentation] Runtime: ${process.env.NEXT_RUNTIME || 'nodejs'}`)

  // Runtime-specific initialization
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await registerNodejsInstrumentation()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await registerEdgeInstrumentation()
  }
}

/**
 * Node.js runtime instrumentation
 * Called only when running in Node.js environment
 */
async function registerNodejsInstrumentation() {
  // Log Node.js specific info - use globalThis to avoid static analysis issues
  // process.version is only available in Node.js, not Edge Runtime
  const nodeProcess = globalThis.process as NodeJS.Process | undefined
  if (nodeProcess?.version) {
    console.log(`[Instrumentation] Node.js version: ${nodeProcess.version}`)
  }
  
  // Database connection warming (optional)
  // Uncomment to pre-warm database connections on server start
  // await warmDatabaseConnections()

  // OpenTelemetry setup (if using @vercel/otel or similar)
  // Uncomment and configure if you want distributed tracing
  // await setupOpenTelemetry()
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
async function warmDatabaseConnections() {
  try {
    // Dynamic import to avoid loading in edge runtime
    const { db } = await import('@/lib/db')
    
    // Simple query to establish connection
    await db.execute('SELECT 1')
    console.log(`[Instrumentation] Database connection warmed`)
  } catch (error) {
    console.error(`[Instrumentation] Failed to warm database:`, error)
  }
}

/**
 * Setup OpenTelemetry for distributed tracing
 * Requires @vercel/otel package
 * 
 * Install: pnpm add @vercel/otel
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry
 */
async function setupOpenTelemetry() {
  try {
    // Uncomment when @vercel/otel is installed
    // const { registerOTel } = await import('@vercel/otel')
    // registerOTel({ serviceName: 'indigo-platform' })
    // console.log(`[Instrumentation] OpenTelemetry registered`)
  } catch (error) {
    console.error(`[Instrumentation] Failed to setup OpenTelemetry:`, error)
  }
}

/**
 * Called when the server is shutting down
 * Use for cleanup tasks
 */
export async function onRequestError(
  err: { digest: string } & Error,
  request: {
    path: string
    method: string
    headers: { [key: string]: string }
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'render' | 'route' | 'action' | 'middleware'
    renderSource: 'react-server-components' | 'react-server-components-payload' | 'server-rendering'
    revalidateReason: 'on-demand' | 'stale' | undefined
    renderType: 'dynamic' | 'dynamic-resume'
  }
) {
  // Log errors for monitoring
  console.error(`[Error] ${context.routeType} error on ${request.path}:`, {
    digest: err.digest,
    message: err.message,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    method: request.method,
  })

  // Send to error tracking service (e.g., Sentry, LogRocket)
  // await reportErrorToService(err, request, context)
}
