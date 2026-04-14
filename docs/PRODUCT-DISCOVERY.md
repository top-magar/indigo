# Indigo — Product Discovery

## 1. Problem Statement

**Nepali merchants cannot easily sell online.**

Nepal has ~10,000 e-commerce businesses in a market projected to reach $1.24B by 2028. Yet most small merchants still sell through Facebook/Instagram DMs and WhatsApp groups because:

| Problem | Why it exists |
|---------|--------------|
| **No local SaaS platform** | Shopify doesn't support eSewa, Khalti, IME Pay, ConnectIPS. WooCommerce requires a developer to integrate Nepal payment gateways. |
| **Logistics nightmare** | Pathao, Doko Recyclers, and local couriers have no plug-and-play integration. Merchants manually book deliveries, print labels, and track shipments. |
| **Cash-on-delivery dominance** | ~70% of transactions are COD. Platforms must handle COD reconciliation, failed deliveries, and return logistics — none of which Shopify supports natively. |
| **No affordable option** | Shopify costs $39/mo (~Rs 5,200) + transaction fees. For a merchant making Rs 50K/mo revenue, that's 10%+ overhead. Local developers charge Rs 50K-200K for a custom site. |
| **Digital literacy gap** | Most merchants are not technical. They need a platform that's as simple as posting on Facebook, not configuring WooCommerce plugins. |
| **Trust deficit** | Consumers don't trust unknown online stores. Merchants need professional-looking storefronts to build credibility. |

**Existing alternatives and why they fail:**

| Platform | Gap |
|----------|-----|
| **Daraz** | Marketplace model — merchants don't own their brand, customer data, or storefront. High commission (5-15%). |
| **Shopify** | No Nepal payment gateways. No Pathao integration. Expensive for Nepali merchants. |
| **WooCommerce** | Requires developer. Hosting costs. Plugin hell. No managed infrastructure. |
| **Facebook/Instagram** | No inventory management, no payment processing, no order tracking, no analytics. Manual everything. |
| **Saauzi / StorePilot** | Early stage, limited features, unproven at scale. |

---

## 2. Target Users

### Primary: Small-to-Medium Nepali Merchants

**Persona 1: "Sita" — Instagram Seller (Hobby tier)**
- Sells handmade jewelry via Instagram DMs
- 20-50 products, Rs 30K-80K/mo revenue
- Pain: Manually tracks orders in a notebook, loses customers who don't trust DM transactions
- Need: Professional storefront + eSewa/Khalti checkout in 5 minutes
- Tech comfort: Uses smartphone daily, no coding knowledge

**Persona 2: "Rajesh" — Growing Retailer (Pro tier)**
- Runs a clothing store in New Road, wants to sell online
- 200-500 products, Rs 200K-500K/mo revenue
- Pain: Hired a developer for Rs 150K, site broke after 3 months, no one to maintain it
- Need: Managed platform with Pathao shipping, real-time inventory sync, analytics
- Tech comfort: Uses Excel, can learn a dashboard

**Persona 3: "Anita" — Multi-brand Operator (Scale tier)**
- Runs 3 stores (cosmetics, clothing, electronics) across Kathmandu
- 1000+ products, Rs 1M+/mo revenue
- Pain: Managing 3 separate systems, no unified analytics, can't scale marketing
- Need: Multi-store dashboard, API access, dedicated support, custom domain per store
- Tech comfort: Has a small team, wants developer API

### Secondary: Nepali Diaspora Entrepreneurs
- NRNs in Gulf countries, Malaysia, Australia wanting to start online businesses back home
- Need: Remote store management, multi-currency (NPR + USD/AED), mobile-first dashboard

---

## 3. Value Proposition

**"Launch your online store in Nepal in 5 minutes. Accept eSewa & Khalti. Ship via Pathao. Free to start."**

### Why Indigo wins:

