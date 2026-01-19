# Visual Editor Code Reference

This document contains all the code for the Storefront Visual Editor.

## File Structure

```
app/(editor)/storefront/
├── page.tsx                    # Server component entry point
├── visual-editor.tsx           # Main client component
├── actions.ts                  # Server actions
├── loading.tsx                 # Loading skeleton
└── components/
    ├── inline-preview.tsx      # Direct canvas preview (edit mode)
    ├── live-preview.tsx        # Iframe preview with device frames (preview mode)
    ├── layers-panel.tsx        # Block tree view with drag-drop
    ├── settings-panel.tsx      # Block property editor
    ├── block-palette.tsx       # Add block dialog
    ├── command-palette.tsx     # Keyboard command palette (⌘K)
    ├── editor-header.tsx       # Top toolbar with actions
    └── keyboard-shortcuts-dialog.tsx # Shortcuts reference
```

---

## 1. page.tsx (Server Entry Point)

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VisualEditor } from "./visual-editor"
import { getLayoutForEditing } from "@/lib/store/layout-service"
import { createDefaultHomepageLayout } from "@/lib/store/default-layout"

export const dynamic = "force-dynamic"

export default async function StorefrontEditorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, tenants(id, slug, name)")
    .eq("id", user.id)
    .single()

  const tenantData = userData?.tenants && !Array.isArray(userData.tenants)
    ? userData.tenants as { id: string; slug: string; name: string }
    : null

  if (!tenantData) redirect("/dashboard")

  const { layout: existingLayout, templateId } = await getLayoutForEditing(
    tenantData.id,
    tenantData.slug
  )

  const blocks = existingLayout?.blocks ?? createDefaultHomepageLayout(tenantData.slug).blocks

  return (
    <VisualEditor
      tenantId={tenantData.id}
      storeSlug={tenantData.slug}
      storeName={tenantData.name}
      initialBlocks={blocks}
      initialTemplateId={templateId}
    />
  )
}
```

---

## 2. visual-editor.tsx (Main Component)

```tsx
"use client"

import { useState, useTransition, useCallback, useMemo, useId, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Loading03Icon,
  Store01Icon,
  SparklesIcon,
  ShoppingBag01Icon,
  Leaf01Icon,
  Target01Icon,
  RefreshIcon,
  AlertCircleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ViewIcon,
  Cancel01Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  Layers01Icon,
  GridIcon,
  Menu01Icon,
  Image01Icon,
  FavouriteIcon,
  Megaphone01Icon,
  MessageMultiple01Icon,
  ShieldIcon,
  Mail01Icon,
  LayoutBottomIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { TEMPLATE_LIST, type TemplateId } from "@/components/store/blocks/templates"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { SortableBlockItem } from "./components/sortable-block-item"
import { BlockPalette } from "./components/block-palette"
import { BlockSettingsDialog } from "./components/block-settings-dialog"
import { LivePreview } from "./components/live-preview"
import {
  applyTemplate,
  updateBlockVisibility,
  updateBlockVariant,
  reorderBlocks,
  resetToDefault,
  updateBlockSettings,
  addBlock,
  removeBlock,
} from "./actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface VisualEditorProps {
  tenantId: string
  storeSlug: string
  storeName: string
  initialBlocks: StoreBlock[]
  initialTemplateId: string | null
}

const TEMPLATE_ICONS: Record<TemplateId, typeof Store01Icon> = {
  "modern-minimal": SparklesIcon,
  "bold-vibrant": Target01Icon,
  "classic-commerce": Store01Icon,
  "product-focused": ShoppingBag01Icon,
  "lifestyle-brand": Leaf01Icon,
}

const BLOCK_ICONS: Record<BlockType, typeof Menu01Icon> = {
  header: Menu01Icon,
  hero: Image01Icon,
  "featured-product": FavouriteIcon,
  "product-grid": GridIcon,
  "promotional-banner": Megaphone01Icon,
  testimonials: MessageMultiple01Icon,
  "trust-signals": ShieldIcon,
  newsletter: Mail01Icon,
  footer: LayoutBottomIcon,
}

const MAX_HISTORY_SIZE = 50

