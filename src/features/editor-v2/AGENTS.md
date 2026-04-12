# AGENTS.md — Editor V2 Multi-Agent Development

> Scoped to `src/features/editor-v2/` only. Does not cover storefront, dashboard, API, or infrastructure.

## Team Structure

```
                YOU (Orchestrator + Designer)
          Specs, priorities, design decisions, QA
                ┌───────┼───────┐
          ┌─────▼──┐ ┌──▼───┐ ┌▼────────┐
          │Agent 1 │ │Agent2│ │ Agent 3  │
          │ CORE   │ │RENDER│ │ VERIFIER │
          └────────┘ └──────┘ └──────────┘
```

### You — Orchestrator + Designer
- Write task specs (use template below)
- Make all visual/UX decisions (AI can't judge aesthetics)
- Design tokens, color palettes, font pairings, layout wireframes
- QA review: compare implemented UI against your intent
- Resolve merge conflicts between agent branches
- Decide priority order for sequential merges

### Agent 1 — Core Engine
**Owns:** `store.ts`, `commands.ts`, `build-style.ts`, `registry.ts`, `actions.ts`, `render.tsx`, `designed-sections.ts`, `sidebar-state.ts`, `editor-context.tsx`

**Does:**
- State management (Zustand actions, selectors, middleware)
- Command registry (new commands, shortcut parsing)
- Style computation (props → CSS mapping)
- Block registration system
- Server actions (save, publish, version history, CRUD)
- Plugin API architecture

**Does NOT:** Touch any component files, block UI files, or test files.

### Agent 2 — Rendering & UI
**Owns:** `components/` (all 6 subdirectories), `blocks/` (all 49 blocks + register files)

**Does:**
- Canvas rendering, DnD, zoom, pan, selection
- All panel UI (sidebar, settings, pickers, dialogs)
- Block components (new blocks, block fixes)
- Keyboard shortcuts handler (wiring to commands.ts)
- Visual polish (spacing, transitions, hover states)

**Does NOT:** Modify store.ts, commands.ts, build-style.ts, actions.ts, or registry.ts.

### Agent 3 — Verifier
**Owns:** `__tests__/`, E2E tests, visual regression tests

**Does:**
- Write and maintain unit tests for store + build-style
- Write and maintain E2E tests (Playwright)
- Run TypeScript checks on every agent's branch before merge
- Performance profiling (render counts, bundle size)
- Review PRs from Agent 1 and Agent 2 for contract violations

**Does NOT:** Write feature code. Only tests, configs, and review comments.

---

## Contracts (All Agents)

### Store Access
- Components use individual selectors: `useEditorStore(s => s.field)`
- **Never** bare `useEditorStore()` — causes full re-render on any state change
- Read-only access via `useEditorStore.getState()` in event handlers
- Only Agent 1 modifies `store.ts`

### Commands
- All user-facing actions go through `commands.ts`
- Only Agent 1 adds new commands
- Agent 2 wires commands to UI (keyboard-shortcuts, context menu, palette)

### Blocks
- Register via `registerBlock()` with matching `fields` and `defaultProps`
- Blocks are "dumb" — no store access, only props
- CSS vars must have fallbacks: `var(--store-color-primary, #000)`
- All interactive elements need `aria-label`

### Imports
- Use barrel exports from subdirectory `index.ts`
- Parent-level imports use `../../` from component subdirectories
- Shared UI uses `<SectionLabel>` and `<ToolbarSeparator>` from `ui-primitives.tsx`

### Style Props
- All style props prefixed with `_` (e.g. `_paddingTop`, `_backgroundColor`)
- Responsive overrides: `_tablet_paddingTop`, `_mobile_paddingTop`
- Use `num()` helper for numeric props (preserves zero values)

### Git
- One worktree per agent, one branch per task
- Branch naming: `editor/core-[task]`, `editor/ui-[task]`, `editor/test-[task]`
- Conventional commits: `feat(editor):`, `fix(editor):`, `refactor(editor):`
- Sequential merge: Agent 3 verifies → you merge → remaining branches rebase

---

## Task Spec Template

```markdown
## Task: [short name]
Agent: [1 | 2 | 3]
Branch: editor/[core|ui|test]-[kebab-name]

### What
[One sentence describing the outcome]

### Files to Modify
- [explicit file paths]

### Files to NOT Touch
- [explicit file paths owned by other agents]

### Constraints
- [specific technical constraints]

### Acceptance Criteria
- [ ] `npx tsc --noEmit` passes (0 errors)
- [ ] All 44 existing tests pass
- [ ] [task-specific criteria]
```

---

## Sprint 1 Tasks

### Agent 1 — Core
```
## Task: Plugin API
Agent: 1
Branch: editor/core-plugin-api

### What
Create registerPlugin() that accepts { commands, blocks, panels } and wires them into existing registries.

### Files to Modify
- src/features/editor-v2/registry.ts (add plugin block registration)
- src/features/editor-v2/commands.ts (add plugin command registration)
- src/features/editor-v2/store.ts (add pluginPanels state if needed)

### Files to NOT Touch
- components/**  (Agent 2 owns)
- __tests__/**   (Agent 3 owns)
- blocks/*.tsx   (Agent 2 owns)

### Constraints
- Plugin registration must be idempotent (safe to call twice)
- Plugin blocks use same registerBlock() path
- Plugin commands use same commands array
- No runtime dependencies — plugins are static config

### Acceptance Criteria
- [ ] npx tsc --noEmit passes
- [ ] registerPlugin({ commands: [...], blocks: [...] }) works
- [ ] Existing 49 blocks still load correctly
- [ ] Existing 22 commands still work
```

### Agent 2 — Rendering & UI
```
## Task: Inspect Overlay
Agent: 2
Branch: editor/ui-inspect-overlay

### What
VisBug-style hover overlay that shows computed styles (padding, margin, font, color) when holding Alt and hovering over a section.

### Files to Modify
- src/features/editor-v2/components/canvas/canvas.tsx (add overlay layer)
- src/features/editor-v2/components/canvas/inspect-overlay.tsx (new file)

### Files to NOT Touch
- store.ts, commands.ts, build-style.ts (Agent 1 owns)
- __tests__/** (Agent 3 owns)

### Constraints
- Only visible when Alt key is held
- Reads computed styles via getComputedStyle() on the DOM element
- Overlay is absolutely positioned, doesn't affect layout
- Uses existing buildSectionStyle output for comparison
- Must not cause re-renders (use refs, not state)

### Acceptance Criteria
- [ ] npx tsc --noEmit passes
- [ ] Alt+hover shows padding/margin/font/color overlay
- [ ] Overlay disappears when Alt is released
- [ ] No performance impact when not active
```

### Agent 3 — Verifier
```
## Task: Command Registry Tests + Performance Baseline
Agent: 3
Branch: editor/test-commands-perf

### What
Add tests for command registry and establish render count baseline.

### Files to Modify
- src/features/editor-v2/__tests__/commands.test.ts (new file)
- src/features/editor-v2/__tests__/perf-baseline.test.ts (new file)

### Files to NOT Touch
- Any file outside __tests__/

### Constraints
- Test matchKeyboardEvent() with real KeyboardEvent mocks
- Test runCommand() for each command group
- Performance test: measure render count of Canvas when updateProps is called
- Use vitest, no additional test dependencies

### Acceptance Criteria
- [ ] npx tsc --noEmit passes
- [ ] All existing 44 tests still pass
- [ ] 10+ new command tests pass
- [ ] Render count baseline documented in test output
```

---

## Merge Order

1. Agent 3 runs `npx tsc --noEmit` + `npx vitest run` on each agent's branch
2. Agent 3 reports pass/fail + any contract violations
3. You merge in order: Agent 1 → Agent 2 → Agent 3
4. After each merge, remaining branches rebase onto main
5. If merge conflict: you resolve (agents don't touch other agents' files)

---

## File Ownership Map

```
src/features/editor-v2/
├── store.ts                 → Agent 1
├── commands.ts              → Agent 1
├── build-style.ts           → Agent 1
├── registry.ts              → Agent 1
├── actions.ts               → Agent 1
├── render.tsx               → Agent 1
├── editor-context.tsx       → Agent 1
├── sidebar-state.ts         → Agent 1
├── designed-sections.ts     → Agent 1
├── components/
│   ├── ui-primitives.tsx    → Agent 2
│   ├── shell/               → Agent 2
│   ├── canvas/              → Agent 2
│   ├── sidebar/             → Agent 2
│   ├── settings/            → Agent 2
│   ├── pickers/             → Agent 2
│   └── dialogs/             → Agent 2
├── blocks/                  → Agent 2
│   ├── register-*.ts        → Agent 2
│   └── *.tsx                → Agent 2
└── __tests__/               → Agent 3
```
