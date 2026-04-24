# AWS Integration Architecture Analysis - Indigo E-Commerce Platform

## Executive Summary

The Indigo platform has a **well-structured AWS integration** with 11 services organized into two phases:
- **Phase 1 (Foundation)**: S3, SES, Rekognition, Bedrock, Comprehend, Translate, Polly, Textract
- **Phase 2 (Personalization)**: Personalize, OpenSearch, Forecast

### Key Findings

✅ **Strengths:**
- Clean abstraction layer in `src/infrastructure/aws/`
- Consistent error handling and logging patterns
- Lazy-initialized clients (memory efficient)
- Tenant isolation built into S3 key structure
- Feature flags for service enablement
- Comprehensive type safety with TypeScript

⚠️ **Opportunities:**
- No unified error handling/retry logic across services
- Limited observability (logging only, no metrics/tracing)
- Duplicate client initialization patterns
- No circuit breaker or fallback patterns
- Missing request validation middleware
- No rate limiting or quota management

## Current Architecture

### Service Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                    Indigo E-Commerce                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dashboard          Storefront         Visual Editor        │
│  ├─ Products       ├─ Search           ├─ Layers Panel     │
│  ├─ Orders         ├─ Recommendations  └─ Preview          │
│  ├─ Inventory      └─ Personalization                      │
│  └─ Analytics                                               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│              Infrastructure Services Layer                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AWS Service Abstraction Layer                │  │
│  │  src/infrastructure/aws/                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Storage   │  │   AI/ML      │  │   Analytics      │  │
│  ├─────────────┤  ├──────────────┤  ├──────────────────┤  │
│  │ S3 (Media)  │  │ Bedrock      │  │ OpenSearch       │  │
│  │ CloudFront  │  │ Rekognition  │  │ Forecast         │  │
│  │             │  │ Comprehend   │  │ SageMaker Canvas │  │
│  │             │  │ Translate    │  │ Personalize      │  │
│  │             │  │ Polly        │  │                  │  │
│  │             │  │ Textract     │  │                  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Communication                                        │  │
│  │ ├─ SES (Email)                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation Services

#### 1. **S3 (Media Storage)**
- **File**: `src/infrastructure/aws/s3.ts`
- **Purpose**: Media asset storage with CloudFront CDN delivery
- **Key Features**:
  - Tenant-isolated storage (`tenants/{tenantId}/{folder}/`)
  - Presigned URLs for direct uploads
  - CDN URL generation
  - Immutable caching headers
- **Usage Points**:
  - Product images: `src/app/api/media/upload/route.ts`
  - Invoice storage: `src/app/api/invoice/scan/route.ts`
  - Media library: `src/features/media/components/media-library.tsx`

#### 2. **SES (Email)**
- **File**: `src/infrastructure/aws/ses.ts`
- **Purpose**: Transactional email delivery
- **Key Features**:
  - Email verification (sandbox mode support)
  - Batch email sending
  - Reply-to configuration
  - HTML + text variants
- **Usage Points**:
  - Order confirmations: `src/infrastructure/inngest/functions/send-order-confirmation.ts`
  - Notifications: `src/infrastructure/services/email/actions.ts`

#### 3. **Rekognition (Image Analysis)**
- **File**: `src/infrastructure/aws/rekognition.ts`
- **Purpose**: Image moderation, labeling, and OCR
- **Key Features**:
  - Content moderation (inappropriate content detection)
  - Label detection (auto-tagging)
  - Text detection (OCR for product labels)
  - Comprehensive image analysis
- **Usage Points**:
  - Media upload: `src/app/api/media/upload/route.ts`
  - Product AI actions: `src/app/dashboard/products/ai-actions.ts`

#### 4. **Bedrock (Generative AI)**
- **File**: `src/infrastructure/aws/bedrock.ts`
- **Purpose**: AI content generation
- **Key Features**:
  - Product description generation
  - Marketing copy creation
  - Content translation
  - Customer support responses
  - Model flexibility (Claude, Nova, Llama, Mistral)
