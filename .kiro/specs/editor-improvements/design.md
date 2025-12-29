# Design Document: Editor Improvements

## Overview

This design document outlines the architecture and implementation approach for a comprehensive set of improvements to the Visual Store Editor. The improvements are organized into three tiers based on complexity and dependencies:

**Tier 1 (Core Enhancements):** Autosave, Copy/Paste, Optimistic Updates, Enhanced Drag Feedback
**Tier 2 (UI Features):** Block Templates, Version History UI, Accessibility
**Tier 3 (Foundation):** Mobile/Touch Support, Nested Blocks, Collaboration Foundation

The design leverages the existing Zustand store architecture and extends it with new services and hooks while maintaining backward compatibility.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Visual Editor                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Toolbar    │  │ Layers Panel │  │InlinePreview │  │Settings Panel│ │
│  │  + History   │  │  + Nested    │  │ + Enhanced   │  │             │ │
│  │    Button    │  │    Support   │  │   Drag DnD   │  │             │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                              Hooks Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │useAutosave   │  │useClipboard  │  │useHistory    │  │useTouch     │ │
│  │              │  │              │  │  Panel       │  │  Gestures   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                           Editor Store (Zustand)                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ blocks[] | history | clipboard | historyMeta[] | presence[]      │  │
│  │ selectedBlockId | isDirty | autosaveStatus | collaborators       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│                           Services Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Autosave     │  │ Clipboard    │  │ Template     │  │Collaboration│ │
│  │ Service      │  │ Manager      │  │ Registry     │  │  Service    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Autosave Service

```typescript
// lib/editor/autosave.ts
interface AutosaveConfig {
  debounceMs: number      // Default: 3000
  maxRetries: number      // Default: 3
  retryDelayMs: number    // Default: 1000
}

interface AutosaveState {
  status: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  lastSavedAt: Date | null
  error: string | null
}

interface AutosaveService {
  start: () => void
  stop: () => void
  cancel: () => void
  retry: () => void
  getState: () => AutosaveState
}

// Hook for components
function useAutosave(config?: Partial<AutosaveConfig>): {
  status: AutosaveState['status']
  lastSavedAt: Date | null
  cancel: () => void
  retry: () => void
}
```

### 2. Clipboard Manager

```typescript
// lib/editor/clipboard.ts
interface ClipboardBlock {
  type: BlockType
  variant: string
  settings: Record<string, unknown>
  copiedAt: number
}

interface ClipboardManager {
  copy: (block: StoreBlock) => Promise<void>
  paste: () => Promise<ClipboardBlock | null>
  hasContent: () => Promise<boolean>
  clear: () => void
}

// Hook for components
function useBlockClipboard(): {
  copy: () => void
  paste: () => void
  canPaste: boolean
}
```

### 3. Block Templates Registry

```typescript
// lib/editor/templates.ts
interface BlockTemplate {
  id: string
  name: string
  description: string
  blockType: BlockType
  variant: string
  settings: Record<string, unknown>
  thumbnail?: string
  recommended?: boolean
}

interface TemplateRegistry {
  getTemplates: (blockType: BlockType) => BlockTemplate[]
  getAllTemplates: () => BlockTemplate[]
  getTemplate: (id: string) => BlockTemplate | undefined
}

// Pre-defined templates
const BLOCK_TEMPLATES: BlockTemplate[] = [
  // Hero templates
  { id: 'hero-cta', name: 'Hero with CTA', blockType: 'hero', ... },
  { id: 'hero-minimal', name: 'Minimal Hero', blockType: 'hero', ... },
  { id: 'hero-video', name: 'Hero with Video', blockType: 'hero', ... },
  // Header templates
  { id: 'header-full', name: 'Full Header', blockType: 'header', ... },
  { id: 'header-minimal', name: 'Minimal Header', blockType: 'header', ... },
  // ... more templates
]
```

### 4. Enhanced Drag Feedback Components

