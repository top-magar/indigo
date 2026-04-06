"use client"

import { useEditor } from "@craftjs/core"
import { Undo2, Redo2, Eye, ChevronLeft, ChevronDown, Monitor, Tablet, Smartphone, History, Cloud, ExternalLink, QrCode } from "lucide-react"
import Link from "next/link"
import { useCallback, useState, useTransition, useEffect, useRef } from "react"
import { saveDraftAction, publishAction } from "../actions"
import { toast } from "sonner"
import { ZoomControl } from "./zoom-control"
import { VersionHistory } from "./version-history"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

function TopBarIconBtn({ icon: Icon, label, shortcut, onClick, disabled }: { icon: typeof Undo2; label: string; shortcut?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClick} disabled={disabled}>
          <Icon className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}{shortcut && <kbd className="ml-2 text-[10px] opacity-60">{shortcut}</kbd>}</TooltipContent>
    </Tooltip>
  )
}

function AutosaveIndicator({ lastSaved }: { lastSaved: Date | null }) {
  const [, forceUpdate] = useState(0)
  useEffect(() => { const t = setInterval(() => forceUpdate((n) => n + 1), 30000); return () => clearInterval(t) }, [])
  const ago = lastSaved ? formatTimeAgo(lastSaved) : null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 px-1 cursor-default">
          <Cloud className="w-3.5 h-3.5" style={{ color: lastSaved ? 'var(--editor-accent)' : 'var(--editor-text-disabled)' }} />
          <span className="text-[11px] text-muted-foreground">{lastSaved ? 'Saved' : 'Autosave'}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{ago ? `Last saved ${ago}` : "Autosave on — not saved yet"}</TooltipContent>
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

function PreviewDropdown({ onPreviewInEditor, onPreviewNewTab }: { onPreviewInEditor: () => void; onPreviewNewTab: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[13px] font-medium">
          <Eye className="w-3.5 h-3.5" /> Preview <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[260px]">
        <DropdownMenuItem onClick={onPreviewInEditor} className="flex gap-3 py-3">
          <Eye className="w-4 h-4 shrink-0 mt-0.5" />
          <div><div className="text-[13px] font-medium">Preview in Editor</div><div className="text-[11px] text-muted-foreground mt-0.5">Quickly check your site in this tab.</div></div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPreviewNewTab} className="flex gap-3 py-3">
          <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
          <div><div className="text-[13px] font-medium">Preview in New Tab</div><div className="text-[11px] text-muted-foreground mt-0.5">Open a full preview in another tab.</div></div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Mobile preview coming soon")} className="flex gap-3 py-3">
          <QrCode className="w-4 h-4 shrink-0 mt-0.5" />
          <div><div className="text-[13px] font-medium">Preview on Mobile</div><div className="text-[11px] text-muted-foreground mt-0.5">Scan QR code to preview on any device.</div></div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const viewports = [
  { id: "desktop" as const, icon: Monitor, label: "Desktop", desc: "1000px+" },
  { id: "tablet" as const, icon: Tablet, label: "Tablet", desc: "≤1000px" },
  { id: "mobile" as const, icon: Smartphone, label: "Mobile", desc: "≤750px" },
]

import { useEditorContext } from "../editor-context"

interface TopBarProps {
  viewport: string
  onViewportChange: (v: "desktop" | "tablet" | "mobile") => void
  zoom: number
  onZoomChange: (z: number) => void
  previewMode?: boolean
  onPreviewModeChange?: (v: boolean) => void
  onVersionRestore?: () => void
}

export function TopBar({ viewport, onViewportChange, zoom, onZoomChange, previewMode, onPreviewModeChange, onVersionRestore }: TopBarProps) {
  const { tenantId, storeSlug, pageId } = useEditorContext()
  const { canUndo, canRedo, actions, query } = useEditor((_state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }))

  const [saving, startSave] = useTransition()
  const [publishing, startPublish] = useTransition()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const lastJsonRef = useRef<string>("")

  // Autosave every 5s when content changes
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

  if (previewMode) {
    return (
      <div className="editor-topbar flex items-center justify-center h-11 gap-3">
        <Eye className="w-4 h-4 text-blue-600" />
        <span className="text-[13px] font-medium text-foreground">Preview Mode</span>
        <Button variant="outline" size="sm" className="h-7" onClick={() => onPreviewModeChange?.(false)}>Exit Preview</Button>
      </div>
    )
  }

  return (
    <div className="editor-topbar flex items-center h-11">
      {/* LEFT: Nav + Page + Autosave */}
      <div className="flex items-center gap-1 px-3 border-r" style={{ borderColor: 'var(--editor-chrome-border)' }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <Link href="/dashboard"><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to Dashboard <kbd className="ml-1 text-[10px] opacity-60">⌘←</kbd></TooltipContent>
        </Tooltip>
        <span className="text-[13px] font-medium whitespace-nowrap text-foreground">{storeSlug}</span>
        <AutosaveIndicator lastSaved={lastSaved} />
      </div>

      {/* LEFT-CENTER: Undo/Redo/History */}
      <div className="flex items-center gap-0.5 px-2 border-r" style={{ borderColor: 'var(--editor-chrome-border)' }}>
        <TopBarIconBtn icon={Undo2} label="Undo" shortcut="⌘Z" onClick={() => actions.history.undo()} disabled={!canUndo} />
        <TopBarIconBtn icon={Redo2} label="Redo" shortcut="⌘⇧Z" onClick={() => actions.history.redo()} disabled={!canRedo} />
        <TopBarIconBtn icon={History} label="Version History" onClick={() => setHistoryOpen(true)} />
      </div>

      {/* CENTER: Viewport + Zoom */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <ToggleGroup type="single" value={viewport} onValueChange={(v) => { if (v) onViewportChange(v as "desktop" | "tablet" | "mobile") }} className="p-0.5 border" style={{ borderColor: 'var(--editor-chrome-border)', background: 'var(--editor-chrome-hover)' }}>
          {viewports.map((v) => (
            <Tooltip key={v.id}>
              <TooltipTrigger asChild>
                <ToggleGroupItem value={v.id} className="h-6 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                  <v.icon className="w-3.5 h-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>{v.label} ({v.desc})</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
        <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
      </div>

      {/* RIGHT: Preview + Save + Publish */}
      <div className="flex items-center gap-2 px-3">
        <PreviewDropdown onPreviewInEditor={() => onPreviewModeChange?.(!previewMode)} onPreviewNewTab={handlePreviewNewTab} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-[13px]" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save draft <kbd className="ml-1 text-[10px] opacity-60">⌘S</kbd></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" className="h-7 text-[13px] font-semibold" style={{ background: 'var(--editor-fill-brand)', color: 'white' }} onClick={handlePublish} disabled={publishing || saving}>
              {publishing ? "Publishing…" : "Publish"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Publish to live site</TooltipContent>
        </Tooltip>
      </div>

      <VersionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} onRestore={onVersionRestore} />
    </div>
  )
}
