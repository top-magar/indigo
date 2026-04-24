# AWS Services for E-Commerce SaaS Platform - Research Report

> Comprehensive analysis of AWS services that can boost the Indigo e-commerce platform.
> Research conducted: January 2025

---

## Executive Summary

This document analyzes 10 AWS services that can significantly enhance an e-commerce SaaS platform like Indigo. Each service is evaluated for:
- Key features relevant to e-commerce
- Pricing model
- Integration complexity
- ROI/success stories

**Top Recommendations for Indigo:**
1. **Amazon Personalize** - Highest ROI potential (28-49% conversion increases)
2. **Amazon Bedrock** - Versatile AI for product descriptions, chatbots, recommendations
3. **AWS Fraud Detector** - Critical for payment protection
4. **Amazon Connect** - Scalable customer service with AI
5. **AWS Supply Chain** - Inventory optimization using Amazon's own technology

---

## 1. Amazon Bedrock (Generative AI Platform)

### Overview
Amazon Bedrock is a fully managed service offering foundation models (FMs) from leading AI companies through a single API. It has evolved into a complete AI platform supporting multimodal reasoning, agentic workflows, and enterprise governance.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **Product Description Generation** | Auto-generate SEO-optimized product descriptions from images/specs |
| **E-Commerce Chatbots** | Build intelligent product recommendation chatbots using Bedrock Agents |
| **Amazon Nova Models** | Process text, images, and video for rich product content |
| **Knowledge Bases (RAG)** | Connect to product catalogs for accurate, contextual responses |
| **Custom Model Import** | Import proprietary models trained on your e-commerce data |
| **Data Automation** | Transform unstructured product data into structured formats |

### Pricing Model
- **On-Demand**: Pay per token (input/output) - no commitments
- **Batch Mode**: Cost-efficient for large volume processing
- **Provisioned Throughput**: Reserved capacity for consistent workloads
- **Fine-Tuning**: Charged per training token × epochs + storage
- **Knowledge Bases**: Charged for data ingestion + vector storage

**Example Costs (Claude 3 Sonnet):**
- Input: ~$0.003 per 1K tokens
- Output: ~$0.015 per 1K tokens

### Integration Complexity
**Medium** - AWS provides SDKs and pre-built solutions
- AWS CDK for infrastructure-as-code deployment
- Lambda integration for serverless compute
- API Gateway for production-grade APIs
- Pre-built guidance for product description generation

### ROI & Success Stories
- **AWS Sales Teams**: 4.9% increase in opportunity value using GenAI summaries (Sep 2023 - Mar 2024)
- **US Foods**: Saved 32,000+ hours of manual work using Bedrock for automated order guides
- **Retailers**: Using Bedrock for smart data operations across supply chain, OMS, and inventory

### Indigo Integration Opportunities
```typescript
// Example: AI Product Description Generator
// Already implemented in: src/features/products/components/ai-description-generator.tsx
// Uses: src/infrastructure/aws/bedrock.ts
```

---

## 2. Amazon Personalize (ML Recommendations)

### Overview
Amazon Personalize uses the same ML technology that powers Amazon.com recommendations. It automatically analyzes customer data to deliver personalized product recommendations, search results, and marketing content.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **Real-Time Recommendations** | "Customers also bought", "Recommended for you" |
| **Personalized Search** | Re-rank search results based on user preferences |
| **Personalized Emails** | Dynamic product recommendations in newsletters |
| **User Segmentation** | Create audience segments for targeted campaigns |
| **Metric Attribution** | Measure recommendation impact with A/B testing |
| **Trending Items** | Surface popular products by category/location |

### Pricing Model
- **Data Ingestion**: Per GB uploaded (real-time streaming or batch via S3)
- **Training**: Per training hour
- **Inference**: Per recommendation request
- **Free Tier**: Available for initial experimentation

**Typical Costs:**
- Small catalog (10K products): ~$500-1,500/month
- Medium catalog (100K products): ~$2,000-5,000/month
- Large catalog (1M+ products): Custom pricing

### Integration Complexity
**Medium-Low** - Well-documented APIs and SDKs
- Upload historical interaction data (views, purchases, cart adds)
- Create solution with pre-built recipes
- Deploy campaign for real-time recommendations
- Integrates with Braze, Segment for marketing automation

