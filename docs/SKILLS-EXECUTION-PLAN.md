# Skills Execution Plan

## AUTO-EXECUTE INSTRUCTION
When this file exists and has PENDING phases, automatically continue execution from the next incomplete phase. No user prompt needed — just start working.

## Status
- Phase 1: ✅ COMPLETE (audit report at docs/AUDIT-REPORT.md)
- Phase 2: IN PROGRESS (critical fixes done, remaining: a11y, error handling, img optimization)
- Phase 3-8: PENDING

## Current Task
Phase 2 remaining work:
- [ ] Fix 53 icon-only buttons missing aria-label (top files: shipping, team, domains, general settings)
- [ ] Add try/catch to remaining 4 action files (gift-cards, abandoned, pages, billing)
- [ ] Replace 9 raw <img> tags with next/image (section-renderer, editor renderers)
- [ ] Remove remaining console.log statements
- Then auto-start Phase 3

## Phases
1. ✅ Audit & Assess (12 skills) — Score: 72/100
2. 🔄 Fix & Harden (14 skills) — Critical security fix done
3. ⏳ Test & CI/CD (10 skills)
4. ⏳ Design & Polish (27 skills)
5. ⏳ Content & Marketing (18 skills)
6. ⏳ Product & Strategy (16 skills)
7. ⏳ Business & Finance (12 skills)
8. ⏳ Global Skills (22 skills)

## Rules
- Auto-commit after each phase
- Auto-start next phase when current completes
- Continue until all 8 phases done
- Type-check before every commit
