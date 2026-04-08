# Platform Agent Orchestrator

Run all 6 platform specialist agents in parallel, merge findings, and produce a unified report.

## Usage
Tell Kiro: "run platform agents" or "platform review" or "full platform audit"

## Agents
1. **Data Engineer** — `agents/platform/data-engineer.md` — schema, queries, N+1, tenant isolation
2. **API Architect** — `agents/platform/api-architect.md` — routes, actions, validation, webhooks
3. **Storefront Engineer** — `agents/platform/storefront-engineer.md` — SSR, SEO, cart, checkout, editor→live
4. **Dashboard Engineer** — `agents/platform/dashboard-engineer.md` — CRUD, tables, forms, permissions
5. **Infrastructure Engineer** — `agents/platform/infra-engineer.md` — Supabase, AWS, Stripe, Inngest, cache
6. **Platform QA** — `agents/platform/platform-qa.md` — edge cases, race conditions, data integrity

## Dispatch pattern
Each agent runs independently with fresh context. After all complete, findings are merged, deduplicated by file:line, and confidence-boosted when multiple agents flag the same issue.

## Merge rules
- Same file:line flagged by 2+ agents → confidence +1 (cap 10), tagged "MULTI-AGENT CONFIRMED"
- Confidence ≥ 7 → show in main report
- Confidence 5-6 → show with caveat
- Confidence ≤ 4 → appendix only

## Report format
```
═══════════════════════════════════════════
INDIGO PLATFORM REVIEW — [branch] — [date]
═══════════════════════════════════════════

SUMMARY: N findings (X critical, Y informational) from 6 agents

CRITICAL (fix before merge):
  [agent] file:line — description (confidence N/10)

INFORMATIONAL (address when convenient):
  [agent] file:line — description (confidence N/10)

MULTI-AGENT CONFIRMED:
  [agent1 + agent2] file:line — description (confidence N/10)

PER-AGENT STATUS:
  Data Engineer:          DONE — N findings
  API Architect:          DONE — N findings
  Storefront Engineer:    DONE — N findings
  Dashboard Engineer:     DONE — N findings
  Infrastructure Engineer:DONE — N findings
  Platform QA:            DONE — N findings

VERDICT: SHIP / FIX_FIRST / BLOCK
═══════════════════════════════════════════
```

## Verdict rules
- Any critical finding with confidence ≥ 8 → FIX_FIRST
- Any security/payment critical → BLOCK
- All findings informational or confidence < 7 → SHIP

## Combined with editor agents
For a full-stack review, run both orchestrators:
- `agents/ORCHESTRATOR.md` — editor (6 agents)
- `agents/platform/ORCHESTRATOR.md` — platform (6 agents)

Tell Kiro: "run all 12 agents" or "full stack review"
