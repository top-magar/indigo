/**
 * Tests for nested block operations in the editor store
 * Verifies: addBlockToContainer, moveBlockToContainer, moveBlockWithinContainer, removeBlockFromContainer
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../store'
import type { StoreBlock, SectionBlock, ColumnsBlock, ColumnBlock, RichTextBlock, ImageBlock } from '@/types/blocks'

// Helper to create test blocks
function createRichTextBlock(id: string, parentId?: string): RichTextBlock {
  return {
    id,
    type: 'rich-text',
    variant: 'simple',
    order: 0,
    visible: true,
    parentId,
    settings: {
      content: '<p>Test content</p>',
      padding: 'medium',
      maxWidth: 'medium',
      alignment: 'left',
    },
  }
}

function createImageBlock(id: string, parentId?: string): ImageBlock {
  return {
    id,
    type: 'image',
    variant: 'default',
    order: 0,
    visible: true,
    parentId,
    settings: {
      src: '/test.jpg',
      alt: 'Test image',
      objectFit: 'cover',
    },
  }
}

function createSectionBlock(id: string, children: StoreBlock[] = []): SectionBlock {
  return {
    id,
    type: 'section',
    variant: 'default',
    order: 0,
    visible: true,
    settings: {
      padding: 'medium',
      maxWidth: 'contained',
      verticalAlign: 'top',
    },
    children,
  }
}

function createColumnsBlock(id: string, children: ColumnBlock[] = []): ColumnsBlock {
  return {
    id,
    type: 'columns',
    variant: 'equal',
    order: 0,
    visible: true,
    settings: {
      columns: 2,
      gap: 'medium',
      verticalAlign: 'top',
      reverseOnMobile: false,
      stackOnMobile: true,
    },
    children,
  }
}

function createColumnBlock(id: string, children: StoreBlock[] = [], parentId?: string): ColumnBlock {
  return {
    id,
    type: 'column',
    variant: 'default',
    order: 0,
    visible: true,
    parentId,
    settings: {
      padding: 'none',
      verticalAlign: 'top',
    },
    children,
  }
}

describe('Nested Block Operations', () => {
  beforeEach(() => {
    // Reset store state before each test
    useEditorStore.setState({
      blocks: [],
      selectedBlockId: null,
      selectedBlockIds: [],
      hoveredBlockId: null,
      isDirty: false,
      history: { past: [], future: [] },
    })
  })

  describe('addBlockToContainer', () => {
    it('should add a block to an empty container', () => {
      const section = createSectionBlock('section-1')
      const richText = createRichTextBlock('text-1')

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().addBlockToContainer('section-1', richText)

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      
      expect(updatedSection.children).toHaveLength(1)
      expect(updatedSection.children[0].id).toBe('text-1')
      expect(updatedSection.children[0].parentId).toBe('section-1')
      expect(state.isDirty).toBe(true)
      expect(state.selectedBlockId).toBe('text-1')
    })

    it('should add a block at a specific index', () => {
      const section = createSectionBlock('section-1', [
        createRichTextBlock('text-1', 'section-1'),
        createRichTextBlock('text-3', 'section-1'),
      ])
      const newBlock = createRichTextBlock('text-2')

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().addBlockToContainer('section-1', newBlock, 1)

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      
      expect(updatedSection.children).toHaveLength(3)
      expect(updatedSection.children[0].id).toBe('text-1')
      expect(updatedSection.children[1].id).toBe('text-2')
      expect(updatedSection.children[2].id).toBe('text-3')
    })

    it('should add a block to a nested container', () => {
      const column = createColumnBlock('column-1', [], 'columns-1')
      const columns = createColumnsBlock('columns-1', [column])
      const section = createSectionBlock('section-1', [columns])
      const richText = createRichTextBlock('text-1')

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().addBlockToContainer('column-1', richText)

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      const updatedColumns = updatedSection.children[0] as ColumnsBlock
      const updatedColumn = updatedColumns.children[0] as ColumnBlock
      
      expect(updatedColumn.children).toHaveLength(1)
      expect(updatedColumn.children[0].id).toBe('text-1')
      expect(updatedColumn.children[0].parentId).toBe('column-1')
    })

    it('should record history for undo', () => {
      const section = createSectionBlock('section-1')
      const richText = createRichTextBlock('text-1')

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().addBlockToContainer('section-1', richText)

      const state = useEditorStore.getState()
      expect(state.history.past).toHaveLength(1)
      expect(state.history.future).toHaveLength(0)
    })
  })

  describe('moveBlockToContainer', () => {
    it('should move a top-level block into a container', () => {
      const section = createSectionBlock('section-1')
      const richText = createRichTextBlock('text-1')

      useEditorStore.setState({ blocks: [section, richText] })
      useEditorStore.getState().moveBlockToContainer('text-1', 'section-1')

      const state = useEditorStore.getState()
      expect(state.blocks).toHaveLength(1)
      
      const updatedSection = state.blocks[0] as SectionBlock
      expect(updatedSection.children).toHaveLength(1)
      expect(updatedSection.children[0].id).toBe('text-1')
      expect(updatedSection.children[0].parentId).toBe('section-1')
    })

    it('should move a block from one container to another', () => {
      const section1 = createSectionBlock('section-1', [
        createRichTextBlock('text-1', 'section-1'),
      ])
      const section2 = createSectionBlock('section-2')

      useEditorStore.setState({ blocks: [section1, section2] })
      useEditorStore.getState().moveBlockToContainer('text-1', 'section-2')

      const state = useEditorStore.getState()
      const updatedSection1 = state.blocks[0] as SectionBlock
      const updatedSection2 = state.blocks[1] as SectionBlock
      
      expect(updatedSection1.children).toHaveLength(0)
      expect(updatedSection2.children).toHaveLength(1)
      expect(updatedSection2.children[0].id).toBe('text-1')
      expect(updatedSection2.children[0].parentId).toBe('section-2')
    })

    it('should move a block to a specific index in the target container', () => {
      const section1 = createSectionBlock('section-1', [
        createRichTextBlock('text-1', 'section-1'),
      ])
      const section2 = createSectionBlock('section-2', [
        createRichTextBlock('text-2', 'section-2'),
        createRichTextBlock('text-3', 'section-2'),
      ])

      useEditorStore.setState({ blocks: [section1, section2] })
      useEditorStore.getState().moveBlockToContainer('text-1', 'section-2', 1)

      const state = useEditorStore.getState()
      const updatedSection2 = state.blocks[1] as SectionBlock
      
      expect(updatedSection2.children).toHaveLength(3)
      expect(updatedSection2.children[0].id).toBe('text-2')
      expect(updatedSection2.children[1].id).toBe('text-1')
      expect(updatedSection2.children[2].id).toBe('text-3')
    })

    it('should move a block from nested container to another nested container', () => {
      const column1 = createColumnBlock('column-1', [
        createRichTextBlock('text-1', 'column-1'),
      ], 'columns-1')
      const column2 = createColumnBlock('column-2', [], 'columns-1')
      const columns = createColumnsBlock('columns-1', [column1, column2])
      const section = createSectionBlock('section-1', [columns])

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().moveBlockToContainer('text-1', 'column-2')

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      const updatedColumns = updatedSection.children[0] as ColumnsBlock
      const updatedColumn1 = updatedColumns.children[0] as ColumnBlock
      const updatedColumn2 = updatedColumns.children[1] as ColumnBlock
      
      expect(updatedColumn1.children).toHaveLength(0)
      expect(updatedColumn2.children).toHaveLength(1)
      expect(updatedColumn2.children[0].id).toBe('text-1')
    })
  })

  describe('moveBlockWithinContainer', () => {
    it('should reorder blocks within a container', () => {
      const section = createSectionBlock('section-1', [
        createRichTextBlock('text-1', 'section-1'),
        createRichTextBlock('text-2', 'section-1'),
        createRichTextBlock('text-3', 'section-1'),
      ])

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().moveBlockWithinContainer('section-1', 0, 2)

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      
      expect(updatedSection.children[0].id).toBe('text-2')
      expect(updatedSection.children[1].id).toBe('text-3')
      expect(updatedSection.children[2].id).toBe('text-1')
    })

    it('should reorder blocks in a nested container', () => {
      const column = createColumnBlock('column-1', [
        createRichTextBlock('text-1', 'column-1'),
        createImageBlock('image-1', 'column-1'),
      ], 'columns-1')
      const columns = createColumnsBlock('columns-1', [column])
      const section = createSectionBlock('section-1', [columns])

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().moveBlockWithinContainer('column-1', 0, 1)

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      const updatedColumns = updatedSection.children[0] as ColumnsBlock
      const updatedColumn = updatedColumns.children[0] as ColumnBlock
      
      expect(updatedColumn.children[0].id).toBe('image-1')
      expect(updatedColumn.children[1].id).toBe('text-1')
    })
  })

  describe('removeBlockFromContainer', () => {
    it('should remove a block from a container', () => {
      const section = createSectionBlock('section-1', [
        createRichTextBlock('text-1', 'section-1'),
        createRichTextBlock('text-2', 'section-1'),
      ])

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().removeBlockFromContainer('section-1', 'text-1')

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      
      expect(updatedSection.children).toHaveLength(1)
      expect(updatedSection.children[0].id).toBe('text-2')
    })

    it('should remove a block from a nested container', () => {
      const column = createColumnBlock('column-1', [
        createRichTextBlock('text-1', 'column-1'),
      ], 'columns-1')
      const columns = createColumnsBlock('columns-1', [column])
      const section = createSectionBlock('section-1', [columns])

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().removeBlockFromContainer('column-1', 'text-1')

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      const updatedColumns = updatedSection.children[0] as ColumnsBlock
      const updatedColumn = updatedColumns.children[0] as ColumnBlock
      
      expect(updatedColumn.children).toHaveLength(0)
    })

    it('should clear selection if removed block was selected', () => {
      const section = createSectionBlock('section-1', [
        createRichTextBlock('text-1', 'section-1'),
      ])

      useEditorStore.setState({ 
        blocks: [section],
        selectedBlockId: 'text-1',
      })
      useEditorStore.getState().removeBlockFromContainer('section-1', 'text-1')

      const state = useEditorStore.getState()
      expect(state.selectedBlockId).toBeNull()
    })

    it('should keep selection if removed block was not selected', () => {
      const section = createSectionBlock('section-1', [
        createRichTextBlock('text-1', 'section-1'),
        createRichTextBlock('text-2', 'section-1'),
      ])

      useEditorStore.setState({ 
        blocks: [section],
        selectedBlockId: 'text-2',
      })
      useEditorStore.getState().removeBlockFromContainer('section-1', 'text-1')

      const state = useEditorStore.getState()
      expect(state.selectedBlockId).toBe('text-2')
    })
  })

  describe('Integration: Undo/Redo with nested operations', () => {
    it('should undo addBlockToContainer', () => {
      const section = createSectionBlock('section-1')
      const richText = createRichTextBlock('text-1')

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().addBlockToContainer('section-1', richText)
      useEditorStore.getState().undo()

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      
      expect(updatedSection.children).toHaveLength(0)
    })

    it('should redo addBlockToContainer', () => {
      const section = createSectionBlock('section-1')
      const richText = createRichTextBlock('text-1')

      useEditorStore.setState({ blocks: [section] })
      useEditorStore.getState().addBlockToContainer('section-1', richText)
      useEditorStore.getState().undo()
      useEditorStore.getState().redo()

      const state = useEditorStore.getState()
      const updatedSection = state.blocks[0] as SectionBlock
      
      expect(updatedSection.children).toHaveLength(1)
      expect(updatedSection.children[0].id).toBe('text-1')
    })
  })
})
