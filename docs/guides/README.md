# Guides and Tutorials

This directory contains how-to guides and tutorials for the Indigo platform.

## Available Guides

### `AWS-GETTING-STARTED.md`
Getting started with AWS services:
- AWS account setup
- Service configuration
- Credentials management
- Local development setup

### `DEPLOYMENT.md`
Deployment guide:
- Environment setup
- Build configuration
- Deployment strategies
- CI/CD pipelines

### `development-plan.md`
Development planning and roadmap:
- Feature priorities
- Implementation timeline
- Technical debt tracking
- Sprint planning

### `SUPABASE-INTEGRATION.md`
Supabase integration guide:
- Database setup
- Authentication configuration
- Row Level Security (RLS)
- Real-time subscriptions

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Using Local Providers

For development without AWS credentials:

```bash
# .env.local
STORAGE_PROVIDER=local
EMAIL_PROVIDER=local
AI_PROVIDER=local
SEARCH_PROVIDER=local
RECOMMENDATION_PROVIDER=local
FORECAST_PROVIDER=local
```

### Database Setup

```bash
# Push schema to database
pnpm db:push

# Generate types
pnpm db:generate
```

## Related Documentation

- `/specs/` - Technical specifications
- `/architecture/` - System architecture
- `/features/` - Feature-specific documentation
- Root `AGENTS.md` - AI agent instructions

## Common Tasks

### Adding a New Feature
1. Create feature folder in `src/features/<feature-name>/`
2. Add components, hooks, types, and repository
3. Export from feature index
4. Add routes in `src/app/`
5. Update tests

### Adding a New Block (Visual Editor)
1. Create block in `src/components/store/blocks/<block-name>/`
2. Register in `src/components/store/blocks/registry.ts`
3. Add field definitions in `src/features/editor/fields/block-fields.ts`

### Database Changes
1. Update schema in `src/db/schema/`
2. Run `pnpm db:push` to apply changes
3. Add RLS policies in `scripts/supabase/`

## Getting Help

- Check `/specs/` for technical specifications
- Review `/architecture/` for system design
- See `/features/` for feature documentation
- Consult `AGENTS.md` for coding guidelines
