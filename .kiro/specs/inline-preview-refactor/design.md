# Design Document: Inline Preview Refactor

## Overview

This design describes the refactoring of the visual storefront editor from an iframe-based architecture to a Puck-style inline rendering architecture. The key change is rendering block components directly in the editor's React tree instead of in a separate iframe, eliminating postMessage synchronization complexity while maintaining a "Preview Mode" toggle for true WYSIWYG verification.

### Current Architecture (iframe-based)
```
┌─────────────────────────────────────────────────────────────┐
│  Visual Editor Frame                                         │
├──────────┬──────────────────────────────────┬───────────────┤
│  Layers  │  <iframe src="/store/slug">      │  Settings     │
│  Panel   │    ┌────────────────────────┐    │  Panel        │
│          │    │ Preview Frame          │    │               │
│          │    │ (separate React tree)  │    │               │
│          │    │ postMessage ↔ sync     │    │               │
│          │    └────────────────────────┘    │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

### New Architecture (inline rendering)
```
┌─────────────────────────────────────────────────────────────┐
│  Visual Editor (single React tree)                          │
├──────────┬──────────────────────────────────┬───────────────┤
│  Layers  │  <InlinePreview>                 │  Settings     │
│  Panel   │    <EditableBlockWrapper>        │  Panel        │
│          │      <HeaderBlock />             │               │
│          │    </EditableBlockWrapper>       │               │
│          │    <EditableBlockWrapper>        │               │
│          │      <HeroBlock />               │               │
│          │    </EditableBlockWrapper>       │               │
│          │    ...                           │               │
│          │  </InlinePreview>                │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

## Architecture

### Component Hierarchy

```
VisualEditor
├── EditorHeader (toolbar, save/publish buttons)
├── EditorContent (3-column layout)
│   ├── LayersPanel (left sidebar)
│   │   ├── BlockPalette
│   │   └── SortableBlockList
│   ├── PreviewArea (center)
│   │   ├── PreviewToolbar (viewport controls, mode toggle)
│   │   └── PreviewContainer
│   │       ├── InlinePreview (edit mode - NEW)
│   │       │   └── EditableBlockWrapper[] (wraps each block)
│   │       │       └── BlockComponent (header, hero, etc.)
│   │       └── IframePreview (preview mode - existing LivePreview)
│   └── SettingsPanel (right sidebar)
│       └── BlockSettingsPanel / AutoSettingsPanel
└── Dialogs (settings, discard confirmation, etc.)
```

### State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Editor Store (Zustand)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ blocks: StoreBlock[]                                 │    │
│  │ selectedBlockId: string | null                       │    │
│  │ hoveredBlockId: string | null                        │    │
│  │ isDirty: boolean                                     │    │
│  │ history: { past: StoreBlock[][], future: StoreBlock[][] }│
│  │ inlineEdit: InlineEditState | null                   │    │
│  │ editorMode: 'edit' | 'preview'  // NEW               │    │
│  │ viewport: 'mobile' | 'tablet' | 'desktop'  // NEW    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ LayersPanel  │  │InlinePreview │  │SettingsPanel │       │
│  │ useEditorStore│  │useEditorStore│  │useEditorStore│       │
│  │ (blocks)     │  │ (blocks,     │  │ (selectedBlock)│      │
│  │              │  │  selection)  │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### InlinePreview Component

```typescript
interface InlinePreviewProps {
  storeSlug: string
  storeName: string
  products: Product[]
  featuredProducts: Record<string, FeaturedProduct>
  currency: string
}

// Renders blocks directly from Editor Store
function InlinePreview({
  storeSlug,
  storeName,
  products,
  featuredProducts,
  currency,
}: InlinePreviewProps) {
  const blocks = useEditorStore(selectBlocks)
  const selectedBlockId = useEditorStore(selectSelectedBlockId)
  const hoveredBlockId = useEditorStore(selectHoveredBlockId)
  const viewport = useEditorStore(selectViewport)
  const { selectBlock, hoverBlock } = useEditorStore()

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  )

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={sortedBlocks.map(b => b.id)}>
        <div 
          className="inline-preview-container"
          style={{ width: VIEWPORT_WIDTHS[viewport] }}
        >
          {sortedBlocks.map((block, index) => (
            <EditableBlockWrapper
              key={block.id}
              block={block}
              index={index}
              totalBlocks={sortedBlocks.length}
              isSelected={selectedBlockId === block.id}
              isHovered={hoveredBlockId === block.id}
              onSelect={() => selectBlock(block.id)}
              onHover={(hovered) => hoverBlock(hovered ? block.id : null)}
            >
              <MemoizedBlockComponent
                block={block}
                storeName={storeName}
                storeSlug={storeSlug}
                products={products}
                featuredProducts={featuredProducts}
                currency={currency}
              />
            </EditableBlockWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

### EditableBlockWrapper Component

```typescript
interface EditableBlockWrapperProps {
  block: StoreBlock
  index: number
  totalBlocks: number
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: (hovered: boolean) => void
  children: ReactNode
}

