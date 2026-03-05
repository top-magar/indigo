# Editor Competitive Analysis — Indigo vs Industry

## Methodology
Researched 7 production visual editors: Webflow, Framer, Shopify OS 2.0, Squarespace Fluid Engine, Builder.io, Wix, and Puck (open-source). Compared architecture patterns, feature sets, and UX paradigms against Indigo's current editor.

---

## 1. Architecture Patterns

### How the best editors render content

| Editor | Rendering Approach | Why |
|--------|-------------------|-----|
| **Webflow** | Direct DOM manipulation on canvas (no iframe for editing) | Real-time WYSIWYG, generates clean HTML/CSS/JS |
| **Framer** | React DOM canvas — components render directly, plugins run in sandboxed iframes | Every Framer site is a React app; code components render on canvas + preview + published site |
| **Squarespace** | CSS Grid engine ("Fluid Engine") — 24-col desktop, 8-col mobile grid | Replaced nested row/column model after 6 months of user research |
| **Builder.io** | Iframe-based — loads your actual site in iframe, overlays editing controls | Works with ANY framework (React, Vue, Angular, etc.) |
| **Shopify OS 2.0** | Iframe preview of live theme + sidebar settings panel | JSON templates, sections/blocks schema, Liquid rendering |
| **Wix** | Proprietary canvas engine, absolute positioning with responsive AI | Pixel-perfect freedom, AI handles responsive adaptation |
| **Puck** | React components rendered directly in editor DOM, DropZone system | Open-source, CSS Grid + Flexbox support since v0.18 |

### Indigo's current approach
- **Inline preview**: Direct DOM rendering in editor (like Webflow/Framer)
- **Live preview**: Iframe fallback mode (like Builder.io/Shopify)
- **Focus preview**: Single-block zoom mode

**Assessment**: Indigo's dual-mode approach (inline + iframe) is actually solid architecture. The inline preview gives fast editing, the iframe gives true isolation. Most editors pick ONE approach — having both is a strength.

---

## 2. Feature Comparison Matrix

### ✅ = Has it | ⚠️ = Partial | ❌ = Missing

| Feature | Webflow | Framer | Shopify | Squarespace | Builder.io | Puck | **Indigo** |
|---------|---------|--------|---------|-------------|------------|------|------------|
| **LAYOUT** | | | | | | | |
| Drag-and-drop blocks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Nested containers | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ (section/columns/column) |
| CSS Grid layout | ✅ | ✅ | ❌ | ✅ (24-col) | ❌ | ✅ | ❌ |
| Flexbox layout | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Free-form positioning | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Smart guides/snapping | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Resize handles | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **RESPONSIVE** | | | | | | | |
| Breakpoint system | ✅ (4+) | ✅ (custom) | ✅ (theme) | ✅ (2) | ✅ | ❌ | ✅ (3: mobile/tablet/desktop) |
| Per-breakpoint styling | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ (visibility only) |
| Responsive preview | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **CONTENT** | | | | | | | |
| Block variants/presets | ⚠️ | ✅ | ✅ (blocks) | ❌ | ✅ | ❌ | ✅ (variants + presets) |
| Inline text editing | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ✅ |
| Rich text editor | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Image management | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Video blocks | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| CMS/dynamic content | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **DESIGN** | | | | | | | |
| Global styles/tokens | ✅ | ✅ | ✅ (theme) | ✅ | ✅ | ❌ | ✅ |
| Animation/interactions | ✅ (GSAP) | ✅ (scroll) | ❌ | ⚠️ | ⚠️ | ❌ | ✅ (animation picker) |
| Custom CSS per block | ✅ | ⚠️ | ✅ | ❌ | ✅ | ❌ | ✅ (custom class) |
| Color picker | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Typography controls | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Spacing controls | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **STRUCTURE** | | | | | | | |
| Layer tree/hierarchy | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Layer DnD reordering | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Layer visibility toggle | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Layer lock | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Layer grouping | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Breadcrumb navigation | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **WORKFLOW** | | | | | | | |
| Undo/redo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| History panel | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Keyboard shortcuts | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Command palette | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Copy/paste blocks | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Copy/paste styles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Multi-select | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Autosave | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **SEO** | | | | | | | |
| SEO panel | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| OG/social meta | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **E-COMMERCE** | | | | | | | |
| Product blocks | ⚠️ | ❌ | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| Product grid | ⚠️ | ❌ | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| Collection binding | ❌ | ✅ (CMS) | ✅ | ✅ | ✅ | ❌ | ✅ |
| Countdown timer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **AI** | | | | | | | |
| AI page generation | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ (beta) | ❌ (removed) |
| AI content writing | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ (removed) |
| AI image generation | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ (removed) |

---

## 3. What Indigo Does BETTER Than Most

1. **Layer system** — Indigo has the most complete layer panel of any editor in this comparison. History panel, filter menu, context actions, DnD reordering, visibility/lock/group — even Webflow doesn't have all of these together.

2. **Block variants** — 15 atomic block types × multiple variants each (e.g., Hero has 5 variants). Plus a preset system. Shopify has sections/blocks but no variant switching. Squarespace has no variants at all.

