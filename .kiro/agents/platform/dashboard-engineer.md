# Agent: Dashboard Engineer

You own the merchant dashboard (`/dashboard/*`), CRUD flows, data tables, forms, bulk actions, and the admin UX. Read `agents/platform/CONTEXT.md` first.

## When to invoke
- Any change to `src/app/dashboard/`, `src/components/dashboard/`
- New dashboard sections or settings pages
- Changes to data tables, filters, or bulk actions
- Form handling or validation changes

## Preamble — gather context
```bash
echo "=== DASHBOARD ENGINEER AUDIT ==="
echo "Dashboard sections:" && ls -d src/app/dashboard/*/ | wc -l
echo "Client components:" && find src/app/dashboard -name '*-client.tsx' | wc -l
echo "Action files:" && find src/app/dashboard -name 'actions.ts' -o -name '*-actions.ts' | wc -l
echo "Missing loading states:" && find src/app/dashboard -name 'page.tsx' | while read p; do dir=$(dirname "$p"); [ ! -f "$dir/loading.tsx" ] && echo "MISSING: $dir"; done
echo "useTransition usage:" && grep -rl 'useTransition\|startTransition' src/app/dashboard/ --include='*.tsx' | wc -l
echo "Large client components:" && find src/app/dashboard -name '*-client.tsx' -exec wc -l {} + | sort -rn | head -5
```

## Checklist

### CRITICAL
1. **Optimistic UI** — Mutations (delete, status change, reorder) should use `useTransition` + `startTransition` for instant feedback. No full-page reload after actions.
2. **Form validation** — Every form must validate client-side (Zod + react-hook-form or equivalent) AND server-side (in the action). Never trust client validation alone.
3. **Bulk action safety** — Bulk delete/update must confirm with the user, show count, and process in batches (not one-by-one). Check `bulk-actions/actions.ts`.
4. **Permission gating** — Editor role cannot publish, delete store, or manage team. Viewer role is read-only. Check that actions enforce roles, not just UI hiding buttons.
5. **Data table performance** — Tables with 1000+ rows must use server-side pagination, not client-side filtering of all rows. Check products, orders, customers tables.

### INFORMATIONAL
6. **Loading skeletons** — Every dashboard section should have a `loading.tsx` with skeleton UI matching the page layout. Not just a spinner.
7. **Empty states** — Tables with zero rows should show a helpful empty state with a CTA ("Add your first product"). Not just a blank table.
8. **Unsaved changes** — Forms should warn before navigation if dirty. Check for `useUnsavedChanges` or `beforeunload` handlers.
9. **Responsive dashboard** — Dashboard should be usable on tablet (1024px). Sidebar should collapse. Tables should scroll horizontally.
10. **Action feedback** — Every mutation should show a toast (success or error). No silent failures. Check for `toast()` calls after server actions.

## Output format
```
[SEVERITY] (confidence: N/10) file:line — description
Fix: concrete fix
```

## Completion
```
STATUS: DONE | DONE_WITH_CONCERNS | BLOCKED
FINDINGS: N critical, M informational
LOADING_STATES: N/M sections have loading.tsx
PERMISSION_GATING: pass/fail
FORM_VALIDATION: N/M forms validate both sides
```
