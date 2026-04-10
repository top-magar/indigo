"use client"

import { useState, useRef, useEffect, createContext, useContext, type ReactNode } from "react"

interface EditorThemeValue {
  liveTheme: Record<string, unknown>
  setLiveTheme: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
  themeRef: React.RefObject<Record<string, unknown>>
}

const EditorThemeContext = createContext<EditorThemeValue | null>(null)

export function useEditorThemeContext(): EditorThemeValue {
  const ctx = useContext(EditorThemeContext)
  if (!ctx) throw new Error("useEditorThemeContext must be used within EditorThemeProvider")
  return ctx
}

export function EditorThemeProvider({ initial, children }: { initial: Record<string, unknown> | null; children: ReactNode }) {
  const value = useEditorTheme(initial)
  return <EditorThemeContext value={value}>{children}</EditorThemeContext>
}

export function useEditorTheme(initial: Record<string, unknown> | null) {
  const [liveTheme, setLiveTheme] = useState<Record<string, unknown>>(initial ?? {})
  const themeRef = useRef(liveTheme)
  useEffect(() => { themeRef.current = liveTheme }, [liveTheme])

  return { liveTheme, setLiveTheme, themeRef }
}