3. **E-commerce native** — Product blocks, product grids, collection binding, countdown timers, featured products, promo banners, trust signals, newsletter — purpose-built for e-commerce. Webflow/Framer are general-purpose.

4. **Command palette + keyboard shortcuts** — Power-user features that Shopify, Squarespace, Builder.io, and Puck all lack.

5. **Copy/paste styles** — Only Webflow and Framer have this. Indigo has it.

6. **History panel** — NONE of the competitors have a visual history panel. Indigo does.

---

## 4. What Indigo is MISSING (Gap Analysis)

### 🔴 Critical Gaps (high impact, users expect these)

#### 4a. Per-breakpoint styling (not just visibility)
- **Current**: Can only toggle block visibility per viewport
- **Competitors**: Webflow/Framer let you change ANY style property per breakpoint (font size, padding, layout direction, etc.)
- **Impact**: Without this, responsive design is limited to what the block variants handle internally
- **Effort**: HIGH — requires extending the block data model to store per-viewport style overrides

#### 4b. CMS / Dynamic content binding
- **Current**: Blocks have static content only
- **Competitors**: Webflow CMS, Framer CMS, Shopify metafields, Builder.io API — all let you bind block fields to dynamic data sources
- **Impact**: Users can't create product pages that auto-populate, blog templates, collection pages
- **Effort**: HIGH — needs data source abstraction, binding UI, template rendering

#### 4c. Breadcrumb navigation
- **Current**: No breadcrumb bar showing element hierarchy
- **Competitors**: Webflow, Framer, Builder.io, Puck all have this
- **Impact**: When clicking nested elements, users can't easily navigate up the tree
- **Effort**: LOW — just render the path from root to selected block

#### 4d. AI features (removed during audit)
- **Current**: AI components were deleted as dead code (594→73 lines in hooks)
- **Competitors**: Framer, Squarespace, Builder.io v3 all have AI page generation, content writing, image generation
- **Impact**: AI is becoming table-stakes for visual editors in 2025-2026
- **Effort**: MEDIUM — the hook infrastructure exists, need to rebuild with working integrations

### 🟡 Important Gaps (differentiation opportunities)

#### 4e. CSS Grid / Flexbox layout control
- **Current**: Fixed section → columns → column nesting model
- **Competitors**: Squarespace uses 24-col CSS Grid, Puck 0.18 supports CSS Grid + Flexbox, Webflow has full CSS Grid
- **Impact**: Users can't create arbitrary grid layouts, overlapping elements, or complex responsive flows
- **Effort**: VERY HIGH — fundamental layout engine change (Squarespace spent 6+ months on this)

#### 4f. Interactions / scroll animations
- **Current**: Basic animation picker (entrance animations)
- **Competitors**: Webflow has GSAP-powered timeline animations, Framer has scroll-driven animations, parallax, etc.
- **Impact**: Modern sites expect scroll animations, hover effects, page transitions
- **Effort**: HIGH — needs interaction timeline builder, scroll trigger system

#### 4g. Figma import / design-to-code
- **Current**: None
- **Competitors**: Builder.io v3 has Figma copy-paste, Framer has Figma plugin
- **Impact**: Designers can't bring existing designs into Indigo
- **Effort**: VERY HIGH — needs Figma API integration, layout conversion

#### 4h. Real-time collaboration
- **Current**: Single-user editing
- **Competitors**: Webflow, Framer have real-time multi-user editing
- **Impact**: Teams can't work together on the same page
- **Effort**: VERY HIGH — needs CRDT/OT, presence system, conflict resolution

### 🟢 Nice-to-haves (low priority)

#### 4i. Plugin/extension system
- **Current**: None
- **Competitors**: Framer plugins (iframe sandboxed), Puck plugins, Shopify app blocks
- **Effort**: MEDIUM

#### 4j. Version history / branching
- **Current**: Undo/redo only (in-memory)
- **Competitors**: Webflow has site backups, Framer has version history
- **Effort**: MEDIUM — needs server-side snapshot storage

---

## 5. Architecture Lessons from Competitors

### Squarespace's key insight (from their engineering blog)
> "Moving, resizing, and aligning a single block should not affect other blocks."

They spent 6 months researching before building Fluid Engine. Key decisions:
- **CSS Grid over absolute positioning** — absolute positioning breaks responsive text wrapping
- **24-column grid** — analyzed hundreds of websites to pick column count
- **Row stretch with guardrails** — `minmax(var(--row-height), auto)` lets rows grow for text, but they normalize rows before showing the grid during drag
- **No JavaScript on published sites** — pure CSS positioning for performance

### Puck's key insight (v0.18)
- **DropZone + CSS Grid/Flexbox** — style the DropZone wrapper as grid/flexbox, and drag-and-drop automatically respects the layout flow
- **`inline` mode** — removes wrapper div so children are direct grid/flex children
- **Cross-DropZone dragging** — components can move between any DropZone at any nesting level

### Framer's key insight
- **Three render modes**: Canvas (static preview while designing), Preview (interactive), Published (optimized React app)
- **Code components** render in ALL three modes — same React component everywhere
- **Plugins run in sandboxed iframes** — isolation without affecting editor performance

