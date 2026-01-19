# Quick Start Guide

Get the Indigo e-commerce platform running in 30 minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **pnpm** package manager ([Install](https://pnpm.io/installation))
- **Git** for version control
- **Supabase account** (free tier available at [supabase.com](https://supabase.com))
- **Stripe account** for payments (optional for initial setup)
- **AWS account** (optional - local providers work without AWS)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/indigo.git
cd indigo
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including Next.js, React, Supabase client, and AWS SDKs.

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

## Environment Variables

### Required Variables

Edit `.env.local` and add these required variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth (Required)
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables (Use Local Providers)

For development, you can use local providers without AWS:

```bash
# Storage (defaults to local filesystem)
STORAGE_PROVIDER=local

# Email (defaults to console logging)
EMAIL_PROVIDER=local

# AI Services (defaults to mock responses)
AI_PROVIDER=local

# Search (defaults to database queries)
SEARCH_PROVIDER=local

# Recommendations (defaults to collaborative filtering)
RECOMMENDATION_PROVIDER=local

# Forecasting (defaults to statistical models)
FORECAST_PROVIDER=local
```

### AWS Configuration (Optional)

If you want to use AWS services:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Storage (S3)
STORAGE_PROVIDER=aws
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1

# Email (SES)
EMAIL_PROVIDER=aws
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourstore.com

# AI (Bedrock)
AI_PROVIDER=aws
AWS_BEDROCK_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0

# Search (OpenSearch)
SEARCH_PROVIDER=aws
AWS_OPENSEARCH_DOMAIN_ENDPOINT=https://search-domain.region.es.amazonaws.com

# Recommendations (Personalize)
RECOMMENDATION_PROVIDER=aws
AWS_PERSONALIZE_CAMPAIGN_ARN=arn:aws:personalize:region:account:campaign/name

# Forecasting (SageMaker)
FORECAST_PROVIDER=aws
AWS_SAGEMAKER_CANVAS_ENABLED=true
AWS_SAGEMAKER_REGION=us-east-1
```

### Payments (Optional)

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (2-3 minutes)
3. Copy the project URL and anon key from Settings → API

### 2. Run Database Migrations

```bash
pnpm db:push
```

This will:
- Create all required tables
- Set up Row Level Security (RLS) policies
- Create indexes for performance
- Seed initial data (optional)

### 3. Verify Database

Check that tables were created:

```bash
pnpm db:studio
```

This opens Drizzle Studio where you can browse your database.

## Running the App

### Development Server

Start the development server:

```bash
pnpm dev
```

The app will be available at:
- **Dashboard**: http://localhost:3000/dashboard
- **Storefront**: http://localhost:3000/store/demo
- **API**: http://localhost:3000/api

### First Login

1. Navigate to http://localhost:3000/dashboard
2. Click "Sign Up" to create an account
3. Check your email for verification (if email is configured)
4. Log in with your credentials

### Create Your First Store

1. After logging in, you'll see the onboarding flow
2. Enter your store name and details
3. Choose a template or start from scratch
4. Customize your storefront using the visual editor

## Testing

### Run Unit Tests

```bash
pnpm test
```

### Run E2E Tests

```bash
pnpm playwright test
```

### Run Tests in Watch Mode

```bash
pnpm test -- --watch
```

## Key Concepts

### Multi-Tenancy

Each store is a separate tenant with isolated data:
- **Row Level Security (RLS)** ensures data isolation
- **Tenant Context** automatically filters queries
- **Custom Domains** for each store (optional)

### Service Abstraction

All external services use a unified interface:
- **Local Providers** for development (no AWS needed)
- **AWS Providers** for production
- **Easy Switching** via environment variables

### Design System

The platform uses Vercel/Geist design system:
- **OKLCH Colors** - Perceptually uniform color system
- **Component Sizing** - sm (32px), md (40px), lg (48px)
- **4px Spacing** - Consistent spacing scale
- **Tailwind CSS** - Utility-first styling

### Feature-Based Architecture

Code is organized by business domain:

```
src/
├── features/           # Business domains
│   ├── products/
│   ├── orders/
│   ├── customers/
│   └── editor/
├── shared/             # Cross-feature code
│   ├── components/
│   ├── hooks/
│   └── utils/
└── infrastructure/     # Technical concerns
    ├── db/
    ├── services/
    └── auth/
```

## Common Tasks

### Add a New Product

```typescript
import { productRepository } from '@/features/products/repositories';

const product = await productRepository.create({
  tenantId: 'your-tenant-id',
  name: 'Wireless Keyboard',
  description: 'Ergonomic wireless keyboard',
  price: 4999, // in cents
  currency: 'USD',
  status: 'active',
});
```

### Send an Email

```typescript
import { EmailService } from '@/infrastructure/services';

const email = new EmailService();
await email.send({
  to: 'customer@example.com',
  subject: 'Order Confirmation',
  html: '<h1>Thank you for your order!</h1>',
});
```

### Upload a File

```typescript
import { StorageService } from '@/infrastructure/services';

const storage = new StorageService();
const result = await storage.upload(fileBuffer, {
  tenantId: 'your-tenant-id',
  filename: 'product-image.jpg',
  contentType: 'image/jpeg',
  folder: 'products',
});
```

### Query Products

```typescript
import { db } from '@/infrastructure/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

const activeProducts = await db.query.products.findMany({
  where: eq(products.status, 'active'),
  limit: 10,
});
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Database Connection Error

1. Check that `DATABASE_URL` is correct in `.env.local`
2. Verify Supabase project is running
3. Check network connectivity
4. Try running `pnpm db:push` again

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

### TypeScript Errors

```bash
# Run type checking
pnpm type-check

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Supabase RLS Errors

If you get "permission denied" errors:

1. Check that RLS policies are created: `pnpm db:push`
2. Verify you're using the correct tenant context
3. Check that `tenantId` is included in queries

### AWS Service Errors

If AWS services fail:

1. Check that credentials are correct in `.env.local`
2. Verify IAM permissions are configured
3. Try using local providers for development:
   ```bash
   STORAGE_PROVIDER=local
   EMAIL_PROVIDER=local
   AI_PROVIDER=local
   ```

## Next Steps

### Learn the Architecture

- Read [`/docs/architecture/`](architecture/) for system architecture
- Review [`/docs/specs/SYSTEM-ARCHITECTURE.md`](specs/SYSTEM-ARCHITECTURE.md) for technical details
- Check [`AGENTS.md`](../AGENTS.md) for coding guidelines

### Explore Features

- **Visual Editor**: [`/docs/features/visual-editor/`](features/visual-editor/)
- **AI Services**: [`/docs/features/ai-services/`](features/ai-services/)
- **Email Service**: [`/docs/features/email/`](features/email/)

### Set Up AWS Services

- Follow [`/docs/guides/AWS-GETTING-STARTED.md`](guides/AWS-GETTING-STARTED.md)
- Review [`/docs/aws/abstraction-layer/`](aws/abstraction-layer/)
- Configure services in `.env.local`

### Customize the Design

- Read [`/docs/design-system/geist/`](design-system/geist/)
- Review [`/docs/design-system/vercel/`](design-system/vercel/)
- Check workspace rules: `vercel-geist-design-system.md`

### Deploy to Production

- Follow [`/docs/guides/DEPLOYMENT.md`](guides/DEPLOYMENT.md)
- Review [`/docs/aws/architecture/`](aws/architecture/)
- Set up CI/CD pipelines

## Getting Help

- **Documentation**: Browse [`/docs/`](.) for detailed guides
- **Examples**: Check `src/infrastructure/aws/__examples__/` for code examples
- **Issues**: Report bugs on GitHub
- **Community**: Join our Discord server

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Start dev server | `pnpm dev` |
| Run tests | `pnpm test` |
| Run E2E tests | `pnpm playwright test` |
| Type checking | `pnpm type-check` |
| Linting | `pnpm lint` |
| Database migrations | `pnpm db:push` |
| Database studio | `pnpm db:studio` |
| Build for production | `pnpm build` |
| Start production server | `pnpm start` |

---

**Ready to build?** Start with the [Visual Editor Guide](features/visual-editor/VISUAL_STORE_EDITOR_GUIDE.md) to create your first storefront!