```typescript
// components/editor/drag-feedback.tsx
interface DropIndicatorProps {
  position: 'above' | 'below'
  animated?: boolean
}

interface GhostPreviewProps {
  block: StoreBlock
  targetIndex: number
}

// Enhanced drop indicator with animation
function AnimatedDropIndicator({ position, animated }: DropIndicatorProps): JSX.Element

// Ghost preview showing final position
function BlockGhostPreview({ block, targetIndex }: GhostPreviewProps): JSX.Element
```

### 5. Version History Panel

```typescript
// lib/editor/history-meta.ts
interface HistoryEntry {
  id: string
  timestamp: Date
  description: string
  type: 'add' | 'remove' | 'move' | 'update' | 'duplicate'
  blockType?: BlockType
  blockId?: string
}

// Store extension for history metadata
interface HistoryMetaState {
  entries: HistoryEntry[]
  currentIndex: number
}

// components/editor/history-panel.tsx
interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onRestoreToEntry: (entryId: string) => void
}
```

### 6. Accessibility Announcer

```typescript
// lib/editor/accessibility.ts
interface AccessibilityAnnouncer {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  announceBlockSelected: (block: StoreBlock) => void
  announceBlockMoved: (block: StoreBlock, fromIndex: number, toIndex: number) => void
  announceBlockAdded: (block: StoreBlock) => void
  announceBlockRemoved: (blockType: BlockType) => void
}

// Hook for keyboard navigation
function useBlockKeyboardNavigation(): {
  focusedBlockId: string | null
  focusBlock: (blockId: string) => void
  focusNext: () => void
  focusPrevious: () => void
}
```

### 7. Touch Gesture Handler

```typescript
// lib/editor/touch-gestures.ts
interface TouchGestureConfig {
  longPressDelay: number    // Default: 500ms
  minDragDistance: number   // Default: 10px
}

interface TouchGestureHandlers {
  onLongPress: (blockId: string) => void
  onTap: (blockId: string) => void
  onPinchZoom: (scale: number) => void
}

// Hook for touch support
function useTouchGestures(config?: Partial<TouchGestureConfig>): {
  isTouchDevice: boolean
  gestureHandlers: TouchGestureHandlers
  bindTouchEvents: (blockId: string) => Record<string, unknown>
}
```

### 8. Nested Blocks Support

```typescript
// Extended block type for nesting
interface NestedStoreBlock extends StoreBlock {
  parentId: string | null
  children?: string[]  // Child block IDs
}

// Store extensions
interface NestedBlockActions {
  addChildBlock: (parentId: string, block: StoreBlock) => void
  removeFromParent: (blockId: string) => void
  moveToParent: (blockId: string, newParentId: string | null, index: number) => void
  getBlockHierarchy: (blockId: string) => StoreBlock[]
}
```

### 9. Collaboration Foundation

```typescript
// lib/editor/collaboration.ts
interface Collaborator {
  id: string
  name: string
  avatar?: string
  color: string
  selectedBlockId: string | null
  cursor?: { x: number; y: number }
  lastActive: Date
}

interface CollaborationState {
  collaborators: Collaborator[]
  isConnected: boolean
  conflicts: ConflictInfo[]
}

interface CollaborationService {
  connect: (roomId: string, user: User) => void
  disconnect: () => void
  broadcastSelection: (blockId: string | null) => void
  broadcastChange: (change: BlockChange) => void
  resolveConflict: (conflictId: string, resolution: 'mine' | 'theirs' | 'merge') => void
}
```

## Data Models

### Extended Editor State

```typescript
interface ExtendedEditorState extends EditorState {
  // Autosave
  autosaveStatus: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  lastAutosaveAt: Date | null
  autosaveError: string | null
  
  // Clipboard
  clipboardBlock: ClipboardBlock | null
  
  // History metadata
  historyMeta: HistoryEntry[]
  historyPanelOpen: boolean
  
  // Collaboration
  collaborators: Collaborator[]
  isCollaborating: boolean
  
  // Nested blocks
  blockParentMap: Record<string, string | null>  // blockId -> parentId
}
```

### History Entry Generation