- **Usage Points**:
  - Product descriptions: `src/app/dashboard/products/ai-actions.ts`
  - Order insights: `src/app/dashboard/orders/ai-actions.ts`
  - Search enhancement: `src/features/search/ai-search.ts`

#### 5. **Comprehend (NLP)**
- **File**: `src/infrastructure/aws/comprehend.ts`
- **Purpose**: Natural language processing
- **Key Features**:
  - Sentiment analysis
  - Key phrase extraction
  - Entity recognition
  - Language detection
  - Batch processing (up to 25 documents)
- **Usage Points**:
  - Review analysis: `src/features/reviews/repositories/reviews.ts`
  - Order sentiment: `src/app/dashboard/orders/ai-actions.ts`

#### 6. **Translate (Multi-Language)**
- **File**: `src/infrastructure/aws/translate.ts`
- **Purpose**: Content translation
- **Key Features**:
  - 17+ language support
  - Auto-language detection
  - Product content translation
  - Batch translation
- **Usage Points**:
  - Product translation: `src/app/api/translate/product/route.ts`
  - Multi-language support: `src/app/dashboard/products/ai-actions.ts`

#### 7. **Polly (Text-to-Speech)**
- **File**: `src/infrastructure/aws/polly.ts`
- **Purpose**: Audio generation for accessibility
- **Key Features**:
  - Neural voice synthesis
  - Multiple language support
  - SSML support for pronunciation control
  - MP3/OGG output formats
- **Usage Points**:
  - Product audio: `src/app/api/audio/product/route.ts`
  - Accessibility features: `src/features/products/components/audio-description.tsx`

#### 8. **Textract (Document Processing)**
- **File**: `src/infrastructure/aws/textract.ts`
- **Purpose**: OCR and document analysis
- **Key Features**:
  - Invoice/receipt processing
  - Form data extraction
  - Table extraction
  - Supplier invoice processing
- **Usage Points**:
  - Invoice scanning: `src/app/api/invoice/scan/route.ts`
  - Order processing: `src/features/orders/components/invoice-scanner.tsx`

### Phase 2: Personalization Services

#### 9. **Personalize (Recommendations)**
- **File**: `src/infrastructure/aws/personalize.ts`
- **Purpose**: ML-powered product recommendations
- **Key Features**:
  - Real-time personalized recommendations
  - Similar items recommendations
  - Personalized ranking
  - Event tracking (view, click, purchase, wishlist)
  - User/item metadata updates
- **Usage Points**:
  - Recommendations widget: `src/features/recommendations/components/recommendations-widget.tsx`
  - Related products: `src/features/recommendations/components/related-products.tsx`
  - Recommendation actions: `src/features/recommendations/actions.ts`

#### 10. **OpenSearch (Full-Text Search)**
- **File**: `src/infrastructure/aws/opensearch.ts`
- **Purpose**: Advanced product search with faceting
- **Key Features**:
  - Full-text search with typo tolerance
  - Faceted filtering (category, price, vendor, etc.)
  - Autocomplete suggestions
  - Synonym support
  - Bulk indexing
- **Usage Points**:
  - Product search: `src/features/search/opensearch-search.ts`
  - Search sync: `src/infrastructure/inngest/functions/sync-opensearch.ts`

#### 11. **Forecast (Demand Forecasting)**
- **File**: `src/infrastructure/aws/forecast.ts`
- **Purpose**: Inventory demand prediction
- **Key Features**:
  - Local forecasting algorithms (moving average, trend analysis)
  - SageMaker Canvas integration (premium option)
  - Stock-out risk calculation
  - Seasonal trend detection
  - Inventory insights generation
- **Usage Points**:
  - Forecast insights: `src/app/api/inventory/forecast-insights/route.ts`
  - Inventory dashboard: `src/features/inventory/components/forecast-insights.tsx`

