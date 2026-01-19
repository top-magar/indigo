# Lucide React Migration Guide

## Overview

This document outlines the completed migration from **HugeIcons** (`@hugeicons/react` + `@hugeicons/core-free-icons`) to **Lucide React** (`lucide-react`).

### Current State (Post-Migration)
- **Icon Library:** `lucide-react` v0.562.0 (PRIMARY - in use)
- **Removed Dependencies:**
  - `@hugeicons/react` v1.1.4 (removed)
  - `@hugeicons/core-free-icons` v3.1.0 (removed)
  - `@tabler/icons-react` v3.36.0 (removed - was never used)

### Migration Status: ✅ COMPLETE

All HugeIcons have been migrated to Lucide React equivalents. The migration was completed on January 10, 2026.

- **Files Affected:** ~337 files
- **Total Icon References:** ~2,420 occurrences
- **Unique Icons Used:** 141

### Why Lucide React?
- ✅ Tree-shakeable (only imports what you use)
- ✅ Excellent TypeScript support
- ✅ Active community & regular updates
- ✅ 1,500+ icons available
- ✅ Consistent 24x24 design grid
- ✅ Already installed in project (v0.562.0)
- ✅ Works great with shadcn/ui

---

## Icon Mapping: HugeIcons → Lucide React

### Usage Pattern Change

**Before (HugeIcons):**
```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

<HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
```

**After (Lucide React):**
```tsx
import { ArrowRight, X } from "lucide-react"

<ArrowRight className="h-4 w-4" />
```

---

## Complete Icon Mapping Table

