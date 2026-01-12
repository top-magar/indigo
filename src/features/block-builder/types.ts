// Block Builder Types
import type { BlockType } from "@/types/blocks"

export interface BlockBuilderDocument {
  version: "1.0"
  time: number // Unix timestamp
  blocks: BuilderBlock[]
  metadata: {
    storeId: string
    tenantId: string
    status: "draft" | "published"
    lastPublishedAt?: string
  }
}

export interface BuilderBlock {
  id: string                    // UUID
  type: BlockType               // "hero" | "product-grid" | etc.
  variant: string               // "full-width" | "split" | etc.
  data: Record<string, unknown> // Block-specific settings
  order: number                 // Position in list
  visible: boolean              // Show/hide toggle
}

export interface BuilderState {
  // Document
  document: BlockBuilderDocument | null
  isDirty: boolean
  
  // UI State
  selectedBlockId: string | null
  isSettingsOpen: boolean
  isBlockPickerOpen: boolean
  viewport: "desktop" | "tablet" | "mobile"
  
  // Save State
  saveStatus: "idle" | "saving" | "saved" | "error"
  lastSavedAt: Date | null
  
  // Block picker state
  insertAfterBlockId?: string
}

export interface BuilderActions {
  // Document
  loadDocument: (doc: BlockBuilderDocument) => void
  
  // Block CRUD
  addBlock: (type: BlockType, variant: string, afterId?: string) => void
  updateBlock: (id: string, data: Partial<BuilderBlock>) => void
  removeBlock: (id: string) => void
  reorderBlocks: (activeId: string, overId: string) => void
  duplicateBlock: (id: string) => void
  toggleBlockVisibility: (id: string) => void
  
  // Selection
  selectBlock: (id: string | null) => void
  
  // UI
  openSettings: () => void
  closeSettings: () => void
  openBlockPicker: (afterId?: string) => void
  closeBlockPicker: () => void
  setViewport: (viewport: "desktop" | "tablet" | "mobile") => void
  
  // Persistence
  save: () => Promise<void>
  publish: () => Promise<void>
  
  // Utility
  markDirty: () => void
  markClean: () => void
}

export type BuilderStore = BuilderState & BuilderActions

// Block Schema Types
export interface BlockFieldSchema {
  id: string
  type: "text" | "textarea" | "richtext" | "number" | "select" | 
        "toggle" | "color" | "image" | "product" | "collection" | 
        "link" | "array"
  label: string
  description?: string
  required?: boolean
  default?: unknown
  placeholder?: string
  // Type-specific options
  options?: { value: string; label: string }[]  // for select
  min?: number                                   // for number
  max?: number                                   // for number
  arrayItemSchema?: BlockFieldSchema[]          // for array
}

export interface BlockSchema {
  type: BlockType
  name: string
  description: string
  icon: string
  category: "layout" | "content" | "commerce" | "engagement"
  variants: {
    id: string
    name: string
    description: string
    thumbnail?: string
  }[]
  fields: {
    [groupName: string]: BlockFieldSchema[]
  }
}