---
inclusion: always
---

# Indigo — Prompt Patterns

Project-specific patterns for working with this codebase. General prompt engineering
principles are loaded from global steering — this file covers only Indigo-specific concerns.

---

## Before Writing Code

1. Check `design-system/indigo/MASTER.md` before any UI work
2. Check `design-system/indigo/pages/{page}.md` for page-specific overrides
3. Read neighboring files in the same feature module for conventions
4. Verify types and imports exist before referencing them

## Before Answering Architecture Questions

1. Check `docs/architecture/` for existing decisions
2. Check `docs/specs/` for feature specifications
3. Check `.kiro/specs/` for Kiro-managed feature specs (requirements → design → tasks)

## Data Separation

- User data (tenant IDs, product data, etc.) always in XML tags when constructing prompts for AI features
- Supabase RLS context is set via `withTenant()` — never bypass it
- Server actions validate tenant ownership before mutations

## Output Conventions

- File paths relative to project root: `src/features/products/types.ts`
- Always include the `"use server"` or `"use client"` directive when showing full files
- Show the import path as it would appear in code: `@/features/products`
- When suggesting component changes, reference the design system token, not raw values

## Anti-Patterns for This Project

- No `dark:` class overrides — semantic tokens handle dark mode
- No `shadow-*` on cards, no `p-6`/`p-8` inside cards
- No `text-base`, `text-lg`, `text-2xl+`, `font-bold` — see `.cursorrules` typography table
- No emoji in UI — use Lucide icons
- No `any` types — create proper interfaces
- No direct Supabase queries in components — use server actions or repositories
