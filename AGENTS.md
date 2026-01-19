# AGENTS.md

> Instructions for AI coding agents working on the Indigo e-commerce platform.

## Project Overview

Indigo is a multi-tenant e-commerce platform built with Next.js 16, featuring:
- **Dashboard** - Admin panel for managing products, orders, customers, inventory
- **Storefront** - Customer-facing store with dynamic theming per tenant
- **Visual Editor** - Drag-and-drop visual editor for storefront customization
- **Multi-tenancy** - Each tenant has isolated data with Row Level Security (RLS)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + Vercel Geist Design System
- **State**: Zustand for client state
- **Payments**: Stripe Connect
- **Background Jobs**: Inngest
- **Testing**: Vitest (unit), Playwright (E2E)

## Setup Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run unit tests
pnpm test

# Run E2E tests
pnpm playwright test

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Database migrations
pnpm db:push
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (editor)/          # Visual editor
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard pages
│   └── store/[slug]/      # Tenant storefronts
├── components/
│   ├── ui/                # Shared UI components (shadcn/ui + Geist)
│   ├── dashboard/         # Dashboard-specific components
│   ├── store/             # Storefront components
│   └── landing/           # Marketing pages
├── features/              # Domain modules (feature-based architecture)
│   ├── products/          # Product management
│   ├── orders/            # Order processing
│   ├── customers/         # Customer management
│   ├── inventory/         # Stock management
│   └── editor/            # Visual editor logic
├── infrastructure/        # Cross-cutting concerns
│   ├── db/               # Database utilities
│   ├── auth/             # Authentication
│   ├── cache/            # Caching layer
│   ├── inngest/          # Background jobs
│   └── services/         # Shared services
├── db/schema/            # Drizzle ORM schemas
├── hooks/                # React hooks
├── shared/               # Shared utilities
│   ├── i18n/            # Internationalization
│   ├── currency/        # Multi-currency support
│   └── validations/     # Zod schemas
└── styles/              # Global styles and tokens
```

## Design System (Vercel/Geist + OKLCH)

### OKLCH Color System
All colors use OKLCH for perceptual uniformity:
- Same lightness = same perceived brightness across hues
- Better dark mode with "double the distance" rule
- Easy theming by adjusting hue

### Color Variables
Always use CSS variables, never hardcoded colors:
```tsx
// ✅ Correct
className="text-[var(--ds-gray-900)] bg-[var(--ds-gray-100)]"

// ❌ Wrong
className="text-gray-900 bg-gray-100"
```

Color scale (100-1000):
- `--ds-gray-100` → Subtle backgrounds, hover states
- `--ds-gray-200` → Selected states, light borders
- `--ds-gray-300` → Borders, dividers
- `--ds-gray-500` → Placeholder text
- `--ds-gray-600` → Secondary text, icons
- `--ds-gray-800` → Body text
- `--ds-gray-900` → Headings
- `--ds-gray-1000` → Maximum emphasis

Status colors: `--ds-green-*`, `--ds-red-*`, `--ds-amber-*`, `--ds-blue-*`

Chart colors (perceptually uniform): `--ds-chart-red`, `--ds-chart-blue`, etc.

Brand theming: Set `--ds-brand-hue` to change accent color (0-360)

### Component Sizing
| Size | Height | Use Case |
|------|--------|----------|
| sm | h-8 (32px) | Dense UIs, table actions |
| md | h-10 (40px) | Default buttons, inputs |
| lg | h-12 (48px) | Primary CTAs |

### Spacing (4px base)
Use Tailwind spacing: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px)

### Border Radius
- `rounded-sm` → Badges, tags
- `rounded-md` → Buttons, inputs (interactive elements)
- `rounded-lg` → Cards, dropdowns
- `rounded-xl` → Dialogs, modals

### Icons
- Default size: `h-4 w-4` (16px)
- Use Lucide React icons
- Always include `aria-label` for icon-only buttons

## Code Style

### TypeScript
- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Use `as const` for literal types
- Export types from feature modules

### React Components
```tsx
// Prefer function declarations for components
export function ProductCard({ product }: ProductCardProps) {
  // ...
}

