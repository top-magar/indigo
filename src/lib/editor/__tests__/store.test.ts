import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore, selectCanUndo, selectCanRedo } from '../store'
import type { HeroBlock, HeaderBlock, FooterBlock } from '@/types/blocks'

// Helper to create test blocks
function createHeroBlock(id: string, order: number): HeroBlock {
  return {
    id,
    type: 'hero',
    order,
    visible: true,
    variant: 'full-width',
    settings: {
      headline: `Hero ${id}`,
      subheadline: 'Test subheadline',
      primaryCtaText: 'Shop Now',
      primaryCtaLink: '/shop',
      overlayOpacity: 0.5,
      textAlignment: 'center',
      height: 'large',
    },
  }
}

function createHeaderBlock(id: string, order: number): HeaderBlock {
  return {
    id,
    type: 'header',
    order,
    visible: true,
    variant: 'classic',
    settings: {
      logoText: 'Test Store',
      navLinks: [{ label: 'Home', href: '/' }],
      showSearch: true,
      showAccount: true,
      sticky: true,
    },
  }
}

function createFooterBlock(id: string, order: number): FooterBlock {
  return {
    id,
    type: 'footer',
    order,
    visible: true,
    variant: 'multi-column',
    settings: {
      logoText: 'Test Store',
      columns: [{ title: 'Links', links: [{ label: 'About', href: '/about' }] }],
      socialLinks: [],
      showPaymentIcons: true,
      showNewsletter: false,
      legalLinks: [],
    },
  }
}

describe('Editor Store - Block Duplication', () => {
  beforeEach(() => {
    // Reset store state before each test
    useEditorStore.setState({
      blocks: [],
      selectedBlockId: null,
      hoveredBlockId: null,
      isDirty: false,
      isPreviewReady: false,
      history: { past: [], future: [] },
      inlineEdit: null,
      editorMode: 'edit',
      viewport: 'desktop',
    })
  })

  it('should create duplicate block at index+1', () => {
    const block1 = createHeroBlock('hero-1', 0)
    const block2 = createHeaderBlock('header-1', 1)
    const block3 = createFooterBlock('footer-1', 2)

    useEditorStore.getState().setBlocks([block1, block2, block3])
    useEditorStore.getState().duplicateBlock('header-1')

    const blocks = useEditorStore.getState().blocks
    
    // Should have 4 blocks now
    expect(blocks).toHaveLength(4)
    
    // Original block should still be at index 1
    expect(blocks[1].id).toBe('header-1')
    
    // Duplicated block should be at index 2 (index+1)
    expect(blocks[2].type).toBe('header')
    expect(blocks[2].id).not.toBe('header-1')
  })

  it('should generate unique ID for duplicated block (not same as original)', () => {
    const block = createHeroBlock('hero-original', 0)
    
    useEditorStore.getState().setBlocks([block])
    useEditorStore.getState().duplicateBlock('hero-original')

    const blocks = useEditorStore.getState().blocks
    const originalBlock = blocks.find(b => b.id === 'hero-original')
    const duplicatedBlock = blocks.find(b => b.id !== 'hero-original')

    expect(originalBlock).toBeDefined()
    expect(duplicatedBlock).toBeDefined()
    expect(duplicatedBlock!.id).not.toBe(originalBlock!.id)
  })

  it('should have settings deeply equal to original (excluding ID)', () => {
    const block = createHeroBlock('hero-1', 0) as HeroBlock
    block.settings.headline = 'Custom Headline'
    block.settings.subheadline = 'Custom Subheadline'
    block.settings.primaryCtaText = 'Buy Now'

    useEditorStore.getState().setBlocks([block])
    useEditorStore.getState().duplicateBlock('hero-1')

    const blocks = useEditorStore.getState().blocks
    const original = blocks[0] as HeroBlock
    const duplicate = blocks[1] as HeroBlock

    // Settings should be deeply equal
    expect(duplicate.settings).toEqual(original.settings)
    expect(duplicate.type).toBe(original.type)
    expect(duplicate.variant).toBe(original.variant)
    expect(duplicate.visible).toBe(original.visible)
    
    // But ID should be different
    expect(duplicate.id).not.toBe(original.id)
  })

  it('should update order values correctly after duplication', () => {
    const block1 = createHeroBlock('hero-1', 0)
    const block2 = createHeaderBlock('header-1', 1)
    const block3 = createFooterBlock('footer-1', 2)

    useEditorStore.getState().setBlocks([block1, block2, block3])
    useEditorStore.getState().duplicateBlock('hero-1')

    const blocks = useEditorStore.getState().blocks
    
    // All blocks should have correct sequential order values
    blocks.forEach((block, index) => {
      expect(block.order).toBe(index)
    })
  })

  it('should select the duplicated block after duplication', () => {
    const block = createHeroBlock('hero-1', 0)
    
    useEditorStore.getState().setBlocks([block])
    useEditorStore.getState().duplicateBlock('hero-1')

    const { selectedBlockId, blocks } = useEditorStore.getState()
    const duplicatedBlock = blocks.find(b => b.id !== 'hero-1')

    expect(selectedBlockId).toBe(duplicatedBlock!.id)
  })

  it('should create history entry for undo after duplication', () => {
    const block = createHeroBlock('hero-1', 0)
    
    useEditorStore.getState().setBlocks([block])
    
    // Clear history from setBlocks
    useEditorStore.setState({ history: { past: [], future: [] } })
    
    useEditorStore.getState().duplicateBlock('hero-1')

    const { history } = useEditorStore.getState()
    
    // Should have one history entry
    expect(history.past.length).toBe(1)
    // The history entry should contain the state before duplication (1 block)
    expect(history.past[0]).toHaveLength(1)
  })

  it('should mark store as dirty after duplication', () => {
    const block = createHeroBlock('hero-1', 0)
    
    useEditorStore.getState().setBlocks([block])
    useEditorStore.setState({ isDirty: false })
    
    useEditorStore.getState().duplicateBlock('hero-1')

    expect(useEditorStore.getState().isDirty).toBe(true)
  })

  it('should handle duplication of non-existent block gracefully', () => {
    const block = createHeroBlock('hero-1', 0)
    
    useEditorStore.getState().setBlocks([block])
    useEditorStore.getState().duplicateBlock('non-existent-id')

    const blocks = useEditorStore.getState().blocks
    
    // Should still have only 1 block
    expect(blocks).toHaveLength(1)
  })
})

