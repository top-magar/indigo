"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { loadPageAction } from "./actions"
import { useSaveStore } from "./save-store"

interface UsePageManagerProps {
  tenantId: string
  initialPageId: string | null
  initialCraftJson: string | null
}

export function usePageManager({ tenantId, initialPageId, initialCraftJson }: UsePageManagerProps) {
  const [currentPageId, setCurrentPageId] = useState(initialPageId)
  const [currentCraftJson, setCurrentCraftJson] = useState(initialCraftJson)
  const [editorKey, setEditorKey] = useState(0)
  const [switching, setSwitching] = useState(false)
  const serializeRef = useRef<(() => string) | null>(null)

  const handlePageChange = useCallback(async (pageId: string) => {
    setSwitching(true)
    await useSaveStore.getState().save()
    useSaveStore.getState().updatePageId(pageId)
    const result = await loadPageAction(tenantId, pageId)
    setCurrentPageId(pageId)
    setCurrentCraftJson(result.success ? result.craftJson : null)
    setEditorKey((k) => k + 1)
    setSwitching(false)
  }, [tenantId])

  const handleVersionRestore = useCallback(async () => {
    if (!currentPageId) return
    const result = await loadPageAction(tenantId, currentPageId)
    setCurrentCraftJson(result.success ? result.craftJson : null)
    setEditorKey((k) => k + 1)
  }, [tenantId, currentPageId])

  return { currentPageId, currentCraftJson, editorKey, switching, serializeRef, handlePageChange, handleVersionRestore }
}
