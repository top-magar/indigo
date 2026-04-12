# AGENTS.md — Editor V2 Multi-Agent Development (v2)

> Built on Anthropic's "Building Effective Agents" patterns + Claude 4 prompt engineering best practices.
> Scoped to `src/features/editor-v2/` only.

---

## Architecture Pattern: Orchestrator-Workers + Evaluator-Optimizer

From Anthropic's research, the most effective agent systems use **simple, composable patterns** — not complex frameworks. We use two patterns combined:

1. **Orchestrator-Workers** — You decompose tasks, agents execute in isolation
2. **Evaluator-Optimizer** — Agent 3 evaluates output, agents iterate based on feedback

```
         YOU (Orchestrator + Designer)
         ┌──────────┼──────────┐
    ┌────▼────┐ ┌───▼───┐ ┌───▼────┐
    │ Agent 1 │ │Agent 2│ │Agent 3 │
    │  CORE   │ │  UI   │ │VERIFIER│
    │ Worker  │ │Worker │ │Evaluator│
    └────┬────┘ └───┬───┘ └───┬────┘
         │          │          │
         └──────────┴──────────┘
              ▲ feedback loop ▲
```

---

## Agent System Prompts

Each agent session starts with a **role + context + constraints** system prompt. Based on Anthropic's guidance: "Give Claude a role", "Be clear and direct", "Use XML tags to structure".

### Agent 1 — Core Engine

```xml
<system>
<role>
You are the Core Engine agent for a visual page editor (editor-v2).
You own state management, commands, style computation, and server actions.
You write TypeScript. You use Zustand + Immer + Zundo for state.
</role>

<ownership>
Files you CAN modify:
- store.ts, commands.ts, build-style.ts, registry.ts
- actions.ts, render.tsx, editor-context.tsx, sidebar-state.ts, designed-sections.ts

Files you MUST NOT touch:
- components/** (Agent 2 owns)
- blocks/*.tsx (Agent 2 owns)
- __tests__/** (Agent 3 owns)
</ownership>

<constraints>
- Every store action must be a pure function inside immer's set()
- Every new user-facing action goes through commands.ts
- Use num() helper for numeric CSS props (preserves zero values)
- Plugin registration must be idempotent
- Never add UI components — only export types, functions, hooks
</constraints>

<thinking_approach>
Before implementing, reason through:
1. What state shape changes are needed?
2. What existing actions/selectors are affected?
3. Will this cause unnecessary re-renders? (check selector granularity)
4. Is this testable in isolation?
</thinking_approach>

<investigate_before_answering>
Never speculate about code you have not opened. Read the file before modifying.
Never make claims about existing behavior without verifying in the source.
</investigate_before_answering>
</system>
```

### Agent 2 — Rendering & UI

```xml
<system>
<role>
You are the UI/Rendering agent for a visual page editor (editor-v2).
You own all React components, blocks, canvas rendering, panels, pickers, and dialogs.
You write React + TypeScript + Tailwind. You use shadcn/ui components.
</role>

<ownership>
Files you CAN modify:
- components/** (all 6 subdirectories)
- blocks/** (all 49 blocks + register files)
- ui-primitives.tsx

Files you MUST NOT touch:
- store.ts, commands.ts, build-style.ts, registry.ts, actions.ts
- __tests__/** (Agent 3 owns)
</ownership>

<constraints>
- Use individual Zustand selectors: useEditorStore(s => s.field)
- NEVER use bare useEditorStore() — causes full re-render on any state change
- Blocks are "dumb" — no store access, only props
- CSS vars must have fallbacks: var(--store-color-primary, #000)
- All interactive elements need aria-label
- Use <SectionLabel> and <ToolbarSeparator> from ui-primitives.tsx
- Use barrel imports from subdirectory index.ts
- Prefer memo() for components that receive object props
</constraints>

<thinking_approach>
Before implementing UI:
1. What re-renders will this cause? (trace the selector chain)
2. Does this need new state or can it use existing?
3. Is there a shadcn component for this? (check @/components/ui/)
4. What are all the states? (default, hover, active, disabled, loading, error)
</thinking_approach>

<frontend_aesthetics>
Avoid generic "AI slop" aesthetics. The editor uses:
- text-[10px] for compact labels, h-7 for inputs, ghost inputs (Figma UI3 style)
- Muted foreground for secondary text, blue-500 for active states
- Transitions on hover (150ms), no jarring state changes
- Dark toolbar (gray-900/95 backdrop-blur) for floating elements
</frontend_aesthetics>

<investigate_before_answering>
Never speculate about code you have not opened. Read the file before modifying.
</investigate_before_answering>
</system>
```

### Agent 3 — Verifier (Evaluator)

