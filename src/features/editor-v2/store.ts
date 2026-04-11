import { create } from 'zustand'
import { temporal } from 'zundo'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import { getBlock } from './registry'

export interface Section {
  id: string
  type: string
  props: Record<string, unknown>
  /** Named child slots — e.g. { col_0: [...], col_1: [...] } */
  children?: Record<string, Section[]>
}

export interface EditorState {
  sections: Section[]
  selectedId: string | null
  theme: Record<string, unknown>
  dirty: boolean
  viewport: 'desktop' | 'tablet' | 'mobile'
  previewMode: boolean
  clipboard: Section | null
  zoom: number
  hiddenSections: Set<string>

  addSection: (type: string) => void
  insertSection: (type: string, index: number) => void
  removeSection: (id: string) => void
  moveSection: (fromIndex: number, toIndex: number) => void
  duplicateSection: (id: string) => void
  selectSection: (id: string | null) => void
  updateProps: (id: string, props: Partial<Record<string, unknown>>) => void
  updateTheme: (theme: Partial<Record<string, unknown>>) => void
  loadSections: (sections: Section[]) => void
  markClean: () => void
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void
  setPreviewMode: (v: boolean) => void
  /** Add a section into a slot of a parent section */
  addChildSection: (parentId: string, slot: string, type: string) => void
  /** Remove a section from anywhere in the tree */
  removeDeep: (id: string) => void
  /** Move a section within a slot */
  moveInSlot: (parentId: string, slot: string, fromIndex: number, toIndex: number) => void
  copySection: (id: string) => void
  pasteSection: () => void
  setZoom: (z: number) => void
  panelsMinimized: boolean
  togglePanels: () => void
  toggleSectionVisibility: (id: string) => void
}

/** Find a section by ID anywhere in the tree. Returns the section or undefined. */
function findSection(sections: Section[], id: string): Section | undefined {
  for (const s of sections) {
    if (s.id === id) return s
    if (s.children) {
      for (const slot of Object.values(s.children)) {
        const found = findSection(slot, id)
        if (found) return found
      }
    }
  }
  return undefined
}

/** Remove a section by ID from anywhere in the tree. Returns true if found. */
function removeFromTree(sections: Section[], id: string): boolean {
  const idx = sections.findIndex((s) => s.id === id)
  if (idx !== -1) { sections.splice(idx, 1); return true }
  for (const s of sections) {
    if (s.children) {
      for (const slot of Object.values(s.children)) {
        if (removeFromTree(slot, id)) return true
      }
    }
  }
  return false
}

