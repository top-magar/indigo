"use client"

import { useState, useEffect, useTransition } from "react"
import { Clock, RotateCcw, Save, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { saveVersionAction, listVersionsAction, restoreVersionAction } from "../../actions"
import { useEditorStore } from "../../store"
import { toast } from "sonner"

interface Version { id: string; name: string; created_at: string }
interface Props { open: boolean; onClose: () => void; tenantId: string; pageId: string }

export function VersionHistory({ open, onClose, tenantId, pageId }: Props) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, startLoad] = useTransition()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const sections = useEditorStore(s => s.sections)
  const theme = useEditorStore(s => s.theme)
  const loadSections = useEditorStore(s => s.loadSections)
  const updateTheme = useEditorStore(s => s.updateTheme)

  useEffect(() => {
    if (open) startLoad(async () => {
      try { setVersions(await listVersionsAction(tenantId, pageId)) } catch { /* table may not exist yet */ }
    })
  }, [open, tenantId, pageId])

  const saveCheckpoint = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await saveVersionAction(tenantId, pageId, name.trim(), { sections, theme })
      toast.success(`Checkpoint "${name.trim()}" saved`)
      setName("")
      setVersions(await listVersionsAction(tenantId, pageId))
    } catch { toast.error("Failed to save checkpoint") }
    finally { setSaving(false) }
  }

  const restore = async (v: Version) => {
    if (!confirm("Restore this version? Current draft will be replaced.")) return
    setRestoringId(v.id)
    try {
      const data = await restoreVersionAction(tenantId, pageId, v.id)
      loadSections(data.sections)
      updateTheme(data.theme)
      toast.success(`Restored "${v.name}"`)
      onClose()
    } catch { toast.error("Failed to restore") }
    finally { setRestoringId(null) }
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
        <div className="px-4 py-2.5 border-b flex gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Checkpoint name…" className="h-7 text-xs flex-1" onKeyDown={e => e.key === "Enter" && saveCheckpoint()} />
          <Button size="sm" className="h-7 text-xs gap-1" onClick={saveCheckpoint} disabled={saving || !name.trim()}>
            <Save className="size-3" />{saving ? "…" : "Save"}
          </Button>
        </div>
        <ScrollArea className="max-h-[400px]">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          : versions.length === 0 ? <p className="text-center text-xs text-muted-foreground py-8">No checkpoints yet</p>
          : versions.map(v => (
            <div key={v.id} className="flex items-center gap-2 px-4 py-2.5 border-b hover:bg-muted/50">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{v.name}</div>
                <div className="text-xs text-muted-foreground">{fmt(v.created_at)}</div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => restore(v)} disabled={!!restoringId}>
                {restoringId === v.id ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}Restore
              </Button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