#### 12. **SageMaker Canvas (No-Code ML)**
- **File**: `src/infrastructure/aws/sagemaker-canvas.ts`
- **Purpose**: Professional ML model training without code
- **Key Features**:
  - Automated model training
  - Feature engineering
  - Model explainability
  - Batch forecasting
  - Setup instructions and cost estimation
- **Status**: Optional premium feature for Forecast

## Integration Patterns

### 1. **Lazy Client Initialization**
```typescript
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({ region, credentials });
  }
  return s3Client;
}
```
**Benefit**: Clients only created when needed, reduces memory footprint

### 2. **Tenant Isolation**
```typescript
// S3 key structure
`tenants/${tenantId}/${folder}/${filename}`

// Database queries
where(eq(products.tenantId, tenantId))
```
**Benefit**: Multi-tenant security, data isolation

### 3. **Feature Flags**
```typescript
export function isOpenSearchEnabled(): boolean {
  return process.env.AWS_OPENSEARCH_ENABLED === 'true' && !!DOMAIN_ENDPOINT;
}
```
**Benefit**: Services can be toggled without code changes

### 4. **Consistent Error Handling**
```typescript
try {
  // AWS operation
} catch (error) {
  console.error('[Service] Operation failed:', error);
  return { success: false, error: error.message };
}
```
**Benefit**: Predictable error responses across all services

### 5. **Fallback Patterns**
```typescript
// Try Canvas first, fallback to local
if (isCanvasEnabled()) {
  const result = await generateCanvasForecast(...);
  if (result.success) return result;
}
return queryLocalForecast(...);
```
**Benefit**: Graceful degradation when premium services unavailable

## Usage Patterns by Feature

### Product Management
- **AI Description Generation**: Bedrock → Product descriptions
- **Image Analysis**: Rekognition → Auto-tagging, moderation
- **Translation**: Translate → Multi-language content
- **Audio**: Polly → Accessibility features

### Order Processing
- **Invoice Processing**: Textract → Supplier invoices
- **Sentiment Analysis**: Comprehend → Customer feedback
- **Email**: SES → Order confirmations, notifications
- **AI Insights**: Bedrock → Order recommendations

### Search & Discovery
- **Full-Text Search**: OpenSearch → Product search
- **Autocomplete**: OpenSearch → Search suggestions
- **Recommendations**: Personalize → Related products
- **AI Search**: Bedrock → Semantic search enhancement

### Inventory Management
- **Demand Forecasting**: Forecast/Canvas → Stock predictions
- **Risk Analysis**: Forecast → Stock-out warnings
- **Seasonal Trends**: Forecast → Demand patterns

### Media Management
- **Storage**: S3 → Media assets
- **CDN**: CloudFront → Fast delivery
- **Moderation**: Rekognition → Content safety
- **OCR**: Textract → Text extraction

## Configuration & Environment

### Required Environment Variables
```bash
# Core AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***

# S3
AWS_S3_BUCKET=indigo-media-assets
AWS_CLOUDFRONT_DOMAIN=d1s07hm6t7mxic.cloudfront.net

# SES
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@indigo.store

# Bedrock
AWS_BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
AWS_BEDROCK_REGION=us-east-1

# Service Enablement Flags
AWS_REKOGNITION_ENABLED=true
AWS_COMPREHEND_ENABLED=true
AWS_TRANSLATE_ENABLED=true
AWS_POLLY_ENABLED=true
AWS_TEXTRACT_ENABLED=true
AWS_PERSONALIZE_ENABLED=true
AWS_OPENSEARCH_ENABLED=true
AWS_FORECAST_ENABLED=true
AWS_SAGEMAKER_CANVAS_ENABLED=true

# Personalize
AWS_PERSONALIZE_CAMPAIGN_ARN=arn:aws:personalize:...
AWS_PERSONALIZE_TRACKING_ID=...

# OpenSearch
AWS_OPENSEARCH_DOMAIN_ENDPOINT=https://...
AWS_OPENSEARCH_INDEX_PREFIX=indigo

# SageMaker Canvas
AWS_SAGEMAKER_CANVAS_ENABLED=true
AWS_SAGEMAKER_STUDIO_DOMAIN_ID=...
AWS_SAGEMAKER_CANVAS_EXECUTION_ROLE=arn:aws:iam::...
```

