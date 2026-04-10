"use client"

import dynamic from "next/dynamic"
import type { Section } from "../store"

const EditorShell = dynamic(() => import("./editor-shell").then((m) => m.EditorShell), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center text-muted-foreground">Loading editor…</div>,
})

export function EditorLoader({ tenantId, pageId, initialSections }: { tenantId: string; pageId: string; initialSections: Section[] }) {
  return <EditorShell tenantId={tenantId} pageId={pageId} initialSections={initialSections} />
}
