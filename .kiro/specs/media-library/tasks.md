# Implementation Tasks: Media Library

## Phase 1: Foundation (Week 1)

### Task 1.1: Database Schema
- [ ] Create `src/db/schema/media.ts` with Drizzle schema for `media_assets`, `media_folders`, `media_asset_usages`
- [ ] Export schema from `src/db/schema/index.ts`
- [ ] Generate migration with `pnpm drizzle-kit generate`
- [ ] Apply migration with `pnpm drizzle-kit push`
- [ ] Add RLS policies via SQL script

### Task 1.2: Type Definitions
- [ ] Create `src/lib/media/types.ts` with TypeScript interfaces
- [ ] Define `MediaAsset`, `MediaFolder`, `MediaAssetUsage` types
- [ ] Define upload state types (`UploadingFile`, `UploadState`)
- [ ] Define filter/sort option types

### Task 1.3: Server Actions - Core
- [ ] Create `src/app/dashboard/media/actions.ts`
- [ ] Implement `uploadAsset()` - upload to Vercel Blob + save metadata
- [ ] Implement `getAssets()` - list assets with pagination, search, filters
- [ ] Implement `getAsset()` - get single asset details
- [ ] Implement `deleteAsset()` - soft delete asset
- [ ] Implement `updateAsset()` - update filename/alt text

## Phase 2: Dashboard UI (Week 1-2)

### Task 2.1: Media Library Page
- [ ] Create `src/app/dashboard/media/page.tsx` - main page component
- [ ] Create `src/app/dashboard/media/loading.tsx` - loading skeleton
- [ ] Add "Media" nav item to `src/components/dashboard/sidebar/navigation.ts`

### Task 2.2: Media Header Component
- [ ] Create `src/app/dashboard/media/components/media-header.tsx`
- [ ] Add search input with debounced filtering
- [ ] Add file type filter dropdown (All, Images, Videos)
- [ ] Add sort dropdown (Newest, Oldest, Name, Size)
- [ ] Add view toggle (Grid/List)
- [ ] Add Upload button
- [ ] Display storage usage indicator

### Task 2.3: Media Grid Component
- [ ] Create `src/app/dashboard/media/components/media-grid.tsx`
- [ ] Implement responsive grid layout (4 cols desktop, 2 cols mobile)
- [ ] Add infinite scroll pagination
- [ ] Add empty state for no assets
- [ ] Add loading state with skeleton cards

### Task 2.4: Asset Card Component
- [ ] Create `src/app/dashboard/media/components/asset-card.tsx`
- [ ] Display thumbnail with aspect ratio preservation
- [ ] Show filename truncated with tooltip
- [ ] Add hover overlay with quick actions (Preview, Copy URL, Delete)
- [ ] Add checkbox for multi-select
- [ ] Add file type icon badge

### Task 2.5: Asset Details Panel
- [ ] Create `src/app/dashboard/media/components/asset-details.tsx`
- [ ] Display full preview image/video
- [ ] Show metadata (filename, type, dimensions, size, date)
- [ ] Add editable filename/alt text field
- [ ] Add "Copy URL" button
- [ ] Add "Replace" button for file replacement
- [ ] Add "Delete" button with confirmation
- [ ] Show usage list (where asset is used)

## Phase 3: Upload System (Week 2)

### Task 3.1: Upload Hook
- [ ] Create `src/lib/media/hooks/use-upload.ts`
- [ ] Implement file validation (type, size)
- [ ] Track upload progress per file
- [ ] Handle upload errors with retry
- [ ] Support multiple file upload

### Task 3.2: Upload Zone Component
- [ ] Create `src/app/dashboard/media/components/upload-zone.tsx`
- [ ] Implement drag-and-drop file upload
- [ ] Show drop overlay when dragging files
- [ ] Display upload progress for each file
- [ ] Show success/error states
- [ ] Support click to open file picker

### Task 3.3: Upload API Route
- [ ] Create `src/app/api/upload/media/route.ts` (if needed for progress)
- [ ] Integrate with Vercel Blob `put()`
- [ ] Generate thumbnails for images
- [ ] Extract image dimensions
- [ ] Return asset metadata on success

## Phase 4: Folder System (Week 2-3)

### Task 4.1: Folder Server Actions
- [ ] Add `createFolder()` to actions.ts
- [ ] Add `renameFolder()` to actions.ts
- [ ] Add `deleteFolder()` to actions.ts
- [ ] Add `getFolders()` to actions.ts
- [ ] Add `moveAssets()` to actions.ts

