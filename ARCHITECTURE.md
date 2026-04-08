# Indigo — Architecture Breakdown

## System Overview

Indigo is a multi-tenant e-commerce platform with a visual website builder. Merchants sign up, get a storefront, and customize it with a drag-and-drop editor. The platform handles products, orders, customers, inventory, marketing, analytics, and payments.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INDIGO PLATFORM                                  │
│                                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌────────────────────┐ │
│  │ Landing   │  │ Auth         │  │ Dashboard │  │ Visual Editor      │ │
│  │ /         │  │ /login       │  │ /dashboard│  │ /storefront        │ │
│  │ /blog     │  │ /signup      │  │ /products │  │ (Craft.js)         │ │
│  │           │  │ /onboarding  │  │ /orders   │  │                    │ │
│  └──────────┘  └──────────────┘  │ /customers│  └────────────────────┘ │
│                                   │ /marketing│                          │
│  ┌──────────────────────────────┐ │ /analytics│  ┌────────────────────┐ │
│  │ Storefront (public)          │ │ /settings │  │ API Routes         │ │
│  │ /store/[slug]                │ └───────────┘  │ /api/*             │ │
│  │ /store/[slug]/products/[id]  │                │                    │ │
│  │ /store/[slug]/checkout       │                └────────────────────┘ │
│  └──────────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Infrastructure

```
src/infrastructure/
├── supabase/          ← Auth + Realtime + Storage client
├── db.ts              ← Drizzle ORM connection (Supabase Postgres)
├── db/                ← Raw DB utilities
├── aws/               ← S3, SES, CloudFront, Rekognition, Bedrock
├── services/          ← 28 domain services (product, order, payment, etc.)
├── repositories/      ← Data access layer
├── cache/             ← Redis/in-memory caching
├── tenant/            ← Multi-tenant isolation (RLS, tenant context)
├── auth/              ← Session management, JWT, role resolution
├── middleware/         ← Rate limiting, CORS, tenant resolution
├── feature-flags/     ← Feature flag strategies
├── inngest/           ← Background job queue (order processing, emails)
└── workflows/         ← Multi-step business workflows
```

```
src/db/schema/         ← 22 Drizzle schema files
├── tenants.ts         ← Tenant (store) table
├── products.ts        ← Products + variants
├── orders.ts          ← Orders + line items
├── customers.ts       ← Customer profiles
├── categories.ts      ← Product categories
├── collections.ts     ← Curated collections
├── inventory.ts       ← Stock tracking
├── media.ts           ← Image/file storage refs
├── pages.ts           ← CMS pages (editor JSON stored here)
├── themes.ts          ← Store theme config
├── discounts.ts       ← Discount rules
├── reviews.ts         ← Product reviews
├── notifications.ts   ← Notification queue
└── ...
```

**Key patterns:**
- Multi-tenant via Supabase RLS — every query scoped to `tenant_id`
- Drizzle ORM for type-safe queries
- Server Actions (`"use server"`) for all mutations — no REST for internal ops
- API routes only for external integrations (Stripe webhooks, public API, SSE)

---

## Layer 2: App Routes (Next.js 16 App Router)

```
src/app/
├── layout.tsx                    ← Root layout (theme, fonts, analytics)
├── page.tsx                      ← Landing page (marketing)
├── globals.css                   ← Tailwind + CSS custom properties
│
├── (auth)/                       ← Auth route group
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── auth/                         ← Auth callbacks + onboarding
│   ├── callback/route.ts         ← Supabase OAuth callback
│   ├── onboarding/page.tsx       ← Post-signup store setup
│   └── verify/page.tsx
│
├── (editor)/                     ← Editor route group (isolated layout)
│   ├── layout.tsx                ← Minimal shell (no dashboard nav)
│   └── storefront/page.tsx       ← Editor entry point → EditorShell
│
├── dashboard/                    ← Merchant admin
│   ├── layout.tsx                ← Sidebar + header + breadcrumbs
│   ├── page.tsx                  ← Dashboard home (stats widgets)
│   ├── products/                 ← CRUD + variants + AI descriptions
│   ├── orders/                   ← Order management + returns + abandoned
│   ├── customers/                ← CRM + groups + segments
│   ├── categories/               ← Category tree management
│   ├── collections/              ← Curated product collections
│   ├── inventory/                ← Stock levels + forecasting
│   ├── marketing/                ← Campaigns + discounts + automations
│   ├── analytics/                ← Revenue, traffic, conversion charts
│   ├── reviews/                  ← Review moderation
│   ├── media/                    ← Asset library
│   ├── pages/                    ← CMS page management
│   ├── finances/                 ← Revenue + payouts
│   ├── attributes/               ← Product attribute schemas
│   ├── gift-cards/               ← Gift card management
│   ├── settings/                 ← Store config, payments, shipping, tax, team
│   └── bulk-actions/             ← Bulk import/export
│
├── store/[slug]/                 ← Public storefront (SSR)
│   ├── page.tsx                  ← Homepage (renders editor JSON)
│   ├── layout.tsx                ← Store layout (header, footer, cart)
│   ├── products/[id]/page.tsx    ← Product detail page
│   ├── category/[id]/page.tsx    ← Category listing
│   ├── checkout/                 ← Multi-step checkout
│   ├── account/                  ← Customer account
│   ├── search/page.tsx           ← Product search
│   └── ...
│
├── api/                          ← API routes
│   ├── auth/                     ← Auth endpoints
│   ├── checkout/route.ts         ← Checkout session creation
│   ├── webhooks/stripe/route.ts  ← Stripe webhook handler
│   ├── upload/route.ts           ← File upload (S3)
│   ├── editor/save/route.ts      ← Editor autosave endpoint
│   ├── preview/route.ts          ← Draft preview
│   ├── ai-services/              ← AI endpoints (copy, translate, audio)
│   ├── ws/route.ts               ← WebSocket (realtime notifications)
│   └── ...
│
└── (marketing)/blog/             ← MDX blog
```

---

## Layer 3: Features (Domain Modules)

```
src/features/
├── editor/          ← Visual page builder (see Layer 4)
├── store/           ← Storefront rendering + theme provider
├── products/        ← Product domain logic
├── orders/          ← Order domain logic
├── customers/       ← Customer domain logic
├── cart/            ← Shopping cart (client-side state)
├── inventory/       ← Stock management
├── categories/      ← Category trees
├── collections/     ← Curated collections
├── discounts/       ← Discount engine
├── reviews/         ← Review system
├── search/          ← Product search (full-text)
├── recommendations/ ← Product recommendations
├── analytics/       ← Analytics aggregation
├── media/           ← Media library
├── notifications/   ← Notification system
├── marketing/       ← Campaign management
├── ai/              ← AI service integrations
├── stores/          ← Store management
└── dashboard/       ← Dashboard widgets
```

Each feature follows the pattern:
```
features/[name]/
├── actions.ts       ← Server Actions ("use server")
├── types.ts         ← TypeScript interfaces
├── components/      ← React components
└── hooks/           ← Client-side hooks
```

---

## Layer 4: Visual Editor (Deep Dive)

The editor is the most complex feature. It's a Craft.js-based drag-and-drop page builder.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ EditorShell                                                                  │
│                                                                              │
│ ┌─ Providers (nested) ──────────────────────────────────────────────────┐   │
│ │ EditorPermissions → PageManager → EditorTheme → EditorPanels → Zoom  │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌─ Craft.js <Editor> ──────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │  ┌─────────┐  ┌─ Canvas Area ──────────────────────┐  ┌───────────┐  │   │
│ │  │LeftPanel│  │                                      │  │RightPanel│  │   │
│ │  │         │  │  ┌─ DeviceFrame ──────────────────┐ │  │          │  │   │
│ │  │ • Add   │  │  │  transform: scale(zoom)         │ │  │ Settings │  │   │
│ │  │ • Layers│  │  │                                  │ │  │ Spacing  │  │   │
│ │  │ • Theme │  │  │  ┌─ [data-editor-frame] ──────┐│ │  │ Design   │  │   │
│ │  │ • Pages │  │  │  │                              ││ │  │ Animate  │  │   │
│ │  │ • SEO   │  │  │  │  <Frame json={craftJson}>   ││ │  │ Batch    │  │   │
│ │  │ • A11y  │  │  │  │    <RenderNode> × N         ││ │  │          │  │   │
│ │  │ • Assets│  │  │  │  </Frame>                    ││ │  └──────────┘  │   │
│ │  │ • Tmpl  │  │  │  └──────────────────────────────┘│ │               │   │
│ │  └─────────┘  │  └──────────────────────────────────┘ │               │   │
│ │               │                                        │               │   │
│ │               │  FloatingToolbar (absolute)             │               │   │
│ │               │  CanvasOverlay (SVG: guides, spacing)   │               │   │
│ │               │  ContentGridlines / ColumnGridOverlay    │               │   │
│ │               │  SpacingIndicator                        │               │   │
│ │               └────────────────────────────────────────┘               │   │
│ │                                                                        │   │
│ │  TopBar: viewport toggle, zoom, save/publish, undo/redo               │   │
│ │  KeyboardShortcuts: ⌘Z, ⌘S, ⌘C/V, Delete, arrows                    │   │
│ │  CommandPalette: ⌘K quick actions                                      │   │
│ │  ContextMenu: right-click actions                                      │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Editor Internal Structure

```
src/features/editor/
│
├── components/              ← Shell + chrome
│   ├── editor-shell.tsx     ← Main component (~280 lines), provider nesting
│   ├── top-bar.tsx          ← Viewport, zoom, save, publish, preview
│   ├── keyboard-shortcuts   ← Unified ⌘Z (Craft.js + command-store)
│   ├── command-palette.tsx  ← ⌘K quick actions
│   ├── context-menu.tsx     ← Right-click menu
│   ├── theme-font-loader    ← Google Fonts injection
│   ├── theme-style-injector ← Theme CSS vars injection
│   ├── editor-error-boundary← Error boundary around Frame
│   ├── save-conflict-dialog ← Concurrent edit resolution
│   ├── autosave-indicator   ← "Saving..." / "Saved" badge
│   ├── zoom-control.tsx     ← Zoom slider
│   └── preview-dropdown.tsx ← Preview in new tab
│
├── canvas/                  ← Visual canvas layer
│   ├── render-node.tsx      ← Wraps every block (selection, hover, spacing, effects)
│   ├── floating-toolbar.tsx ← Actions bar above selected node
│   ├── resize-handles.tsx   ← Drag-to-resize with snap guides
│   ├── canvas-overlay.tsx   ← SVG overlay (guides, spacing lines, drop zones)
│   ├── device-frame.tsx     ← Phone/tablet bezel chrome
│   ├── iframe-portal.tsx    ← createPortal into iframe (feature-flagged)
│   ├── spacing-indicator    ← Alt+hover distance measurement
│   ├── selection-breadcrumb ← Parent chain breadcrumb
│   ├── content-gridlines    ← Horizontal section guides
│   ├── column-grid-overlay  ← 12/8/4 column grid
│   ├── animation-wrapper    ← Entrance/hover animations
│   ├── scroll-effect-wrapper← Parallax/fade scroll effects
│   ├── section-wrapper.tsx  ← Shared section chrome
│   └── empty-canvas-state   ← "Add your first section"
│
├── panels/                  ← Side panels
│   ├── left-panel.tsx       ← Tab container (add, layers, theme, pages, etc.)
│   ├── right-panel.tsx      ← Settings + style controls
│   ├── add-section-panel    ← Block palette (drag to add)
│   ├── add-section-modal    ← Full-screen block picker
│   ├── section-tree.tsx     ← Layer tree with drag reorder
│   ├── settings-panel.tsx   ← Block-specific settings (renders block.craft.related)
│   ├── site-styles-panel    ← Global theme editor (fonts, colors, spacing)
│   ├── page-settings-panel  ← SEO + global sections + templates
│   ├── seo-panel.tsx        ← Meta title/description/OG image
│   ├── accessibility-panel  ← A11y checker (alt text, headings, contrast)
│   ├── templates-panel      ← Save/load page templates
│   ├── pages-panel.tsx      ← Multi-page management
│   ├── version-history      ← Version restore
│   ├── batch-editor.tsx     ← Multi-select bulk editing
│   ├── assets-panel.tsx     ← Image library + Unsplash
│   ├── global-sections-panel← Header/footer toggle
│   └── block-preview.tsx    ← Block thumbnail previews
│
├── blocks/                  ← 27 editor blocks
│   ├── container.tsx        ← Root droppable container
│   ├── columns.tsx          ← Multi-column layout
│   ├── hero.tsx             ← Hero section
│   ├── text.tsx             ← Rich text
│   ├── image.tsx            ← Image with alt text
│   ├── button.tsx           ← CTA button
│   ├── product-grid.tsx     ← Product listing
│   ├── featured-product.tsx ← Single product showcase
│   ├── gallery.tsx          ← Image gallery
│   ├── testimonials.tsx     ← Customer testimonials
│   ├── faq.tsx              ← Accordion FAQ
│   ├── newsletter.tsx       ← Email signup form
│   ├── video.tsx            ← YouTube/Vimeo embed
│   ├── slideshow.tsx        ← Image carousel
│   ├── header.tsx           ← Store header/nav
│   ├── footer.tsx           ← Store footer
│   ├── promo-banner.tsx     ← Dismissible promo bar
│   ├── countdown.tsx        ← Sale countdown timer
│   ├── trust-signals.tsx    ← Trust badges
│   ├── contact-info.tsx     ← Contact details + map
│   ├── collection-list.tsx  ← Collection grid
│   ├── divider.tsx          ← Visual separator
│   ├── image-with-text.tsx  ← Side-by-side layout
│   ├── rich-text.tsx        ← WYSIWYG content
│   ├── collage.tsx          ← Photo collage
│   ├── popup.tsx            ← Modal popup
│   └── stock-counter.tsx    ← Urgency counter
│
├── controls/                ← Reusable settings controls
│   ├── editor-fields.tsx    ← Text, select, toggle, slider fields
│   ├── color-picker.tsx     ← Color picker with swatches
│   ├── gradient-picker.tsx  ← Gradient editor
│   ├── spacing-control.tsx  ← Margin/padding visual editor
│   ├── padding-control.tsx  ← Padding-only control
│   ├── size-control.tsx     ← Width/height controls
│   ├── animation-control    ← Entrance/hover animation picker
│   ├── universal-style-controls ← Shadow, opacity, blur, radius, sticky
│   ├── layout-suggestions   ← AI layout recommendations
│   ├── image-picker-field   ← Image upload + library picker
│   ├── product-picker-field ← Product selector
│   └── inline-edit.tsx      ← Click-to-edit text
│
├── stores/                  ← State management
│   ├── save-store.ts        ← Zustand: autosave, beacon, retry, optimistic
│   ├── command-store.ts     ← Zustand: undo/redo for non-Craft mutations
│   ├── overlay-store.ts     ← useSyncExternalStore: guides, spacing, drop zones
│   └── editor-events.ts     ← Typed event bus (editorEmit/editorOn)
│
├── hooks/                   ← Composed hooks
│   ├── use-viewport-zoom    ← Viewport switching + auto-fit zoom
│   ├── use-editor-panels    ← Panel open/close state
│   ├── use-page-manager     ← Multi-page switching + serialization
│   ├── use-editor-theme     ← Live theme state
│   ├── use-editor-permissions ← Role-based feature gating
│   ├── use-pinch-zoom       ← Ctrl+scroll / pinch zoom
│   ├── use-grid-measure     ← Gridline measurement (zoom-aware)
│   ├── use-node-rects       ← All node positions via adapter
│   ├── use-canvas-deselect  ← Click-outside deselection
│   ├── use-responsive       ← Breakpoint-aware prop resolution
│   ├── use-style-clipboard  ← Copy/paste styles
│   └── use-node-safe        ← Edit mode context for blocks
│
├── lib/                     ← Pure utilities
│   ├── canvas-adapter.tsx   ← CanvasAdapter interface + Direct + IframePortal impls
│   ├── node-actions.ts      ← Move up/down, duplicate, delete, toggle hidden
│   ├── scroll-to-node.ts    ← Smooth scroll to node
│   ├── theme-to-vars.ts     ← Theme object → CSS custom properties
│   ├── default-page.ts      ← Default empty page JSON
│   ├── grid-tokens.ts       ← 12/8/4 column grid constants
│   ├── zoom-utils.ts        ← Zoom clamping + step calculation
│   ├── block-versioning.ts  ← Craft JSON migration
│   ├── sanitize-html.ts     ← XSS sanitization for user HTML
│   └── craft-ref.ts         ← Craft.js ref utilities
│
├── actions/                 ← Server Actions
│   ├── actions.ts           ← saveDraft, publish, saveTheme, saveTemplate, etc.
│   ├── block-lock-actions   ← Lock/unlock blocks
│   └── image-upload-action  ← Optimized image upload with srcset
│
├── resolver.ts              ← Craft.js component resolver (maps names → components)
├── editor-context.tsx       ← React context (tenantId, storeSlug, pageId, seo)
├── breakpoint-context.tsx   ← Current breakpoint context
└── editor-theme.css         ← Editor chrome CSS (dark/light, variables)
```

### Editor State Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                          │
│                                                                  │
│  ┌─ Craft.js Internal ──────────────────────────────────────┐  │
│  │  • Node tree (blocks, props, parent/child relationships)  │  │
│  │  • Selection, hover, drag events                          │  │
│  │  • History (undo/redo for node mutations)                 │  │
│  │  • Accessed via useEditor() / useNode()                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ save-store (Zustand) ────────────────────────────────────┐  │
│  │  dirty, saving, lastSaved, error                          │  │
│  │  init(), save(), markDirty(), saveBeacon(), destroy()     │  │
│  │  Autosave every 5s, exponential backoff on failure        │  │
│  │  Optimistic lastSaved (set on start, revert on fail)      │  │
│  │  Beacon save on beforeunload (tab close)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ command-store (Zustand) ─────────────────────────────────┐  │
│  │  Undo/redo for NON-Craft mutations (theme changes)        │  │
│  │  Serializable CommandData (not closures)                   │  │
│  │  Interpreter pattern: data → side effect                   │  │
│  │  Interleaved with Craft.js undo via unified ⌘Z            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ overlay-store (useSyncExternalStore) ────────────────────┐  │
│  │  guides[], spacing[], dropZones[]                         │  │
│  │  Updated by resize-handles, spacing-indicator, section-tree│  │
│  │  Read by canvas-overlay (SVG rendering)                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ editor-events (module singleton) ────────────────────────┐  │
│  │  Typed event bus: editorEmit() / editorOn()               │  │
│  │  Events: section:add, panel:toggle, theme:change          │  │
│  │  Replaces prop drilling for cross-component communication │  │
│  │  editorClearAll() cleanup on unmount                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ React Context Providers ─────────────────────────────────┐  │
│  │  ViewportZoomProvider   → viewport, zoom, auto-fit        │  │
│  │  EditorPanelsProvider   → leftTab, rightOpen, previewMode │  │
│  │  PageManagerProvider    → currentPage, craftJson, switch   │  │
│  │  EditorThemeProvider    → liveTheme, setLiveTheme         │  │
│  │  EditorPermissionsProvider → role-based feature gates     │  │
│  │  CanvasAdapterProvider  → Direct or IframePortal adapter  │  │
│  │  BreakpointProvider     → desktop/tablet/mobile           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Editor Save Flow

```
User edits block
       │
       ▼
Craft.js setProp()  ──or──  command-store.execute()
       │                            │
       ▼                            ▼
save-store.markDirty()      Theme state updated
       │
       ▼
Autosave timer (5s) ──or── ⌘S ──or── beforeunload beacon
       │
       ▼
save-store.save()
  ├── set lastSaved optimistically
  ├── serialize Craft.js JSON
  ├── serialize theme
  ├── saveDraftAction() ← Server Action
  │     ├── Conflict check (updatedAt comparison)
  │     ├── Write to Supabase pages table
  │     └── Return { success, updatedAt } or { error: "conflict" }
  ├── saveThemeAction() ← Server Action (parallel)
  │
  ├── Success: clear dirty, update _lastKnownUpdatedAt
  └── Failure: revert lastSaved, set dirty, exponential backoff
```

### Canvas Adapter Pattern

```
                    CanvasAdapter (interface)
                    ┌──────────────────────┐
                    │ getNodeElement(id)    │
                    │ getCanvasElement()    │
                    │ getFrameElement()     │
                    │ getNodeRect(id)       │
                    │ getAllNodeRects()      │
                    │ getCanvasRect()       │
                    │ getCanvasScroll()     │
                    │ getZoom()             │
                    │ scrollToNode(id)      │
                    │ scrollToLastChild(id) │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
          DirectCanvasAdapter    IframePortalAdapter
          (default mode)         (NEXT_PUBLIC_EDITOR_IFRAME=true)
                    │                      │
          queries parent          queries iframe
          document directly       contentDocument
                    │                      │
          nodes in same DOM       nodes in iframe DOM
                                  coords translated via
                                  iframe.getBoundingClientRect()
```

---

## Layer 5: Shared / Components

```
src/shared/
├── utils.ts           ← cn(), formatCurrency, etc.
├── constants.ts       ← App-wide constants
├── errors.ts          ← Error types + error handling
├── dto.ts             ← Data transfer objects
├── types/             ← Shared TypeScript types
├── currency/          ← Currency formatting
├── i18n/              ← Internationalization
├── seo/               ← SEO utilities
├── offline/           ← Offline support
├── colors/            ← Color utilities
├── validations/       ← Zod schemas
└── components/        ← Shared UI primitives

src/components/
├── ui/                ← 81 shadcn/ui components (Button, Dialog, etc.)
├── commerce-ui/       ← E-commerce specific components
├── dashboard/         ← Dashboard widgets + layouts
├── store/             ← Storefront components (cart, product card, etc.)
└── landing/           ← Marketing page components
```

---

## Layer 6: Data Flow

```
┌─────────┐     Server Action      ┌──────────────┐     Drizzle ORM     ┌──────────┐
│ Browser  │ ──────────────────────▶│ Next.js      │ ──────────────────▶│ Supabase │
│ (React)  │◀────────────────────── │ Server       │◀────────────────── │ Postgres │
└─────────┘     Return value        └──────┬───────┘                    └──────────┘
                                           │
                                    ┌──────┴───────┐
                                    │ infrastructure│
                                    │ /services/    │
                                    ├──────────────┤
                                    │ AWS S3       │ ← Images, files
                                    │ AWS SES      │ ← Transactional email
                                    │ Stripe       │ ← Payments
                                    │ Inngest      │ ← Background jobs
                                    │ Redis        │ ← Cache
                                    └──────────────┘
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.0 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS, shadcn/ui |
| Editor | Craft.js 0.2.12 |
| State | Zustand 5 (stores), React Context (providers), useSyncExternalStore |
| Database | Supabase (Postgres + Auth + Realtime + Storage) |
| ORM | Drizzle |
| Payments | Stripe Connect |
| Cloud | AWS (S3, SES, CloudFront, Rekognition, Bedrock) |
| Jobs | Inngest |
| Cache | Redis |
| Styling | Tailwind CSS + CSS custom properties |
| Testing | Playwright (e2e) |