### ROI & Success Stories

| Company | Industry | Results |
|---------|----------|---------|
| **Dress the Population** | Fashion Retail | 28% increase in conversion rate |
| **Ticketek** | Event Ticketing | 49% increase in sales per order |
| **Pomelo Fashion** | E-Commerce | Significant engagement boost, improved sales conversion |
| **Paytm Mall** | Marketplace | Increased sales and click-through rates |
| **Zappos** | Footwear | Personalized sizing and search results |

**Industry Benchmarks:**
- 7 in 10 retailers see 4x+ ROI on personalization investments
- 15-25% higher conversion rates vs. generic approaches
- 5-8x return on marketing spend with AI personalization

### Indigo Integration Opportunities
```typescript
// Already implemented in: src/infrastructure/aws/personalize.ts
// Dashboard widget: src/components/dashboard/ai-services/recommendations-widget.tsx
// Storefront: src/features/recommendations/components/recommendations-widget.tsx
```

---

## 3. AWS Fraud Detector

### Overview
Amazon Fraud Detector uses ML to identify potential fraud for online activities including new account creation, online payments, and guest checkouts. It automates model creation without requiring ML expertise.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **Automated ML Models** | No coding required - upload data, select model type |
| **New Account Fraud** | Detect fake account registrations |
| **Payment Fraud** | Identify fraudulent transactions at checkout |
| **Guest Checkout Protection** | Protect against fraud without account data |
| **Custom Rules Engine** | Create business rules based on model scores |
| **Real-Time Predictions** | Evaluate transactions as they occur |
| **Audit Trail** | Search and review past fraud evaluations |
| **SageMaker Integration** | Combine with custom models for layered protection |

### Automatic Feature Engineering
- Calculates account age, time since last activity
- Counts of activities over time
- Distinguishes trusted customers from fraudsters
- Model maintains performance longer between retrainings

### Pricing Model
- **Free Tier**: 30,000 fraud predictions/month
- **Predictions**: Tiered pricing based on volume
  - With ML model: Higher per-prediction cost
  - Rules only: Lower per-prediction cost
- **Training**: Per compute hour for model training
- **No upfront fees** or long-term commitments

**Typical Costs:**
- Small store (10K transactions/month): ~$100-300/month
- Medium store (100K transactions/month): ~$500-1,500/month
- Large store (1M+ transactions/month): Volume discounts available

### Integration Complexity
**Medium** - Requires data preparation and rule configuration
- Upload historical transaction data with fraud labels
- Train model (automated process)
- Create detection rules based on model scores
- Integrate via API for real-time predictions

### ROI & Success Stories

| Company | Use Case | Results |
|---------|----------|---------|
| **Clearly** | E-Commerce Eyewear | Automated fraud detection pipeline, reduced manual review |
| **General** | Online Payments | Proactive fraud prevention, reduced revenue losses |

**Industry Impact:**
- Reduces chargebacks and fraud losses
- Improves customer experience (fewer false positives)
- Adapts to changing fraud patterns automatically

### Indigo Integration Opportunities
```typescript
// Potential integration points:
// - src/app/api/public/checkout/route.ts (payment validation)
// - src/app/api/store/[slug]/checkout/route.ts
// - New account registration flow
```

---

## 4. Amazon Connect (Contact Center)

### Overview
Amazon Connect is an AI-powered, omnichannel cloud contact center. It provides voice, chat, messaging, and email support with built-in AI capabilities for self-service and agent assistance.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **Omnichannel Support** | Voice, chat, SMS, WhatsApp, email in one platform |
| **AI Self-Service** | Automated order status, returns, FAQs |
| **Real-Time Agent Assistance** | AI suggests responses during customer calls |
| **Conversational Analytics** | Sentiment analysis, post-contact summaries |
| **Forecasting & Scheduling** | Predict call volumes, optimize staffing |
| **Screen Recording** | Quality assurance and training |
| **Amazon Lex Integration** | Build conversational chatbots |
| **Amazon Q Integration** | AI agents for complex queries |

### Pricing Model
**Pay-per-use** - No minimum fees, long-term commitments, or seat licenses

