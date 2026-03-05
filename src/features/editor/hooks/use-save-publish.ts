"use client"

/**
 * Editor save/publish/discard orchestration hook.
 * 
 * Technique: Prompt Chaining (Ch. 10.1) — server action → revalidation → UI update.
 * Extracts all persistence logic from visual-editor.tsx.
 */

import { useState, useCallback, useMemo, useTransition } from "react"
import { useEditorStore } from "@/features/editor/store"
import { useAutosave } from "./use-autosave"
import type { TemplateId } from "@/components/store/blocks/templates"
import type { LayoutStatus } from "@/features/store/layout-service"
import { toast } from "sonner"

interface UseSavePublishOptions {
  tenantId: string
  storeSlug: string
  initialTemplateId?: string
  initialLayoutStatus?: LayoutStatus | null
  saveAsDraft: (tenantId: string, storeSlug: string, data: { templateId: TemplateId | null; blocks: any[] }) => Promise<{ success: boolean; error?: string }>
  publishChanges: (tenantId: string, storeSlug: string) => Promise<{ success: boolean; error?: string }>
  discardChanges: (tenantId: string, storeSlug: string) => Promise<{ success: boolean; data?: { blocks: any[] }; error?: string }>
}

export function useSavePublish({
  tenantId,
  storeSlug,
  initialTemplateId,
  initialLayoutStatus,
  saveAsDraft,
  publishChanges,
  discardChanges,
}: UseSavePublishOptions) {
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "published" | "error">("idle")
  const [layoutStatus, setLayoutStatus] = useState<LayoutStatus | null>(initialLayoutStatus ?? null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const blocks = useEditorStore((s) => s.blocks)
  const isDirty = useEditorStore((s) => s.isDirty)
  const { setBlocks, markClean } = useEditorStore()

  const autosaveSave = useCallback(async () => {
    const currentBlocks = useEditorStore.getState().blocks
    const result = await saveAsDraft(tenantId, storeSlug, {
      templateId: (initialTemplateId as TemplateId) ?? null,
      blocks: currentBlocks,
    })
    if (!result.success) throw new Error(result.error || "Auto-save failed")
    useEditorStore.getState().markClean()
    setLayoutStatus((prev) =>
      prev
        ? { ...prev, hasDraft: true }
        : { status: "draft", hasDraft: true, hasPublished: false, lastPublishedAt: null, lastUpdatedAt: new Date().toISOString() }
    )
  }, [tenantId, storeSlug, initialTemplateId, saveAsDraft])

  const autosaveConfig = useMemo(() => ({ debounceMs: 3000, maxRetries: 3, retryDelayMs: 1000 }), [])
  const autosave = useAutosave({ onSave: autosaveSave, enabled: true, config: autosaveConfig })

  const handleSave = useCallback(() => {
    if (!isDirty || isPending) return
    autosave.cancel()
    setSaveStatus("saving")
    const prev = layoutStatus
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
          setLayoutStatus((p) => p ? { ...p, hasDraft: true } : { status: "draft", hasDraft: true, hasPublished: false, lastPublishedAt: null, lastUpdatedAt: new Date().toISOString() })
          setTimeout(() => setSaveStatus("idle"), 2000)
        } else {
          setSaveStatus("error")
          setLayoutStatus(prev)
          toast.error("Save failed", { description: result.error || "Could not save changes." })
          setTimeout(() => setSaveStatus("idle"), 3000)
        }
      } catch {
        setSaveStatus("error")
        setLayoutStatus(prev)
        toast.error("Save failed", { description: "An unexpected error occurred." })
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    })
  }, [isDirty, isPending, tenantId, storeSlug, blocks, initialTemplateId, markClean, autosave, layoutStatus, saveAsDraft])

  const handlePublish = useCallback(() => {
    if (isPending) return
    setPublishStatus("publishing")
    const prev = layoutStatus
    startTransition(async () => {
      try {
        if (isDirty) {
          const saveResult = await saveAsDraft(tenantId, storeSlug, {
            templateId: (initialTemplateId as TemplateId) ?? null,
            blocks,
          })
          if (!saveResult.success) {
            setPublishStatus("error")
            setLayoutStatus(prev)
            toast.error("Publish failed", { description: "Could not save before publishing." })
            setTimeout(() => setPublishStatus("idle"), 3000)
            return
          }
          markClean()
        }
        const result = await publishChanges(tenantId, storeSlug)
        if (result.success) {
          setPublishStatus("published")
          setLayoutStatus((p) => p ? { ...p, status: "published", hasDraft: false, hasPublished: true, lastPublishedAt: new Date().toISOString() } : null)
          toast.success("Published!", { description: "Your changes are now live." })
          setTimeout(() => setPublishStatus("idle"), 2000)
        } else {
          setPublishStatus("error")
          setLayoutStatus(prev)
          toast.error("Publish failed", { description: result.error || "Could not publish." })
          setTimeout(() => setPublishStatus("idle"), 3000)
        }
      } catch {
        setPublishStatus("error")
        setLayoutStatus(prev)
        toast.error("Publish failed", { description: "An unexpected error occurred." })
        setTimeout(() => setPublishStatus("idle"), 3000)
      }
    })
  }, [isPending, isDirty, tenantId, storeSlug, blocks, initialTemplateId, markClean, layoutStatus, saveAsDraft, publishChanges])

  const handleDiscard = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await discardChanges(tenantId, storeSlug)
        if (result.success && result.data?.blocks) {
          setBlocks(result.data.blocks)
          markClean()
          setLayoutStatus((p) => p ? { ...p, hasDraft: false } : null)
        }
      } catch { /* silent */ }
    })
  }, [tenantId, storeSlug, setBlocks, markClean, discardChanges])

  return {
    isPending,
    saveStatus,
    publishStatus,
    layoutStatus,
    lastSaved,
    autosave,
    isDirty,
    handleSave,
    handlePublish,
    handleDiscard,
  }
}