```typescript
// Automatically generate history descriptions
function generateHistoryEntry(
  action: 'add' | 'remove' | 'move' | 'update' | 'duplicate',
  block: StoreBlock,
  details?: { fromIndex?: number; toIndex?: number; field?: string }
): HistoryEntry {
  const descriptions = {
    add: `Added ${block.type} block`,
    remove: `Removed ${block.type} block`,
    move: `Moved ${block.type} from position ${details?.fromIndex} to ${details?.toIndex}`,
    update: `Updated ${block.type} ${details?.field || 'settings'}`,
    duplicate: `Duplicated ${block.type} block`,
  }
  
  return {
    id: `history-${Date.now()}`,
    timestamp: new Date(),
    description: descriptions[action],
    type: action,
    blockType: block.type,
    blockId: block.id,
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Autosave Debounce Behavior

*For any* sequence of changes to the editor with varying timing, the autosave service should: (a) start a timer on first change, (b) reset the timer on subsequent changes within the debounce period, and (c) trigger exactly one save when the timer expires with pending changes.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Autosave Status Transitions

*For any* autosave operation, the status should transition correctly through states: idle → pending → saving → (saved | error), and the lastSavedAt timestamp should be set on success.

**Validates: Requirements 1.4, 1.5, 1.6**

### Property 3: Manual Save Cancels Autosave

*For any* pending autosave timer, when a manual save is triggered, the autosave timer should be cancelled and no duplicate save should occur.

**Validates: Requirements 1.7**

### Property 4: Clipboard Round-Trip

*For any* valid block, copying it to clipboard and then pasting should produce a block with identical type, variant, and settings, but with a different unique ID.

**Validates: Requirements 3.1, 3.2, 3.5, 3.7**

### Property 5: Drag Operation Correctness

*For any* drag-and-drop operation, the resulting block order should reflect the visual drop position, cancelled drags should restore original order, and ghost preview should accurately show the target position.

**Validates: Requirements 2.3, 2.5, 2.6**

### Property 6: Template Registry Completeness

*For any* block type in the registry, there should be at least 2 templates available, each with valid settings, and recommended templates should be properly flagged.

**Validates: Requirements 4.1, 4.2, 4.6**

### Property 7: Template Application Correctness

*For any* template selection, the created block should have the exact settings defined in the template, with a unique ID and correct block type.

**Validates: Requirements 4.3**

### Property 8: Save Optimistic Update with Rollback

*For any* save operation, the UI should immediately show "Saved" status, and if the operation fails, the status should revert to "Unsaved" with error indication.

**Validates: Requirements 5.1, 5.2**

### Property 9: Publish Optimistic Update with Rollback

*For any* publish operation, the UI should immediately show "Published" status, and if the operation fails, the status should revert to the previous state with error indication.

**Validates: Requirements 5.3, 5.4**

### Property 10: History Entry Generation

*For any* block operation (add, remove, move, update, duplicate), a history entry should be created with accurate description, timestamp, and block reference.

**Validates: Requirements 6.2, 6.3**

### Property 11: History Navigation Correctness

*For any* history entry, clicking it should restore the editor to that exact state, update the current position indicator, and clear future entries when navigating backward.

**Validates: Requirements 6.4, 6.5, 6.7**

### Property 12: Screen Reader Announcements

*For any* block selection, reorder, or action completion, an appropriate announcement should be made to screen readers with accurate information about the operation.

**Validates: Requirements 7.1, 7.2, 7.4**

### Property 13: Keyboard Navigation Completeness

*For any* block in the editor, it should be reachable via keyboard navigation (Tab/Arrow keys) from any other block, and focus should be properly managed after operations.

**Validates: Requirements 7.3, 7.5**

### Property 14: Touch Gesture Recognition

*For any* tap gesture on a block, it should trigger selection, and for any long-press gesture, it should initiate drag mode on touch devices.

**Validates: Requirements 8.1, 8.2**

### Property 15: Touch Mode Behavior

*For any* touch device, the editor should detect touch mode and display touch-optimized controls, and pinch gestures should correctly adjust zoom level.

**Validates: Requirements 8.5, 8.6**

### Property 16: Nested Block Hierarchy Integrity

*For any* nested block structure, parent-child relationships should be maintained correctly, and order indices should be accurate within each parent context.

**Validates: Requirements 9.1, 9.6**

### Property 17: Nested Block Operations

*For any* container block, child blocks should render recursively, drag-and-drop should work into/out of containers, and the layers panel should show the hierarchy.

**Validates: Requirements 9.3, 9.4, 9.5**

### Property 18: Presence Display

*For any* active collaborator, their presence indicator, selection highlight, and name/avatar should be displayed correctly with distinct colors.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 19: Conflict Resolution

*For any* conflicting concurrent change, the editor should notify users and provide resolution options, and compatible changes should merge automatically.

**Validates: Requirements 10.4, 10.5**

## Error Handling

### Autosave Errors

```typescript
// Retry strategy with exponential backoff
async function autosaveWithRetry(
  saveFn: () => Promise<void>,
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await saveFn()
      return
    } catch (error) {
      if (attempt === maxRetries - 1) {
        // Final failure - notify user
        toast.error("Auto-save failed", {
          description: "Your changes couldn't be saved. Please save manually.",
          action: { label: "Retry", onClick: () => autosaveWithRetry(saveFn) }
        })
        throw error
      }
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
    }
  }
}
```

### Clipboard Errors

```typescript
// Graceful fallback for clipboard API
async function copyToClipboard(block: StoreBlock): Promise<void> {
  const data = JSON.stringify({
    type: 'store-block',
    block: { type: block.type, variant: block.variant, settings: block.settings }
  })
  
  try {
    await navigator.clipboard.writeText(data)
  } catch {
    // Fallback: store in memory/localStorage
    localStorage.setItem('editor-clipboard', data)
  }
}
```

### Collaboration Conflict Resolution

```typescript
interface ConflictInfo {
  id: string
  blockId: string
  localChange: BlockChange
  remoteChange: BlockChange
  timestamp: Date
}

