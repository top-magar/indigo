# Indigo AI Billing Strategy & Profit Analysis

## Executive Summary

Based on competitive research of Shopify, BigCommerce, Wix, Squarespace, Adobe Commerce, and Salesforce Commerce Cloud, we recommend a **Hybrid Tiered + Usage Model** for Indigo's AI services.

---

## Competitive Landscape Analysis

### How Competitors Price AI Features

| Platform | AI Pricing Model | Entry Price | AI Included? |
|----------|------------------|-------------|--------------|
| **Shopify** | Included free | $39/mo | ✅ All plans |
| **BigCommerce** | Tiered (Enterprise for advanced) | $39/mo | ⚠️ Basic only |
| **WooCommerce** | Plugin marketplace | $0-500+/mo | ❌ Third-party |
| **Wix** | Included free | $17/mo | ✅ All plans |
| **Squarespace** | Included free | $16/mo | ✅ All plans |
| **Adobe Commerce** | GMV-based license | ~$22,000/yr | ✅ Enterprise |
| **Salesforce** | GMV percentage (1-3%) | 1% of GMV | ✅ All tiers |

### Key Insights

1. **SMB platforms (Shopify, Wix, Squarespace)** include AI free - it's now table stakes
2. **Mid-market platforms (BigCommerce)** gate advanced AI (recommendations, search) to Enterprise
3. **Enterprise platforms** bundle AI in GMV-based pricing
4. **Traditional SaaS margins: 70-85%** but AI features have variable COGS per request

---

## Recommended Billing Model for Indigo

### The Hybrid Approach: Tiered Plans + AI Credits

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        INDIGO PRICING TIERS                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  STARTER (Free)     GROWTH ($49/mo)    PRO ($149/mo)    ENTERPRISE     │
│  ─────────────      ───────────────    ──────────────   ──────────────  │
│  • 50 AI credits    • 500 AI credits   • 2,000 credits  • Unlimited     │
│  • Basic search     • Full search      • Full search    • Dedicated     │
│  • No recs          • Basic recs       • Full recs      • Custom AI     │
│  • 100 products     • 1,000 products   • 10,000 prods   • Unlimited     │
│  • 1% + 30¢/txn     • 0.5% + 30¢/txn   • 0.25%/txn      • Custom        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### AI Credit System

| AI Service | Credits Per Use | AWS Cost | Your Price | Margin |
|------------|-----------------|----------|------------|--------|
| **Content Generation** (1 description) | 5 credits | ~$0.02 | $0.10 | 80% |
| **Search Query** | 0.1 credits | ~$0.001 | $0.002 | 50% |
| **Recommendation Request** | 0.5 credits | ~$0.005 | $0.01 | 50% |
| **Sentiment Analysis** | 1 credit | ~$0.001 | $0.02 | 95% |
| **Image Analysis** | 2 credits | ~$0.01 | $0.04 | 75% |
| **Translation** (per 1K chars) | 3 credits | ~$0.015 | $0.06 | 75% |
| **Demand Forecast** | 10 credits | ~$0.10 | $0.20 | 50% |

### Credit Pricing (Overage)

| Credit Pack | Price | Per Credit | Discount |
|-------------|-------|------------|----------|
| 100 credits | $5 | $0.05 | - |
| 500 credits | $20 | $0.04 | 20% |
| 2,000 credits | $60 | $0.03 | 40% |
| 10,000 credits | $200 | $0.02 | 60% |

---

## Detailed Tier Breakdown

### Starter (Free)
**Target:** New merchants testing the platform

| Feature | Limit |
|---------|-------|
| Products | 100 |
| AI Credits/month | 50 |
| Search | Basic (no autocomplete) |
| Recommendations | ❌ |
| Insights | ❌ |
| Transaction Fee | 1% + $0.30 |

**AI Usage Example:**
- 10 product descriptions = 50 credits ✓

---

### Growth ($49/month)
**Target:** Growing stores with 100-1,000 products

| Feature | Limit |
|---------|-------|
| Products | 1,000 |
| AI Credits/month | 500 |
| Search | Full (with autocomplete) |
| Recommendations | Basic (similar products) |
| Insights | Basic sentiment |
| Transaction Fee | 0.5% + $0.30 |

**AI Usage Example:**
- 50 product descriptions = 250 credits
- 2,000 search queries = 200 credits
- 100 recommendations = 50 credits
- **Total: 500 credits** ✓

---

### Pro ($149/month)
**Target:** Established stores with 1,000-10,000 products

| Feature | Limit |
|---------|-------|
| Products | 10,000 |
| AI Credits/month | 2,000 |
| Search | Full + analytics |
| Recommendations | Full (personalized, trending) |
| Insights | Full (forecasting, sentiment) |
| Transaction Fee | 0.25% |

**AI Usage Example:**
- 200 product descriptions = 1,000 credits
- 5,000 search queries = 500 credits
- 500 recommendations = 250 credits
- 50 forecasts = 500 credits
- **Total: 2,250 credits** (250 overage = $10)

---

### Enterprise (Custom)
**Target:** High-volume merchants, agencies, B2B

| Feature | Included |
|---------|----------|
| Products | Unlimited |
| AI Credits | Unlimited |
| Search | Dedicated cluster |
| Recommendations | Custom models |
| Insights | Custom dashboards |
| Transaction Fee | Negotiated |
| Support | Dedicated CSM |

**Pricing:** $500-2,000/month based on GMV + usage

---

## Profit Analysis

### Cost Structure (Per Tenant/Month)