describe('Editor Store - Block Deletion', () => {
  beforeEach(() => {
    useEditorStore.setState({
      blocks: [],
      selectedBlockId: null,
      hoveredBlockId: null,
      isDirty: false,
      isPreviewReady: false,
      history: { past: [], future: [] },
      inlineEdit: null,
      editorMode: 'edit',
      viewport: 'desktop',
    })
  })

  it('should remove block from array when deleted', () => {
    const block1 = createHeroBlock('hero-1', 0)
    const block2 = createHeaderBlock('header-1', 1)
    const block3 = createFooterBlock('footer-1', 2)

    useEditorStore.getState().setBlocks([block1, block2, block3])
    useEditorStore.getState().removeBlock('header-1')

    const blocks = useEditorStore.getState().blocks
    
    expect(blocks).toHaveLength(2)
    expect(blocks.find(b => b.id === 'header-1')).toBeUndefined()
  })

  it('should update order values correctly after deletion', () => {
    const block1 = createHeroBlock('hero-1', 0)
    const block2 = createHeaderBlock('header-1', 1)
    const block3 = createFooterBlock('footer-1', 2)

    useEditorStore.getState().setBlocks([block1, block2, block3])
    useEditorStore.getState().removeBlock('header-1')

    const blocks = useEditorStore.getState().blocks
    
    // All remaining blocks should have correct sequential order values
    blocks.forEach((block, index) => {
      expect(block.order).toBe(index)
    })
  })

  it('should be undoable through undo system', () => {
    const block1 = createHeroBlock('hero-1', 0)
    const block2 = createHeaderBlock('header-1', 1)

    useEditorStore.getState().setBlocks([block1, block2])
    
    // Clear history from setBlocks
    useEditorStore.setState({ history: { past: [], future: [] } })
    
    useEditorStore.getState().removeBlock('header-1')

    // Verify block is deleted
    expect(useEditorStore.getState().blocks).toHaveLength(1)
    expect(useEditorStore.getState().blocks.find(b => b.id === 'header-1')).toBeUndefined()

    // Undo the deletion
    useEditorStore.getState().undo()

    // Block should be restored
    const blocks = useEditorStore.getState().blocks
    expect(blocks).toHaveLength(2)
    expect(blocks.find(b => b.id === 'header-1')).toBeDefined()
  })

  it('should create history entry for undo after deletion', () => {
    const block = createHeroBlock('hero-1', 0)
    
    useEditorStore.getState().setBlocks([block])
    
    // Clear history from setBlocks
    useEditorStore.setState({ history: { past: [], future: [] } })
    
    useEditorStore.getState().removeBlock('hero-1')

    const { history } = useEditorStore.getState()
    
    // Should have one history entry
    expect(history.past.length).toBe(1)
    // The history entry should contain the state before deletion (1 block)
    expect(history.past[0]).toHaveLength(1)
  })

  it('should mark store as dirty after deletion', () => {
    const block = createHeroBlock('hero-1', 0)
    
    useEditorStore.getState().setBlocks([block])
    useEditorStore.setState({ isDirty: false })
    
    useEditorStore.getState().removeBlock('hero-1')

    expect(useEditorStore.getState().isDirty).toBe(true)
  })

  it('should clear selectedBlockId if deleted block was selected', () => {
    const block1 = createHeroBlock('hero-1', 0)
    const block2 = createHeaderBlock('header-1', 1)

    useEditorStore.getState().setBlocks([block1, block2])
    useEditorStore.getState().selectBlock('header-1')
    
    expect(useEditorStore.getState().selectedBlockId).toBe('header-1')
    
    useEditorStore.getState().removeBlock('header-1')

    expect(useEditorStore.getState().selectedBlockId).toBeNull()
  })

  it('should keep selectedBlockId if different block was deleted', () => {
    const block1 = createHeroBlock('hero-1', 0)
    const block2 = createHeaderBlock('header-1', 1)

    useEditorStore.getState().setBlocks([block1, block2])
    useEditorStore.getState().selectBlock('hero-1')
    
    useEditorStore.getState().removeBlock('header-1')

    expect(useEditorStore.getState().selectedBlockId).toBe('hero-1')
  })

  it('should handle deletion of non-existent block gracefully', () => {
    const block = createHeroBlock('hero-1', 0)
    
    useEditorStore.getState().setBlocks([block])
    useEditorStore.getState().removeBlock('non-existent-id')

    const blocks = useEditorStore.getState().blocks
    
    // Should still have 1 block
    expect(blocks).toHaveLength(1)
  })
})


