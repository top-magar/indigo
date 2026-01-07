"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Loading03Icon,
  ArrowLeft01Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  Upload04Icon,
  Delete02Icon,
  SmartPhone01Icon,
  ComputerIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/shared/utils"
import {
  useEditorStore,
  selectCanUndo,
  selectCanRedo,
  selectIsDirty,
  selectViewport,
  selectEditorMode,
} from "@/features/editor/store"
import type { Viewport } from "@/features/editor/types"
import type { LayoutStatus } from "@/features/store/layout-service"

interface EditorHeaderProps {
  storeName: string
  storeSlug: string
  storeUrl: string
  layoutStatus: LayoutStatus | null
  saveStatus: "idle" | "saving" | "saved" | "error"
  publishStatus: "idle" | "publishing" | "published" | "error"
  isPending: boolean
  lastSaved: Date | null
  autosaveStatus: "idle" | "pending" | "saving" | "saved" | "error"
  autosaveLastSavedAt: Date | null
  autosaveError: string | null
  onSave: () => void
  onPublish: () => void
  onDiscard: () => void
  onAutosaveRetry: () => void
  onPreviewDraft: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onToggleGlobalStyles?: () => void
  onToggleSEO?: () => void
  globalStylesOpen?: boolean
  seoOpen?: boolean
}

export function EditorHeader({
  storeName,
  storeUrl,
  layoutStatus,
  publishStatus,
  isPending,
  onPublish,
  onDiscard,
  onPreviewDraft,
  zoom,
  onZoomReset,
}: EditorHeaderProps) {
  const isDirty = useEditorStore(selectIsDirty)
  const canUndo = useEditorStore(selectCanUndo)
  const canRedo = useEditorStore(selectCanRedo)
  const viewport = useEditorStore(selectViewport)
  const editorMode = useEditorStore(selectEditorMode)
  const { undo, redo, setViewport, setEditorMode } = useEditorStore()

  return (
    <header className="flex h-11 items-center justify-between border-b bg-background/95 backdrop-blur px-3">
      {/* Left: Back + Store name */}
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard"
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Back</TooltipContent>
        </Tooltip>

        <span className="text-sm font-medium">{storeName}</span>

        {/* Status dot */}
        {isDirty && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Unsaved changes" />
        )}
      </div>

      {/* Center: Essential tools only */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <div className="flex items-center">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
              canUndo ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
            )}
          >
            <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
              canRedo ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
            )}
          >
            <HugeiconsIcon icon={ArrowTurnForwardIcon} className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Viewport: Desktop/Mobile only */}
        <div className="flex items-center bg-muted/50 rounded-md p-0.5">
          <button
            onClick={() => setViewport("desktop")}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition-colors",
              viewport === "desktop" ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            <HugeiconsIcon icon={ComputerIcon} className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition-colors",
              viewport === "mobile" ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            <HugeiconsIcon icon={SmartPhone01Icon} className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Edit/Preview toggle */}
        <div className="flex items-center bg-muted/50 rounded-md p-0.5">
          <button
            onClick={() => setEditorMode("edit")}
            className={cn(
              "h-6 px-2.5 text-xs font-medium rounded transition-colors",
              editorMode === "edit" ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            Edit
          </button>
          <button
            onClick={() => setEditorMode("preview")}
            className={cn(
              "h-6 px-2.5 text-xs font-medium rounded transition-colors",
              editorMode === "preview" ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            Preview
          </button>
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Zoom - just percentage, click to reset */}
        <button
          onClick={onZoomReset}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>

      {/* Right: Publish */}
      <div className="flex items-center gap-2">
        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
              <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                View live store
              </a>
            </DropdownMenuItem>
            {layoutStatus?.hasDraft && (
              <DropdownMenuItem onClick={onPreviewDraft}>
                Preview draft
              </DropdownMenuItem>
            )}
            {layoutStatus?.hasDraft && layoutStatus?.hasPublished && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDiscard}
                  className="text-destructive focus:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
                  Discard draft
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Publish button */}
        <Button
          size="sm"
          className="h-7 px-3 text-xs"
          disabled={isPending || publishStatus === "publishing"}
          onClick={onPublish}
        >
          {publishStatus === "publishing" ? (
            <HugeiconsIcon icon={Loading03Icon} className="h-3.5 w-3.5 animate-spin" />
          ) : publishStatus === "published" ? (
            <>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5 mr-1.5" />
              Published
            </>
          ) : (
            <>
              <HugeiconsIcon icon={Upload04Icon} className="h-3.5 w-3.5 mr-1.5" />
              Publish
            </>
          )}
        </Button>
      </div>
    </header>
  )
}
