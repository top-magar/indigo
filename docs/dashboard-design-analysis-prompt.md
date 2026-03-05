# Dashboard Visual Design Analysis Prompt

> Built using Anthropic's prompt engineering framework (Ch2: Clear & Direct, Ch3: Role Prompting, Ch4: XML Data Separation, Ch5: Output Formatting, Ch6: Chain-of-Thought, Ch9: Complex Prompt Structure)

---

## SYSTEM PROMPT (Role — Ch3)

You are a senior product designer who has shipped design systems at Vercel, Linear, and Shopify. You specialize in e-commerce admin dashboards, OKLCH color theory, and the intersection of information density with visual clarity. You have deep knowledge of Shopify's Polaris uplift (moving from "dull/depressing/bland" to tactile, dense, joyful), Vercel's 4-layer color architecture, and Linear's precision typography. You are brutally honest about design quality and never give generic praise.

---

## USER PROMPT

### 1. TASK CONTEXT

I need a comprehensive visual design audit of an e-commerce admin dashboard called "Indigo" — a multi-tenant platform for Nepal built with Next.js 16, Tailwind v4, shadcn/ui, and an OKLCH color system. The dashboard currently looks generic and lacks brand identity. I want to transform it into a distinctive, professional tool that merchants enjoy using daily.

### 2. TONE CONTEXT

Be direct and specific. Use concrete measurements (px, rem, OKLCH values). Name exact problems and exact fixes. No hedging, no "consider maybe" — state what's wrong and what to do about it.

### 3. DETAILED RULES

<rules>
- Evaluate against these proven benchmarks: Shopify Admin (Polaris v12), Vercel Dashboard, Linear App, Stripe Dashboard
- Use the 4-Layer color model: (1) Neutral Foundation, (2) Functional Accent/Brand, (3) Semantic Colors, (4) Theming
- Apply the "squint test" — if you squint, do the most critical elements still stand out?
- Check the F-pattern — are KPIs in the top-left quadrant where attention is highest?
- Follow Miller's Law — 5-9 key metrics at summary level, drill-down for detail
- Verify WCAG/APCA contrast on every color pairing you evaluate
- Flag any component below 32px touch target or 44px mobile target
- Identify "AI slop" — generic patterns that look like every other shadcn dashboard
- For each issue found, rate severity: CRITICAL (breaks usability), HIGH (hurts perception), MEDIUM (suboptimal), LOW (polish)
</rules>

### 4. INPUT DATA

<codebase_context>
- Font: Inter via next/font/google, set as --font-inter
- Body font-size: 14px base, but components use text-xs (12px) extensively
- Button default: h-7 (28px), text-xs/relaxed
- Input default: h-7 (28px), text-sm → md:text-xs/relaxed (shrinks on desktop)
- Badge: h-5 (20px), text-[0.625rem] (10px), rounded-full
- Card: ring-1 ring-foreground/10 border, py-4 px-4
- Color tokens: ALL achromatic (zero chroma) — --primary: oklch(0.205 0 0), --accent: oklch(0.97 0 0)
- Only chroma exists in: chart colors and --destructive
- Dark mode: proper OKLCH layering with 6% lightness steps
- Missing tokens: bg-success, bg-warning, text-success, text-warning (used but undefined)
- Dead code: 20+ Geist typography utilities (.text-heading-*, .text-label-*, etc.) defined but never used
- Dashboard sections: HeroSection, EnhancedMetricCards (4), RevenueChart, ActivityFeed, PerformanceGrid (4 more cards), RecentOrdersTable, AWSServicesOverview, WellArchitectedWidget, SetupWizard
- That's 7-9 vertical sections on one page
- PerformanceGrid duplicates EnhancedMetricCard pattern exactly
- Loading skeleton doesn't match actual page layout
</codebase_context>

<design_benchmarks>
SHOPIFY POLARIS UPLIFT LEARNINGS:
- Moved from green primary to black primary ("neutral allows colors to carry semantic meaning")
- Reduced text sizes across the board for density
- Chose Inter specifically for small-text legibility
- Icons redesigned to match typography weight (1.5px outline)
- Signature "Snappy" motion curve — quick but shows origin
- Buttons feel like "plastic, not glass" — tactile depth
- 86% of admin updated automatically via design tokens

VERCEL 4-LAYER MODEL:
- Layer 1: 4 background layers, 2 stroke variants, 3 text variants minimum
- Layer 2: Brand as a SCALE (100-900), not a single color
- Layer 3: Semantic colors MUST break the neutral system
- Layer 4: Theme any neutral by: L-0.03, C+0.02, H=theme-hue
- Dark mode: double the distance (4-6% between layers, not 2%)

SAAS DASHBOARD BEST PRACTICES:
- 5-9 KPIs at summary level (Miller's Law)
- F-pattern layout: critical metrics top-left
- Progressive disclosure: essential info first, drill-down for detail
- Skeleton screens must mirror final layout exactly
- Command palette (Cmd+K) for power users
- Sub-second load with skeleton screens
- Widget-level customization (drag, resize, remove)
</design_benchmarks>

### 5. IMMEDIATE TASK

Perform a deep visual design analysis of every element in this dashboard. Cover these areas in order:

1. **Typography Audit** — font choice, size scale, weight usage, hierarchy, letter-spacing, line-height
2. **Color System Audit** — OKLCH token analysis, brand presence, semantic colors, contrast ratios, dark mode
3. **Component Sizing Audit** — touch targets, height scale, padding, spacing consistency
4. **Layout & Composition Audit** — information architecture, section count, density, F-pattern compliance, grid usage
5. **Component-Level Audit** — button, input, badge, card, table, dialog, select, sidebar — each one
6. **Motion & Interaction Audit** — transitions, hover states, loading states, entrance animations
7. **Benchmark Comparison** — how does Indigo compare to Shopify/Vercel/Linear/Stripe on each dimension?
8. **"AI Slop" Detector** — what makes this look like every other generic dashboard?
9. **Top 15 Prioritized Fixes** — ordered by impact, with exact implementation specs

### 6. PRECOGNITION (Ch6)

Before writing your analysis, think step by step in <scratchpad> tags:
- First, mentally walk through the dashboard as a Nepali merchant seeing it for the first time
- Then, compare each element against the Shopify/Vercel benchmarks
- Finally, identify the 3 changes that would have the most dramatic visual impact

### 7. OUTPUT FORMAT

Structure your response with these exact sections using markdown headers:
- Scratchpad (thinking)
- Typography Verdict
- Color System Verdict
- Component Sizing Verdict
- Layout & Composition Verdict
- Component-Level Breakdown
- Motion & Interaction Verdict
- Benchmark Scorecard (table: Indigo vs Shopify vs Vercel vs Linear, scored 1-10)
- AI Slop Detector
- Top 15 Prioritized Fixes (table: rank, issue, severity, exact fix spec, files to change)
