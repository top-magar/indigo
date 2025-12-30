# Design Document: Media Library

## Overview

This document outlines the technical design for implementing a centralized Media Library system in Indigo. The design prioritizes integration with the existing visual editor, performance at scale, and a clean developer experience.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Dashboard / Editor                        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │  Media Library  │    │  Media Picker   │    │ Image Fields │ │
│  │     Page        │    │     Modal       │    │  (Editor)    │ │
│  └────────┬────────┘    └────────┬────────┘    └──────┬───────┘ │
│           │                      │                     │         │
│           └──────────────────────┼─────────────────────┘         │
│                                  │                               │
│                    ┌─────────────▼─────────────┐                 │
│                    │     useMediaLibrary()     │                 │
│                    │      (React Query)        │                 │
│                    └─────────────┬─────────────┘                 │
└──────────────────────────────────┼───────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      Server Actions         │
                    │  - uploadAsset()            │
                    │  - listAssets()             │
                    │  - deleteAsset()            │
                    │  - createFolder()           │
                    │  - moveAssets()             │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
    ┌─────────▼─────────┐  ┌───────▼───────┐  ┌────────▼────────┐
    │   Vercel Blob     │  │   PostgreSQL  │  │  Image Service  │
    │   (Storage)       │  │   (Metadata)  │  │  (Transforms)   │
    └───────────────────┘  └───────────────┘  └─────────────────┘
```

### Storage Strategy

**Primary: Vercel Blob Storage**
- Native Next.js integration
- Global CDN included
- Simple API
- Pay-per-use pricing

**Alternative: Cloudinary** (if advanced transforms needed)
- Powerful image transformations
- AI-powered features
- Higher cost but more features

### Database Schema

```sql
-- Media folders for organization
CREATE TABLE media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  parent_folder_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_folder_name_per_parent 
    UNIQUE (store_id, parent_folder_id, name)
);

-- Media assets
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
  
  -- File info
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  
  -- Image dimensions (null for non-images)
  width INTEGER,
  height INTEGER,
  
  -- Storage
  blob_url TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Metadata
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Track where assets are used
CREATE TABLE media_asset_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'product', 'block', 'category'
  entity_id UUID NOT NULL,
  field_name VARCHAR(100), -- Which field uses this asset
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_media_assets_store ON media_assets(store_id);
CREATE INDEX idx_media_assets_folder ON media_assets(folder_id);
CREATE INDEX idx_media_assets_created ON media_assets(created_at DESC);
CREATE INDEX idx_media_folders_store ON media_folders(store_id);
CREATE INDEX idx_media_folders_parent ON media_folders(parent_folder_id);
CREATE INDEX idx_media_usages_asset ON media_asset_usages(asset_id);
CREATE INDEX idx_media_usages_entity ON media_asset_usages(entity_type, entity_id);

-- RLS Policies
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_asset_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_folders_tenant ON media_folders
  USING (store_id = current_setting('app.current_store_id')::uuid);

CREATE POLICY media_assets_tenant ON media_assets
  USING (store_id = current_setting('app.current_store_id')::uuid);

CREATE POLICY media_usages_tenant ON media_asset_usages
  USING (asset_id IN (
    SELECT id FROM media_assets 
    WHERE store_id = current_setting('app.current_store_id')::uuid
  ));
```

## Component Design

### File Structure

```
src/
├── app/
│   └── dashboard/
│       └── media/
│           ├── page.tsx              # Media Library page
│           ├── loading.tsx           # Loading skeleton
│           ├── actions.ts            # Server actions
│           └── components/
│               ├── media-grid.tsx    # Asset grid view
│               ├── media-list.tsx    # Asset list view
│               ├── media-header.tsx  # Search, filters, upload
│               ├── folder-tree.tsx   # Folder navigation
│               ├── asset-card.tsx    # Single asset in grid
│               ├── asset-details.tsx # Details panel/modal
│               └── upload-zone.tsx   # Drag-drop upload area
│
├── components/
│   └── media/
│       ├── media-picker.tsx          # Reusable picker modal
│       ├── media-picker-trigger.tsx  # Button to open picker
│       └── index.ts
│
├── lib/
│   └── media/
│       ├── types.ts                  # TypeScript types
│       ├── upload.ts                 # Upload utilities
│       ├── transforms.ts             # Image transformation helpers
│       └── hooks/
│           ├── use-media-library.ts  # Main data hook
│           ├── use-upload.ts         # Upload hook with progress
│           └── use-media-picker.ts   # Picker state hook
│
└── db/
    └── schema/
        └── media.ts                  # Drizzle schema
