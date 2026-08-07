---
target: src/app/page.tsx
total_score: 18
max_score: 20
na_heuristics: 3,5,7,9,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-07T16-59-36Z
slug: src-app-page-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Live streaming badges, clear active states on range selectors |
| 2 | Match System / Real World | 3 | High domain jargon ("Cohorts", "Events") may confuse basic merchants |
| 3 | User Control and Freedom | n/a | Persuade/Experience surface (Landing page) |
| 4 | Consistency and Standards | 4 | Strict adherence to the `lv2-` design token system and Cypon aesthetic |
| 5 | Error Prevention | n/a | Persuade/Experience surface (Landing page) |
| 6 | Recognition Rather Than Recall | 4 | Good contextual tooltips on charts and funnels |
| 7 | Flexibility and Efficiency | n/a | Persuade/Experience surface (Landing page) |
| 8 | Aesthetic and Minimalist Design | 3 | Beautiful, but Dashboard Preview borders on visual overload |
| 9 | Error Recovery | n/a | Persuade/Experience surface (Landing page) |
| 10 | Help and Documentation | n/a | Persuade/Experience surface (Landing page) |
| **Total** | | **18/20** | **Excellent** |

#### Design Specificity Verdict

**LLM assessment**: High specificity. The design feels purposefully authored for Indigo. The combination of localized data (e.g., NPR currency, eSewa/Khalti integrations) with live data streams, terminal-like headers, and specific e-commerce metrics grounds it firmly in its context. It does not feel like a generic SaaS template; it feels like a powerful, data-driven workbench.

**Deterministic scan**: The CLI scan returned 0 findings for the landing page components. 

**Visual overlays**: Browser automation was attempted via Chrome DevTools, but the overlay script injection failed due to strict Content Security Policy (CSP) blocking the localhost injection. The assessment relied on the clean CLI scan results as a fallback signal.

#### Overall Impression
A highly premium, data-dense landing page that successfully sells the "analytics" side of the platform through interactive show-don't-tell components. The biggest opportunity is ensuring these rich hover-based interactions survive the transition to touch devices without alienating mobile users.

#### What's Working
1. **Interactive Storytelling**: The `DashboardPreview` and `FeaturesSection` don't just list features; they simulate the product. The live event feed and interactive charts make the value proposition tangible.
2. **Premium Aesthetic Execution**: The Cypon-inspired dark mode (zinc-950 canvas, indigo-600 accents, `lv2-grid-bg`) combined with `Geist Mono` touches creates a highly technical, competent, and trustworthy vibe.

#### Priority Issues

- **[P1] Touch-Hostile Interactions**
  - **Why it matters**: `HeatmapVisual`, `CohortVisual`, and `DashboardPreview` rely heavily on `onMouseEnter` and `onPointerMove` to reveal data. Mobile users (the majority of traffic) will miss this context entirely or trigger it awkwardly.
  - **Fix**: Implement tap-to-toggle states for tooltips on touch devices, or ensure fallback data is visible without interaction.
  - **Suggested command**: `$impeccable adapt`

- **[P1] Jargon Barrier for General Merchants**
  - **Why it matters**: Indigo targets merchants in Nepal who need a "visual storefront editor." Leading heavily with "Cohort analysis" and raw "Event streams" might intimidate non-technical shop owners who just want to sell products.
  - **Fix**: Balance the data-heavy sections with clear, plain-language benefits. Tie "Cohorts" back to "Repeat Customers."
  - **Suggested command**: `$impeccable clarify`

- **[P2] Visual Noise in Dashboard Preview**
  - **Why it matters**: The `DashboardPreview` component renders a chart, sparklines, live updating event rows, and KPI deltas simultaneously. It's close to exceeding working memory limits and causing cognitive overload.
  - **Fix**: Sequence the entrance animations so elements build up progressively, rather than all competing for attention at once.
  - **Suggested command**: `$impeccable quieter`

#### Persona Red Flags

**Casey (Mobile User)**: 
- `DashboardPreview` chart tooltips require precise pointer movement (`onPointerMove`), which is nearly impossible to scrub via touch.
- Hover-only tooltips on `CohortVisual` (`onMouseEnter`) will not trigger naturally on a phone.

**Jordan (First-Timer)**:
- Highly technical terminology ("Cohort analysis", "Event stream", "Pseudo-random deterministic grids") may alienate a merchant who just wants to set up a basic storefront. The page leans much harder into analytics than visual editing.

#### Minor Observations
- The `lv2-mega-anchor` logic uses a clever padding trick to prevent mouse-leave dead zones—great detail.
- The `reduced-motion` media query handles the live feeds perfectly, gracefully degrading the experience.

#### Questions to Consider
- Does the heavy focus on analytics accurately represent the platform's core value proposition, or does it overshadow the "visual storefront editor"?
- How will the dense bento grids adapt to narrow mobile screens without losing their structural impact?
- What would a version of this page look like if it led with the storefront builder instead of the analytics dashboard?
