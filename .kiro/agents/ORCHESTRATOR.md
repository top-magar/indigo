# Indigo Agent Orchestrator

Run all 6 specialist agents in parallel against the current branch, merge findings, and produce a unified report.

## Usage
Tell Kiro: "run /agents" or "run all agents" or "full review"

## Agents
1. **Editor Architect** — `agents/editor-architect.md` — state, stores, hooks, event bus
2. **Block Engineer** — `agents/block-engineer.md` — blocks, resolver, settings, versioning
3. **UI/UX Reviewer** — `agents/ui-ux-reviewer.md` — design quality, a11y, storefront parity
4. **Security Auditor** — `agents/security-auditor.md` — auth, RLS, XSS, tenant isolation
5. **Performance Engineer** — `agents/performance-engineer.md` — selectors, render cycles, bundle
6. **QA Engineer** — `agents/qa-engineer.md` — edge cases, error handling, data integrity

## Dispatch pattern
Each agent runs independently with fresh context (no bias from other agents' findings). After all complete, findings are merged, deduplicated by file:line, and confidence-boosted when multiple agents flag the same issue.

## Merge rules
- Same file:line flagged by 2+ agents → confidence +1 (cap 10), tagged "MULTI-AGENT CONFIRMED"
- Confidence ≥ 7 → show in main report
- Confidence 5-6 → show with caveat
- Confidence ≤ 4 → appendix only

## Report format
```
═══════════════════════════════════════════
INDIGO AGENT REVIEW — [branch] — [date]
═══════════════════════════════════════════

SUMMARY: N findings (X critical, Y informational) from 6 agents

CRITICAL (fix before merge):
  [agent] file:line — description (confidence N/10)

INFORMATIONAL (address when convenient):
  [agent] file:line — description (confidence N/10)

MULTI-AGENT CONFIRMED:
  [agent1 + agent2] file:line — description (confidence N/10)

PER-AGENT STATUS:
  Editor Architect:     DONE — N findings
  Block Engineer:       DONE — N findings
  UI/UX Reviewer:       DONE — N findings
  Security Auditor:     DONE — N findings
  Performance Engineer: DONE — N findings
  QA Engineer:          DONE — N findings

VERDICT: SHIP / FIX_FIRST / BLOCK
═══════════════════════════════════════════
```

## Verdict rules
- Any critical finding with confidence ≥ 8 → FIX_FIRST
- Any security critical → BLOCK (never ship security holes)
- All findings informational or confidence < 7 → SHIP
