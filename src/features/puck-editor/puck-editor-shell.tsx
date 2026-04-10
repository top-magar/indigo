"use client"

import { Puck, type Data } from "@puckeditor/core"
import "@puckeditor/core/puck.css"
import { puckConfig } from "./puck-config"
import { savePuckDraftAction } from "./actions"

interface PuckEditorShellProps {
  tenantId: string
  pageId: string | null
  initialData: Data | null
}

export function PuckEditorShell({ tenantId, pageId, initialData }: PuckEditorShellProps) {
  const handleSave = async (data: Data) => {
    const result = await savePuckDraftAction(tenantId, JSON.stringify(data), pageId ?? undefined)
    if (!result.success) {
      console.error("Failed to save Puck draft:", result.error)
    }
  }

  return (
    <Puck
      config={puckConfig}
      data={initialData ?? ({ content: [], root: {} } as Data)}
      onPublish={handleSave}
    />
  )
}
