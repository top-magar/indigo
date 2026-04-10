"use client"

import { useState, useEffect, useTransition } from "react"
import { Clock, RotateCcw, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { listVersionsAction, restoreVersionAction } from "@/features/editor/actions/actions"
import { toast } from "sonner"

interface Props { open: boolean; onClose: () => void; tenantId: string; pageId: string }

export function VersionHistory({ open, onClose, tenantId, pageId }: Props) {
  const [versions, setVersions] = useState<{ id: string; label: string | null; created_at: string }[]>([])
  const [loading, startLoad] = useTransition()
  const [restoringId, setRestoringId] = useState<string | null>(null)

  useEffect(() => {
    if (open) startLoad(async () => {
      const r = await listVersionsAction(tenantId, pageId)
      if (r.success) setVersions(r.versions)
    })
  }, [open, tenantId, pageId])

  const restore = async (id: string) => {
    if (!confirm("Restore this version? Current draft will be replaced.")) return
    setRestoringId(id)
    const r = await restoreVersionAction(tenantId, id)
    if (r.success) { toast.success("Version restored"); onClose(); window.location.reload() }
    else { toast.error(r.error || "Restore failed"); setRestoringId(null) }
  }

  const fmt = (iso: string) => {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (m < 60) return `${m}m ago`
    if (m < 1440) return `${Math.floor(m / 60)}h ago`
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[380px] max-h-[60vh] p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-sm"><Clock className="size-4" />Version History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          : versions.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No versions yet</p>
          : versions.map((v, i) => (
            <div key={v.id} className="flex items-center gap-2 px-4 py-2.5 border-b hover:bg-muted/50">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{v.label || `Version ${versions.length - i}`}</div>
                <div className="text-xs text-muted-foreground">{fmt(v.created_at)}</div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => restore(v.id)} disabled={!!restoringId}>
                {restoringId === v.id ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}Restore
              </Button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
