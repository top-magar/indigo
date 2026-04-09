"use client"

import { createContext, useContext } from "react"

interface EditorContextValue {
  tenantId: string
  storeSlug: string
  pageId: string | null
  seoInitial: { title: string; description: string; ogImage: string }
}

const EditorContext = createContext<EditorContextValue | null>(null)

export function EditorProvider({ children, ...value }: EditorContextValue & { children: React.ReactNode }) {
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error("useEditorContext must be used within EditorProvider")
  return ctx
}
