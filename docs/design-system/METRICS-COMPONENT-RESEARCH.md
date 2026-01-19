# Metrics Component Design Research

## Overview

This document compiles research on how Vercel, Geist, and shadcn/ui design their metric/KPI card components, including best practices from industry leaders.

---

## 1. Vercel/Geist Design System Patterns

### Typography System (from [vercel.com/geist/typography](https://vercel.com/geist/typography))

Geist uses a structured typography system with specific classes:

| Style | Class | Usage |
|-------|-------|-------|
| Heading 32 | `text-heading-32` | Dashboard headings |
| Heading 24 | `text-heading-24` | Section headings |
| Label 14 Strong | `text-label-14` | Most common text, menus |
| Label 13 Tabular | `text-label-13` | Numbers for consistent spacing |
| Label 12 | `text-label-12` | Tertiary text, secondary info |
| Copy 14 | `text-copy-14` | Most commonly used body text |

**Key Insight**: Use `tabular-nums` (Label 13 Tabular) when displaying numbers for consistent spacing alignment.

### Materials/Surfaces (from [vercel.com/geist/materials](https://vercel.com/geist/materials))

| Material | Class | Usage | Radius |
|----------|-------|-------|--------|
| Base | `material-base` | Everyday use | 6px |
| Small | `material-small` | Slightly raised | 6px |
| Medium | `material-medium` | Further raised | 12px |
| Large | `material-large` | Further raised | 12px |
| Tooltip | `material-tooltip` | Lightest shadow | 6px |
| Menu | `material-menu` | Lift from page | 12px |
| Modal | `material-modal` | Further lift | 12px |

### Vercel Dashboard Patterns

From Vercel's usage dashboard ([source](https://vercel.com/blog/sophisticated-usage-dashboard)):
- Visualizes usage data for Teams
- Shows resource usage down to specific projects
- Uses clear visual hierarchy
- Provides granular data views

---

## 2. shadcn/ui Metric Card Patterns

### Building Custom MetricCard (from [Vercel Academy](https://vercel.com/academy/shadcn-ui/extending-shadcn-ui-with-custom-components))

**Consistency Pillars for Custom Components:**
1. Visual consistency through shared design tokens
2. Behavioral consistency via similar APIs
3. Accessibility consistency (WCAG, ARIA)
4. Theming consistency through CSS custom properties
5. Developer experience with TypeScript support

**MetricCard Component Structure:**
```tsx
interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: number[];
  href?: string;
}
```

**Key Patterns:**
- Extend `React.HTMLAttributes<HTMLDivElement>` for native behavior
- Use `class-variance-authority` (cva) for variant styling
- Include helper functions for data formatting
- Support trend visualization (sparklines)

### Stats Block Patterns (from [shadcn.io/blocks/stats-01](https://www.shadcn.io/blocks/stats-01))

**Features:**
- Four connected stat cards in horizontal bar
- Metric values with change percentages
- Positive/negative indicators
- Connected layout for visual unity
- Clean and scannable design

**Use Cases:**
- Financial dashboards
- Admin panels
- KPI displays

### Chart Integration (from [ui.shadcn.com/docs/components/chart](https://ui.shadcn.com/docs/components/chart))

**Built on Recharts with composition in mind:**
```tsx
import { Bar, BarChart } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export function MyChart() {
  return (
    <ChartContainer>
      <BarChart data={data}>
        <Bar dataKey="value" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
```

**Chart Config Pattern:**
```tsx
const chartConfig = {
  desktop: {
    label: "Desktop",
    icon: Monitor,
    color: "#2563eb",
    // OR theme object
    theme: {
      light: "#2563eb",
      dark: "#dc2626",
    },
  },
} satisfies ChartConfig
```

**Color Usage:**
- Reference colors using `var(--color-KEY)`
- Components: `<Bar fill="var(--color-desktop)" />`
- Tailwind: `className="fill-[--color-desktop]"`

---

## 3. KPI Card Anatomy (from [nastengraph.substack.com](https://nastengraph.substack.com/p/anatomy-of-the-kpi-card))

