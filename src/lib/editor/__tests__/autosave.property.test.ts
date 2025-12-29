/**
 * Property-Based Tests: Autosave Service
 * 
 * Feature: editor-improvements, Properties 1-3
 * Validates: Requirements 1.1-1.7
 * 
 * Property 1: Autosave Debounce Behavior
 * For any sequence of changes with varying timing, the autosave service should:
 * (a) start a timer on first change, (b) reset the timer on subsequent changes
 * within the debounce period, and (c) trigger exactly one save when the timer
 * expires with pending changes.
 * 
 * Property 2: Autosave Status Transitions
 * For any autosave operation, the status should transition correctly through states:
 * idle → pending → saving → (saved | error), and the lastSavedAt timestamp should
 * be set on success.
 * 
 * Property 3: Manual Save Cancels Autosave
 * For any pending autosave timer, when a manual save is triggered, the autosave
 * timer should be cancelled and no duplicate save should occur.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { AutosaveService, createAutosaveService, type AutosaveState, type AutosaveConfig } from '../autosave'

describe('Autosave Service - Property Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /**
   * Property 1: Autosave Debounce Behavior
   * Validates: Requirements 1.1, 1.2, 1.3
   */
  describe('Property 1: Autosave Debounce Behavior', () => {
    it('should start timer on first change and trigger exactly one save after debounce', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 10000 }), // debounceMs
          fc.integer({ min: 1, max: 10 }), // number of rapid changes
          (debounceMs, numChanges) => {
            let saveCount = 0
            const statusHistory: AutosaveState['status'][] = []

            const service = createAutosaveService(
              {
                onSave: async () => { saveCount++ },
                onStatusChange: (state) => { statusHistory.push(state.status) },
              },
              { debounceMs, maxRetries: 1, retryDelayMs: 100 }
            )

            // Simulate multiple rapid changes (all within debounce period)
            for (let i = 0; i < numChanges; i++) {
              service.start()
              // Advance time by less than debounce period
              vi.advanceTimersByTime(debounceMs / (numChanges + 1))
            }

            // At this point, no save should have occurred yet
            expect(saveCount).toBe(0)

            // Advance past the debounce period
            vi.advanceTimersByTime(debounceMs)

            // Exactly one save should have been triggered
            expect(saveCount).toBe(1)

            // Status should have transitioned to pending, then saving
            expect(statusHistory).toContain('pending')
            expect(statusHistory).toContain('saving')

            service.stop()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reset timer when changes occur during debounce period', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 500, max: 2000 }), // debounceMs
          (debounceMs) => {
            let saveCount = 0

            const service = createAutosaveService(
              {
                onSave: async () => { saveCount++ },
                onStatusChange: () => {},
              },
              { debounceMs, maxRetries: 1, retryDelayMs: 100 }
            )

            // First change
            service.start()
            
            // Advance time to just before debounce expires
            vi.advanceTimersByTime(debounceMs - 100)
            expect(saveCount).toBe(0)

            // Second change - should reset timer
            service.start()
            
            // Advance time to just before the NEW debounce expires
            vi.advanceTimersByTime(debounceMs - 100)
            expect(saveCount).toBe(0)

            // Now advance past the debounce period
            vi.advanceTimersByTime(200)
            expect(saveCount).toBe(1)

            service.stop()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 2: Autosave Status Transitions
   * Validates: Requirements 1.4, 1.5, 1.6
   */
  describe('Property 2: Autosave Status Transitions', () => {
    it('should transition through correct states on successful save', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 1000 }), // debounceMs
          async (debounceMs) => {
            const statusHistory: AutosaveState['status'][] = []
            let lastSavedAt: Date | null = null

            const service = createAutosaveService(
              {
                onSave: async () => {
                  // Simulate async save
                  await Promise.resolve()
                },
                onStatusChange: (state) => {
                  statusHistory.push(state.status)
                  if (state.lastSavedAt) {
                    lastSavedAt = state.lastSavedAt
                  }
                },
              },
              { debounceMs, maxRetries: 1, retryDelayMs: 100 }
            )

            // Trigger autosave
            service.start()
            expect(statusHistory).toContain('pending')

            // Advance past debounce and flush all async operations
            await vi.advanceTimersByTimeAsync(debounceMs + 100)

            // Should have transitioned through saving to saved
            expect(statusHistory).toContain('saving')
            expect(statusHistory).toContain('saved')
            expect(lastSavedAt).toBeInstanceOf(Date)

            service.stop()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should transition to error state after max retries on failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 500 }), // debounceMs
          fc.integer({ min: 1, max: 3 }), // maxRetries
          async (debounceMs, maxRetries) => {
            const statusHistory: AutosaveState['status'][] = []
            let errorMessage: string | null = null
            let saveAttempts = 0

            const service = createAutosaveService(
              {
                onSave: async () => {
                  saveAttempts++
                  throw new Error('Save failed')
                },
                onStatusChange: (state) => {
                  statusHistory.push(state.status)
                  if (state.error) {
                    errorMessage = state.error
                  }
                },
              },
              { debounceMs, maxRetries, retryDelayMs: 50 }
            )

            // Trigger autosave
            service.start()

            // Advance past debounce to trigger first save attempt
            await vi.advanceTimersByTimeAsync(debounceMs + 100)

            // Advance through all retry attempts with exponential backoff
            for (let i = 0; i < maxRetries; i++) {
              await vi.advanceTimersByTimeAsync(50 * Math.pow(2, i) + 100)
            }

            // Should have attempted save maxRetries times
            expect(saveAttempts).toBe(maxRetries)

            // Should end in error state
            expect(statusHistory[statusHistory.length - 1]).toBe('error')
            expect(errorMessage).toBe('Save failed')

            service.stop()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 3: Manual Save Cancels Autosave
   * Validates: Requirements 1.7
   */
  describe('Property 3: Manual Save Cancels Autosave', () => {
    it('should cancel pending autosave when cancel is called', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 500, max: 2000 }), // debounceMs
          fc.integer({ min: 100, max: 400 }), // cancelAfterMs (before debounce)
          (debounceMs, cancelAfterMs) => {
            // Ensure cancelAfterMs is less than debounceMs
            const actualCancelAfter = Math.min(cancelAfterMs, debounceMs - 100)
            let saveCount = 0
            const statusHistory: AutosaveState['status'][] = []

            const service = createAutosaveService(
              {
                onSave: async () => { saveCount++ },
                onStatusChange: (state) => { statusHistory.push(state.status) },
              },
              { debounceMs, maxRetries: 1, retryDelayMs: 100 }
            )

            // Start autosave
            service.start()
            expect(service.isPending()).toBe(true)

            // Advance time but not past debounce
            vi.advanceTimersByTime(actualCancelAfter)

            // Cancel (simulating manual save)
            service.cancel()
            expect(service.isPending()).toBe(false)

            // Advance past original debounce time
            vi.advanceTimersByTime(debounceMs)

            // No save should have occurred
            expect(saveCount).toBe(0)

            // Status should have gone back to idle
            expect(statusHistory[statusHistory.length - 1]).toBe('idle')

            service.stop()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not trigger duplicate saves when cancel is called during pending state', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 500, max: 2000 }), // debounceMs
          fc.integer({ min: 1, max: 5 }), // number of start/cancel cycles
          (debounceMs, numCycles) => {
            let saveCount = 0

            const service = createAutosaveService(
              {
                onSave: async () => { saveCount++ },
                onStatusChange: () => {},
              },
              { debounceMs, maxRetries: 1, retryDelayMs: 100 }
            )

            // Perform multiple start/cancel cycles
            for (let i = 0; i < numCycles; i++) {
              service.start()
              vi.advanceTimersByTime(debounceMs / 2)
              service.cancel()
            }

            // Advance well past any potential debounce
            vi.advanceTimersByTime(debounceMs * 2)

            // No saves should have occurred
            expect(saveCount).toBe(0)

            service.stop()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow new autosave after cancel', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 200, max: 1000 }), // debounceMs
          (debounceMs) => {
            let saveCount = 0

            const service = createAutosaveService(
              {
                onSave: async () => { saveCount++ },
                onStatusChange: () => {},
              },
              { debounceMs, maxRetries: 1, retryDelayMs: 100 }
            )

            // First autosave - cancelled
            service.start()
            vi.advanceTimersByTime(debounceMs / 2)
            service.cancel()

            // Second autosave - should complete
            service.start()
            vi.advanceTimersByTime(debounceMs + 100)

            // Exactly one save should have occurred
            expect(saveCount).toBe(1)

            service.stop()
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Additional property: Stop prevents all future saves
   */
  describe('Stop behavior', () => {
    it('should prevent all saves after stop is called', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 500 }), // debounceMs
          (debounceMs) => {
            let saveCount = 0

            const service = createAutosaveService(
              {
                onSave: async () => { saveCount++ },
                onStatusChange: () => {},
              },
              { debounceMs, maxRetries: 1, retryDelayMs: 100 }
            )

            // Start autosave
            service.start()

            // Stop the service
            service.stop()

            // Advance past debounce
            vi.advanceTimersByTime(debounceMs + 100)

            // No save should have occurred
            expect(saveCount).toBe(0)

            // Starting again should have no effect
            service.start()
            vi.advanceTimersByTime(debounceMs + 100)
            expect(saveCount).toBe(0)

            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