```

### Key Components

#### 1. MediaLibraryPage

```tsx
// src/app/dashboard/media/page.tsx
export default async function MediaLibraryPage({
  searchParams
}: {
  searchParams: { folder?: string; search?: string; type?: string }
}) {
  const { tenantId } = await getTenantContext()
  
  const [assets, folders, usage] = await Promise.all([
    getAssets(tenantId, searchParams),
    getFolders(tenantId),
    getStorageUsage(tenantId)
  ])
  
  return (
    <div className="flex h-full">
      <FolderSidebar folders={folders} />
      <div className="flex-1">
        <MediaHeader usage={usage} />
        <MediaGrid assets={assets} />
      </div>
    </div>
  )
}
```

#### 2. MediaPicker (Reusable Modal)

```tsx
// src/components/media/media-picker.tsx
interface MediaPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (asset: MediaAsset) => void
  multiple?: boolean
  accept?: string[] // Filter by mime types
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  accept
}: MediaPickerProps) {
  const [selected, setSelected] = useState<MediaAsset[]>([])
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <MediaHeader compact />
          <MediaGrid 
            selectable
            selected={selected}
            onSelect={setSelected}
            accept={accept}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onSelect(multiple ? selected : selected[0])
              onOpenChange(false)
            }}
            disabled={selected.length === 0}
          >
            Select {selected.length > 0 && `(${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### 3. Upload Hook

```tsx
// src/lib/media/hooks/use-upload.ts
interface UploadState {
  files: UploadingFile[]
  isUploading: boolean
  progress: number
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
  asset?: MediaAsset
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    files: [],
    isUploading: false,
    progress: 0
  })
  
  const upload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > 10 * 1024 * 1024) return false // 10MB limit
      if (!ALLOWED_TYPES.includes(file.type)) return false
      return true
    })
    
    // Add to state
    const uploadingFiles: UploadingFile[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending'
    }))
    
    setState(prev => ({
      ...prev,
      files: [...prev.files, ...uploadingFiles],
      isUploading: true
    }))
    
    // Upload each file
    for (const uploadingFile of uploadingFiles) {
      try {
        const formData = new FormData()
        formData.append('file', uploadingFile.file)
        
        const asset = await uploadAsset(formData, (progress) => {
          setState(prev => ({
            ...prev,
            files: prev.files.map(f => 
              f.id === uploadingFile.id 
                ? { ...f, progress, status: 'uploading' }
                : f
            )
          }))
        })
        
        setState(prev => ({
          ...prev,
          files: prev.files.map(f =>
            f.id === uploadingFile.id
              ? { ...f, status: 'complete', asset }
              : f
          )
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          files: prev.files.map(f =>
            f.id === uploadingFile.id
              ? { ...f, status: 'error', error: error.message }
              : f
          )
        }))
      }
    }
    
    setState(prev => ({ ...prev, isUploading: false }))
  }, [])
  
  return { ...state, upload }
}
```

### Server Actions

```tsx
// src/app/dashboard/media/actions.ts
'use server'

