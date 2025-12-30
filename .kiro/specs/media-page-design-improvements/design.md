# Design Document

## Overview

This design document outlines the implementation details for improving the Media Library page design. The improvements focus on enhanced visual polish, better loading states, improved user interactions, accessibility compliance, mobile support, performance optimization, and a more cohesive design language inspired by Saleor Dashboard and Payload CMS patterns.

## Architecture

The media page improvements will be implemented through modifications to existing components rather than creating new architectural patterns. The changes are primarily visual and UX-focused.

### Component Hierarchy

```
MediaLibrary
├── FolderSidebar (enhanced styling, collapsible on mobile)
├── MediaHeader (search, filters, sort)
├── BulkActionsBar (animation improvements)
├── UploadPanel (enhanced progress UI)
├── MediaGrid (virtualization for large libraries)
│   ├── AssetCard (shimmer loading, hover effects, accessibility)
│   └── AssetListItem (consistent styling)
└── AssetViewer (organized sections, better layout, touch gestures)
```

## Components and Interfaces

### ShimmerEffect Component

A new reusable shimmer loading effect component.

```typescript
interface ShimmerEffectProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
}

function ShimmerEffect({ className, height, width, borderRadius }: ShimmerEffectProps): JSX.Element
```

### Enhanced AssetCard Props

```typescript
interface AssetCardProps {
  asset: MediaAsset;
  index: number;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onDelete: () => void;
  onClick: () => void;
  onLightbox: () => void;
  onDragStart: (e: React.DragEvent) => void;
}
```

### Thumbnail State Management

```typescript
type ThumbnailLoadState = 'loading' | 'loaded' | 'error';

interface ThumbnailState {
  loadState: ThumbnailLoadState;
  src: string | null;
}
```

## Data Models

No changes to data models are required. The improvements are purely presentational.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Shimmer displays during loading

*For any* asset thumbnail that is in a loading state, the shimmer effect animation SHALL be visible until the image loads or errors.

**Validates: Requirements 1.1, 3.1**

### Property 2: Thumbnail state transitions are correct

*For any* thumbnail, the load state SHALL transition from 'loading' to either 'loaded' (on successful load) or 'error' (on failed load), never skipping states.

**Validates: Requirements 3.2, 3.3**

### Property 3: Selection state is visually consistent

*For any* selected asset, the visual selection indicator (checkbox, border, background) SHALL be displayed consistently across both grid and list views.

**Validates: Requirements 1.3, 4.2, 4.3**

### Property 4: Keyboard navigation is complete

*For any* interactive element in the media library, it SHALL be reachable and activatable via keyboard alone.

**Validates: Requirements 11.2, 11.5**

### Property 5: Touch targets meet minimum size

*For any* interactive element on touch devices, the tap target SHALL be at least 44x44 pixels.

**Validates: Requirements 13.2, 13.3**

## Error Handling

### Thumbnail Load Errors

When a thumbnail fails to load:
1. Set load state to 'error'
2. Display file type icon placeholder
3. Apply subtle error styling (muted background)
4. Do not retry automatically (user can refresh)

### Upload Errors

When an upload fails:
1. Display error message from server
2. Show retry button
3. Keep failed upload in panel until dismissed
4. Allow individual retry or bulk retry

## Testing Strategy

### Unit Tests

- Test ShimmerEffect renders with correct dimensions
- Test thumbnail state transitions
- Test selection state visual changes
- Test keyboard navigation handlers
- Test touch gesture handlers

### Property-Based Tests

- Property 1: Shimmer visibility during loading
- Property 2: Thumbnail state machine correctness
- Property 3: Selection visual consistency
- Property 4: Keyboard navigation completeness
- Property 5: Touch target sizing

---

## Implementation Details

### 1. ShimmerEffect Component

Create a new reusable shimmer component at `src/components/ui/shimmer-effect.tsx`:

```typescript
"use client";

import { cn } from "@/lib/utils";

interface ShimmerEffectProps {
  className?: string;
  height?: string | number;
  width?: string | number;
}

export function ShimmerEffect({ className, height = "100%", width = "100%" }: ShimmerEffectProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted rounded-lg",
        className
      )}
      style={{ height, width }}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    </div>
  );
}
```

Add shimmer keyframe to global CSS:

```css
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

### 2. Enhanced AssetCard with Shimmer Loading

Update `asset-card.tsx` to include thumbnail loading state:

```typescript
const [thumbnailState, setThumbnailState] = useState<'loading' | 'loaded' | 'error'>('loading');

useEffect(() => {
  if (fileType !== 'image') {
    setThumbnailState('loaded');
    return;
  }
  
  setThumbnailState('loading');
  const img = new Image();
  img.src = asset.thumbnailUrl || asset.cdnUrl;
  img.onload = () => setThumbnailState('loaded');
  img.onerror = () => setThumbnailState('error');
}, [asset.thumbnailUrl, asset.cdnUrl, fileType]);
```

### 3. Enhanced Hover Effects

```typescript
className={cn(
  "group relative rounded-xl border bg-card overflow-hidden transition-all duration-200 cursor-pointer",
  "hover:border-border hover:shadow-md hover:-translate-y-0.5",
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
  isSelected && "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
)}
```

### 4. File Type Badges

```typescript
const fileTypeBadgeColors: Record<string, string> = {
  image: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  video: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  document: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};
