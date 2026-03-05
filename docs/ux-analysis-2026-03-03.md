# Indigo Platform — Deep UX & Feature Analysis

## Honest Assessment

**Overall verdict: Indigo is 75-80% of a production-ready ecommerce admin.** The core CRUD operations are solid, the navigation is logical, and the AI features are genuinely differentiating. But there are meaningful gaps compared to Shopify/Saleor/WooCommerce that would frustrate real merchants.

---

## ✅ What Indigo Does Well

### 1. Navigation Structure — GOOD
The 3-section sidebar (Overview → Content → Marketing) is cleaner than Shopify's flat list. Nesting Inventory/Attributes under Products is correct — Shopify does the same. The collapsible sub-items prevent overwhelm.

**Compared to Shopify's sidebar:**
```
Shopify:  Home | Orders | Products | Customers | Content | Finances | Analytics | Marketing | Discounts
Indigo:   Dashboard | Orders | Products | Customers | Media | Reviews | Marketing | Analytics | Settings
```
Indigo's grouping is actually tighter. Shopify separates Discounts from Marketing — Indigo correctly nests them.

### 2. Product Management — STRONG
- Full CRUD with variants, media, SEO, organization
- Bulk operations (delete, status, price, tags, categories)
- Product import via CSV
- Autosave drafts
- Completion percentage indicator
- AI-powered copy generation and translation

### 3. Order Management — STRONG
- Full lifecycle: create → fulfill → ship → deliver
- Fulfillment tracking with carrier info
- Refunds and returns with store credits
- Invoice generation and sending
- AI-powered order insights and recommendations
- Export with filters

### 4. AI Integration — DIFFERENTIATOR
This is where Indigo genuinely stands out vs competitors:
- AI content generation (product descriptions, SEO)
- AI-powered search (OpenSearch + Bedrock)
- AI recommendations engine
- AI media analysis (Rekognition)
- AI translation (multi-language)
- AI insights dashboard
- Visual editor with AI context menu

No other open-source ecommerce platform has this depth of AI integration.

### 5. Developer Experience — STRONG
- Multi-tenant architecture from day one
- Role-based access (owner/admin/staff)
- Visual storefront editor
- Command palette (Cmd+K)
- Setup wizard for first-time users
- Error boundaries on every route

---

## ❌ Critical Gaps (Would Block Real Merchants)

### Gap 1: NO Draft Orders
**Severity: HIGH**
Every major platform has draft orders — orders created manually by staff (phone orders, wholesale, custom quotes). Shopify, WooCommerce, Saleor all have this. Indigo has zero draft order functionality.

**Impact:** Merchants who take phone orders or do B2B can't use Indigo.

### Gap 2: NO Abandoned Checkout Recovery
**Severity: HIGH**
Shopify shows abandoned checkouts prominently in the Orders section. This is one of the highest-ROI features in ecommerce — recovering 5-15% of abandoned carts via email. Indigo has no abandoned cart tracking or recovery emails.

**Impact:** Merchants lose significant revenue with no way to recover it.

### Gap 3: NO Gift Cards
**Severity: MEDIUM-HIGH**
Shopify, WooCommerce, and Saleor all support gift cards as a product type. Indigo has no gift card system — no creation, no redemption, no balance tracking.

**Impact:** Missing a standard revenue stream and customer retention tool.

### Gap 4: NO Tax Configuration
**Severity: HIGH**
There's no tax settings page, no tax rate management, no tax-inclusive pricing toggle, no tax exemptions. Shopify has automatic tax calculation by region. Indigo appears to have zero tax handling.

**Impact:** Merchants in any jurisdiction with sales tax can't legally operate.

### Gap 5: NO Proper Notification Center
**Severity: MEDIUM**
The dashboard header has a notification bell icon, but there's no actual notification feed, no real-time order alerts, no low-stock alerts pushed to the UI. The notification settings page exists but only manages email preferences.

**Impact:** Merchants miss time-sensitive events (new orders, low stock, failed payments).

