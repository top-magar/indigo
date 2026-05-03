# Indigo — Business Metrics & Financial Projections

## SaaS Metrics Dashboard

### Key Metrics to Track

| Metric | Formula | Target (Month 6) |
|--------|---------|-------------------|
| MRR | Sum of all active subscriptions | NPR 5,00,000 |
| ARR | MRR × 12 | NPR 60,00,000 |
| New MRR | MRR from new customers | NPR 1,00,000/mo |
| Churn Rate | Lost customers / Start customers | < 5%/mo |
| Net Revenue Retention | (MRR - Churn + Expansion) / Start MRR | > 100% |
| CAC | Total sales+marketing / New customers | < NPR 2,000 |
| LTV | ARPU × (1 / Churn Rate) | > NPR 40,000 |
| LTV:CAC Ratio | LTV / CAC | > 3:1 |
| Payback Period | CAC / ARPU | < 6 months |
| GMV | Total value of orders processed | NPR 50,00,000/mo |
| Take Rate | Revenue / GMV | 3-5% |

### Revenue Projections (12 months)

| Month | Free | Growth | Pro | Total Merchants | MRR (NPR) |
|-------|------|--------|-----|-----------------|------------|
| 1 | 200 | 20 | 2 | 222 | 52,000 |
| 2 | 350 | 45 | 5 | 400 | 1,20,000 |
| 3 | 500 | 80 | 10 | 590 | 2,20,000 |
| 4 | 650 | 120 | 18 | 788 | 3,48,000 |
| 5 | 800 | 170 | 28 | 998 | 5,08,000 |
| 6 | 950 | 230 | 40 | 1220 | 7,00,000 |
| 7 | 1100 | 290 | 55 | 1445 | 9,10,000 |
| 8 | 1250 | 360 | 72 | 1682 | 11,52,000 |
| 9 | 1400 | 430 | 90 | 1920 | 14,00,000 |
| 10 | 1550 | 510 | 110 | 2170 | 16,80,000 |
| 11 | 1700 | 590 | 130 | 2420 | 19,60,000 |
| 12 | 1850 | 680 | 155 | 2685 | 22,90,000 |

*Assumptions: Growth = NPR 2,000/mo, Pro = NPR 6,000/mo, 5% monthly churn on paid*

### Year 1 Summary
- **Total Revenue**: ~NPR 1.1 Cr (NPR 11,000,000)
- **Ending MRR**: NPR 22,90,000
- **Ending ARR**: NPR 2.75 Cr
- **Total Merchants**: 2,685
- **Paid Conversion**: 31% (835 paid / 2685 total)

## Cost Structure (Monthly at Scale)

| Category | Cost (NPR/mo) | Notes |
|----------|----------------|-------|
| Supabase Pro | 25,000 | Database + Auth + Storage |
| Vercel Pro | 20,000 | Hosting + Edge |
| Domain + SSL | 2,000 | indigo.com.np + wildcard |
| Email (SES) | 5,000 | Transactional emails |
| Monitoring (Sentry) | 10,000 | Error tracking |
| Payment gateway fees | 2% of GMV | eSewa/Khalti processing |
| Team (2 engineers) | 3,00,000 | Nepal market rate |
| Marketing | 50,000 | Ads + content |
| **Total** | **~4,12,000** | |

### Break-even: Month 5-6 (MRR > NPR 5,00,000)

## Churn Prevention Strategy

### Cancel Flow Design
1. User clicks "Cancel subscription"
2. Show usage stats: "You've processed 47 orders this month"
3. Offer alternatives: pause (1 month), downgrade to Growth
4. Exit survey: why are you leaving? (pricing, features, switching, closing)
5. Save offer: 50% off for 2 months (for pricing-related churn)
6. Confirm cancellation with 30-day grace period

### Dunning Sequence (Failed Payments)
- Day 0: Payment failed → retry automatically
- Day 1: Email "Payment failed — update your card"
- Day 3: In-app banner "Your subscription is at risk"
- Day 7: Email "Last chance — store will be downgraded in 3 days"
- Day 10: Downgrade to Free plan, preserve data for 90 days

### Expansion Revenue Opportunities
- Free → Growth: Custom domain is the #1 upgrade trigger
- Growth → Pro: Analytics and multi-staff are the triggers
- Add-ons: WhatsApp notifications (NPR 500/mo), priority support (NPR 1,000/mo)