import { put, del } from '@vercel/blob'
import { db } from '@/db'
import { mediaAssets, mediaFolders } from '@/db/schema/media'
import { getTenantContext } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function uploadAsset(formData: FormData) {
  const { tenantId, storeId } = await getTenantContext()
  
  const file = formData.get('file') as File
  const folderId = formData.get('folderId') as string | null
  
  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true
  })
  
  // Get image dimensions if applicable
  let width: number | null = null
  let height: number | null = null
  
  if (file.type.startsWith('image/')) {
    const dimensions = await getImageDimensions(blob.url)
    width = dimensions.width
    height = dimensions.height
  }
  
  // Generate thumbnail for images
  const thumbnailUrl = file.type.startsWith('image/')
    ? `${blob.url}?w=150&h=150&fit=cover`
    : null
  
  // Save to database
  const [asset] = await db.insert(mediaAssets).values({
    storeId,
    folderId: folderId || null,
    filename: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
    originalFilename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    width,
    height,
    blobUrl: blob.url,
    cdnUrl: blob.url, // Vercel Blob URLs are already CDN
    thumbnailUrl
  }).returning()
  
  revalidatePath('/dashboard/media')
  
  return asset
}

export async function deleteAsset(assetId: string) {
  const { storeId } = await getTenantContext()
  
  // Get asset
  const asset = await db.query.mediaAssets.findFirst({
    where: and(
      eq(mediaAssets.id, assetId),
      eq(mediaAssets.storeId, storeId)
    )
  })
  
  if (!asset) throw new Error('Asset not found')
  
  // Delete from Vercel Blob
  await del(asset.blobUrl)
  
  // Soft delete from database
  await db.update(mediaAssets)
    .set({ deletedAt: new Date() })
    .where(eq(mediaAssets.id, assetId))
  
  revalidatePath('/dashboard/media')
}

export async function createFolder(name: string, parentId?: string) {
  const { storeId } = await getTenantContext()
  
  const [folder] = await db.insert(mediaFolders).values({
    storeId,
    name,
    parentFolderId: parentId || null
  }).returning()
  
  revalidatePath('/dashboard/media')
  
  return folder
}

export async function moveAssets(assetIds: string[], targetFolderId: string | null) {
  const { storeId } = await getTenantContext()
  
  await db.update(mediaAssets)
    .set({ folderId: targetFolderId, updatedAt: new Date() })
    .where(
      and(
        inArray(mediaAssets.id, assetIds),
        eq(mediaAssets.storeId, storeId)
      )
    )
  
  revalidatePath('/dashboard/media')
}
```

## Editor Integration

### Image Field with Media Picker

```tsx
// src/lib/editor/fields/image-field.tsx
interface ImageFieldProps {
  value: string
  onChange: (value: string) => void
  label: string
}

export function ImageField({ value, onChange, label }: ImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative group">
          <img 
            src={value} 
            alt="" 
            className="w-full h-32 object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" onClick={() => setPickerOpen(true)}>
              Change
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onChange('')}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:border-primary"
          onClick={() => setPickerOpen(true)}
        >
          <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Click to select from library
          </p>
        </div>
      )}
      
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(asset) => onChange(asset.cdnUrl)}
        accept={['image/*']}
      />
    </div>
  )
}
```

## Performance Considerations

### Thumbnail Generation
- Generate thumbnails on upload (150x150 for grid)
- Use Vercel Image Optimization for on-the-fly transforms
- Lazy load images in grid with intersection observer

### Pagination Strategy
- Use cursor-based pagination for infinite scroll
- Load 50 assets per page
- Prefetch next page on scroll near bottom

### Caching
- Cache asset list with React Query (5 min stale time)
- Invalidate on upload/delete
- Use optimistic updates for better UX

## Security

### Upload Validation
- Validate file type on both client and server
- Check file size limits
- Scan for malware (future: integrate with ClamAV or similar)

### Access Control
- RLS policies ensure store isolation
- Signed URLs for private assets (if needed)
- Rate limiting on upload endpoint

## Migration Plan

1. Create database migration for new tables
2. Add Media nav item to dashboard sidebar
3. Implement basic upload and grid view
4. Add folder support
5. Implement Media Picker component
6. Integrate with editor image fields
7. Add bulk operations
8. Implement storage quotas

## Testing Strategy

- Unit tests for upload validation
- Integration tests for server actions
- E2E tests for upload flow and picker
- Performance tests for large libraries (1000+ assets)