// Use 'use client' only when necessary
'use client'

// Colocate types with components
interface ProductCardProps {
  product: Product
}
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-currency.ts`)
- Hooks: `use-*.ts` (e.g., `use-products.ts`)
- Types: `*.types.ts` or inline

### Imports
```tsx
// Order: React → External → Internal → Relative → Types
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { formatPrice } from './utils'
import type { Product } from '@/features/products/types'
```

## Database Patterns

### Drizzle ORM
- Schemas in `src/db/schema/`
- Use `eq()`, `and()`, `or()` for queries
- Always include `tenantId` in queries for multi-tenancy

### Row Level Security
All tables have RLS policies. When querying:
```ts
// Always filter by tenant
const products = await db.query.products.findMany({
  where: eq(products.tenantId, tenantId)
})
```

## AWS Abstraction Layer

### Overview

The platform uses a unified abstraction layer for all external services, providing:
- **Provider Flexibility** - Switch between AWS, local, or alternative providers via environment variables
- **Consistent Error Handling** - Automatic retries with exponential backoff
- **Observability** - Built-in metrics, logging, and tracing for all operations
- **Circuit Breakers** - Protection against cascading failures for expensive operations
- **Type Safety** - Full TypeScript support with proper type inference
- **Testability** - Local providers enable development without AWS credentials

### Available Services

1. **StorageService** - File upload, deletion, URL generation (S3 or local filesystem)
2. **EmailService** - Send emails, batch sending, identity verification (SES or local mock)
3. **AIService** - Text generation, image analysis, translation, OCR, sentiment analysis, TTS (Bedrock/Rekognition or local mock)
4. **SearchService** - Product indexing, search, autocomplete (OpenSearch or database fallback)
5. **RecommendationService** - Personalized recommendations, similar items, interaction tracking (Personalize or collaborative filtering)
6. **ForecastService** - Demand forecasting, stock-out risk, seasonal trends (SageMaker Canvas or statistical models)

### Service Usage Examples

#### StorageService

```typescript
import { StorageService } from '@/infrastructure/services';

// Upload file
const storage = new StorageService();
const result = await storage.upload(fileBuffer, {
  tenantId: 'tenant-123',
  filename: 'product-image.jpg',
  contentType: 'image/jpeg',
  folder: 'products',
});

if (result.success) {
  console.log('File uploaded:', result.key);
  const publicUrl = storage.getUrl(result.key);
  
  // Get presigned URL for private access
  const privateUrl = await storage.getPresignedUrl(result.key, 3600); // 1 hour
}

// Delete file
await storage.delete('tenant-123/products/product-image.jpg');

// Check if file exists
const exists = await storage.exists('tenant-123/products/product-image.jpg');

// List files
const { success, files } = await storage.list('tenant-123/products/', 100);
```

#### EmailService

```typescript
import { EmailService } from '@/infrastructure/services';

// Send single email
const email = new EmailService();
const result = await email.send({
  to: 'customer@example.com',
  subject: 'Order Confirmation',
  html: '<h1>Thank you for your order!</h1>',
  text: 'Thank you for your order!',
  from: 'noreply@yourstore.com',
});

if (result.success) {
  console.log('Email sent:', result.messageId);
}

// Send batch emails
const results = await email.sendBatch([
  { to: 'user1@example.com', subject: 'Welcome', html: '<p>Welcome!</p>' },
  { to: 'user2@example.com', subject: 'Welcome', html: '<p>Welcome!</p>' },
]);

// Verify email identity (required for AWS SES)
await email.verify('noreply@yourstore.com');

// Check if email is verified
const isVerified = await email.isVerified('noreply@yourstore.com');
```

#### AIService

```typescript
import { AIService } from '@/infrastructure/services';

