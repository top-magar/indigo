/**
 * Layout Store - Zustand state management for the enhanced layout system
 * 
 * Manages:
 * - Enhanced pages with sections
 * - Section selection and editing
 * - Element positioning and resizing
 * - Layout mode switching
 * - Undo/redo for layout changes
 */

import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import type {
  EnhancedPage,
  EnhancedSection,
  EnhancedElement,
  LayoutMode,
  SectionLayoutPreset,
} from "./types"
import { SECTION_LAYOUT_PRESETS } from "./types"
import { migrateBlocksToSection } from "./layout-engine"
import type { StoreBlock } from "@/types/blocks"

// =============================================================================
// STATE TYPES
// =============================================================================

export interface LayoutState {
  // Current page
  page: EnhancedPage | null
  
  // Selection state
  selectedSectionId: string | null
  selectedElementId: string | null
  hoveredSectionId: string | null
  hoveredElementId: string | null
  
  // Editing state
  editingLayoutMode: boolean // Whether we're editing section layout
  resizingElementId: string | null
  draggingElementId: string | null
  
  // History for undo/redo
  history: EnhancedPage[]
  historyIndex: number
  
  // Actions
  setPage: (page: EnhancedPage) => void
  migrateFromBlocks: (blocks: StoreBlock[], pageId: string, pageName: string, pageSlug: string) => void
  
  // Section actions
  addSection: (section: EnhancedSection) => void
  updateSection: (sectionId: string, updates: Partial<EnhancedSection>) => void
  removeSection: (sectionId: string) => void
  moveSection: (fromIndex: number, toIndex: number) => void
  duplicateSection: (sectionId: string) => void
  setSectionLayout: (sectionId: string, preset: SectionLayoutPreset) => void
  setSectionLayoutMode: (sectionId: string, mode: LayoutMode) => void
  
  // Element actions
  addElement: (sectionId: string, element: EnhancedElement) => void
  updateElement: (sectionId: string, elementId: string, updates: Partial<EnhancedElement>) => void
  removeElement: (sectionId: string, elementId: string) => void
  moveElement: (sectionId: string, fromIndex: number, toIndex: number) => void
  moveElementToSection: (elementId: string, fromSectionId: string, toSectionId: string, toIndex: number) => void
  duplicateElement: (sectionId: string, elementId: string) => void
  
  // Position actions (for absolute layout)
  setElementPosition: (sectionId: string, elementId: string, x: number, y: number) => void
  setElementSize: (sectionId: string, elementId: string, width: number, height: number) => void
  setElementZIndex: (sectionId: string, elementId: string, zIndex: number) => void
  
  // Selection actions
  selectSection: (sectionId: string | null) => void
  selectElement: (elementId: string | null) => void
  hoverSection: (sectionId: string | null) => void
  hoverElement: (elementId: string | null) => void
  
  // Editing state actions
  setEditingLayoutMode: (editing: boolean) => void
  setResizingElement: (elementId: string | null) => void
  setDraggingElement: (elementId: string | null) => void
  
  // History actions
  undo: () => void
  redo: () => void
  pushHistory: () => void
  