| Cost Category | Starter | Growth | Pro | Enterprise |
|---------------|---------|--------|-----|------------|
| **Infrastructure** | | | | |
| Supabase (DB) | $0.50 | $2 | $5 | $20 |
| Vercel (Hosting) | $0.25 | $1 | $3 | $10 |
| **AI Services** | | | | |
| AWS Bedrock | $0 | $5 | $20 | $100 |
| AWS OpenSearch | $0 | $10 | $25 | $100 |
| AWS Personalize | $0 | $3 | $10 | $50 |
| AWS Comprehend | $0 | $1 | $5 | $20 |
| AWS Rekognition | $0 | $0.50 | $2 | $10 |
| **Total COGS** | **$0.75** | **$22.50** | **$70** | **$310** |

### Revenue & Margin Analysis

| Tier | Price | COGS | Gross Profit | Margin |
|------|-------|------|--------------|--------|
| Starter | $0 | $0.75 | -$0.75 | -∞ |
| Growth | $49 | $22.50 | $26.50 | 54% |
| Pro | $149 | $70 | $79 | 53% |
| Enterprise | $800 (avg) | $310 | $490 | 61% |

### Transaction Fee Revenue (Additional)

| Tier | Avg GMV/mo | Fee Rate | Fee Revenue |
|------|------------|----------|-------------|
| Starter | $5,000 | 1% + $0.30 | $65 |
| Growth | $25,000 | 0.5% + $0.30 | $155 |
| Pro | $100,000 | 0.25% | $250 |
| Enterprise | $500,000 | 0.1% | $500 |

### Combined Revenue & Profit

| Tier | Subscription | Txn Fees | Total Rev | COGS | Profit | Margin |
|------|--------------|----------|-----------|------|--------|--------|
| Starter | $0 | $65 | $65 | $0.75 | $64.25 | 99% |
| Growth | $49 | $155 | $204 | $22.50 | $181.50 | 89% |
| Pro | $149 | $250 | $399 | $70 | $329 | 82% |
| Enterprise | $800 | $500 | $1,300 | $310 | $990 | 76% |

---

## 5-Year Revenue Projection

### Assumptions
- Year 1: 500 tenants (60% Starter, 25% Growth, 12% Pro, 3% Enterprise)
- 30% YoY tenant growth
- 15% annual upgrade rate (Starter→Growth, Growth→Pro)
- 5% annual churn

### Tenant Distribution Over Time

| Year | Starter | Growth | Pro | Enterprise | Total |
|------|---------|--------|-----|------------|-------|
| Y1 | 300 | 125 | 60 | 15 | 500 |
| Y2 | 350 | 200 | 100 | 30 | 680 |
| Y3 | 400 | 300 | 160 | 50 | 910 |
| Y4 | 450 | 420 | 250 | 80 | 1,200 |
| Y5 | 500 | 550 | 380 | 130 | 1,560 |

### Annual Revenue Projection

| Year | Subscription Rev | Transaction Rev | Total Revenue | COGS | Gross Profit |
|------|------------------|-----------------|---------------|------|--------------|
| Y1 | $220K | $180K | **$400K** | $80K | $320K (80%) |
| Y2 | $420K | $350K | **$770K** | $150K | $620K (81%) |
| Y3 | $750K | $600K | **$1.35M** | $260K | $1.09M (81%) |
| Y4 | $1.2M | $950K | **$2.15M** | $400K | $1.75M (81%) |
| Y5 | $1.9M | $1.5M | **$3.4M** | $620K | $2.78M (82%) |

### Key Metrics at Year 5

| Metric | Value |
|--------|-------|
| **ARR** | $3.4M |
| **MRR** | $283K |
| **ARPU** (blended) | $182/mo |
| **Gross Margin** | 82% |
| **LTV** (36mo avg) | $6,552 |
| **CAC Target** (3:1 LTV:CAC) | $2,184 |

---

## Implementation Roadmap

### Phase 1: Basic Metering (Month 1-2)
- [ ] Create `ai_usage` table in Supabase
- [ ] Add usage tracking middleware
- [ ] Build usage dashboard widget
- [ ] Implement soft limits with warnings

### Phase 2: Billing Integration (Month 2-3)
- [ ] Stripe subscription products for tiers
- [ ] Stripe metered billing for credits
- [ ] Upgrade/downgrade flows
- [ ] Invoice generation

### Phase 3: Credit System (Month 3-4)
- [ ] Credit pack purchases
- [ ] Overage billing
- [ ] Usage alerts and notifications
- [ ] Admin usage reports

### Phase 4: Enterprise Features (Month 4-6)
- [ ] Custom pricing calculator
- [ ] Volume discounts
- [ ] Annual billing (20% discount)
- [ ] White-label options

---

## Competitive Positioning

### vs Shopify (AI included free)
**Our advantage:** More advanced AI features (forecasting, personalization) at lower total cost than Shopify Plus ($2,300/mo)

### vs BigCommerce (AI gated to Enterprise)
**Our advantage:** Full AI suite available at $149/mo vs custom Enterprise pricing

### vs WooCommerce (Plugin chaos)
**Our advantage:** Integrated AI experience, no plugin management, predictable pricing

### vs Adobe/Salesforce (GMV-based)
**Our advantage:** Fixed pricing that doesn't penalize success

---

## Summary Recommendation

**Implement the Hybrid Tiered + Credits model because:**

1. **Predictable revenue** from subscriptions
2. **Scalable margins** from transaction fees
3. **Fair usage** via credit system
4. **Competitive positioning** vs both SMB and Enterprise platforms
5. **Growth path** from free to Enterprise

**Target gross margin: 75-85%** (industry standard for SaaS)
**Target ARPU: $150-200/month** (blended across tiers)

---

*Document created: January 2026*
*Based on competitive research of Shopify, BigCommerce, Wix, Squarespace, Adobe Commerce, Salesforce Commerce Cloud*
