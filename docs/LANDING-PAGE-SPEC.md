# Indigo Landing Page — Design Specification

## Direction
**Vibe:** Ethereal Glass (SaaS/Tech) — OLED black, subtle glow, precision typography
**Layout:** Centered composition with asymmetric bento accents
**Tone:** Confident, technical, warm — "built by developers, for merchants"
**Differentiator:** The terminal/code aesthetic signals developer credibility while the warm copy speaks to non-technical merchants

---

## Typography

| Role | Font | Size | Weight | Line-height | Tracking | Usage |
|------|------|------|--------|-------------|----------|-------|
| Display | Geist Sans | clamp(40px, 6vw, 72px) | 700 | 0.95 | -0.03em | Hero headline |
| H2 | Geist Sans | clamp(28px, 4vw, 44px) | 600 | 1.1 | -0.02em | Section headings |
| H3 | Geist Sans | 18px | 600 | 1.3 | -0.01em | Card titles |
| Body | Geist Sans | 16px | 400 | 1.6 | 0 | Descriptions |
| Small | Geist Sans | 14px | 400 | 1.5 | 0 | Secondary text |
| Eyebrow | Geist Mono | 11px | 500 | 1 | 0.08em | Labels, badges (uppercase) |
| Code | Geist Mono | 13px | 400 | 1.6 | 0 | Terminal blocks |

**Rules:**
- Max line length: 60ch for body, 20ch for headlines
- Never font-bold (700 only on display)
- Fluid type via clamp() on display/H2 only
- Dark bg = add 0.05 to line-height

---

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| bg | #050505 | Page background (OLED black) |
| surface | #0a0a0a | Card backgrounds |
| surface-elevated | #111111 | Elevated cards, nav |
| border | rgba(255,255,255,0.06) | Default borders |
| border-hover | rgba(255,255,255,0.12) | Hover state borders |
| text-primary | #ededed | Headlines, primary text |
| text-secondary | rgba(255,255,255,0.5) | Body text, descriptions |
| text-tertiary | rgba(255,255,255,0.3) | Captions, labels |
| accent | #10b981 (emerald-500) | CTAs, status, highlights |
| accent-glow | rgba(16,185,129,0.15) | Glow behind accent elements |
| accent-surface | rgba(16,185,129,0.08) | Accent card tints |

**Gradients:**
- Hero glow: radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 60%)
- Card shine: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)

**Don't:** No hardcoded hex in components. No white text on white bg. No colored backgrounds except accent tints.

---

## Layout

| Property | Value |
|----------|-------|
| Content max-width | 1120px |
| Content padding-x | 24px (mobile), 32px (tablet), 0 (desktop within max-w) |
| Section padding-y | 96px (mobile: 64px) |
| Grid columns | 12-col base |
| Grid gap | 1px (feature grid), 16px (pricing), 24px (general) |

**Framing:**
- Centered composition for hero + CTA
- 1px-gap grid for features (cells separated by bg showing through)
- Side-by-side for "how it works" / code section

---

## Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| 1 | 4px | Inline gaps, icon margins |
| 2 | 8px | Tight element spacing |
| 3 | 12px | Card internal gaps |
| 4 | 16px | Standard gap |
| 6 | 24px | Section internal padding |
| 8 | 32px | Card padding |
| 12 | 48px | Between content blocks |
| 16 | 64px | Section padding (mobile) |
| 24 | 96px | Section padding (desktop) |

---

## Buttons

| Variant | Styles |
|---------|--------|
| Primary | bg-emerald-500, text-#050505, rounded-full, px-6 py-3, font-medium text-[14px], hover:bg-emerald-400, active:scale-[0.98] |
| Secondary | border border-white/10, text-white/70, rounded-full, px-6 py-3, hover:border-white/20 hover:text-white |
| Ghost | text-white/50, hover:text-white, no border |

**Rules:**
- Always rounded-full (pill shape)
- Trailing arrow icon in its own circular wrapper (bg-black/10, size-7, rounded-full)
- Min touch target: 44px height
- active:scale-[0.98] on all buttons

---

## Icons
- **Set:** Lucide (project standard)
- **Size:** 16px in cards, 18px in features, 20px in hero
- **Weight:** strokeWidth={1.5}
- **Color:** text-emerald-500 for feature icons, text-white/40 for decorative

---

## Elevation & Depth

| Level | Treatment |
|-------|-----------|
| Base | bg-[#050505], no shadow |
| Card | bg-[#0a0a0a], border border-white/[0.06], no shadow |
| Elevated | bg-[#111111], border border-white/[0.08], shadow: 0 0 0 1px rgba(255,255,255,0.04) inset |
| Glow | box-shadow: 0 0 60px rgba(16,185,129,0.08) |
| Nav | backdrop-blur-xl, bg-[#050505]/80, border-b border-white/[0.06] |

**Double-bezel technique:** Outer shell (p-[1px], rounded-2xl, bg-gradient-to-b from-white/[0.08] to-transparent) → Inner content (rounded-[calc(1rem-1px)], bg-surface)

---

## Motion

| Property | Value |
|----------|-------|
| Duration (hover) | 200ms |
| Duration (enter) | 600ms |
| Duration (exit) | 150ms |
| Easing | cubic-bezier(0.32, 0.72, 0, 1) |
| Scroll reveal | translateY(20px) + opacity(0) → translateY(0) + opacity(1), 600ms, staggered 80ms |
| Button press | scale(0.98), 100ms |
| Nav blur | backdrop-blur-xl, transition on scroll |

**Don't:**
- No linear easing
- No animations longer than 800ms
- No layout-triggering animations (no width/height/top/left)
- No motion on mobile (prefers-reduced-motion respected)

---

## Do's and Don'ts

### Do
- Use the double-bezel on hero card and featured pricing
- Use 1px-gap grids for feature sections
- Use eyebrow badges (pill, uppercase, mono) above every heading
- Use emerald-500 sparingly — only CTAs, status dots, and icon accents
- Use Geist Mono for terminal blocks and eyebrows only
- Respect 60ch max line length
- Add subtle radial glow behind hero

### Don't
- No Inter, Roboto, or system fonts
- No thick borders (max 1px, always white/6 or white/8)
- No colored backgrounds (only tints at 8% opacity max)
- No generic shadow-md or shadow-lg
- No symmetrical 3-column grids without whitespace variation
- No sticky nav glued to top edge (use floating pill or mt-4 offset)
- No placeholder images or lorem ipsum
- No framer-motion (use CSS + GSAP only, per brand guidelines)
