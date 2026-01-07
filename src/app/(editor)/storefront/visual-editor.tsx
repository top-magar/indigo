"use client"

import { useState, useEffect, useCallback, useTransition, useMemo } from "react"
import { cn } from "@/shared/utils"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { GlobalStylesPanel } from "@/features/editor/components/global-styles-panel"
import { SEOPanel } from "@/features/editor/components/seo-panel"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { useEditorStore, selectEditorMode, selectFocusMode } from "@/features/editor/store"
import { useAutosave } from "@/features/editor/hooks/use-autosave"
import { useBlockClipboard } from "@/features/editor/hooks/use-block-clipboard"
import type { TemplateId } from "@/components/store/blocks/templates"
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
import { GlobalStylesInjector } from "@/features/editor/components/global-styles-injector"
import { useEditorPreview } from "@/features/editor"


interface VisualEditorProps {
  tenantId: string
  storeSlug: string
  storeName: string
  initialBlocks: StoreBlock[]
  initialTemplateId?: string
  initialLayoutStatus?: LayoutStatus
}


export function VisualEditor({
  tenantId,
  storeSlug,
  storeName,
  initialBlocks,
  initialTemplateId,
  initialLayoutStatus,
}: VisualEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [globalStylesOpen, setGlobalStylesOpen] = useState(false)
  const [seoOpen, setSeoOpen] = useState(false)
  const [seo, setSeo] = useState<Record<string, unknown>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Draft/Publish state
  const [layoutStatus, setLayoutStatus] = useState<LayoutStatus | null>(initialLayoutStatus ?? null)
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "published" | "error">("idle")

  // Zoom state - lifted from inline-preview for header controls
  const [zoom, setZoom] = useState(1)

  // Autosave save function - Requirements 1.1, 1.2
  const autosaveSave = useCallback(async () => {
    const currentBlocks = useEditorStore.getState().blocks
    const result = await saveAsDraft(tenantId, storeSlug, {
      templateId: (initialTemplateId as TemplateId) ?? null,
      blocks: currentBlocks,
    })
    if (!result.success) {
      throw new Error(result.error || 'Auto-save failed')
    }
    // Mark clean after successful autosave
    useEditorStore.getState().markClean()
    setLayoutStatus(prev => prev ? { ...prev, hasDraft: true } : {
      status: "draft", hasDraft: true, hasPublished: false,
      lastPublishedAt: null, lastUpdatedAt: new Date().toISOString(),
    })
  }, [tenantId, storeSlug, initialTemplateId])

  // Autosave config - memoized to prevent re-renders
  const autosaveConfig = useMemo(() => ({
    debounceMs: 3000,
    maxRetries: 3,
    retryDelayMs: 1000
  }), [])

  // Autosave hook - Requirements 1.1, 1.2, 1.6
  const autosave = useAutosave({
    onSave: autosaveSave,
    enabled: true,
    config: autosaveConfig,
  })

  // Clipboard hook - Requirements 3.1, 3.2, 3.4
  const { copy: clipboardCopy, paste: clipboardPaste, canCopy, canPaste } = useBlockClipboard()

  // Zustand store
  const blocks = useEditorStore((s) => s.blocks)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const isDirty = useEditorStore((s) => s.isDirty)
  const inlineEdit = useEditorStore((s) => s.inlineEdit)
  // Editor mode for switching between inline and iframe preview
  const editorMode = useEditorStore(selectEditorMode)
  // Focus mode for editing a single block in isolation
  const focusMode = useEditorStore(selectFocusMode)
  const {
    setBlocks,
    selectBlock,
    updateBlock,
    addBlock,
    removeBlock,
    duplicateBlock,
    undo,
    redo,
    markClean,
    setEditorMode,
    exitFocusMode,
    setViewport,
    toggleSnapping,
  } = useEditorStore()

  // Editor-preview communication for bidirectional sync with iframe preview (LivePreview)
  // This is ONLY used when editorMode === 'preview' (iframe mode)
  // InlinePreview reads directly from Editor Store - no postMessage needed
  // Requirements 6.1, 6.2: InlinePreview should not use postMessage communication
  const { sendFieldValueUpdate } = useEditorPreview({
    onAddBlockBelow: (blockId: string) => {
      // Find the block index and select it, then we could open a block palette
      // For now, we'll just select the block - the user can use the + button
      const blockIndex = blocks.findIndex((b) => b.id === blockId)
      if (blockIndex !== -1) {
        selectBlock(blockId)
        // TODO: Could open a block palette dialog positioned to insert after this block
      }
    },
  })

  // Get focused block for focus mode
  const focusedBlock = focusMode ? blocks.find((b) => b.id === focusMode.blockId) : null

  // Store URL
  const [storeUrl, setStoreUrl] = useState("")
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    setStoreUrl(`${origin}/store/${storeSlug}`)
  }, [storeSlug])

  // Initialize blocks
  useEffect(() => {
    setBlocks(initialBlocks)
  }, [initialBlocks, setBlocks])

  // Global styles store selectors
  const globalStylesIsDirty = useGlobalStylesStore(selectGlobalStylesIsDirty)
  const globalStyles = useGlobalStylesStore(selectGlobalStyles)

  // Load global styles on mount
  useEffect(() => {
    loadGlobalStyles(tenantId).then(result => {
      if (result.success && result.data?.styles) {
        useGlobalStylesStore.getState().setStyles(result.data.styles)
        // Mark clean after loading since we just loaded from DB
        useGlobalStylesStore.getState().markClean()
      }
    }).catch(error => {
      console.error("Failed to load global styles:", error)
    })
  }, [tenantId])

  // Save global styles when dirty (debounced)
  useEffect(() => {
    if (!globalStylesIsDirty) return
    
    const timeout = setTimeout(async () => {
      try {
        const result = await saveGlobalStyles(tenantId, storeSlug, globalStyles)
        if (result.success) {
          useGlobalStylesStore.getState().markClean()
        } else {
          toast.error("Failed to save styles", {
            description: result.error || "Could not save global styles",
          })
        }
      } catch (error) {
        console.error("Failed to save global styles:", error)
        toast.error("Failed to save styles", {
          description: "An unexpected error occurred",
        })
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timeout)
  }, [globalStylesIsDirty, globalStyles, tenantId, storeSlug])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
      // Copy/Paste shortcuts - Requirements 3.1, 3.2, 3.4
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        if (canCopy) {
          e.preventDefault()
          clipboardCopy().then(() => {
            toast.success("Copied", { description: "Block copied to clipboard", duration: 2000 })
          })
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        if (canPaste) {
          e.preventDefault()
          clipboardPaste().then(() => {
            toast.success("Pasted", { description: "Block pasted from clipboard", duration: 2000 })
          })
        }
      }
      // Duplicate shortcut - ⌘D
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        if (selectedBlockId) {
          const block = blocks.find(b => b.id === selectedBlockId)
          if (block && block.type !== "header" && block.type !== "footer") {
            e.preventDefault()
            duplicateBlock(selectedBlockId)
            toast.success("Duplicated", { description: "Block duplicated", duration: 2000 })
          }
        }
      }
      // Toggle visibility shortcut - ⌘H
      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        if (selectedBlockId) {
          e.preventDefault()
          const block = blocks.find(b => b.id === selectedBlockId)
          if (block) {
            updateBlock(selectedBlockId, { visible: !block.visible })
            toast.success(block.visible ? "Hidden" : "Visible", {
              description: `Block is now ${block.visible ? "hidden" : "visible"}`,
              duration: 2000
            })
          }
        }
      }
      // Delete shortcut - Backspace/Delete
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedBlockId) {
          const block = blocks.find(b => b.id === selectedBlockId)
          if (block && block.type !== "header" && block.type !== "footer") {
            e.preventDefault()
            removeBlock(selectedBlockId)
            toast.success("Deleted", { description: "Block removed", duration: 2000 })
          }
        }
      }
      // Viewport switching shortcuts - 1, 2, 3
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === "1") {
          e.preventDefault()
          setViewport("desktop")
        }
        if (e.key === "2") {
          e.preventDefault()
          setViewport("tablet")
        }
        if (e.key === "3") {
          e.preventDefault()
          setViewport("mobile")
        }
        // Toggle Edit/Preview mode - P key
        if (e.key === "p" || e.key === "P") {
          e.preventDefault()
          setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')
        }
      }
      // Toggle snapping - ⌘G
      if ((e.metaKey || e.ctrlKey) && e.key === "g") {
        e.preventDefault()
        toggleSnapping()
        toast.info("Snapping toggled", { duration: 1500 })
      }
      if (e.key === "Escape") selectBlock(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, selectBlock, clipboardCopy, clipboardPaste, canCopy, canPaste, selectedBlockId, blocks, duplicateBlock, updateBlock, removeBlock, setViewport, editorMode, setEditorMode, toggleSnapping])

  // Save handler - Requirements 1.7: Cancel autosave on manual save
  // Requirements 5.1, 5.2, 5.5: Optimistic updates with rollback
  const handleSave = useCallback(() => {
    if (!isDirty || isPending) return

    // Cancel any pending autosave - Requirement 1.7
    autosave.cancel()

    // Optimistic update - show saving immediately (Requirement 5.1)
    setSaveStatus("saving")
    const previousLayoutStatus = layoutStatus

    startTransition(async () => {
      try {
        const result = await saveAsDraft(tenantId, storeSlug, {
          templateId: (initialTemplateId as TemplateId) ?? null,
          blocks,
        })
        if (result.success) {
          markClean()
          setSaveStatus("saved")
          setLastSaved(new Date())
          setLayoutStatus(prev => prev ? { ...prev, hasDraft: true } : {
            status: "draft", hasDraft: true, hasPublished: false,
            lastPublishedAt: null, lastUpdatedAt: new Date().toISOString(),
          })
          setTimeout(() => setSaveStatus("idle"), 2000)
        } else {
          // Rollback on failure (Requirement 5.2)
          setSaveStatus("error")
          setLayoutStatus(previousLayoutStatus)
          toast.error("Save failed", {
            description: result.error || "Could not save changes. Please try again.",
            action: { label: "Retry", onClick: () => handleSave() },
          })
          setTimeout(() => setSaveStatus("idle"), 3000)
        }
      } catch (error) {
        // Rollback on failure (Requirement 5.2)
        setSaveStatus("error")
        setLayoutStatus(previousLayoutStatus)
        toast.error("Save failed", {
          description: "An unexpected error occurred. Please try again.",
          action: { label: "Retry", onClick: () => handleSave() },
        })
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    })
  }, [isDirty, isPending, tenantId, storeSlug, blocks, initialTemplateId, markClean, autosave, layoutStatus])

  // Publish handler
  // Requirements 5.3, 5.4, 5.6: Optimistic updates with rollback
  const handlePublish = useCallback(() => {
    if (isPending) return

    // Optimistic update - show publishing immediately (Requirement 5.3)
    setPublishStatus("publishing")
    const previousLayoutStatus = layoutStatus

    startTransition(async () => {
      try {
        // Save first if dirty
        if (isDirty) {
          const saveResult = await saveAsDraft(tenantId, storeSlug, {
            templateId: (initialTemplateId as TemplateId) ?? null, blocks,
          })
          if (!saveResult.success) {
            // Rollback on failure (Requirement 5.4)
            setPublishStatus("error")
            setLayoutStatus(previousLayoutStatus)
            toast.error("Publish failed", {
              description: "Could not save changes before publishing.",
              action: { label: "Retry", onClick: () => handlePublish() },
            })
            setTimeout(() => setPublishStatus("idle"), 3000)
            return
          }
          markClean()
        }

        const result = await publishChanges(tenantId, storeSlug)
        if (result.success) {
          setPublishStatus("published")
          setLayoutStatus(prev => prev ? {
            ...prev, status: "published", hasDraft: false, hasPublished: true,
            lastPublishedAt: new Date().toISOString(),
          } : null)
          toast.success("Published!", { description: "Your changes are now live." })
          setTimeout(() => setPublishStatus("idle"), 2000)
        } else {
          // Rollback on failure (Requirement 5.4)
          setPublishStatus("error")
          setLayoutStatus(previousLayoutStatus)
          toast.error("Publish failed", {
            description: result.error || "Could not publish changes. Please try again.",
            action: { label: "Retry", onClick: () => handlePublish() },
          })
          setTimeout(() => setPublishStatus("idle"), 3000)
        }
      } catch (error) {
        // Rollback on failure (Requirement 5.4)
        setPublishStatus("error")
        setLayoutStatus(previousLayoutStatus)
        toast.error("Publish failed", {
          description: "An unexpected error occurred. Please try again.",
          action: { label: "Retry", onClick: () => handlePublish() },
        })
        setTimeout(() => setPublishStatus("idle"), 3000)
      }
    })
  }, [isPending, isDirty, tenantId, storeSlug, blocks, initialTemplateId, markClean, layoutStatus])

  // Discard handler
  const handleDiscard = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await discardChanges(tenantId, storeSlug)
        if (result.success && result.data?.blocks) {
          setBlocks(result.data.blocks)
          markClean()
          setLayoutStatus(prev => prev ? { ...prev, hasDraft: false } : null)
        }
      } catch { /* silent */ }
    })
    setDiscardDialogOpen(false)
  }, [tenantId, storeSlug, setBlocks, markClean])

  // Preview draft handler - opens store in draft mode
  const handlePreviewDraft = useCallback(async () => {
    try {
      const result = await getDraftPreviewUrl(tenantId, storeSlug)
      if (result.success && result.data?.url) {
        window.open(result.data.url, '_blank')
      } else {
        toast.error("Preview failed", {
          description: result.error || "Could not generate preview URL",
        })
      }
    } catch {
      toast.error("Preview failed", {
        description: "An unexpected error occurred",
      })
    }
  }, [tenantId, storeSlug])

  // Block handlers
  const handleAddBlock = useCallback((type: BlockType, variant: string) => {
    const newBlock: StoreBlock = {
      id: `${type}-${Date.now()}`, type, variant,
      order: blocks.length, visible: true, settings: {},
    } as StoreBlock
    addBlock(newBlock)
  }, [blocks.length, addBlock])

  const existingBlockTypes = blocks.map((b) => b.type as BlockType)

  // Handle inline preview error - fallback to iframe preview mode
  // Requirements: 11.5 - IF the inline preview fails to render, 
  // THE Visual_Editor SHALL fall back to iframe preview mode
  const handleInlinePreviewError = useCallback(() => {
    setEditorMode('preview')
    toast.warning("Preview Error", {
      description: "Inline preview failed to render. Switched to iframe preview mode for stability.",
      duration: 5000,
    })
  }, [setEditorMode])

  // Handle retry from error boundary - switch back to edit mode
  const handleInlinePreviewRetry = useCallback(() => {
    setEditorMode('edit')
  }, [setEditorMode])

  // Zoom handlers for header controls
  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(1.5, z + 0.1))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(0.25, z - 0.1))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoom(1)
  }, [])

  const handleToggleGlobalStyles = useCallback(() => {
    setGlobalStylesOpen(prev => !prev)
  }, [])

  const handleToggleSEO = useCallback(() => {
    setSeoOpen(prev => !prev)
  }, [])

  const handleSEOChange = useCallback((newSeo: Record<string, unknown>) => {
    setSeo(newSeo)
  }, [])


  return (
    <TooltipProvider>
      <GlobalStylesInjector />
      <div className="flex h-screen flex-col bg-muted/30">
        {/* Header */}
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
          onToggleGlobalStyles={handleToggleGlobalStyles}
          onToggleSEO={handleToggleSEO}
          globalStylesOpen={globalStylesOpen}
          seoOpen={seoOpen}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CONTENT - 3-column layout in edit mode, full-width in preview
        ═══════════════════════════════════════════════════════════════════ */}
        <div className={cn(
          "flex-1 min-h-0 overflow-hidden",
          editorMode === 'edit' 
            ? "grid grid-cols-[240px_1fr_280px]" 
            : "grid grid-cols-1"
        )}>

          {/* ─────────────────────────────────────────────────────────────────
              LEFT PANEL - Layers/Blocks (hidden in preview mode)
          ───────────────────────────────────────────────────────────────── */}
          {editorMode === 'edit' && <LayersPanel />}

          {/* ─────────────────────────────────────────────────────────────────
              CENTER - Preview
              Requirement 4.2: Conditionally render InlinePreview or LivePreview
              Focus mode: Show single block in isolation when focusMode is active
          ───────────────────────────────────────────────────────────────── */}
          <main className="min-h-0 min-w-0 overflow-hidden">
            {focusedBlock ? (
              <FocusPreview
                block={focusedBlock}
                storeSlug={storeSlug}
                storeName={storeName}
                onExit={exitFocusMode}
              />
            ) : editorMode === 'edit' ? (
              <InlinePreviewErrorBoundary
                onError={handleInlinePreviewError}
                onRetry={handleInlinePreviewRetry}
              >
                <InlinePreview
                  storeSlug={storeSlug}
                  storeName={storeName}
                  zoom={zoom}
                  onZoomChange={setZoom}
                />
              </InlinePreviewErrorBoundary>
            ) : (
              <LivePreview
                storeUrl={storeUrl}
                onBlockSelect={selectBlock}
                zoom={zoom}
                onZoomChange={setZoom}
              />
            )}
          </main>

          {/* ─────────────────────────────────────────────────────────────────
              RIGHT PANEL - Settings (hidden in preview mode)
          ───────────────────────────────────────────────────────────────── */}
          {editorMode === 'edit' && <SettingsPanel />}
        </div>



        {/* Discard dialog */}
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
              <AlertDialogAction onClick={handleDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Discard Draft
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Global Styles Sheet */}
        <Sheet open={globalStylesOpen} onOpenChange={setGlobalStylesOpen}>
          <SheetContent side="right" className="w-[320px] p-0">
            <GlobalStylesPanel />
          </SheetContent>
        </Sheet>

        {/* SEO Sheet */}
        <Sheet open={seoOpen} onOpenChange={setSeoOpen}>
          <SheetContent side="right" className="w-[320px] p-0">
            <SEOPanel
              seo={seo as any}
              onChange={handleSEOChange as any}
              storeName={storeName}
            />
          </SheetContent>
        </Sheet>

        {/* Command Palette - ⌘K */}
        <CommandPalette
          onAddBlock={handleAddBlock}
          onSave={handleSave}
          onPublish={handlePublish}
          existingBlockTypes={existingBlockTypes}
          isDirty={isDirty}
          isPending={isPending}
        />
      </div>
    </TooltipProvider>
  )
}
