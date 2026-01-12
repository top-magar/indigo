# Vercel Web Interface Guidelines

Concise rules for building accessible, fast, delightful UIs. Use MUST/SHOULD/NEVER to guide decisions.

---

## Interactions

### Keyboard
- MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
- MUST: Visible focus rings (`:focus-visible`; group with `:focus-within`)
- MUST: Manage focus (trap, move, and return) per APG patterns
- SHOULD: Locale-aware keyboard shortcuts for non-QWERTY layouts; show platform-specific symbols

### Targets & Input
- MUST: Hit target ≥24px (mobile ≥44px). If visual <24px, expand hit area
- MUST: Mobile `<input>` font-size ≥16px or set:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
  ```
- NEVER: Disable browser zoom
- MUST: `touch-action: manipulation` to prevent double-tap zoom; set `-webkit-tap-highlight-color` to match design

### Inputs & Forms (Behavior)
- MUST: Hydration-safe inputs (no lost focus/value)
- NEVER: Block paste in `<input>/<textarea>`
- MUST: Loading buttons show spinner and keep original label
- MUST: Enter submits focused text input. In `<textarea>`, ⌘/Ctrl+Enter submits; Enter adds newline
- MUST: Keep submit enabled until request starts; then disable, show spinner, use idempotency key
- MUST: Don't block typing; accept free text and validate after
- MUST: Allow submitting incomplete forms to surface validation
- MUST: Errors inline next to fields; on submit, focus first error
- MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
- SHOULD: Disable spellcheck for emails/codes/usernames
- SHOULD: Placeholders end with ellipsis and show example pattern (e.g., `+1 (123) 456-7890`, `sk-012345…`)
- MUST: Warn on unsaved changes before navigation
- MUST: Compatible with password managers & 2FA; allow pasting one-time codes
- MUST: Trim values to handle text expansion trailing spaces
- MUST: No dead zones on checkboxes/radios; label+control share one generous hit target

### State & Navigation
- MUST: URL reflects state (deep-link filters/tabs/pagination/expanded panels). Prefer libs like [nuqs](https://nuqs.dev)
- MUST: Back/Forward restores scroll
- MUST: Links are links—use `<a>/<Link>` for navigation (support Cmd/Ctrl/middle-click)

### Feedback
- SHOULD: Optimistic UI; reconcile on response; on failure show error and rollback or offer Undo
- MUST: Confirm destructive actions or provide Undo window
- MUST: Use polite `aria-live` for toasts/inline validation
- SHOULD: Ellipsis (`…`) for options that open follow-ups (e.g., "Rename…") and loading states (e.g., "Loading…", "Saving…", "Generating…")

### Touch/Drag/Scroll
- MUST: Design forgiving interactions (generous targets, clear affordances; avoid finickiness)
- MUST: Delay first tooltip in a group (~150ms); subsequent peers no delay
- MUST: Intentional `overscroll-behavior: contain` in modals/drawers
- MUST: During drag, disable text selection and set `inert` on dragged element/containers
- MUST: No "dead-looking" interactive zones—if it looks clickable, it is

### Autofocus
- SHOULD: Autofocus on desktop when there's a single primary input; rarely on mobile (to avoid layout shift)

---

## Animation

- MUST: Honor `prefers-reduced-motion` (provide reduced variant)
- SHOULD: Prefer CSS > Web Animations API > JS libraries
- MUST: Animate compositor-friendly props (`transform`, `opacity`); avoid layout/repaint props (`top/left/width/height`)
- SHOULD: Animate only to clarify cause/effect or add deliberate delight
- SHOULD: Choose easing to match the change (size/distance/trigger)
- MUST: Animations are interruptible and input-driven (avoid autoplay)
- MUST: Correct `transform-origin` (motion starts where it "physically" should)

### Loading States
- MUST: Minimum loading-state duration (~150–300ms show-delay, ~300–500ms minimum visible time) to avoid flicker
- SHOULD: Use React `<Suspense>` which handles this automatically

---

## Layout

- SHOULD: Optical alignment; adjust by ±1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges/optical centers—no accidental placement
- SHOULD: Balance icon/text lockups (stroke/weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (use `env(safe-area-inset-*)`)
- MUST: Avoid unwanted scrollbars; fix overflows. Test with macOS "Show scroll bars: Always"
- SHOULD: Let the browser size things—prefer flex/grid/intrinsic layout over JS measurement

---

## Content & Accessibility

### Help & Labels
- SHOULD: Inline help first; tooltips last resort
- MUST: Icons have text labels for non-sighted users
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Don't ship the schema—visuals may omit labels but accessible names still exist

### Skeletons & States
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: Design empty/sparse/dense/error states
- MUST: No dead ends; always offer next step/recovery

### Typography & Formatting
- SHOULD: Curly quotes (" "); avoid widows/orphans
- MUST: Use the ellipsis character `…` (not `...`)
- MUST: Tabular numbers for comparisons (`font-variant-numeric: tabular-nums` or Geist Mono)
- MUST: Non-breaking spaces to glue terms: `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`, `Vercel&nbsp;SDK`

### Page Structure
- MUST: `<title>` matches current context
- MUST: Hierarchical `<h1–h6>` & a "Skip to content" link
- MUST: `scroll-margin-top` on headings for anchored links

### Accessibility
- MUST: Redundant status cues (not color-only); include text labels
- MUST: Accurate names (`aria-label`), decorative elements `aria-hidden`, verify in Accessibility Tree
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- MUST: Use polite `aria-live` for async updates

### Resilience
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers/currency
- MUST: Prefer language settings over location (use `Accept-Language` header, `navigator.languages`)

---

## Performance

- SHOULD: Test iOS Low Power Mode and macOS Safari
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track and minimize re-renders (React DevTools/React Scan)
- MUST: Profile with CPU/network throttling
- MUST: Batch layout reads/writes; avoid unnecessary reflows/repaints
- MUST: Mutations (`POST/PATCH/DELETE`) target <500ms
- SHOULD: Prefer uncontrolled inputs; make controlled loops cheap (keystroke cost)
- MUST: Virtualize large lists (e.g., `virtua`)
- MUST: Preload only above-the-fold images; lazy-load the rest
- MUST: Prevent CLS from images (explicit dimensions or reserved space)

---

## Design

### Visual Polish
- SHOULD: Layered shadows (ambient + direct)
- SHOULD: Crisp edges via semi-transparent borders + shadows
- SHOULD: Nested radii: child ≤ parent; concentric
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- SHOULD: Match browser UI to bg
- SHOULD: Avoid gradient banding (use masks when needed)

### Contrast & Color
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast—prefer [APCA](https://apcacontrast.com/) over WCAG 2
- MUST: Increase contrast on `:hover/:active/:focus`

---

## Forms (Detailed)

### Labels & Structure
- MUST: Every control has a `<label>` or is associated with a label for assistive tech
- MUST: Clicking a `<label>` focuses the associated control
- MUST: Set `autocomplete` & meaningful `name` values to enable autofill
- MUST: Use correct `type` and `inputmode` for better keyboards & validation

### Validation
- MUST: Show errors next to their fields; on submit, focus the first error
- MUST: Don't pre-disable submit—allow submitting incomplete forms to surface validation
- MUST: Don't block typing; accept any input and show validation feedback

### Special Cases
- SHOULD: Disable spellcheck for emails, codes, usernames
- MUST: Don't trigger password managers for non-auth fields (use `autocomplete="off"` or specific tokens)
- MUST: Windows `<select>` needs explicit `background-color` & `color` for dark-mode

---

## Code Examples

### Mobile-Safe Input
```tsx
<input
  type="email"
  className="text-base sm:text-sm" // ≥16px on mobile
  autoComplete="email"
  spellCheck={false}
  placeholder="you@example.com…"
