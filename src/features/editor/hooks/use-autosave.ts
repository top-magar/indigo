// useAutosave Hook - Integrates autosave service with Editor Store
// Requirements: 1.1, 1.2, 1.6

import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore, selectIsDirty, selectAutosaveStatus, selectLastAutosaveAt, selectAutosaveError } from '../store'
import { AutosaveService, createAutosaveService, type AutosaveConfig, type AutosaveState } from '@/shared/autosave'

export interface UseAutosaveOptions {
  /** Function to perform the actual save operation */
  onSave: () => Promise<void>
  /** Autosave configuration */
  config?: Partial<AutosaveConfig>
  /** Whether autosave is enabled */
  enabled?: boolean
}

export interface UseAutosaveReturn {
  /** Current autosave status */
  status: AutosaveState['status']
  /** Timestamp of last successful autosave */
  lastSavedAt: Date | null
  /** Error message if autosave failed */
  error: string | null
  /** Cancel any pending autosave */
  cancel: () => void
  /** Retry a failed autosave */
  retry: () => void
  /** Check if there's a pending autosave */
  isPending: boolean
  /** Check if currently saving */
  isSaving: boolean
}

/**
 * Hook that provides autosave functionality for the editor.
 * 
 * Automatically triggers save after changes with debounce.
 * Integrates with Editor Store for state management.
 * 
 * Requirements:
 * - 1.1: Start debounce timer on changes
 * - 1.2: Save when timer expires
 * - 1.6: Retry on failure with exponential backoff
 */
export function useAutosave({
  onSave,
  config,
  enabled = true,
}: UseAutosaveOptions): UseAutosaveReturn {
  const isDirty = useEditorStore(selectIsDirty)
  const status = useEditorStore(selectAutosaveStatus)
  const lastSavedAt = useEditorStore(selectLastAutosaveAt)
  const error = useEditorStore(selectAutosaveError)
  const setAutosaveStatus = useEditorStore((state) => state.setAutosaveStatus)
  
  const serviceRef = useRef<AutosaveService | null>(null)
  const prevIsDirtyRef = useRef(isDirty)

  // Initialize autosave service
  useEffect(() => {
    if (!enabled) {
      serviceRef.current?.stop()
      serviceRef.current = null
      return
    }

    const service = createAutosaveService(
      {
        onSave,
        onStatusChange: (state: AutosaveState) => {
          setAutosaveStatus(state.status, state.lastSavedAt, state.error)
        },
      },
      config
    )

    serviceRef.current = service

    return () => {
      service.stop()
    }
  }, [onSave, config, enabled, setAutosaveStatus])

  // Watch for dirty state changes and trigger autosave
  useEffect(() => {
    if (!enabled || !serviceRef.current) return

    // Only start autosave when transitioning from clean to dirty
    // or when dirty state persists (additional changes)
    if (isDirty && prevIsDirtyRef.current !== isDirty) {
      serviceRef.current.trigger()
    } else if (isDirty) {
      // Additional changes while already dirty - restart timer
      serviceRef.current.trigger()
    }

    prevIsDirtyRef.current = isDirty
  }, [isDirty, enabled])

  const cancel = useCallback(() => {
    serviceRef.current?.cancel()
  }, [])

  const retry = useCallback(async () => {
    await serviceRef.current?.retry()
  }, [])

  return {
    status,
    lastSavedAt,
    error,
    cancel,
    retry,
    isPending: status === 'pending',
    isSaving: status === 'saving',
  }
}
