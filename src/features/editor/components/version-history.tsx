"use client"

import { useState, useTransition } from "react"
import { useEditor } from "@craftjs/core"
import { History, X, RotateCcw, Loader2 } from "lucide-react"
import { listVersionsAction, restoreVersionAction } from "../actions"
import { toast } from "sonner"

interface Version {
  id: string
  label: string | null
  created_at: string
}

interface VersionHistoryProps {
  tenantId: string
  pageId: string | null
  open: boolean
  onClose: () => void
}

export function VersionHistory({ tenantId, pageId, open, onClose }: VersionHistoryProps) {
  const { actions } = useEditor()
  const [versions, setVersions] = useState<Version[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, startLoad] = useTransition()
  const [restoring, startRestore] = useTransition()

  // Load versions when panel opens
  if (open && !loaded && !loading) {
    startLoad(async () => {
      if (!pageId) return
      const result = await listVersionsAction(tenantId, pageId)
      if (result.success) setVersions(result.versions)
      setLoaded(true)
    })
  }

  // Reset when closed
  if (!open && loaded) setLoaded(false)

  if (!open) return null

  const handleRestore = (versionId: string) => {
    if (!confirm("Restore this version? Your current draft will be replaced.")) return
    startRestore(async () => {
      const result = await restoreVersionAction(tenantId, versionId)
      if (result.success) {
        toast.success("Version restored — reload to see changes")
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to restore")
      }
    })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex h-[440px] w-[360px] flex-col overflow-hidden rounded-lg border border-border/50 bg-background shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[12px] font-semibold">Version History</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-[11px] text-muted-foreground">No versions yet</p>
              <p className="mt-1 text-[10px] text-muted-foreground/60">Versions are created each time you publish</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {versions.map((v, i) => (
                <div key={v.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/30">
                  <div>
                    <p className="text-[11px] font-medium">
                      {v.label || `Version ${versions.length - i}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(v.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleRestore(v.id)}
                    disabled={restoring}
                    className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border/50 px-4 py-2">
          <p className="text-center text-[10px] text-muted-foreground/50">
            Last 20 published versions are kept
          </p>
        </div>
      </div>
    </div>
  )
}