  // Utility
  getSectionById: (sectionId: string) => EnhancedSection | undefined
  getElementById: (sectionId: string, elementId: string) => EnhancedElement | undefined
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useLayoutStore = create<LayoutState>()(
  immer((set, get) => ({
    // Initial state
    page: null,
    selectedSectionId: null,
    selectedElementId: null,
    hoveredSectionId: null,
    hoveredElementId: null,
    editingLayoutMode: false,
    resizingElementId: null,
    draggingElementId: null,
    history: [],
    historyIndex: -1,

    // Set page
    setPage: (page) => {
      set((state) => {
        state.page = page
        state.selectedSectionId = null
        state.selectedElementId = null
      })
    },

    // Migrate from old blocks format
    migrateFromBlocks: (blocks, pageId, pageName, pageSlug) => {
      const section = migrateBlocksToSection(blocks, `section-${Date.now()}`)
      const page: EnhancedPage = {
        id: pageId,
        name: pageName,
        slug: pageSlug,
        settings: {
          title: pageName,
        },
        sections: [section],
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set((state) => {
        state.page = page
      })
    },

    // Section actions
    addSection: (section) => {
      set((state) => {
        if (!state.page) return
        get().pushHistory()
        section.order = state.page.sections.length
        state.page.sections.push(section)
        state.page.updatedAt = new Date().toISOString()
      })
    },

    updateSection: (sectionId, updates) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (section) {
          get().pushHistory()
          Object.assign(section, updates)
          state.page.updatedAt = new Date().toISOString()
        }
      })
    },

    removeSection: (sectionId) => {
      set((state) => {
        if (!state.page) return
        get().pushHistory()
        state.page.sections = state.page.sections.filter((s) => s.id !== sectionId)
        // Reorder remaining sections
        state.page.sections.forEach((s, i) => {
          s.order = i
        })
        state.page.updatedAt = new Date().toISOString()
        if (state.selectedSectionId === sectionId) {
          state.selectedSectionId = null
          state.selectedElementId = null
        }
      })
    },

    moveSection: (fromIndex, toIndex) => {
      set((state) => {
        if (!state.page) return
        get().pushHistory()
        const [section] = state.page.sections.splice(fromIndex, 1)
        state.page.sections.splice(toIndex, 0, section)
        // Update order
        state.page.sections.forEach((s, i) => {
          s.order = i
        })
        state.page.updatedAt = new Date().toISOString()
      })
    },

    duplicateSection: (sectionId) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        get().pushHistory()
        const newSection: EnhancedSection = JSON.parse(JSON.stringify(section))
        newSection.id = `section-${Date.now()}`
        newSection.name = section.name ? `${section.name} (copy)` : undefined
        newSection.elements = newSection.elements.map((el) => ({
          ...el,
          id: `element-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        }))
        const index = state.page.sections.findIndex((s) => s.id === sectionId)
        state.page.sections.splice(index + 1, 0, newSection)
        // Update order
        state.page.sections.forEach((s, i) => {
          s.order = i
        })
        state.page.updatedAt = new Date().toISOString()
      })
    },

    setSectionLayout: (sectionId, preset) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        get().pushHistory()
        const presetConfig = (SECTION_LAYOUT_PRESETS as Record<string, any>)[preset]
        if (presetConfig) {
          section.layout = { ...section.layout, ...presetConfig }
        }
        state.page.updatedAt = new Date().toISOString()
      })
    },

    setSectionLayoutMode: (sectionId, mode) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        get().pushHistory()
        section.layout.mode = mode
        state.page.updatedAt = new Date().toISOString()
      })
    },

    // Element actions
    addElement: (sectionId, element) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        get().pushHistory()
        section.elements.push(element)
        state.page.updatedAt = new Date().toISOString()
      })
    },

    updateElement: (sectionId, elementId, updates) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        const element = section.elements.find((e) => e.id === elementId)
        if (!element) return
        get().pushHistory()
        Object.assign(element, updates)
        state.page.updatedAt = new Date().toISOString()
      })
    },

    removeElement: (sectionId, elementId) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        get().pushHistory()
        section.elements = section.elements.filter((e) => e.id !== elementId)
        state.page.updatedAt = new Date().toISOString()
        if (state.selectedElementId === elementId) {
          state.selectedElementId = null
        }
      })
    },

    moveElement: (sectionId, fromIndex, toIndex) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        get().pushHistory()
        const [element] = section.elements.splice(fromIndex, 1)
        section.elements.splice(toIndex, 0, element)
        // Update order for stack mode
        section.elements.forEach((e, i) => {
          if (e.position.order !== undefined) {
            e.position.order = i
          }
        })
        state.page.updatedAt = new Date().toISOString()
      })
    },

    moveElementToSection: (elementId, fromSectionId, toSectionId, toIndex) => {
      set((state) => {
        if (!state.page) return
        const fromSection = state.page.sections.find((s) => s.id === fromSectionId)
        const toSection = state.page.sections.find((s) => s.id === toSectionId)
        if (!fromSection || !toSection) return
        const elementIndex = fromSection.elements.findIndex((e) => e.id === elementId)
        if (elementIndex === -1) return
        get().pushHistory()
        const [element] = fromSection.elements.splice(elementIndex, 1)
        toSection.elements.splice(toIndex, 0, element)
        state.page.updatedAt = new Date().toISOString()
      })
    },

    duplicateElement: (sectionId, elementId) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        const element = section.elements.find((e) => e.id === elementId)
        if (!element) return
        get().pushHistory()
        const newElement: EnhancedElement = JSON.parse(JSON.stringify(element))
        newElement.id = `element-${Date.now()}`
        // Offset position for absolute layout
        if (newElement.position.absolute) {
          newElement.position.absolute.x += 20
          newElement.position.absolute.y += 20
        }
        const index = section.elements.findIndex((e) => e.id === elementId)
        section.elements.splice(index + 1, 0, newElement)
        state.page.updatedAt = new Date().toISOString()
      })
    },

    // Position actions
    setElementPosition: (sectionId, elementId, x, y) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        const element = section.elements.find((e) => e.id === elementId)
        if (!element || !element.position.absolute) return
        element.position.absolute.x = x
        element.position.absolute.y = y
        state.page.updatedAt = new Date().toISOString()
      })
    },

    setElementSize: (sectionId, elementId, width, height) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        const element = section.elements.find((e) => e.id === elementId)
        if (!element || !element.position.absolute) return
        element.position.absolute.width = width
        element.position.absolute.height = height
        state.page.updatedAt = new Date().toISOString()
      })
    },

    setElementZIndex: (sectionId, elementId, zIndex) => {
      set((state) => {
        if (!state.page) return
        const section = state.page.sections.find((s) => s.id === sectionId)
        if (!section) return
        const element = section.elements.find((e) => e.id === elementId)
        if (!element || !element.position.absolute) return
        element.position.absolute.zIndex = zIndex
        state.page.updatedAt = new Date().toISOString()
      })
    },

    // Selection actions
    selectSection: (sectionId) => {
      set((state) => {
        state.selectedSectionId = sectionId
        if (sectionId === null) {
          state.selectedElementId = null
        }
      })
    },

    selectElement: (elementId) => {
      set((state) => {
        state.selectedElementId = elementId
      })
    },

    hoverSection: (sectionId) => {
      set((state) => {
        state.hoveredSectionId = sectionId
      })
    },

    hoverElement: (elementId) => {
      set((state) => {
        state.hoveredElementId = elementId
      })
    },

    // Editing state actions
    setEditingLayoutMode: (editing) => {
      set((state) => {
        state.editingLayoutMode = editing
      })
    },

    setResizingElement: (elementId) => {
      set((state) => {
        state.resizingElementId = elementId
      })
    },

    setDraggingElement: (elementId) => {
      set((state) => {
        state.draggingElementId = elementId
      })
    },

    // History actions
    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--
          state.page = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
        }
      })
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++
          state.page = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
        }
      })
    },

    pushHistory: () => {
      set((state) => {
        if (!state.page) return
        // Remove any future history if we're not at the end
        state.history = state.history.slice(0, state.historyIndex + 1)
        // Add current state to history
        state.history.push(JSON.parse(JSON.stringify(state.page)))
        state.historyIndex = state.history.length - 1
        // Limit history size
        if (state.history.length > 50) {
          state.history.shift()
          state.historyIndex--
        }
      })
    },

    // Utility
    getSectionById: (sectionId) => {
      const state = get()
      return state.page?.sections.find((s) => s.id === sectionId)
    },

    getElementById: (sectionId, elementId) => {
      const state = get()
      const section = state.page?.sections.find((s) => s.id === sectionId)
      return section?.elements.find((e) => e.id === elementId)
    },
  }))
)