| Dimension | Indigo | Shopify | WooCommerce | Daraz |
|-----------|--------|---------|-------------|-------|
| Nepal payments | eSewa, Khalti, IME Pay, ConnectIPS, Cards | ❌ | Plugin (broken) | Internal only |
| Shipping | Pathao 1-click, auto labels, SMS tracking | ❌ | ❌ | Internal only |
| Price | Free → Rs 2,500 → Rs 6,000/mo | Rs 5,200+/mo | Rs 1,500+/mo hosting + dev | 5-15% commission |
| Setup time | 5 minutes | 30 min + payment workaround | Days/weeks | 1 hour |
| Own your brand | ✅ Custom domain, full control | ✅ | ✅ | ❌ Marketplace listing |
| Own your data | ✅ | ✅ | ✅ | ❌ |
| COD support | ✅ Built-in reconciliation | ❌ | Plugin | ✅ |
| Nepali language | ✅ | ❌ | Plugin | Partial |
| Visual editor | ✅ Figma-like storefront builder | ✅ | Page builders | ❌ |
| Mobile dashboard | ✅ | ✅ | ❌ | App |

---

## 4. Scope — What We Build (and What We Don't)

### MVP (Now — what's built)

| Module | Status | Description |
|--------|--------|-------------|
| Multi-tenant core | ✅ Built | Subdomain/slug routing, tenant isolation, Supabase auth |
| Dashboard | ✅ Built | Products, orders, customers, categories, collections, inventory, analytics, settings |
| Storefront | ✅ Built | Tenant-specific store at `/store/[slug]`, product pages, cart, checkout |
| Payments | ⚠️ Partial | COD + bank transfer only. eSewa/Khalti/IME Pay/ConnectIPS NOT implemented — checkout form shows "coming soon" |
| Shipping | ✅ Built | Pathao integration, auto labels, tracking |
| Visual Editor (v3) | ✅ Built | Webstudio-inspired flat data model, 22 components, style panel |
| Landing page | ✅ Built | Marketing site with pricing, features, testimonials |
| Auth | ✅ Built | Signup, login, onboarding flow |

### V1.1 (Next — high-impact gaps)

| Feature | Priority | Rationale |
|---------|----------|-----------|
| **WhatsApp order notifications** | P0 | 90%+ of Nepali merchants use WhatsApp for business. Order alerts via WhatsApp = table stakes. |
| **COD reconciliation** | P0 | Track which COD orders were collected, which failed. Critical for cash flow. |
| **Nepali language UI** | P0 | Dashboard + storefront in Nepali. 40%+ of target users prefer Nepali. |
| **Facebook/Instagram catalog sync** | P1 | Most merchants discover customers on social. Sync products → FB Shop. |
| **SMS notifications (Sparrow SMS)** | P1 | Order confirmation + delivery updates via SMS for customers without smartphones. |
| **Store themes** | P1 | 5-10 pre-built storefront themes. Most merchants won't use the visual editor. |
| **Mobile-optimized dashboard** | P1 | Merchants manage stores from phones. Current dashboard is desktop-first. |
| **SEO tools** | P2 | Meta tags, sitemap, structured data for Google Shopping Nepal. |
| **Discount engine** | P2 | Coupon codes, bulk discounts, flash sales — already partially built. |

### Not Building (Out of scope)

| Feature | Why not |
|---------|---------|
| Marketplace/multi-vendor | Different product. We're Shopify, not Daraz. Each merchant owns their store. |
| POS / in-store hardware | Physical retail is a different business. Focus on online-first. |
| Custom app store / plugins | Too early. Build the core platform first. |
| AI product recommendations | Nice-to-have, not a differentiator for Nepali market yet. |
| International expansion | Nepal-first. Prove the model before expanding to Bangladesh/Sri Lanka. |

---