export function VisualEditor({
  tenantId,
  storeSlug,
  storeName,
  initialBlocks,
  initialTemplateId,
}: VisualEditorProps) {
  const router = useRouter()
  const dndId = useId()
  const [isPending, startTransition] = useTransition()
  const [blocks, setBlocks] = useState<StoreBlock[]>(initialBlocks)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(
    initialTemplateId as TemplateId | null
  )
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingBlock, setEditingBlock] = useState<StoreBlock | null>(null)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [history, setHistory] = useState<StoreBlock[][]>([initialBlocks])
  const [historyIndex, setHistoryIndex] = useState(0)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const refreshPreview = useCallback(() => setPreviewKey((k) => k + 1), [])

  const pushHistory = useCallback((newBlocks: StoreBlock[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newBlocks)
      if (newHistory.length > MAX_HISTORY_SIZE) newHistory.shift()
      return newHistory
    })
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_SIZE - 1))
    setHasUnsavedChanges(true)
  }, [historyIndex])

  const handleUndo = useCallback(() => {
    if (!canUndo || isPending) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setBlocks(history[newIndex])
    setError(null)
    refreshPreview()
  }, [canUndo, isPending, historyIndex, history, refreshPreview])

  const handleRedo = useCallback(() => {
    if (!canRedo || isPending) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setBlocks(history[newIndex])
    setError(null)
    refreshPreview()
  }, [canRedo, isPending, historyIndex, history, refreshPreview])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== "undefined" && navigator.userAgent.includes("Mac")
      const modifier = isMac ? e.metaKey : e.ctrlKey
      if (modifier && e.key === "z") {
        e.preventDefault()
        e.shiftKey ? handleRedo() : handleUndo()
      }
      if (modifier && e.key === "y") {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleUndo, handleRedo])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sortedBlocks = useMemo(() => [...blocks].sort((a, b) => a.order - b.order), [blocks])
  const existingBlockTypes = useMemo(() => blocks.map((b) => b.type), [blocks])
  const visibleBlocksCount = useMemo(() => blocks.filter((b) => b.visible).length, [blocks])
  const storeUrl = `/store/${storeSlug}`
  const activeBlock = activeDragId ? blocks.find((b) => b.id === activeDragId) : null

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    setActiveDragId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id)
    const newIndex = sortedBlocks.findIndex((b) => b.id === over.id)
    const newBlocks = arrayMove(sortedBlocks, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }))
    setBlocks(newBlocks)
    setError(null)

    startTransition(async () => {
      const result = await reorderBlocks(tenantId, storeSlug, newBlocks.map((b) => b.id), blocks)
      if (!result.success) {
        setBlocks(blocks)
        setError(result.error)
        toast.error(result.error)
      } else {
        pushHistory(newBlocks)
        toast.success("Block order updated")
        refreshPreview()
        router.refresh()
      }
    })
  }, [tenantId, storeSlug, sortedBlocks, blocks, router, refreshPreview, pushHistory])

  const handleApplyTemplate = useCallback((templateId: TemplateId) => {
    setError(null)
    startTransition(async () => {
      const result = await applyTemplate(tenantId, storeSlug, templateId)
      if (result.success && result.data) {
        setSelectedTemplate(templateId)
        setBlocks(result.data.blocks)
        pushHistory(result.data.blocks)
        toast.success("Template applied")
        refreshPreview()
        router.refresh()
      } else {
        setError(result.error || "Failed to apply template")
        toast.error(result.error)
      }
    })
  }, [tenantId, storeSlug, router, refreshPreview, pushHistory])

  const handleToggleVisibility = useCallback((blockId: string, visible: boolean) => {
    const updatedBlocks = blocks.map((b) => b.id === blockId ? { ...b, visible } : b)
    setBlocks(updatedBlocks)
    setError(null)
    startTransition(async () => {
      const result = await updateBlockVisibility(tenantId, storeSlug, blockId, visible, blocks)
      if (!result.success) {
        setBlocks(blocks)
        setError(result.error)
        toast.error(result.error)
      } else {
        pushHistory(updatedBlocks)
        toast.success(`Block ${visible ? "shown" : "hidden"}`)
        refreshPreview()
        router.refresh()
      }
    })
  }, [tenantId, storeSlug, blocks, router, refreshPreview, pushHistory])

  const handleChangeVariant = useCallback((blockId: string, variant: string) => {
    const updatedBlocks = blocks.map((b) => b.id === blockId ? { ...b, variant } : b) as StoreBlock[]
    setBlocks(updatedBlocks)
    setError(null)
    startTransition(async () => {
      const result = await updateBlockVariant(tenantId, storeSlug, blockId, variant, blocks)
      if (!result.success) {
        setBlocks(blocks)
        setError(result.error)
        toast.error(result.error)
      } else {
        pushHistory(updatedBlocks)
        toast.success("Variant updated")
        refreshPreview()
        router.refresh()
      }
    })
  }, [tenantId, storeSlug, blocks, router, refreshPreview, pushHistory])

  const handleEditBlock = useCallback((block: StoreBlock) => {
    setEditingBlock(block)
    setSettingsDialogOpen(true)
  }, [])

  const handleSaveBlockSettings = useCallback((newSettings: Record<string, unknown>) => {
    if (!editingBlock) return
    const updatedBlocks = blocks.map((b) =>
      b.id === editingBlock.id ? { ...b, settings: { ...b.settings, ...newSettings } } : b
    ) as StoreBlock[]
    setBlocks(updatedBlocks)
    setError(null)
    startTransition(async () => {
      const result = await updateBlockSettings(tenantId, storeSlug, editingBlock.id, newSettings, blocks)
      if (!result.success) {
        setBlocks(blocks)
        setError(result.error)
        toast.error(result.error)
      } else {
        pushHistory(updatedBlocks)
        toast.success("Settings saved")
        refreshPreview()
        router.refresh()
      }
    })
  }, [tenantId, storeSlug, blocks, editingBlock, router, refreshPreview, pushHistory])

  const handleAddBlock = useCallback((type: BlockType, variant: string) => {
    const blockMeta = BLOCK_REGISTRY[type]
    if (!blockMeta) return
    const newBlock: StoreBlock = {
      id: `${type}-${Date.now()}`,
      type,
      variant,
      order: blocks.length,
      visible: true,
      settings: { ...blockMeta.defaultSettings },
    } as StoreBlock
    const updatedBlocks = [...blocks, newBlock]
    setBlocks(updatedBlocks)
    setError(null)
    startTransition(async () => {
      const result = await addBlock(tenantId, storeSlug, newBlock, blocks)
      if (!result.success) {
        setBlocks(blocks)
        setError(result.error)
        toast.error(result.error)
      } else {
        pushHistory(updatedBlocks)
        toast.success(`${blockMeta.name} added`)
        refreshPreview()
        router.refresh()
      }
    })
  }, [tenantId, storeSlug, blocks, router, refreshPreview, pushHistory])

  const handleRemoveBlock = useCallback((blockId: string) => {
    const updatedBlocks = blocks.filter((b) => b.id !== blockId).map((b, i) => ({ ...b, order: i }))
    setBlocks(updatedBlocks)
    setError(null)
    startTransition(async () => {
      const result = await removeBlock(tenantId, storeSlug, blockId, blocks)
      if (!result.success) {
        setBlocks(blocks)
        setError(result.error)
        toast.error(result.error)
      } else {
        pushHistory(updatedBlocks)
        toast.success("Block removed")
        refreshPreview()
        router.refresh()
      }
    })
  }, [tenantId, storeSlug, blocks, router, refreshPreview, pushHistory])

  const handleReset = useCallback(() => {
    setError(null)
    startTransition(async () => {
      const result = await resetToDefault(tenantId, storeSlug)
      if (result.success) {
        setSelectedTemplate(null)
        setHistory([initialBlocks])
        setHistoryIndex(0)
        setHasUnsavedChanges(false)
        toast.success("Layout reset")
        refreshPreview()
        router.refresh()
      } else {
        setError(result.error)
        toast.error(result.error)
      }
    })
  }, [tenantId, storeSlug, router, refreshPreview, initialBlocks])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen w-full flex-col bg-background">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 z-50">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/dashboard/settings")}>
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Back to Settings</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={Store01Icon} className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-none">{storeName}</h1>
                <p className="text-[11px] text-muted-foreground mt-0.5">Storefront Editor</p>
              </div>
            </div>
          </div>

          {/* Center Status */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 text-emerald-500" />
                <span>All saved</span>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" disabled={!canUndo || isPending} onClick={handleUndo}>
                    <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (⌘Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" disabled={!canRedo || isPending} onClick={handleRedo}>
                    <HugeiconsIcon icon={ArrowTurnForwardIcon} className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isPending} className="h-8 text-muted-foreground">
                  <HugeiconsIcon icon={RefreshIcon} className="mr-1.5 h-4 w-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset layout?</AlertDialogTitle>
                  <AlertDialogDescription>This will remove all customizations.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground">Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button asChild size="sm" className="h-8 gap-1.5">
              <Link href={storeUrl} target="_blank">
                <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
                Preview
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <div className="flex items-center gap-2 text-destructive">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
              <p>{error}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setError(null)}>
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Content with Resizable Panels */}
        <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">
          {/* Left Panel - Editor Sidebar */}
          <ResizablePanel 
            defaultSize={28} 
            minSize={24} 
            maxSize={40} 
            collapsible 
            collapsedSize="0%" 
            className="flex flex-col"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Editor</span>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {/* Templates Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Templates</span>
                    </div>
                    {selectedTemplate && <Badge variant="secondary" className="text-[10px] h-4">Active</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEMPLATE_LIST.map((template) => {
                      const Icon = TEMPLATE_ICONS[template.id]
                      const isSelected = selectedTemplate === template.id
                      return (
                        <Tooltip key={template.id}>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "relative flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all hover:border-primary/50 hover:bg-accent",
                                isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20"
                              )}
                              disabled={isPending}
                              onClick={() => handleApplyTemplate(template.id)}
                            >
                              <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-md",
                                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                              )}>
                                <HugeiconsIcon icon={Icon} className="h-4 w-4" />
                              </div>
                              <span className="text-[10px] font-medium">{template.name.split(" ")[0]}</span>
                              {isSelected && (
                                <div className="absolute -right-1 -top-1">
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" />
                                  </div>
                                </div>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[180px]">
                            <p className="font-medium text-xs">{template.name}</p>
                            <p className="text-[10px] text-muted-foreground">{template.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>

                {/* Blocks Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Layers01Icon} className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blocks</span>
                      <Badge variant="outline" className="text-[10px] h-4">{visibleBlocksCount}/{blocks.length}</Badge>
                    </div>
                    <BlockPalette onAddBlock={handleAddBlock} existingBlockTypes={existingBlockTypes} />
                  </div>

                  <DndContext
                    id={dndId}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={sortedBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1.5">
                        {sortedBlocks.map((block) => (
                          <SortableBlockItem
                            key={block.id}
                            block={block}
                            isSelected={selectedBlockId === block.id}
                            isPending={isPending}
                            onSelect={() => setSelectedBlockId(block.id)}
                            onEdit={() => handleEditBlock(block)}
                            onToggleVisibility={(visible) => handleToggleVisibility(block.id, visible)}
                            onChangeVariant={(variant) => handleChangeVariant(block.id, variant)}
                            onRemove={() => handleRemoveBlock(block.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeBlock && (
                        <div className="flex items-center gap-2 rounded-lg border bg-card p-2 shadow-lg opacity-90">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <HugeiconsIcon icon={BLOCK_ICONS[activeBlock.type]} className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">{BLOCK_REGISTRY[activeBlock.type]?.name}</span>
                        </div>
                      )}
                    </DragOverlay>
                  </DndContext>
                </div>
              </div>
            </ScrollArea>

            {/* Panel Footer */}
            <div className="border-t px-4 py-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{blocks.length} blocks</span>
                <span>{visibleBlocksCount} visible</span>
              </div>
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle withHandle />

          {/* Right Panel - Live Preview */}
          <ResizablePanel defaultSize={72} className="bg-muted/30">
            <LivePreview storeUrl={storeUrl} refreshKey={previewKey} />
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Block Settings Dialog */}
        <BlockSettingsDialog
          block={editingBlock}
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          onSave={handleSaveBlockSettings}
        />
      </div>
    </TooltipProvider>
  )
}
```

---

## 3. actions.ts (Server Actions)

```typescript
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { StoreBlock } from "@/types/blocks"
import type { TemplateId } from "@/components/store/blocks/templates"
import { getTemplateById, templateToLayout } from "@/components/store/blocks/templates"
import { saveLayout, verifyTenantAccess } from "@/lib/store/layout-service"

