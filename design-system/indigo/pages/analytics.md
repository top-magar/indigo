# Analytics Page — Design Overrides

> Overrides `MASTER.md` for `/dashboard/analytics` and `/dashboard/finances` (tabbed together).

## Style: Data-Dense Dashboard

These pages prioritize information density over whitespace.

### Layout
- Stat cards in 2x2 or 4-column grid at top
- Full-width chart below stats
- Date range picker in page header (right-aligned)
- Both pages must use the same date picker component and card styles

### Charts
- Primary chart: Line/Area chart for revenue trends (Recharts)
- Use `chart-1` through `chart-5` tokens for series colors
- Hover tooltips on all data points
- Fill area with 20% opacity of line color
- Forecast data: dashed line, distinct from actual

### Stat Cards
- `font-mono tabular-nums` for all numeric values
- Trend indicator: green up arrow / red down arrow + percentage
- Compact: no description text, just label + value + trend

### Finances Tab Specifics
- Table-heavy layout (transactions, payouts)
- Row hover highlighting
- Currency formatting: NPR with `formatCurrency()` utility
- Status badges for payment states (pending/completed/failed)

### Anti-Patterns for This Page
- ❌ Pie charts for time-series data
- ❌ 3D chart effects
- ❌ Auto-refreshing without user control
- ❌ Different card heights in the stat grid
