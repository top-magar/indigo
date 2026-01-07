/**
 * Global Styles Sync Hook
 * 
 * Handles loading and saving global styles to/from the server.
 * Integrates with the GlobalStylesStore and server actions.
 */

"use client"

import { useEffect, useCallback, useRef } from "react"
import { useGlobalStylesStore, selectIsDirty } from "@/features/editor/global-styles/store"
import { saveGlobalStyles, loadGlobalStyles } from "@/app/(editor)/storefront/actions"
import type { GlobalStyles } from "@/features/editor/global-styles/types"
import { toast } from "sonner"

interface UseGlobalStylesSyncOptions {
  tenantId: string
  storeSlug: string
  /** Auto-save debounce delay in ms (default: 2000) */
  debounceMs?: number
  /** Enable auto-save (default: true) */
  autoSave?: boolean
}

interface UseGlobalStylesSyncReturn {
  /** Manually save global styles */
  save: () => Promise<boolean>
  /** Manually load global styles from server */
  load: () => Promise<boolean>
  /** Whether a save is in progress */
  isSaving: boolean
  /** Whether initial load is in progress */
  isLoading: boolean
  /** Last save error, if any */
  error: string | null
}

export function useGlobalStylesSync({
  tenantId,
  storeSlug,
  debounceMs = 2000,
  autoSave = true,
}: UseGlobalStylesSyncOptions): UseGlobalStylesSyncReturn {
  const isDirty = useGlobalStylesStore(selectIsDirty)
  const styles = useGlobalStylesStore((s) => s.styles)
  const setStyles = useGlobalStylesStore((s) => s.setStyles)
  const markClean = useGlobalStylesStore((s) => s.markClean)

  const isSavingRef = useRef(false)
  const isLoadingRef = useRef(false)
  const errorRef = useRef<string | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialLoadDoneRef = useRef(false)

  // Load global styles on mount
  useEffect(() => {
    if (initialLoadDoneRef.current) return
    initialLoadDoneRef.current = true

    const loadStyles = async () => {
      isLoadingRef.current = true
      try {
        const result = await loadGlobalStyles(tenantId)
        if (result.success && result.data?.styles) {
          setStyles(result.data.styles)
          markClean()
        }
      } catch (err) {
        console.error("[GlobalStylesSync] Failed to load:", err)
        errorRef.current = err instanceof Error ? err.message : "Failed to load styles"
      } finally {
        isLoadingRef.current = false
      }
    }

    loadStyles()
  }, [tenantId, setStyles, markClean])

  // Save function
  const save = useCallback(async (): Promise<boolean> => {
    if (isSavingRef.current) return false

    isSavingRef.current = true
    errorRef.current = null

    try {
      const result = await saveGlobalStyles(tenantId, storeSlug, styles)
      if (result.success) {
        markClean()
        return true
      } else {
        errorRef.current = result.error || "Failed to save styles"
        toast.error("Failed to save styles", { description: result.error })
        return false
      }
    } catch (err) {
      console.error("[GlobalStylesSync] Save error:", err)
      errorRef.current = err instanceof Error ? err.message : "Failed to save styles"
      toast.error("Failed to save styles")
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [tenantId, storeSlug, styles, markClean])

  // Load function
  const load = useCallback(async (): Promise<boolean> => {
    if (isLoadingRef.current) return false

    isLoadingRef.current = true
    errorRef.current = null

    try {
      const result = await loadGlobalStyles(tenantId)
      if (result.success && result.data?.styles) {
        setStyles(result.data.styles)
        markClean()
        return true
      } else if (result.success) {
        // No styles saved yet, that's okay
        return true
      } else {
        errorRef.current = result.error || "Failed to load styles"
        return false
      }
    } catch (err) {
      console.error("[GlobalStylesSync] Load error:", err)
      errorRef.current = err instanceof Error ? err.message : "Failed to load styles"
      return false
    } finally {
      isLoadingRef.current = false
    }
  }, [tenantId, setStyles, markClean])

  // Auto-save when dirty
  useEffect(() => {
    if (!autoSave || !isDirty) return

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounced save
    debounceTimerRef.current = setTimeout(() => {
      save()
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isDirty, autoSave, debounceMs, save, styles])

  return {
    save,
    load,
    isSaving: isSavingRef.current,
    isLoading: isLoadingRef.current,
    error: errorRef.current,
  }
}