### Essential Elements

Every KPI card MUST include:

1. **Date Period** - Timeframe for the metric (don't make users guess)
2. **Metric Name** - Simple, easy-to-read (e.g., "Orders" not "Total Number of Orders")
3. **Metric Value** - The core data point, prominently displayed
4. **Context** - Helps users understand if value is good/bad:
   - Period-over-period changes
   - Comparisons with averages
   - Target values
5. **Sparkline** - Quick overview of the trend

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│  [Icon]  Metric Name                │  ← Secondary (smaller)
│                                     │
│  $12,345.67                         │  ← Primary (largest, bold)
│                                     │
│  ↑ 12.5% vs last month              │  ← Context (color-coded)
│                                     │
│  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁                    │  ← Sparkline (trend)
└─────────────────────────────────────┘
```

### Context Options

| Type | When to Use |
|------|-------------|
| Period-over-period | Comparing to previous period |
| Target comparison | When goals are defined |
| Average comparison | For benchmarking |
| Dimension breakdown | When factors affect the metric |

### Color Coding Rules

- **Green** = Positive change (increase in revenue, decrease in errors)
- **Red** = Negative change
- **Neutral/Gray** = No change or informational
- **Consistency is key** - Don't show green when data is declining

---

## 4. Material Tailwind KPI Patterns (from [material-tailwind.com](https://www.material-tailwind.com/blocks/kpi-cards))

### KPI Card Variants

1. **KPI Cards with Arrow**
   - Arrow indicator showing percentage change
   - Clear up/down direction

2. **KPI Cards with Badge**
   - Badge elements instead of arrows
   - Good for categorical status

3. **KPI Cards with Icon**
   - Descriptive icons
   - Explanatory text for clarity

4. **KPI Cards with CTA**
   - Title with subtitle
   - Call-to-action button
   - Value, label, description, icon

5. **KPI Cards with Chart and CTA**
   - Trend graph (sparkline/area chart)
   - Visual representation of change over time
   - Easy to spot trends at a glance

6. **KPI Cards with Progress Bar**
   - Progress bar with target values
   - Clear reference point
   - Last update date for data freshness

7. **Complex KPI Cards**
   - Visual grouping
   - Icons, descriptions, indicators
   - Quick comparison of different KPIs

---

## 5. Dashboard Design Best Practices

### Layout Rules

- **Use up to 4 metrics per row** for optimal readability
- **Limit to 3-5 key metrics** per dashboard view
- **Build clear visual narrative** - guide the eye
- **Consistent UI rules** across all cards

### Typography Best Practices

- **Sans-serif fonts** for data visualization (cleaner, easier to skim)
- **Tabular numbers** for consistent alignment
- **Clear hierarchy**: Large for value, medium for label, small for context
- **Geist font family** - designed for developers, emphasizes readability

### Color Best Practices

- **High contrast** for accessibility
- **Semantic colors** for status (green=good, red=bad, amber=warning)
- **Consistent palette** across all metrics
- **Don't rely on color alone** - use icons/text too

### Spacing Best Practices

- **Consistent padding** within cards
- **Adequate white space** between elements
- **Aligned elements** for visual harmony
- **4px base unit** (Geist standard)

---

## 6. Recommended Implementation

### MetricCard Component Structure

```tsx
interface MetricCardProps {
  // Core
  label: string;
  value: string | number;
  
  // Context
  change?: number;
  changeLabel?: string;
  
  // Visual
  icon?: string; // Icon name for serialization
  iconColor?: string; // CSS variable name
  
  // Trend
  sparklineData?: number[];
  
  // Interaction
  href?: string;
}
```

### Sizing Guidelines

| Element | Size | Tailwind |
|---------|------|----------|
| Card padding | 16-24px | `p-4` to `p-6` |
| Icon container | 40-48px | `h-10 w-10` to `h-12 w-12` |
| Icon | 20-24px | `h-5 w-5` to `h-6 w-6` |
| Value text | 24-30px | `text-2xl` to `text-3xl` |
| Label text | 14px | `text-sm` |
| Change badge | 20px height | `h-5` |
| Sparkline | 32px height | `h-8` |

### Color Variables (OKLCH)

```css
/* Status Colors */
--ds-green-100: oklch(0.95 0.05 145);  /* Success bg */
--ds-green-800: oklch(0.35 0.12 145);  /* Success text */
--ds-red-100: oklch(0.95 0.05 25);     /* Error bg */
--ds-red-800: oklch(0.35 0.15 25);     /* Error text */
--ds-amber-100: oklch(0.95 0.05 85);   /* Warning bg */
--ds-amber-800: oklch(0.40 0.12 85);   /* Warning text */

/* Chart Colors (perceptually uniform) */
--ds-chart-1: oklch(0.65 0.15 240);    /* Blue */
--ds-chart-2: oklch(0.65 0.15 155);    /* Green */
--ds-chart-3: oklch(0.65 0.15 55);     /* Orange */
--ds-chart-4: oklch(0.65 0.15 300);    /* Purple */
--ds-chart-5: oklch(0.65 0.15 25);     /* Red */
```

### Accessibility Requirements

1. **Keyboard navigation** - All interactive elements focusable
2. **Screen reader support** - Proper ARIA labels
3. **Color contrast** - Meet WCAG AA (prefer APCA)
4. **Not color-only** - Use icons/text with colors
5. **Tabular numbers** - For consistent reading

---

## 7. Example Implementation

### Basic Metric Card

```tsx
<Card className="border-[var(--ds-gray-200)]">
  <CardContent className="p-6">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--ds-gray-600)]">
          Revenue
        </p>
        <div className="h-10 w-10 rounded-lg bg-[var(--ds-chart-2)]/10 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-[var(--ds-chart-2)]" />
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-[var(--ds-gray-1000)] tabular-nums">
        $12,345.67
      </p>

      {/* Change */}
      <div className="flex items-center gap-2">
        <Badge className="h-5 px-2 gap-1 bg-[var(--ds-green-100)] text-[var(--ds-green-800)]">
          <ArrowUp className="h-3 w-3" />
          12.5%
        </Badge>
        <span className="text-xs text-[var(--ds-gray-500)]">
          vs last month
        </span>
      </div>

      {/* Sparkline */}
      <MiniSparkline data={[10, 15, 12, 18, 22, 25, 28]} />
    </div>
  </CardContent>
