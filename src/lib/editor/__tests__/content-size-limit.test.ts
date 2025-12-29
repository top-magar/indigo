import { describe, it, expect } from 'vitest'
import { 
  MAX_CONTENT_SIZE_BYTES, 
  getContentSizeBytes, 
  isContentOverLimit 
} from '@/components/store/blocks/rich-text-editor/use-rich-text-editor'

/**
 * Content Size Limit Tests
 * 
 * These tests verify the content size limit functionality for the rich text editor.
 * 
 * Requirements: 17.4, 20.4
 * - THE Rich_Text_Editor SHALL enforce a maximum content size of 50KB per field
 * - IF content exceeds the maximum size THEN the Rich_Text_Editor SHALL display a warning and prevent further input
 */

describe('Content Size Limit', () => {
  describe('MAX_CONTENT_SIZE_BYTES constant', () => {
    it('should be set to 50KB (51200 bytes)', () => {
      expect(MAX_CONTENT_SIZE_BYTES).toBe(50 * 1024)
      expect(MAX_CONTENT_SIZE_BYTES).toBe(51200)
    })
  })

  describe('getContentSizeBytes', () => {
    it('should return 0 for empty string', () => {
      expect(getContentSizeBytes('')).toBe(0)
    })

    it('should return correct size for ASCII string', () => {
      const content = 'Hello, World!'
      expect(getContentSizeBytes(content)).toBe(13)
    })

    it('should return correct size for HTML content', () => {
      const content = '<p>Hello</p>'
      expect(getContentSizeBytes(content)).toBe(12)
    })

    it('should handle UTF-8 characters correctly', () => {
      // UTF-8 characters can be multiple bytes
      const content = '你好' // Chinese characters, 3 bytes each in UTF-8
      expect(getContentSizeBytes(content)).toBe(6)
    })

    it('should handle emoji correctly', () => {
      // Emoji are typically 4 bytes in UTF-8
      const content = '😀'
      expect(getContentSizeBytes(content)).toBe(4)
    })

    it('should calculate size for large content', () => {
      // Create a string that's exactly 1KB
      const oneKB = 'a'.repeat(1024)
      expect(getContentSizeBytes(oneKB)).toBe(1024)
    })
  })

  describe('isContentOverLimit', () => {
    it('should return false for empty content', () => {
      expect(isContentOverLimit('')).toBe(false)
    })

    it('should return false for small content', () => {
      const content = '<p>This is a small paragraph.</p>'
      expect(isContentOverLimit(content)).toBe(false)
    })

    it('should return false for content exactly at limit', () => {
      // Create content exactly at 50KB
      const content = 'a'.repeat(MAX_CONTENT_SIZE_BYTES)
      expect(isContentOverLimit(content)).toBe(false)
    })

    it('should return true for content over limit', () => {
      // Create content just over 50KB
      const content = 'a'.repeat(MAX_CONTENT_SIZE_BYTES + 1)
      expect(isContentOverLimit(content)).toBe(true)
    })

    it('should return true for significantly over limit content', () => {
      // Create content at 100KB
      const content = 'a'.repeat(100 * 1024)
      expect(isContentOverLimit(content)).toBe(true)
    })
  })

  describe('Content size edge cases', () => {
    it('should handle content with newlines', () => {
      const content = 'Line 1\nLine 2\nLine 3'
      // Each newline is 1 byte
      expect(getContentSizeBytes(content)).toBe(20)
    })

    it('should handle content with HTML entities', () => {
      const content = '&lt;script&gt;'
      // HTML entities are stored as their literal characters
      expect(getContentSizeBytes(content)).toBe(14)
    })

    it('should handle rich HTML content', () => {
      const content = `
        <h1>Title</h1>
        <p><strong>Bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `
      const size = getContentSizeBytes(content)
      expect(size).toBeGreaterThan(0)
      expect(size).toBeLessThan(MAX_CONTENT_SIZE_BYTES)
    })

    it('should handle content approaching the limit', () => {
      // Create content at 49KB (just under limit)
      const content = 'a'.repeat(49 * 1024)
      expect(isContentOverLimit(content)).toBe(false)
      expect(getContentSizeBytes(content)).toBe(49 * 1024)
    })
  })
})
