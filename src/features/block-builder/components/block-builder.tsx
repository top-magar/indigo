"use client"

import { useEffect } from "react"
import { cn } from "@/shared/utils"
import { useBuilderStore } from "../hooks/use-builder-store"
import { useAutosave } from "../hooks/use-autosave"
import { BlockList } from "./block-list/block-list"
import { PreviewFrame } from "./preview/preview-frame"
import { BuilderHeader } from "./header/builder-header"
import { BlockPicker } from "./block-picker/block-picker"
import { SettingsPanel } from "./block-settings/settings-panel"
import { BlockBuilderErrorBoundary } from "./error-boundary"
import type { BlockBuilderDocument } from "../types"

interface BlockBuilderProps {
  tenantId: string
  storeSlug: string
  storeName: string
  initialDocument?: BlockBuilderDocument
}

export function BlockBuilder({
  tenantId,
  storeSlug,
  storeName,
  initialDocument,
}: BlockBuilderProps) {
  const { 
    document,
    isBlockPickerOpen,
    isSettingsOpen,
    loadDocument,
  } = useBuilderStore()

  // Enable autosave
  useAutosave({ enabled: true, debounceMs: 3000 })

  // Load initial document
  useEffect(() => {
    if (initialDocument) {
      loadDocument(initialDocument)
    } else {
      // Create empty document
      const emptyDocument: BlockBuilderDocument = {
        version: "1.0",
        time: Date.now(),
        blocks: [],
        metadata: {
          storeId: storeSlug,
          tenantId,
          status: "draft",
        }
      }
      loadDocument(emptyDocument)
    }
  }, [initialDocument, loadDocument, tenantId, storeSlug])

  if (!document) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading block builder...</p>
        </div>
      </div>
    )
  }

  return (
    <BlockBuilderErrorBoundary>
      <div className="flex h-screen flex-col bg-muted/30" data-testid="block-builder">
        {/* Header */}
        <BuilderHeader 
          storeName={storeName}
          storeSlug={storeSlug}
        />

        {/* Main Content - 2-panel layout */}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-[320px_1fr]">
          {/* Left Panel - Block List */}
          <div className="border-r bg-background">
            <BlockList />
          </div>

          {/* Right Panel - Preview */}
          <div className="min-h-0 min-w-0 overflow-hidden">
            <PreviewFrame 
              storeSlug={storeSlug}
              storeName={storeName}
            />
          </div>
        </div>

        {/* Modals */}
        {isBlockPickerOpen && <BlockPicker />}
        {isSettingsOpen && <SettingsPanel />}
      </div>
    </BlockBuilderErrorBoundary>
  )
}