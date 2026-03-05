# Editor V2 — Architecture Prompt

This prompt uses techniques from Anthropic's prompt engineering courses:
- **Ch 3**: Role assignment (senior React architect)
- **Ch 4**: XML tags to separate data, instructions, constraints
- **Ch 5**: Prefilled output format (structured markdown)
- **Ch 6**: Precognition — think step by step in `<analysis>` before answering
- **Ch 7**: Few-shot examples (Puck and Craft.js patterns)
- **Ch 8**: Grounding — extract evidence from the codebase first
- **Ch 9**: Complex real-world prompt with industry context

---

## The Prompt

```
<role>
You are a senior React architect specializing in visual editor frameworks.
You have deep expertise in Puck, Craft.js, GrapesJS, and Zustand state management.
You favor minimal, declarative, config-driven architectures over imperative component sprawl.
Your design aesthetic is Linear/Stripe/Vercel Geist — compact, data-dense, zero clutter.
</role>

<task>
Redesign the Indigo visual storefront editor from its current 74-file, 28K-line
implementation into a clean, Puck-inspired architecture. Produce a complete
file-by-file migration plan with exact code for the new architecture.
</task>

<constraints>
- Stack: Next.js 16, React 19, Tailwind CSS v4, Zustand, Immer, Supabase, Stripe Connect
- Must preserve ALL existing functionality — this is a refactor, not a rewrite
- Zero TypeScript errors after migration (strict mode)
- Every component must have proper aria-labels and keyboard navigation
- Design system: rounded-lg (never xl/2xl), p-4 max spacing, text-muted-foreground (never opacity variants)
- Write MINIMAL code — every line must earn its place
</constraints>

<current-architecture>
74 files, 28,202 lines across:

COMPONENTS (32 files):
- editor-header.tsx — top toolbar (undo/redo, viewport, zoom, save)
- settings-panel.tsx — right panel, renders fields for selected block
- layers-panel.tsx — left panel, block tree with DnD
- layer-item.tsx — single tree node
- layers-dnd-system.tsx (1,080 lines) — custom drag-drop for tree
- layers-context-actions.tsx — right-click menu for layers
- layers-filter-menu.tsx — filter/search layers
- layers-history.tsx — undo history list
- layers-layout-modes.tsx (636 lines) — tree vs flat view
- layers-panel-toolbar.tsx — toolbar above layers
- inline-preview.tsx (894 lines) — renders blocks in editor canvas
- live-preview.tsx — iframe preview fallback
- focus-preview.tsx — single-block zoom view
- block-palette.tsx — "add block" panel
- preset-palette.tsx — saved block presets
- command-palette.tsx — cmd+k search
- animation-picker.tsx, resize-handles.tsx, smart-guides.tsx
- editable-block-wrapper.tsx — click/hover overlay on blocks
- global-styles-panel.tsx, global-styles-injector.tsx
- seo-panel.tsx — SEO settings sheet
- save-button.tsx, save-preset-dialog.tsx, start-fresh-dialog.tsx
- keyboard-shortcuts-dialog.tsx, block-ghost-preview.tsx
- section-settings.tsx, block-presets-menu.tsx
- animated-drop-indicator.tsx
- inline-preview-error-boundary.tsx

FIELDS (25 files — THE BIGGEST PROBLEM):
- 8 "regular" fields: text, textarea, number, select, boolean, color, image, array
- 8 "minimal" fields: minimal-text, minimal-textarea, minimal-number, etc.
- auto-field.tsx (177 lines) — switch router for regular fields
- minimal-auto-field.tsx (204 lines) — DUPLICATE switch router for minimal fields
- Plus: object-field, richtext-field, url-field, icon-field, product-field,
  collection-field, products-field

The regular vs minimal difference is ONLY CSS classes:
  Regular: space-y-2, text-sm, shows description
  Minimal: space-y-1.5, text-xs, h-8 inputs, no description

HOOKS (9 files):
- use-autosave, use-block-clipboard, use-block-resize
- use-editor-preview, use-preview-mode (iframe-specific)
- use-global-styles-sync, use-keyboard-navigation
- use-layers-panel, use-responsive-panel

STORE (store.ts — 1,226 lines):
- Flat Zustand store with ~40 methods
- Uses mutateBlocks/mutateBlocksDeep helpers with Immer
- Module-level _set/_get via comma operator trick
- Manages: blocks[], selectedBlockIds[], history, clipboard, viewport, zoom, etc.

TYPES (types.ts + fields/types.ts + blocks.ts):
- 18 block types (15 atomic + 3 container)
- 15 field types with discriminated union FieldConfig
- BaseBlock → AtomicBlock | ContainerBlock union
- Block field definitions via FieldSchema = Record<string, FieldConfig>
</current-architecture>

<reference-architectures>
PUCK (12.3K stars, MIT):
- Single declarative config object defines everything:
  const config = {
    components: {
      HeadingBlock: {
        fields: { title: { type: "text" } },
        defaultProps: { title: "Heading" },
        render: ({ title }) => <h1>{title}</h1>
      }
    }
  }
- <Puck config={config} data={data} onPublish={save} />
- <Render config={config} data={data} /> for published pages
- DropZone component for nested/container blocks
- ONE field renderer, not two parallel systems
- Plugin system for extensibility
- JSON serialization built-in

CRAFT.JS (7.5K stars):
- useNode() hook — each component controls its own editing
- useEditor() hook — global editor state access
- <Editor> <Frame resolver={...}> <Canvas> — declarative tree
- connectors: { drag, connect } — DnD via refs
- query.serialize() / Frame json={} — serialization
- No separate "field" layer — components own their edit UI
</reference-architectures>

<analysis-instructions>
Before producing the migration plan, think step by step in <analysis> tags:

1. EVIDENCE GATHERING: List every pair of duplicate/overlapping components
2. CONSOLIDATION MAP: For each duplicate pair, decide: merge, delete, or keep
3. ARCHITECTURE DECISION: Choose between Puck-style (config-driven) vs Craft-style
   (component-driven) for Indigo's needs. Consider that Indigo already has a
   FieldConfig type system that maps naturally to Puck's approach.
4. FILE STRUCTURE: Design the new file tree (target: <30 files, <15K lines)
5. MIGRATION ORDER: Sequence changes so the app never breaks mid-migration
</analysis-instructions>

<output-format>
After your analysis, produce:

1. NEW FILE TREE — exact paths and estimated line counts
2. MIGRATION PHASES — ordered steps, each independently deployable
3. KEY CODE — the new unified field system, new config pattern, and store slices
   (actual TypeScript, not pseudocode)
4. DELETION LIST — files to remove and why
</output-format>
```

---

## How to Use This Prompt

1. Copy the prompt above (everything between the triple backticks)
2. Paste into Claude (Sonnet or Opus for best results)
3. Claude will first analyze in `<analysis>` tags, then produce the migration plan
4. Review the analysis before acting on the code output
5. Execute migration phase by phase, running `npx tsc --noEmit` after each

## Prompting Techniques Applied

| Technique | Anthropic Course Chapter | How It's Used |
|-----------|------------------------|---------------|
| Role prompting | Ch 3: Assigning Roles | `<role>` tag sets expertise context |
| XML separators | Ch 4: Separating Data | `<current-architecture>`, `<constraints>`, etc. |
| Output prefilling | Ch 5: Formatting Output | `<output-format>` specifies exact structure |
| Chain of thought | Ch 6: Precognition | `<analysis-instructions>` forces step-by-step reasoning |
| Few-shot examples | Ch 7: Using Examples | `<reference-architectures>` shows Puck/Craft patterns |
| Grounding | Ch 8: Avoiding Hallucinations | `<current-architecture>` provides exact file counts/line counts |
| Complex prompts | Ch 9: Industry Use Cases | Full real-world context with business constraints |
