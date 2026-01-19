# Documentation Organization

This document describes the organization of the Indigo documentation directory.

## Directory Tree

```
docs/
├── README.md                           # Master documentation index
├── QUICK_START.md                      # Quick start guide
├── INDEX.md                            # Complete documentation index
├── QUICK-REFERENCE.md                  # Fast navigation guide
├── ORGANIZATION.md                     # This file
├── REORGANIZATION-SUMMARY.md           # Reorganization details
├── COMPLETE-IMPLEMENTATION-SUMMARY.md  # Complete implementation summary (MOVED)
├── FINAL-ORGANIZATION-SUMMARY.md       # Final organization summary (MOVED)
├── DIRECTORY-STRUCTURE.md              # Project directory structure
├── directories.md                      # Additional directory documentation
├── ORDERS-PAGE-CHANGELOG.md            # Orders page change history
├── webprodogies.md                     # Web Prodigies documentation
│
├── aws/                                # AWS Services & Integration
│   ├── README.md
│   ├── abstraction-layer/              # Unified service interface (8 docs)
│   │   ├── AWS-ABSTRACTION-LAYER-ANALYSIS.md
│   │   ├── AWS-ABSTRACTION-LAYER-COMPLETE.md
│   │   ├── AWS-ABSTRACTION-LAYER-IMPLEMENTATION-SUMMARY.md
│   │   ├── AWS-ABSTRACTION-LAYER-IMPLEMENTATION.md
│   │   ├── AWS-ABSTRACTION-LAYER-MIGRATION-COMPLETE.md
│   │   ├── AWS-ABSTRACTION-LAYER-STATUS.md
│   │   ├── AWS-ABSTRACTION-LAYER-TESTING-COMPLETE.md
│   │   └── AWS-ABSTRACTION-LAYER-WEEK-3-COMPLETE.md
│   ├── services/                       # AWS service-specific docs (3 docs)
│   │   ├── AWS-ECOMMERCE-SERVICES-RESEARCH.md
│   │   ├── AWS-FORECAST-DEPRECATION-UPDATE.md
│   │   └── AWS-SERVICES-SETUP-COMPLETE.md
│   ├── architecture/                   # AWS architecture patterns (3 docs)
│   │   ├── AWS-ENHANCEMENT-OPPORTUNITIES.md
│   │   ├── AWS-PLATFORM-BOOST-STRATEGY.md
│   │   └── AWS-SAAS-ARCHITECTURE.md
│   ├── well-architected/               # Well-Architected Tool (7 docs)
│   │   ├── README.md                   # Well-Architected documentation index (NEW)
│   │   ├── AWS-WA-TOOL-IMPLEMENTATION-GUIDE.md
│   │   ├── AWS-WELL-ARCHITECTED-REVIEW.md
│   │   ├── WELLARCHITECTED-AUTOMATION-QUICKSTART.md
│   │   ├── AWS-WA-TOOL-COMPLETE.md     # Complete implementation (MOVED)
│   │   ├── IMPLEMENTATION-SUMMARY.md    # Implementation summary (MOVED)
│   │   └── WELLARCHITECTED-AUTOMATION-SUMMARY.md  # Automation summary (MOVED)
│   └── integration/                    # Integration guides (3 docs)
│       ├── AWS-INTEGRATION-ARCHITECTURE-ANALYSIS.md
│       ├── AWS-INTEGRATION-CODE-EXAMPLES.md
│       └── AWS-INTEGRATION-PLAN.md
│
├── design-system/                      # Design System Documentation
│   ├── README.md
│   ├── geist/                          # Geist design system
│   │   ├── GEIST-COLOR-MIGRATION-BATCH-3.md
│   │   ├── GEIST-COLOR-SYSTEM-GUIDE.md
│   │   ├── GEIST-COMPONENT-IMPLEMENTATIONS-COMPLETE.md
│   │   ├── GEIST-COMPONENTS-BATCH-1.md
│   │   ├── GEIST-COMPONENTS-BATCH-2.md
│   │   ├── GEIST-COMPONENTS-BATCH-3.md
│   │   ├── GEIST-COMPONENTS-BATCH-4.md
│   │   ├── GEIST-COMPONENTS-BATCH-5.md
│   │   ├── GEIST-COMPONENTS-MISSING.md
│   │   ├── GEIST-COMPONENTS-REFERENCE-2.md
│   │   ├── GEIST-COMPONENTS-REFERENCE-3.md
│   │   ├── GEIST-COMPONENTS-REFERENCE.md
│   │   ├── GEIST-CSS-PATTERNS.md
│   │   ├── GEIST-INTEGRATION-GUIDE.md
│   │   └── GEIST-MIGRATION-PLAN.md
│   └── vercel/                         # Vercel design patterns
│       ├── VERCEL-ANIMATION-PATTERNS.md
│       ├── VERCEL-COLOR-USAGE-PATTERNS.md
│       ├── VERCEL-DESIGN-PATTERNS-SUMMARY.md
│       ├── VERCEL-GEIST-COMPONENT-STYLING.md
│       ├── VERCEL-GEIST-CORNER-RADIUS-SIZING.md
│       └── VERCEL-GEIST-DESIGN-SYSTEM.md
│
├── features/                           # Feature-Specific Documentation
│   ├── README.md
│   ├── ai-services/                    # AI integration
│   │   ├── AI-BILLING-STRATEGY.md
│   │   ├── AI-SERVICE-IMPLEMENTATION-SUMMARY.md
│   │   ├── AI-SERVICES-DASHBOARD-INTEGRATION.md
│   │   └── AI-SERVICES-INTEGRATION-COMPLETE.md
│   ├── email/                          # Email service
│   │   ├── EMAIL-SERVICE-IMPLEMENTATION.md
│   │   └── EMAIL-SERVICE-SUMMARY.md
│   └── visual-editor/                  # Visual editor & storefront
│       ├── README.md                   # Visual editor overview (NEW)
│       ├── STOREFRONT-APPROACH-ANALYSIS.md
│       ├── STOREFRONT-BLOCK-SYSTEM.md
│       ├── VISUAL-EDITOR-ANALYSIS.md
│       ├── VISUAL-EDITOR-CODE.md
│       └── VISUAL_STORE_EDITOR_GUIDE.md # Complete implementation guide (NEW)
│
├── architecture/                       # System Architecture
│   ├── README.md
│   ├── infrastructure/                 # Core infrastructure
│   │   ├── architecture.md
│   │   └── MULTI-ZONES-ARCHITECTURE.md
│   └── multi-agent/                    # Multi-agent platform
│       ├── MULTI-AGENT-DASHBOARD-DESIGN.md
│       └── MULTI-AGENT-ECOMMERCE-PLATFORM.md
│
├── comparisons/                        # Platform Comparisons
│   ├── README.md
│   ├── Indigo-analysis.md
│   ├── MEDUSA-VS-INDIGO-COMPARISON.md
│   ├── MEDUSA-VS-INDIGO-UI-COMPARISON.md
│   ├── SALEOR-COLLECTIONS-CATEGORIES-ANALYSIS.md
│   ├── SALEOR-DASHBOARD-DEEP-ANALYSIS.md
│   ├── SALEOR-DASHBOARD-FOLDER-ANALYSIS.md
│   ├── SALEOR-INTEGRATIONS.md
│   ├── SALEOR-PRODUCTS-ANALYSIS.md
│   └── SALEOR-VS-INDIGO-COMPARISON.md
│
├── migrations/                         # Migration Guides
│   ├── README.md
│   ├── DETAILED_FILE_MAPPING.md        # File-by-file migration mapping (NEW)
│   ├── IMPORT_MAPPING_GUIDE.md         # Import path mapping guide (NEW)
│   ├── LUCIDE-REACT-MIGRATION.md
│   └── MIGRATION-STATUS.md
│
├── architecture/                       # System Architecture
│   ├── README.md
│   ├── RESTRUCTURING_ANALYSIS.md       # Feature-First architecture analysis (NEW)
│   ├── infrastructure/
│   │   ├── architecture.md
│   │   └── MULTI-ZONES-ARCHITECTURE.md
│   └── multi-agent/
│       ├── MULTI-AGENT-DASHBOARD-DESIGN.md
│       └── MULTI-AGENT-ECOMMERCE-PLATFORM.md
│
├── guides/                             # How-To Guides
│   ├── README.md
│   ├── AWS-GETTING-STARTED.md
│   ├── DEPLOYMENT.md
│   ├── development-plan.md
│   └── SUPABASE-INTEGRATION.md
│
├── specs/                              # Technical Specifications
│   ├── BLOCK-BUILDER-ARCHITECTURE.md
│   ├── DASHBOARD-DESIGN-OUTPUT.md
│   ├── DESIGN-SYSTEM.md
│   ├── IMPLEMENTATION-PLAN.md
│   ├── PRODUCT-REQUIREMENTS.md
│   └── SYSTEM-ARCHITECTURE.md
│
└── research/                           # Research & Exploration
```

