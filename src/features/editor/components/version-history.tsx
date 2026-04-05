"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { History, RotateCcw, Loader2, Clock, Check } from "lucide-react"
import { listVersionsAction, restoreVersionAction } from "../actions"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface Version { id: string; label: string | null; created_at: string }

interface VersionHistoryProps { tenantId: string; pageId: string | null; open: boolean; onClose: () => void; onRestore?: () => void }

export function VersionHistory({ tenantId, pageId, open, onClose, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, startLoad] = useTransition()
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoredId, setRestoredId] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!pageId) return
    startLoad(async () => { const r = await listVersionsAction(tenantId, pageId); if (r.success) setVersions(r.versions); setLoaded(true) })
  }, [tenantId, pageId])

  useEffect(() => { if (open && !loaded && !loading) load(); if (!open) { setLoaded(false); setRestoredId(null) } }, [open, loaded, loading, load])

  const handleRestore = async (versionId: string) => {
    if (!confirm("Restore this version? Your current draft will be replaced.")) return
    setRestoringId(versionId)
    const r = await restoreVersionAction(tenantId, versionId)
    if (r.success) { toast.success("Version restored"); setRestoredId(versionId); setRestoringId(null); setTimeout(() => { onClose(); onRestore?.() }, 600) }
    else { toast.error(r.error || "Failed to restore"); setRestoringId(null) }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso); const m = Math.floor((Date.now() - d.getTime()) / 60000)
    if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; const dd = Math.floor(h / 24); if (dd < 7) return `${dd}d ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent showCloseButton={false} className="editor-panel-scope max-w-[380px] max-h-[70vh] !block p-0 overflow-hidden gap-0 !bg-[var(--editor-surface)] !border-[var(--editor-border)]">
        <div className="flex flex-col h-full">
        <DialogHeader className="px-4 py-3.5 border-b" style={{ borderColor: 'var(--editor-border)' }}>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <History className="w-4 h-4" style={{ color: 'var(--editor-icon-secondary)' }} />
            Version History
            <span className="text-[11px] font-normal" style={{ color: 'var(--editor-text-disabled)' }}>{versions.length} versions</span>
          </DialogTitle>
        </DialogHeader>

        {/* Current draft */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: 'var(--editor-border)', background: 'var(--editor-accent-light, rgba(59,130,246,0.05))' }}>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--editor-accent)' }} />
          <div className="flex-1">
            <div className="text-[13px] font-semibold" style={{ color: 'var(--editor-accent)' }}>Current Draft</div>
            <div className="text-[11px]" style={{ color: 'var(--editor-text-secondary)' }}>Unsaved changes</div>
          </div>
          <Badge className="text-[10px] h-4">LIVE</Badge>
        </div>

        {/* Version list */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--editor-icon-secondary)' }} /></div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Clock className="w-8 h-8 mb-2" style={{ color: 'var(--editor-text-disabled)' }} />
              <p className="text-[13px]" style={{ color: 'var(--editor-text-secondary)' }}>No versions yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--editor-text-disabled)' }}>Versions are created each time you publish</p>
            </div>
          ) : versions.map((v, i) => {
            const isRestoring = restoringId === v.id
            const isRestored = restoredId === v.id
            return (
              <div key={v.id} className="flex items-center gap-2.5 px-4 py-2.5 border-b transition-colors hover:bg-muted/50" style={{ borderColor: 'var(--editor-border)', background: isRestored ? 'rgba(34,197,94,0.06)' : undefined }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: i === 0 ? 'var(--editor-text-secondary)' : 'var(--editor-border)' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: 'var(--editor-text)' }}>{v.label || `Version ${versions.length - i}`}</div>
                  <div className="text-[11px]" style={{ color: 'var(--editor-text-secondary)' }}>{formatDate(v.created_at)}</div>
                </div>
                {isRestored ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600"><Check className="w-3.5 h-3.5" /> Restored</span>
                ) : (
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleRestore(v.id)} disabled={!!restoringId}>
                    {isRestoring ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                    {isRestoring ? "Restoring…" : "Restore"}
                  </Button>
                )}
              </div>
            )
          })}
        </ScrollArea>

        <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--editor-border)' }}>
          <p className="text-[11px] m-0" style={{ color: 'var(--editor-text-disabled)' }}>Last 20 published versions are kept</p>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
