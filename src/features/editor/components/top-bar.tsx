"use client"

import { useEditor } from "@craftjs/core"
import { Undo2, Redo2, Eye, ChevronLeft, Monitor, Tablet, Smartphone, History } from "lucide-react"
import Link from "next/link"
import { useCallback, useState, useTransition } from "react"
import { saveDraftAction, publishAction } from "../actions"
import { toast } from "sonner"
import { PageSwitcher } from "./page-switcher"
import { ZoomControl } from "./zoom-control"
import { VersionHistory } from "./version-history"

function TopBarIconBtn({ icon: Icon, label, onClick, disabled }: { icon: typeof Undo2; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        padding: 6, borderRadius: 'var(--editor-radius)', border: 'none', background: 'none',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'var(--editor-text-disabled)' : 'var(--editor-icon-secondary)',
        opacity: disabled ? 0.4 : 1, transition: 'all 0.1s',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'var(--editor-surface-hover)'; e.currentTarget.style.color = 'var(--editor-text)' } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = disabled ? 'var(--editor-text-disabled)' : 'var(--editor-icon-secondary)' }}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

interface TopBarProps {
  tenantId: string
  storeSlug: string
  viewport: string
  onViewportChange: (v: "desktop" | "tablet" | "mobile") => void
  pageId: string | null
  onPageChange: (pageId: string, craftJson: string | null) => void
  zoom: number
  onZoomChange: (z: number) => void
}

const viewports = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
] as const

export function TopBar({ tenantId, storeSlug, viewport, onViewportChange, pageId, onPageChange, zoom, onZoomChange }: TopBarProps) {
  const { canUndo, canRedo, actions, query } = useEditor((_state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }))

  const [saving, startSave] = useTransition()
  const [publishing, startPublish] = useTransition()
  const [historyOpen, setHistoryOpen] = useState(false)

  const handleSave = useCallback(() => {
    startSave(async () => {
      const json = query.serialize()
      const result = await saveDraftAction(tenantId, json, pageId ?? undefined)
      if (result.success) toast.success("Draft saved")
      else toast.error(result.error || "Failed to save")
    })
  }, [query, tenantId, pageId])

  const handlePublish = useCallback(() => {
    startPublish(async () => {
      const json = query.serialize()
      const saveResult = await saveDraftAction(tenantId, json, pageId ?? undefined)
      if (!saveResult.success) { toast.error(saveResult.error || "Failed to save"); return }
      const pubResult = await publishAction(tenantId, pageId ?? undefined)
      if (pubResult.success) toast.success("Published!")
      else toast.error(pubResult.error || "Failed to publish")
    })
  }, [query, tenantId, pageId])

  const handlePreview = useCallback(() => {
    const json = query.serialize()
    saveDraftAction(tenantId, json, pageId ?? undefined).then((r) => {
      if (r.success) window.open(`/api/preview?slug=${storeSlug}`, "_blank")
      else toast.error("Save failed — cannot preview")
    })
  }, [query, tenantId, storeSlug, pageId])

  return (
    <div className="editor-topbar flex h-11 items-center border-b" style={{ borderColor: 'var(--editor-border)' }}>
      {/* ─── Group 1: Navigation ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderRight: '1px solid var(--editor-border)', padding: '0 12px' }}>
        <Link
          href="/dashboard"
          style={{ display: 'flex', alignItems: 'center', padding: 6, borderRadius: 'var(--editor-radius)', color: 'var(--editor-icon-secondary)', transition: 'all 0.1s' }}
          title="Back to Dashboard"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <PageSwitcher tenantId={tenantId} currentPageId={pageId} onPageChange={onPageChange} />
      </div>

      {/* ─── Group 2: Edit Tools ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, borderRight: '1px solid var(--editor-border)', padding: '0 12px' }}>
        <TopBarIconBtn icon={Undo2} label="Undo (⌘Z)" onClick={() => actions.history.undo()} disabled={!canUndo} />
        <TopBarIconBtn icon={Redo2} label="Redo (⌘⇧Z)" onClick={() => actions.history.redo()} disabled={!canRedo} />
        <TopBarIconBtn icon={History} label="Version History" onClick={() => setHistoryOpen(true)} />
      </div>

      {/* ─── Group 3: Canvas Controls (centered) ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 2, borderRadius: 'var(--editor-radius)', border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
          {viewports.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewportChange(v.id)}
              title={v.label}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                transition: 'all 0.1s',
                background: viewport === v.id ? 'var(--editor-surface)' : 'transparent',
                color: viewport === v.id ? 'var(--editor-text)' : 'var(--editor-icon-secondary)',
                boxShadow: viewport === v.id ? 'var(--editor-shadow-card)' : 'none',
              }}
            >
              <v.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
      </div>

      {/* ─── Group 4: Actions ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
        <button
          onClick={handlePreview}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 'var(--editor-radius)', border: 'none', background: 'none',
            fontSize: 13, fontWeight: 500, color: 'var(--editor-text-secondary)',
            cursor: 'pointer', transition: 'all 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)'; e.currentTarget.style.color = 'var(--editor-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--editor-text-secondary)' }}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="editor-btn-secondary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing || saving}
          className="editor-btn-primary disabled:opacity-50"
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>

      <VersionHistory tenantId={tenantId} pageId={pageId} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}