| Channel | Price |
|---------|-------|
| Voice | $0.038/minute + telephony |
| Chat | $0.010/message |
| SMS/WhatsApp | $0.014/message |
| Email | $0.080/email |
| Outbound Campaigns | Additional per-contact fees |
| Tasks | Per-task pricing |

**Included with Voice:**
- Amazon Polly generative text-to-speech
- Customer callbacks
- Amazon Nova Sonic
- 3P speech-to-text configuration

**Additional Costs:**
- AI agents using Bedrock AgentCore Gateway
- Knowledge Base queries
- External voice integration: $0.032/min + $100/connector/day

### Integration Complexity
**Medium-High** - Full-featured platform requires planning
- Flow designer for call/chat routing (no-code)
- Integration with CRM systems
- Agent workspace customization
- Analytics dashboard setup

### ROI & Success Stories

| Company | Industry | Results |
|---------|----------|---------|
| **Intuit** | Financial Software | Unified contact center across business units |
| **Accenture Brazil** | Consulting | 50% infrastructure cost reduction, instant scaling |
| **Toyota (TMNA)** | Automotive | 1M+ calls/year, 20% reduction in call handling time |
| **Capital One** | Banking | Crystal-clear quality, easy flow design |
| **Neiman Marcus** | Luxury Retail | 50% faster speed to market |
| **esure** | Insurance | Tailored, personalized customer experiences |

### Indigo Integration Opportunities
```typescript
// Potential integration:
// - Customer support widget in storefront
// - Order status chatbot
// - Returns/refunds self-service
// - Dashboard for tenant support management
```

---

## 5. AWS Supply Chain

### Overview
AWS Supply Chain provides end-to-end visibility and ML-powered insights using technology similar to what Amazon uses for its own operations. It helps predict risks, optimize inventory, and improve demand planning.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **Inventory Visualization** | Real-time inventory health across locations |
| **Risk Insights** | Automatic alerts for stock-out/overstock risks |
| **Demand Planning** | ML-powered demand forecasting |
| **Vendor Lead Time Prediction** | More accurate supplier delivery estimates |
| **Order Tracking** | End-to-end visibility from sourcing to delivery |
| **Custom Watchlists** | Team alerts for specific risk thresholds |
| **Data Lake Integration** | Unified supply chain data repository |

### Pricing Model
**Pay-as-you-go** - No upfront licensing, 30-day free trial available

| Component | Price |
|-----------|-------|
| Instance (running) | $0.28/hour (includes 10GB storage) |
| Additional Storage | $0.25/GB/month |
| Insights | $0.13-0.40 per SKU-location combination |
| Demand Planning | $0.10-0.30 per SKU-location combination |

**Example:**
- 1,000 SKUs × 5 locations = 5,000 SKU-location combinations
- Insights: ~$650-2,000/month
- Demand Planning: ~$500-1,500/month

### Integration Complexity
**High** - Requires data integration from multiple sources
- Connect ERP, WMS, and inventory systems
- Data lake setup for unified view
- Configure insight rules and thresholds
- Train team on dashboard and alerts

### ROI & Success Stories
- **Amazon Technology**: Uses same ML models internally
- **Automotive Industry**: 50% more accurate forecasts with Amazon Forecast
- **General**: Reduced stock-outs, excess inventory, and expedite costs

**Key Benefits:**
- Improve forecast accuracy up to 50%
- Reduce inventory costs
- Improve capacity utilization
- Better supplier visibility

### Indigo Integration Opportunities
```typescript
// Already implemented: src/infrastructure/aws/forecast.ts
// Dashboard: src/features/inventory/components/forecast-insights.tsx
// Potential: Multi-warehouse inventory optimization
```

---

## 6. Amazon Q (Business Intelligence)

### Overview
Amazon Q is AWS's AI assistant for business intelligence, available in QuickSight for data analytics and as a standalone business assistant. It enables natural language queries on business data.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **Natural Language Queries** | "What were top-selling products last month?" |
| **Scenario Analysis** | "What if we increase prices by 10%?" |
| **Dashboard Generation** | Auto-create visualizations from questions |
| **Data Summaries** | AI-generated insights on sales trends |
| **Document Q&A** | Query product catalogs, policies, procedures |
| **Action Plugins** | Connect to business systems for automated actions |
| **Multi-Source Integration** | Connect S3, databases, SaaS apps |

