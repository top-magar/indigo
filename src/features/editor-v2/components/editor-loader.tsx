"use client"

import dynamic from "next/dynamic"
import type { Section } from "../store"

const EditorShell = dynamic(() => import("./editor-shell").then((m) => m.EditorShell), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center text-muted-foreground">Loading editor…</div>,
})

interface Props { tenantId: string; pageId: string; initialSections: Section[]; initialTheme?: Record<string, unknown> }

export function EditorLoader({ tenantId, pageId, initialSections, initialTheme }: Props) {
  return <EditorShell tenantId={tenantId} pageId={pageId} initialSections={initialSections} initialTheme={initialTheme} />
}
