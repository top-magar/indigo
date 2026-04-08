# Indigo — Orchestrated Agent Team

Every session on this project, run the relevant agent checklist BEFORE writing code.

---

## Agent Roster

### 🔴 PM Agent — "Does this move the needle?"
Before any feature work, ask:
- Is the transaction loop complete? (list → buy → pay → fulfill)
- Does this serve the Phase 1-4 roadmap?
- Is this build or buy? Check: Stripe, Resend, Meilisearch, EasyPost before building custom.

### 🟡 Design Agent — "Does this follow Mira?"
Before any UI work, verify:
- Button: default h-7, text-xs, px-2, svg-3.5. No `size="sm"` unless intentionally compact.
- Input/Select: default h-7, text-xs on md+, px-2.
- Spacing: space-y-3 page containers, gap-4 grids, p-3 md:p-4 main content.
- No hardcoded h-8/h-9/h-10/h-11 on controls.
- New components must use existing patterns: EntityListPage, DataTable, Card.

### 🟠 Architect Agent — "Does this follow the data layer rules?"
Before any backend work, verify:
- Reads: RSC with Supabase query (no API route needed).
- Writes: Server action → (future: DomainService →) Supabase.
- Every new table MUST have RLS policy with tenant_id.
- Long-running work → Inngest, not server actions.
- No service_role key in server actions.
- tenant_id as leading index column.

### 🔵 Security Agent — "Is this safe to ship?"
Before any PR/commit touching auth, payments, or user data:
- Input validated with Zod?
- RLS policy exists for any new/modified table?
- No secrets in code?
- Rate limiting on public endpoints?
- Audit log for destructive operations?

### 🟢 QA Agent — "Will this break something?"
After any change:
- `npx tsc --noEmit` passes?
- No new `any` types introduced?
- Error states handled (loading, empty, error)?
- Accessibility: aria-labels on icon buttons, keyboard navigation?

---

## Auto-Checks (run on every session start)

```bash
# Quick health check
npx tsc --noEmit 2>&1 | grep 'error TS' | head -5
grep -rc 'size="sm"' src/ --include='*.tsx' | grep -v ':0\|editor-v2\|components/ui/' | awk -F: '{s+=$2}END{print "size=sm remaining: " s}'
grep -rn 'service_role' src/ --include='*.ts' --include='*.tsx' | grep -v 'node_modules\|\.env\|types' | head -3
```

---

## Architecture Rules (enforced)

### File Organization
```
src/app/dashboard/[domain]/     → Page routes + server actions
src/features/[domain]/          → Domain components + hooks
src/components/dashboard/       → Shared dashboard components
src/components/ui/              → shadcn base (DO NOT manually edit sizes)
src/infrastructure/             → Services, repositories, auth, payments
src/db/schema/                  → Drizzle schema definitions
```

### Naming Conventions
- Pages: `[domain]-client.tsx` (client component), `page.tsx` (server component)
- Actions: `actions.ts` colocated with page route
- Components: PascalCase, one component per file
- Hooks: `use-[name].ts`

### Component Patterns
- List pages → DataTable + filter bar + bulk actions + SectionTabs
- Detail pages → Header + Card grid (info, settings, related)
- Form cards → Card + CardHeader + CardContent + form fields
- Dialogs → Dialog/Sheet with form inside

### Mira Scale Reference
```
| Size    | Button | Input | Select | Badge | Icon Btn |
|---------|--------|-------|--------|-------|----------|
| xs      | h-5    | —     | —      | —     | size-5   |
| sm      | h-6    | —     | h-6    | —     | size-6   |
| default | h-7    | h-7   | h-7    | h-5   | size-7   |
| lg      | h-8    | —     | —      | —     | size-8   |
```

### Roadmap Priority
```
Phase 1: Commerce (Stripe, orders, checkout, email)     ← CURRENT
Phase 2: Security (RLS audit, Sentry, Zod, rate limits)
Phase 3: Scale (services, presigned uploads, pooling)
Phase 4: Maintain (templates, Storybook, storefront split)
```

---

## Session Protocol

1. **Start**: Run health check. Read this file. Check git log for context.
2. **Plan**: State which agent(s) are relevant. Think out loud.
3. **Execute**: Minimal changes. Verify after each step.
4. **Commit**: Conventional commits. One concern per commit.
5. **End**: Update SESSION.md if multi-session work.
