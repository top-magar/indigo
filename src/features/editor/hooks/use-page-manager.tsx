"use client"

import { useState, useCallback, useRef, createContext, useContext, type ReactNode } from "react"
import { loadPageAction } from "../actions/actions"
import { useSaveStore } from "../stores/save-store"

interface PageManagerValue {
  currentPageId: string | null
  currentCraftJson: string | null
  editorKey: number
  switching: boolean
  serializeRef: React.RefObject<(() => string) | null>
  handlePageChange: (pageId: string) => Promise<void>
  handleVersionRestore: () => Promise<void>
}

const PageManagerContext = createContext<PageManagerValue | null>(null)

export function usePageManagerContext(): PageManagerValue {
  const ctx = useContext(PageManagerContext)
  if (!ctx) throw new Error("usePageManagerContext must be used within PageManagerProvider")
  return ctx
}

interface PageManagerProviderProps {
  tenantId: string
  initialPageId: string | null
  initialCraftJson: string | null
  children: ReactNode
}

export function PageManagerProvider({ tenantId, initialPageId, initialCraftJson, children }: PageManagerProviderProps) {
  const value = usePageManager({ tenantId, initialPageId, initialCraftJson })
  return <PageManagerContext value={value}>{children}</PageManagerContext>
}

export function usePageManager({ tenantId, initialPageId, initialCraftJson }: { tenantId: string; initialPageId: string | null; initialCraftJson: string | null }) {
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
