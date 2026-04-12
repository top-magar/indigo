import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../store'

describe('editor store', () => {
  beforeEach(() => {
    useEditorStore.setState({
      sections: [],
      selectedId: null,
      selectedIds: [],
      dirty: false,
      theme: {},
      viewport: 'desktop',
      clipboard: null,
      history: [],
    })
  })

  it('addSection adds a section with id and type', () => {
    useEditorStore.getState().addSection('hero')
    const { sections, dirty } = useEditorStore.getState()
    expect(sections).toHaveLength(1)
    expect(sections[0].type).toBe('hero')
    expect(sections[0].id).toBeTruthy()
    expect(dirty).toBe(true)
  })

  it('addSection accepts a Section object directly', () => {
    useEditorStore.getState().addSection({ id: 'custom-1', type: 'text', props: { heading: 'Hi' } })
    expect(useEditorStore.getState().sections[0].id).toBe('custom-1')
    expect(useEditorStore.getState().sections[0].props.heading).toBe('Hi')
  })

  it('removeSection removes a section by id', () => {
    useEditorStore.getState().addSection('hero')
    const id = useEditorStore.getState().sections[0].id
    useEditorStore.getState().removeSection(id)
    expect(useEditorStore.getState().sections).toHaveLength(0)
  })

  it('removeSection clears selectedIds for removed section', () => {
    useEditorStore.getState().addSection('hero')
    const id = useEditorStore.getState().sections[0].id
    useEditorStore.getState().selectSection(id)
    useEditorStore.getState().removeSection(id)
    expect(useEditorStore.getState().selectedIds).not.toContain(id)
    expect(useEditorStore.getState().selectedId).toBeNull()
  })

  it('selectSection sets selectedId and selectedIds', () => {
    useEditorStore.getState().addSection('hero')
    const id = useEditorStore.getState().sections[0].id
    useEditorStore.getState().selectSection(id)
    expect(useEditorStore.getState().selectedId).toBe(id)
    expect(useEditorStore.getState().selectedIds).toEqual([id])
  })

  it('selectSection null deselects', () => {
    useEditorStore.getState().addSection('hero')
    const id = useEditorStore.getState().sections[0].id
    useEditorStore.getState().selectSection(id)
    useEditorStore.getState().selectSection(null)
    expect(useEditorStore.getState().selectedId).toBeNull()
    expect(useEditorStore.getState().selectedIds).toEqual([])
  })

  it('updateProps updates section props', () => {
    useEditorStore.getState().addSection({ id: 's1', type: 'hero', props: { heading: 'Old' } })
    useEditorStore.getState().updateProps('s1', { heading: 'New Title' })
    expect(useEditorStore.getState().sections[0].props.heading).toBe('New Title')
    expect(useEditorStore.getState().dirty).toBe(true)
  })

  it('updateProps merges without overwriting other props', () => {
    useEditorStore.getState().addSection({ id: 's1', type: 'hero', props: { heading: 'Hi', sub: 'World' } })
    useEditorStore.getState().updateProps('s1', { heading: 'Changed' })
    expect(useEditorStore.getState().sections[0].props.sub).toBe('World')
  })

  it('duplicateSection creates a copy after original', () => {
    useEditorStore.getState().addSection('hero')
    const id = useEditorStore.getState().sections[0].id
    useEditorStore.getState().duplicateSection(id)
    const { sections } = useEditorStore.getState()
    expect(sections).toHaveLength(2)
    expect(sections[1].type).toBe('hero')
    expect(sections[1].id).not.toBe(id)
  })

  it('moveSection reorders sections', () => {
    useEditorStore.getState().addSection({ id: 'a', type: 'hero', props: {} })
    useEditorStore.getState().addSection({ id: 'b', type: 'text', props: {} })
    useEditorStore.getState().moveSection(0, 1)
    const { sections } = useEditorStore.getState()
    expect(sections[0].id).toBe('b')
    expect(sections[1].id).toBe('a')
  })

  it('updateTheme updates theme', () => {
    useEditorStore.getState().updateTheme({ primaryColor: '#ff0000' })
    expect(useEditorStore.getState().theme.primaryColor).toBe('#ff0000')
    expect(useEditorStore.getState().dirty).toBe(true)
  })

  it('updateTheme syncs tokens', () => {
    useEditorStore.getState().updateTheme({ primaryColor: '#ff0000' })
    expect(useEditorStore.getState().tokens['color.primary']).toBe('#ff0000')
  })

  it('setViewport changes viewport', () => {
    useEditorStore.getState().setViewport('mobile')
    expect(useEditorStore.getState().viewport).toBe('mobile')
  })

  it('undo reverts last action', () => {
    useEditorStore.getState().addSection({ id: 'u1', type: 'hero', props: {} })
    expect(useEditorStore.getState().sections).toHaveLength(1)
    useEditorStore.temporal.getState().undo()
    expect(useEditorStore.getState().sections).toHaveLength(0)
  })
})