## Organization Principles

### 1. **Categorization by Topic**
Documents are grouped by their primary topic:
- AWS-related → `/aws/`
- Design system → `/design-system/`
- Features → `/features/`
- Architecture → `/architecture/`
- Comparisons → `/comparisons/`
- Migrations → `/migrations/`
- Guides → `/guides/`
- Specifications → `/specs/`

### 2. **Hierarchical Structure**
Each major category has subcategories:
- `/aws/` → abstraction-layer, services, architecture, well-architected, integration
- `/design-system/` → geist, vercel
- `/features/` → ai-services, email, visual-editor
- `/architecture/` → infrastructure, multi-agent

### 3. **README Files**
Each category folder contains a README.md that:
- Explains the folder's purpose
- Lists and describes documents
- Provides navigation guidance
- Links to related documentation

### 4. **Root Documents**
General documentation remains in the root:
- `README.md` - Master index
- `DIRECTORY-STRUCTURE.md` - Project structure
- `ORDERS-PAGE-CHANGELOG.md` - Specific changelog
- `webprodogies.md` - External reference

### 5. **Preserved Folders**
Existing folders maintained:
- `/specs/` - Technical specifications
- `/research/` - Research documents

## Navigation Guide

### By Role

**Developers**:
1. Start with `/guides/`
2. Review `/architecture/`
3. Check `/features/` for specific features
4. Consult `/specs/` for technical details