| HugeIcons Name | Lucide React Equivalent | Notes |
|----------------|------------------------|-------|
| `Add01Icon` | `Plus` | |
| `AiPhone01Icon` | `Smartphone` | |
| `Alert01Icon` | `AlertTriangle` | |
| `Alert02Icon` | `AlertCircle` | |
| `AlertCircleIcon` | `AlertCircle` | |
| `AnalyticsUpIcon` | `TrendingUp` | |
| `Archive01Icon` | `Archive` | |
| `ArrowDown01Icon` | `ArrowDown` | |
| `ArrowDown02Icon` | `ChevronDown` | |
| `ArrowLeft01Icon` | `ArrowLeft` | |
| `ArrowLeftDoubleIcon` | `ChevronsLeft` | |
| `ArrowRight01Icon` | `ArrowRight` | |
| `ArrowRightDoubleIcon` | `ChevronsRight` | |
| `ArrowTurnBackwardIcon` | `Undo` | |
| `ArrowTurnForwardIcon` | `Redo` | |
| `ArrowUp01Icon` | `ArrowUp` | |
| `ArrowUp02Icon` | `ChevronUp` | |
| `ArrowUpDownIcon` | `ArrowUpDown` | |
| `Backward01Icon` | `SkipBack` | |
| `BarCode01Icon` | `Barcode` | |
| `Bookmark01Icon` | `Bookmark` | |
| `Calendar03Icon` | `Calendar` | |
| `Cancel01Icon` | `X` | |
| `ChartLineData02Icon` | `LineChart` | |
| `CheckmarkCircle02Icon` | `CheckCircle` | |
| `CheckmarkSquare02Icon` | `CheckSquare` | |
| `Clock01Icon` | `Clock` | |
| `CodeIcon` | `Code` | |
| `ComputerIcon` | `Monitor` | |
| `Copy01Icon` | `Copy` | |
| `CreditCardIcon` | `CreditCard` | |
| `Crown02Icon` | `Crown` | |
| `Cursor01Icon` | `MousePointer` | |
| `Database01Icon` | `Database` | |
| `Delete01Icon` | `Trash` | |
| `Delete02Icon` | `Trash2` | |
| `DeliveryTruck01Icon` | `Truck` | |
| `Download01Icon` | `Download` | |
| `DragDropVerticalIcon` | `GripVertical` | |
| `Edit01Icon` | `Edit` | |
| `Edit02Icon` | `Pencil` | |
| `FavouriteIcon` | `Heart` | |
| `File01Icon` | `File` | |
| `FilterIcon` | `Filter` | |
| `FlipHorizontalIcon` | `FlipHorizontal` | |
| `FlipVerticalIcon` | `FlipVertical` | |
| `Folder01Icon` | `Folder` | |
| `FolderIcon` | `Folder` | |
| `FolderLibraryIcon` | `FolderOpen` | |
| `FolderOpenIcon` | `FolderOpen` | |
| `Forward01Icon` | `SkipForward` | |
| `GridIcon` | `Grid3X3` | or `LayoutGrid` |
| `HardDriveIcon` | `HardDrive` | |
| `Heading01Icon` | `Heading1` | |
| `Heading02Icon` | `Heading2` | |
| `Heading03Icon` | `Heading3` | |
| `HeadphonesIcon` | `Headphones` | |
| `HeartCheckIcon` | `HeartHandshake` | |
| `HelpCircleIcon` | `HelpCircle` | |
| `Home01Icon` | `Home` | |
| `Image01Icon` | `Image` | |
| `Image02Icon` | `Images` | |
| `InboxIcon` | `Inbox` | |
| `InformationCircleIcon` | `Info` | |
| `KeyboardIcon` | `Keyboard` | |
| `LaptopIcon` | `Laptop` | |
| `Layers01Icon` | `Layers` | |
| `LayoutBottomIcon` | `PanelBottom` | |
| `LayoutTwoColumnIcon` | `Columns2` | |
| `LeftToRightListBulletIcon` | `List` | |
| `LeftToRightListNumberIcon` | `ListOrdered` | |
| `Link01Icon` | `Link` | |
| `LinkSquare01Icon` | `ExternalLink` | |
| `LinkSquare02Icon` | `Link2` | |
| `Loading01Icon` | `Loader` | |
| `Loading03Icon` | `Loader2` | Use with `animate-spin` |
| `LockIcon` | `Lock` | |
| `Logout01Icon` | `LogOut` | |
| `Mail01Icon` | `Mail` | |
| `Maximize01Icon` | `Maximize` | |
| `Megaphone01Icon` | `Megaphone` | |
| `Menu01Icon` | `Menu` | |
| `MessageMultiple01Icon` | `MessageSquare` | |
| `Minimize01Icon` | `Minimize` | |
| `MinusSignIcon` | `Minus` | |
| `Money01Icon` | `DollarSign` | or `Banknote` |
| `Moon02Icon` | `Moon` | |
| `MoreHorizontalIcon` | `MoreHorizontal` | |
| `Move01Icon` | `Move` | |
| `Package01Icon` | `Package` | |
| `PackageIcon` | `Package` | |
| `PauseIcon` | `Pause` | |
| `PencilEdit01Icon` | `PenLine` | |
| `PlayIcon` | `Play` | |
| `PlusSignIcon` | `Plus` | |
| `PrinterIcon` | `Printer` | |
| `QuoteDownIcon` | `Quote` | |
| `QuoteUpIcon` | `Quote` | |
| `RefreshIcon` | `RefreshCw` | |
| `Remove01Icon` | `X` | |
| `RepeatIcon` | `Repeat` | |
| `RotateClockwiseIcon` | `RotateCw` | |
| `RotateLeft01Icon` | `RotateCcw` | |
| `Search01Icon` | `Search` | |
| `SearchRemoveIcon` | `SearchX` | |
| `SecurityCheckIcon` | `ShieldCheck` | |
| `Settings01Icon` | `Settings` | |
| `Share01Icon` | `Share` | |
| `ShieldIcon` | `Shield` | |
| `ShoppingBag01Icon` | `ShoppingBag` | |
| `ShoppingCart01Icon` | `ShoppingCart` | |
| `SmartPhone01Icon` | `Smartphone` | |
| `SourceCodeIcon` | `Code2` | |
| `SparklesIcon` | `Sparkles` | |
| `SquareIcon` | `Square` | |
| `SquareUnlock02Icon` | `Unlock` | |
| `StarIcon` | `Star` | |
| `StopIcon` | `Square` | or `StopCircle` |
| `Store01Icon` | `Store` | |
| `Sun03Icon` | `Sun` | |
| `Tag01Icon` | `Tag` | |
| `TextAlignCenterIcon` | `AlignCenter` | |
| `TextAlignJustifyLeftIcon` | `AlignJustify` | |
| `TextAlignLeftIcon` | `AlignLeft` | |
| `TextAlignRightIcon` | `AlignRight` | |
| `TextBoldIcon` | `Bold` | |
| `TextItalicIcon` | `Italic` | |
| `TextStrikethroughIcon` | `Strikethrough` | |
| `TextUnderlineIcon` | `Underline` | |
| `Tick01Icon` | `Check` | |
| `Tick02Icon` | `Check` | |
| `Unlink01Icon` | `Unlink` | |
| `Upload01Icon` | `Upload` | |
| `Upload04Icon` | `UploadCloud` | |
| `UserAdd01Icon` | `UserPlus` | |
| `UserIcon` | `User` | |
| `UserMultipleIcon` | `Users` | |
| `Video01Icon` | `Video` | |
| `ViewIcon` | `Eye` | |
| `ViewOffIcon` | `EyeOff` | |
| `VolumeHighIcon` | `Volume2` | |
| `VolumeMute01Icon` | `VolumeX` | |
| `WifiDisconnected01Icon` | `WifiOff` | |
| `Wifi01Icon` | `Wifi` | |

