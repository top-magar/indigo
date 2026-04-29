# Indigo Prompt Library

Battle-tested prompts that found real bugs. Use these for audits, reviews, and onboarding.

---

## Security Audits

### Find tenant isolation bugs
```
For each server action in [files], answer ONLY:
1. What DELETE/UPDATE query has no .eq("tenant_id", tenantId)?
2. What query accepts a user-supplied ID without verifying it belongs to the tenant?
Skip anything correct.

Example of what to find:
- shipping/actions.ts: .delete().eq("id", zoneId) missing .eq("tenant_id", tenantId)
- collection-actions.ts: collection_products DELETE by collection_id only, no tenant_id
- cart.ts: updateCartItem uses eq(cartItems.id, itemId) with no tenant join
```

### Find injection vulnerabilities
```
Search for every .or() and .ilike() call. For each:
1. Is user input passed through sanitizeSearch() or .replace(/[%_'"\\,().!|&:*]/g, '')?
2. Can PostgREST filter operators be injected?
Example: store search page had .or(`name.ilike.%${q}%`) with no sanitization.
```

### Find open redirects
```
Search for every redirect() call in API routes. For each:
1. Does the redirect path come from user input (query param, form data)?
2. Is it validated with safeRedirectPath() or startsWith("/") && !startsWith("//")?
Example: auth/callback had next param used directly in redirect.
```

---

## Bug Finding

### Find null propagation
```
Trace every place tenantId is read from auth. For each consumer:
1. What happens if it's null/undefined/empty string?
2. Does the code guard before using it in a query?
3. Does the query fail silently, return wrong data, or crash?

Root cause found: getUser() returns tenantId: "" for platform admins.
Fix pattern: use requireTenantUser() for dashboard, guard in authorizedAction().
```

### Find race conditions
```
For every async mutation (DB write, payment, stock update):
1. Is it read-then-write? (two concurrent calls = lost update)
2. Is there a transaction or lock?
3. Can two users/tabs trigger it simultaneously?

Examples found:
- updateProductStock: read quantity in JS, write back → use SQL expression instead
- addToCart: same pattern → use sql`quantity + ${n}`
- sendCampaign: no atomic lock → use UPDATE WHERE status IN ('draft') + .select()
```

### Find broken error paths
```
For each server action, answer ONLY:
1. Does it throw instead of returning { success: false, error }?
2. Does it return undefined/void on failure (bare return)?
3. Does it swallow errors silently (empty catch)?

Examples found:
- updateOrderStatus threw new Error() instead of returning { error }
- renamePage returned undefined when page not found
- addOrderEvent had no error handling on insert
```

---

## Performance

### Find unbounded queries
```
For every page.tsx, count the DB queries. Flag:
- Any query without .limit()
- Any SELECT * when only 2-3 columns needed
- Any query inside a loop (N+1)
- >3 sequential queries (should be Promise.all)

Examples found:
- getOrderStats loaded ALL orders into JS to count them → SQL GROUP BY
- exportCustomers had no .limit() → added .limit(10000)
- generateMonthlyInvoices: 3 queries × N tenants in a loop
```

---

## Code Quality

### Find unvalidated inputs
```
For each exported server action that accepts string params:
1. Is the ID validated as UUID? (validateId or z.string().uuid())
2. Is the input validated with Zod?
3. Are URL fields checked for javascript: protocol?

Found: ~50 functions accepting raw string IDs without UUID validation.
Fix: validateId() from shared/utils/validate-id.ts
```

### Find pattern inconsistency
```
Read 3 files that do the same thing (e.g., 3 "delete" actions).
List every difference: auth method, validation, error shape, revalidation.
The differences are the bugs-in-waiting.

Found: 3 auth patterns, 2 error shapes, 40% missing Zod validation.
```

### Pre-commit review
```
Review the staged changes. For each changed file:
1. Any new query missing tenant_id?
2. Any new ID param without validateId()?
3. Any new error path that doesn't return { success, error }?
4. Any new supabase.from() that should be Drizzle?
Only report problems.
```

---

## Design System

### Find design violations
```
grep every font-size, font-weight, border-radius, shadow, color class.
Count occurrences. Which values appear 50+ times (standard)?
Which appear 1-3 times (violation)?

Key violations found:
- text-[9px] below minimum → text-[10px]
- font-bold → font-semibold
- mr-N on flex child icons → remove (parent gap handles it)
- transition-all in app code → transition-colors or transition-[width]
```

---

## Architecture

### "How many steps to add X?"
```
For [feature area], trace the EXACT files you'd need to create or modify
to add a new instance. Count them. Flag if >3 files or >1 package.

If adding a new X requires remembering which files to touch,
the architecture is wrong. If the compiler tells you what's missing,
the architecture is right.
```

---

## Meta: How to Write Good Prompts

1. [Specific scope] + [Specific failure mode] + [Skip what's correct]
2. Always include examples of bugs you've found before
3. Order of analysis matters — read the data before judging it
4. Static context (AGENTS.md, design system) goes in system prompt
5. Format output for actionability: FILE, FUNCTION, ISSUE, SEVERITY
