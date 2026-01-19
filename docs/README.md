# Indigo Documentation

Welcome to the Indigo e-commerce platform documentation. This directory contains comprehensive documentation organized by topic.

## 🚀 Quick Start

**New to Indigo?** Start here:

👉 **[Quick Start Guide](QUICK_START.md)** - Get the platform running in 30 minutes

## Directory Structure

### 📁 `/aws/`
AWS services, architecture, and integration documentation.
- **abstraction-layer/** - Unified service interface with provider flexibility
- **services/** - AWS service-specific documentation
- **architecture/** - AWS architecture patterns and strategies
- **well-architected/** - Well-Architected Tool, reviews, and automation (6 documents)
- **integration/** - Integration guides and examples

### 📁 `/design-system/`
Design system documentation and guidelines.
- **geist/** - Geist design system (OKLCH colors, components, migrations)
- **vercel/** - Vercel design patterns (animations, styling, sizing)

### 📁 `/features/`
Feature-specific documentation.
- **ai-services/** - AI integration (text generation, image analysis, OCR, etc.)
- **email/** - Email service implementation and guides
- **visual-editor/** - Visual editor and storefront customization

### 📁 `/architecture/`
System architecture and design patterns.
- **multi-agent/** - Multi-agent platform architecture
- **infrastructure/** - Core infrastructure and multi-zones architecture

### 📁 `/comparisons/`
Platform comparisons with Saleor, Medusa, and analysis.

### 📁 `/migrations/`
Migration guides and status tracking.

### 📁 `/guides/`
How-to guides and tutorials.
- AWS getting started
- Deployment guide
- Development planning
- Supabase integration

### 📁 `/specs/`
Technical specifications.
- Visual editor architecture
- Dashboard design
- Design system specs
- Implementation plans
- Product requirements
- System architecture

### 📁 `/research/`
Research and exploration documents.

## Root Documents

### `COMPLETE-IMPLEMENTATION-SUMMARY.md`
Complete implementation summary of all platform features and services.

### `FINAL-ORGANIZATION-SUMMARY.md`
Final documentation organization and structure summary.

### `DIRECTORY-STRUCTURE.md`
Project directory structure and organization.

### `directories.md`
Additional directory documentation.

### `ORDERS-PAGE-CHANGELOG.md`
Orders page change history.

### `webprodogies.md`
Web Prodigies related documentation.

## Quick Navigation

### Getting Started
1. Read `/guides/AWS-GETTING-STARTED.md` for AWS setup
2. Review `/guides/SUPABASE-INTEGRATION.md` for database setup
3. Check `/guides/DEPLOYMENT.md` for deployment instructions
4. See root `AGENTS.md` for coding guidelines

### Understanding the Architecture
1. Start with `/architecture/infrastructure/architecture.md`
2. Review `/specs/SYSTEM-ARCHITECTURE.md` for technical details
3. Check `/aws/architecture/` for AWS patterns
4. See `/architecture/multi-agent/` for agent coordination

### Working with Features
1. Browse `/features/` for feature-specific docs
2. Check `/aws/abstraction-layer/` for service usage
3. Review `/design-system/` for UI guidelines
4. See `/specs/` for technical specifications

### Design System
1. Read `/design-system/geist/GEIST-COLOR-SYSTEM-GUIDE.md` for colors
2. Review `/design-system/vercel/VERCEL-GEIST-DESIGN-SYSTEM.md` for patterns
3. Check workspace rules: `vercel-geist-design-system.md`, `vercel-web-interface-guidelines.md`

## Key Concepts

### Multi-Tenancy
- Row Level Security (RLS) for data isolation
- Tenant-specific theming and customization
- Isolated storefront per tenant

### Service Abstraction
Unified interface for external services with provider flexibility:
- **Storage** - S3 or local filesystem
- **Email** - SES or local mock
- **AI** - Bedrock/Rekognition or local mock
- **Search** - OpenSearch or database fallback
- **Recommendations** - Personalize or collaborative filtering
- **Forecasting** - SageMaker or statistical models

### Design System
- **OKLCH colors** - Perceptually uniform color system
- **Vercel/Geist** - Minimalist, consistent design patterns
- **Component sizing** - sm (32px), md (40px), lg (48px)
- **4px spacing** - Consistent spacing scale

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + Vercel Geist Design System
- **State**: Zustand for client state
- **Payments**: Stripe Connect
- **Background Jobs**: Inngest
- **Testing**: Vitest (unit), Playwright (E2E)

## Contributing

When adding new documentation:
1. Place it in the appropriate category folder
2. Update the folder's README.md
3. Add cross-references to related docs
4. Follow the existing documentation style
5. Update this master README if adding new categories

## Documentation Standards

- Use Markdown format
- Include code examples where applicable
- Add cross-references to related documents
- Keep documents focused and concise
- Update documentation alongside code changes
- Include "Last Updated" dates for time-sensitive content

## Need Help?

- Check the appropriate category README for specific topics
- Review `/guides/` for how-to documentation
- See `/specs/` for technical specifications
- Consult root `AGENTS.md` for coding guidelines
- Review `/comparisons/` to understand platform positioning