const ai = new AIService();

// Generate text
const result = await ai.generateText(
  'Write a product description for a wireless keyboard',
  {
    tone: 'professional',
    length: 'medium',
    maxTokens: 500,
    temperature: 0.7,
  }
);

if (result.success) {
  console.log('Generated text:', result.content);
}

// Analyze image
const imageAnalysis = await ai.analyzeImage(imageBuffer, {
  detectLabels: true,
  detectText: true,
  moderateContent: true,
  maxLabels: 10,
  minConfidence: 80,
});

if (imageAnalysis.success) {
  console.log('Labels:', imageAnalysis.labels);
  console.log('Text:', imageAnalysis.text);
  console.log('Moderation:', imageAnalysis.moderation);
}

// Extract text from document (OCR)
const ocrResult = await ai.extractText(documentBuffer);
if (ocrResult.success) {
  console.log('Extracted text:', ocrResult.text);
}

// Analyze sentiment
const sentiment = await ai.analyzeSentiment('This product is amazing!');
if (sentiment.success) {
  console.log('Sentiment:', sentiment.sentiment); // 'positive', 'negative', 'neutral'
  console.log('Confidence:', sentiment.confidence);
}

// Translate text
const translation = await ai.translateText(
  'Hello, world!',
  'es', // target language
  'en'  // source language (optional, auto-detect if omitted)
);

if (translation.success) {
  console.log('Translated:', translation.translatedText);
}

// Text-to-speech
const audio = await ai.synthesizeSpeech('Welcome to our store', {
  voiceId: 'Joanna',
  languageCode: 'en-US',
  format: 'mp3',
});

if (audio.success) {
  console.log('Audio URL:', audio.audioUrl);
}
```

#### SearchService

```typescript
import { SearchService } from '@/infrastructure/services';

const search = new SearchService();

// Index product
await search.index({
  id: 'product-123',
  tenantId: 'tenant-123',
  name: 'Wireless Keyboard',
  description: 'Ergonomic wireless keyboard',
  price: 49.99,
  category: 'Electronics',
});

// Bulk index products
await search.bulkIndex([
  { id: 'product-1', tenantId: 'tenant-123', name: 'Product 1', price: 10 },
  { id: 'product-2', tenantId: 'tenant-123', name: 'Product 2', price: 20 },
]);

// Search products
const results = await search.search({
  tenantId: 'tenant-123',
  query: 'wireless keyboard',
  filters: { category: 'Electronics' },
  limit: 20,
  offset: 0,
});

if (results.success) {
  console.log('Found:', results.total, 'products');
  console.log('Results:', results.hits);
}

// Autocomplete
const suggestions = await search.autocomplete('wire', 5);
console.log('Suggestions:', suggestions);

// Delete from index
await search.delete('product-123');
```

#### RecommendationService

```typescript
import { RecommendationService } from '@/infrastructure/services';

const recommendations = new RecommendationService();

// Get personalized recommendations
const result = await recommendations.getRecommendations('user-123', {
  tenantId: 'tenant-123',
  limit: 10,
  context: { category: 'Electronics' },
});

if (result.success) {
  console.log('Recommended products:', result.recommendations);
}

// Get similar items
const similar = await recommendations.getSimilarItems('product-123', {
  tenantId: 'tenant-123',
  limit: 5,
});

if (similar.success) {
  console.log('Similar products:', similar.recommendations);
}

// Track user interaction
await recommendations.trackInteraction('user-123', 'product-123', 'view');
await recommendations.trackInteraction('user-123', 'product-456', 'purchase');
```

#### ForecastService

```typescript
import { ForecastService } from '@/infrastructure/services';

const forecast = new ForecastService();

// Forecast demand
const demandForecast = await forecast.forecast('product-123', 30); // 30 days
if (demandForecast.success) {
  console.log('Forecasted demand:', demandForecast.predictions);
}

