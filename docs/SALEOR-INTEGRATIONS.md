# Saleor Dashboard Integrations

This document summarizes the patterns and features integrated from the Saleor Dashboard into this project.

## Hooks (src/hooks/)

### useWizard
Multi-step form/wizard navigation hook.
```tsx
const wizard = useWizard('step1', ['step1', 'step2', 'step3']);
// wizard.currentStep, wizard.next(), wizard.prev(), wizard.goTo('step2')
```

### useBulkActions
Manage bulk selection in tables/lists with pagination reset and change notifications.
```tsx
// Basic usage
const bulkActions = useBulkActions();
// bulkActions.selected, bulkActions.selectedArray, bulkActions.selectedCount
// bulkActions.toggle(id), bulkActions.toggleAll(items), bulkActions.reset()
// bulkActions.isSelected(id), bulkActions.isAllSelected(items)

// With options (pagination reset, change callback)
const bulkActions = useBulkActions({
  initial: ['id1'],
  paginationKey: `${page}-${pageSize}`,
  onSelectionChange: (ids) => console.log('Selected:', ids),
});
```

### useFilterPresets
Save and manage filter configurations with URL persistence.
```tsx
const filterPresets = useFilterPresets({ storageKey: 'orders-filters' });
// filterPresets.presets, filterPresets.activePreset, filterPresets.hasUnsavedChanges
// filterPresets.savePreset(name), filterPresets.applyPreset(id), filterPresets.deletePreset(id)
```

### useDebounce / useDebouncedCallback / useDebouncedState
Debounce values and callbacks for search inputs.
```tsx
const debouncedSearch = useDebouncedCallback((value) => {
  updateFilters({ search: value });
}, 300);
```

### useClipboard
Copy-to-clipboard with feedback state.
```tsx
const { copy, copied } = useClipboard();
```

### useFormDirty
Track form dirty state with change detection.
```tsx
const { data, isDirty, setField, reset, markClean } = useFormDirty({
  initialData: product,
  confirmOnLeave: true,
});
```

### useListActions
Manage list operations (add, remove, toggle, reorder).
```tsx
const { listElements, add, remove, toggle, move } = useListActions<string>();
```

## Components (src/components/dashboard/)

### Timeline
Event timeline with date grouping (Today, Yesterday, Last 7 days, etc.).
- `Timeline` - Container
- `TimelineAddNote` - Add note form with keyboard shortcut
- `TimelineEvent` - Single event display
- `TimelineNote` - Editable note display
- `GroupedTimeline` - Convenience component with date grouping

### Savebar
Sticky save bar for forms with unsaved changes.
```tsx
<Savebar 
  show={isDirty} 
  isSaving={isSaving}
  onSave={handleSave} 
  onDiscard={reset}
  onDelete={() => setDeleteDialogOpen(true)}
/>
```

### Metadata
Key-value metadata editor with public/private sections.
```tsx
<Metadata
  metadata={metadata}
  privateMetadata={privateMetadata}
  onMetadataChange={setMetadata}
/>
```

### BulkActionsBar / StickyBulkActionsBar
Floating bar for bulk actions when items are selected.
```tsx
// Inline version
<BulkActionsBar selectedCount={5} onClear={clearSelection} itemLabel="order">
  <Button>Export</Button>
  <Button>Delete</Button>
</BulkActionsBar>

// Sticky floating version (recommended for long tables)
<StickyBulkActionsBar selectedCount={5} onClear={clearSelection} itemLabel="order">
  <Button>Export</Button>
  <Button>Delete</Button>
</StickyBulkActionsBar>
```

### FilterPresetsSelect
Dropdown for managing saved filter presets.
```tsx
<FilterPresetsSelect
  presets={filterPresets.presets}
  activePreset={filterPresets.activePreset}
  hasUnsavedChanges={filterPresets.hasUnsavedChanges}
  onApply={filterPresets.applyPreset}
  onSave={filterPresets.savePreset}
  onUpdate={filterPresets.updatePreset}
  onDelete={filterPresets.deletePreset}
  onRename={filterPresets.renamePreset}
  onClear={filterPresets.clearFilters}
  defaultLabel="All Orders"
/>
```

