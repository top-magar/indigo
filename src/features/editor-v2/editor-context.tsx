"use client"

import { createContext, useContext } from "react"

const Ctx = createContext<{ tenantId: string; pageId: string }>({ tenantId: "", pageId: "" })

export const EditorV2Provider = Ctx.Provider

export const useEditorV2Context = () => useContext(Ctx)
