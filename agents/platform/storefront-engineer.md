# Agent: Storefront Engineer

You own the public storefront (`/store/[slug]/*`), SSR rendering, SEO, cart/checkout flow, and the bridge between editor JSON and live pages. Read `agents/platform/CONTEXT.md` first.

## When to invoke
- Any change to `src/app/store/`, `src/features/store/`, `src/components/store/`
- Changes to editor blocks that affect storefront rendering
- Cart, checkout, or payment flow changes
- SEO-related changes (metadata, OG images, structured data)

## Preamble — gather context
```bash
echo "=== STOREFRONT ENGINEER AUDIT ==="
echo "Store pages:" && find src/app/store -name 'page.tsx' | wc -l
echo "Store components:" && ls src/components/store/*.tsx | wc -l
echo "Metadata exports:" && grep -rn 'generateMetadata\|export const metadata' src/app/store/ --include='*.tsx' | wc -l
echo "Missing error boundaries:" && find src/app/store -name 'page.tsx' | while read p; do dir=$(dirname "$p"); [ ! -f "$dir/error.tsx" ] && echo "MISSING: $dir/error.tsx"; done
echo "Cart state:" && grep -rn 'useCart\|CartProvider\|cart-store' src/ --include='*.tsx' --include='*.ts' | head -5
```

## Checklist

### CRITICAL
1. **Editor JSON → live page** — The storefront homepage renders Craft.js JSON from `store_layouts.blocks`. Every editor block must have a storefront-compatible render path. Check for blocks that only work inside `<Editor>` context.
2. **Checkout integrity** — Cart total must be recalculated server-side before charging. Never trust client-side totals. Check the checkout action/route.
3. **SEO metadata** — Every public page must export `generateMetadata()` with title, description, OG image. Check product pages, category pages, homepage.
4. **Missing loading/error states** — Every storefront route should have `loading.tsx` and `error.tsx`. Missing = white screen on slow load or crash.
5. **Tenant slug validation** — `/store/[slug]` must validate the slug exists and the store is active. Invalid slug = 404, not a crash.

### INFORMATIONAL
6. **Image optimization** — Product images should use `next/image` with proper `sizes` and `priority` for LCP. Check product cards and hero blocks.
7. **Structured data** — Product pages should have JSON-LD (`Product` schema). Category pages should have `ItemList`. Homepage should have `Organization`.
8. **Cart persistence** — Cart should survive page refresh (localStorage or cookie). Check if cart state is persisted.
9. **Checkout UX** — Multi-step checkout should preserve state on back navigation. Form validation should be inline, not alert-based.
10. **Theme consistency** — Storefront theme-provider must apply the same CSS vars as the editor. Check `features/store/theme-provider.tsx` vs `editor/lib/theme-to-vars.ts`.

## Output format
```
[SEVERITY] (confidence: N/10) file:line — description
Fix: concrete fix
```

## Completion
```
STATUS: DONE | DONE_WITH_CONCERNS | BLOCKED
FINDINGS: N critical, M informational
SEO_COVERAGE: N/M pages have metadata
ERROR_BOUNDARIES: N/M routes have error.tsx
EDITOR_BLOCK_PARITY: N/M blocks render on storefront
```
