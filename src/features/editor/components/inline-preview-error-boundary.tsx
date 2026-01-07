"use client"

import React, { Component, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

interface InlinePreviewErrorBoundaryProps {
  children: ReactNode
  onError?: () => void
  onRetry?: () => void
}

interface InlinePreviewErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * InlinePreviewErrorBoundary catches render errors in InlinePreview
 * and displays an error message while triggering fallback to iframe preview.
 * 
 * Requirements: 11.5 - IF the inline preview fails to render, 
 * THE Visual_Editor SHALL fall back to iframe preview mode
 */
export class InlinePreviewErrorBoundary extends Component<
  InlinePreviewErrorBoundaryProps,
  InlinePreviewErrorBoundaryState
> {
  constructor(props: InlinePreviewErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): InlinePreviewErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error for debugging
    console.error("InlinePreview render error:", error, errorInfo)
    
    // Call onError callback to trigger fallback to iframe preview
    if (this.props.onError) {
      this.props.onError()
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <HugeiconsIcon 
              icon={AlertCircleIcon} 
              className="h-8 w-8 text-destructive" 
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Preview failed to render</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              An error occurred while rendering the inline preview. 
              Switching to iframe preview mode for a more stable experience.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/70 font-mono mt-2 p-2 bg-muted rounded">
                {this.state.error.message}
              </p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={this.handleRetry}
            className="gap-2"
          >
            <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default InlinePreviewErrorBoundary
