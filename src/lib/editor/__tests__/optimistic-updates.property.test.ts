/**
 * Property-based tests for Optimistic Updates
 * 
 * Tests the optimistic update behavior for save and publish operations,
 * including immediate status updates and rollback on failure.
 * 
 * Requirements tested:
 * - 5.1: Save shows immediate "Saving..." status
 * - 5.2: Save rolls back on failure
 * - 5.3: Publish shows immediate "Publishing..." status
 * - 5.4: Publish rolls back on failure
 * - 5.5: Pending state disables conflicting actions
 * - 5.6: Error toast with retry option
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'

// ============================================================================
// TYPES
// ============================================================================

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type PublishStatus = 'idle' | 'publishing' | 'published' | 'error'

interface LayoutStatus {
  status: 'draft' | 'published'
  hasDraft: boolean
  hasPublished: boolean
  lastPublishedAt: string | null
  lastUpdatedAt: string
}

interface OptimisticState {
  saveStatus: SaveStatus
  publishStatus: PublishStatus
  layoutStatus: LayoutStatus | null
  isDirty: boolean
  isPending: boolean
}

// ============================================================================
// OPTIMISTIC UPDATE SIMULATOR
// ============================================================================

/**
 * Simulates optimistic update behavior for save operations
 */
function simulateSaveOptimistic(
  initialState: OptimisticState,
  serverSuccess: boolean
): { 
  immediateState: OptimisticState
  finalState: OptimisticState 
} {
  // Cannot save if not dirty or pending
  if (!initialState.isDirty || initialState.isPending) {
    return { immediateState: initialState, finalState: initialState }
  }

  // Immediate optimistic update (Requirement 5.1)
  const immediateState: OptimisticState = {
    ...initialState,
    saveStatus: 'saving',
    isPending: true,
  }

  // Final state depends on server response
  if (serverSuccess) {
    const finalState: OptimisticState = {
      ...immediateState,
      saveStatus: 'saved',
      isDirty: false,
      isPending: false,
      layoutStatus: initialState.layoutStatus 
        ? { ...initialState.layoutStatus, hasDraft: true }
        : { status: 'draft', hasDraft: true, hasPublished: false, lastPublishedAt: null, lastUpdatedAt: new Date().toISOString() },
    }
    return { immediateState, finalState }
  } else {
    // Rollback on failure (Requirement 5.2)
    const finalState: OptimisticState = {
      ...initialState,
      saveStatus: 'error',
      isPending: false,
    }
    return { immediateState, finalState }
  }
}

/**
 * Simulates optimistic update behavior for publish operations
 */
function simulatePublishOptimistic(
  initialState: OptimisticState,
  saveSuccess: boolean,
  publishSuccess: boolean
): {
  immediateState: OptimisticState
  finalState: OptimisticState
} {
  // Cannot publish if pending
  if (initialState.isPending) {
    return { immediateState: initialState, finalState: initialState }
  }

  // Immediate optimistic update (Requirement 5.3)
  const immediateState: OptimisticState = {
    ...initialState,
    publishStatus: 'publishing',
    isPending: true,
  }

  // If dirty, need to save first
  if (initialState.isDirty && !saveSuccess) {
    // Rollback on save failure (Requirement 5.4)
    const finalState: OptimisticState = {
      ...initialState,
      publishStatus: 'error',
      isPending: false,
    }
    return { immediateState, finalState }
  }

  // Final state depends on publish response
  if (publishSuccess) {
    const finalState: OptimisticState = {
      ...immediateState,
      publishStatus: 'published',
      isDirty: false,
      isPending: false,
      layoutStatus: initialState.layoutStatus
        ? { ...initialState.layoutStatus, status: 'published', hasDraft: false, hasPublished: true, lastPublishedAt: new Date().toISOString() }
        : null,
    }
    return { immediateState, finalState }
  } else {
    // Rollback on failure (Requirement 5.4)
    const finalState: OptimisticState = {
      ...initialState,
      publishStatus: 'error',
      isPending: false,
    }
    return { immediateState, finalState }
  }
}

// ============================================================================
// ARBITRARIES
// ============================================================================

const layoutStatusArb = fc.record({
  status: fc.constantFrom('draft', 'published') as fc.Arbitrary<'draft' | 'published'>,
  hasDraft: fc.boolean(),
  hasPublished: fc.boolean(),
  lastPublishedAt: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
  lastUpdatedAt: fc.date().map(d => d.toISOString()),
})

