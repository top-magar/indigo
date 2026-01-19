"use client"

/**
 * Shared useAutosave Hook
 * 
 * React hook wrapper around AutosaveService for use in components.
 * Can be used by the Visual Editor and other components.
 */

import { useEffect, useRef, useCallback, useState } from "react"
import { AutosaveService } from "./autosave-service"
import type { AutosaveConfig, AutosaveState, AutosaveStatus } from "./types"

export interface UseAutosaveOptions {
  /** Function to perform the save operation */
  onSave: () => Promise<void>
  /** Whether the document has unsaved changes */
  isDirty: boolean
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number
  /** Whether autosave is enabled (default: true) */
  enabled?: boolean
  /** Called when save succeeds */
  onSaveSuccess?: () => void
  /** Called when save fails */
  onSaveError?: (error: string) => void
}

export interface UseAutosaveReturn {
  /** Current autosave status */
  status: AutosaveStatus
  /** Last successful save timestamp */
  lastSavedAt: Date | null
  /** Error message if save failed */
  error: string | null
  /** Manually trigger a save (bypasses debounce) */
  saveNow: () => Promise<void>
  /** Cancel any pending autosave */
  cancel: () => void
  /** Retry a failed save */
  retry: () => Promise<void>
  /** Whether a save is currently in progress */
  isSaving: boolean
  /** Whether there's a pending autosave */
  isPending: boolean
}

export function useAutosave({
  onSave,
  isDirty,
  debounceMs = 2000,
  maxRetries = 3,
  enabled = true,
  onSaveSuccess,
  onSaveError,
}: UseAutosaveOptions): UseAutosaveReturn {
  const [state, setState] = useState<AutosaveState>({
    status: "idle",
    lastSavedAt: null,
    error: null,
    retryCount: 0,
  })

  // Keep refs to avoid stale closures
  const onSaveRef = useRef(onSave)
  const onSaveSuccessRef = useRef(onSaveSuccess)
  const onSaveErrorRef = useRef(onSaveError)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess
  }, [onSaveSuccess])

  useEffect(() => {
    onSaveErrorRef.current = onSaveError
  }, [onSaveError])

  // Create service instance
  const serviceRef = useRef<AutosaveService | null>(null)

  useEffect(() => {
    serviceRef.current = new AutosaveService(
      {
        onSave: () => onSaveRef.current(),
        onStatusChange: setState,
        onSaveSuccess: () => onSaveSuccessRef.current?.(),
        onSaveError: (error) => onSaveErrorRef.current?.(error),
      },
      {
        debounceMs,
        maxRetries,
        enabled,
      }
    )

    return () => {
      serviceRef.current?.stop()
    }
  }, [debounceMs, maxRetries, enabled])

  // Trigger autosave when isDirty changes to true
  useEffect(() => {
    if (isDirty && enabled) {
      serviceRef.current?.trigger()
    }
  }, [isDirty, enabled])

  const saveNow = useCallback(async () => {
    await serviceRef.current?.saveNow()
  }, [])

  const cancel = useCallback(() => {
    serviceRef.current?.cancel()
  }, [])

  const retry = useCallback(async () => {
    await serviceRef.current?.retry()
  }, [])

  return {
    status: state.status,
    lastSavedAt: state.lastSavedAt,
    error: state.error,
    saveNow,
    cancel,
    retry,
    isSaving: state.status === "saving",
    isPending: state.status === "pending",
  }
}

/**
 * Get a human-readable save status message
 */
export function formatSaveStatus(state: {
  status: AutosaveStatus
  lastSavedAt: Date | null
  error: string | null
  isDirty?: boolean
}): string {
  const { status, lastSavedAt, error, isDirty } = state

  if (status === "saving") {
    return "Saving…"
  }

  if (status === "error" && error) {
    return `Save failed: ${error}`
  }

  if (status === "saved" && lastSavedAt) {
    const now = new Date()
    const diff = now.getTime() - lastSavedAt.getTime()

    if (diff < 5000) {
      return "Saved"
    }

    if (diff < 60000) {
      return `Saved ${Math.floor(diff / 1000)}s ago`
    }

    if (diff < 3600000) {
      return `Saved ${Math.floor(diff / 60000)}m ago`
    }

    return `Saved at ${lastSavedAt.toLocaleTimeString()}`
  }

  if (isDirty) {
    return "Unsaved changes"
  }

  return ""
}
