# AWS Integration Plan for Indigo E-commerce Platform

This document outlines how AWS services can enhance the Indigo multi-tenant e-commerce platform with AI/ML capabilities, scalable infrastructure, and cost-effective operations.

---

## Current AWS Setup

| Service | Purpose | Status |
|---------|---------|--------|
| **S3** | Media storage (product images, assets) | ✅ Active |
| **CloudFront** | CDN for fast global delivery | ✅ Active |
| **SES** | Transactional emails (alternative to Resend) | ✅ Configured |
| **Rekognition** | Image moderation & auto-tagging | ✅ Implemented |
| **Bedrock** | AI content generation | ✅ Implemented |
| **Comprehend** | Sentiment analysis & NLP | ✅ Implemented |

---

## Feature Enhancements (Implemented)

### 1. AI-Powered Product Creation
**Files:**
- `src/app/dashboard/products/ai-actions.ts` - Server actions for AI generation
- `src/features/products/components/ai-description-generator.tsx` - UI component

**Capabilities:**
- Generate SEO-optimized product descriptions
- Auto-suggest product tags from description
- Extract key phrases for SEO metadata
- Support multiple tones (professional, casual, luxury, playful)

### 2. Intelligent Image Upload
**Files:**
- `src/app/api/media/upload/route.ts` - Enhanced with moderation

**Capabilities:**
- Auto-moderate images for inappropriate content
- Extract product labels from images
- Suggest tags based on image analysis
- Block flagged images with review workflow

### 3. Marketing Copy Generator
**Files:**
- `src/features/marketing/components/ai-copy-generator.tsx` - UI component

**Capabilities:**
- Generate email subject lines and preview text
- Create social media posts with hashtags
- Write banner headlines and subheadlines
- Compose SMS promotional messages

### 4. Customer Reviews with Sentiment Analysis
**Files:**
- `src/features/reviews/` - Complete reviews feature module
- `src/db/schema/reviews.ts` - Database schema
- `src/app/dashboard/reviews/` - Dashboard management page

**Capabilities:**
- Automatic sentiment analysis (positive/negative/neutral/mixed)
- Key phrase extraction from reviews
- Spam detection scoring
- Review moderation workflow
- Sentiment statistics dashboard

### 5. Product Recommendations
**Files:**
- `src/features/recommendations/` - Recommendations feature module

**Capabilities:**
- Personalized recommendations based on purchase history
- Related products by category
- Trending products based on recent sales
- Collaborative filtering (customers who bought X also bought Y)

### 6. AI-Enhanced Search
**Files:**
- `src/features/search/ai-search.ts` - AI search functionality

**Capabilities:**
- Full-text search across products, categories, collections
- AI-powered suggestions when no results found
- Autocomplete as user types
- Popular search terms

---

## Recommended AWS Services by Priority

### 🔴 High Priority (Immediate Value)

#### 1. Amazon Rekognition - Image Moderation & Analysis
**Use Cases:**
- Auto-moderate product images for inappropriate content
- Extract product attributes from images (color, category)
- Detect text in product images (brand names, labels)
- Similar product search via visual similarity

**Implementation:**
```typescript
// src/infrastructure/aws/rekognition.ts
import { RekognitionClient, DetectModerationLabelsCommand, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

export async function moderateProductImage(imageKey: string) {
  const response = await rekognition.send(new DetectModerationLabelsCommand({
    Image: { S3Object: { Bucket: process.env.AWS_S3_BUCKET, Name: imageKey } },
    MinConfidence: 75
  }));
  return response.ModerationLabels?.length === 0; // true if safe
}

export async function extractProductLabels(imageKey: string) {
  const response = await rekognition.send(new DetectLabelsCommand({
    Image: { S3Object: { Bucket: process.env.AWS_S3_BUCKET, Name: imageKey } },
    MaxLabels: 10
  }));
  return response.Labels; // ['Clothing', 'T-Shirt', 'Blue', ...]
}
```

**Cost:** ~$1 per 1,000 images analyzed

---

#### 2. Amazon Bedrock - AI Product Descriptions & Chat
**Use Cases:**
- Generate SEO-optimized product descriptions from images
- AI-powered customer support chatbot
- Translate product content to multiple languages
- Generate marketing copy for campaigns

**Implementation:**
```typescript
// src/infrastructure/aws/bedrock.ts
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export async function generateProductDescription(productName: string, attributes: string[]) {
  const prompt = `Generate a compelling e-commerce product description for "${productName}" with these attributes: ${attributes.join(', ')}. Include SEO keywords.`;
  
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    body: JSON.stringify({ prompt, max_tokens: 500 })
  }));
  
  return JSON.parse(new TextDecoder().decode(response.body)).completion;
}
```

**Cost:** ~$0.003 per 1K input tokens, $0.015 per 1K output tokens

---

#### 3. Amazon SQS + Lambda - Background Job Processing
**Use Cases:**
- Replace/supplement Inngest for background jobs
- Order processing pipeline (inventory, notifications, fulfillment)
- Bulk product imports
- Report generation

**Architecture:**
```
Order Created → SNS Topic → SQS Queues → Lambda Functions
                              ├── inventory-queue → decrement-stock
                              ├── email-queue → send-confirmation
                              ├── analytics-queue → update-metrics
                              └── fulfillment-queue → notify-warehouse
```

