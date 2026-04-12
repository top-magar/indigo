"use client"
import { useReducer, useEffect } from "react"
import { useEditorV3Store } from "../stores/store"
import type { EditorV3Store } from "../stores/store"

/**
 * Subscribe to the store and re-render on any change.
 * Returns getState() — safe to read Maps from the result.
 * 
 * This avoids the "getSnapshot must be cached" error that happens
 * when Zustand selectors return new Map/object references.
 */
export function useStore(): EditorV3Store {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => useEditorV3Store.subscribe(forceRender), [])
  return useEditorV3Store.getState()
}
