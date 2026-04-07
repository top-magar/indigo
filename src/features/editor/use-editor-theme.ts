"use client"

import { useState, useRef } from "react"

export function useEditorTheme(initial: Record<string, unknown> | null) {
  const [liveTheme, setLiveTheme] = useState<Record<string, unknown>>(initial ?? {})
  const themeRef = useRef(liveTheme)
  themeRef.current = liveTheme

  return { liveTheme, setLiveTheme, themeRef }
}