export type ActionResult<T = void> = 
  | { success: true; data?: T; error?: never }
  | { success: false; error: string; data?: never }

export async function saveStoreLayout(
  tenantId: string,
  storeSlug: string,
  data: {
    templateId?: TemplateId | null
    blocks: StoreBlock[]
  }
): Promise<ActionResult<{ layoutId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const hasAccess = await verifyTenantAccess(user.id, tenantId)
  if (!hasAccess) {
    return { success: false, error: "You don't have access to this store" }
  }

  if (!Array.isArray(data.blocks) || data.blocks.length === 0) {
    return { success: false, error: "Invalid layout: blocks are required" }
  }

  const result = await saveLayout(tenantId, data.blocks, {
    templateId: data.templateId,
    status: "published",
  })

  if (!result.success) {
    return { success: false, error: result.error || "Failed to save layout" }
  }

  revalidatePath("/storefront")
  revalidatePath(`/store/${storeSlug}`)

  return { success: true, data: { layoutId: result.layoutId! } }
}

export async function applyTemplate(
  tenantId: string,
  storeSlug: string,
  templateId: TemplateId
): Promise<ActionResult<{ blocks: StoreBlock[] }>> {
  const template = getTemplateById(templateId)
  if (!template) {
    return { success: false, error: "Template not found" }
  }

  const layout = templateToLayout(template, storeSlug)
  
  const result = await saveStoreLayout(tenantId, storeSlug, {
    templateId,
    blocks: layout.blocks,
  })

  if (!result.success) {
    return { success: false, error: result.error }
  }

  return { success: true, data: { blocks: layout.blocks } }
}

