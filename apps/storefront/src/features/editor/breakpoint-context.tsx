"use client"

import { createContext, useContext } from "react"

export type Breakpoint = "desktop" | "tablet" | "mobile"

const BreakpointContext = createContext<Breakpoint>("desktop")

export const BreakpointProvider = BreakpointContext.Provider
export const useBreakpoint = () => useContext(BreakpointContext)
