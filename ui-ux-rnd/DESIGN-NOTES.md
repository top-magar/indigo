# UI/UX R&D — E-Commerce Dashboard Redesign

## Reference Analysis (9 images)

### Color System
| Token     | Value      | Usage                        |
|-----------|------------|------------------------------|
| bg        | `#111118`  | Page background              |
| bg-card   | `#1c1c27`  | Card surfaces                |
| lime      | `#b8f25c`  | Revenue, success, primary CTA|
| purple    | `#b07cff`  | Orders, shipped, activity    |
| coral     | `#ff7c7c`  | Errors, cancelled, alerts    |
| yellow    | `#ffd84d`  | Processing, warnings         |
| teal      | `#5ce0d8`  | Customers, secondary metrics |
| pink      | `#ff8ec4`  | Highlights, badges           |

### Layout Pattern: 3-Column Shell
```
┌──────┬──────────────────────────┬──────────┐
│ 72px │       Main Content       │  340px   │
│ Icon │    (Bento Grid 4-col)    │  Right   │
│ Nav  │                          │  Panel   │
│      │  ┌──┬──┬──┬──┐          │  Tasks   │
│      │  │K1│K2│K3│K4│  KPIs    │  Activity│
│      │  ├──┴──┼──┴──┤          │          │
│      │  │Chart│Donut│  2+2     │          │
│      │  ├──┴──┼──┴──┤          │          │
│      │  │Orders│Perf│  2+2     │          │
│      │  └─────┴─────┘          │          │
└──────┴──────────────────────────┴──────────┘
```

### Key Design Patterns Extracted

1. **Pill-shaped controls** — Segmented tabs (Card/Block/Table, Daily/Weekly/Monthly)
2. **Colored icon squares** — Each KPI gets a tinted bg icon (lime, purple, teal, yellow)
3. **Mini bar charts** — Inside KPI cards, last bar highlighted in accent color
4. **Donut ring chart** — For order status breakdown with center total
5. **Gauge arc** — Semi-circle for completion rate with gradient (red→yellow→green)
6. **Colored task cards** — Each task gets a distinct tinted background
7. **Status pills** — Colored dot + label in rounded pill
8. **Avatar clusters** — Overlapping circles for team/assignees
9. **Activity bars** — Weekly bar chart in right panel
10. **Hover lift** — Cards lift 2px + shadow on hover

### Typography Scale
| Element      | Size  | Weight |
|-------------|-------|--------|
| KPI value   | 32px  | 800    |
| Card title  | 15px  | 600    |
| Section h2  | 22px  | 700    |
| Label       | 12px  | 500    |
| Caption     | 11px  | 400    |

### Border Radius
- Cards: 18px
- Inner elements: 12px
- Pills/badges: 999px (full)
- Mini bars: 3px

## Files
- `index.html` — Full prototype (open in browser)
- `styles.css` — All styles, CSS custom properties
- `DESIGN-NOTES.md` — This file

## How to View
```bash
open ui-ux-rnd/index.html
```

## Next Steps
- [ ] Get feedback on color palette and layout density
- [ ] Decide which patterns to port to the Next.js app
- [ ] Map prototype tokens → Tailwind CSS variables in globals.css
- [ ] Build React components matching this prototype
