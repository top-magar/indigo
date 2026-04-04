"use client"

import { useState, useTransition } from "react"
import { useEditor } from "@craftjs/core"
import { History, X, RotateCcw, Loader2 } from "lucide-react"
import { listVersionsAction, restoreVersionAction } from "../actions"
import { toast } from "sonner"

interface Version { id: string; label: string | null; created_at: string }

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

  if (open && !loaded && !loading) {
    startLoad(async () => {
      if (!pageId) return
      const result = await listVersionsAction(tenantId, pageId)
      if (result.success) setVersions(result.versions)
      setLoaded(true)
    })
  }
  if (!open && loaded) setLoaded(false)
  if (!open) return null

  const handleRestore = (versionId: string) => {
    if (!confirm("Restore this version? Your current draft will be replaced.")) return
    startRestore(async () => {
      const result = await restoreVersionAction(tenantId, versionId)
      if (result.success) { toast.success("Version restored"); window.location.reload() }
      else toast.error(result.error || "Failed to restore")
    })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const diffMins = Math.floor((Date.now() - d.getTime()) / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        style={{ width: 360, height: 440, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 12, border: '1px solid var(--editor-border)', background: 'var(--editor-surface)', boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--editor-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History className="h-4 w-4" style={{ color: 'var(--editor-icon-secondary)' }} />
            <span style={{ fontSize: 13, fontWeight: 650, color: 'var(--editor-text)' }}>Version History</span>
          </div>
          <button onClick={onClose} style={{ padding: 4, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--editor-icon-secondary)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--editor-icon-secondary)' }} />
            </div>
          ) : versions.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', textAlign: 'center' }}>
              <History className="h-8 w-8" style={{ color: 'var(--editor-text-disabled)', marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: 'var(--editor-text-secondary)' }}>No versions yet</p>
              <p style={{ fontSize: 12, color: 'var(--editor-text-disabled)', marginTop: 4 }}>Versions are created each time you publish</p>
            </div>
          ) : (
            versions.map((v, i) => (
              <div
                key={v.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--editor-border)', transition: 'background 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--editor-text)' }}>{v.label || `Version ${versions.length - i}`}</p>
                  <p style={{ fontSize: 12, color: 'var(--editor-text-secondary)' }}>{formatDate(v.created_at)}</p>
                </div>
                <button
                  onClick={() => handleRestore(v.id)}
                  disabled={restoring}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                    borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)',
                    opacity: restoring ? 0.5 : 1, transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-secondary)'; e.currentTarget.style.color = 'var(--editor-text)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--editor-text-secondary)' }}
                >
                  <RotateCcw className="h-3 w-3" />
                  Restore
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--editor-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)' }}>Last 20 published versions are kept</p>
        </div>
      </div>
    </div>
  )
}
