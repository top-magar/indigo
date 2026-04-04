"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { History, X, RotateCcw, Loader2, Clock, Check } from "lucide-react"
import { listVersionsAction, restoreVersionAction } from "../actions"
import { toast } from "sonner"

interface Version { id: string; label: string | null; created_at: string }

interface VersionHistoryProps {
  tenantId: string
  pageId: string | null
  open: boolean
  onClose: () => void
  onRestore?: () => void
}

export function VersionHistory({ tenantId, pageId, open, onClose, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, startLoad] = useTransition()
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoredId, setRestoredId] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!pageId) return
    startLoad(async () => {
      const result = await listVersionsAction(tenantId, pageId)
      if (result.success) setVersions(result.versions)
      setLoaded(true)
    })
  }, [tenantId, pageId])

  useEffect(() => {
    if (open && !loaded && !loading) load()
    if (!open) { setLoaded(false); setRestoredId(null) }
  }, [open, loaded, loading, load])

  if (!open) return null

  const handleRestore = async (versionId: string) => {
    if (!confirm("Restore this version? Your current draft will be replaced.")) return
    setRestoringId(versionId)
    const result = await restoreVersionAction(tenantId, versionId)
    if (result.success) {
      toast.success("Version restored")
      setRestoredId(versionId)
      setRestoringId(null)
      setTimeout(() => { onClose(); onRestore?.() }, 600)
    } else {
      toast.error(result.error || "Failed to restore")
      setRestoringId(null)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = Date.now()
    const diffMins = Math.floor((now - d.getTime()) / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        style={{ width: 380, maxHeight: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 12, border: '1px solid var(--editor-border)', background: 'var(--editor-surface)', boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--editor-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History style={{ width: 16, height: 16, color: 'var(--editor-icon-secondary)' }} />
            <span style={{ fontSize: 14, fontWeight: 650, color: 'var(--editor-text)' }}>Version History</span>
            <span style={{ fontSize: 11, color: 'var(--editor-text-disabled)', fontWeight: 400 }}>{versions.length} versions</span>
          </div>
          <button onClick={onClose} style={{ padding: 4, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--editor-icon-secondary)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Current draft indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--editor-border)', background: 'var(--editor-accent-light, rgba(59,130,246,0.05))' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--editor-accent)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--editor-accent)' }}>Current Draft</div>
            <div style={{ fontSize: 11, color: 'var(--editor-text-secondary)' }}>Unsaved changes</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--editor-accent)', color: 'white' }}>LIVE</span>
        </div>

        {/* Version list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <Loader2 style={{ width: 20, height: 20, color: 'var(--editor-icon-secondary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : versions.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', textAlign: 'center' }}>
              <Clock style={{ width: 32, height: 32, color: 'var(--editor-text-disabled)', marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: 'var(--editor-text-secondary)', margin: 0 }}>No versions yet</p>
              <p style={{ fontSize: 12, color: 'var(--editor-text-disabled)', marginTop: 4 }}>Versions are created each time you publish</p>
            </div>
          ) : (
            versions.map((v, i) => {
              const isRestoring = restoringId === v.id
              const isRestored = restoredId === v.id
              return (
                <div
                  key={v.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                    borderBottom: '1px solid var(--editor-border)', transition: 'background 0.1s',
                    background: isRestored ? 'rgba(34,197,94,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isRestored) e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
                  onMouseLeave={(e) => { if (!isRestored) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Timeline dot */}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--editor-text-secondary)' : 'var(--editor-border)', flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--editor-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.label || `Version ${versions.length - i}`}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--editor-text-secondary)' }}>{formatDate(v.created_at)}</div>
                  </div>

                  {isRestored ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                      <Check style={{ width: 14, height: 14 }} /> Restored
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRestore(v.id)}
                      disabled={!!restoringId}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                        borderRadius: 6, border: '1px solid var(--editor-border)', background: 'var(--editor-surface)',
                        cursor: restoringId ? 'not-allowed' : 'pointer',
                        fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)',
                        opacity: restoringId && !isRestoring ? 0.4 : 1, transition: 'all 0.1s',
                      }}
                      onMouseEnter={(e) => { if (!restoringId) { e.currentTarget.style.borderColor = 'var(--editor-accent)'; e.currentTarget.style.color = 'var(--editor-accent)' } }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)'; e.currentTarget.style.color = 'var(--editor-text-secondary)' }}
                    >
                      {isRestoring ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : <RotateCcw style={{ width: 12, height: 12 }} />}
                      {isRestoring ? "Restoring…" : "Restore"}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--editor-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', margin: 0 }}>Last 20 published versions are kept</p>
        </div>
      </div>
    </div>
  )
}
