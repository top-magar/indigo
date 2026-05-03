# Skills Execution Plan

## AUTO-EXECUTE INSTRUCTION
When this file exists and has PENDING phases, automatically continue execution from the next incomplete item. Read this file first, then start working. No user prompt needed.

## Status
- Phase 1: ✅ COMPLETE — Audit report at docs/AUDIT-REPORT.md (score 72/100)
- Phase 2: 🔄 60% DONE — Resume from checklist below
- Phase 3-8: ⏳ PENDING

## Phase 2 Remaining Checklist
- [ ] Add try/catch to 4 action files:
  - src/app/dashboard/gift-cards/actions.ts (3 functions)
  - src/app/dashboard/orders/abandoned/actions.ts (3 functions)
  - src/app/dashboard/pages/actions.ts (3 functions)
  - src/app/dashboard/settings/billing/actions.ts (1 function)
- [ ] Replace 9 raw `<img>` with next/image:
  - src/features/editor/core/registry/renderers.tsx (2)
  - src/features/editor/panels/right/content-editors/image-content.tsx (1)
  - src/features/editor/panels/right/menus/fill-menu.tsx (1)
  - src/features/editor/toolbar/navigation.tsx (1)
  - src/features/store/section-renderer.tsx (4)
- [ ] Remove console.log from src/components/dashboard/command-palette/command-palette-provider.tsx:267
- [ ] Then commit "Phase 2 complete" and start Phase 3

## Phase 2 Already Done
- ✅ CRITICAL: Sanitized ILIKE input in editor queries (SQL injection fix)
- ✅ Added try/catch to createCustomerGroup action
- ✅ Removed 3 orphaned @types packages
- ✅ Added aria-label to icon-only buttons across dashboard
- ✅ Removed console.log from form-submit API route

## Phase 3: Test & CI/CD (next)
- Generate E2E tests for: auth, orders, customers, collections, settings
- Set up GitHub Actions CI pipeline
- Add Dockerfile for development
- Set up test coverage reporting

## Phase 4: Design & Polish
- Run /critique on every dashboard page
- Run /polish for alignment/spacing fixes
- Run /adapt for responsive audit
- Run /clarify for UX copy improvements

## Phase 5: Content & Marketing
- Landing page copy
- SEO audit + structured data
- Email templates for order notifications

## Phase 6: Product & Strategy
- Product roadmap with RICE prioritization
- OKRs for next quarter
- Pricing strategy for Nepal market

## Phase 7: Business & Finance
- SaaS metrics dashboard
- Revenue projections
- Churn prevention strategy

## Phase 8: Global Skills
- Favicon generation
- Color palette refinement
- Image processing pipeline

## Rules
- Auto-commit after each phase
- Auto-start next phase when current completes
- Type-check (npx tsc --noEmit) before every commit
- Continue until all 8 phases done
