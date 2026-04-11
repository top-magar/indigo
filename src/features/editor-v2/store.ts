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

export interface SavedComponent {
  id: string
  name: string
  type: string
  props: Record<string, unknown>
}

export interface CanvasComment {
  id: string
  x: number
  y: number
  text: string
  resolved: boolean
}

export interface EditorState {
  components: SavedComponent[]
  comments: CanvasComment[]
  sections: Section[]
  /** @deprecated Use selectedIds instead. Kept for backward compat — returns selectedIds[0] ?? null */
  selectedId: string | null
  selectedIds: string[]
  theme: Record<string, unknown>
  tokens: Record<string, string | number>
  dirty: boolean
  viewport: 'desktop' | 'tablet' | 'mobile'
  previewMode: boolean
  clipboard: Section | null
  styleClipboard: Record<string, unknown> | null
  zoom: number
  hiddenSections: Set<string>

  addSection: (type: string) => void
  insertSection: (type: string, index: number) => void
  removeSection: (id: string) => void
  moveSection: (fromIndex: number, toIndex: number) => void
  duplicateSection: (id: string) => void
  selectSection: (id: string | null) => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  updateProps: (id: string, props: Partial<Record<string, unknown>>) => void
  updateTheme: (theme: Partial<Record<string, unknown>>) => void
  updateToken: (key: string, value: string | number) => void
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
  copyStyle: () => void
  pasteStyle: () => void
  setZoom: (z: number) => void
  panelsMinimized: boolean
  togglePanels: () => void
  toggleSectionVisibility: (id: string) => void
  saveAsComponent: (sectionId: string, name: string) => void
  updateComponent: (componentId: string, props: Record<string, unknown>) => void
  addComment: (x: number, y: number, text: string) => void
  resolveComment: (id: string) => void
  deleteComment: (id: string) => void
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

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set, get) => ({
      sections: [],
      components: [] as SavedComponent[],
      comments: [] as CanvasComment[],
      selectedIds: [] as string[],
      get selectedId(): string | null { return get().selectedIds[0] ?? null },
      theme: {},
      tokens: {
        'color.primary': '#3b82f6', 'color.secondary': '#8b5cf6', 'color.accent': '#06b6d4',
        'color.bg': '#ffffff', 'color.text': '#0f172a', 'color.muted': '#64748b',
        'spacing.xs': 4, 'spacing.sm': 8, 'spacing.md': 16, 'spacing.lg': 24, 'spacing.xl': 48,
        'radius.sm': 4, 'radius.md': 8, 'radius.lg': 16,
      } as Record<string, string | number>,
      dirty: false,
      viewport: 'desktop' as const,
      previewMode: false,
      clipboard: null,
      styleClipboard: null as Record<string, unknown> | null,
      zoom: 100,
      hiddenSections: new Set<string>(),
      panelsMinimized: false,

      addSection: (type) =>
        set((s) => {
          const def = getBlock(type)
          s.sections.push({
            id: nanoid(),
            type,
            props: { ...(def?.defaultProps ?? {}) },
          })
          s.dirty = true
        }),

      insertSection: (type, index) =>
        set((s) => {
          const def = getBlock(type)
          const section = { id: nanoid(), type, props: { ...(def?.defaultProps ?? {}) } }
          s.sections.splice(index, 0, section)
          s.dirty = true
        }),

      removeSection: (id) =>
        set((s) => {
          s.sections = s.sections.filter((sec) => sec.id !== id)
          s.selectedIds = s.selectedIds.filter((sid) => sid !== id)
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
          s.selectedIds = id ? [id] : []
        }),

      toggleSelect: (id) =>
        set((s) => {
          const idx = s.selectedIds.indexOf(id)
          if (idx === -1) s.selectedIds.push(id)
          else s.selectedIds.splice(idx, 1)
        }),

      selectAll: () =>
        set((s) => {
          s.selectedIds = s.sections.map((sec) => sec.id)
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
          // Sync tokens from theme (theme is source of truth for colors)
          const map: Record<string, string> = {
            primaryColor: 'color.primary', secondaryColor: 'color.secondary', accentColor: 'color.accent',
            backgroundColor: 'color.bg', textColor: 'color.text', mutedColor: 'color.muted',
          }
          for (const [themeKey, tokenKey] of Object.entries(map)) {
            if (themeKey in theme) s.tokens[tokenKey] = theme[themeKey] as string
          }
          s.dirty = true
        }),

      updateToken: (key: string, value: string | number) =>
        set((s) => {
          s.tokens[key] = value
          // Sync color tokens back to theme
          const map: Record<string, string> = {
            'color.primary': 'primaryColor', 'color.secondary': 'secondaryColor', 'color.accent': 'accentColor',
            'color.bg': 'backgroundColor', 'color.text': 'textColor', 'color.muted': 'mutedColor',
          }
          if (map[key]) s.theme[map[key]] = value
          s.dirty = true
        }),

      loadSections: (sections) =>
        set((s) => {
          s.sections = sections
          s.selectedIds = []
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
          s.selectedIds = s.selectedIds.filter((sid) => sid !== id)
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
          const firstSelected = s.selectedIds[0]
          const idx = firstSelected ? s.sections.findIndex((sec) => sec.id === firstSelected) : -1
          if (idx !== -1) s.sections.splice(idx + 1, 0, clone)
          else s.sections.push(clone)
          s.dirty = true
        }),

      copyStyle: () =>
        set((s) => {
          const firstId = s.selectedIds[0]
          if (!firstId) return
          const section = findSection(s.sections, firstId)
          if (!section) return
          const style: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(section.props)) {
            if (k.startsWith('_')) style[k] = v
          }
          s.styleClipboard = style
        }),

      pasteStyle: () =>
        set((s) => {
          if (!s.styleClipboard) return
          for (const id of s.selectedIds) {
            const section = findSection(s.sections, id)
            if (section) Object.assign(section.props, s.styleClipboard)
          }
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

      saveAsComponent: (sectionId, name) =>
        set((s) => {
          const section = findSection(s.sections, sectionId)
          if (!section) return
          s.components.push({ id: nanoid(), name, type: section.type, props: { ...section.props } })
        }),

      updateComponent: (componentId, props) =>
        set((s) => {
          const comp = s.components.find((c) => c.id === componentId)
          if (!comp) return
          Object.assign(comp.props, props)
          const updateTree = (sections: Section[]) => {
            for (const sec of sections) {
              if (sec.props._componentId === componentId) Object.assign(sec.props, props)
              if (sec.children) for (const slot of Object.values(sec.children)) updateTree(slot)
            }
          }
          updateTree(s.sections)
          s.dirty = true
        }),

      addComment: (x, y, text) =>
        set((s) => { s.comments.push({ id: nanoid(), x, y, text, resolved: false }) }),

      resolveComment: (id) =>
        set((s) => {
          const c = s.comments.find((c) => c.id === id)
          if (c) c.resolved = true
        }),

      deleteComment: (id) =>
        set((s) => { s.comments = s.comments.filter((c) => c.id !== id) }),
    })),
    {
      partialize: (state) => {
        const { viewport, previewMode, clipboard, styleClipboard, zoom, panelsMinimized, hiddenSections, ...tracked } = state
        return tracked
      },
    },
  ),
)
