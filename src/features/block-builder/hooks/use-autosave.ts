"use client"

// Autosave Hook for Block Builder
import { useEffect, useRef } from "react"
import { useBuilderStore } from "./use-builder-store"

interface AutosaveOptions {
  enabled?: boolean
  debounceMs?: number
}

export function useAutosave({ enabled = true, debounceMs = 3000 }: AutosaveOptions = {}) {
  const { isDirty, save } = useBuilderStore()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (!enabled || !isDirty) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for autosave
    timeoutRef.current = setTimeout(() => {
      save()
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isDirty, enabled, debounceMs, save])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
}