// Calculate stock-out risk
const risks = await forecast.calculateStockOutRisk([
  { id: 'product-1', currentStock: 10, averageDailySales: 5 },
  { id: 'product-2', currentStock: 50, averageDailySales: 2 },
]);

console.log('Stock-out risks:', risks);

// Get seasonal trends
const trends = await forecast.getSeasonalTrends('category-123');
if (trends.success) {
  console.log('Seasonal trends:', trends.trends);
}
```

### Provider Selection

Configure providers via environment variables:

```bash
# Storage (default: local)
STORAGE_PROVIDER=aws  # or 'local'
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1

# Email (default: local)
EMAIL_PROVIDER=aws  # or 'local'
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourstore.com

# AI (default: local)
AI_PROVIDER=aws  # or 'local'
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Search (default: local)
SEARCH_PROVIDER=aws  # or 'local'
AWS_OPENSEARCH_DOMAIN_ENDPOINT=https://search-domain.region.es.amazonaws.com

# Recommendations (default: local)
RECOMMENDATION_PROVIDER=aws  # or 'local'
AWS_PERSONALIZE_CAMPAIGN_ARN=arn:aws:personalize:region:account:campaign/name

# Forecast (default: local)
FORECAST_PROVIDER=aws  # or 'local'
AWS_SAGEMAKER_CANVAS_ENABLED=true
AWS_SAGEMAKER_REGION=us-east-1
```

### Best Practices

1. **Always use service instances** - Don't call AWS SDKs directly
   ```typescript
   // ✅ Correct
   const storage = new StorageService();
   await storage.upload(file, options);
   
   // ❌ Wrong
   import { uploadToS3 } from '@/infrastructure/aws/s3';
   await uploadToS3(file, options);
   ```

2. **Wrap service calls in try-catch** - Services handle retries, but you should handle final failures
   ```typescript
   try {
     const result = await storage.upload(file, options);
     if (result.success) {
       // Handle success
     } else {
       // Handle validation or business logic errors
     }
   } catch (error) {
     // Handle unexpected errors
   }
   ```

3. **Check the success field** - All service methods return `{ success: boolean; error?: string }`
   ```typescript
   const result = await email.send(options);
   if (!result.success) {
     console.error('Email failed:', result.error);
   }
   ```

4. **Use local providers for development** - No AWS credentials needed
   ```bash
   # .env.local
   STORAGE_PROVIDER=local
   EMAIL_PROVIDER=local
   AI_PROVIDER=local
   SEARCH_PROVIDER=local
   RECOMMENDATION_PROVIDER=local
   FORECAST_PROVIDER=local
   ```

5. **Let services handle retries** - Don't implement your own retry logic
   ```typescript
   // ✅ Correct - service handles retries automatically
   const result = await ai.generateText(prompt);
   
   // ❌ Wrong - don't add your own retry loop
   for (let i = 0; i < 3; i++) {
     const result = await ai.generateText(prompt);
     if (result.success) break;
   }
   ```

### Local Development

Local providers work without AWS credentials and provide:

- **StorageService (local)** - Saves files to `uploads/` directory
- **EmailService (local)** - Logs emails to console (no actual sending)
- **AIService (local)** - Returns mock data for all AI operations
- **SearchService (local)** - Uses database queries with full-text search
- **RecommendationService (local)** - Uses collaborative filtering algorithm
- **ForecastService (local)** - Uses statistical models (moving average, exponential smoothing)

This enables:
- ✅ Faster development (no network calls)
- ✅ No AWS costs during development
- ✅ Offline development
- ✅ Consistent test data

### Migration from Direct AWS

If you find code using direct AWS imports, migrate to the abstraction layer:

**Before**:
```typescript
import { uploadToS3 } from '@/infrastructure/aws/s3';
import { sendEmail } from '@/infrastructure/aws/ses';
import { generateText } from '@/infrastructure/aws/bedrock';