### Pricing Model

**Amazon Q Business:**
| Plan | Price | Features |
|------|-------|----------|
| Lite | $3/user/month | Basic Q&A, limited features |
| Pro | $20/user/month | Full features, plugins, actions |

**Amazon Q in QuickSight:**
| Role | Price | Features |
|------|-------|----------|
| Reader | $3/user/month | View dashboards, basic Q&A |
| Author | $24/user/month | Create dashboards, full Q&A |
| Pro (Q enabled) | +$250/account/month | Advanced AI features |

**Index Storage:**
- $0.264/hour per index unit
- 1 unit supports ~10K documents
- 10 units for ~200K documents

### Integration Complexity
**Medium** - Requires data source configuration
- Connect to data sources (S3, databases, SaaS)
- Configure IAM Identity Center for user management
- Set up topics and data permissions
- Train users on natural language queries

### ROI & Success Stories
- **QuickSight 2024**: Doubled down on speed, scalability, and AI capabilities
- **Enterprise Adoption**: Tens of thousands of customers using for BI
- **Scenario Analysis**: Preview feature for complex problem-solving

### Indigo Integration Opportunities
```typescript
// Potential integration:
// - Dashboard analytics with natural language queries
// - Tenant business intelligence reports
// - Automated insights generation
// - Sales trend analysis
```

---

## 7. AWS Clean Rooms (Data Collaboration)

### Overview
AWS Clean Rooms enables secure data collaboration between partners without sharing raw data. It's ideal for e-commerce companies working with advertisers, suppliers, or analytics partners.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **Secure Data Matching** | Match customer lists with ad partners |
| **Aggregation Analysis** | Measure campaign overlap without exposing individuals |
| **List Analysis** | Find intersection of customer segments |
| **Custom SQL Queries** | Advanced analytics with privacy controls |
| **Differential Privacy** | Mathematical privacy guarantees |
| **Lookalike Modeling** | Find similar audiences with ML |
| **Zero-ETL** | Direct data access without copying |
| **Snowflake Integration** | Collaborate across cloud platforms |

### Analysis Rules
1. **Aggregation**: Only aggregate statistics (counts, sums, averages)
2. **List**: Row-level intersection with controlled output columns
3. **Custom**: Full SQL with query review and approval

### Pricing Model
- **Query Compute**: Based on data scanned
- **ML Lookalike Modeling**: Per 1,000 profiles trained/generated
- **Entity Resolution**: Per 1,000 records matched
- **No data movement fees** within collaboration

### Integration Complexity
**Medium-High** - Requires partner coordination
- Set up collaboration with partners
- Define analysis rules and permissions
- Configure data tables and access
- Coordinate query execution

### ROI & Success Stories
- **Advertising**: Measure campaign effectiveness without sharing customer data
- **Retail**: Collaborate with suppliers on demand planning
- **Customer 360**: Build unified customer views across partners

### Indigo Integration Opportunities
```typescript
// Potential use cases:
// - Tenant collaboration with advertising partners
// - Supplier data sharing for inventory planning
// - Cross-tenant analytics (with privacy)
// - Marketing attribution analysis
```

---

## 8. Amazon Location Service

### Overview
Amazon Location Service provides maps, geocoding, routing, asset tracking, and geofencing capabilities for applications. It's ideal for delivery tracking, store locators, and logistics optimization.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **Maps** | Store locators, delivery tracking maps |
| **Geocoding** | Convert addresses to coordinates |
| **Routing** | Delivery route optimization |
| **Asset Tracking** | Real-time delivery vehicle tracking |
| **Geofencing** | Delivery zone management, arrival alerts |
| **Places Search** | Find nearby stores, pickup locations |
| **Toll Calculation** | Accurate delivery cost estimation |

### Pricing Model
**Pay-per-request** - Volume discounts above $5,000/month

| API | Pricing Tiers |
|-----|---------------|
| Maps | Core / Advanced / Premium |
| Places | Core / Advanced / Premium |
| Routes | Core / Advanced / Premium |
| Tracking | Per position update |
| Geofencing | Per geofence evaluation |

