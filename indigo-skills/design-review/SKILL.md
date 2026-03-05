---
name: design-review
description: Review Indigo UI components against the Vercel/Geist design system. Use when auditing existing components for token compliance, accessibility, dark mode correctness, and interaction patterns.
---

# Design Review

Audit Indigo components against Vercel/Geist design system rules.

## Quick Audit Script

Run `scripts/audit.sh` to check token compliance across the codebase:
```bash
bash indigo-skills/design-review/scripts/audit.sh [file-or-directory]
```

## Review Checklist

### Layer 1: Neutral Foundation
- [ ] 4 background layers used correctly (frame, page, card elevated, card recessed)
- [ ] Borders use `border-border` (never pure black)
- [ ] Text hierarchy: headings → body → secondary → placeholder
- [ ] Button importance: darker = more important

### Layer 2: Functional Accent
- [ ] Brand colors use `var(--ds-brand-*)` scale
- [ ] Light mode: 500-600 main, 700 hover
- [ ] Dark mode: 300-400 main, 500 hover

### Layer 3: Semantic Colors
- [ ] Success = green, Error = red, Warning = amber, Info = blue (never changed)
- [ ] Destructive actions are always red
- [ ] Chart colors use perceptually uniform OKLCH (L:0.65, C:0.15)

### Layer 4: Theming
- [ ] No hardcoded colors — all via tokens
- [ ] Dark mode works via token remapping (no `dark:` overrides)
- [ ] "Double the distance" rule: 4-6% lightness between dark mode layers

### Interaction Compliance
- [ ] Full keyboard support per WAI-ARIA APG
- [ ] Hit targets ≥24px (≥44px mobile)
- [ ] URL reflects state (deep-linkable)
- [ ] `prefers-reduced-motion` honored
- [ ] Destructive actions require confirmation or undo
- [ ] Loading states have minimum duration (no flicker)

### Performance
- [ ] Lists >50 items virtualized
- [ ] Images have explicit dimensions (no CLS)
- [ ] Heavy components lazy-loaded
