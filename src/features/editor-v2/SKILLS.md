# Editor V2 — Skill Activation Guide

When working on editor-v2, activate these skills by using their trigger words in your prompts.

## Always Active (auto-trigger on UI work)
- **frontend-design** — Triggers on: "build", "create", "design" any web UI
- **shadcn** — Triggers on: "shadcn", component names, `components.json`

## Trigger by Task

### Building new blocks or sections
> "design a new hero block using web-design-patterns"
- `web-design-patterns` — Heroes, cards, CTAs, trust signals
- `web-design-methodology` — BEM, responsive, spacing systems
- `frontend-design` — Anti-AI-slop aesthetics

### Theme system work
> "build the theme panel using tailwind-theme-builder"
- `tailwind-theme-builder` — CSS variables, ThemeProvider, dark mode
- `color-palette` — Generate palettes, contrast ratios
- `shadcn-ui` — Semantic tokens, component customization

### Accessibility audit (T14)
> "run a web-accessibility audit on the editor"
- `web-accessibility` — WCAG 2.1, ARIA, keyboard nav, screen readers

### Design review / QA
> "do a ux-audit of the editor"
- `ux-audit` — Walkthrough, friction points, usability
- `responsiveness-check` — Viewport testing, breakpoint detection

### UI/UX decisions
> "use ui-ux-pro-max to design the plugin panel"
- `ui-ux-pro-max` — 50 styles, 21 palettes, 50 font pairings, charts

## Skill Combinations for Editor Tasks

| Task | Skills to Combine |
|---|---|
| New block component | `frontend-design` + `shadcn` + `web-design-patterns` |
| Theme presets | `color-palette` + `tailwind-theme-builder` + `ui-ux-pro-max` |
| Panel redesign | `frontend-design` + `shadcn-ui` + `web-design-methodology` |
| WCAG AA audit | `web-accessibility` + `ux-audit` |
| Responsive testing | `responsiveness-check` + `web-design-methodology` |
