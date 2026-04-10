import { create } from 'zustand'
import { temporal } from 'zundo'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import { getBlock } from './registry'

export interface Section {
  id: string
  type: string
  props: Record<string, unknown>
}

export interface EditorState {
  sections: Section[]
  selectedId: string | null
  theme: Record<string, unknown>
  dirty: boolean
  viewport: 'desktop' | 'tablet' | 'mobile'
  previewMode: boolean

  addSection: (type: string) => void
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
          const section = s.sections.find((sec) => sec.id === id)
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
    })),
    {
      partialize: (state) => {
        const { viewport, previewMode, ...tracked } = state
        return tracked
      },
    },
  ),
)
