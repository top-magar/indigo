# Enterprise Visual Website Builder — Build Prompt

## Context

You are building a production-ready visual website builder for an e-commerce platform.
The builder is part of a Next.js 16 app with Supabase backend, Zustand state, and Tailwind CSS.

The existing codebase has:
- 23 section-based blocks (hero, product grid, FAQ, newsletter, etc.)
- Block registry with typed field definitions (text, image, select, toggle, list, product, collection)
- Zustand store with temporal undo/redo (zundo)
- Theme system with 17 CSS variables (colors, fonts, spacing, radius)
- Iframe preview mode with postMessage bridge
- Save/publish with autosave
- Drag-and-drop reorder (dnd-kit)
- Right-click context menu
- Keyboard shortcuts (⌘Z, ⌘S, ⌘K, ⌘D, arrows)
- Responsive viewport toggle (desktop/tablet/mobile)
- Content/Design tab split in settings panel
- 15 passing E2E tests

Path: /Users/topmagar/Desktop/indigo/src/features/editor-v2/

## Chain of Thought: What Makes Enterprise-Grade

### 1. DATA INTEGRITY (most critical)

**Problem**: Current save is fire-and-forget. If save fails, user loses work.
**Solution**:
- Optimistic save queue with retry (exponential backoff)
- Conflict detection: if another tab/user saved, show merge dialog
- Auto-recovery: persist draft to localStorage on every change, restore on reload
- Version snapshots: save creates a version entry, not just overwrites
- Dirty state tracking that survives page refresh

**Implementation**:
```
save-queue.ts:
  - Queue of pending saves
  - Each save has: id, timestamp, payload, status (pending/saving/saved/failed)
  - On failure: retry with backoff (1s, 2s, 4s, 8s, max 30s)
  - On conflict (409): fetch latest, show diff dialog
  - localStorage draft: write on every store change (debounced 500ms)
  - On mount: check localStorage for unsaved draft, offer to restore
```

### 2. UNDO/REDO THAT NEVER LOSES DATA

**Problem**: Current zundo tracks state snapshots. Large pages = large memory.
**Solution**:
- Command-based undo: store operations, not snapshots
- Each command: { type, payload, inverse }
- Undo = apply inverse. Redo = apply payload.
- Serialize commands to localStorage for crash recovery
- Group rapid changes (typing) into single undo step (debounce 300ms)

**Implementation**:
```
command-history.ts:
  type Command = {
    id: string
    type: 'updateProps' | 'addSection' | 'removeSection' | 'moveSection' | 'updateTheme'
    payload: unknown
    inverse: unknown
    timestamp: number
    groupId?: string  // for grouping rapid edits
  }
  - Max 100 commands in memory
  - Persist last 20 to localStorage
  - On crash recovery: replay commands from localStorage
```

### 3. PERFORMANCE AT SCALE (50+ sections)

**Problem**: Re-rendering 50 sections on every state change is slow.
**Solution**:
- Virtualized section list (only render visible sections)
- Memoize each section with React.memo + shallow prop comparison
- Debounce store subscriptions for non-critical UI (sidebar count, breadcrumb)
- Lazy-load block components (dynamic import per block type)
- Web Worker for JSON serialization (save payload prep)

**Implementation**:
```
canvas.tsx:
  - Use @tanstack/react-virtual for section list
  - Each SortableSection wrapped in React.memo
  - Compare only: id, type, props hash (not deep equality)
  - Intersection Observer: only render block content when in viewport

sidebar.tsx:
  - Section list uses virtual scroll for 50+ items
  - Search is debounced 200ms
```

### 4. ASSET MANAGEMENT

**Problem**: Images are just URL strings. No upload management, no optimization.
**Solution**:
- Asset library panel (new tab in sidebar)
- Upload to Supabase Storage (or S3)
- Auto-generate thumbnails + WebP variants
- Image optimization: resize on upload (max 2000px), compress
- Drag image from library onto canvas
- Recently used images section

**Implementation**:
```
assets-panel.tsx:
  - Grid of uploaded images with thumbnails
  - Upload button + drag-and-drop zone
  - Search/filter by name
  - Click to copy URL, or drag onto image field
  - Delete with confirmation

/api/upload route:
  - Accept image, validate type/size
  - Resize to max 2000px width
  - Upload original + thumbnail to Supabase Storage
  - Return { url, thumbnailUrl, width, height, size }
```

### 5. SEO THAT ACTUALLY WORKS

**Problem**: SEO panel exists but doesn't connect to actual page metadata.
**Solution**:
- SEO fields saved to page record in DB
- Generate <head> metadata on storefront render
- Open Graph image auto-generation (screenshot of hero)
- Structured data (JSON-LD) for products
- Sitemap auto-generation
- Google Search Console preview in editor

**Implementation**:
```
seo-panel.tsx (enhance existing):
  - Title (with character count, 60 char limit indicator)
  - Description (160 char limit indicator)
  - OG Image (upload or auto-generate from page)
  - URL slug editor with validation
  - Google preview: title in blue, URL in green, description in gray
  - Social preview: OG card mockup

storefront layout.tsx:
  - Read SEO fields from page record
  - Generate Next.js Metadata object
  - Add JSON-LD for product pages
```