function resolveConflict(conflict: ConflictInfo, strategy: 'mine' | 'theirs' | 'merge'): StoreBlock {
  switch (strategy) {
    case 'mine':
      return applyChange(conflict.localChange)
    case 'theirs':
      return applyChange(conflict.remoteChange)
    case 'merge':
      return mergeChanges(conflict.localChange, conflict.remoteChange)
  }
}
```

## Testing Strategy

### Unit Tests

- Test autosave debounce timing with fake timers
- Test clipboard serialization/deserialization
- Test history entry generation for all action types
- Test nested block hierarchy operations
- Test keyboard navigation state machine

### Property-Based Tests

Each correctness property will be implemented as a property-based test using fast-check:

1. **Autosave Debounce** - Generate random change sequences, verify single save after debounce
2. **Clipboard Round-Trip** - Generate random blocks, verify copy/paste preserves data
3. **History Navigation** - Generate operation sequences, verify state restoration
4. **Drag Order** - Generate block lists and drag operations, verify order correctness
5. **Optimistic Rollback** - Simulate failures, verify state reversion
6. **Nested Hierarchy** - Generate nested structures, verify integrity after operations
7. **Keyboard Navigation** - Generate block configurations, verify reachability
8. **Touch Equivalence** - Generate actions, verify mouse/touch produce same results

### Integration Tests

- Test autosave integration with server actions
- Test clipboard across browser tabs
- Test collaboration presence updates
- Test accessibility announcements with screen reader simulation

## Implementation Notes

### Phase 1: Core Enhancements (Tier 1)
1. Implement autosave service and hook
2. Implement clipboard manager
3. Add optimistic updates to save/publish
4. Enhance drag feedback with animations

### Phase 2: UI Features (Tier 2)
5. Create block templates registry
6. Build version history panel
7. Add accessibility announcer and keyboard navigation

### Phase 3: Foundation (Tier 3)
8. Add touch gesture support
9. Implement nested blocks data model
10. Create collaboration service foundation

Each phase builds on the previous, allowing incremental delivery and testing.