describe('Editor Store - Undo/Redo Integration', () => {
  beforeEach(() => {
    useEditorStore.setState({
      blocks: [],
      selectedBlockId: null,
      hoveredBlockId: null,
      isDirty: false,
      isPreviewReady: false,
      history: { past: [], future: [] },
      inlineEdit: null,
      editorMode: 'edit',
      viewport: 'desktop',
    })
  })

  describe('Undo functionality (Cmd+Z)', () => {
    it('should revert last change when undo is called', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Add a second block
      useEditorStore.getState().addBlock(block2)
      
      // Verify we have 2 blocks
      expect(useEditorStore.getState().blocks).toHaveLength(2)
      
      // Undo the add
      useEditorStore.getState().undo()
      
      // Should be back to 1 block
      expect(useEditorStore.getState().blocks).toHaveLength(1)
      expect(useEditorStore.getState().blocks[0].id).toBe('hero-1')
    })

    it('should do nothing when history is empty', () => {
      const block = createHeroBlock('hero-1', 0)
      
      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Try to undo with empty history
      useEditorStore.getState().undo()
      
      // Should still have the block
      expect(useEditorStore.getState().blocks).toHaveLength(1)
      expect(useEditorStore.getState().blocks[0].id).toBe('hero-1')
    })

    it('should move current state to future when undoing', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      useEditorStore.getState().addBlock(block2)
      
      // Undo
      useEditorStore.getState().undo()
      
      // Future should now have the 2-block state
      const { history } = useEditorStore.getState()
      expect(history.future).toHaveLength(1)
      expect(history.future[0]).toHaveLength(2)
    })

    it('should mark store as dirty after undo', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] }, isDirty: false })
      
      useEditorStore.getState().addBlock(block2)
      useEditorStore.setState({ isDirty: false })
      
      useEditorStore.getState().undo()
      
      expect(useEditorStore.getState().isDirty).toBe(true)
    })
  })

  describe('Redo functionality (Cmd+Shift+Z)', () => {
    it('should restore undone change when redo is called', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      useEditorStore.getState().addBlock(block2)
      
      // Undo then redo
      useEditorStore.getState().undo()
      expect(useEditorStore.getState().blocks).toHaveLength(1)
      
      useEditorStore.getState().redo()
      expect(useEditorStore.getState().blocks).toHaveLength(2)
    })

    it('should do nothing when future is empty', () => {
      const block = createHeroBlock('hero-1', 0)
      
      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Try to redo with empty future
      useEditorStore.getState().redo()
      
      // Should still have the block
      expect(useEditorStore.getState().blocks).toHaveLength(1)
    })

    it('should move current state to past when redoing', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      useEditorStore.getState().addBlock(block2)
      useEditorStore.getState().undo()
      
      // Past should be empty after undo
      expect(useEditorStore.getState().history.past).toHaveLength(0)
      
      useEditorStore.getState().redo()
      
      // Past should now have the 1-block state
      const { history } = useEditorStore.getState()
      expect(history.past).toHaveLength(1)
      expect(history.past[0]).toHaveLength(1)
    })

    it('should mark store as dirty after redo', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] }, isDirty: false })
      
      useEditorStore.getState().addBlock(block2)
      useEditorStore.getState().undo()
      useEditorStore.setState({ isDirty: false })
      
      useEditorStore.getState().redo()
      
      expect(useEditorStore.getState().isDirty).toBe(true)
    })
  })

  describe('Edit session creates single history entry', () => {
    it('should create single history entry when inline edit session ends with save', () => {
      const block = createHeroBlock('hero-1', 0) as HeroBlock
      
      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Start inline edit
      useEditorStore.getState().startInlineEdit('hero-1', 'settings.headline', 'Original Headline')
      
      // Make multiple updates during the session (these don't create history entries)
      useEditorStore.getState().updateInlineEdit('New H')
      useEditorStore.getState().updateInlineEdit('New He')
      useEditorStore.getState().updateInlineEdit('New Headline')
      
      // End the edit session with save
      useEditorStore.getState().endInlineEdit(true)
      
      // Should have exactly one history entry for the entire session
      const { history } = useEditorStore.getState()
      expect(history.past).toHaveLength(1)
      
      // The history entry should contain the original value
      const historyBlock = history.past[0][0] as HeroBlock
      expect(historyBlock.settings.headline).toBe('Original Headline')
    })

    it('should not create history entry when inline edit is cancelled', () => {
      const block = createHeroBlock('hero-1', 0) as HeroBlock
      block.settings.headline = 'Original Headline'
      
      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Start inline edit
      useEditorStore.getState().startInlineEdit('hero-1', 'settings.headline', 'Original Headline')
      
      // Make updates
      useEditorStore.getState().updateInlineEdit('Changed Headline')
      
      // Cancel the edit session
      useEditorStore.getState().endInlineEdit(false)
      
      // Should have no history entries
      const { history, blocks } = useEditorStore.getState()
      expect(history.past).toHaveLength(0)
      
      // Content should be reverted to original
      const currentBlock = blocks[0] as HeroBlock
      expect(currentBlock.settings.headline).toBe('Original Headline')
    })

    it('should allow undo of complete edit session', () => {
      const block = createHeroBlock('hero-1', 0) as HeroBlock
      block.settings.headline = 'Original Headline'
      
      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Start and complete an inline edit
      useEditorStore.getState().startInlineEdit('hero-1', 'settings.headline', 'Original Headline')
      useEditorStore.getState().updateInlineEdit('New Headline')
      useEditorStore.getState().endInlineEdit(true)
      
      // Verify the change was applied
      let currentBlock = useEditorStore.getState().blocks[0] as HeroBlock
      expect(currentBlock.settings.headline).toBe('New Headline')
      
      // Undo the entire edit session
      useEditorStore.getState().undo()
      
      // Should be back to original
      currentBlock = useEditorStore.getState().blocks[0] as HeroBlock
      expect(currentBlock.settings.headline).toBe('Original Headline')
    })
  })

  describe('Block actions create history entries', () => {
    it('should create history entry when block is moved', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)
      const block3 = createFooterBlock('footer-1', 2)

      useEditorStore.getState().setBlocks([block1, block2, block3])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Move block
      useEditorStore.getState().moveBlock(0, 2)
      
      // Should have history entry
      const { history } = useEditorStore.getState()
      expect(history.past).toHaveLength(1)
      
      // History should contain original order
      expect(history.past[0][0].id).toBe('hero-1')
      expect(history.past[0][1].id).toBe('header-1')
      expect(history.past[0][2].id).toBe('footer-1')
    })

    it('should create history entry when block is duplicated', () => {
      const block = createHeroBlock('hero-1', 0)

      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      useEditorStore.getState().duplicateBlock('hero-1')
      
      const { history } = useEditorStore.getState()
      expect(history.past).toHaveLength(1)
      expect(history.past[0]).toHaveLength(1) // Original had 1 block
    })

    it('should create history entry when block is deleted', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1, block2])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      useEditorStore.getState().removeBlock('header-1')
      
      const { history } = useEditorStore.getState()
      expect(history.past).toHaveLength(1)
      expect(history.past[0]).toHaveLength(2) // Original had 2 blocks
    })

    it('should create history entry when block is added', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      useEditorStore.getState().addBlock(block2)
      
      const { history } = useEditorStore.getState()
      expect(history.past).toHaveLength(1)
      expect(history.past[0]).toHaveLength(1) // Original had 1 block
    })

    it('should create history entry when block settings are updated', () => {
      const block = createHeroBlock('hero-1', 0) as HeroBlock

      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      useEditorStore.getState().updateBlock('hero-1', { 
        settings: { ...block.settings, headline: 'Updated Headline' } 
      })
      
      const { history } = useEditorStore.getState()
      expect(history.past).toHaveLength(1)
    })
  })

  describe('History limit enforcement', () => {
    it('should maintain maximum of 50 history entries', () => {
      const block = createHeroBlock('hero-1', 0) as HeroBlock

      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Create 60 history entries
      for (let i = 0; i < 60; i++) {
        useEditorStore.getState().updateBlock('hero-1', { 
          settings: { ...block.settings, headline: `Headline ${i}` } 
        })
      }
      
      const { history } = useEditorStore.getState()
      expect(history.past.length).toBeLessThanOrEqual(50)
    })
  })

  describe('Selectors', () => {
    it('selectCanUndo should return true when history has past entries', () => {
      const block = createHeroBlock('hero-1', 0)

      useEditorStore.getState().setBlocks([block])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      expect(selectCanUndo(useEditorStore.getState())).toBe(false)
      
      useEditorStore.getState().addBlock(createHeaderBlock('header-1', 1))
      
      expect(selectCanUndo(useEditorStore.getState())).toBe(true)
    })

    it('selectCanRedo should return true when history has future entries', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      expect(selectCanRedo(useEditorStore.getState())).toBe(false)
      
      useEditorStore.getState().addBlock(block2)
      useEditorStore.getState().undo()
      
      expect(selectCanRedo(useEditorStore.getState())).toBe(true)
    })
  })

  describe('Future is cleared on new action', () => {
    it('should clear future history when a new action is performed after undo', () => {
      const block1 = createHeroBlock('hero-1', 0)
      const block2 = createHeaderBlock('header-1', 1)
      const block3 = createFooterBlock('footer-1', 2)

      useEditorStore.getState().setBlocks([block1])
      useEditorStore.setState({ history: { past: [], future: [] } })
      
      // Add block2
      useEditorStore.getState().addBlock(block2)
      
      // Undo
      useEditorStore.getState().undo()
      expect(useEditorStore.getState().history.future).toHaveLength(1)
      
      // Perform a new action (add block3)
      useEditorStore.getState().addBlock(block3)
      
      // Future should be cleared
      expect(useEditorStore.getState().history.future).toHaveLength(0)
    })
  })
})
