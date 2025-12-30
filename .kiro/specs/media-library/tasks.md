# Implementation Plan: Media Library

## Overview

This implementation plan covers building a centralized Media Library for the Indigo e-commerce platform. The plan is organized into phases that build incrementally, with each task referencing specific requirements from the requirements document.

## Tasks

- [ ] 1. Database Schema and Types
  - [ ] 1.1 Create Drizzle schema for media tables
    - Create `src/db/schema/media.ts` with `mediaAssets`, `mediaFolders`, `mediaAssetUsages` tables
    - Include all columns: id, store_id, filename, mime_type, size_bytes, width, height, cdn_url, folder_id, timestamps
    - Add proper relations and indexes
    - _Requirements: 10.1, 10.2, 10.4_
  - [ ] 1.2 Export schema and generate migration
    - Export from `src/db/schema/index.ts`
    - Run `pnpm drizzle-kit generate` and `pnpm drizzle-kit push`
    - _Requirements: 10.3, 10.5_
  - [ ] 1.3 Create TypeScript type definitions
    - Create `src/lib/media/types.ts` with MediaAsset, MediaFolder, UploadState interfaces
    - _Requirements: 10.1, 10.2_

- [ ] 2. Core Server Actions
  - [ ] 2.1 Implement uploadAsset server action
    - Create `src/app/dashboard/media/actions.ts`
    - Upload file to Vercel Blob storage
    - Extract image dimensions for images
    - Generate thumbnail URL
    - Save metadata to database
    - _Requirements: 2.1, 2.4, 2.5, 2.8, 2.10, 7.1_
  - [ ] 2.2 Implement getAssets server action
    - List assets with pagination (cursor-based)
    - Support search by filename
    - Support filter by file type
    - Support sort options
    - _Requirements: 1.5, 4.1, 4.2, 4.3, 4.4_
  - [ ] 2.3 Implement deleteAsset server action
    - Soft delete asset (set deleted_at)
    - Delete from Vercel Blob storage
    - _Requirements: 5.7, 5.8_
  - [ ] 2.4 Implement updateAsset server action
    - Update filename/alt text
    - _Requirements: 5.3, 5.4_

- [ ] 3. Checkpoint - Verify database and actions
  - Ensure migrations applied successfully
  - Test upload and list actions manually
  - Ask user if questions arise

- [ ] 4. Media Library Dashboard Page
  - [ ] 4.1 Create Media Library page structure
    - Create `src/app/dashboard/media/page.tsx`
    - Create `src/app/dashboard/media/loading.tsx` skeleton
    - _Requirements: 1.1, 1.2_
  - [ ] 4.2 Add Media nav item to sidebar
    - Update `src/components/dashboard/sidebar/navigation.ts`
    - Add "Media" under Content section
    - _Requirements: 1.1_
  - [ ] 4.3 Create MediaHeader component
    - Create `src/app/dashboard/media/components/media-header.tsx`
    - Add search input with debounce
    - Add file type filter dropdown
    - Add sort dropdown
    - Add view toggle (grid/list)
    - Add Upload button
    - Display storage usage
    - _Requirements: 1.7, 4.1, 4.2, 4.3, 4.4, 9.2_
  - [ ] 4.4 Create MediaGrid component
    - Create `src/app/dashboard/media/components/media-grid.tsx`
    - Responsive grid layout
    - Infinite scroll pagination
    - Empty state
    - _Requirements: 1.2, 1.3, 1.5_
  - [ ] 4.5 Create AssetCard component
    - Create `src/app/dashboard/media/components/asset-card.tsx`
    - Display thumbnail
    - Show filename with tooltip
    - Hover overlay with quick actions
    - Checkbox for multi-select
    - _Requirements: 1.4, 1.6, 8.1_

- [ ] 5. Checkpoint - Verify dashboard UI
  - Ensure page loads and displays grid
  - Test search and filters
  - Ask user if questions arise

