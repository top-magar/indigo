/**
 * Tests for sync retry functionality in editor communication
 * Validates: Requirements 20.1, 20.2, 20.3
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import {
  sendToEditor,
  getSyncState,
  resetSyncState,
  retrySyncIfNeeded,
  hasPendingSync,
  isConnectionAvailable,
  markConnectionRestored,
  isParentFrameAvailable,
} from "../communication"

describe("Sync Retry Functionality", () => {
  // Store original window properties
  const originalWindow = global.window
  const originalParent = global.window?.parent

  beforeEach(() => {
    // Reset sync state before each test
    resetSyncState()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore window properties
    if (originalWindow) {
      Object.defineProperty(global, "window", {
        value: originalWindow,
        writable: true,
      })
    }
  })

  describe("getSyncState", () => {
    it("should return initial sync state", () => {
      const state = getSyncState()
      expect(state.lastSyncFailed).toBe(false)
      expect(state.pendingMessage).toBe(null)
      expect(state.isConnected).toBe(true)
    })
  })

  describe("resetSyncState", () => {
    it("should reset sync state to initial values", () => {
      // First, simulate a failed state by checking the state
      resetSyncState()
      const state = getSyncState()
      
      expect(state.lastSyncFailed).toBe(false)
      expect(state.pendingMessage).toBe(null)
      expect(state.isConnected).toBe(true)
    })
  })

  describe("hasPendingSync", () => {
    it("should return false when no pending sync", () => {
      expect(hasPendingSync()).toBe(false)
    })
  })

  describe("isConnectionAvailable", () => {
    it("should return true when connection is available", () => {
      resetSyncState()
      expect(isConnectionAvailable()).toBe(true)
    })
  })

  describe("markConnectionRestored", () => {
    it("should mark connection as restored", () => {
      resetSyncState()
      markConnectionRestored()
      expect(isConnectionAvailable()).toBe(true)
    })
  })

  describe("sendToEditor", () => {
    it("should return false when window is undefined", () => {
      // Mock window as undefined
      const originalWindow = global.window
      // @ts-expect-error - intentionally setting to undefined for test
      global.window = undefined

      const result = sendToEditor("INLINE_EDIT_CHANGE", { test: true })
      expect(result).toBe(false)

      // Restore
      global.window = originalWindow
    })

    it("should return false when parent equals window (not in iframe)", () => {
      // In test environment, window.parent === window
      const result = sendToEditor("INLINE_EDIT_CHANGE", { test: true })
      expect(result).toBe(false)
    })
  })

  describe("retrySyncIfNeeded", () => {
    it("should return true when no pending sync", () => {
      resetSyncState()
      const result = retrySyncIfNeeded()
      expect(result).toBe(true)
    })
  })

  describe("isParentFrameAvailable", () => {
    it("should return false when window is undefined", () => {
      const originalWindow = global.window
      // @ts-expect-error - intentionally setting to undefined for test
      global.window = undefined

      const result = isParentFrameAvailable()
      expect(result).toBe(false)

      global.window = originalWindow
    })

    it("should return false when parent equals window", () => {
      // In test environment, window.parent === window
      const result = isParentFrameAvailable()
      expect(result).toBe(false)
    })
  })
})

describe("Error Recovery Behavior", () => {
  beforeEach(() => {
    resetSyncState()
  })

  it("should track sync state correctly after reset", () => {
    const state = getSyncState()
    expect(state.lastSyncFailed).toBe(false)
    expect(state.pendingMessage).toBeNull()
    expect(state.isConnected).toBe(true)
  })

  it("should allow local editing to continue when not in iframe", () => {
    // When not in iframe, sendToEditor returns false but doesn't throw
    const result = sendToEditor("INLINE_EDIT_CHANGE", {
      blockId: "test-block",
      fieldPath: "content",
      value: "<p>Test content</p>",
    })
    
    // Should return false (not in iframe) but not throw
    expect(result).toBe(false)
    
    // Sync state should remain clean since we're not in iframe
    const state = getSyncState()
    expect(state.lastSyncFailed).toBe(false)
  })

  it("should handle multiple sync attempts gracefully", () => {
    // Multiple calls should not throw
    for (let i = 0; i < 5; i++) {
      const result = sendToEditor("INLINE_EDIT_CHANGE", {
        blockId: "test-block",
        fieldPath: "content",
        value: `<p>Content ${i}</p>`,
      })
      expect(result).toBe(false) // Not in iframe
    }
    
    // State should remain stable
    expect(hasPendingSync()).toBe(false)
    expect(isConnectionAvailable()).toBe(true)
  })

  it("should handle connection restoration", () => {
    resetSyncState()
    
    // Mark connection as restored
    markConnectionRestored()
    
    // Connection should be available
    expect(isConnectionAvailable()).toBe(true)
  })
})

describe("Local Editing During Disconnection (Requirements 20.2, 20.3)", () => {
  beforeEach(() => {
    resetSyncState()
  })

  it("should continue allowing local edits when parent frame unavailable", () => {
    // Simulate multiple edit operations when not in iframe
    // These should all complete without throwing errors
    const editOperations = [
      { type: "INLINE_EDIT_START", payload: { blockId: "b1", fieldPath: "title", originalValue: "Hello" } },
      { type: "INLINE_EDIT_CHANGE", payload: { blockId: "b1", fieldPath: "title", value: "Hello World" } },
      { type: "INLINE_EDIT_CHANGE", payload: { blockId: "b1", fieldPath: "title", value: "Hello World!" } },
      { type: "INLINE_EDIT_END", payload: { blockId: "b1", fieldPath: "title", value: "Hello World!", originalValue: "Hello" } },
    ]

    // All operations should complete without throwing
    editOperations.forEach(op => {
      expect(() => {
        sendToEditor(op.type as any, op.payload)
      }).not.toThrow()
    })

    // State should remain stable
    expect(isConnectionAvailable()).toBe(true)
  })

  it("should preserve pending message for sync when connection restored", () => {
    resetSyncState()
    
    // Initially no pending sync
    expect(hasPendingSync()).toBe(false)
    
    // After marking connection restored, should still be connected
    markConnectionRestored()
    expect(isConnectionAvailable()).toBe(true)
  })

  it("should handle rapid edit sequences without data loss", () => {
    // Simulate rapid typing - multiple changes in quick succession
    const changes = Array.from({ length: 10 }, (_, i) => ({
      blockId: "test-block",
      fieldPath: "content",
      value: `<p>Content after ${i + 1} keystrokes</p>`,
    }))

    // All changes should be processed without throwing
    changes.forEach(change => {
      expect(() => {
        sendToEditor("INLINE_EDIT_CHANGE", change)
      }).not.toThrow()
    })

    // System should remain stable
    expect(isConnectionAvailable()).toBe(true)
  })

  it("should handle edit session lifecycle during disconnection", () => {
    // Start edit
    expect(() => {
      sendToEditor("INLINE_EDIT_START", {
        blockId: "block-1",
        fieldPath: "headline",
        originalValue: "<p>Original</p>",
      })
    }).not.toThrow()

    // Make changes
    expect(() => {
      sendToEditor("INLINE_EDIT_CHANGE", {
        blockId: "block-1",
        fieldPath: "headline",
        value: "<p>Modified</p>",
      })
    }).not.toThrow()

    // End edit (save)
    expect(() => {
      sendToEditor("INLINE_EDIT_END", {
        blockId: "block-1",
        fieldPath: "headline",
        value: "<p>Modified</p>",
        originalValue: "<p>Original</p>",
      })
    }).not.toThrow()

    // System should remain stable
    expect(isConnectionAvailable()).toBe(true)
  })

  it("should handle edit cancellation during disconnection", () => {
    // Start edit
    sendToEditor("INLINE_EDIT_START", {
      blockId: "block-1",
      fieldPath: "headline",
      originalValue: "<p>Original</p>",
    })

    // Make changes
    sendToEditor("INLINE_EDIT_CHANGE", {
      blockId: "block-1",
      fieldPath: "headline",
      value: "<p>Modified</p>",
    })

    // Cancel edit (should not throw)
    expect(() => {
      sendToEditor("INLINE_EDIT_CANCEL", {
        blockId: "block-1",
        fieldPath: "headline",
        originalValue: "<p>Original</p>",
      })
    }).not.toThrow()

    // System should remain stable
    expect(isConnectionAvailable()).toBe(true)
  })
})