function EditableBlockWrapper({
  block,
  index,
  totalBlocks,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  children,
}: EditableBlockWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: block.id,
  })

  // Prevent clicks from reaching block content (links, buttons)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect()
  }, [onSelect])

  return (
    <div
      ref={setNodeRef}
      data-block-id={block.id}
      className={cn(
        "editable-block-wrapper",
        isSelected && "ring-2 ring-primary",
        isHovered && !isSelected && "ring-2 ring-blue-400/50",
        !block.visible && "opacity-50",
        isDragging && "opacity-40"
      )}
      onClick={handleClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ transform: CSS.Transform.toString(transform) }}
    >
      {/* Block type label */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-7 left-2 z-50 px-2 py-1 text-xs font-medium rounded-t-md bg-primary text-primary-foreground">
          {block.type}
        </div>
      )}

      {/* Action bar */}
      {(isSelected || isHovered) && (
        <BlockActionBar
          blockId={block.id}
          index={index}
          totalBlocks={totalBlocks}
          isVisible={block.visible}
        />
      )}

      {/* Drag handle */}
      <div {...attributes} {...listeners} className="drag-handle">
        <GripVertical />
      </div>

      {/* Block content with click interception */}
      <div className="pointer-events-none">
        {children}
      </div>

      {/* Hidden block overlay */}
      {!block.visible && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
          <span className="text-muted-foreground">Hidden</span>
        </div>
      )}
    </div>
  )
}
```

### PreviewModeToggle Component

```typescript
type EditorMode = 'edit' | 'preview'

interface PreviewModeToggleProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
}

function PreviewModeToggle({ mode, onModeChange }: PreviewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-0.5">
      <Button
        variant={mode === 'edit' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('edit')}
      >
        <Edit2 className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <Button
        variant={mode === 'preview' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('preview')}
      >
        <Eye className="h-4 w-4 mr-1" />
        Preview
      </Button>
    </div>
  )
}
```

### Extended Editor Store

```typescript
interface EditorState {
  // Existing state
  blocks: StoreBlock[]
  selectedBlockId: string | null
  hoveredBlockId: string | null
  isDirty: boolean
  isPreviewReady: boolean
  history: { past: StoreBlock[][]; future: StoreBlock[][] }
  inlineEdit: InlineEditState | null
  
  // New state for inline preview
  editorMode: 'edit' | 'preview'
  viewport: 'mobile' | 'tablet' | 'desktop'
}

interface EditorActions {
  // Existing actions (unchanged)
  setBlocks: (blocks: StoreBlock[]) => void
  selectBlock: (blockId: string | null) => void
  hoverBlock: (blockId: string | null) => void
  updateBlock: (blockId: string, updates: Record<string, unknown>) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  addBlock: (block: StoreBlock) => void
  removeBlock: (blockId: string) => void
  duplicateBlock: (blockId: string) => void
  undo: () => void
  redo: () => void
  markClean: () => void
  startInlineEdit: (blockId: string, fieldPath: string, originalValue: string) => void
  updateInlineEdit: (value: string) => void
  endInlineEdit: (save: boolean) => void
  