```

---

## Accessibility Implementation

### ARIA Labels and Roles

```typescript
// Asset card accessibility
<div
  role="button"
  tabIndex={0}
  aria-label={`${asset.filename}, ${formatFileSize(asset.sizeBytes)}, ${isSelected ? 'selected' : 'not selected'}`}
  aria-selected={isSelected}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
>

// Selection checkbox
<div
  role="checkbox"
  aria-checked={isSelected}
  aria-label={`Select ${asset.filename}`}
  tabIndex={0}
>
```

### Focus Management

```typescript
className={cn(
  "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
)}

// Screen reader announcements
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

### Keyboard Navigation

- `Tab` / `Shift+Tab`: Navigate between interactive elements
- `Enter` / `Space`: Activate buttons, toggle selection
- `Escape`: Close dialogs, clear selection
- `Cmd/Ctrl + A`: Select all assets

---

## Mobile and Touch Support

### Responsive Breakpoints

```typescript
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
```

### Touch-Friendly Targets

```typescript
// Minimum 44x44px touch targets
className="min-h-[44px] min-w-[44px] p-3"

// Show actions on touch devices without hover
const isTouchDevice = 'ontouchstart' in window;

className={cn(
  "transition-opacity",
  isTouchDevice ? "opacity-100" : "opacity-0 group-hover:opacity-100"
)}
```

### Collapsible Sidebar on Mobile

```typescript
<div className={cn(
  "fixed inset-y-0 left-0 z-40 w-60 transform transition-transform lg:relative lg:translate-x-0",
  sidebarOpen ? "translate-x-0" : "-translate-x-full"
)}>
```

---

## Performance Optimization

### Virtualization for Large Lists

For libraries with 1000+ assets, implement virtualization using `@tanstack/react-virtual`:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedMediaGrid({ assets }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columnCount = useResponsiveColumnCount();
  const rowCount = Math.ceil(assets.length / columnCount);
  
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 2,
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          // Render row of assets
        ))}
      </div>
    </div>
  );
}
```

### Lazy Loading with Intersection Observer

```typescript
function LazyThumbnail({ src, alt }: { src: string; alt: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Load image only when visible
}
```

### Debounced Search (Already Implemented)

```typescript
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleSearch = useCallback((value: string) => {
  setSearch(value);
  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
  searchTimeoutRef.current = setTimeout(() => {
    updateParams({ search: value || null });
  }, 300);
}, [updateParams]);
```

---

## Design Tokens

### Border Radius

- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-md` (6px)
- Thumbnails: `rounded-lg` (8px)

### Spacing

- Card padding: `p-3` (12px)
- Section gaps: `space-y-4` (16px)
- Grid gaps: `gap-4` (16px)

### Colors

- Primary active: `bg-primary/10 text-primary`
- Selection ring: `ring-2 ring-primary/20`
- Error: `text-destructive bg-destructive/10`
- Warning: `text-amber-600 bg-amber-500/10`
- Success: `text-green-600 bg-green-500/10`

### Transitions

- Default: `transition-all duration-200`
- Hover scale: `hover:-translate-y-0.5`
- Fade in: `animate-in fade-in duration-200`
- Slide in: `animate-in slide-in-from-top-2 duration-200`

---

## Integration Notes

### Design System

This implementation builds on:
- **shadcn/ui**: Base component library (Button, Dialog, Dropdown, etc.)
- **Radix UI**: Accessible primitives (via shadcn/ui)
- **Tailwind CSS v4**: Utility-first styling with CSS-based config
- **Hugeicons**: Icon library (`@hugeicons/react`, `@hugeicons/core-free-icons`)

### File Structure

```
src/app/dashboard/media/
├── page.tsx                    # Server component, data fetching
├── loading.tsx                 # Loading skeleton
├── actions.ts                  # Server actions
└── components/
    ├── index.ts                # Exports
    ├── media-library.tsx       # Main client component
    ├── asset-card.tsx          # Grid card (enhanced)
    ├── asset-list-item.tsx     # List row
    ├── asset-viewer.tsx        # Details/lightbox (enhanced)
    ├── media-grid.tsx          # Grid container (virtualization)
    ├── media-header.tsx        # Search/filters
    ├── folder-sidebar.tsx      # Folder navigation
    ├── upload-panel.tsx        # Upload progress
    ├── bulk-actions-bar.tsx    # Selection actions
    ├── folder-dialog.tsx       # Create/rename folder
    └── move-dialog.tsx         # Move assets

src/components/ui/
└── shimmer-effect.tsx          # New shimmer component
```
