# Architecture Documentation

This directory contains architectural documentation for the Indigo platform.

## Structure

### `/multi-agent/`
Multi-agent platform architecture:
- Dashboard design
- E-commerce platform architecture
- Agent coordination patterns

**Key Concepts**:
- Specialized agents for different domains
- Coordinated task execution
- Shared context and state management

### `/infrastructure/`
Infrastructure and system architecture:
- Multi-zones architecture
- Core system architecture
- Deployment patterns
- Restructuring analysis

**Components**:
- Next.js 16 App Router
- Supabase (PostgreSQL + Auth)
- Drizzle ORM
- Multi-tenancy with RLS
- Stripe Connect
- Inngest (background jobs)

**Key Documents**:
- `architecture.md` - Core system architecture
- `MULTI-ZONES-ARCHITECTURE.md` - Multi-zones deployment patterns
- `RESTRUCTURING_ANALYSIS.md` - Feature-First Hybrid architecture analysis

## Architecture Principles

### Multi-Tenancy
- Row Level Security (RLS) for data isolation
- Tenant-specific theming
- Isolated storefront per tenant

### Feature-Based Architecture
```
src/features/
├── products/
├── orders/
├── customers/
├── inventory/
├── editor/
└── block-builder/
```

### Service Abstraction
Unified interface for external services:
- Storage (S3 or local)
- Email (SES or local)
- AI (Bedrock or local)
- Search (OpenSearch or database)
- Recommendations (Personalize or collaborative filtering)
- Forecasting (SageMaker or statistical models)

## Related Documentation

- `/specs/SYSTEM-ARCHITECTURE.md` - Detailed system architecture
- `/aws/architecture/` - AWS-specific architecture patterns
- `/guides/` - Implementation guides
