# Indigo Dashboard — Page-by-Page Teardown
## Senior SaaS UI/UX Specialist Review

---

## 1. Dashboard Home (`/dashboard`) — 7.5/10

### What's Working
- **Parallel data fetching** with `Promise.all` (10 queries) — excellent server-side performance
- **Progressive disclosure**: Setup wizard → Hero → KPIs → Chart → Activity → Recent orders
- **Role-based visibility**: Revenue/AOV hidden from non-admin roles
- **Sparkline micro-charts** in metric cards — adds data density without clutter
- **Activity feed** merges orders + low stock alerts into unified timeline
- **Chart + sentence pattern** on revenue chart — declarative summary

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **No `<h1>` tag** — page title is in HeroSection component, not semantic | P1 | Add `<h1 className="sr-only">Dashboard</h1>` or make HeroSection render h1 |
| 2 | **DashboardClient (widget system) exists but is never rendered** — 224 lines of dead code. The `page.tsx` doesn't use it | P2 | Remove or integrate. Currently confusing |
| 3 | **Stripe Connect alert has no dismiss** — shows every load if not connected and setup checklist is hidden | P2 | Add dismiss with localStorage |
| 4 | **"Performance Grid" section is empty** — commented-out component, just an empty comment block in JSX | P1 | Remove the empty comment or render the component |
| 5 | **Activity feed has no "View All" link** — dead end | P2 | Add link to orders/notifications |
| 6 | **No date range selector** on dashboard home — can't compare periods | P2 | Add period toggle like Analytics page |
| 7 | **Setup wizard + setup checklist can show simultaneously** — wizard is a modal, checklist is inline | P1 | Coordinate: if wizard is open, hide checklist |

### Information Architecture
```
✅ Hero (greeting + today's stats)
✅ Stripe Connect CTA (conditional)
✅ Setup Checklist (conditional)
✅ 4x KPI Cards with sparklines
✅ Revenue Chart (2/3) + Activity Feed (1/3)
❌ Performance Grid (empty/removed)
✅ Recent Orders Table
```

**Verdict**: Strong foundation. The parallel fetch + progressive disclosure is Stripe-quality. But the dead code (DashboardClient, empty Performance Grid) and missing h1 need cleanup.

---

## 2. Products (`/dashboard/products`) — 8.0/10

### What's Working
- **4x stat cards** (Total, Active, Low Stock, Stock Value) — good KPI density
- **Inline filters** with colored dot indicators and counts — Shopify-quality
- **Active filter chips** with individual clear + "Clear all"
- **Bulk actions** via StickyBulkActionsBar (Set Active, Set Draft, Archive, Delete)
- **Hover-to-reveal** row actions (⋯ menu)
- **Product images** with fallback placeholder
- **Empty state** with context-aware messaging (filters active vs. no products)
- **Keyboard hint** "Press C to create a product"
- **CSV export** with proper date formatting
- **`tabular-nums`** on prices

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **No `<h1>` or page title** — jumps straight to stat cards | P0 | Add `<h1>` "Products" with count |
| 2 | **No `<PageHeader>` component** — hand-rolled layout | P1 | Adopt `<PageHeader>` for consistency |
| 3 | **Import button does nothing** — `onClick` not wired to `setImportDialogOpen(true)` | P1 | Wire the onClick handler |
| 4 | **Search icon uses `/70` opacity** — `text-muted-foreground/70` potential contrast issue | P2 | Use full `text-muted-foreground` |
| 5 | **Table not wrapped in `<Card>`** — inconsistent with Customers page which wraps table in Card | P2 | Wrap in Card for visual consistency |
| 6 | **No column sorting** — Customers has sortable columns, Products doesn't | P2 | Add sort on Name, Price, Stock, Date |
| 7 | **Refresh button has no `aria-label`** | P1 | Add `aria-label="Refresh products"` |
| 8 | **Filter chip close button is 4x4px** — `h-4 w-4 p-0` is too small for touch targets (min 44px) | P1 | Increase to at least `h-6 w-6` |

### Data Density Score: 8/10
Good use of space. Stats → Filters → Table → Pagination is the right flow. Missing title is the main gap.

---

## 3. Orders (`/dashboard/orders`) — 8.5/10 ⭐ Best Page

