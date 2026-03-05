/**
 * Structured Logger
 * 
 * Provides leveled, structured logging that:
 * - Respects LOG_LEVEL environment variable
 * - Outputs JSON in production for log aggregation
 * - Outputs human-readable format in development
 * - Includes timestamp, level, and context
 */

type LogLevel = "debug" | "info" | "warn" | "error"

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 
  (process.env.NODE_ENV === "production" ? "info" : "debug")

const isProduction = process.env.NODE_ENV === "production"

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel]
}

function formatMessage(level: LogLevel, module: string, message: string, data?: Record<string, unknown>) {
  if (isProduction) {
    // JSON format for production log aggregation
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      ...data,
    })
  }
  // Human-readable for development
  const prefix = `[${module}]`
  return data ? `${prefix} ${message}` : `${prefix} ${message}`
}

export function createLogger(module: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (shouldLog("debug")) console.debug(formatMessage("debug", module, message, data), data && !isProduction ? data : "")
    },
    info(message: string, data?: Record<string, unknown>) {
      if (shouldLog("info")) console.info(formatMessage("info", module, message, data), data && !isProduction ? data : "")
    },
    warn(message: string, data?: Record<string, unknown>) {
      if (shouldLog("warn")) console.warn(formatMessage("warn", module, message, data), data && !isProduction ? data : "")
    },
    error(message: string, error?: unknown, data?: Record<string, unknown>) {
      if (shouldLog("error")) {
        const errorData = error instanceof Error 
          ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
          : { errorMessage: String(error) }
        console.error(
          formatMessage("error", module, message, { ...errorData, ...data }),
          !isProduction ? error : ""
        )
      }
    },
  }
}
