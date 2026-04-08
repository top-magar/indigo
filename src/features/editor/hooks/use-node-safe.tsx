"use client"

import { createContext, useContext } from "react"
import { useNode } from "@craftjs/core"

const EditorActiveContext = createContext(false)

/** Wrap the editor canvas with this to signal blocks they're in edit mode */
export const EditorActiveProvider = ({ children }: { children: React.ReactNode }) => (
  <EditorActiveContext.Provider value={true}>{children}</EditorActiveContext.Provider>
)

export const useIsEditor = () => useContext(EditorActiveContext)

const NOOP_CONNECTORS = {
  connect: (el: HTMLElement | null) => el,
  drag: (el: HTMLElement | null) => el,
}

const NOOP_ACTIONS = {
  setProp: (_fn: any) => {},
}

/**
 * Drop-in replacement for useNode() that returns no-ops outside <Editor />.
 * Blocks can use this instead of useNode() to work in both editor and storefront.
 */
export function useNodeOptional(collect?: (node: any) => any) {
  const isEditor = useIsEditor()
  if (!isEditor) {
    return {
      connectors: NOOP_CONNECTORS,
      actions: NOOP_ACTIONS,
      isSelected: false,
      ...(collect ? {} : {}),
    } as any
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useNode(collect)
}
