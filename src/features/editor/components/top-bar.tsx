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

/*
 * Design tokens — strict 4px grid, Notion/Linear style
 * Radius: 4px (small/toolbar), 6px (containers), 8px (cards/dialogs)
 * Heights: 28px (toolbar buttons), 32px (inputs), 44px (top bar)
 * Gaps: 2px (tight), 4px (related), 8px (groups), 12px (sections)
 * Padding: 4px (icon btn), 8px (group horizontal), 12px (section horizontal)
 */

const R = { sm: 4, md: 6 } // radius
const H = { btn: 28 } // heights
const G = { tight: 2, related: 4, group: 8 } // gaps
const P = { iconBtn: 6, group: '0 8px', section: '0 12px' } // padding

function TopBarIconBtn({ icon: Icon, label, onClick, disabled }: { icon: typeof Undo2; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: H.btn, height: H.btn,
        borderRadius: R.sm, border: 'none', background: 'none',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'var(--editor-text-disabled)' : 'var(--editor-icon-secondary)',
        opacity: disabled ? 0.4 : 1, transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'var(--editor-surface-hover)'; e.currentTarget.style.color = 'var(--editor-text)' } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = disabled ? 'var(--editor-text-disabled)' : 'var(--editor-icon-secondary)' }}
    >
      <Icon style={{ width: 16, height: 16 }} />
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
    <div style={{
      display: 'flex', alignItems: 'center', height: 44,
      borderBottom: '1px solid var(--editor-border)',
      background: 'var(--editor-surface)',
      fontFamily: 'var(--editor-font, Inter, -apple-system, sans-serif)',
    }}>
      {/* ─── Group 1: Navigation ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: G.related, borderRight: '1px solid var(--editor-border)', padding: P.section }}>
        <Link
          href="/dashboard"
          title="Back to Dashboard"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: H.btn, height: H.btn, borderRadius: R.sm, color: 'var(--editor-icon-secondary)', transition: 'background 0.1s' }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </Link>
        <PageSwitcher tenantId={tenantId} currentPageId={pageId} onPageChange={onPageChange} />
      </div>

      {/* ─── Group 2: Edit Tools ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: G.tight, borderRight: '1px solid var(--editor-border)', padding: P.group }}>
        <TopBarIconBtn icon={Undo2} label="Undo (⌘Z)" onClick={() => actions.history.undo()} disabled={!canUndo} />
        <TopBarIconBtn icon={Redo2} label="Redo (⌘⇧Z)" onClick={() => actions.history.redo()} disabled={!canRedo} />
        <TopBarIconBtn icon={History} label="Version History" onClick={() => setHistoryOpen(true)} />
      </div>

      {/* ─── Group 3: Canvas Controls (centered) ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: G.group }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, padding: 2, borderRadius: R.md, border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
          {viewports.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewportChange(v.id)}
              title={v.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 24, padding: '0 8px',
                borderRadius: R.sm, border: 'none', cursor: 'pointer',
                transition: 'all 0.1s',
                background: viewport === v.id ? 'var(--editor-surface)' : 'transparent',
                color: viewport === v.id ? 'var(--editor-text)' : 'var(--editor-icon-secondary)',
                boxShadow: viewport === v.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <v.icon style={{ width: 14, height: 14 }} />
            </button>
          ))}
        </div>
        <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
      </div>

      {/* ─── Group 4: Actions ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: G.group, padding: P.section }}>
        <button
          onClick={handlePreview}
          style={{
            display: 'flex', alignItems: 'center', gap: G.related, height: H.btn,
            padding: '0 10px', borderRadius: R.sm, border: 'none', background: 'none',
            fontSize: 13, fontWeight: 500, color: 'var(--editor-text-secondary)',
            cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)'; e.currentTarget.style.color = 'var(--editor-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--editor-text-secondary)' }}
        >
          <Eye style={{ width: 14, height: 14 }} />
          Preview
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            height: H.btn, padding: '0 12px', borderRadius: R.sm,
            border: '1px solid var(--editor-border)', background: 'var(--editor-surface)',
            fontSize: 13, fontWeight: 500, color: 'var(--editor-text)',
            cursor: 'pointer', opacity: saving ? 0.5 : 1,
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--editor-surface)' }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing || saving}
          style={{
            height: H.btn, padding: '0 12px', borderRadius: R.sm,
            border: 'none', background: 'var(--editor-fill-brand)', color: 'white',
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer', opacity: (publishing || saving) ? 0.5 : 1,
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--editor-fill-brand)' }}
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>

      <VersionHistory tenantId={tenantId} pageId={pageId} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}