### What's Working
- **AI Insights Panel** with animated expand/collapse — unique differentiator
- **Noise gradient background** on AI panel — premium feel
- **Date range picker** with presets (Today, 7d, 30d, 90d)
- **Active filter chips** with clear individual/all
- **Floating bulk action bar** (fixed bottom center) — Figma/Linear pattern
- **Order status badges** with icons (Clock, CheckCircle, Package, Truck)
- **Payment status badges** with semantic colors
- **Skeleton loading state** during filter transitions — no layout shift
- **`sr-only` labels** on action buttons — accessibility done right here
- **`tabular-nums`** on totals and item counts
- **Relative timestamps** with tooltip for exact date

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **Hardcoded growth percentages** — "+12%", "+8.2%", "+15%" in StatCards are fake | P0 | Calculate from actual data or remove |
| 2 | **`text-muted-foreground/70`** used 5 times — contrast concern | P2 | Use full `text-muted-foreground` |
| 3 | **`text-foreground/70`** and `text-foreground/80`** — non-standard opacity tokens | P2 | Use `text-muted-foreground` or `text-foreground` |
| 4 | **Custom pagination** instead of `DataTablePagination` — inconsistent with Products/Customers | P2 | Use shared pagination component |
| 5 | **"Print invoice" and "Email customer" show "coming soon" toast** — frustrating UX | P2 | Either implement or hide behind feature flag |
| 6 | **Bulk action bar uses `<Card>` with `shadow-lg`** — violates design system (max shadow-sm) | P1 | Change to `shadow-sm` or `shadow` |
| 7 | **1111 lines** — largest client component, should be split | P3 | Extract StatCard, AIInsightsPanel, OrderTableRow into separate files |

### Data Density Score: 9/10
The best page in the app. AI insights + floating bulk bar + skeleton loading is Linear-quality. Fix the fake percentages.

---

## 4. Customers (`/dashboard/customers`) — 7.5/10

### What's Working
- **6x stat cards** in a single row — high data density
- **Sortable columns** (Customer, Joined) with visual indicators
- **Avatar with initials** fallback
- **Relative timestamps** with tooltip for exact date
- **Marketing status badges** with dot indicators
- **Clickable rows** — entire row navigates to detail
- **`tabular-nums`** on orders count and total spent
- **Bulk subscribe/unsubscribe** actions

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **6 stat cards in one row** — too many on mobile, `grid-cols-2 lg:grid-cols-6` means 3 rows on mobile | P2 | Use `lg:grid-cols-3` with 2 rows, or collapse to 4 key metrics |
| 2 | **Filters wrapped in `<Card>`** — Products doesn't wrap filters in Card. Inconsistent | P2 | Standardize: either all pages wrap filters in Card or none do |
| 3 | **StickyBulkActionsBar inside filter Card** — bulk bar should be at page level, not nested in filter card | P1 | Move outside the Card |
| 4 | **No "Add Customer" button** — Products has "Add Product", Orders has "Create Order", but Customers has no create action | P2 | Add manual customer creation |
| 5 | **Delete action available for customers with 0 orders only** — good guard, but error message is a toast, not inline | Low | Fine as-is |
| 6 | **No export format options** — just CSV, no option for other formats | P3 | Low priority |

### Data Density Score: 7.5/10
Good density but the 6-card stat row is excessive. 4 cards would be more focused.

---

## 5. Inventory (`/dashboard/inventory`) — 7.0/10

### What's Working
- **6x stat cards** with clear stock health breakdown
- **Stock Health progress bar** with legend (Healthy/Low/Out)
- **Recent Activity timeline** with directional arrows (↑ add, ↓ remove)
- **AI Forecast + Recommendations widgets** — unique value-add
- **Stock level indicator** (progress bar) per product
- **Inline stock adjustment** via dialog
- **Bulk stock adjustment** (add/remove with reason)

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **No `EmptyState` component** — uses inline HTML for empty state | P1 | Replace with `<EmptyState>` component |
| 2 | **`stat-value` class on individual stock quantities** in table cells — 28px font for a table cell number is too large | P1 | Use regular `font-medium tabular-nums` for table data |
| 3 | **Stock badge AND stock level indicator** shown for each row — redundant | P2 | Show one or the other, not both |
| 4 | **`useMemo` used as `useEffect`** — `useMemo(() => { setLocalProducts(products) }, [products])` is a side effect in useMemo | P1 | Change to `useEffect` |
| 5 | **Manual checkbox state** instead of `useBulkActions` hook — Products/Customers use the hook, Inventory doesn't | P2 | Migrate to `useBulkActions` for consistency |
| 6 | **Refresh button is `h-9 w-9`** but uses `size="sm"` — conflicting sizing | P2 | Use `size="icon-sm"` |
| 7 | **`text-label`** class used instead of `stat-label` — inconsistent with other pages | P1 | Standardize to `stat-label` |
| 8 | **6 stat cards + Stock Health card + Recent Activity + 2 AI widgets** before the table — too much above-the-fold content before the primary data | P2 | Move AI widgets below table, or collapse into accordion |

### Data Density Score: 6.5/10
Paradoxically, there's TOO MUCH above the table. The user has to scroll past 4 sections before seeing inventory data. Invert the hierarchy.

---

## 6. Analytics (`/dashboard/analytics`) — 7.5/10