### Builder.io's key insight (v3)
- **Iframe-based editing of YOUR actual site** — the editor overlays controls on your real running application
- **Framework-agnostic** — works with React, Vue, Angular, etc. because it's just an iframe
- **AI-first redesign** — prompt → generate → refine loop built into the core workflow

---

## 6. Recommendation: Incremental Improvement, Not Rewrite

### Evidence-based reasoning

1. **Indigo already has 80%+ of features** that matter for an e-commerce storefront editor. The layer system, block variants, presets, keyboard shortcuts, command palette, and copy/paste styles put it ahead of Shopify and Squarespace in power-user features.

2. **The critical gaps are additive, not architectural**:
   - Breadcrumb navigation: ~50 lines, no architecture change
   - Per-breakpoint styling: extends existing block data model
   - CMS binding: new data layer, doesn't require editor rewrite
   - AI features: rebuild on existing hook infrastructure

3. **A rewrite would lose**:
   - 1,226-line store with battle-tested undo/redo, mutateBlocks helpers
   - 1,080-line DnD system that works
   - 15 block types × multiple variants each
   - Layer system (5 components, ~2,500 lines)
   - All the accessibility, design system, and type safety work we just did

4. **The only gap that MIGHT justify architectural change** is CSS Grid layout (4e), and even Squarespace took 6+ months with a dedicated team. This could be built incrementally by adding a grid layout mode to the existing section container.

### Recommended priority order

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Breadcrumb navigation | LOW (1-2 days) | HIGH — instant UX improvement |
| 2 | Per-breakpoint styling | MEDIUM (1-2 weeks) | HIGH — unlocks responsive design |
| 3 | AI page generation (rebuild) | MEDIUM (1-2 weeks) | HIGH — table-stakes feature |
| 4 | CMS / dynamic content | HIGH (2-4 weeks) | HIGH — unlocks templates |
| 5 | Scroll animations | HIGH (2-3 weeks) | MEDIUM — modern site expectations |
| 6 | CSS Grid layout mode | VERY HIGH (4-8 weeks) | MEDIUM — power users |
| 7 | Figma import | VERY HIGH (4+ weeks) | LOW — designer workflow |
| 8 | Real-time collaboration | VERY HIGH (6+ weeks) | LOW — team feature |

---

## 7. Conclusion

Indigo's editor is not broken — it's incomplete. The architecture is sound (dual-mode rendering, Zustand store with history, config-driven field system, typed block model). What it needs is feature additions, not a rewrite.

The competitors that are "better" (Webflow, Framer) have 100+ engineer teams and years of iteration. Indigo's strength is being purpose-built for e-commerce storefronts with a focused block set. The path forward is filling the critical gaps (breadcrumb, per-breakpoint styling, AI, CMS) while keeping the solid foundation intact.

---

## 8. Visual Review Findings (Self-Audit via Playwright)

Built `scripts/editor-visual-review.ts` — a Playwright-based tool that takes screenshots
of the running editor so the AI can visually inspect the UI.

### Issues Found & Fixed

| # | Issue | Status |
|---|-------|--------|
| 1 | Preview content clipped at 100% zoom — "Welcome to Our S..." cut off | ✅ FIXED — zoom default changed to `undefined` (auto-fit) |
| 2 | Zoom label showed "100%" when auto-fitting | ✅ FIXED — shows "Fit" when auto-scaling |
| 3 | "Editing mobile overrides" banner | ✅ VERIFIED WORKING |
| 4 | Breadcrumb hidden for top-level blocks | ✅ CORRECT BEHAVIOR |

### Issues Found & Documented (Not Fixed Yet)

| # | Issue | Severity | Root Cause |
|---|-------|----------|------------|
| 5 | Mobile preview shows desktop layout (nav links visible at 375px) | HIGH | CSS media queries respond to real browser width (1440px), not simulated viewport. Inline preview limitation. |
| 6 | Variant selector "Announcement Bar" text wraps in grid cell | LOW | Grid cell height doesn't accommodate 2-line text |
| 7 | Settings panel has no scroll indicator | LOW | ScrollArea doesn't show scrollbar hint |
| 8 | Command palette has limited actions | LOW | Only 5 actions, could add Paste/Duplicate/Delete/Add block |

### Critical Architecture Finding: Mobile Preview

The inline preview renders blocks directly in the DOM at a scaled-down width, but CSS
media queries (`md:`, `lg:`, etc.) respond to the REAL browser viewport (1440px), not
the simulated 375px mobile width. This means:

- Mobile preview shows desktop navigation layout
- Responsive Tailwind classes don't activate correctly
- The `hidden md:flex` on nav links fires at real browser width

**Solutions (future work):**
1. **Iframe-based mobile preview** — render mobile/tablet in an actual iframe at the
   correct width. This is what Shopify and Builder.io do.
2. **Container queries** — convert all block components from `md:` media queries to
   `@container` queries. The preview container would have `container-type: inline-size`.
3. **Hybrid** — use inline preview for desktop, switch to iframe for mobile/tablet.

Option 3 is most pragmatic — Indigo already has `LivePreview` (iframe mode).
