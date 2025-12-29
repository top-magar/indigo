import { describe, it, expect } from 'vitest'
import { defaultToolbarConfig, type ToolbarConfig } from '@/components/store/blocks/rich-text-editor/types'

describe('Toolbar Configuration', () => {
  describe('Default Toolbar Config', () => {
    it('should include bold in default config', () => {
      expect(defaultToolbarConfig.bold).toBe(true)
    })

    it('should include italic in default config', () => {
      expect(defaultToolbarConfig.italic).toBe(true)
    })

    it('should include underline in default config', () => {
      expect(defaultToolbarConfig.underline).toBe(true)
    })

    it('should include headings with levels 1, 2, 3 in default config', () => {
      expect(defaultToolbarConfig.heading).toEqual({ levels: [1, 2, 3] })
    })

    it('should include bullet list in default config', () => {
      expect(defaultToolbarConfig.bulletList).toBe(true)
    })

    it('should include ordered list in default config', () => {
      expect(defaultToolbarConfig.orderedList).toBe(true)
    })

    it('should include link in default config', () => {
      expect(defaultToolbarConfig.link).toBe(true)
    })

    it('should include text alignment in default config', () => {
      expect(defaultToolbarConfig.textAlign).toBe(true)
    })

    it('should have strikethrough disabled by default', () => {
      expect(defaultToolbarConfig.strike).toBe(false)
    })

    it('should have code disabled by default', () => {
      expect(defaultToolbarConfig.code).toBe(false)
    })
  })

  describe('Custom Toolbar Config', () => {
    it('should allow creating config with only bold enabled', () => {
      const config: ToolbarConfig = {
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        link: false,
        textAlign: false,
        code: false,
      }

      expect(config.bold).toBe(true)
      expect(config.italic).toBe(false)
    })

    it('should allow creating config with specific heading levels', () => {
      const config: ToolbarConfig = {
        heading: { levels: [2, 3] },
      }

      expect(config.heading).toEqual({ levels: [2, 3] })
    })

    it('should allow creating minimal config', () => {
      const config: ToolbarConfig = {
        bold: true,
        italic: true,
      }

      expect(config.bold).toBe(true)
      expect(config.italic).toBe(true)
      expect(config.underline).toBeUndefined()
    })
  })
})