### What's Working
- **5x KPI cards** with change badges (↑/↓ percentage)
- **Date range selector** with 6 presets
- **Free tier banner** with upgrade CTA — good monetization pattern
- **Revenue chart** (2/3 width) + Orders by Status (1/3) — good layout
- **Top Products** with images, rank numbers, and revenue
- **Revenue by Category** with donut chart + legend
- **Customer Segments** with progress bars
- **Recent Orders** with status badges and links

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **`text-muted-foreground/50`** on 5 empty state icons — fails WCAG contrast | P0 | Use `text-muted-foreground` |
| 2 | **`text-label`** class used instead of `stat-label`** — same issue as Inventory | P1 | Standardize |
| 3 | **No loading skeleton** during date range change — `isPending` only disables the refresh button | P2 | Show skeleton overlay during transition |
| 4 | **Empty states are inline HTML** — not using `<EmptyState>` component | P2 | Migrate to component |
| 5 | **5 KPI cards** — `grid-cols-2 lg:grid-cols-5` means 3 rows on mobile with one orphan card | P2 | Use 4 cards (drop Conversion to a secondary section) |
| 6 | **No comparison period** — shows change % but no "vs last period" context | P2 | Add "vs previous 30 days" label |

### Data Density Score: 8/10
Well-structured analytics page. The 2/3 + 1/3 chart layout is Stripe-quality. Fix the contrast issues and orphan card.

---

## 7. Marketing (`/dashboard/marketing`) — 7.0/10

### What's Working
- **4x stat cards** — focused metrics
- **4x quick action cards** with icons and arrow links — good navigation hub
- **Discount list** with code, type icon, usage progress bar, status badge
- **Copy code button** inline — nice micro-interaction
- **Campaign list** with open rate stats
- **Activity timeline** with connecting lines
- **"Coming Soon" for Automations** — honest about roadmap

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **Stat card labels use `text-sm text-muted-foreground`** instead of `stat-label` class | P1 | Standardize |
| 2 | **No search or filtering** on discounts/campaigns | P2 | Add search for stores with many discounts |
| 3 | **"Coming soon" card is `opacity-60 cursor-not-allowed`** — looks broken, not intentional | P2 | Use a proper disabled state with explanation |
| 4 | **Discount edit links all go to `/dashboard/marketing/discounts`** (list page) not to specific discount | P1 | Link to `/dashboard/marketing/discounts/${id}` |
| 5 | **No pagination** on discounts — shows first 5 with "View All" | Low | Fine for now |

### Data Density Score: 7/10
Good hub page. The quick actions grid is a nice pattern. Needs search for scale.

---

## 8. Finances (`/dashboard/finances`) — 6.5/10

### What's Working
- **Period toggle** (30d / 90d / 12m) — clean, minimal
- **4x KPI cards** with proper stat classes
- **Revenue breakdown** with line items (Gross, Refunds, Tax, Shipping, Discounts → Net)
- **Monthly breakdown table** — clean, scannable

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **No empty state** — if no orders exist, shows $0.00 everywhere with no guidance | P1 | Add empty state: "No financial data yet. Revenue will appear when you receive your first order." |
| 2 | **No chart/visualization** — just numbers and a table. Analytics has charts, Finances doesn't | P2 | Add a simple revenue trend line |
| 3 | **CardHeader layout** uses `flex flex-row items-center justify-between pb-2` for stat cards — different pattern than other pages | P2 | Standardize to match Products/Customers stat card layout |
| 4 | **No export** — Analytics has export, Finances doesn't | P2 | Add CSV export for financial reports |
| 5 | **163 lines** — the simplest page. Could be richer | P3 | Add: payment method breakdown, refund rate trend, tax summary |

### Data Density Score: 6/10
Too sparse for a finance page. Shopify's finances page has charts, payment method breakdown, and payout schedules. This needs more depth.

---

## 9. Reviews (`/dashboard/reviews`) — 7.0/10

### What's Working
- **AI sentiment analysis** integration — unique differentiator
- **5x stat cards** (Total, Avg Rating, Positive, Negative, Pending)
- **Star rating visualization** in stat card
- **Tabs** (All / Pending / Flagged) with count badges
- **Sentiment filter + Status filter + Search** — good filtering
- **Bulk approve** pending reviews
- **Sentiment guide** sidebar — helpful for understanding AI labels
- **ReviewSentimentSummary** component in sidebar

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **Title uses `stat-value` class** — `<h1 className="stat-value">Reviews</h1>` renders at 28px with tabular-nums. Wrong class for a page title | P0 | Use `text-xl font-semibold tracking-tight` |
| 2 | **`text-muted-foreground/30`** on empty state star icon — nearly invisible | P0 | Use `text-muted-foreground` |
| 3 | **`text-muted-foreground/70`** and `text-foreground/70`** throughout — contrast issues | P1 | Remove opacity modifiers |
| 4 | **Icons in stat cards are `h-8 w-8`** — oversized vs. design system `h-5 w-5` in `h-9 w-9` container | P1 | Reduce to `h-5 w-5` in `h-9 w-9` container |
| 5 | **Empty states are inline HTML** — not using `<EmptyState>` component | P2 | Migrate |
| 6 | **`pt-4` on CardContent** instead of `p-4` — inconsistent padding | P2 | Standardize |
| 7 | **No pagination** — all reviews loaded at once | P2 | Add pagination for scale |