**Benefits over Inngest:**
- Native AWS integration
- Pay-per-use (no monthly fees)
- Better for high-volume processing
- Dead letter queues for failed jobs

---

### 🟡 Medium Priority (Enhanced Features)

#### 4. Amazon Personalize - Product Recommendations
**Use Cases:**
- "Customers also bought" recommendations
- Personalized homepage for each customer
- Email recommendations based on browsing history
- Cross-sell suggestions at checkout

**Data Requirements:**
- Minimum 50,000 interactions
- At least 1,000 users with 2+ interactions each

**Implementation Flow:**
1. Stream user interactions (views, purchases, cart adds) to S3
2. Train recommendation model in Personalize
3. Call real-time API for recommendations
4. Cache results in Redis/DynamoDB

**Cost:** ~$0.05 per 1,000 recommendations

---

#### 5. Amazon Comprehend - Sentiment Analysis
**Use Cases:**
- Analyze customer reviews for sentiment
- Detect toxic/spam reviews automatically
- Extract key phrases from feedback
- Identify trending topics in reviews

**Implementation:**
```typescript
// src/infrastructure/aws/comprehend.ts
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';

export async function analyzeReviewSentiment(reviewText: string) {
  const response = await comprehend.send(new DetectSentimentCommand({
    Text: reviewText,
    LanguageCode: 'en'
  }));
  
  return {
    sentiment: response.Sentiment, // POSITIVE, NEGATIVE, NEUTRAL, MIXED
    scores: response.SentimentScore
  };
}
```

**Cost:** ~$0.0001 per unit (100 characters)

---

#### 6. Amazon Textract - Invoice/Receipt Processing
**Use Cases:**
- Auto-extract data from supplier invoices
- Process customer receipts for returns
- Digitize paper-based inventory documents

**Cost:** ~$1.50 per 1,000 pages

---

### 🟢 Lower Priority (Future Enhancements)

#### 7. Amazon Translate - Multi-language Support
- Translate product descriptions automatically
- Support customer service in multiple languages
- Cost: ~$15 per million characters

#### 8. Amazon Polly - Voice Features
- Read product descriptions aloud (accessibility)
- Voice notifications for merchants
- Cost: ~$4 per million characters

#### 9. AWS Step Functions - Complex Workflows
- Multi-step order fulfillment workflows
- Return/refund processing pipelines
- Inventory replenishment automation

#### 10. Amazon EventBridge - Event-Driven Architecture
- Cross-service event routing
- Third-party integrations (Shopify, WooCommerce sync)
- Scheduled tasks (daily reports, cleanup jobs)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Add Rekognition for image moderation on upload
- [ ] Implement SQS queues for order processing
- [ ] Create Lambda functions for background jobs

### Phase 2: AI Features (Week 3-4)
- [ ] Integrate Bedrock for product description generation
- [ ] Add Comprehend for review sentiment analysis
- [ ] Build AI-powered search suggestions

### Phase 3: Personalization (Week 5-6)
- [ ] Set up Personalize data pipeline
- [ ] Train initial recommendation models
- [ ] Implement recommendation widgets

### Phase 4: Advanced (Week 7-8)
- [ ] Add Textract for invoice processing
- [ ] Implement multi-language support with Translate
- [ ] Build complex workflows with Step Functions

---

## Cost Estimation (Monthly)

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| S3 | 100GB storage | $2.30 |
| CloudFront | 500GB transfer | $42.50 |
| SES | 10,000 emails | $1.00 |
| Rekognition | 50,000 images | $50.00 |
| Bedrock | 1M tokens | $18.00 |
| SQS | 1M messages | $0.40 |
| Lambda | 1M invocations | $0.20 |
| Comprehend | 100K reviews | $10.00 |
| Personalize | 100K recommendations | $5.00 |
| **Total** | | **~$130/month** |

*Costs scale with usage. Free tier covers initial development.*

---

## Environment Variables to Add

```bash
# AWS AI/ML Services
AWS_REKOGNITION_ENABLED=true
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
AWS_COMPREHEND_ENABLED=true
AWS_PERSONALIZE_CAMPAIGN_ARN=arn:aws:personalize:us-east-1:xxx:campaign/indigo-recommendations

# AWS Messaging
AWS_SQS_ORDER_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/xxx/indigo-orders
AWS_SNS_ORDER_TOPIC_ARN=arn:aws:sns:us-east-1:xxx:indigo-order-events
```

---

## Security Considerations

1. **IAM Roles**: Use least-privilege policies for each service
2. **VPC**: Consider VPC endpoints for S3, SQS, Lambda
3. **Encryption**: Enable KMS encryption for sensitive data
4. **Logging**: Enable CloudTrail for audit logging
5. **Multi-tenant Isolation**: Tag resources with tenantId for cost allocation

---

## References

- [AWS Guidance for Unified Commerce](https://aws.amazon.com/solutions/guidance/unified-commerce-on-aws)
- [AWS Retail Personalization](https://aws.amazon.com/solutions/guidance/retail-personalization-on-aws/)
- [Generating Product Descriptions with Bedrock](https://aws.amazon.com/solutions/guidance/generating-product-descriptions-with-amazon-bedrock/)
- [Serverless E-commerce Order Processing](https://community.aws/content/2eUDJcXzAwiRSCi8WDwA64HbnQz/)

