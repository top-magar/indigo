# INDIGO PLATFORM REVIEW — main — 2026-04-08

## SUMMARY
**26 findings (13 critical, 13 informational) from 4 of 6 agents**
(api-architect and platform-qa timed out — rerun separately if needed)

---

## CRITICAL — Fix Before Merge

### MULTI-AGENT CONFIRMED

1. **[Data + Infra] Stripe secret `|| ""` fallback** (confidence: 10/10)
   - `src/app/api/webhooks/stripe/route.ts:32,34`
   - `src/app/api/store/[slug]/checkout/route.ts:33`
   - `src/lib/stripe.ts:4`
   - Empty string fallback silently creates broken Stripe clients
   - Fix: Throw on missing env var

### DATA ENGINEER — Tenant Isolation (7 queries)

2. **categories/actions.ts:203,214** (confidence: 9/10) — `deleteCategory` children check + product unassign missing `tenant_id`
3. **categories/actions.ts:246,257** (confidence: 9/10) — `bulkDeleteCategories` same issue
4. **collections/actions.ts:153** (confidence: 8/10) — `deleteCollection` collection_products missing `tenant_id`
5. **collections/actions.ts:233,243,271** (confidence: 8/10) — `add/removeProductFromCollection` missing `tenant_id`
6. **bulk-actions/actions.ts:336** (confidence: 7/10) — User lookup missing `tenant_id`

### DATA ENGINEER — N+1 Queries (6 instances)

7. **bulk-actions/actions.ts:60** (confidence: 9/10) — `bulkDeleteAction` loops individual deletes
8. **bulk-actions/actions.ts:520** (confidence: 9/10) — `bulkTagCustomers` 2 queries per customer
9. **categories/actions.ts:243** (confidence: 9/10) — `bulkDeleteCategories` 3 queries per ID
10. **collections/actions.ts:206** (confidence: 8/10) — `updateCollectionOrder` individual updates
11. **inventory/actions.ts:198** (confidence: 8/10) — `importInventory` 3 queries per row
12. **media/actions.ts:617** (confidence: 8/10) — `bulkDeleteMediaAssets` per-asset loop

### DATA ENGINEER — Race Conditions

13. **All dashboard update actions** (confidence: 7/10) — Zero optimistic locking. No `updated_at` checks. Last-write-wins silently.

### INFRA ENGINEER — Idempotency

14. **inventory/repositories/inventory.ts:396+** (confidence: 8/10) — `decrementStockForOrder` no idempotency guard. Inngest retry = double decrement.

### STOREFRONT ENGINEER

15. **editor/blocks/popup.tsx:79** (confidence: 9/10) — PopupBlock renders editor UI on live storefront. Visitors see dashed card instead of popup.
16. **6 storefront pages missing `generateMetadata()`** (confidence: 10/10) — contact, faq, checkout, search, wishlist, order-confirmation
17. **11 of 15 storefront routes missing `loading.tsx`** (confidence: 10/10) — White screen on slow loads
18. **14 of 15 storefront routes missing `error.tsx`** (confidence: 10/10) — Only root-level error boundary exists

---

## INFORMATIONAL — Address When Convenient

### DATA ENGINEER

19. **9 instances of `select("*")`** — Fetching all columns when 3-5 needed
20. **20+ list queries without pagination** — categories, collections, analytics orders
21. **Drizzle ORM unused at query layer** — Schema defined (1891 lines) but all queries use raw Supabase client
22. **Audit coverage: 28%** — Only 4/14 mutation files have audit logging
23. **3 different deletion strategies** — `is_active`, `deleted_at`, hard delete

### INFRA ENGINEER

24. **Rate limiting: 4/40 routes** — Missing on contact, newsletter, upload, AI endpoints
25. **Service boundary violations** — notification-delivery and inventory-decrement import from features/
26. **Cache is a no-op stub** — Zero caching today. Tech debt when Redis is added.

### STOREFRONT ENGINEER

27. **Hero block uses CSS `background-image`** — Bypasses next/image optimization for LCP element
28. **FAQ page missing `FAQJsonLd`** — Missed rich snippet opportunity
29. **No store active/suspended status check** — Expired tenants still serve storefront

---

## PER-AGENT STATUS

| Agent | Status | Critical | Informational |
|-------|--------|----------|---------------|
| Data Engineer | DONE_WITH_CONCERNS | 13 | 5 |
| API Architect | TIMED_OUT | — | — |
| Storefront Engineer | DONE_WITH_CONCERNS | 4 | 4 |
| Dashboard Engineer | TIMED_OUT | — | — |
| Infrastructure Engineer | DONE_WITH_CONCERNS | 5 | 8 |
| Platform QA | TIMED_OUT | — | — |

---

## VERDICT: **FIX_FIRST**

Tenant isolation leaks in categories and collections are data breach vectors (confidence 9/10). Fix those + Stripe secret fallbacks before any release.

### Priority Order
1. **Tenant isolation** — 7 queries in categories + collections + bulk-actions (security)
2. **Stripe secrets** — Replace `|| ""` with throw-on-missing (security)
3. **Inventory idempotency** — Guard against double-decrement (data integrity)
4. **PopupBlock storefront render** — Editor UI visible to customers (UX)
5. **N+1 queries** — 6 bulk operations doing per-item DB calls (performance)
6. **Storefront loading/error states** — White screens on slow loads (UX)
7. **SEO metadata** — 6 pages missing generateMetadata (SEO)
8. **Rate limiting** — Public endpoints unprotected (security)
9. **Audit coverage** — 72% of mutations unaudited (compliance)
10. **Optimistic locking** — Last-write-wins on concurrent edits (data integrity)
