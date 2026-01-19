# Design System Documentation

This directory contains all design system documentation for the Indigo platform.

## Structure

### `/geist/`
Geist design system documentation:
- Color system guide (OKLCH)
- Component implementations
- Migration plans
- CSS patterns
- Integration guides
- Component references and batches

### `/vercel/`
Vercel design patterns and guidelines:
- Animation patterns
- Color usage patterns
- Component styling
- Corner radius and sizing
- Design system overview

## Key Concepts

### OKLCH Color System
All colors use OKLCH for perceptual uniformity:
- Same lightness = same perceived brightness across hues
- Better dark mode with "double the distance" rule
- Easy theming by adjusting hue

### Component Sizing
- **sm**: h-8 (32px) - Dense UIs, table actions
- **md**: h-10 (40px) - Default buttons, inputs
- **lg**: h-12 (48px) - Primary CTAs

### Spacing
4px base unit: gap-1 (4px), gap-2 (8px), gap-3 (12px), gap-4 (16px), gap-6 (24px)

### Border Radius
- `rounded-sm` → Badges, tags
- `rounded-md` → Buttons, inputs (interactive elements)
- `rounded-lg` → Cards, dropdowns
- `rounded-xl` → Dialogs, modals

## Related Files

See also:
- `/specs/DESIGN-SYSTEM.md` - Technical specifications
- Root workspace rules: `vercel-geist-design-system.md`, `vercel-web-interface-guidelines.md`