**Pricing Buckets:**
- **Core**: Basic features (Car, Pedestrian, Truck routing)
- **Advanced**: Extended features (Scooter mode)
- **Premium**: Full features (Toll cost calculation)

### Integration Complexity
**Low-Medium** - Well-documented APIs
- API keys for web/mobile apps
- IAM for backend services
- Cognito for user authentication
- CloudWatch for monitoring

### ROI & Success Stories
- **Delivery Optimization**: Reduced delivery times and costs
- **Customer Experience**: Real-time order tracking
- **Operational Efficiency**: Automated geofence alerts

### Indigo Integration Opportunities
```typescript
// Potential integration:
// - Order tracking maps in storefront
// - Store/warehouse locator
// - Delivery zone configuration
// - Shipping cost estimation
```

---

## 9. AWS IoT for Inventory Tracking

### Overview
AWS IoT Core and related services enable real-time inventory tracking using RFID, sensors, and connected devices. It provides end-to-end visibility from warehouse to delivery.

### Key E-Commerce Features

| Feature | E-Commerce Use Case |
|---------|---------------------|
| **RFID Tracking** | Real-time inventory counts, shrink detection |
| **Sensor Data** | Temperature monitoring for perishables |
| **Device Shadows** | Offline device state management |
| **Rules Engine** | Automated alerts and actions |
| **Asset Tracking** | Track goods across supply chain |
| **Barcode Integration** | Scan-based inventory updates |

### AWS IoT Core Pricing
**Pay-per-use** - 12-month free tier available

| Component | Price |
|-----------|-------|
| Connectivity | Per minute connected |
| Messaging | Per million messages |
| Device Shadow | Per million operations |
| Rules Engine | Per million rules triggered |

**Free Tier (12 months):**
- 2,250,000 minutes of connection
- 500,000 messages
- 225,000 Registry/Shadow operations
- 250,000 rules triggered

**Example (50 devices):**
- 24/7 connection
- 300 messages/day each
- 130 Shadow operations/day
- Covered by free tier

### Integration Complexity
**High** - Requires hardware and infrastructure
- RFID readers and tags
- IoT gateway devices
- Network infrastructure
- Data pipeline setup

### ROI & Success Stories
- **Retail RFID**: Near real-time stock visibility
- **Warehouse**: Reduced manual counting by 90%+
- **Shrink Detection**: Identify inventory loss patterns
- **Industry**: Up to 60% of retail inventory records are inaccurate - IoT fixes this

### Indigo Integration Opportunities
```typescript
// Potential integration:
// - Real-time inventory sync via IoT Core
// - Automated stock alerts
// - Warehouse management integration
// - Delivery tracking sensors
```

---

## 10. Additional AWS E-Commerce Services

### AWS Web Store Guidance
AWS provides a complete reference architecture for headless e-commerce including:
- **Search**: Amazon OpenSearch (already integrated in Indigo)
- **Personalization**: Amazon Personalize
- **Marketing**: Campaign management
- **Fraud Detection**: Amazon Fraud Detector
- **Authentication**: Amazon Cognito
- **Location Services**: Amazon Location Service
- **Chatbots**: Amazon Lex

### Visa Intelligent Commerce on AWS
New in 2024/2025 - Agentic commerce using Amazon Bedrock AgentCore:
- Autonomous shopping agents
- Coordinated discovery and decision-making
- Secure payment processing
- Background task automation

---

## Integration Priority Matrix for Indigo

### Already Implemented ✅
| Service | Location | Status |
|---------|----------|--------|
| Amazon Bedrock | `src/infrastructure/aws/bedrock.ts` | Active |
| Amazon Personalize | `src/infrastructure/aws/personalize.ts` | Active |
| Amazon Forecast | `src/infrastructure/aws/forecast.ts` | Active |
| Amazon OpenSearch | `src/infrastructure/aws/opensearch.ts` | Active |
| Amazon Comprehend | `src/infrastructure/aws/comprehend.ts` | Active |
| Amazon Rekognition | `src/infrastructure/aws/rekognition.ts` | Active |
| Amazon S3 | `src/infrastructure/aws/s3.ts` | Active |
| Amazon SES | `src/infrastructure/aws/ses.ts` | Active |
| Amazon Translate | `src/infrastructure/aws/translate.ts` | Active |
| Amazon Textract | `src/infrastructure/aws/textract.ts` | Active |
| Amazon Polly | `src/infrastructure/aws/polly.ts` | Active |