## Abstraction Opportunities

### 1. **Unified Error Handling Layer**
Create a centralized error handler with:
- Retry logic (exponential backoff)
- Circuit breaker pattern
- Error categorization (transient vs permanent)
- Metrics collection

### 2. **Provider-Agnostic Interfaces**
Define interfaces for common operations:
```typescript
interface StorageProvider {
  upload(file: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

interface EmailProvider {
  send(options: SendEmailOptions): Promise<EmailResult>;
  verify(email: string): Promise<void>;
}

interface AIProvider {
  generateText(prompt: string): Promise<string>;
  analyzeImage(image: Buffer): Promise<ImageAnalysis>;
}
```

### 3. **Observability Layer**
Add comprehensive logging/metrics:
- Request/response logging
- Performance metrics (latency, throughput)
- Error tracking and alerting
- Cost tracking per service

### 4. **Request Validation Middleware**
Validate inputs before AWS calls:
- File size limits
- Email format validation
- Text length constraints
- Rate limiting per tenant

### 5. **Caching Layer**
Cache expensive operations:
- Product descriptions (24h)
- Translations (permanent)
- Search results (1h)
- Recommendations (6h)

## Recommendations

### Short Term (1-2 weeks)
1. Add comprehensive error handling wrapper
2. Implement request validation middleware
3. Add observability (logging, metrics)
4. Create provider-agnostic interfaces

### Medium Term (1 month)
1. Implement circuit breaker pattern
2. Add caching layer
3. Create cost tracking dashboard
4. Add rate limiting per tenant

### Long Term (2-3 months)
1. Support alternative providers (Google Cloud, Azure)
2. Implement multi-region failover
3. Add ML model versioning
4. Create admin dashboard for service management

## Cost Optimization

### Current Services Costs (Estimated Monthly)
- **S3**: $0.50-2 (storage) + $0.01-0.05 (requests)
- **SES**: $0.10 per 1000 emails
- **Rekognition**: $0.001 per image
- **Bedrock**: $0.003-0.015 per 1K tokens
- **Comprehend**: $0.0001 per unit
- **Translate**: $15 per 1M characters
- **Polly**: $0.000004 per character
- **Textract**: $0.015 per page
- **Personalize**: $0.50-1.50 per campaign
- **OpenSearch**: $50-200 (domain)
- **Forecast**: $0.50-2 per forecast

**Total Estimated**: $100-300/month (varies with usage)

### Optimization Strategies
1. Use local forecasting instead of Canvas when possible
2. Batch Comprehend operations (up to 25 documents)
3. Cache translations (permanent)
4. Use S3 lifecycle policies for old media
5. Monitor Bedrock token usage
6. Implement request deduplication

## Security Considerations

✅ **Current Protections**:
- Tenant isolation in S3 keys
- IAM role-based access
- Environment variable secrets
- HTTPS for all communications

⚠️ **Recommendations**:
- Implement request signing for sensitive operations
- Add encryption at rest for sensitive data
- Implement audit logging for all AWS operations
- Use VPC endpoints for private connectivity
- Implement API rate limiting per tenant
- Add request validation and sanitization

## Conclusion

The Indigo platform has a **solid AWS integration foundation** with good separation of concerns and consistent patterns. The main opportunities are:

1. **Unified error handling** across all services
2. **Observability** (logging, metrics, tracing)
3. **Provider abstraction** for flexibility
4. **Request validation** and rate limiting
5. **Caching** for cost optimization

These improvements would make the system more resilient, observable, and cost-effective while maintaining the current clean architecture.
