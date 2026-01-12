"use client"

import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/shared/utils"
import type { AutosaveStatus } from "@/features/editor/types"

interface SaveButtonProps {
  // Manual save state
  saveStatus: "idle" | "saving" | "saved" | "error"
  onSave: () => void
  isDirty: boolean
  isPending: boolean
  lastSaved: Date | null
  // Autosave state
  autosaveStatus: AutosaveStatus
  autosaveLastSavedAt: Date | null
  autosaveError: string | null
  onAutosaveRetry: () => void
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 10) return "just now"
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/**
 * SaveButton with ambient autosave indicator.
 * 
 * The button itself shows the save state through:
 * - A subtle progress ring around the button when autosaving
 * - Color changes to indicate success/error
 * - Tooltip shows detailed status and last saved time
 * 
 * This replaces the separate text-based autosave indicators.
 */
export const SaveButton = forwardRef<HTMLButtonElement, SaveButtonProps>(
  function SaveButton(
    {
      saveStatus,
      onSave,
      isDirty,
      isPending,
      lastSaved,
      autosaveStatus,
      autosaveLastSavedAt,
      autosaveError,
      onAutosaveRetry,
    },
    ref
  ) {
    // Determine the effective last saved time (manual or auto)
    const effectiveLastSaved = lastSaved || autosaveLastSavedAt
    
    // Determine if we're in any saving state
    const isSaving = saveStatus === "saving" || autosaveStatus === "saving"
    const hasError = saveStatus === "error" || autosaveStatus === "error"
    const justSaved = saveStatus === "saved" || autosaveStatus === "saved"
    
    // Determine if autosave is pending (debouncing)
    const isAutosavePending = autosaveStatus === "pending"

    // Build tooltip content
    const getTooltipContent = () => {
      if (hasError) {
        return (
          <div className="space-y-1">
            <div className="font-medium text-destructive">Save failed</div>
            <div className="text-xs text-muted-foreground">
              {autosaveError || "Click to retry"}
            </div>
          </div>
        )
      }
      if (isSaving) {
        return "Saving…"
      }
      if (!isDirty && effectiveLastSaved) {
        return (
          <div className="space-y-1">
            <div>All changes saved</div>
            <div className="text-xs text-muted-foreground">
              Last saved {formatRelativeTime(effectiveLastSaved)}
            </div>
          </div>
        )
      }
      if (isDirty && isAutosavePending) {
        return (
          <div className="space-y-1">
            <div>Unsaved changes</div>
            <div className="text-xs text-muted-foreground">
              Auto-saving soon...
            </div>
          </div>
        )
      }
      if (isDirty) {
        return "Save changes (⌘S)"
      }
      return "No changes to save"
    }

    // Handle click - retry on error, otherwise save
    const handleClick = () => {
      if (hasError) {
        onAutosaveRetry()
      } else {
        onSave()
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {/* Progress ring for autosave pending/saving states */}
            {(isAutosavePending || (autosaveStatus === "saving" && saveStatus !== "saving")) && (
              <svg
                className="absolute -inset-0.5 w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none"
                viewBox="0 0 100 36"
                preserveAspectRatio="none"
              >
                <rect
                  x="1"
                  y="1"
                  width="98"
                  height="34"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    "text-primary/30",
                    autosaveStatus === "saving" && "text-primary animate-pulse"
                  )}
                  strokeDasharray={isAutosavePending ? "8 4" : "none"}
                  strokeDashoffset="0"
                >
                  {isAutosavePending && (
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;-12"
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  )}
                </rect>
              </svg>
            )}
            
            <Button
              ref={ref}
              variant={hasError ? "destructive" : justSaved && !isDirty ? "outline" : "outline"}
              size="sm"
              className={cn(
                "h-8 gap-1.5 min-w-[80px] transition-all duration-200",
                // Success state - subtle green tint
                justSaved && !isDirty && "border-[var(--ds-green-300)] bg-[var(--ds-green-100)]/50 text-[var(--ds-green-800)] hover:bg-[var(--ds-green-100)]",
                // Error state
                hasError && "border-destructive/50",
                // Pending autosave - subtle indicator
                isAutosavePending && isDirty && "border-primary/50"
              )}
              onClick={handleClick}
              disabled={(!isDirty && !hasError) || isPending}
            >
              {/* Icon */}
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : hasError ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : justSaved && !isDirty ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : null}
              
              {/* Label */}
              <span>
                {isSaving ? "Saving" : hasError ? "Retry" : justSaved && !isDirty ? "Saved" : "Save"}
              </span>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    )
  }
)
