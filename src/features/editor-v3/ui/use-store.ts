"use client"
import { useReducer, useEffect, useCallback, useRef, useSyncExternalStore } from "react"
import { useEditorV3Store } from "../stores/store"
import type { EditorV3Store } from "../stores/store"

/**
 * Subscribe to the full store — re-renders on ANY change.
 * Use only in components that genuinely need the full state (e.g., canvas renderer).
 * Prefer useStoreSelect() for panels/sidebar components.
 */
export function useStore(): EditorV3Store {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => useEditorV3Store.subscribe(forceRender), [])
  return useEditorV3Store.getState()
}

/**
 * Granular selector — only re-renders when the selected value changes.
 * Uses useSyncExternalStore for concurrent-safe subscriptions.
 *
 * Usage:
 *   const selectedId = useStoreSelect(s => s.selectedInstanceId)
 *   const instance = useStoreSelect(s => s.instances.get(someId))
 */
export function useStoreSelect<T>(selector: (state: EditorV3Store) => T, isEqual?: (a: T, b: T) => boolean): T {
  const selectorRef = useRef(selector)
  const isEqualRef = useRef(isEqual)
  selectorRef.current = selector
  isEqualRef.current = isEqual

  const prevRef = useRef<T | undefined>(undefined)

  const getSnapshot = useCallback(() => {
    const next = selectorRef.current(useEditorV3Store.getState())
    const eq = isEqualRef.current ?? Object.is
    if (prevRef.current !== undefined && eq(prevRef.current, next)) {
      return prevRef.current
    }
    prevRef.current = next
    return next
  }, [])

  return useSyncExternalStore(
    useEditorV3Store.subscribe,
    getSnapshot,
    getSnapshot,
  )
}

/**
 * Select multiple values — re-renders only when any selected value changes.
 * Shallow comparison on the result object.
 *
 * Usage:
 *   const { selectedId, zoom } = useStoreMulti(s => ({
 *     selectedId: s.selectedInstanceId,
 *     zoom: s.zoom,
 *   }))
 */
export function useStoreMulti<T extends Record<string, unknown>>(selector: (state: EditorV3Store) => T): T {
  return useStoreSelect(selector, shallowEqual)
}

function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!Object.is(a[key], b[key])) return false
  }
  return true
}
