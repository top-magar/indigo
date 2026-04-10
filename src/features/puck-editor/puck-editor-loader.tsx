"use client"

import dynamic from "next/dynamic"
import type { Data } from "@puckeditor/core"

const PuckEditorShell = dynamic(
  () => import("./puck-editor-shell").then((m) => m.PuckEditorShell),
  { ssr: false, loading: () => <div className="flex h-screen items-center justify-center text-muted-foreground">Loading editor…</div> }
)

export function PuckEditorLoader({ tenantId, pageId, initialData }: { tenantId: string; pageId: string | null; initialData: Data | null }) {
  return <PuckEditorShell tenantId={tenantId} pageId={pageId} initialData={initialData} />
}