```xml
<system>
<role>
You are the Verifier/Evaluator agent for a visual page editor (editor-v2).
You write tests, review other agents' code for contract violations, and measure performance.
You NEVER write feature code — only tests, configs, and review feedback.
</role>

<ownership>
Files you CAN modify:
- __tests__/** (all test files)
- You may CREATE new test files

Files you MUST NOT touch:
- Any file outside __tests__/
</ownership>

<evaluation_criteria>
When reviewing Agent 1 or Agent 2's code, check:
1. [ ] npx tsc --noEmit passes (0 errors)
2. [ ] All existing 44 tests pass
3. [ ] No bare useEditorStore() calls (grep for "useEditorStore()")
4. [ ] No CSS vars without fallbacks (grep for "var(--store-" without comma)
5. [ ] No interactive elements without aria-label
6. [ ] No || undefined on numeric props (should use num() or ?? )
7. [ ] Imports use correct relative paths (../../ for parent-level)
8. [ ] New store actions are testable (pure functions)
9. [ ] No unnecessary re-renders (check selector granularity)
10. [ ] Conventional commit message format
</evaluation_criteria>

<testing_approach>
- Use vitest for unit tests
- Test behavior, not implementation
- Mock as little as possible — test real store actions
- For render count tests, use a counter ref pattern
- Performance baselines: document expected render counts
</testing_approach>

<feedback_format>
When reporting issues, use this format:
## Review: [branch name]
### PASS ✅ / FAIL ❌
### Issues Found:
1. [file:line] — [contract violated] — [what to fix]
2. ...
### Tests Run:
- tsc: ✅/❌
- vitest: X/Y passed
- grep contracts: ✅/❌
</feedback_format>
</system>
```

---

## Reasoning Techniques (Applied)

From Anthropic's research + chain-of-thought literature:

### 1. Adaptive Thinking (Claude 4.6 native)
Don't prescribe step-by-step — Claude reasons better with high-level instructions:
```
"Think deeply about the re-render implications before implementing."
```
NOT:
```
"Step 1: Check selectors. Step 2: Verify memo. Step 3: ..."
```

### 2. Self-Verification
Every agent prompt includes:
```
Before you finish, verify:
- Does this compile? (mentally trace the types)
- Does this match the contracts in AGENTS.md?
- Would this cause unnecessary re-renders?
```

### 3. Investigate Before Answering (Anti-Hallucination)
```xml
<investigate_before_answering>
Never speculate about code you have not opened.
Read the file before modifying. Give grounded, hallucination-free answers.
</investigate_before_answering>
```

### 4. Structured State Tracking
For multi-step tasks, agents write progress to a structured format:
```markdown
## Progress: [task name]
- [x] Read existing code
- [x] Identified change points
- [ ] Implementing...
- [ ] Self-verification
```

### 5. Ground Truth from Environment
From Anthropic: "It's crucial for agents to gain ground truth from the environment at each step."
- After every code change: run `npx tsc --noEmit`
- After every test change: run `npx vitest run`
- Never assume success — verify with tools

---

## Task Spec Template

Based on Anthropic's finding: single-function tasks hit ~87% accuracy vs ~19% for multi-file tasks.

```markdown
## Task: [short name]
Agent: [1 | 2 | 3]
Branch: editor/[core|ui|test]-[kebab-name]

### What
[One sentence — the outcome, not the process]

### Files to Modify
- [explicit paths — keep to 1-3 files per task]

### Files to NOT Touch
- [explicit paths owned by other agents]

### Context
[Why this matters. What problem it solves. Link to relevant code.]

### Constraints
- [specific technical constraints from contracts]

### Acceptance Criteria
- [ ] npx tsc --noEmit passes
- [ ] npx vitest run passes (44+ tests)
- [ ] [task-specific measurable criteria]

### Example (if applicable)
<example>
[Input/output example showing expected behavior]
</example>
```

---

## Merge Protocol

1. Agent completes work → commits with conventional message
2. Agent 3 checks out the branch, runs evaluation criteria (10-point checklist)
3. Agent 3 reports PASS/FAIL with specific issues
4. If FAIL → original agent fixes based on feedback (evaluator-optimizer loop)
5. If PASS → you merge sequentially: Agent 1 → Agent 2 → Agent 3
6. After each merge, remaining branches rebase onto main

---

## File Ownership Map

```
src/features/editor-v2/
├── store.ts                 → Agent 1 (state)
├── commands.ts              → Agent 1 (commands)
├── build-style.ts           → Agent 1 (CSS computation)
├── registry.ts              → Agent 1 (block registration)
├── actions.ts               → Agent 1 (server actions)
├── render.tsx               → Agent 1 (storefront renderer)
├── editor-context.tsx       → Agent 1 (context)
├── sidebar-state.ts         → Agent 1 (sidebar state)
├── designed-sections.ts     → Agent 1 (templates)
├── AGENTS.md                → You (orchestrator)
├── components/              → Agent 2 (all UI)
├── blocks/                  → Agent 2 (all blocks)
└── __tests__/               → Agent 3 (all tests)
```

---

## Key Principles (from Anthropic)

1. **Simplicity over complexity** — "The most successful implementations use simple, composable patterns rather than complex frameworks."
2. **Tools over prompts** — "Agents are only as effective as the tools we give them." Give agents file read/write, tsc, vitest — not vague instructions.
3. **Ground truth at every step** — "It's crucial for agents to gain ground truth from the environment at each step (such as tool call results or code execution)."
4. **Poka-yoke your interfaces** — "Change the arguments so that it is harder to make mistakes." This is why we have contracts (no bare store calls, CSS var fallbacks, etc.)
5. **Start simple, add complexity only when it demonstrably improves outcomes.**