### Data Density Score: 7/10
Good feature set with AI sentiment. The sidebar layout (2/3 + 1/3) works well. Fix the class misuse and contrast issues.

---

## 10. Pages (`/dashboard/pages`) — 6.0/10

### What's Working
- **Simple, focused** — list view + inline editor
- **Published/Draft badges** with Eye/EyeOff icons
- **Character count** shown per page
- **Markdown support** mentioned in placeholder
- **Back button** on editor view — good navigation

### UX Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | **No empty state** — if no pages exist, shows empty card | P1 | Add EmptyState: "No pages yet. Create your first page." |
| 2 | **No "Create Page" button** — can only edit existing pages | P1 | Add create functionality |
| 3 | **Plain `<Textarea>` for content** — no rich text editor, no markdown preview | P2 | Add at minimum a preview toggle |
| 4 | **No auto-save** — only manual save button | P2 | Add auto-save or "unsaved changes" warning |
| 5 | **No SEO fields** — no meta title, meta description, or slug editing | P2 | Add SEO section |
| 6 | **`pt-6` on editor CardContent** — should be `p-4` per design system | P1 | Fix padding |
| 7 | **154 lines** — minimal page, needs more features to be useful | P3 | Add: preview, SEO, scheduling, templates |

### Data Density Score: 5/10
Too basic. This is a v0.1 page editor. Needs rich text, preview, SEO fields, and create functionality to be production-ready.

---

## Cross-Page Consistency Issues

### Pattern Inconsistencies Found

| Pattern | Products | Orders | Customers | Inventory | Analytics | Marketing | Finances | Reviews | Pages |
|---------|----------|--------|-----------|-----------|-----------|-----------|----------|---------|-------|
| `<h1>` tag | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ wrong class | ✅ |
| `<PageHeader>` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `stat-label` class | ✅ | ✅ | ✅ | ❌ `text-label` | ❌ `text-label` | ❌ `text-sm` | ✅ | ✅ | N/A |
| Table in `<Card>` | ❌ | ❌ | ✅ | ❌ | N/A | N/A | ✅ | N/A | N/A |
| `useBulkActions` hook | ✅ | ✅ | ✅ | ❌ manual | N/A | N/A | N/A | N/A | N/A |
| `DataTablePagination` | ✅ | ❌ custom | ✅ | ✅ | N/A | N/A | N/A | N/A | N/A |
| `EmptyState` component | ✅ | ✅ | ✅ | ❌ inline | ❌ inline | ✅ | ❌ none | ❌ inline | ❌ none |
| Filter chip pattern | ✅ | ✅ | ❌ | ❌ | N/A | ❌ | N/A | ❌ | N/A |
| Stat card icon size | `h-5 w-5` | `h-4 w-4` | `h-5 w-5` | `h-5 w-5` | `h-5 w-5` | `h-5 w-5` | `h-4 w-4` | `h-8 w-8` ⚠️ | N/A |

### Top 5 Cross-Page Fixes (Highest Impact)

1. **Adopt `<PageHeader>` everywhere** — 0 of 9 pages use it despite it being created this session
2. **Standardize stat label class** — `stat-label` vs `text-label` vs `text-sm text-muted-foreground`
3. **Standardize table wrapping** — decide: Card or no Card around tables
4. **Migrate all inline empty states to `<EmptyState>` component**
5. **Standardize pagination** — use `DataTablePagination` everywhere

---

## Page Rankings (Best to Worst)

1. **Orders** — 8.5/10 ⭐ (AI insights, floating bulk bar, skeleton loading)
2. **Products** — 8.0/10 (filter chips, bulk actions, keyboard hints)
3. **Dashboard Home** — 7.5/10 (parallel fetch, progressive disclosure, sparklines)
4. **Analytics** — 7.5/10 (date range, charts, customer segments)
5. **Customers** — 7.5/10 (sortable columns, clickable rows, avatars)
6. **Marketing** — 7.0/10 (hub layout, discount management, activity timeline)
7. **Inventory** — 7.0/10 (stock health, AI widgets, but too much above table)
8. **Reviews** — 7.0/10 (AI sentiment, tabs, but wrong classes)
9. **Finances** — 6.5/10 (clean but too sparse)
10. **Pages** — 6.0/10 (too basic, needs rich editor)