### Task 4.2: Folder Sidebar Component
- [ ] Create `src/app/dashboard/media/components/folder-sidebar.tsx`
- [ ] Display folder tree with expand/collapse
- [ ] Highlight current folder
- [ ] Add "New Folder" button
- [ ] Support drag-drop assets to folders
- [ ] Add context menu (Rename, Delete)

### Task 4.3: Breadcrumb Navigation
- [ ] Add breadcrumb to media header
- [ ] Show folder path (Root > Folder > Subfolder)
- [ ] Make each segment clickable

## Phase 5: Media Picker (Week 3)

### Task 5.1: Media Picker Component
- [ ] Create `src/components/media/media-picker.tsx`
- [ ] Implement as Dialog/Modal
- [ ] Reuse MediaGrid with selection mode
- [ ] Add search and filters
- [ ] Support single and multiple selection
- [ ] Add "Upload" tab for direct upload

### Task 5.2: Media Picker Trigger
- [ ] Create `src/components/media/media-picker-trigger.tsx`
- [ ] Button component that opens picker
- [ ] Show selected asset preview
- [ ] Export from `src/components/media/index.ts`

### Task 5.3: Editor Integration
- [ ] Update `src/lib/editor/fields/` image field to use MediaPicker
- [ ] Update product form image fields
- [ ] Update category form image fields
- [ ] Test picker in visual editor settings panel

## Phase 6: Bulk Operations (Week 3)

### Task 6.1: Multi-Select UI
- [ ] Add selection state to media grid
- [ ] Show checkbox on hover/select
- [ ] Add "Select All" in header
- [ ] Show selection count

### Task 6.2: Bulk Action Bar
- [ ] Create bulk action bar component
- [ ] Add "Move to Folder" action
- [ ] Add "Delete Selected" action
- [ ] Add "Download Selected" action (zip)
- [ ] Show progress for bulk operations

### Task 6.3: Bulk Server Actions
- [ ] Add `bulkDeleteAssets()` to actions.ts
- [ ] Add `bulkMoveAssets()` to actions.ts
- [ ] Handle partial failures gracefully

## Phase 7: Polish & Optimization (Week 4)

### Task 7.1: Performance
- [ ] Add React Query for data fetching with caching
- [ ] Implement optimistic updates for delete/move
- [ ] Add image lazy loading with intersection observer
- [ ] Prefetch next page on scroll

### Task 7.2: Storage Quotas
- [ ] Add `getStorageUsage()` server action
- [ ] Display usage in header (X GB / Y GB)
- [ ] Add warning banner at 80% usage
- [ ] Block uploads when quota exceeded

### Task 7.3: Asset Usage Tracking
- [ ] Track usage when assets are added to blocks
- [ ] Track usage when assets are added to products
- [ ] Display usage in asset details
- [ ] Warn before deleting in-use assets

### Task 7.4: Testing
- [ ] Add unit tests for upload validation
- [ ] Add integration tests for server actions
- [ ] Add E2E test for upload flow
- [ ] Add E2E test for picker selection

## Phase 8: Documentation

### Task 8.1: Update Docs
- [ ] Add Media Library section to user docs
- [ ] Document storage limits per plan
- [ ] Document supported file types
- [ ] Add troubleshooting guide

---

## Dependencies

- Vercel Blob Storage (already available in Vercel projects)
- `@vercel/blob` package
- React Query (for caching)

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation | 3 days | None |
| Phase 2: Dashboard UI | 4 days | Phase 1 |
| Phase 3: Upload System | 3 days | Phase 1, 2 |
| Phase 4: Folder System | 3 days | Phase 2 |
| Phase 5: Media Picker | 3 days | Phase 2, 3 |
| Phase 6: Bulk Operations | 2 days | Phase 2 |
| Phase 7: Polish | 3 days | All above |
| Phase 8: Documentation | 1 day | All above |

**Total: ~3-4 weeks**

## Success Criteria

- [ ] Merchants can upload images via drag-drop or file picker
- [ ] Assets are organized in folders
- [ ] Search finds assets by filename
- [ ] Media Picker works in visual editor
- [ ] Bulk delete/move works for 50+ assets
- [ ] Page loads in <2s with 500 assets
- [ ] Storage usage is tracked and displayed