const s3Result = await uploadToS3(file, { tenantId, filename });
await sendEmail({ to, subject, html });
const text = await generateText(prompt);
```

**After**:
```typescript
import { StorageService, EmailService, AIService } from '@/infrastructure/services';

const storage = new StorageService();
const email = new EmailService();
const ai = new AIService();

const uploadResult = await storage.upload(file, { tenantId, filename });
await email.send({ to, subject, html });
const textResult = await ai.generateText(prompt);
```

See `docs/AWS-ABSTRACTION-LAYER-MIGRATION-COMPLETE.md` for detailed migration guide.

## AWS Well-Architected Tool

### Overview

The platform integrates with AWS Well-Architected Tool to conduct architecture reviews, track improvements, and maintain best practices across AWS workloads.

**Key Features**:
- Create and manage workloads
- Conduct architecture reviews
- Track improvements with milestones
- Get risk assessments and recommendations
- Automate reviews via API
- Generate PDF reports

### Service Usage

```typescript
import { WellArchitectedService } from '@/infrastructure/aws';

const waService = new WellArchitectedService();

// Create a workload
const result = await waService.createWorkload({
  name: 'Indigo E-commerce Platform',
  description: 'Multi-tenant SaaS e-commerce platform',
  environment: 'PRODUCTION',
  awsRegions: ['us-east-1'],
  reviewOwner: 'platform-team@indigo.com',
  architecturalDesign: 'Next.js 16, Supabase, AWS services',
  industry: 'Retail',
  industryType: 'E-commerce',
  lenses: ['wellarchitected'],
  tags: {
    Environment: 'Production',
    Team: 'Platform',
  },
});

if (result.success) {
  console.log('Workload ID:', result.workloadId);
}

// Get risk counts
const risks = await waService.getRiskCounts(workloadId);
console.log('High risks:', risks.high);
console.log('Medium risks:', risks.medium);
console.log('Low risks:', risks.low);

// Create milestone for tracking improvements
const milestone = await waService.createMilestone(
  workloadId,
  'Q1 2024 Review'
);

// Generate PDF report
const report = await waService.getLensReviewReport(
  workloadId,
  'wellarchitected'
);
console.log('Report URL:', report.reportUrl);
```

### Environment Variables

```bash
# AWS Well-Architected Tool
AWS_WELLARCHITECTED_ENABLED=true
AWS_WELLARCHITECTED_REVIEW_OWNER=platform-team@indigo.com
AWS_WELLARCHITECTED_WORKLOAD_ID=your-workload-id
AWS_WELLARCHITECTED_REGION=us-east-1

# AWS Credentials (if not using IAM role)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### IAM Permissions

Required IAM permissions for Well-Architected Tool:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "wellarchitected:CreateWorkload",
        "wellarchitected:GetWorkload",
        "wellarchitected:UpdateWorkload",
        "wellarchitected:ListWorkloads",
        "wellarchitected:GetLensReview",
        "wellarchitected:CreateMilestone",
        "wellarchitected:ListMilestones",
        "wellarchitected:UpdateAnswer",
        "wellarchitected:ListAnswers",
        "wellarchitected:GetLensReviewReport"
      ],
      "Resource": "*"
    }
  ]
}
```

### Integration with Platform

The Well-Architected Tool is integrated into the platform's deployment workflow:

1. **Automated Reviews** - CI/CD pipeline checks for high-risk items before deployment
2. **Milestone Tracking** - Create milestones for each major release
3. **Risk Monitoring** - Dashboard displays current risk counts
4. **Continuous Improvement** - Track improvements over time

### CI/CD Integration

```yaml
# .github/workflows/wa-tool-check.yml
name: Well-Architected Review

on:
  pull_request:
    branches: [main]

jobs:
  check-risks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check High Risks
        run: pnpm tsx scripts/check-wa-risks.ts
        env:
          AWS_WELLARCHITECTED_WORKLOAD_ID: ${{ secrets.WA_WORKLOAD_ID }}
