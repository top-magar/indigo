"use client"

import { useEditor } from "@craftjs/core"
import { Undo2, Redo2, Eye, ChevronLeft, ChevronDown, Monitor, Tablet, Smartphone, History, Cloud, ExternalLink, QrCode } from "lucide-react"
import Link from "next/link"
import { useCallback, useState, useTransition, useEffect, useRef } from "react"
import { saveDraftAction, publishAction } from "../actions"
import { toast } from "sonner"
import { PageSwitcher } from "./page-switcher"
import { ZoomControl } from "./zoom-control"
import { VersionHistory } from "./version-history"

const R = { sm: 4, md: 6 }
const H = { btn: 28 }
const G = { tight: 2, related: 4, group: 8 }
const P = { group: '0 8px', section: '0 12px' }

function TopBarIconBtn({ icon: Icon, label, shortcut, onClick, disabled }: { icon: typeof Undo2; label: string; shortcut?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Tooltip text={label} shortcut={shortcut}>
      <button
        onClick={onClick} disabled={disabled}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: H.btn, height: H.btn, borderRadius: R.sm, border: 'none', background: 'none',
          cursor: disabled ? 'default' : 'pointer',
          color: disabled ? 'var(--editor-text-disabled)' : 'var(--editor-icon-secondary)',
          opacity: disabled ? 0.4 : 1, transition: 'background 0.1s, color 0.1s',
        }}
        onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'var(--editor-surface-hover)'; e.currentTarget.style.color = 'var(--editor-text)' } }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = disabled ? 'var(--editor-text-disabled)' : 'var(--editor-icon-secondary)' }}
      >
        <Icon style={{ width: 16, height: 16 }} />
      </button>
    </Tooltip>
  )
}

/** Tooltip — positioned below trigger, shows label + optional keyboard shortcut + optional description */
function Tooltip({ children, text, subtext, shortcut, align = 'center' }: {
  children: React.ReactNode; text: string; subtext?: string; shortcut?: string; align?: 'left' | 'center' | 'right'
}) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ left?: number; right?: number; transform?: string }>({})
  const triggerRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!show || !tipRef.current || !triggerRef.current) return
    const tip = tipRef.current.getBoundingClientRect()
    const trigger = triggerRef.current.getBoundingClientRect()

    // Default center alignment
    let left = trigger.width / 2 - tip.width / 2

    // Clamp to viewport
    const absLeft = trigger.left + left
    if (absLeft < 8) left = 8 - trigger.left
    if (absLeft + tip.width > window.innerWidth - 8) left = window.innerWidth - 8 - tip.width - trigger.left

    setPos({ left, transform: 'none' })
  }, [show])

  const defaultAlign = align === 'left' ? { left: 0 } : align === 'right' ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' }

  return (
    <div ref={triggerRef} style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => { setShow(false); setPos({}) }}>
      {children}
      {show && (
        <div ref={tipRef} style={{
          position: 'absolute', top: '100%', ...(pos.left !== undefined ? pos : defaultAlign),
          marginTop: 6, padding: subtext ? '6px 10px' : '4px 8px', borderRadius: 6,
          background: 'var(--editor-surface)', color: 'var(--editor-text)', fontSize: 12, zIndex: 200,
          border: '1px solid var(--editor-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', pointerEvents: 'none',
          maxWidth: 280, whiteSpace: subtext ? 'normal' : 'nowrap',
        } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 500 }}>{text}</span>
            {shortcut && <Kbd>{shortcut}</Kbd>}
          </div>
          {subtext && <div style={{ marginTop: 3, fontSize: 11, color: 'var(--editor-text-secondary)', lineHeight: 1.4 }}>{subtext}</div>}
        </div>
      )}
    </div>
  )
}

/** Keyboard shortcut badge */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      fontSize: 10, padding: '1px 5px', borderRadius: 3, lineHeight: '16px',
      background: 'var(--editor-surface-secondary)', border: '1px solid var(--editor-border)',
      color: 'var(--editor-text-secondary)', fontFamily: 'inherit', whiteSpace: 'nowrap',
    }}>{children}</kbd>
  )
}