export async function updateBlockVisibility(
  tenantId: string,
  storeSlug: string,
  blockId: string,
  visible: boolean,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = currentBlocks.map((block) =>
    block.id === blockId ? { ...block, visible } : block
  )

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

export async function updateBlockVariant(
  tenantId: string,
  storeSlug: string,
  blockId: string,
  variant: string,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = currentBlocks.map((block) =>
    block.id === blockId ? { ...block, variant } : block
  ) as StoreBlock[]

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

export async function reorderBlocks(
  tenantId: string,
  storeSlug: string,
  blockIds: string[],
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const blockMap = new Map(currentBlocks.map((b) => [b.id, b]))
  const reorderedBlocks = blockIds
    .map((id, index) => {
      const block = blockMap.get(id)
      if (block) {
        return { ...block, order: index }
      }
      return null
    })
    .filter((b): b is StoreBlock => b !== null)

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: reorderedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

export async function updateBlockSettings(
  tenantId: string,
  storeSlug: string,
  blockId: string,
  settings: Record<string, unknown>,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = currentBlocks.map((block) =>
    block.id === blockId
      ? { ...block, settings: { ...block.settings, ...settings } }
      : block
  ) as StoreBlock[]

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

export async function addBlock(
  tenantId: string,
  storeSlug: string,
  block: StoreBlock,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = [...currentBlocks, block]
  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

export async function removeBlock(
  tenantId: string,
  storeSlug: string,
  blockId: string,
  currentBlocks: StoreBlock[]
): Promise<ActionResult> {
  const updatedBlocks = currentBlocks
    .filter((b) => b.id !== blockId)
    .map((b, i) => ({ ...b, order: i }))

  const result = await saveStoreLayout(tenantId, storeSlug, { blocks: updatedBlocks })
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true }
}

export async function resetToDefault(
  tenantId: string,
  storeSlug: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const hasAccess = await verifyTenantAccess(user.id, tenantId)
  if (!hasAccess) {
    return { success: false, error: "You don't have access to this store" }
  }

  const { error } = await supabase
    .from("store_layouts")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("is_homepage", true)

  if (error) {
    return { success: false, error: "Failed to reset layout" }
  }

  revalidatePath("/storefront")
  revalidatePath(`/store/${storeSlug}`)

  return { success: true }
}
```

---

## 4. components/live-preview.tsx

```tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SmartPhone01Icon,
  LaptopIcon,
  ComputerIcon,
  RefreshIcon,
  ArrowExpand01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type Viewport = "mobile" | "tablet" | "desktop"

const VIEWPORT_CONFIG: Record<Viewport, { 
  width: number
  height: number
  label: string
  icon: typeof SmartPhone01Icon
}> = {
  mobile: { width: 375, height: 812, label: "Mobile", icon: SmartPhone01Icon },
  tablet: { width: 768, height: 1024, label: "Tablet", icon: LaptopIcon },
  desktop: { width: 1440, height: 900, label: "Desktop", icon: ComputerIcon },
}

interface LivePreviewProps {
  storeUrl: string
  refreshKey?: number
}

export function LivePreview({ storeUrl, refreshKey = 0 }: LivePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const [isLoading, setIsLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const [manualZoom, setManualZoom] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const config = VIEWPORT_CONFIG[viewport]
  const effectiveScale = manualZoom ?? scale

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || manualZoom !== null) return
      const containerWidth = containerRef.current.clientWidth - 64
      const containerHeight = containerRef.current.clientHeight - 64
      const viewportWidth = config.width
      const viewportHeight = config.height + (viewport === "desktop" ? 40 : 0)
      
      const scaleX = containerWidth / viewportWidth
      const scaleY = containerHeight / viewportHeight
      const newScale = Math.min(1, scaleX, scaleY)
      setScale(newScale)
    }

    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [viewport, config, manualZoom])

  useEffect(() => {
    setManualZoom(null)
  }, [viewport])

  const handleRefresh = () => {
    setIsLoading(true)
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const handleOpenInNewTab = () => {
    window.open(storeUrl, "_blank")
  }

  const handleZoomIn = () => {
    const current = manualZoom ?? scale
    setManualZoom(Math.min(1.5, current + 0.1))
  }

  const handleZoomOut = () => {
    const current = manualZoom ?? scale
    setManualZoom(Math.max(0.25, current - 0.1))
  }

  const handleResetZoom = () => {
    setManualZoom(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
        {/* Viewport switcher */}
        <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
          {(Object.keys(VIEWPORT_CONFIG) as Viewport[]).map((vp) => {
            const vpConfig = VIEWPORT_CONFIG[vp]
            return (
              <Tooltip key={vp}>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewport === vp ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 px-3 gap-2 rounded-md",
                      viewport === vp && "shadow-sm"
                    )}
                    onClick={() => setViewport(vp)}
                  >
                    <HugeiconsIcon icon={vpConfig.icon} className="h-4 w-4" />
                    <span className="hidden sm:inline">{vpConfig.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {vpConfig.label} ({vpConfig.width}×{vpConfig.height})
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleZoomOut}
                  disabled={effectiveScale <= 0.25}
                >
                  <span className="text-sm font-medium">−</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>
            
            <button 
              onClick={handleResetZoom}
              className="min-w-[52px] text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              {Math.round(effectiveScale * 100)}%
            </button>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleZoomIn}
                  disabled={effectiveScale >= 1.5}
                >
                  <span className="text-sm font-medium">+</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
                <HugeiconsIcon icon={RefreshIcon} className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh preview</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenInNewTab}>
                <HugeiconsIcon icon={ArrowExpand01Icon} className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in new tab</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Preview container */}
      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-8"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      >
        <div
          className="origin-top transition-transform duration-300 ease-out"
          style={{
            width: config.width,
            transform: `scale(${effectiveScale})`,
          }}
        >
          {/* Device frame */}
          <div
            className={cn(
              "overflow-hidden bg-background transition-all duration-300",
              viewport === "mobile" && "rounded-[3rem] border-[12px] border-gray-900 dark:border-gray-700 shadow-2xl",
              viewport === "tablet" && "rounded-[1.5rem] border-[8px] border-gray-800 dark:border-gray-600 shadow-2xl",
              viewport === "desktop" && "rounded-xl border border-border shadow-2xl"
            )}
          >
            {/* Mobile notch */}
            {viewport === "mobile" && (
              <div className="relative h-7 bg-gray-900 dark:bg-gray-700">
                <div className="absolute left-1/2 top-1 -translate-x-1/2 h-5 w-28 rounded-full bg-black" />
              </div>
            )}

            {/* Browser chrome for desktop */}
            {viewport === "desktop" && (
              <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 rounded-lg bg-background border px-3 py-1.5 text-xs text-muted-foreground max-w-md w-full">
                    <div className="h-3 w-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="truncate">{storeUrl}</span>
                  </div>
                </div>
                <div className="w-[52px]" />
              </div>
            )}

            {/* Iframe container */}
            <div 
              className="relative bg-background"
              style={{ 
                height: viewport === "mobile" 
                  ? config.height - 28 - 20
                  : config.height 
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full border-2 border-muted" />
                      <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                    <span className="text-sm text-muted-foreground">Loading preview...</span>
                  </div>
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                key={refreshKey}
                src={storeUrl}
                className="h-full w-full"
                onLoad={() => setIsLoading(false)}
                title="Store Preview"
              />
            </div>

            {/* Mobile home indicator */}
            {viewport === "mobile" && (
              <div className="flex h-5 items-center justify-center bg-gray-900 dark:bg-gray-700">
                <div className="h-1 w-32 rounded-full bg-white/30" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. components/block-palette.tsx

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Menu01Icon,
  Image01Icon,
  FavouriteIcon,
  GridIcon,
  Megaphone01Icon,
  MessageMultiple01Icon,
  ShieldIcon,
  Mail01Icon,
  LayoutBottomIcon,
  Search01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import type { BlockType } from "@/types/blocks"
import { cn } from "@/lib/utils"

const BLOCK_ICONS: Record<BlockType, typeof Menu01Icon> = {
  header: Menu01Icon,
  hero: Image01Icon,
  "featured-product": FavouriteIcon,
  "product-grid": GridIcon,
  "promotional-banner": Megaphone01Icon,
  testimonials: MessageMultiple01Icon,
  "trust-signals": ShieldIcon,
  newsletter: Mail01Icon,
  footer: LayoutBottomIcon,
}

const BLOCK_COLORS: Record<BlockType, string> = {
  header: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20",
  hero: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20",
  "featured-product": "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20",
  "product-grid": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20",
  "promotional-banner": "bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20",
  testimonials: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20",
  "trust-signals": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20",
  newsletter: "bg-pink-500/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500/20",
  footer: "bg-slate-500/10 text-slate-600 dark:text-slate-400 group-hover:bg-slate-500/20",
}

interface BlockPaletteProps {
  onAddBlock: (type: BlockType, variant: string) => void
  existingBlockTypes: BlockType[]
}

export function BlockPalette({ onAddBlock, existingBlockTypes }: BlockPaletteProps) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<BlockType | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const blockTypes = Object.entries(BLOCK_REGISTRY)
  
  const filteredBlocks = blockTypes.filter(([type, meta]) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      meta.name.toLowerCase().includes(query) ||
      meta.description.toLowerCase().includes(query) ||
      type.toLowerCase().includes(query)
    )
  })

  const handleAddBlock = (type: BlockType, variant: string) => {
    onAddBlock(type, variant)
    setOpen(false)
    setSelectedType(null)
    setSearchQuery("")
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedType(null)
    setSearchQuery("")
  }

  const selectedMeta = selectedType ? BLOCK_REGISTRY[selectedType] : null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose()
      else setOpen(true)
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={(e) => e.stopPropagation()}
        >
          <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            {selectedType && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => setSelectedType(null)}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle>
                {selectedType ? `Add ${selectedMeta?.name}` : "Add Block"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {selectedType 
                  ? "Choose a variant style for this block"
                  : "Select a block type to add to your storefront"
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {!selectedType ? (
            <div className="p-4 space-y-3">
              <div className="relative">
                <HugeiconsIcon 
                  icon={Search01Icon} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                />
                <Input
                  placeholder="Search blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-1.5">
                {filteredBlocks.map(([type, meta]) => {
                  const blockType = type as BlockType
                  const Icon = BLOCK_ICONS[blockType]
                  const colorClass = BLOCK_COLORS[blockType]
                  const isUnique = blockType === "header" || blockType === "footer"
                  const alreadyExists = existingBlockTypes.includes(blockType)
                  const isDisabled = isUnique && alreadyExists

                  return (
                    <button
                      key={type}
                      onClick={() => !isDisabled && setSelectedType(blockType)}
                      disabled={isDisabled}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        isDisabled 
                          ? "cursor-not-allowed opacity-50 bg-muted/50" 
                          : "hover:border-primary/50 hover:bg-accent hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                        colorClass
                      )}>
                        <HugeiconsIcon icon={Icon} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{meta.name}</span>
                          {isDisabled && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Added
                            </Badge>
                          )}
                          {isUnique && !alreadyExists && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Unique
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {meta.description}
                        </p>
                      </div>
                      {!isDisabled && (
                        <HugeiconsIcon 
                          icon={Add01Icon} 
                          className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" 
                        />
                      )}
                    </button>
                  )
                })}
                
                {filteredBlocks.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No blocks found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {selectedMeta?.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleAddBlock(selectedType, variant.id)}
                  className="group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-accent hover:shadow-sm"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium text-sm">{variant.name}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-primary">Add</span>
                      <HugeiconsIcon 
                        icon={Add01Icon} 
                        className="h-4 w-4 text-primary" 
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {variant.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 6. components/sortable-block-item.tsx

```tsx
"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DragDropVerticalIcon,
  MoreHorizontalIcon,
  Edit02Icon,
  Delete02Icon,
  ViewIcon,
  ViewOffSlashIcon,
  CheckmarkCircle02Icon,
  Menu01Icon,
  Image01Icon,
  FavouriteIcon,
  GridIcon,
  Megaphone01Icon,
  MessageMultiple01Icon,
  ShieldIcon,
  Mail01Icon,
  LayoutBottomIcon,
  Layers01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { BLOCK_REGISTRY, getVariantMeta } from "@/components/store/blocks/registry"

const BLOCK_ICONS: Record<BlockType, typeof Menu01Icon> = {
  header: Menu01Icon,
  hero: Image01Icon,
  "featured-product": FavouriteIcon,
  "product-grid": GridIcon,
  "promotional-banner": Megaphone01Icon,
  testimonials: MessageMultiple01Icon,
  "trust-signals": ShieldIcon,
  newsletter: Mail01Icon,
  footer: LayoutBottomIcon,
}

const BLOCK_COLORS: Record<BlockType, string> = {
  header: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  hero: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "featured-product": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "product-grid": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "promotional-banner": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  testimonials: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "trust-signals": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  newsletter: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  footer: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
}

interface SortableBlockItemProps {
  block: StoreBlock
  isSelected: boolean
  isPending: boolean
  onSelect: () => void
  onEdit: () => void
  onToggleVisibility: (visible: boolean) => void
  onChangeVariant: (variant: string) => void
  onRemove: () => void
}

export function SortableBlockItem({
  block,
  isSelected,
  isPending,
  onSelect,
  onEdit,
  onToggleVisibility,
  onChangeVariant,
  onRemove,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const blockMeta = BLOCK_REGISTRY[block.type]
  if (!blockMeta) return null

  const BlockIcon = BLOCK_ICONS[block.type]
  const blockColor = BLOCK_COLORS[block.type]
  const isProtected = block.type === "header" || block.type === "footer"
  const currentVariant = getVariantMeta(block.type, block.variant)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-2 rounded-lg border bg-background p-2 transition-all duration-200",
        isDragging && "opacity-50 shadow-xl scale-[1.02] z-50",
        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background border-primary/50",
        !block.visible && "opacity-50",
        isPending && "pointer-events-none",
        !isDragging && "hover:border-muted-foreground/30 hover:shadow-sm"
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            {...attributes}
            {...listeners}
            className={cn(
              "shrink-0 cursor-grab touch-none rounded-md p-1 text-muted-foreground/50 transition-colors",
              "hover:bg-muted hover:text-muted-foreground active:cursor-grabbing",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <HugeiconsIcon icon={DragDropVerticalIcon} className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Drag to reorder</TooltipContent>
      </Tooltip>

      {/* Block icon with color */}
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
        blockColor
      )}>
        <HugeiconsIcon icon={BlockIcon} className="h-4 w-4" />
      </div>

      {/* Block info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{blockMeta.name}</span>
          {!block.visible && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-muted-foreground">
              Hidden
            </Badge>
          )}
          {isProtected && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              Required
            </Badge>
          )}
        </div>
        <p className="truncate text-[11px] text-muted-foreground">
          {currentVariant?.name || block.variant}
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(!block.visible)
              }}
            >
              <HugeiconsIcon 
                icon={block.visible ? ViewIcon : ViewOffSlashIcon} 
                className="h-3.5 w-3.5" 
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{block.visible ? "Hide" : "Show"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <HugeiconsIcon icon={Settings02Icon} className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>

      {/* More actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Block Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onEdit}>
            <HugeiconsIcon icon={Edit02Icon} className="mr-2 h-4 w-4" />
            Edit Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onToggleVisibility(!block.visible)}>
            <HugeiconsIcon 
              icon={block.visible ? ViewOffSlashIcon : ViewIcon} 
              className="mr-2 h-4 w-4" 
            />
            {block.visible ? "Hide Block" : "Show Block"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <HugeiconsIcon icon={Layers01Icon} className="mr-2 h-4 w-4" />
              Change Variant
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48">
                {blockMeta.variants.map((variant) => (
                  <DropdownMenuItem
                    key={variant.id}
                    onClick={() => onChangeVariant(variant.id)}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate">{variant.name}</span>
                    {block.variant === variant.id && (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-primary shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {!isProtected && (
            <>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                    Remove Block
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {blockMeta.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the {blockMeta.name} block from your storefront.
                      You can add it back later from the block palette.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onRemove}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

---

## 7. loading.tsx (Loading Skeleton)

```tsx
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

export default function StorefrontEditorLoading() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      </header>

      {/* Main Content */}
      <ResizablePanelGroup orientation="horizontal" className="flex-1 min-h-0">
        <ResizablePanel defaultSize={28} className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="flex-1 p-3 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-3.5 w-3.5" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-3.5" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          <div className="border-t px-4 py-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={72} className="bg-muted/30">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b bg-background px-4 py-2">
              <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                <Skeleton className="h-8 w-
20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-8 w-8" />
                <Separator orientation="vertical" className="h-6" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
              <Skeleton className="h-[600px] w-[800px] rounded-xl" />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
```

---

## Key Dependencies

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x",
  "@hugeicons/react": "^0.x",
  "@hugeicons/core-free-icons": "^0.x",
  "react-resizable-panels": "^4.0.15",
  "sonner": "^1.x"
}
```

## Features

- **Drag & Drop Reordering**: Using @dnd-kit for smooth block reordering
- **Undo/Redo**: Full history management with keyboard shortcuts (⌘Z / ⌘⇧Z)
- **Live Preview**: Responsive iframe preview with device frames (mobile/tablet/desktop)
- **Collapsible Sidebar**: Left panel can collapse to maximize preview space
- **Template System**: Pre-built templates that can be applied instantly
- **Block Settings**: Per-block configuration dialogs
- **Optimistic Updates**: UI updates immediately, rolls back on error
- **Auto-save**: Changes persist to database via server actions
- **Block Duplication**: Duplicate any block with ⌘D or via dropdown menu
- **Action Queue**: Serialized async operations prevent race conditions

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘Z | Undo |
| ⌘⇧Z / ⌘Y | Redo |
| ⌘↑ / ⌘↓ | Navigate between blocks |
| ⌘H | Toggle visibility of selected block |
| ⌘E | Edit selected block settings |
| ⌘D | Duplicate selected block |
| Delete / Backspace | Remove selected block (non-protected) |
