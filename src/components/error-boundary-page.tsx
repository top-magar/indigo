"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryPageProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  showHomeLink?: boolean
  homeHref?: string
}

/**
 * Reusable error boundary page component
 * 
 * Used across all error.tsx files to provide consistent error UI
 * while reducing code duplication.
 */
export function ErrorBoundaryPage({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  showHomeLink = true,
  homeHref = "/dashboard",
}: ErrorBoundaryPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error boundary caught:", error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-[var(--ds-gray-1000)]">
          {title}
        </h2>
        <p className="text-sm text-[var(--ds-gray-600)] max-w-md">
          {description}
        </p>
        {error.digest && (
          <p className="text-xs text-[var(--ds-gray-500)] font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          onClick={reset}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        
        {showHomeLink && (
          <Button asChild>
            <Link href={homeHref} className="gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