### Gap 6: Weak Customer Detail Page
**Severity: MEDIUM**
The customer detail page is only 46 lines — likely just a data display. Shopify's customer detail shows: order history, lifetime value, tags, notes, timeline, addresses, tax exemptions, marketing consent, and metafields. Indigo likely shows basic info only.

**Impact:** Staff can't get a full picture of a customer relationship.

---

## ⚠️ Workflow Issues (Usable But Friction-Heavy)

### Issue 1: Order → Fulfillment Flow
The fulfillment actions exist (create, track, ship, approve, cancel) but the UX flow isn't clear. Shopify has a clear visual pipeline: Unfulfilled → Partially Fulfilled → Fulfilled, with one-click "Fulfill items" buttons. Indigo likely requires navigating to the order detail and using action menus.

**Recommendation:** Add fulfillment status badges to the orders list, and a "Fulfill" quick action button.

### Issue 2: No Finances Section
Shopify has a dedicated "Finances" section showing: payouts, billing, balance. Indigo has Stripe Connect integration but no dedicated financial overview. Merchants need to see their money flow at a glance.

### Issue 3: Discount UX is Duplicated
There are TWO discount systems:
- `marketing/actions.ts` has discount CRUD (16 functions)
- `marketing/discounts/actions.ts` ALSO has discount CRUD (14 functions)

This suggests the discount feature was built twice or migrated incompletely. This is a maintenance risk and potential source of data inconsistency.

### Issue 4: No Content/Pages Management
Shopify has a "Content" section for managing static pages (About, Contact, FAQ, Terms, Privacy). Indigo has these pages in the storefront (`/store/[slug]/about`, `/contact`, `/faq`) but no dashboard UI to edit their content. The visual editor exists but appears focused on the homepage/storefront layout, not individual pages.

### Issue 5: No Blog Management in Dashboard
There's a `/blog` route in the marketing site, but no dashboard interface to create/edit blog posts. Content marketing is a key ecommerce growth channel.

### Issue 6: Reviews Page Uses Mock Data
The reviews page (`reviews-client.tsx`) uses hardcoded mock data with `console.log` placeholder callbacks. The server actions exist (`approveReview`, `rejectReview`, `deleteReview`) but aren't wired up to the UI.

---

## 📊 Feature Comparison Matrix

| Feature | Shopify | WooCommerce | Saleor | Indigo |
|---------|---------|-------------|--------|--------|
| Products CRUD | ✅ | ✅ | ✅ | ✅ |
| Product Variants | ✅ | ✅ | ✅ | ✅ |
| Product Import/Export | ✅ | ✅ | ✅ | ✅ |
| Collections/Categories | ✅ | ✅ | ✅ | ✅ |
| Attributes | ✅ | ✅ | ✅ | ✅ |
| Inventory Management | ✅ | ✅ | ✅ | ✅ |
| Orders CRUD | ✅ | ✅ | ✅ | ✅ |
| **Draft Orders** | ✅ | ✅ | ✅ | ❌ |
| **Abandoned Checkouts** | ✅ | ✅ (plugin) | ❌ | ❌ |
| Fulfillment/Shipping | ✅ | ✅ | ✅ | ✅ |
| Returns/Refunds | ✅ | ✅ | ✅ | ✅ |
| **Gift Cards** | ✅ | ✅ (plugin) | ✅ | ❌ |
| Customers | ✅ | ✅ | ✅ | ✅ |
| Customer Groups/Segments | ✅ | ✅ | ✅ | ✅ |
| Discounts/Coupons | ✅ | ✅ | ✅ | ✅ |
| Campaigns | ✅ | ❌ | ❌ | ✅ |
| Automations | ✅ | ❌ | ❌ | ✅ (stub) |
| Analytics | ✅ | ✅ | ✅ | ✅ |
| **Tax Management** | ✅ | ✅ | ✅ | ❌ |
| Shipping Zones/Rates | ✅ | ✅ | ✅ | ✅ |
| Multi-currency | ✅ | ✅ (plugin) | ✅ | ✅ |
| Multi-language | ✅ | ✅ (plugin) | ✅ | ✅ (AI) |
| **Pages/Content CMS** | ✅ | ✅ | ✅ | ❌ |
| **Blog** | ✅ | ✅ | ❌ | ❌ (marketing only) |
| Visual Editor | ✅ | ❌ | ❌ | ✅ |
| AI Features | ✅ (Sidekick) | ❌ | ❌ | ✅✅ (deep) |
| Media Library | ✅ | ✅ | ✅ | ✅ |
| Reviews | ❌ (app) | ✅ (plugin) | ❌ | ✅ (mock UI) |
| Team/Staff Management | ✅ | ✅ | ✅ | ✅ |
| Domain Management | ✅ | ❌ | ❌ | ✅ |
| **Webhooks/API** | ✅ | ✅ | ✅ | ❌ |
| **Notification Center** | ✅ | ✅ | ✅ | ⚠️ (partial) |
| Command Palette | ✅ | ❌ | ✅ | ✅ |
| Setup Wizard | ✅ | ✅ | ✅ | ✅ |
| Role-based Access | ✅ | ✅ | ✅ | ✅ |
| Store Switcher | ✅ | ❌ | ❌ | ✅ |
| **Finances/Payouts** | ✅ | ✅ | ✅ | ❌ |

