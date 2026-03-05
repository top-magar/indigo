"use client"

/**
 * Visual Editor — rebuilt from scratch using Anthropic prompting techniques.
 * 
 * Architecture (Ch. 9 Complex Prompt Template):
 * - Task: Orchestrate 3-column editor layout (layers | preview | settings)
 * - Context: Zustand store, server actions, block system
 * - Tone: Minimal — each concern extracted to its own hook/component
 * 
 * Extracted concerns:
 * - Save/Publish/Autosave → useSavePublish hook
 * - Keyboard shortcuts → useEditorKeyboard hook
 * - Block rendering → BlockRenderer component
 * - Clipboard → useBlockClipboard hook (existing)
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { cn } from "@/shared/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { GlobalStylesPanel } from "@/features/editor/components/global-styles-panel"
import { SEOPanel, type PanelPageSEO } from "@/features/editor/components/seo-panel"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { useEditorStore, selectEditorMode, selectFocusMode, selectViewport } from "@/features/editor/store"
import { useBlockClipboard } from "@/features/editor/hooks/use-block-clipboard"
import { useSavePublish } from "@/features/editor/hooks/use-save-publish"
import { useEditorKeyboard } from "@/features/editor/hooks/use-editor-keyboard"
import type { LayoutStatus } from "@/features/store/layout-service"
import { saveAsDraft, publishChanges, discardChanges, getDraftPreviewUrl, saveGlobalStyles, loadGlobalStyles } from "./actions"
import { useGlobalStylesStore, selectIsDirty as selectGlobalStylesIsDirty, selectGlobalStyles } from "@/features/editor/global-styles/store"
import { LivePreview } from "@/features/editor/components/live-preview"
import { InlinePreview } from "@/features/editor/components/inline-preview"
import { InlinePreviewErrorBoundary } from "@/features/editor/components/inline-preview-error-boundary"
import { toast } from "sonner"
import { LayersPanel } from "@/features/editor/components/layers-panel"
import { SettingsPanel } from "@/features/editor/components/settings-panel"
import { EditorHeader } from "@/features/editor/components/editor-header"
import { CommandPalette } from "@/features/editor/components/command-palette"
import { FocusPreview } from "@/features/editor/components/focus-preview"
import { BlockBreadcrumb } from "@/features/editor/components/block-breadcrumb"
import { GlobalStylesInjector } from "@/features/editor/components/global-styles-injector"
import { useEditorPreview } from "@/features/editor"
import { AIGenerationDialog } from "@/features/editor/components/ai-generation-dialog"
import { generatePage } from "@/features/ai/generate-page"

interface VisualEditorProps {
  tenantId: string
  storeSlug: string
  storeName: string
  initialBlocks: StoreBlock[]
  initialTemplateId?: string
  initialLayoutStatus?: LayoutStatus
}

export function VisualEditor({
  tenantId, storeSlug, storeName, initialBlocks, initialTemplateId, initialLayoutStatus,
}: VisualEditorProps) {
  // ─── Panels ────────────────────────────────────────────────────────────────
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [globalStylesOpen, setGlobalStylesOpen] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [seo, setSeo] = useState<PanelPageSEO>({})
  const [zoom, setZoom] = useState<number | undefined>(undefined)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // ─── Store ─────────────────────────────────────────────────────────────────
  const blocks = useEditorStore((s) => s.blocks)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const editorMode = useEditorStore(selectEditorMode)
  const viewport = useEditorStore(selectViewport)
  const focusMode = useEditorStore(selectFocusMode)
  const { setBlocks, selectBlock, addBlock, setEditorMode, exitFocusMode } = useEditorStore()

  // ─── Save/Publish (extracted hook) ─────────────────────────────────────────
  const {
    isPending, saveStatus, publishStatus, layoutStatus, lastSaved, autosave, isDirty,
    handleSave, handlePublish, handleDiscard,
  } = useSavePublish({
    tenantId, storeSlug, initialTemplateId, initialLayoutStatus,
    saveAsDraft, publishChanges, discardChanges,
  })

  // ─── Clipboard ─────────────────────────────────────────────────────────────
  const { copy: clipboardCopy, paste: clipboardPaste, canCopy, canPaste } = useBlockClipboard()

  // ─── Keyboard shortcuts (extracted hook) ───────────────────────────────────
  useEditorKeyboard({
    onSave: handleSave,
    onAiDialog: () => setAiDialogOpen(true),
    canCopy, canPaste, clipboardCopy, clipboardPaste, editorMode,
  })

  // ─── Editor-preview communication (iframe mode only) ──────────────────────
  const { sendFieldValueUpdate } = useEditorPreview({
    onAddBlockBelow: (blockId: string) => {
      const blockIndex = blocks.findIndex((b) => b.id === blockId)
      if (blockIndex !== -1) selectBlock(blockId)
    },
  })

  // ─── Init ──────────────────────────────────────────────────────────────────
  const [storeUrl, setStoreUrl] = useState("")
  useEffect(() => {
    setStoreUrl(`${typeof window !== "undefined" ? window.location.origin : ""}/store/${storeSlug}`)
  }, [storeSlug])

  useEffect(() => { setBlocks(initialBlocks) }, [initialBlocks, setBlocks])

  // ─── Global styles ─────────────────────────────────────────────────────────
  const globalStylesIsDirty = useGlobalStylesStore(selectGlobalStylesIsDirty)
  const globalStyles = useGlobalStylesStore(selectGlobalStyles)

  useEffect(() => {
    loadGlobalStyles(tenantId).then((result) => {
      if (result.success && result.data?.styles) {
        useGlobalStylesStore.getState().setStyles(result.data.styles)
        useGlobalStylesStore.getState().markClean()
      }
    }).catch(() => {})
  }, [tenantId])

  useEffect(() => {
    if (!globalStylesIsDirty) return
    const timeout = setTimeout(async () => {
      try {
        const result = await saveGlobalStyles(tenantId, storeSlug, globalStyles)
        if (result.success) useGlobalStylesStore.getState().markClean()
        else toast.error("Failed to save styles", { description: result.error })
      } catch {
        toast.error("Failed to save styles")
      }
    }, 2000)
    return () => clearTimeout(timeout)
  }, [globalStylesIsDirty, globalStyles, tenantId, storeSlug])

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const focusedBlock = focusMode ? blocks.find((b) => b.id === focusMode.blockId) : null

  const handlePreviewDraft = useCallback(async () => {
    try {
      const result = await getDraftPreviewUrl(tenantId, storeSlug)
      if (result.success && result.data?.url) window.open(result.data.url, "_blank")
      else toast.error("Preview failed", { description: result.error })
    } catch { toast.error("Preview failed") }
  }, [tenantId, storeSlug])

  const handleAddBlock = useCallback((type: BlockType, variant: string) => {
    addBlock({
      id: `${type}-${Date.now()}`, type, variant,
      order: blocks.length, visible: true, settings: {},
    } as StoreBlock)
  }, [blocks.length, addBlock])

  const handleInlinePreviewError = useCallback(() => {
    setEditorMode("preview")
    toast.warning("Preview Error", { description: "Switched to iframe preview mode.", duration: 5000 })
  }, [setEditorMode])

  const handleAiGenerate = useCallback(async (prompt: string) => {
    setIsGenerating(true)
    try {
      const result = await generatePage(prompt, storeSlug)
      setBlocks(result.blocks)
      setAiDialogOpen(false)
      toast.success("Page generated!", { description: result.reasoning })
    } catch { toast.error("Failed to generate page") }
    finally { setIsGenerating(false) }
  }, [setBlocks, storeSlug])

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(1.5, (z ?? 1) + 0.1)), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.25, (z ?? 1) - 0.1)), [])
  const handleZoomReset = useCallback(() => setZoom(undefined), [])

  const existingBlockTypes = blocks.map((b) => b.type as BlockType)

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <GlobalStylesInjector />
      <div className="flex h-screen flex-col bg-muted/30">
        <EditorHeader
          storeName={storeName}
          storeSlug={storeSlug}
          storeUrl={storeUrl}
          layoutStatus={layoutStatus}
          saveStatus={saveStatus}
          publishStatus={publishStatus}
          isPending={isPending}
          lastSaved={lastSaved}
          autosaveStatus={autosave.status}
          autosaveLastSavedAt={autosave.lastSavedAt}
          autosaveError={autosave.error}
          onSave={handleSave}
          onPublish={handlePublish}
          onDiscard={() => setDiscardDialogOpen(true)}
          onAutosaveRetry={autosave.retry}
          onPreviewDraft={handlePreviewDraft}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onToggleGlobalStyles={() => setGlobalStylesOpen((p) => !p)}
          onToggleSEO={() => setSeoOpen((p) => !p)}
          globalStylesOpen={globalStylesOpen}
          seoOpen={seoOpen}
        />

        {/* 3-column layout in edit mode, full-width in preview */}
        <div className={cn(
          "flex-1 min-h-0 overflow-hidden",
          editorMode === "edit" ? "grid grid-cols-[240px_1fr_280px]" : "grid grid-cols-1",
        )}>
          {editorMode === "edit" && <LayersPanel />}

          <main className="min-h-0 min-w-0 overflow-hidden flex flex-col">
            {editorMode === "edit" && !focusedBlock && <BlockBreadcrumb />}
            <div className="flex-1 min-h-0">
              {focusedBlock ? (
                <FocusPreview block={focusedBlock} storeSlug={storeSlug} storeName={storeName} onExit={exitFocusMode} />
              ) : editorMode === "edit" && viewport === "desktop" ? (
                <InlinePreviewErrorBoundary onError={handleInlinePreviewError} onRetry={() => setEditorMode("edit")}>
                  <InlinePreview storeSlug={storeSlug} storeName={storeName} zoom={zoom} onZoomChange={setZoom} />
                </InlinePreviewErrorBoundary>
              ) : (
                <LivePreview storeUrl={storeUrl} onBlockSelect={selectBlock} zoom={zoom} onZoomChange={setZoom} />
              )}
            </div>
          </main>

          {editorMode === "edit" && <SettingsPanel storeName={storeName} />}
        </div>

        {/* Dialogs */}
        <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard draft changes?</AlertDialogTitle>
              <AlertDialogDescription>
                This will revert all unpublished changes and restore the currently published version. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { handleDiscard(); setDiscardDialogOpen(false) }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Discard Draft
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Sheet open={globalStylesOpen} onOpenChange={setGlobalStylesOpen}>
          <SheetContent side="right" className="w-[320px] p-0"><GlobalStylesPanel /></SheetContent>
        </Sheet>

        <Sheet open={seoOpen} onOpenChange={setSeoOpen}>
          <SheetContent side="right" className="w-[320px] p-0">
            <SEOPanel seo={seo} onChange={setSeo} storeName={storeName} />
          </SheetContent>
        </Sheet>

        <CommandPalette
          onAddBlock={handleAddBlock}
          onSave={handleSave}
          onPublish={handlePublish}
          existingBlockTypes={existingBlockTypes}
          isDirty={isDirty}
          isPending={isPending}
        />
        <AIGenerationDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} onGenerate={handleAiGenerate} isGenerating={isGenerating} />
      </div>
    </TooltipProvider>
  )
}