## 5. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     INDIGO PLATFORM                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Landing  │  │Dashboard │  │Storefront│  │ Editor  │ │
│  │   Page   │  │  (Admin) │  │ (Buyer)  │  │  (v3)   │ │
│  │    /     │  │/dashboard│  │/store/[s]│  │/editor  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                       │                                  │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Next.js App Router (RSC + Client)       ││
│  └──────────────────────────────────────────────────────┘│
│                       │                                  │
│  ┌─────────┐ ┌───────┐ ┌────────┐ ┌──────┐ ┌─────────┐ │
│  │Products │ │Orders │ │Payments│ │Media │ │Analytics│ │
│  │Categories│ │Cart   │ │eSewa   │ │S3    │ │Events   │ │
│  │Inventory│ │Ship   │ │Khalti  │ │Upload│ │Charts   │ │
│  └─────────┘ └───────┘ └────────┘ └──────┘ └─────────┘ │
│                       │                                  │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Infrastructure Layer                    ││
│  │  Supabase (Auth + DB) │ Drizzle ORM │ Inngest (Jobs)││
│  │  AWS S3 + SES │ Pathao API │ Payment APIs            ││
│  │  Multi-tenant resolver │ Feature flags │ Cache       ││
│  └──────────────────────────────────────────────────────┘│
│                       │                                  │
│  ┌──────────────────────────────────────────────────────┐│
│  │              Data Layer                              ││
│  │  PostgreSQL (via Supabase)                           ││
│  │  Row-level security per tenant                       ││
│  │  22 schema tables (products, orders, tenants, etc.)  ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 (App Router) | RSC for SEO, server actions for mutations, ISR for storefront performance |
| Database | Supabase (PostgreSQL) | Free tier for hobby, managed, RLS for tenant isolation, real-time subscriptions |
| Auth | Supabase Auth | Social login, magic links, built-in with DB |
| ORM | Drizzle | Type-safe, lightweight, good DX |
| Payments | Direct API integration | eSewa/Khalti SDKs, no intermediary |
| Shipping | Pathao API | Dominant delivery partner in Nepal |
| File storage | AWS S3 | Cheap, reliable, CDN-ready |
| Email | AWS SES | Cost-effective transactional email |
| Background jobs | Inngest | Event-driven, serverless-friendly |
| Styling | Tailwind + shadcn/ui | Rapid UI development, consistent design system |
| Editor | Custom (Webstudio model) | No existing solution handles Nepal-specific storefront needs |
| Deployment | Vercel | Zero-config Next.js hosting, edge functions |

### Multi-Tenancy Model

```
Request → Middleware (resolve tenant from hostname/slug)
       → Inject tenant context into request
       → All DB queries scoped to tenant_id
       → RLS enforces isolation at database level
```

Each tenant gets:
- Unique store URL: `storename.indigo.com.np` or custom domain
- Isolated data (products, orders, customers, settings)
- Shared infrastructure (same codebase, same DB cluster, same deployment)
- Independent theme/editor customization

---

## 6. Success Metrics

| Metric | Target (6 months) | Why it matters |
|--------|-------------------|----------------|
| Registered merchants | 500 | Market validation |
| Active stores (≥1 order/month) | 100 | Actual usage, not just signups |
| GMV (Gross Merchandise Value) | Rs 10M/month | Platform is generating real commerce |
| Merchant retention (month 3) | 60% | Merchants find ongoing value |
| Avg setup time | < 10 minutes | Ease of onboarding |
| Storefront load time (LCP) | < 2.5s | Buyer experience on mobile |
| Payment success rate | > 95% | eSewa/Khalti reliability |
| NPS (merchant) | > 40 | Merchants would recommend |

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment gateway instability (eSewa/Khalti downtime) | High — lost sales | Multi-gateway fallback, COD always available, retry logic |
| Pathao API changes/outages | High — shipping breaks | Abstract shipping behind provider interface, support manual booking fallback |
| Low merchant adoption | High — business fails | Free tier with zero friction, WhatsApp-based onboarding support |
| Merchants churn after trial | Medium — no revenue | Focus on time-to-first-sale metric, guided onboarding, success manager for Scale tier |
| Supabase free tier limits | Medium — scaling issues | Monitor usage, plan migration path to self-hosted Supabase or direct Postgres |
| Regulatory changes (NRB digital payment rules) | Medium — compliance | Stay updated with Nepal Rastra Bank guidelines, maintain compliance documentation |
| Competition from Daraz launching merchant tools | Low-Medium | Differentiate on brand ownership + customization. Daraz is a marketplace, we're a platform. |

---

## 8. Open Questions

1. **Pricing validation** — Is Rs 2,500/mo the right price for Pro? Need merchant interviews.
2. **COD percentage** — What % of orders will be COD vs digital? This affects cash flow and reconciliation complexity.
3. **Rural delivery** — Pathao covers major cities. What about Tier 2/3 cities? Need additional courier partners.
4. **Nepali language priority** — Dashboard first or storefront first? Which drives more adoption?
5. **WhatsApp vs Viber** — Which messaging platform do merchants prefer for notifications?
6. **Store themes vs editor** — What % of merchants will actually use the visual editor vs just picking a theme?

---

*Last updated: 2026-04-14*
*Status: Discovery complete — ready for V1.1 prioritization*