---

## Migration Strategy

### Phase 1: Create Compatibility Layer (Optional)
Create a wrapper to ease transition:

```tsx
// src/components/ui/icon.tsx
import { LucideIcon } from "lucide-react"
import { cn } from "@/shared/utils"

interface IconProps {
  icon: LucideIcon
  className?: string
}

export function Icon({ icon: IconComponent, className }: IconProps) {
  return <IconComponent className={cn("h-4 w-4", className)} />
}
```

### Phase 2: Update Central Icon Registry
Update `src/features/block-builder/utils/block-icons.ts`:

```tsx
import {
  Menu,
  Image,
  Heart,
  Grid3X3,
  Megaphone,
  MessageSquare,
  Shield,
  Mail,
  PanelBottom,
  AlignLeft,
  Square,
  Columns2,
  MousePointer,
  Video,
  HelpCircle,
  Images,
  type LucideIcon,
} from "lucide-react"
import type { BlockType } from "@/types/blocks"

export function getBlockIcon(type: BlockType): LucideIcon {
  const icons: Record<BlockType, LucideIcon> = {
    header: Menu,
    hero: Image,
    "featured-product": Heart,
    "product-grid": Grid3X3,
    "promotional-banner": Megaphone,
    testimonials: MessageSquare,
    "trust-signals": Shield,
    newsletter: Mail,
    footer: PanelBottom,
    "rich-text": AlignLeft,
    image: Image,
    button: MousePointer,
    video: Video,
    faq: HelpCircle,
    gallery: Images,
    section: Square,
    columns: Columns2,
    column: Square,
  }
  
  return icons[type] || Square
}
```

### Phase 3: Batch Migration by Feature Area

**Priority Order:**
1. `src/components/ui/` - Core UI components (checkbox, spinner, dropdown, etc.)
2. `src/features/editor/` - Visual editor components
3. `src/components/store/` - Storefront components
4. `src/components/dashboard/` - Dashboard components
5. `src/features/` - Feature-specific components
6. `src/app/` - Page components

### Phase 4: Remove HugeIcons Dependencies

```bash
pnpm remove @hugeicons/react @hugeicons/core-free-icons @tabler/icons-react
```

---

## Migration Script

Create a script to automate the migration:

```ts
// scripts/migrate-to-lucide.ts
const iconMapping: Record<string, string> = {
  'Add01Icon': 'Plus',
  'ArrowRight01Icon': 'ArrowRight',
  'Cancel01Icon': 'X',
  // ... add all mappings
}

// Script logic to:
// 1. Find all files with HugeIcons imports
// 2. Replace import statements
// 3. Replace component usage
// 4. Update className props if needed
```

---

## Testing Checklist

- [ ] All icons render correctly
- [ ] Icon sizes are consistent (h-4 w-4, h-5 w-5, h-6 w-6)
- [ ] Animations work (animate-spin for loaders)
- [ ] Dark mode colors work correctly
- [ ] No console errors or warnings
- [ ] Bundle size reduced (check with `pnpm build`)

---

## Benefits After Migration

1. **Smaller Bundle Size** - Lucide is highly tree-shakeable
2. **Simpler Imports** - Direct component imports vs wrapper pattern
3. **Better TypeScript** - `LucideIcon` type for icon props
4. **Consistent Design** - All icons follow same design language
5. **Active Maintenance** - Regular updates and new icons
6. **shadcn/ui Compatibility** - Native support in shadcn components

---

## Resources

- [Lucide Icons](https://lucide.dev/icons) - Browse all icons
- [Lucide React Docs](https://lucide.dev/guide/packages/lucide-react) - Usage guide
- [Icon Search](https://lucide.dev/icons) - Search by name or category
