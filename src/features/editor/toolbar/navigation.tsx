"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/shared/utils"
import { useEditor } from "../core/provider"
import type { Device } from "../core/types"
import { MIcon } from "../ui/m-icon"

const devices: Array<{ id: Device; icon: string; label: string }> = [
  { id: "desktop", icon: "laptop_mac", label: "Desktop" },
  { id: "tablet", icon: "tablet_mac", label: "Tablet" },
  { id: "mobile", icon: "smartphone", label: "Mobile" },
]

type Props = {
  pageTitle: string
  onPageTitleChange: (value: string) => void
  dirty: boolean
  saving: boolean
  zoom: number
  metaDescription: string
  onMetaDescriptionChange: (value: string) => void
  ogImage: string
  onOgImageChange: (value: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset?: () => void
  onSave: () => void
  onPreview: () => void
  onExportHTML: () => void
  onPublish: () => void
  onOpenCommand: () => void
}

function IconButton({ label, icon, onClick, disabled, active }: { label: string; icon: string; onClick?: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className={cn(
          "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30",
          active && "bg-foreground text-background hover:bg-foreground hover:text-background",
        )}>
          <MIcon name={icon} size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export default function EditorNavigation({
  pageTitle,
  onPageTitleChange,
  dirty,
  saving,
  zoom,
  metaDescription,
  onMetaDescriptionChange,
  ogImage,
  onOgImageChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onSave,
  onPreview,
  onExportHTML,
  onPublish,
  onOpenCommand,
}: Props) {
  const { state, dispatch, pageName } = useEditor()
  const canUndo = state.history.currentIndex > 0
  const canRedo = state.history.currentIndex < state.history.patchCount
  const saveLabel = saving ? "Saving" : dirty ? "Unsaved changes" : "Saved"

  return (
    <TooltipProvider delayDuration={250}>
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3" onClick={(event) => event.stopPropagation()}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard/pages" aria-label="Back to pages" className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                <MIcon name="arrow_back" size={14} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Back to pages</TooltipContent>
          </Tooltip>
          <div className="hidden min-w-0 items-center gap-2 lg:flex">
            <span className="max-w-36 truncate text-sm font-medium">{pageName}</span>
            <MIcon name="chevron_right" size={13} className="text-muted-foreground" />
          </div>
          <input
            aria-label="Page name"
            value={pageTitle}
            onChange={(event) => onPageTitleChange(event.target.value)}
            className="h-8 min-w-0 max-w-44 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium outline-none hover:border-border focus:border-ring"
          />
          <div role="status" aria-live="polite" className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            {saving ? <MIcon name="sync" size={13} className="animate-spin" /> : dirty ? <span className="size-2 rounded-full bg-warning" /> : <MIcon name="cloud_done" size={13} className="text-success" />}
            <span>{saveLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton label="Undo" icon="undo" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo} />
          <IconButton label="Redo" icon="redo" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo} />
          <div className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <div className="hidden items-center rounded-lg border bg-muted/40 p-0.5 sm:flex" aria-label="Storefront viewport">
            {devices.map((device) => <IconButton key={device.id} label={`${device.label} viewport`} icon={device.icon} active={state.editor.device === device.id} onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: device.id } })} />)}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
          <button type="button" onClick={onOpenCommand} className="hidden h-8 items-center gap-2 rounded-md border bg-background px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground md:flex">
            <MIcon name="search" size={13} />
            <span>Commands</span>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-sans text-[11px]">⌘K</kbd>
          </button>
          <IconButton label="Preview store" icon="visibility" onClick={onPreview} />
          <Popover>
            <PopoverTrigger asChild><button type="button" aria-label="More editor actions" className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><MIcon name="more_horiz" size={15} /></button></PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-semibold">Page settings</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Search metadata and secondary editor actions.</p>
              </div>
              <div className="space-y-3 p-4">
                <label className="block text-xs font-medium">Search description<Input value={metaDescription} onChange={(event) => onMetaDescriptionChange(event.target.value)} className="mt-1.5 h-9 text-xs" /></label>
                <label className="block text-xs font-medium">Social image URL<Input value={ogImage} onChange={(event) => onOgImageChange(event.target.value)} className="mt-1.5 h-9 text-xs" /></label>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-1">
                    <IconButton label="Zoom out" icon="remove" onClick={onZoomOut} />
                    <button type="button" onClick={onZoomReset} className="h-8 min-w-12 rounded-md px-2 text-xs tabular-nums hover:bg-muted">{zoom}%</button>
                    <IconButton label="Zoom in" icon="add" onClick={onZoomIn} />
                  </div>
                  <button type="button" onClick={onExportHTML} className="h-8 rounded-md px-2 text-xs font-medium hover:bg-muted">Export HTML</button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={onSave} disabled={!dirty || saving} className="hidden h-8 sm:inline-flex">Save</Button>
          <Button size="sm" onClick={onPublish} disabled={saving} className="h-8">Publish</Button>
          <div className="ml-1 flex size-8 items-center justify-center rounded-full border bg-muted text-xs font-semibold" aria-label="One editor present">1</div>
        </div>
      </header>
    </TooltipProvider>
  )
}