/** Smart auto-layout defaults per block type */
const AUTO_LAYOUT: Record<string, Record<string, unknown>> = {
  // Full-width sections — generous vertical padding, centered
  hero:            { _paddingTop: 80, _paddingBottom: 80, _paddingLeft: 24, _paddingRight: 24, _textAlign: "center" },
  faq:             { _paddingTop: 64, _paddingBottom: 64, _paddingLeft: 24, _paddingRight: 24, _maxWidth: 800 },
  newsletter:      { _paddingTop: 64, _paddingBottom: 64, _paddingLeft: 24, _paddingRight: 24, _textAlign: "center" },
  testimonials:    { _paddingTop: 64, _paddingBottom: 64, _paddingLeft: 24, _paddingRight: 24 },
  pricingTable:    { _paddingTop: 64, _paddingBottom: 64, _paddingLeft: 24, _paddingRight: 24 },
  // Content blocks — moderate padding
  text:            { _paddingTop: 32, _paddingBottom: 32, _paddingLeft: 24, _paddingRight: 24, _maxWidth: 720 },
  richText:        { _paddingTop: 32, _paddingBottom: 32, _paddingLeft: 24, _paddingRight: 24, _maxWidth: 720 },
  image:           { _paddingTop: 24, _paddingBottom: 24, _paddingLeft: 24, _paddingRight: 24 },
  button:          { _paddingTop: 24, _paddingBottom: 24, _paddingLeft: 24, _paddingRight: 24, _textAlign: "center" },
  divider:         { _paddingTop: 16, _paddingBottom: 16, _paddingLeft: 24, _paddingRight: 24 },
  // E-commerce — standard section padding
  productGrid:     { _paddingTop: 48, _paddingBottom: 48, _paddingLeft: 24, _paddingRight: 24 },
  featuredProduct: { _paddingTop: 48, _paddingBottom: 48, _paddingLeft: 24, _paddingRight: 24 },
  collectionList:  { _paddingTop: 48, _paddingBottom: 48, _paddingLeft: 24, _paddingRight: 24 },
  trustBadges:     { _paddingTop: 40, _paddingBottom: 40, _paddingLeft: 24, _paddingRight: 24, _textAlign: "center" },
  countdownTimer:  { _paddingTop: 40, _paddingBottom: 40, _paddingLeft: 24, _paddingRight: 24, _textAlign: "center" },
  cartSummary:     { _paddingTop: 48, _paddingBottom: 48, _paddingLeft: 24, _paddingRight: 24, _maxWidth: 600 },
  // Thin bars — minimal padding
  header:          { _paddingTop: 12, _paddingBottom: 12, _paddingLeft: 24, _paddingRight: 24 },
  footer:          { _paddingTop: 40, _paddingBottom: 40, _paddingLeft: 24, _paddingRight: 24 },
  announcementBar: { _paddingTop: 8, _paddingBottom: 8, _paddingLeft: 16, _paddingRight: 16, _textAlign: "center" },
  promoBanner:     { _paddingTop: 48, _paddingBottom: 48, _paddingLeft: 24, _paddingRight: 24, _textAlign: "center" },
  // Layout
  columns:         { _paddingTop: 32, _paddingBottom: 32, _paddingLeft: 24, _paddingRight: 24 },
  // Fallback
  _default:        { _paddingTop: 40, _paddingBottom: 40, _paddingLeft: 24, _paddingRight: 24 },
}

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set) => ({
      sections: [],
      selectedId: null,
      theme: {},
      dirty: false,
      viewport: 'desktop' as const,
      previewMode: false,
      clipboard: null,
      zoom: 100,
      hiddenSections: new Set<string>(),
      panelsMinimized: false,

      addSection: (type) =>
        set((s) => {
          const def = getBlock(type)
          const auto = AUTO_LAYOUT[type] ?? AUTO_LAYOUT._default ?? {}
          s.sections.push({
            id: nanoid(),
            type,
            props: { ...(def?.defaultProps ?? {}), ...auto },
          })
          s.dirty = true
        }),

      insertSection: (type, index) =>
        set((s) => {
          const def = getBlock(type)
          const auto = AUTO_LAYOUT[type] ?? AUTO_LAYOUT._default ?? {}
          const section = { id: nanoid(), type, props: { ...(def?.defaultProps ?? {}), ...auto } }
          s.sections.splice(index, 0, section)
          s.dirty = true
        }),

      removeSection: (id) =>
        set((s) => {
          s.sections = s.sections.filter((sec) => sec.id !== id)
          if (s.selectedId === id) s.selectedId = null
          s.dirty = true
        }),

      moveSection: (fromIndex, toIndex) =>
        set((s) => {
          const [item] = s.sections.splice(fromIndex, 1)
          if (item) {
            s.sections.splice(toIndex, 0, item)
            s.dirty = true
          }
        }),

      duplicateSection: (id) =>
        set((s) => {
          const idx = s.sections.findIndex((sec) => sec.id === id)
          if (idx === -1) return
          const original = s.sections[idx]
          s.sections.splice(idx + 1, 0, {
            id: nanoid(),
            type: original.type,
            props: { ...original.props },
          })
          s.dirty = true
        }),

      selectSection: (id) =>
        set((s) => {
          s.selectedId = id
        }),

      updateProps: (id, props) =>
        set((s) => {
          const section = findSection(s.sections, id)
          if (section) {
            Object.assign(section.props, props)
            s.dirty = true
          }
        }),

      updateTheme: (theme) =>
        set((s) => {
          Object.assign(s.theme, theme)
          s.dirty = true
        }),

      loadSections: (sections) =>
        set((s) => {
          s.sections = sections
          s.selectedId = null
          s.dirty = false
        }),

      markClean: () =>
        set((s) => {
          s.dirty = false
        }),

      setViewport: (v) =>
        set((s) => {
          s.viewport = v
        }),

      setPreviewMode: (v) =>
        set((s) => {
          s.previewMode = v
        }),

      addChildSection: (parentId, slot, type) =>
        set((s) => {
          const parent = findSection(s.sections, parentId)
          if (!parent) return
          if (!parent.children) parent.children = {}
          if (!parent.children[slot]) parent.children[slot] = []
          const def = getBlock(type)
          parent.children[slot].push({ id: nanoid(), type, props: { ...(def?.defaultProps ?? {}) } })
          s.dirty = true
        }),

      removeDeep: (id) =>
        set((s) => {
          removeFromTree(s.sections, id)
          if (s.selectedId === id) s.selectedId = null
          s.dirty = true
        }),

      moveInSlot: (parentId, slot, fromIndex, toIndex) =>
        set((s) => {
          const parent = findSection(s.sections, parentId)
          if (!parent?.children?.[slot]) return
          const arr = parent.children[slot]
          const [item] = arr.splice(fromIndex, 1)
          if (item) { arr.splice(toIndex, 0, item); s.dirty = true }
        }),

      copySection: (id) =>
        set((s) => {
          const section = findSection(s.sections, id)
          if (section) s.clipboard = JSON.parse(JSON.stringify(section))
        }),

      pasteSection: () =>
        set((s) => {
          if (!s.clipboard) return
          const clone = JSON.parse(JSON.stringify(s.clipboard)) as Section
          clone.id = nanoid()
          const idx = s.selectedId ? s.sections.findIndex((sec) => sec.id === s.selectedId) : -1
          if (idx !== -1) s.sections.splice(idx + 1, 0, clone)
          else s.sections.push(clone)
          s.dirty = true
        }),

      setZoom: (z) =>
        set((s) => {
          s.zoom = Math.min(200, Math.max(25, z))
        }),

      togglePanels: () =>
        set((s) => {
          s.panelsMinimized = !s.panelsMinimized
        }),

      toggleSectionVisibility: (id) =>
        set((s) => {
          const next = new Set(s.hiddenSections)
          next.has(id) ? next.delete(id) : next.add(id)
          s.hiddenSections = next
        }),
    })),
    {
      partialize: (state) => {
        const { viewport, previewMode, clipboard, zoom, panelsMinimized, hiddenSections, ...tracked } = state
        return tracked
      },
    },
  ),
)