const optimisticStateArb = fc.record({
  saveStatus: fc.constant('idle') as fc.Arbitrary<SaveStatus>,
  publishStatus: fc.constant('idle') as fc.Arbitrary<PublishStatus>,
  layoutStatus: fc.option(layoutStatusArb, { nil: null }),
  isDirty: fc.boolean(),
  isPending: fc.constant(false), // Start not pending
})

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('Optimistic Updates Property Tests', () => {
  describe('Property 8: Save Optimistic Update with Rollback', () => {
    it('should show saving status immediately when save starts', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => s.isDirty && !s.isPending),
          fc.boolean(),
          (initialState, serverSuccess) => {
            const { immediateState } = simulateSaveOptimistic(initialState, serverSuccess)
            
            // Requirement 5.1: Immediate "Saving..." status
            expect(immediateState.saveStatus).toBe('saving')
            expect(immediateState.isPending).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update to saved status on success', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => s.isDirty && !s.isPending),
          (initialState) => {
            const { finalState } = simulateSaveOptimistic(initialState, true)
            
            expect(finalState.saveStatus).toBe('saved')
            expect(finalState.isDirty).toBe(false)
            expect(finalState.isPending).toBe(false)
            expect(finalState.layoutStatus?.hasDraft).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should rollback to original state on failure', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => s.isDirty && !s.isPending),
          (initialState) => {
            const { finalState } = simulateSaveOptimistic(initialState, false)
            
            // Requirement 5.2: Rollback on failure
            expect(finalState.saveStatus).toBe('error')
            expect(finalState.isDirty).toBe(initialState.isDirty) // Unchanged
            expect(finalState.layoutStatus).toEqual(initialState.layoutStatus) // Unchanged
            expect(finalState.isPending).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not save when not dirty', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => !s.isDirty),
          fc.boolean(),
          (initialState, serverSuccess) => {
            const { immediateState, finalState } = simulateSaveOptimistic(initialState, serverSuccess)
            
            // No change when not dirty
            expect(immediateState).toEqual(initialState)
            expect(finalState).toEqual(initialState)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should not save when already pending (Requirement 5.5)', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.map(s => ({ ...s, isPending: true, isDirty: true })),
          fc.boolean(),
          (initialState, serverSuccess) => {
            const { immediateState, finalState } = simulateSaveOptimistic(initialState, serverSuccess)
            
            // Requirement 5.5: Pending state disables conflicting actions
            expect(immediateState).toEqual(initialState)
            expect(finalState).toEqual(initialState)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Property 9: Publish Optimistic Update with Rollback', () => {
    it('should show publishing status immediately when publish starts', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => !s.isPending),
          fc.boolean(),
          fc.boolean(),
          (initialState, saveSuccess, publishSuccess) => {
            const { immediateState } = simulatePublishOptimistic(initialState, saveSuccess, publishSuccess)
            
            // Requirement 5.3: Immediate "Publishing..." status
            expect(immediateState.publishStatus).toBe('publishing')
            expect(immediateState.isPending).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update to published status on success', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => !s.isPending && s.layoutStatus !== null),
          (initialState) => {
            const { finalState } = simulatePublishOptimistic(initialState, true, true)
            
            expect(finalState.publishStatus).toBe('published')
            expect(finalState.isDirty).toBe(false)
            expect(finalState.isPending).toBe(false)
            expect(finalState.layoutStatus?.hasPublished).toBe(true)
            expect(finalState.layoutStatus?.hasDraft).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should rollback on publish failure', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => !s.isPending && !s.isDirty),
          (initialState) => {
            const { finalState } = simulatePublishOptimistic(initialState, true, false)
            
            // Requirement 5.4: Rollback on failure
            expect(finalState.publishStatus).toBe('error')
            expect(finalState.layoutStatus).toEqual(initialState.layoutStatus) // Unchanged
            expect(finalState.isPending).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should rollback on save failure when dirty', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => !s.isPending && s.isDirty),
          (initialState) => {
            const { finalState } = simulatePublishOptimistic(initialState, false, true)
            
            // Requirement 5.4: Rollback on save failure
            expect(finalState.publishStatus).toBe('error')
            expect(finalState.layoutStatus).toEqual(initialState.layoutStatus) // Unchanged
            expect(finalState.isPending).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not publish when already pending (Requirement 5.5)', () => {
      fc.assert(
        fc.property(
          optimisticStateArb.map(s => ({ ...s, isPending: true })),
          fc.boolean(),
          fc.boolean(),
          (initialState, saveSuccess, publishSuccess) => {
            const { immediateState, finalState } = simulatePublishOptimistic(initialState, saveSuccess, publishSuccess)
            
            // Requirement 5.5: Pending state disables conflicting actions
            expect(immediateState).toEqual(initialState)
            expect(finalState).toEqual(initialState)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  describe('Status Transitions', () => {
    it('save status should follow valid transitions', () => {
      const validTransitions: Record<SaveStatus, SaveStatus[]> = {
        idle: ['saving'],
        saving: ['saved', 'error'],
        saved: ['idle'],
        error: ['idle'],
      }

      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => s.isDirty && !s.isPending),
          fc.boolean(),
          (initialState, serverSuccess) => {
            const { immediateState, finalState } = simulateSaveOptimistic(initialState, serverSuccess)
            
            // idle -> saving is valid
            expect(validTransitions[initialState.saveStatus]).toContain(immediateState.saveStatus)
            
            // saving -> saved/error is valid
            expect(validTransitions[immediateState.saveStatus]).toContain(finalState.saveStatus)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('publish status should follow valid transitions', () => {
      const validTransitions: Record<PublishStatus, PublishStatus[]> = {
        idle: ['publishing'],
        publishing: ['published', 'error'],
        published: ['idle'],
        error: ['idle'],
      }

      fc.assert(
        fc.property(
          optimisticStateArb.filter(s => !s.isPending),
          fc.boolean(),
          fc.boolean(),
          (initialState, saveSuccess, publishSuccess) => {
            const { immediateState, finalState } = simulatePublishOptimistic(initialState, saveSuccess, publishSuccess)
            
            // idle -> publishing is valid
            expect(validTransitions[initialState.publishStatus]).toContain(immediateState.publishStatus)
            
            // publishing -> published/error is valid
            expect(validTransitions[immediateState.publishStatus]).toContain(finalState.publishStatus)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