### Recommended Next Steps 🎯

| Priority | Service | ROI Potential | Effort | Recommendation |
|----------|---------|---------------|--------|----------------|
| 🔴 High | AWS Fraud Detector | High (reduce chargebacks) | Medium | Integrate at checkout |
| 🔴 High | Amazon Connect | High (customer satisfaction) | Medium-High | Add support widget |
| 🟡 Medium | AWS Supply Chain | Medium (inventory optimization) | High | For multi-warehouse tenants |
| 🟡 Medium | Amazon Q | Medium (BI insights) | Medium | Dashboard analytics |
| 🟢 Low | AWS Clean Rooms | Low-Medium (partner data) | High | Future consideration |
| 🟢 Low | Amazon Location | Low-Medium (delivery tracking) | Low | Nice-to-have feature |
| 🟢 Low | AWS IoT | High (if applicable) | Very High | Only for physical retail |

---

## Cost Estimation for Indigo

### Small Tenant (1,000 orders/month)
| Service | Estimated Monthly Cost |
|---------|------------------------|
| Bedrock (descriptions) | $50-100 |
| Personalize | $200-500 |
| Fraud Detector | $50-100 |
| OpenSearch | $100-200 |
| **Total** | **$400-900/month** |

### Medium Tenant (10,000 orders/month)
| Service | Estimated Monthly Cost |
|---------|------------------------|
| Bedrock (descriptions + chatbot) | $200-500 |
| Personalize | $500-1,500 |
| Fraud Detector | $200-500 |
| OpenSearch | $300-600 |
| Connect (if enabled) | $500-1,000 |
| **Total** | **$1,700-4,100/month** |

### Large Tenant (100,000+ orders/month)
| Service | Estimated Monthly Cost |
|---------|------------------------|
| Bedrock (full suite) | $1,000-3,000 |
| Personalize | $2,000-5,000 |
| Fraud Detector | $1,000-2,500 |
| OpenSearch | $1,000-2,000 |
| Connect | $2,000-5,000 |
| Supply Chain | $1,500-4,000 |
| **Total** | **$8,500-21,500/month** |

---

## Implementation Roadmap

### Phase 1: Core AI Enhancement (Q1)
1. ✅ Bedrock integration (complete)
2. ✅ Personalize recommendations (complete)
3. 🔲 Fraud Detector at checkout
4. 🔲 Enhanced AI product descriptions

### Phase 2: Customer Experience (Q2)
1. 🔲 Amazon Connect support widget
2. 🔲 Lex chatbot for order status
3. 🔲 Location Service for delivery tracking
4. 🔲 Amazon Q for dashboard insights

### Phase 3: Advanced Operations (Q3-Q4)
1. 🔲 AWS Supply Chain for enterprise tenants
2. 🔲 Clean Rooms for advertising partners
3. 🔲 IoT integration for physical retail
4. 🔲 Advanced analytics with QuickSight

---

## References

- [AWS Web Store Guidance](https://aws.amazon.com/solutions/guidance/web-store-on-aws/)
- [Amazon Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
- [Amazon Personalize Case Studies](https://aws.amazon.com/personalize/)
- [AWS Fraud Detector Features](https://aws.amazon.com/fraud-detector/features/)
- [Amazon Connect Pricing](https://aws.amazon.com/connect/pricing/)
- [AWS Supply Chain Features](https://aws.amazon.com/aws-supply-chain/features/)
- [Amazon Q Business Pricing](https://aws.amazon.com/q/business/pricing/)
- [AWS Clean Rooms Features](https://aws.amazon.com/clean-rooms/features/)
- [Amazon Location Service FAQs](https://aws.amazon.com/location/faqs/)
- [AWS IoT Core Pricing](https://aws.amazon.com/iot-core/pricing/)

---

*Document generated: January 2025*
*Content was rephrased for compliance with licensing restrictions*