- [ ] 6. Upload System
  - [ ] 6.1 Create useUpload hook
    - Create `src/lib/media/hooks/use-upload.ts`
    - File validation (type, size)
    - Track upload progress
    - Handle errors with retry
    - Support multiple files
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.9_
  - [ ] 6.2 Create UploadZone component
    - Create `src/app/dashboard/media/components/upload-zone.tsx`
    - Drag-and-drop support
    - Click to open file picker
    - Show upload progress
    - Success/error states
    - _Requirements: 2.2, 2.3, 2.7, 2.8, 2.9_

- [ ] 7. Asset Details Panel
  - [ ] 7.1 Create AssetDetails component
    - Create `src/app/dashboard/media/components/asset-details.tsx`
    - Full preview display
    - Metadata display (filename, type, dimensions, size, date)
    - Editable filename/alt text
    - Copy URL button
    - Replace file option
    - Delete with confirmation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 8. Folder System
  - [ ] 8.1 Implement folder server actions
    - Add createFolder, renameFolder, deleteFolder, getFolders to actions.ts
    - Add moveAssets action
    - _Requirements: 3.2, 3.6, 3.7, 3.8_
  - [ ] 8.2 Create FolderSidebar component
    - Create `src/app/dashboard/media/components/folder-sidebar.tsx`
    - Display folder tree
    - New Folder button
    - Drag-drop assets to folders
    - Context menu (rename, delete)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_
  - [ ] 8.3 Add breadcrumb navigation
    - Show folder path in header
    - Clickable segments
    - _Requirements: 3.5_

- [ ] 9. Checkpoint - Verify folders and upload
  - Test folder creation and navigation
  - Test drag-drop to folders
  - Test file upload flow
  - Ask user if questions arise

- [ ] 10. Media Picker Component
  - [ ] 10.1 Create MediaPicker modal
    - Create `src/components/media/media-picker.tsx`
    - Dialog with grid view
    - Search and filters
    - Single and multiple selection
    - Upload tab
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.8_
  - [ ] 10.2 Create MediaPickerTrigger component
    - Create `src/components/media/media-picker-trigger.tsx`
    - Button that opens picker
    - Show selected preview
    - Export from index.ts
    - _Requirements: 6.1, 6.6_
  - [ ] 10.3 Integrate with Visual Editor
    - Update image fields in `src/lib/editor/fields/` to use MediaPicker
    - Test in settings panel
    - _Requirements: 6.1, 6.6, 6.9_

- [ ] 11. Bulk Operations
  - [ ] 11.1 Add multi-select to grid
    - Selection state management
    - Checkbox on hover/select
    - Select All option
    - Selection count display
    - _Requirements: 8.1, 8.5_
  - [ ] 11.2 Create BulkActionBar component
    - Move to folder action
    - Delete selected action
    - Progress feedback
    - _Requirements: 8.2, 8.3, 8.4, 8.6, 8.7_
  - [ ] 11.3 Implement bulk server actions
    - Add bulkDeleteAssets, bulkMoveAssets to actions.ts
    - Handle partial failures
    - _Requirements: 8.3, 8.4, 8.7_

- [ ] 12. Storage Quotas
  - [ ] 12.1 Implement storage tracking
    - Add getStorageUsage server action
    - Display usage in header
    - _Requirements: 9.1, 9.2_
  - [ ] 12.2 Add quota enforcement
    - Warning banner at 80%
    - Block uploads when exceeded
    - _Requirements: 9.3, 9.4, 9.5_

- [ ] 13. Final Checkpoint
  - Run `pnpm build` to verify no errors
  - Test complete upload → organize → select flow
  - Verify editor integration works
  - Ask user if questions arise

## Notes

- All server actions use RLS for tenant isolation
- Vercel Blob provides CDN URLs automatically
- Soft delete allows recovery if needed
- Tasks reference specific requirement numbers (e.g., 2.1 = Requirement 2, Acceptance Criteria 1)
