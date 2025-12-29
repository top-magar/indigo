import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

/**
 * Content Sanitization Tests
 * 
 * These tests verify that TipTap's schema-based sanitization properly strips
 * malicious content and only allows whitelisted HTML tags.
 * 
 * Requirements: 17.1, 17.2, 17.3
 * - THE Rich_Text_Editor SHALL only allow whitelisted HTML tags
 * - THE Rich_Text_Editor SHALL strip all script tags and event handler attributes
 * - WHEN content is loaded THEN the Rich_Text_Editor SHALL sanitize it through TipTap/ProseMirror schema
 */

// Helper function to create a TipTap editor instance with the same config as the app
function createTestEditor(content: string): Editor {
  return new Editor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
      Placeholder.configure({
        placeholder: 'Test placeholder',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
  })
}

describe('Content Sanitization via TipTap Schema', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
  })

  describe('Script Tag Stripping (Requirement 17.2)', () => {
    it('should strip inline script tags from content', () => {
      const maliciousContent = '<p>Hello</p><script>alert("XSS")</script><p>World</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      
      expect(html).not.toContain('<script>')
      expect(html).not.toContain('</script>')
      expect(html).not.toContain('alert')
      // TipTap adds style attributes for text-align, so check for content presence
      expect(html).toContain('Hello')
      expect(html).toContain('World')
      expect(html).toMatch(/<p[^>]*>Hello<\/p>/)
      expect(html).toMatch(/<p[^>]*>World<\/p>/)
    })

    it('should strip script tags with src attribute', () => {
      const maliciousContent = '<p>Content</p><script src="https://evil.com/xss.js"></script>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      
      expect(html).not.toContain('<script')
      expect(html).not.toContain('evil.com')
      expect(html).toMatch(/<p[^>]*>Content<\/p>/)
    })

    it('should strip script tags with type attribute', () => {
      const maliciousContent = '<script type="text/javascript">document.cookie</script><p>Safe</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      
      expect(html).not.toContain('<script')
      expect(html).not.toContain('document.cookie')
    })
  })

  describe('Event Handler Stripping (Requirement 17.2)', () => {
    it('should strip onclick event handlers', () => {
      const maliciousContent = '<p onclick="alert(\'XSS\')">Click me</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      
      expect(html).not.toContain('onclick')
      expect(html).not.toContain('alert')
      expect(html).toMatch(/<p[^>]*>Click me<\/p>/)
    })

    it('should strip onerror event handlers from images', () => {
      // Note: img tags are not in the whitelist, so they get stripped entirely
      const maliciousContent = '<p>Text</p><img src="x" onerror="alert(\'XSS\')" />'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      
      expect(html).not.toContain('onerror')
      expect(html).not.toContain('alert')
    })

    it('should strip onload event handlers', () => {
      const maliciousContent = '<p onload="malicious()">Content</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      
      expect(html).not.toContain('onload')
      expect(html).not.toContain('malicious')
    })

    it('should strip onmouseover event handlers', () => {
      const maliciousContent = '<p onmouseover="steal()">Hover me</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      
      expect(html).not.toContain('onmouseover')
      expect(html).not.toContain('steal')
    })

    it('should strip onfocus event handlers', () => {
      const maliciousContent = '<p onfocus="hack()">Focus me</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      
      expect(html).not.toContain('onfocus')
      expect(html).not.toContain('hack')
    })
  })

  describe('Whitelisted Tags (Requirement 17.1)', () => {
    it('should preserve paragraph tags', () => {
      const content = '<p>This is a paragraph</p>'
      editor = createTestEditor(content)
      
      // TipTap adds style attributes, so use regex to match
      expect(editor.getHTML()).toMatch(/<p[^>]*>/)
    })

    it('should preserve heading tags h1-h6', () => {
      const content = '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>'
      editor = createTestEditor(content)
      
      const html = editor.getHTML()
      expect(html).toMatch(/<h1[^>]*>/)
      expect(html).toMatch(/<h2[^>]*>/)
      expect(html).toMatch(/<h3[^>]*>/)
      expect(html).toMatch(/<h4[^>]*>/)
      expect(html).toMatch(/<h5[^>]*>/)
      expect(html).toMatch(/<h6[^>]*>/)
    })

    it('should preserve strong/bold tags', () => {
      const content = '<p><strong>Bold text</strong></p>'
      editor = createTestEditor(content)
      
      expect(editor.getHTML()).toContain('<strong>')
    })

    it('should preserve em/italic tags', () => {
      const content = '<p><em>Italic text</em></p>'
      editor = createTestEditor(content)
      
      expect(editor.getHTML()).toContain('<em>')
    })

    it('should preserve underline tags', () => {
      const content = '<p><u>Underlined text</u></p>'
      editor = createTestEditor(content)
      
      expect(editor.getHTML()).toContain('<u>')
    })

    it('should preserve strikethrough tags', () => {
      const content = '<p><s>Strikethrough text</s></p>'
      editor = createTestEditor(content)
      
      expect(editor.getHTML()).toContain('<s>')
    })

    it('should preserve anchor/link tags', () => {
      const content = '<p><a href="https://example.com">Link</a></p>'
      editor = createTestEditor(content)
      
      const html = editor.getHTML()
      expect(html).toContain('<a')
      expect(html).toContain('href')
    })

    it('should preserve unordered list tags', () => {
      const content = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      editor = createTestEditor(content)
      
      const html = editor.getHTML()
      expect(html).toContain('<ul>')
      expect(html).toContain('<li>')
    })

    it('should preserve ordered list tags', () => {
      const content = '<ol><li>First</li><li>Second</li></ol>'
      editor = createTestEditor(content)
      
      const html = editor.getHTML()
      expect(html).toContain('<ol>')
      expect(html).toContain('<li>')
    })

    it('should preserve br tags', () => {
      const content = '<p>Line 1<br>Line 2</p>'
      editor = createTestEditor(content)
      
      // TipTap may convert br to hard break
      const html = editor.getHTML()
      expect(html).toContain('Line 1')
      expect(html).toContain('Line 2')
    })
  })

  describe('Non-Whitelisted Tags Stripping', () => {
    it('should strip iframe tags', () => {
      const maliciousContent = '<p>Safe</p><iframe src="https://evil.com"></iframe>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<iframe')
      expect(html).not.toContain('evil.com')
    })

    it('should strip object tags', () => {
      const maliciousContent = '<object data="malware.swf"></object><p>Content</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<object')
      expect(html).not.toContain('malware')
    })

    it('should strip embed tags', () => {
      const maliciousContent = '<embed src="virus.exe"><p>Text</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<embed')
      expect(html).not.toContain('virus')
    })

    it('should strip form tags', () => {
      const maliciousContent = '<form action="https://phishing.com"><input type="text"></form><p>Safe</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<form')
      expect(html).not.toContain('phishing')
    })

    it('should strip style tags', () => {
      const maliciousContent = '<style>body { display: none; }</style><p>Content</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<style')
      expect(html).not.toContain('display: none')
    })

    it('should strip meta tags', () => {
      const maliciousContent = '<meta http-equiv="refresh" content="0;url=evil.com"><p>Text</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<meta')
    })

    it('should strip link tags (stylesheet)', () => {
      const maliciousContent = '<link rel="stylesheet" href="evil.css"><p>Content</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<link')
      expect(html).not.toContain('evil.css')
    })
  })

  describe('Complex Malicious Content', () => {
    it('should handle nested malicious content', () => {
      const maliciousContent = `
        <p>Safe start</p>
        <div onclick="alert('XSS')">
          <script>document.cookie</script>
          <p>Nested paragraph</p>
        </div>
        <p>Safe end</p>
      `
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<script')
      expect(html).not.toContain('onclick')
      expect(html).not.toContain('document.cookie')
      expect(html).toContain('Safe start')
      expect(html).toContain('Safe end')
    })

    it('should handle javascript: protocol in links', () => {
      // TipTap's Link extension should handle this
      const maliciousContent = '<p><a href="javascript:alert(\'XSS\')">Click</a></p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      // The link may be preserved but the javascript: protocol should be handled
      // TipTap's default behavior may vary, but it should not execute
      expect(html).not.toContain('javascript:alert')
    })

    it('should handle data: protocol in links', () => {
      const maliciousContent = '<p><a href="data:text/html,<script>alert(1)</script>">Click</a></p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('data:text/html')
    })

    it('should handle SVG with embedded script', () => {
      const maliciousContent = '<svg onload="alert(1)"><script>evil()</script></svg><p>Safe</p>'
      editor = createTestEditor(maliciousContent)
      
      const html = editor.getHTML()
      expect(html).not.toContain('<svg')
      expect(html).not.toContain('<script')
      expect(html).not.toContain('onload')
    })

    it('should handle mixed safe and unsafe content', () => {
      const mixedContent = `
        <h1>Title</h1>
        <script>malicious()</script>
        <p><strong>Bold</strong> and <em>italic</em></p>
        <iframe src="evil.com"></iframe>
        <ul>
          <li onclick="hack()">Item 1</li>
          <li>Item 2</li>
        </ul>
        <p><a href="https://safe.com">Safe link</a></p>
      `
      editor = createTestEditor(mixedContent)
      
      const html = editor.getHTML()
      
      // Should preserve safe content (TipTap adds style attributes)
      expect(html).toMatch(/<h1[^>]*>/)
      expect(html).toContain('<strong>')
      expect(html).toContain('<em>')
      expect(html).toContain('<ul>')
      expect(html).toContain('<li>')
      expect(html).toMatch(/<a[^>]*/)
      expect(html).toContain('https://safe.com')
      
      // Should strip unsafe content
      expect(html).not.toContain('<script')
      expect(html).not.toContain('<iframe')
      expect(html).not.toContain('onclick')
      expect(html).not.toContain('malicious')
      expect(html).not.toContain('evil.com')
      expect(html).not.toContain('hack')
    })
  })
})