**Score: Indigo has 27/37 features (73%).** The missing 10 are significant.

---

## 🎯 Priority Improvements (Ordered by Merchant Impact)

### Tier 1 — Must Have Before Launch
1. **Tax Management** — Add tax settings page, tax rates by region, tax-inclusive toggle
2. **Draft Orders** — Manual order creation for phone/wholesale orders
3. **Abandoned Checkout** — Track abandoned carts, send recovery emails
4. **Wire up Reviews UI** — Connect existing server actions to the mock UI

### Tier 2 — Expected by Merchants
5. **Gift Cards** — Product type + balance tracking + redemption at checkout
6. **Pages CMS** — Dashboard UI to edit About, Contact, FAQ, Terms, Privacy content
7. **Notification Center** — Real-time feed of order events, low stock, payment alerts
8. **Finances Overview** — Payouts, revenue summary, Stripe balance dashboard
9. **Fix Discount Duplication** — Consolidate the two discount systems

### Tier 3 — Competitive Advantage
10. **Blog Management** — Dashboard UI for creating/editing blog posts
11. **Webhooks/API Keys** — Developer settings for integrations
12. **Customer Detail Enhancement** — Order history, lifetime value, timeline, notes
13. **Order Fulfillment UX** — Visual pipeline with quick-action buttons

---

## 📚 Resources for Improvement

### Navigation & UX Patterns
- Shopify Admin Overview: https://help.shopify.com/en/manual/shopify-admin/shopify-admin-overview
- Saleor Dashboard (open source, React): https://github.com/saleor/saleor-dashboard
- Baymard Institute — Account Dashboard UX: https://baymard.com/blog/use-icons-in-the-account-dashboard
- Medusa.js Admin (open source, Next.js): https://github.com/medusajs/medusa

### Ecommerce Feature Standards
- Shopify Features List: https://www.shopify.com/pricing (feature comparison across plans)
- WooCommerce Menu Items: https://docs.woocommerce.com/document/woocommerce-menu-items/
- Saleor Docs (feature reference): https://docs.saleor.io/

### Order Management Best Practices
- Shopify Order Management: https://www.shopify.com/orders
- Fulfillment workflow patterns: https://www.diginyze.com/blog/10-must-have-features-for-a-killer-ecommerce-order-management-system/

### Dashboard UX Design
- Dashboard UI/UX Principles 2025: https://allclonescript.com/blog/modern-uiux-design-principles
- Ecommerce UX Strategies 2025: https://www.rickyspears.com/ecommerce/revolutionizing-ecommerce-ux-design-strategies-for-2025-and-beyond/

### Tax & Compliance
- Shopify Tax: https://help.shopify.com/en/manual/taxes
- Stripe Tax integration: https://stripe.com/tax

### Open Source References (study their admin UIs)
- **Saleor** — Best-in-class React admin dashboard for ecommerce
- **Medusa.js** — Next.js-based, closest architecture to Indigo
- **Vendure** — TypeScript ecommerce with excellent admin UI
- **Bagisto** — Laravel-based, good feature completeness reference
