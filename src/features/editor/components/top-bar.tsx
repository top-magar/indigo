"use client"

import { useEditor } from "@craftjs/core"
import { Undo2, Redo2, ChevronLeft, Monitor, Tablet, Smartphone, History, Eye, Grid3x3 } from "lucide-react"
import Link from "next/link"
import { useCallback, useState, useTransition, useEffect, useRef } from "react"
import { publishAction } from "../actions/actions"
import { useSaveStore } from "../stores/save-store"
import { useCommandStore } from "../stores/command-store"
import { useEditorPermissions } from "../hooks/use-editor-permissions"
import { PresenceIndicator } from "@/components/dashboard/collaboration/presence-indicator"
import { toast } from "sonner"
import { ZoomControl } from "./zoom-control"
import { VersionHistory } from "../panels/version-history"
import { AutosaveIndicator } from "./autosave-indicator"
import { PreviewDropdown } from "./preview-dropdown"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useViewportZoomContext } from "../hooks/use-viewport-zoom"
import { useEditorPanelsContext } from "../hooks/use-editor-panels"
import { usePageManagerContext } from "../hooks/use-page-manager"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

function TopBarIconBtn({ icon: Icon, label, shortcut, onClick, disabled }: { icon: typeof Undo2; label: string; shortcut?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClick} disabled={disabled} aria-label={label}>
          <Icon className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}{shortcut && <kbd className="ml-2 text-[10px] opacity-60">{shortcut}</kbd>}</TooltipContent>
    </Tooltip>
  )
}



const viewports = [
  { id: "desktop" as const, icon: Monitor, label: "Desktop", desc: "1000px+" },
  { id: "tablet" as const, icon: Tablet, label: "Tablet", desc: "≤1000px" },
  { id: "mobile" as const, icon: Smartphone, label: "Mobile", desc: "≤750px" },
]

import { useEditorContext } from "../editor-context"
import { useConfirmDialog } from "@/hooks/use-confirm-dialog"

export function TopBar() {
  const { viewport, handleViewportChange: onViewportChange, zoom, setZoom: onZoomChange } = useViewportZoomContext()
  const { previewMode, setPreviewMode: onPreviewModeChange, showGridlines, setShowGridlines: onShowGridlinesChange } = useEditorPanelsContext()
  const { handleVersionRestore: onVersionRestore } = usePageManagerContext()
  const { tenantId, storeSlug, pageId } = useEditorContext()
  const { canUndo, canRedo, actions, query } = useEditor((_state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }))

  const dirty = useSaveStore(s => s.dirty)
  const saving = useSaveStore(s => s.saving)
  const lastSaved = useSaveStore(s => s.lastSaved)
  const { canPublish, canDelete } = useEditorPermissions()
  const [publishing, startPublish] = useTransition()
  const [historyOpen, setHistoryOpen] = useState(false)
  const prevCanUndo = useRef(canUndo)

  // Mark dirty and record Craft.js action in timeline when undo history changes
  useEffect(() => {
    if (canUndo && !prevCanUndo.current) {
      useSaveStore.getState().markDirty()
      useCommandStore.getState().recordCraftAction()
    }
    prevCanUndo.current = canUndo
  }, [canUndo])

  const handleSave = useCallback(async () => {
    await useSaveStore.getState().save()
    const { error } = useSaveStore.getState()
    if (error) toast.error(error)
    else toast.success("Draft saved")
  }, [])

  const { confirm } = useConfirmDialog()

  const handlePublish = useCallback(() => {
    startPublish(async () => {
      const ok = await confirm({ title: "Publish page?", description: "This will make your changes live immediately. Customers will see the updated page.", confirmLabel: "Publish", variant: "default" })
      if (!ok) return
      await useSaveStore.getState().save()
      if (useSaveStore.getState().error) { toast.error("Failed to save before publish"); return }
      const pubResult = await publishAction(tenantId, pageId ?? undefined)
      if (pubResult.success) toast.success("Published!")
      else toast.error(pubResult.error || "Failed to publish")
    })
  }, [query, tenantId, pageId, confirm])

  const handlePreviewNewTab = useCallback(async () => {
    await useSaveStore.getState().save()
    if (useSaveStore.getState().error) toast.error("Save failed — cannot preview")
    else window.open(`/api/preview?slug=${storeSlug}`, "_blank")
  }, [storeSlug])

  if (previewMode) {
    return (
      <div className="editor-topbar flex items-center justify-center h-11 gap-3">
        <Eye className="w-4 h-4 text-blue-600" />
        <span className="text-[13px] font-medium text-foreground">Preview Mode</span>
        <Button variant="outline" className="h-7" onClick={() => onPreviewModeChange(false)}>Exit Preview</Button>
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
        <AutosaveIndicator lastSaved={lastSaved} saving={saving} dirty={dirty} />
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
                <ToggleGroupItem value={v.id} className="h-6 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm" aria-label={v.label}>
                  <v.icon className="w-3.5 h-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>{v.label} ({v.desc})</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
        <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShowGridlinesChange(!showGridlines)}
              style={{ color: showGridlines ? "var(--editor-accent, #005bd3)" : undefined }}>
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle gridlines</TooltipContent>
        </Tooltip>
      </div>

      {/* RIGHT: Preview + Save + Publish */}
      <div className="flex items-center gap-2 px-3">
        <PreviewDropdown onPreviewInEditor={() => onPreviewModeChange(!previewMode)} onPreviewNewTab={handlePreviewNewTab} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="h-7 text-[13px]" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save draft <kbd className="ml-1 text-[10px] opacity-60">⌘S</kbd></TooltipContent>
        </Tooltip>
        {pageId && <PresenceIndicator roomId={`editor:${pageId}`} maxVisible={3} showTooltip className="mx-1" />}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="h-7 text-[13px] font-semibold" style={{ background: 'var(--editor-fill-brand)', color: 'white' }} onClick={handlePublish} disabled={publishing || saving || !canPublish}>
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
