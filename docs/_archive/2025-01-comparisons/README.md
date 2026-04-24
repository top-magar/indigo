# Platform Comparisons

This directory contains comparative analyses between Indigo and other e-commerce platforms.

## Platforms Analyzed

### Saleor
Open-source headless e-commerce platform built with Python/Django and GraphQL.

**Documents**:
- `SALEOR-VS-INDIGO-COMPARISON.md` - Overall platform comparison
- `SALEOR-DASHBOARD-DEEP-ANALYSIS.md` - Dashboard architecture analysis
- `SALEOR-DASHBOARD-FOLDER-ANALYSIS.md` - Folder structure analysis
- `SALEOR-PRODUCTS-ANALYSIS.md` - Product management comparison
- `SALEOR-COLLECTIONS-CATEGORIES-ANALYSIS.md` - Collections and categories
- `SALEOR-INTEGRATIONS.md` - Integration capabilities

**Key Differences**:
- Saleor: Python/Django + GraphQL
- Indigo: Next.js 16 + TypeScript + Drizzle ORM
- Saleor: Monolithic architecture
- Indigo: Feature-based architecture with service abstraction

### Medusa
Open-source headless commerce platform built with Node.js.

**Documents**:
- `MEDUSA-VS-INDIGO-COMPARISON.md` - Overall platform comparison
- `MEDUSA-VS-INDIGO-UI-COMPARISON.md` - UI/UX comparison

**Key Differences**:
- Medusa: Node.js + Express + TypeORM
- Indigo: Next.js 16 + Drizzle ORM
- Medusa: Plugin-based architecture
- Indigo: Feature-based with AWS service abstraction

### Indigo Analysis
- `Indigo-analysis.md` - Self-analysis and positioning

## Comparison Criteria

1. **Technology Stack**
   - Framework and language
   - Database and ORM
   - API architecture

2. **Architecture**
   - Code organization
   - Multi-tenancy approach
   - Extensibility patterns

3. **Features**
   - Product management
   - Order processing
   - Customer management
   - Inventory tracking
   - Visual customization

4. **Developer Experience**
   - Setup complexity
   - Documentation quality
   - Testing approach
   - Type safety

5. **Scalability**
   - Multi-tenancy support
   - Performance optimization
   - Cloud integration

## Indigo Advantages

- **Modern Stack**: Next.js 16, TypeScript, Drizzle ORM
- **Service Abstraction**: Unified interface for AWS services with local fallbacks
- **Visual Editor**: Drag-and-drop storefront customization
- **Type Safety**: Full TypeScript with strict mode
- **Multi-Tenancy**: Built-in RLS and tenant isolation
- **Design System**: Vercel/Geist with OKLCH colors