</Card>
```

### Sparkline Component

```tsx
function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--ds-brand-600)]/30"
      />
    </svg>
  );
}
```

---

## 8. Sources

1. [Vercel Geist Typography](https://vercel.com/geist/typography)
2. [Vercel Geist Materials](https://vercel.com/geist/materials)
3. [Vercel Academy - Extending shadcn/ui](https://vercel.com/academy/shadcn-ui/extending-shadcn-ui-with-custom-components)
4. [shadcn/ui Charts Documentation](https://ui.shadcn.com/docs/components/chart)
5. [shadcn.io Stats Blocks](https://www.shadcn.io/blocks/stats-01)
6. [Anatomy of the KPI Card](https://nastengraph.substack.com/p/anatomy-of-the-kpi-card)
7. [Material Tailwind KPI Cards](https://www.material-tailwind.com/blocks/kpi-cards)
8. [Horizon UI Statistics](https://horizon-ui.com/docs-boilerplate/shadcn-components/statistics)

---

## Summary

The best metric cards follow these principles:

1. **Clear hierarchy** - Value is most prominent, then label, then context
2. **Contextual information** - Always show comparison/trend data
3. **Visual indicators** - Icons, colors, sparklines for quick scanning
4. **Consistent styling** - Use design tokens, not arbitrary values
5. **Accessible** - Keyboard nav, screen readers, color contrast
6. **Tabular numbers** - For consistent alignment of numeric values
7. **Semantic colors** - Green=good, Red=bad, Amber=warning
8. **Minimal decoration** - Let the data speak

Content was rephrased for compliance with licensing restrictions.
