import { create } from "zustand"
import { nanoid } from "nanoid"
import type { 
  BuilderStore, 
  BuilderState, 
  BlockBuilderDocument, 
  BuilderBlock 
} from "../types"
import type { BlockType } from "@/types/blocks"
import { getBlockDefaults } from "../utils/block-defaults"

const initialState: BuilderState = {
  document: null,
  isDirty: false,
  selectedBlockId: null,
  isSettingsOpen: false,
  isBlockPickerOpen: false,
  viewport: "desktop",
  saveStatus: "idle",
  lastSavedAt: null,
  insertAfterBlockId: undefined,
}

export const useBuilderStore = create<BuilderStore>()((set, get) => ({
  ...initialState,

  // Document management
  loadDocument: (doc) => {
    set({ 
      document: doc, 
      isDirty: false,
      selectedBlockId: null 
    })
  },

  // Block CRUD operations
  addBlock: (type, variant, afterId) => {
    const { document } = get()
    if (!document) return

    const newBlock: BuilderBlock = {
      id: nanoid(),
      type,
      variant,
      data: getBlockDefaults(type, variant),
      order: afterId 
        ? document.blocks.find(b => b.id === afterId)?.order ?? 0 + 1
        : document.blocks.length,
      visible: true,
    }

    // Insert block after specified block or at end
    let newBlocks = [...document.blocks]
    if (afterId) {
      const afterIndex = newBlocks.findIndex(b => b.id === afterId)
      if (afterIndex !== -1) {
        newBlocks.splice(afterIndex + 1, 0, newBlock)
        // Reorder all blocks
        newBlocks = newBlocks.map((block, index) => ({
          ...block,
          order: index
        }))
      } else {
        newBlocks.push(newBlock)
      }
    } else {
      newBlocks.push(newBlock)
    }

    set({
      document: {
        ...document,
        blocks: newBlocks,
        time: Date.now(),
      },
      selectedBlockId: newBlock.id,
      isDirty: true,
      isBlockPickerOpen: false,
    })
  },

  updateBlock: (id, updates) => {
    const { document } = get()
    if (!document) return

    const updatedBlocks = document.blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    )

    set({
      document: {
        ...document,
        blocks: updatedBlocks,
        time: Date.now(),
      },
      isDirty: true,
    })
  },

  removeBlock: (id) => {
    const { document, selectedBlockId } = get()
    if (!document) return

    const filteredBlocks = document.blocks
      .filter(block => block.id !== id)
      .map((block, index) => ({ ...block, order: index }))

    set({
      document: {
        ...document,
        blocks: filteredBlocks,
        time: Date.now(),
      },
      selectedBlockId: selectedBlockId === id ? null : selectedBlockId,
      isDirty: true,
    })
  },

  reorderBlocks: (activeId, overId) => {
    const { document } = get()
    if (!document || activeId === overId) return

    const blocks = [...document.blocks]
    const activeIndex = blocks.findIndex(b => b.id === activeId)
    const overIndex = blocks.findIndex(b => b.id === overId)

    if (activeIndex === -1 || overIndex === -1) return

    // Move the active block to the over position
    const [movedBlock] = blocks.splice(activeIndex, 1)
    blocks.splice(overIndex, 0, movedBlock)

    // Update order numbers
    const reorderedBlocks = blocks.map((block, index) => ({
      ...block,
      order: index
    }))

    set({
      document: {
        ...document,
        blocks: reorderedBlocks,
        time: Date.now(),
      },
      isDirty: true,
    })
  },

  duplicateBlock: (id) => {
    const { document } = get()
    if (!document) return

    const blockToDuplicate = document.blocks.find(b => b.id === id)
    if (!blockToDuplicate) return

    const duplicatedBlock: BuilderBlock = {
      ...blockToDuplicate,
      id: nanoid(),
      order: blockToDuplicate.order + 1,
    }

    const blocks = [...document.blocks]
    const insertIndex = blocks.findIndex(b => b.id === id) + 1
    blocks.splice(insertIndex, 0, duplicatedBlock)

    // Reorder blocks after insertion
    const reorderedBlocks = blocks.map((block, index) => ({
      ...block,
      order: index
    }))

    set({
      document: {
        ...document,
        blocks: reorderedBlocks,
        time: Date.now(),
      },
      selectedBlockId: duplicatedBlock.id,
      isDirty: true,
    })
  },

  toggleBlockVisibility: (id) => {
    const { document } = get()
    if (!document) return

    const updatedBlocks = document.blocks.map(block =>
      block.id === id ? { ...block, visible: !block.visible } : block
    )

    set({
      document: {
        ...document,
        blocks: updatedBlocks,
        time: Date.now(),
      },
      isDirty: true,
    })
  },

  // Selection
  selectBlock: (id) => {
    set({ selectedBlockId: id })
  },

  // UI state
  openSettings: () => {
    set({ isSettingsOpen: true })
  },

  closeSettings: () => {
    set({ isSettingsOpen: false })
  },

  openBlockPicker: (afterId) => {
    set({ 
      isBlockPickerOpen: true,
      insertAfterBlockId: afterId 
    })
  },

  closeBlockPicker: () => {
    set({ 
      isBlockPickerOpen: false,
      insertAfterBlockId: undefined 
    })
  },

  setViewport: (viewport) => {
    set({ viewport })
  },

  // Persistence
  save: async () => {
    const { document } = get()
    if (!document) return

    set({ saveStatus: "saving" })
    
    try {
      // Import server action dynamically to avoid SSR issues
      const { saveBlockBuilderDocument } = await import("@/app/(editor)/storefront/block-builder-actions")
      
      const result = await saveBlockBuilderDocument(
        document.metadata.tenantId,
        document.metadata.storeId,
        document
      )
      
      if (result.success) {
        set({ 
          saveStatus: "saved",
          lastSavedAt: new Date(),
          isDirty: false,
        })
        
        // Reset status after 2 seconds
        setTimeout(() => {
          set({ saveStatus: "idle" })
        }, 2000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      set({ saveStatus: "error" })
      setTimeout(() => {
        set({ saveStatus: "idle" })
      }, 3000)
    }
  },

  publish: async () => {
    const { document } = get()
    if (!document) return

    set({ saveStatus: "saving" })
    
    try {
      // Import server action dynamically to avoid SSR issues
      const { publishBlockBuilderDocument } = await import("@/app/(editor)/storefront/block-builder-actions")
      
      const result = await publishBlockBuilderDocument(
        document.metadata.tenantId,
        document.metadata.storeId,
        document
      )
      
      if (result.success) {
        set({ 
          document: {
            ...document,
            metadata: {
              ...document.metadata,
              status: "published",
              lastPublishedAt: new Date().toISOString(),
            }
          },
          saveStatus: "saved",
          lastSavedAt: new Date(),
          isDirty: false,
        })
        
        // Reset status after 2 seconds
        setTimeout(() => {
          set({ saveStatus: "idle" })
        }, 2000)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      set({ saveStatus: "error" })
      setTimeout(() => {
        set({ saveStatus: "idle" })
      }, 3000)
    }
  },

  // Utility
  markDirty: () => {
    set({ isDirty: true })
  },

  markClean: () => {
    set({ isDirty: false })
  },
}))