### 6. CUSTOM CODE INJECTION

**Problem**: Users can't add custom HTML/CSS/JS.
**Solution**:
- Custom Code block type (HTML + CSS + JS)
- Code editor with syntax highlighting (Monaco or CodeMirror)
- Sandboxed execution (render in iframe)
- Global head/body code injection (in page settings)
- CSS-only mode for safe styling

**Implementation**:
```
blocks/custom-code.tsx:
  - Monaco editor for HTML
  - Render in sandboxed iframe
  - Preview updates on blur (not on every keystroke)

page-settings (in Pages panel):
  - Head code injection (analytics, fonts, meta tags)
  - Body start code (chat widgets, etc.)
  - Body end code (tracking pixels)
  - Saved per-page in DB
```

### 7. MULTI-LANGUAGE (i18n)

**Problem**: Single language only.
**Solution**:
- Language switcher in editor toolbar
- Each text field stores: { en: "Hello", es: "Hola", ... }
- Default language from store settings
- Language picker in storefront (URL prefix: /en/store, /es/store)
- Auto-translate button (optional, via API)

**Implementation**:
```
store.ts:
  - Add `locale: string` to state
  - Add `locales: string[]` to theme (available languages)

settings-panel.tsx:
  - Text fields show language tabs when multiple locales enabled
  - Each tab edits the locale-specific value

storefront:
  - Read locale from URL prefix
  - Pass to RenderSections
  - Blocks read localized value: props[fieldName][locale] ?? props[fieldName].en ?? props[fieldName]
```

### 8. COLLABORATION (real-time)

**Problem**: Only one person can edit at a time.
**Solution**:
- Supabase Realtime for presence (who's editing)
- Show cursors/avatars of other editors
- Lock section being edited by another user
- Broadcast changes via Realtime channel
- Last-write-wins with conflict toast

**Implementation**:
```
collaboration.ts:
  - Subscribe to Supabase Realtime channel: `editor:${pageId}`
  - Broadcast: { userId, selectedSectionId, cursor position }
  - Show avatar bubbles on sections being edited by others
  - On remote change: merge into local state, show toast
  - Section lock: if another user is editing, show lock icon + name
```

### 9. A/B TESTING

**Problem**: No way to test different page versions.
**Solution**:
- Duplicate page as variant (A/B)
- Traffic split configuration (50/50, 70/30, etc.)
- Storefront middleware routes traffic to variant
- Analytics: conversion tracking per variant
- Winner selection: auto or manual

### 10. ACCESSIBILITY (WCAG AA)

**Problem**: Blocks don't enforce accessibility.
**Solution**:
- Alt text required for images (warning indicator)
- Color contrast checker in theme panel
- Heading hierarchy validator (h1 → h2 → h3, no skips)
- Focus management for keyboard navigation
- ARIA labels on interactive elements
- Accessibility audit panel (like Lighthouse)

**Implementation**:
```
accessibility-panel.tsx:
  - Scan all sections for issues
  - List: missing alt text, low contrast, heading hierarchy violations
  - Click issue → select the section
  - Score: 0-100 based on issues found
```

## Build Order (dependency-aware)

Phase 1 — Data Integrity (week 1):
  1. localStorage draft persistence + recovery
  2. Save queue with retry
  3. Version snapshots on save
  4. Conflict detection

Phase 2 — Performance (week 1-2):
  5. React.memo on sections
  6. Virtual scroll for 50+ sections
  7. Lazy-load block components
  8. Debounced store subscriptions

Phase 3 — Content (week 2-3):
  9. Asset management panel + upload
  10. SEO panel enhancement + metadata generation
  11. Custom code block
  12. Accessibility audit panel

Phase 4 — Scale (week 3-4):
  13. Multi-language support
  14. A/B testing
  15. Collaboration (presence + section locking)
  16. Analytics integration

## Technical Constraints

- Next.js 16.1 with Turbopack
- Supabase for DB + Auth + Storage + Realtime
- Zustand 5 for state
- shadcn/ui for components
- Tailwind CSS 4
- No external rich text editor (keep inline contentEditable)
- No external drag-drop library beyond dnd-kit
- Target: <3s initial load, <100ms interaction response
- Mobile-responsive editor (works on iPad)
- All TypeScript, strict mode, no `any`

## What NOT to Build

- Visual drag-to-position (we're section-based, not freeform)
- Custom CSS per element (theme handles global styling)
- Plugin/extension system (premature)
- White-label/multi-tenant editor (single tenant)
- Desktop app (web only)
- AI content generation (separate concern)

## Success Criteria

1. Zero data loss — user never loses work, even on crash
2. Sub-second save — optimistic UI, background persistence
3. 50+ sections — no jank, smooth scroll and edit
4. WCAG AA — all blocks pass accessibility audit
5. SEO score 90+ — proper metadata, structured data, sitemap
6. Real-time preview — iframe shows exact production output
7. 15+ E2E tests passing — regression protection
8. <5,000 LOC — complexity budget (currently ~3,600)