**Designers**:
1. Start with `/design-system/`
2. Review workspace rules (vercel-geist-design-system.md)
3. Check `/specs/DESIGN-SYSTEM.md`

**DevOps/Infrastructure**:
1. Start with `/aws/`
2. Review `/guides/DEPLOYMENT.md`
3. Check `/architecture/infrastructure/`

**Product Managers**:
1. Start with `/comparisons/`
2. Review `/specs/PRODUCT-REQUIREMENTS.md`
3. Check `/guides/development-plan.md`

### By Task

**Setting Up AWS**:
- `/guides/AWS-GETTING-STARTED.md`
- `/aws/services/`
- `/aws/abstraction-layer/`

**Implementing Features**:
- `/features/<feature-name>/`
- `/specs/`
- Root `AGENTS.md`

**Migrating Code**:
- `/migrations/`
- `/design-system/geist/GEIST-MIGRATION-PLAN.md`

**Understanding Architecture**:
- `/architecture/`
- `/specs/SYSTEM-ARCHITECTURE.md`
- `/aws/architecture/`

**Comparing Platforms**:
- `/comparisons/`

## File Naming Conventions

- **ALL-CAPS-WITH-DASHES.md** - Major documentation files
- **lowercase-with-dashes.md** - Supporting files
- **README.md** - Category index files

## Maintenance

When adding new documentation:

1. **Determine Category** - Which folder best fits the content?
2. **Check Subcategories** - Does a subcategory exist or need creation?
3. **Update README** - Add entry to the category's README.md
4. **Cross-Reference** - Link to related documents
5. **Update Master** - Update `/docs/README.md` if needed

## Document Counts

- **AWS**: 22 documents across 5 subcategories
- **Design System**: 21 documents (15 Geist, 6 Vercel)
- **Features**: 10 documents across 3 subcategories
- **Architecture**: 4 documents across 2 subcategories
- **Comparisons**: 10 documents
- **Migrations**: 2 documents
- **Guides**: 4 documents
- **Specs**: 6 documents
- **Root**: 5 documents

**Total**: 84 organized documents

## Benefits of This Organization

1. **Easy Navigation** - Clear hierarchy and categorization
2. **Discoverability** - README files guide users to relevant docs
3. **Maintainability** - Logical grouping makes updates easier
4. **Scalability** - Structure supports growth
5. **Context** - Related documents grouped together
6. **Clarity** - Purpose of each folder is clear

## Related Files

- Root `AGENTS.md` - AI agent coding guidelines
- Workspace rules:
  - `vercel-geist-design-system.md`
  - `vercel-web-interface-guidelines.md`