/** Autosave indicator — cloud icon + status text */
function AutosaveIndicator({ lastSaved }: { lastSaved: Date | null }) {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const t = setInterval(() => forceUpdate((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const ago = lastSaved ? formatTimeAgo(lastSaved) : null

  return (
    <Tooltip text="Autosave on" subtext={ago ? `Last saved ${ago}` : "Not saved yet"}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px', cursor: 'default' }}>
        <Cloud style={{ width: 14, height: 14, color: lastSaved ? 'var(--editor-accent)' : 'var(--editor-text-disabled)' }} />
        <span style={{ fontSize: 11, color: 'var(--editor-text-secondary)' }}>
          {lastSaved ? 'Saved' : 'Autosave'}
        </span>
      </div>
    </Tooltip>
  )
}

function formatTimeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 10) return "just now"
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

/** Preview dropdown — 3 modes like Wix */
function PreviewDropdown({ onPreviewInEditor, onPreviewNewTab }: {
  onPreviewInEditor: () => void; onPreviewNewTab: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: G.related, height: H.btn,
          padding: '0 10px', borderRadius: R.sm, border: 'none', background: 'none',
          fontSize: 13, fontWeight: 500, color: 'var(--editor-text-secondary)',
          cursor: 'pointer', transition: 'background 0.1s, color 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)'; e.currentTarget.style.color = 'var(--editor-text)' }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--editor-text-secondary)' } }}
      >
        <Eye style={{ width: 14, height: 14 }} />
        Preview
        <ChevronDown style={{ width: 12, height: 12 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4, width: 260,
          borderRadius: 8, background: 'var(--editor-surface)', border: '1px solid var(--editor-border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 200,
        }}>
          <PreviewOption
            icon={Eye} title="Preview in Editor"
            desc="Quickly check your site in this tab."
            onClick={() => { onPreviewInEditor(); setOpen(false) }}
          />
          <PreviewOption
            icon={ExternalLink} title="Preview in New Tab"
            desc="Open a full preview in another tab."
            onClick={() => { onPreviewNewTab(); setOpen(false) }}
          />
          <PreviewOption
            icon={QrCode} title="Preview on Mobile"
            desc="Scan QR code to preview on any device."
            onClick={() => { toast.info("Mobile preview coming soon"); setOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}

function PreviewOption({ icon: Icon, title, desc, onClick }: {
  icon: typeof Eye; title: string; desc: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', gap: 12, width: '100%', padding: '12px 16px',
        border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
    >
      <Icon style={{ width: 16, height: 16, color: 'var(--editor-icon-secondary)', flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--editor-text)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--editor-text-secondary)', marginTop: 2 }}>{desc}</div>
      </div>
    </button>
  )
}

// ── Breakpoint config ───────────────────────────────────────────

const viewports = [
  { id: "desktop" as const, icon: Monitor, label: "Desktop", sublabel: "Primary", desc: "Changes cascade down to all screen sizes, unless you customize lower breakpoints." },
  { id: "tablet" as const, icon: Tablet, label: "Tablet", sublabel: "1000px and below", desc: "Changes cascade down to screens smaller than 1000px, unless you customize lower breakpoints." },
  { id: "mobile" as const, icon: Smartphone, label: "Mobile", sublabel: "750px and below", desc: "Changes cascade down to screens smaller than 750px." },
]

// ── Main TopBar ─────────────────────────────────────────────────

interface TopBarProps {
  tenantId: string
  storeSlug: string
  viewport: string
  onViewportChange: (v: "desktop" | "tablet" | "mobile") => void
  pageId: string | null
  onPageChange: (pageId: string, craftJson: string | null) => void
  zoom: number
  onZoomChange: (z: number) => void
  previewMode?: boolean
  onPreviewModeChange?: (v: boolean) => void
}

export function TopBar({ tenantId, storeSlug, viewport, onViewportChange, pageId, onPageChange, zoom, onZoomChange, previewMode, onPreviewModeChange }: TopBarProps) {
  const { canUndo, canRedo, actions, query } = useEditor((_state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }))

  const [saving, startSave] = useTransition()
  const [publishing, startPublish] = useTransition()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const lastJsonRef = useRef<string>("")

  // Autosave: save when content changes, debounced 5s
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const json = query.serialize()
        if (json && json !== lastJsonRef.current && json !== "{}") {
          lastJsonRef.current = json
          saveDraftAction(tenantId, json, pageId ?? undefined).then((r) => {
            if (r.success) setLastSaved(new Date())
          })
        }
      } catch { /* editor not ready */ }
    }, 5000)
    return () => clearInterval(timer)
  }, [query, tenantId, pageId])

  const handleSave = useCallback(() => {
    startSave(async () => {
      const json = query.serialize()
      const result = await saveDraftAction(tenantId, json, pageId ?? undefined)
      if (result.success) { toast.success("Draft saved"); setLastSaved(new Date()) }
      else toast.error(result.error || "Failed to save")
    })
  }, [query, tenantId, pageId])

  const handlePublish = useCallback(() => {
    startPublish(async () => {
      const json = query.serialize()
      const saveResult = await saveDraftAction(tenantId, json, pageId ?? undefined)
      if (!saveResult.success) { toast.error(saveResult.error || "Failed to save"); return }
      setLastSaved(new Date())
      const pubResult = await publishAction(tenantId, pageId ?? undefined)
      if (pubResult.success) toast.success("Published!")
      else toast.error(pubResult.error || "Failed to publish")
    })
  }, [query, tenantId, pageId])

  const handlePreviewNewTab = useCallback(() => {
    const json = query.serialize()
    saveDraftAction(tenantId, json, pageId ?? undefined).then((r) => {
      if (r.success) { setLastSaved(new Date()); window.open(`/api/preview?slug=${storeSlug}`, "_blank") }
      else toast.error("Save failed — cannot preview")
    })
  }, [query, tenantId, storeSlug, pageId])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 44,
      borderBottom: '1px solid var(--editor-border)',
      background: 'var(--editor-surface)',
    }}>
      {/* ─── LEFT: Navigation + Page + Autosave ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: G.related, borderRight: '1px solid var(--editor-border)', padding: P.section }}>
        <Tooltip text="Back to Dashboard" shortcut="⌘←" align="left">
          <Link
            href="/dashboard"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: H.btn, height: H.btn, borderRadius: R.sm, color: 'var(--editor-icon-secondary)' }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </Link>
        </Tooltip>
        <PageSwitcher tenantId={tenantId} currentPageId={pageId} onPageChange={onPageChange} />
        <AutosaveIndicator lastSaved={lastSaved} />
      </div>

      {/* ─── LEFT-CENTER: Undo/Redo/History ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: G.tight, borderRight: '1px solid var(--editor-border)', padding: P.group }}>
        <TopBarIconBtn icon={Undo2} label="Undo" shortcut="⌘Z" onClick={() => actions.history.undo()} disabled={!canUndo} />
        <TopBarIconBtn icon={Redo2} label="Redo" shortcut="⌘⇧Z" onClick={() => actions.history.redo()} disabled={!canRedo} />
        <TopBarIconBtn icon={History} label="Version History" onClick={() => setHistoryOpen(true)} />
      </div>

      {/* ─── CENTER: Viewport + Zoom ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: G.group }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, padding: 2, borderRadius: R.md, border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
          {viewports.map((v) => (
            <Tooltip key={v.id} text={`${v.label} (${v.sublabel})`} subtext={v.desc}>
              <button
                onClick={() => onViewportChange(v.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 24, padding: '0 8px', borderRadius: R.sm, border: 'none', cursor: 'pointer',
                  transition: 'all 0.1s',
                  background: viewport === v.id ? 'var(--editor-surface)' : 'transparent',
                  color: viewport === v.id ? 'var(--editor-text)' : 'var(--editor-icon-secondary)',
                  boxShadow: viewport === v.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <v.icon style={{ width: 14, height: 14 }} />
              </button>
            </Tooltip>
          ))}
        </div>
        <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
      </div>

      {/* ─── RIGHT: Preview + Save + Publish ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: G.group, padding: P.section }}>
        <PreviewDropdown
          onPreviewInEditor={() => onPreviewModeChange?.(!previewMode)}
          onPreviewNewTab={handlePreviewNewTab}
        />
        <Tooltip text="Save draft" shortcut="⌘S">
        <button
          onClick={handleSave} disabled={saving}
          style={{
            height: H.btn, padding: '0 12px', borderRadius: R.sm,
            border: '1px solid var(--editor-border)', background: 'var(--editor-surface)',
            fontSize: 13, fontWeight: 500, color: 'var(--editor-text)',
            cursor: 'pointer', opacity: saving ? 0.5 : 1, transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--editor-surface)' }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        </Tooltip>
        <Tooltip text="Publish to live site" subtext="Saves and publishes your changes to the storefront.">
        <button
          onClick={handlePublish} disabled={publishing || saving}
          style={{
            height: H.btn, padding: '0 12px', borderRadius: R.sm,
            border: 'none', background: 'var(--editor-fill-brand)', color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            opacity: (publishing || saving) ? 0.5 : 1, transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--editor-fill-brand)' }}
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
        </Tooltip>
      </div>

      <VersionHistory tenantId={tenantId} pageId={pageId} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}
