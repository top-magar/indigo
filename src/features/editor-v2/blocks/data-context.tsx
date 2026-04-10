"use client"
import { createContext, useContext } from "react"

export type BlockMode = "editor" | "live"

interface BlockCtx { mode: BlockMode; slug: string }

const Ctx = createContext<BlockCtx>({ mode: "editor", slug: "" })

export const BlockModeProvider = Ctx.Provider
export const useBlockMode = () => useContext(Ctx)
