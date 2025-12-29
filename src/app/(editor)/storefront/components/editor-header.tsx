"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
  Store01Icon,
  ArrowLeft01Icon,
  ViewIcon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  Upload04Icon,
  Delete02Icon,
  SmartPhone01Icon,
  LaptopIcon,
  ComputerIcon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
  Edit02Icon,
  MagnetIcon,
  Layers01Icon,
  Bookmark01Icon,
  RefreshIcon,
  EyeIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  useEditorStore,
  selectCanUndo,
  selectCanRedo,
  selectIsDirty,
  selectViewport,
  selectEditorMode,
  selectSnappingEnabled,
} from "@/lib/editor/store"
import type { Viewport } from "@/lib/editor/types"
import type { LayoutStatus } from "@/lib/store/layout-service"
import { SaveButton } from "./save-button"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog"
import { PresetPalette } from "./preset-palette"
import { SavePresetDialog } from "./save-preset-dialog"
import { StartFreshDialog } from "./start-fresh-dialog"

// ============================================================================
// TYPES
// ============================================================================

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
  // Zoom controls
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

// ============================================================================
// VIEWPORT SWITCHER
// ============================================================================

const VIEWPORTS: { id: Viewport; icon: typeof ComputerIcon; label: string; shortcut: string }[] = [
  { id: "desktop", icon: ComputerIcon, label: "Desktop", shortcut: "1" },
  { id: "tablet", icon: LaptopIcon, label: "Tablet", shortcut: "2" },
  { id: "mobile", icon: SmartPhone01Icon, label: "Mobile", shortcut: "3" },
]

