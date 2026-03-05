# Audit Checklist

Run these checks against any new dashboard component:

## Token Compliance
- [ ] Zero hardcoded hex: `grep -n 'bg-\[#\|text-\[#\|border-\[#' <file>`
- [ ] Zero raw Tailwind colors: `grep -n 'bg-gray-\|text-gray-\|border-gray-' <file>`
- [ ] Zero `dark:` overrides: `grep -n 'dark:' <file>`
- [ ] Zero `font-bold`: `grep -n 'font-bold' <file>`
- [ ] Zero `as any`: `grep -n 'as any' <file>`

## States
- [ ] Loading skeleton exists in `loading.tsx`
- [ ] Empty state has CTA (no dead ends)
- [ ] Error boundary exists in `error.tsx`

## Accessibility
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have associated `<label>`
- [ ] Status conveyed by more than color alone
- [ ] `tabular-nums` on numeric data
- [ ] `motion-reduce` on animations

## Interaction
- [ ] Touch targets ≥44px on mobile
- [ ] Visible focus rings (`:focus-visible`)
- [ ] Destructive actions require confirmation
- [ ] Loading buttons show spinner + keep label
- [ ] URL reflects state (filters, pagination, tabs)

## Performance
- [ ] Lists >50 items use virtualization
- [ ] Images use `next/image` with dimensions
- [ ] Heavy components use `dynamic()` import