```

### Documentation

- **Setup Guide**: `WELLARCHITECTED-SETUP.md` - Installation and configuration
- **Complete Summary**: `docs/aws/well-architected/AWS-WA-TOOL-COMPLETE.md` - Full implementation
- **Automation Summary**: `docs/aws/well-architected/WELLARCHITECTED-AUTOMATION-SUMMARY.md` - CI/CD integration
- **Implementation Timeline**: `docs/aws/well-architected/IMPLEMENTATION-SUMMARY.md` - Detailed timeline
- **Usage Examples**: `src/infrastructure/aws/__examples__/wellarchitected-usage.ts`
- **API Reference**: `src/infrastructure/aws/README-WELLARCHITECTED.md`
- **Automation Guide**: `.github/workflows/README-WA-AUTOMATION.md`

### Best Practices

1. **Regular Reviews** - Conduct reviews quarterly or before major releases
2. **Track Milestones** - Create milestones to track improvements over time
3. **Address High Risks** - Prioritize fixing high-risk items immediately
4. **Automate Checks** - Use CI/CD to prevent deploying with high risks
5. **Document Decisions** - Add notes to answers explaining architectural choices

See `docs/aws/well-architected/` for detailed documentation.

## Testing

### Unit Tests (Vitest)
```bash
pnpm test                    # Run all tests
pnpm test -- --watch        # Watch mode
pnpm test -- ProductCard    # Run specific test
```

### E2E Tests (Playwright)
```bash
pnpm playwright test                    # Run all E2E tests
pnpm playwright test dashboard          # Run dashboard tests
pnpm playwright test --ui               # Interactive mode
```

Test files location:
- Unit: `src/**/__tests__/*.test.ts`
- E2E: `e2e/*.spec.ts`

## Common Tasks

### Adding a New Feature
1. Create feature folder in `src/features/<feature-name>/`
2. Add components, hooks, types, and repository
3. Export from feature index
4. Add routes in `src/app/`

### Adding a New Block (Visual Editor)
1. Create block in `src/components/store/blocks/<block-name>/`
2. Register in `src/components/store/blocks/registry.ts`
3. Add field definitions in `src/features/editor/fields/block-fields.ts`

### Database Changes
1. Update schema in `src/db/schema/`
2. Run `pnpm db:push` to apply changes
3. Add RLS policies in `scripts/supabase/`

## Environment Variables

Required in `.env.local`:
```bash
# Database
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AWS Services (optional - defaults to local providers)
# Storage
STORAGE_PROVIDER=aws  # or 'local' (default)
AWS_S3_BUCKET=
AWS_S3_REGION=us-east-1

# Email
EMAIL_PROVIDER=aws  # or 'local' (default)
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=

# AI
AI_PROVIDER=aws  # or 'local' (default)
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Search
SEARCH_PROVIDER=aws  # or 'local' (default)
AWS_OPENSEARCH_DOMAIN_ENDPOINT=

# Recommendations
RECOMMENDATION_PROVIDER=aws  # or 'local' (default)
AWS_PERSONALIZE_CAMPAIGN_ARN=

# Forecast
FORECAST_PROVIDER=aws  # or 'local' (default)
AWS_SAGEMAKER_CANVAS_ENABLED=true
AWS_SAGEMAKER_REGION=us-east-1
```

## PR Guidelines

- Title format: `[feature/fix/chore] Brief description`
- Run `pnpm lint` and `pnpm test` before committing
- Include tests for new features
- Update types when changing data structures
- Follow the design system for UI changes

## Security Considerations

- Never expose service role keys to client
- Always validate user input with Zod
- Use parameterized queries (Drizzle handles this)
- Check tenant ownership before mutations
- Sanitize user-generated content

## Performance Tips

- Use React Server Components where possible
- Lazy load heavy components with `dynamic()`
- Optimize images with `next/image`
- Use `Suspense` boundaries for loading states
- Virtualize long lists with `virtua`