  // New actions
  setEditorMode: (mode: 'edit' | 'preview') => void
  setViewport: (viewport: 'mobile' | 'tablet' | 'desktop') => void
}
```

## Data Models

### Viewport Configuration

```typescript
const VIEWPORT_CONFIG = {
  mobile: { width: 375, height: 812, label: 'Mobile' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  desktop: { width: 1440, height: 900, label: 'Desktop' },
} as const

type Viewport = keyof typeof VIEWPORT_CONFIG
```

### Editor Mode

```typescript
type EditorMode = 'edit' | 'preview'

// In edit mode: InlinePreview renders blocks directly
// In preview mode: IframePreview (existing LivePreview) renders in iframe
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: State-to-Render Synchronization

*For any* block state change (settings update, reorder, add, remove), the InlinePreview SHALL reflect the change in the same React render cycle without requiring postMessage or async operations.

**Validates: Requirements 1.2, 1.3**

### Property 2: Hidden Block Placeholder Rendering

*For any* block with `visible: false`, the InlinePreview SHALL render a visible placeholder element (not display: none) that indicates the block is hidden.

**Validates: Requirements 1.5**

### Property 3: Block Click Selection

*For any* click event on a block in the InlinePreview, the Editor_Store's selectedBlockId SHALL be updated to that block's ID.

**Validates: Requirements 2.1**

### Property 4: Event Propagation Prevention

*For any* click event on an EditableBlockWrapper in edit mode, the event SHALL NOT propagate to child elements (links, buttons, form inputs).

**Validates: Requirements 2.4**

### Property 5: Inline Edit State Tracking

*For any* inline edit session, the Editor_Store SHALL track the blockId, fieldPath, and originalValue, and pressing Escape SHALL restore the originalValue.

**Validates: Requirements 3.2, 3.4**

### Property 6: Preview Mode Disables Interactions

*For any* click or hover event while in preview mode, the Editor_Store's selectedBlockId and hoveredBlockId SHALL NOT change.

**Validates: Requirements 4.3**

### Property 7: Mode Switching Preserves State

*For any* sequence of mode switches between edit and preview, the blocks array in Editor_Store SHALL remain unchanged.

**Validates: Requirements 4.4**

### Property 8: Undo/Redo History Maintenance

*For any* block mutation operation (update, move, add, remove, duplicate), the Editor_Store's history.past SHALL contain the previous state, enabling undo.

**Validates: Requirements 6.4**

### Property 9: Drag-Drop Order Synchronization

*For any* drag-drop reorder operation in InlinePreview, the resulting block order SHALL match the order displayed in the LayersPanel.

**Validates: Requirements 7.3, 7.4**

### Property 10: Move Operations

*For any* move up/down action on a block at index i, the block SHALL move to index i-1 (up) or i+1 (down), and all other blocks SHALL maintain their relative order.

**Validates: Requirements 8.3, 8.4**

### Property 11: Viewport Sizing

*For any* viewport selection, the InlinePreview container width SHALL equal the configured width for that viewport (375px, 768px, or 1440px).

**Validates: Requirements 9.2, 9.3**

### Property 12: Selective Re-rendering

*For any* single block update, only that block's component SHALL re-render (verified via React.memo and render count tracking).

**Validates: Requirements 10.2**

## Error Handling

### Render Error Boundary

```typescript
class InlinePreviewErrorBoundary extends React.Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('InlinePreview render error:', error, info)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>Preview failed to render. Switching to iframe preview...</p>
        </div>
      )
    }
    return this.props.children
  }
}
```

### Fallback to Iframe Preview

If InlinePreview throws a render error:
1. Error boundary catches the error
2. Calls `onError` callback
3. Visual Editor automatically switches to preview mode (iframe)
4. User is notified of the fallback

### Block Component Error Handling

Individual block components should be wrapped in error boundaries to prevent one broken block from crashing the entire preview:

```typescript
function SafeBlockComponent({ block, ...props }: BlockComponentProps) {
  return (
    <ErrorBoundary fallback={<BlockErrorPlaceholder block={block} />}>
      <BlockComponent block={block} {...props} />
    </ErrorBoundary>
  )
}
```

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

1. **InlinePreview rendering** - Verify blocks render without iframe
2. **EditableBlockWrapper click handling** - Verify selection on click
3. **Mode toggle** - Verify switching between edit and preview modes
4. **Viewport controls** - Verify container resizes correctly
5. **Error boundary** - Verify fallback behavior on render error

### Property-Based Tests

Property tests verify universal properties across all inputs using fast-check:

1. **State synchronization** - Generate random state changes, verify immediate render
2. **Event propagation** - Generate random click targets, verify no propagation
3. **Inline edit round-trip** - Generate edits, verify cancel restores original
4. **Mode switching** - Generate mode switch sequences, verify state preservation
5. **Move operations** - Generate move sequences, verify order correctness
6. **Viewport sizing** - Generate viewport changes, verify container width

### Integration Tests

1. **Full editor flow** - Load editor, select block, edit settings, verify preview updates
2. **Drag-drop reorder** - Drag block, verify both preview and layers panel update
3. **Save/publish** - Make changes, save, verify persistence
4. **Undo/redo** - Make changes, undo, verify state restoration

### Test Configuration

- Property tests: minimum 100 iterations per property
- Use Vitest with React Testing Library
- Use fast-check for property-based testing
- Tag format: **Feature: inline-preview-refactor, Property {number}: {property_text}**
