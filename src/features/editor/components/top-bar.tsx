"use client"

import { useEditor } from "@craftjs/core"
import { Undo2, Redo2, Eye, ChevronLeft, Monitor, Tablet, Smartphone } from "lucide-react"
import Link from "next/link"
import { useCallback, useTransition } from "react"
import { saveDraftAction, publishAction } from "../actions"
import { toast } from "sonner"
import { cn } from "@/shared/utils"
import { PageSwitcher } from "./page-switcher"
import { ZoomControl } from "./zoom-control"

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
      if (!saveResult.success) {
        toast.error(saveResult.error || "Failed to save")
        return
      }
      const pubResult = await publishAction(tenantId, pageId ?? undefined)
      if (pubResult.success) toast.success("Published!")
      else toast.error(pubResult.error || "Failed to publish")
    })
  }, [query, tenantId, pageId])

  return (
    <div className="flex h-12 items-center justify-between border-b border-border/50 bg-background px-4">
      {/* Left: back + page switcher + undo/redo */}
      <div className="flex items-center gap-1.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 rounded px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="mx-0.5 h-4 w-px bg-border/50" />
        <PageSwitcher tenantId={tenantId} currentPageId={pageId} onPageChange={onPageChange} />
        <div className="mx-0.5 h-4 w-px bg-border/50" />
        <div className="flex items-center gap-0.5 rounded border border-border/50 bg-muted/40 p-0.5">
          <button
            disabled={!canUndo}
            onClick={() => actions.history.undo()}
            className="rounded p-1.5 text-foreground/70 transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:text-muted-foreground/30"
            title="Undo (⌘Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            disabled={!canRedo}
            onClick={() => actions.history.redo()}
            className="rounded p-1.5 text-foreground/70 transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:text-muted-foreground/30"
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center: viewport switcher + zoom */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded border border-border/50 bg-muted/40 p-0.5">
          {viewports.map((v) => (
            <button
              key={v.id}
              onClick={() => onViewportChange(v.id)}
              className={cn(
                "rounded px-3 py-1.5 transition-all",
                viewport === v.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={v.label}
            >
              <v.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/store/${storeSlug}`}
          target="_blank"
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded border border-border/50 px-4 py-1.5 text-[11px] font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Draft"}
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing || saving}
          className="rounded bg-primary px-5 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
  )
}
