"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getProjectVersions } from "../lib/queries"
import { rollbackPublication } from "../lib/session-actions"
import { MIcon } from "../ui/m-icon"
import { toast } from "sonner"
import { useEditor } from "../core/provider"

export function VersionHistory({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<Array<{ id: string; version: number; label: string | null; createdAt: Date }>>([])
  const [loading, setLoading] = useState(false)
  const [rollingBackId, setRollingBackId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setLoading(true)
      getProjectVersions(projectId).then(data => {
        setVersions(data)
        setLoading(false)
      }).catch(() => {
        toast.error("Failed to load versions")
        setLoading(false)
      })
    }
  }, [open, projectId])

  const handleRollback = async (versionId: string) => {
    try {
      setRollingBackId(versionId)
      const res = await rollbackPublication(projectId, versionId)
      if (res.ok) {
        toast.success("Successfully rolled back publication")
        setOpen(false)
        window.location.reload()
      } else {
        toast.error(res.message || "Failed to rollback")
      }
    } catch (err) {
      toast.error("An error occurred during rollback")
    } finally {
      setRollingBackId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted focus:bg-muted outline-none">
          <MIcon name="history" size={15} className="text-muted-foreground" />
          <span className="flex-1">Version history</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>View past publications and roll back if needed.</DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No published versions yet.</div>
          ) : (
            <div className="space-y-3">
              {versions.map((v, i) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      Version {v.version} {i === 0 && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">Current Live</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(v.createdAt), "MMM d, yyyy h:mm a")}
                      {v.label && ` • ${v.label}`}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={i === 0 || rollingBackId !== null}
                    onClick={() => handleRollback(v.id)}
                  >
                    {rollingBackId === v.id ? "Rolling back..." : "Roll back"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