## UI Components (src/components/ui/)

### CopyableText
Text with copy-to-clipboard functionality.
```tsx
<CopyableText text={orderNumber} mono tooltipText="Copy order number" />
<CopyableText text={customer.email} size="sm" tooltipText="Copy email" />
```

## Feature Flags (src/lib/feature-flags/)

Multi-strategy feature flag system:
- `EnvVarsStrategy` - Read from NEXT_PUBLIC_FF_* env vars
- `LocalStorageStrategy` - Read from localStorage
- `UserMetadataStrategy` - Read from user metadata
- `StaticStrategy` - Hardcoded defaults

```tsx
<FeatureFlagsProvider>
  {children}
</FeatureFlagsProvider>

// In component
const { isEnabled } = useFeatureFlags();
if (isEnabled('new_feature')) { ... }
```

## Discount System Enhancements (src/lib/discounts/)

### Voucher Code Generator
Generate unique voucher codes with customizable options:
- Prefix/suffix support
- Configurable length (4-16 chars)
- Character sets (alphanumeric, alphabetic, numeric)
- Duplicate prevention
- Preview generation

```tsx
const codes = generateVoucherCodes({
  quantity: 10,
  prefix: 'SUMMER',
  length: 8,
  charset: 'alphanumeric',
});
```

## Integration Examples

### Orders List Page
```tsx
// Uses: useBulkActions, useDebouncedCallback, useFilterPresets, StickyBulkActionsBar, FilterPresetsSelect
const bulkActions = useBulkActions();
const filterPresets = useFilterPresets({ storageKey: "orders-filter-presets" });
const debouncedSearch = useDebouncedCallback((value) => updateFilters({ search: value }), 300);

// Bulk actions appear as floating bar at bottom of viewport
<StickyBulkActionsBar selectedCount={bulkActions.selectedCount} onClear={bulkActions.reset}>
  <Button onClick={() => handleBulkStatusUpdate("shipped")}>Mark Shipped</Button>
</StickyBulkActionsBar>
```

### Product Detail Page
```tsx
// Uses: useFormDirty, Savebar
const { isDirty, reset, markClean, data } = useFormDirty({
  initialData: { name: product.name, description: product.description },
  confirmOnLeave: true,
});

<Savebar
  show={isDirty}
  isSaving={isSaving}
  onDiscard={reset}
  onSave={handleSave}
  onDelete={() => setDeleteDialogOpen(true)}
/>
```

### Order Header with CopyableText
```tsx
// Uses: CopyableText for order number
<h1>Order #</h1>
<CopyableText 
  text={order.orderNumber} 
  mono 
  size="lg"
  tooltipText="Copy order number"
/>
```

### Multi-Step Wizard
```tsx
function ProductWizard() {
  const steps = ['info', 'pricing', 'inventory', 'review'] as const;
  const wizard = useWizard('info', steps);

  return (
    <div>
      <StepIndicator current={wizard.currentIndex} total={wizard.totalSteps} />
      
      {wizard.currentStep === 'info' && <InfoStep />}
      {wizard.currentStep === 'pricing' && <PricingStep />}
      
      <div className="flex gap-2">
        <Button onClick={wizard.prev} disabled={wizard.isFirstStep}>Back</Button>
        <Button onClick={wizard.next}>
          {wizard.isLastStep ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
```

## Pages Using Integrations

| Page | Hooks | Components |
|------|-------|------------|
| Orders List | `useBulkActions`, `useDebouncedCallback`, `useFilterPresets` | `StickyBulkActionsBar`, `FilterPresetsSelect` |
| Products List | `useBulkActions`, `useDebouncedCallback`, `useFilterPresets` | `StickyBulkActionsBar`, `FilterPresetsSelect` |
| Customers List | `useBulkActions`, `useDebouncedCallback` | `StickyBulkActionsBar` |
| Product Detail | `useFormDirty` | `Savebar`, `CopyableText` |
| Order Detail | - | `CopyableText` |
| Customer Detail | - | `CopyableText` |
