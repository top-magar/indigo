# Migration Documentation

This directory contains migration guides and status tracking for the Indigo platform.

## Migration Documents

### `MIGRATION-STATUS.md`
Overall migration status tracker covering:
- Design system migrations
- Component library updates
- Icon library changes
- Architecture improvements

### `LUCIDE-REACT-MIGRATION.md`
Migration from other icon libraries to Lucide React:
- Icon mapping guide
- Component updates
- Breaking changes
- Best practices

**Why Lucide React?**
- Consistent design language
- Tree-shakeable (smaller bundle)
- TypeScript support
- Active maintenance
- Vercel/Geist compatibility

### `DETAILED_FILE_MAPPING.md`
Complete file-by-file mapping for directory restructuring migration:
- Infrastructure layer migration
- Feature-specific migrations
- Shared code migration
- Repository layer consolidation
- Import path updates
- Barrel export analysis

### `IMPORT_MAPPING_GUIDE.md`
Import path mapping guide for Feature-First Hybrid restructuring:
- Quick reference for import path changes
- Infrastructure imports
- Feature-specific imports
- Shared code imports
- Migration examples
- Automated migration commands

## Related Migrations

### Design System (see `/design-system/geist/`)
- `GEIST-MIGRATION-PLAN.md` - Overall Geist migration strategy
- `GEIST-COLOR-MIGRATION-BATCH-*.md` - Color system migration batches
- `GEIST-COMPONENTS-BATCH-*.md` - Component migration batches

### AWS Abstraction Layer (see `/aws/abstraction-layer/`)
- `AWS-ABSTRACTION-LAYER-MIGRATION-COMPLETE.md` - Service abstraction migration

## Migration Workflow

1. **Planning**
   - Identify components/features to migrate
   - Document breaking changes
   - Create migration checklist

2. **Implementation**
   - Batch migrations by feature/component type
   - Update tests alongside code
   - Maintain backward compatibility where possible

3. **Validation**
   - Run full test suite
   - Visual regression testing
   - Performance benchmarking

4. **Documentation**
   - Update component documentation
   - Add migration notes
   - Update AGENTS.md if needed

## Current Status

See `MIGRATION-STATUS.md` for the latest migration progress and pending tasks.
