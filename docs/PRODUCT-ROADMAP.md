# Indigo — Product Roadmap & Strategy

## Q3 2026 OKRs

### O1: Achieve Product-Market Fit in Nepal
- KR1: 500 active merchants (stores with 5+ products)
- KR2: NPR 50,00,000 monthly GMV
- KR3: 60% merchant retention at 90 days

### O2: Build a Reliable Platform
- KR1: 99.9% uptime
- KR2: < 2.5s LCP on all pages
- KR3: Zero critical security incidents

### O3: Establish Market Presence
- KR1: #1 ranking for "online store Nepal" on Google
- KR2: 10,000 monthly organic visitors
- KR3: 3 merchant case studies published

## Feature Roadmap (RICE Prioritized)

| # | Feature | Reach | Impact | Confidence | Effort | RICE | Quarter |
|---|---------|-------|--------|------------|--------|------|---------|
| 1 | WhatsApp order notifications | 5000 | 3 | 90% | 2w | 6750 | Q3 |
| 2 | eSewa/Khalti auto-reconciliation | 3000 | 3 | 80% | 3w | 2400 | Q3 |
| 3 | Bulk product import (CSV) | 2000 | 3 | 90% | 2w | 2700 | Q3 |
| 4 | Customer reviews & ratings | 4000 | 2 | 85% | 3w | 2267 | Q3 |
| 5 | Discount codes & coupons | 3000 | 2 | 90% | 2w | 2700 | Q3 |
| 6 | Multi-language (Nepali/English) | 2000 | 3 | 70% | 6w | 700 | Q4 |
| 7 | Mobile app (merchant dashboard) | 3000 | 2 | 60% | 12w | 300 | Q4 |
| 8 | Inventory sync (POS integration) | 1000 | 3 | 50% | 8w | 188 | Q4 |
| 9 | Advanced analytics (cohorts) | 500 | 2 | 80% | 4w | 200 | Q4 |
| 10 | Custom domain SSL automation | 2000 | 2 | 90% | 3w | 1200 | Q3 |

*RICE = (Reach × Impact × Confidence) / Effort*
*Reach = merchants affected/quarter, Impact = 1-3, Effort = person-weeks*

## Q3 Sprint Plan

### Sprint 1-2: WhatsApp Notifications + Bulk Import
- WhatsApp Business API integration for order alerts
- CSV import with field mapping UI
- Validation + error reporting

### Sprint 3-4: Payment Reconciliation + Discount Codes
- eSewa/Khalti webhook → auto-mark orders as paid
- Discount code engine (%, fixed, free shipping)
- Discount analytics dashboard

### Sprint 5-6: Reviews + Custom Domains
- Customer review submission + moderation
- Star ratings on product pages
- Let's Encrypt SSL for custom domains

## Pricing Strategy (Nepal Market)

| Plan | Price (NPR/mo) | Price (NPR/yr) | Target |
|------|----------------|-----------------|--------|
| Free | 0 | 0 | Hobbyists, testing |
| Growth | 2,000 | 20,000 | Small merchants |
| Pro | 6,000 | 60,000 | Growing businesses |
| Enterprise | Custom | Custom | Large retailers |

### Free Plan Limits
- 2 pages, 25 products, 100 orders/mo
- Indigo branding on store
- eSewa + COD only

### Growth Plan Includes
- 10 pages, unlimited products, unlimited orders
- Custom domain, remove branding
- All payment methods, discount codes
- Basic analytics

### Pro Plan Includes
- Unlimited everything
- Advanced analytics, customer segments
- Priority support, WhatsApp notifications
- Multi-staff accounts, API access

## Competitive Positioning

### vs Daraz (marketplace)
- Indigo: Own your brand, own your customers, own your data
- Daraz: Higher traffic but 15-25% commission, no brand control

### vs Shopify
- Indigo: NPR pricing, local payments (eSewa/Khalti), Nepal support
- Shopify: USD pricing, no eSewa/Khalti, no local support

### vs Instagram/Facebook shops
- Indigo: Professional store, inventory management, order tracking
- Social: No inventory, manual order processing, no analytics