function ViewportSwitcher() {
  const viewport = useEditorStore(selectViewport)
  const setViewport = useEditorStore((s) => s.setViewport)

  return (
    <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
      {VIEWPORTS.map(({ id, icon, label, shortcut }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setViewport(id)}
              className={cn(
                "h-6 w-6 flex items-center justify-center rounded transition-colors",
                viewport === id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HugeiconsIcon icon={icon} className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {label} <kbd className="ml-1.5 text-[10px] opacity-60">{shortcut}</kbd>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

// ============================================================================
// EDIT/PREVIEW MODE TOGGLE
// ============================================================================

function ModeToggle() {
  const editorMode = useEditorStore(selectEditorMode)
  const setEditorMode = useEditorStore((s) => s.setEditorMode)

  return (
    <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setEditorMode('edit')}
            className={cn(
              "h-6 px-2 flex items-center gap-1.5 rounded text-xs font-medium transition-colors",
              editorMode === 'edit'
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HugeiconsIcon icon={Edit02Icon} className="h-3 w-3" />
            Edit
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Edit mode - click to select blocks</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setEditorMode('preview')}
            className={cn(
              "h-6 px-2 flex items-center gap-1.5 rounded text-xs font-medium transition-colors",
              editorMode === 'preview'
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <HugeiconsIcon icon={ViewIcon} className="h-3 w-3" />
            Preview
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Preview mode - interact with the store</TooltipContent>
      </Tooltip>
    </div>
  )
}

// ============================================================================
// SNAPPING TOGGLE
// ============================================================================

function SnappingToggle() {
  const snappingEnabled = useEditorStore(selectSnappingEnabled)
  const toggleSnapping = useEditorStore((s) => s.toggleSnapping)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleSnapping}
          className={cn(
            "h-7 w-7 flex items-center justify-center rounded-md border transition-colors",
            snappingEnabled
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <HugeiconsIcon icon={MagnetIcon} className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {snappingEnabled ? "Snapping on" : "Snapping off"} 
        <span className="ml-1.5 text-[10px] opacity-60">(hold Alt to disable)</span>
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================================================
// ZOOM CONTROLS
// ============================================================================

interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset }: ZoomControlsProps) {
  return (
    <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.25}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition-colors",
              zoom > 0.25
                ? "text-foreground hover:bg-background"
                : "text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            <HugeiconsIcon icon={ZoomOutAreaIcon} className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Zoom out</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onZoomReset}
            className="h-6 min-w-[44px] px-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Reset zoom</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 1.5}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition-colors",
              zoom < 1.5
                ? "text-foreground hover:bg-background"
                : "text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            <HugeiconsIcon icon={ZoomInAreaIcon} className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Zoom in</TooltipContent>
      </Tooltip>
    </div>
  )
}

// ============================================================================
// STATUS INDICATOR
// ============================================================================

interface StatusIndicatorProps {
  isDirty: boolean
  layoutStatus: LayoutStatus | null
}

function StatusIndicator({ isDirty, layoutStatus }: StatusIndicatorProps) {
  if (isDirty) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Unsaved</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">You have unsaved changes</TooltipContent>
      </Tooltip>
    )
  }

  if (layoutStatus?.hasDraft) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Draft</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">Draft saved, not yet published</TooltipContent>
      </Tooltip>
    )
  }

  if (layoutStatus?.hasPublished) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-2.5 w-2.5 text-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Live</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">Published and live</TooltipContent>
      </Tooltip>
    )
  }

  return null
}

// ============================================================================
// UNDO/REDO BUTTONS
// ============================================================================

function UndoRedoButtons() {
  const canUndo = useEditorStore(selectCanUndo)
  const canRedo = useEditorStore(selectCanRedo)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)

  return (
    <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition-colors",
              canUndo
                ? "text-foreground hover:bg-background"
                : "text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Undo <kbd className="ml-1.5 text-[10px] opacity-60">⌘Z</kbd>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition-colors",
              canRedo
                ? "text-foreground hover:bg-background"
                : "text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            <HugeiconsIcon icon={ArrowTurnForwardIcon} className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Redo <kbd className="ml-1.5 text-[10px] opacity-60">⌘⇧Z</kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EditorHeader({
  storeName,
  storeSlug,
  storeUrl,
  layoutStatus,
  saveStatus,
  publishStatus,
  isPending,
  lastSaved,
  autosaveStatus,
  autosaveLastSavedAt,
  autosaveError,
  onSave,
  onPublish,
  onDiscard,
  onAutosaveRetry,
  onPreviewDraft,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: EditorHeaderProps) {
  const isDirty = useEditorStore(selectIsDirty)

  return (
    <header className="flex h-10 shrink-0 items-center border-b bg-background px-2 gap-1.5">
      {/* Left: Back + Store name + Status */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
              <Link href="/dashboard">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Back to Dashboard</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex items-center gap-1.5 min-w-0">
          <HugeiconsIcon icon={Store01Icon} className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-sm font-medium truncate max-w-[120px]">{storeName}</span>
          <StatusIndicator isDirty={isDirty} layoutStatus={layoutStatus} />
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Presets & Start Fresh */}
        <div className="flex items-center gap-0.5">
          <PresetPalette
            trigger={
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                <HugeiconsIcon icon={Layers01Icon} className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Presets</span>
              </Button>
            }
          />
          <SavePresetDialog
            trigger={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <HugeiconsIcon icon={Bookmark01Icon} className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Save as Preset</TooltipContent>
              </Tooltip>
            }
          />
          <StartFreshDialog
            storeSlug={storeSlug}
            trigger={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <HugeiconsIcon icon={RefreshIcon} className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Start Fresh</TooltipContent>
              </Tooltip>
            }
          />
        </div>
      </div>

      {/* Center: Tools */}
      <div className="flex-1 flex items-center justify-center gap-1.5">
        <UndoRedoButtons />
        <Separator orientation="vertical" className="h-4" />
        <ModeToggle />
        <Separator orientation="vertical" className="h-4" />
        <ViewportSwitcher />
        <Separator orientation="vertical" className="h-4" />
        <ZoomControls 
          zoom={zoom} 
          onZoomIn={onZoomIn} 
          onZoomOut={onZoomOut} 
          onZoomReset={onZoomReset} 
        />
        <Separator orientation="vertical" className="h-4" />
        <SnappingToggle />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Preview in new tab */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
                View Live Store
              </a>
            </DropdownMenuItem>
            {layoutStatus?.hasDraft && (
              <DropdownMenuItem onClick={onPreviewDraft}>
                <HugeiconsIcon icon={EyeIcon} className="h-4 w-4 mr-2" />
                Preview Draft
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Shortcuts */}
        <KeyboardShortcutsDialog iconOnly />

        <Separator orientation="vertical" className="h-4 mx-0.5" />

        {/* Save */}
        <SaveButton
          saveStatus={saveStatus}
          onSave={onSave}
          isDirty={isDirty}
          isPending={isPending}
          lastSaved={lastSaved}
          autosaveStatus={autosaveStatus}
          autosaveLastSavedAt={autosaveLastSavedAt}
          autosaveError={autosaveError}
          onAutosaveRetry={onAutosaveRetry}
        />

        {/* Publish */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs"
              disabled={isPending || publishStatus === "publishing"}
            >
              {publishStatus === "publishing" ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">Publishing</span>
                </>
              ) : publishStatus === "published" ? (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Published</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Upload04Icon} className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Publish</span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onPublish}>
              <HugeiconsIcon icon={Upload04Icon} className="h-4 w-4 mr-2" />
              Publish Changes
            </DropdownMenuItem>
            {layoutStatus?.hasDraft && layoutStatus?.hasPublished && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDiscard}
                  className="text-destructive focus:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
                  Discard Draft
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