/>
```

### Loading Button
```tsx
<Button disabled={isPending}>
  {isPending && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
  {isPending ? "Saving…" : "Save Changes"}
</Button>
```

### Tooltip with Proper Timing
```tsx
<TooltipProvider delayDuration={150}>
  <Tooltip>
    <TooltipTrigger>...</TooltipTrigger>
    <TooltipContent>...</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Mobile Hit Targets
```tsx
// 44px on mobile, 40px on desktop
<button className="h-11 sm:h-10 min-w-11 sm:min-w-10">
```

### Reduced Motion Support
```tsx
<div className="animate-fade-in motion-reduce:animate-none">
```

### Non-Breaking Spaces
```tsx
// In JSX
<span>10&nbsp;MB</span>
<span>⌘&nbsp;+&nbsp;K</span>

// Or use Unicode directly
<span>10 MB</span> // U+00A0
```

### Overscroll Containment
```tsx
<DropdownMenuContent className="overscroll-contain">
```

### Tabular Numbers
```tsx
<span className="tabular-nums">$1,234.56</span>
// Or
<span style={{ fontVariantNumeric: 'tabular-nums' }}>$1,234.56</span>
```

---

## Quick Reference Checklist

### Before Shipping
- [ ] All flows keyboard-operable
- [ ] Focus rings visible (`:focus-visible`)
- [ ] Hit targets ≥24px (≥44px mobile)
- [ ] Mobile inputs ≥16px font-size
- [ ] URL reflects state (deep-linkable)
- [ ] Loading states have minimum duration
- [ ] Destructive actions require confirmation
- [ ] Errors shown inline, first error focused
- [ ] `prefers-reduced-motion` honored
- [ ] Skeletons match final layout
- [ ] Empty/error states designed
- [ ] Contrast meets APCA standards
- [ ] `aria-label` on icon-only buttons
- [ ] Large lists virtualized
- [ ] Images have dimensions (no CLS)

---

*Based on [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)*
