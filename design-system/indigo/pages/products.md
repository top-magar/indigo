# Products Page — Design Overrides

> Overrides `MASTER.md` for `/dashboard/products` and all PRODUCT_TABS pages
> (Products, Collections, Categories, Attributes, Gift Cards).

## Layout
- Section tabs at top (5 tabs max)
- Filter bar below tabs (search + status dropdown + sort)
- Data table or card grid (user-toggleable view)

### Product List
- Table view default on desktop, card grid on mobile
- Product image thumbnail: 40x40px rounded-md
- Status badge inline (active/draft/archived)
- Price in `font-mono tabular-nums`
- Bulk action bar appears on selection (sticky bottom)

### Product Detail / Edit
- Two-column layout: main content (left 2/3) + sidebar (right 1/3)
- Sidebar: status, organization (category, tags), pricing
- Main: title, description (rich text), media, variants
- Savebar at bottom (Saleor pattern): Save / Discard / Delete

### Collections & Categories
- Drag-and-drop reordering where applicable
- Nested categories: indented tree view
- Collection rules: filter builder UI

### Gift Cards
- Card-style display (mimics physical gift card)
- Balance prominently displayed in `font-mono text-lg`
- Status: active/disabled/expired with color-coded badges

### Anti-Patterns for This Page
- ❌ Modal for product creation (use full page)
- ❌ Infinite scroll without "load more" button alternative
- ❌ Image upload without drag-and-drop
- ❌ Price inputs without currency symbol prefix
