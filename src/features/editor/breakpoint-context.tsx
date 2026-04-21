'use client';
import { createContext, useContext } from 'react';
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
const ctx = createContext<Breakpoint>('base');
export const BreakpointProvider = ({ children }: { children: React.ReactNode }) => children;
export const useBreakpoint = () => useContext(ctx);
export default ctx;
