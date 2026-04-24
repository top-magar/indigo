# Orchestration Protocol

How agents coordinate on Indigo. Adapted from alirezarezvani/claude-skills orchestration patterns.

## Agents

| Agent | Shortcut | Domain | Skills |
|-------|----------|--------|--------|
| product-orchestrator | ctrl+o | Planning, architecture, delegation | All steering files |
| frontend-engineer | ctrl+f | React, Zustand, editor, UI | /impeccable, /minimalist-ui |
| backend-engineer | ctrl+b | DB, server actions, auth, API | Security-first |
| product-designer | ctrl+d | UI/UX, visual polish, design system | 27 design skills |

## Patterns

### Solo Sprint (default agent)
For quick tasks that cross domains. The default `kiro-cli chat` agent handles everything.
```
Read code → Make change → Type-check → Commit
```

### Domain Deep-Dive (single agent)
Switch to a specialized agent for focused work.
```
ctrl+f → Frontend refactoring session
ctrl+b → Database migration + server actions
ctrl+d → Design audit with /critique + /polish
```

### Multi-Agent Pipeline (orchestrator)
For complex features that need multiple agents.
```
ctrl+o → Analyze request → Spawn subagents:
  - backend-engineer: schema + server actions
  - frontend-engineer: UI components
  - product-designer: visual review with /critique
```

### Skill Chain (sequential skills)
For design work, chain skills without switching agents.
```
/shape → Design brief
/impeccable craft → Build the UI
/critique → Evaluate
/polish → Final pass
```

## Phase Handoff

When switching between agents or phases, pass context:
```
Phase complete.
Decisions: [what was decided]
Files changed: [list]
Open items: [what's next]
```

## Commit Rules

Every agent MUST commit after completing work:
- `stop` hook runs auto-commit script
- Conventional commits: feat/fix/chore/refactor/docs
- Never leave uncommitted changes
- `npx tsc --noEmit` must pass before commit

## When to Use Which

| Task | Agent |
|------|-------|
| "Fix this bug" | Default (solo sprint) |
| "Refactor the editor stores" | ctrl+f (domain deep-dive) |
| "Add a new DB table + API + UI" | ctrl+o (multi-agent pipeline) |
| "Review this page's design" | ctrl+d with /critique |
| "Plan a new feature" | ctrl+d with /shape |
| "Quick CSS fix" | Default (solo sprint) |
