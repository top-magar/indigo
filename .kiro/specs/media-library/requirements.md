# Requirements Document

## Introduction

This document specifies requirements for a comprehensive Media Library system for the Indigo e-commerce platform. The Media Library will provide centralized asset management for images, videos, and files used across storefronts, products, and the visual editor. This feature is identified as a high priority across architecture, development, and editor analysis documents.

## Background

Currently, Indigo lacks a centralized media management system. Images are uploaded directly to fields without organization, search, or reuse capabilities. Merchants uploading hundreds of images need:
- Organized storage with folders/tags
- Quick search and filtering
- Easy integration with the visual editor
- CDN delivery for performance
- Image optimization and transformations

## Glossary

- **Media_Library**: The centralized asset management system for all store media
- **Media_Asset**: A single file (image, video, document) stored in the library
- **Media_Folder**: A virtual folder for organizing assets
- **Media_Picker**: A modal/dialog for selecting assets from the library
- **Asset_Upload**: The process of adding new files to the library
- **CDN**: Content Delivery Network for fast global asset delivery
- **Image_Transform**: On-the-fly image resizing, cropping, and format conversion

## Requirements

### Requirement 1: Media Library Dashboard

**User Story:** As a store owner, I want a dedicated media library page in my dashboard, so that I can view and manage all my uploaded assets in one place.

#### Acceptance Criteria

1. THE Dashboard SHALL include a "Media" navigation item in the sidebar under the Content section
2. WHEN accessing the Media Library, THE system SHALL display a grid view of all uploaded assets
3. THE Media_Library SHALL support switching between grid view and list view
4. THE Media_Library SHALL display asset thumbnails, file names, and upload dates
5. THE Media_Library SHALL support pagination or infinite scroll for large asset collections
6. WHEN hovering over an asset, THE Media_Library SHALL display quick actions (preview, copy URL, delete)
7. THE Media_Library SHALL display total storage used and asset count in the header

### Requirement 2: Asset Upload

**User Story:** As a store owner, I want to upload images and files to my media library, so that I can use them across my store.

#### Acceptance Criteria

1. THE Media_Library SHALL provide a prominent "Upload" button in the header
2. WHEN clicking Upload, THE system SHALL open a file picker supporting multiple file selection
3. THE Asset_Upload system SHALL support drag-and-drop file upload onto the library grid
4. THE Asset_Upload system SHALL accept image formats: JPEG, PNG, WebP, GIF, SVG
5. THE Asset_Upload system SHALL accept video formats: MP4, WebM
6. THE Asset_Upload system SHALL enforce a maximum file size of 10MB per file
7. WHILE uploading, THE Media_Library SHALL display upload progress for each file
8. WHEN upload completes, THE Media_Library SHALL display the new asset in the grid
9. IF upload fails, THEN THE system SHALL display an error message with retry option
10. THE Asset_Upload system SHALL automatically generate thumbnails for uploaded images

### Requirement 3: Asset Organization with Folders

**User Story:** As a store owner, I want to organize my assets into folders, so that I can easily find and manage related files.

#### Acceptance Criteria

1. THE Media_Library SHALL support creating folders to organize assets
2. WHEN clicking "New Folder", THE system SHALL prompt for a folder name
3. THE Media_Library SHALL display folders at the top of the grid with distinct folder icons
4. WHEN clicking a folder, THE Media_Library SHALL navigate into that folder showing its contents
5. THE Media_Library SHALL display a breadcrumb navigation showing the current folder path
6. THE Media_Library SHALL support moving assets between folders via drag-and-drop
7. THE Media_Library SHALL support renaming and deleting folders
8. WHEN deleting a folder, THE system SHALL prompt to confirm and handle contained assets
9. THE Media_Library SHALL support nested folders up to 3 levels deep

### Requirement 4: Search and Filter

**User Story:** As a store owner, I want to search and filter my media assets, so that I can quickly find the files I need.

#### Acceptance Criteria

1. THE Media_Library SHALL provide a search input in the header
2. WHEN typing in search, THE system SHALL filter assets by filename in real-time
3. THE Media_Library SHALL provide filter options for file type (images, videos, documents)
4. THE Media_Library SHALL provide sort options (newest, oldest, name A-Z, name Z-A, size)
5. WHEN filters are active, THE Media_Library SHALL display a clear filters button
6. THE search SHALL be case-insensitive and support partial matches
7. THE Media_Library SHALL display "No results found" when search/filter returns empty

### Requirement 5: Asset Details and Editing

**User Story:** As a store owner, I want to view and edit asset details, so that I can manage metadata and optimize my files.

#### Acceptance Criteria

1. WHEN clicking an asset, THE Media_Library SHALL open a details panel/modal
2. THE asset details SHALL display: preview, filename, file type, dimensions, file size, upload date
3. THE asset details SHALL allow editing the filename (alt text)
4. THE asset details SHALL display the CDN URL with a copy button
5. THE asset details SHALL show where the asset is used (products, blocks, pages)
6. THE asset details SHALL provide a "Replace" option to update the file while keeping the URL
7. THE asset details SHALL provide a "Delete" option with confirmation
8. IF an asset is in use, THEN THE delete confirmation SHALL warn about affected content

### Requirement 6: Media Picker Integration

**User Story:** As a store owner using the visual editor, I want to select images from my media library, so that I can reuse assets without re-uploading.

#### Acceptance Criteria

1. THE Visual_Editor image fields SHALL display a "Choose from Library" button
2. WHEN clicking "Choose from Library", THE system SHALL open the Media_Picker modal
3. THE Media_Picker SHALL display the same grid view as the Media Library
4. THE Media_Picker SHALL support search, folders, and filters
5. THE Media_Picker SHALL allow uploading new files directly from the picker
6. WHEN selecting an asset, THE Media_Picker SHALL close and populate the image field
7. THE Media_Picker SHALL support selecting multiple assets where applicable
8. THE Media_Picker SHALL show a "Selected" indicator on chosen assets
9. THE Product form image fields SHALL also integrate with the Media_Picker

### Requirement 7: CDN Integration and Optimization

**User Story:** As a store owner, I want my images to load fast globally, so that my customers have a great shopping experience.

#### Acceptance Criteria

1. THE Asset_Upload system SHALL store files in a CDN-backed storage (Vercel Blob, Cloudinary, or S3+CloudFront)
2. THE system SHALL serve all media assets through CDN URLs
3. THE system SHALL support on-the-fly image transformations (resize, crop, format)
4. THE system SHALL automatically serve WebP format to supported browsers
5. THE system SHALL generate responsive image srcsets for different viewport sizes
6. THE system SHALL lazy-load images below the fold in storefronts
7. THE CDN URLs SHALL include cache-busting parameters when assets are replaced

### Requirement 8: Bulk Operations

**User Story:** As a store owner, I want to perform actions on multiple assets at once, so that I can efficiently manage large libraries.

#### Acceptance Criteria

1. THE Media_Library SHALL support selecting multiple assets via checkboxes
2. WHEN multiple assets are selected, THE system SHALL display a bulk action bar
3. THE bulk actions SHALL include: Move to folder, Delete, Download
4. WHEN bulk deleting, THE system SHALL display a confirmation with count
5. THE Media_Library SHALL support "Select All" for the current view
6. WHEN performing bulk operations, THE system SHALL display progress feedback
7. IF any bulk operation fails, THEN THE system SHALL report which items failed

### Requirement 9: Storage Limits and Quotas

**User Story:** As a platform operator, I want to enforce storage limits per store, so that I can manage infrastructure costs.

#### Acceptance Criteria

1. THE system SHALL track storage usage per store
2. THE Media_Library header SHALL display current usage vs. quota (e.g., "2.5 GB / 5 GB")
3. WHEN approaching quota (80%), THE system SHALL display a warning banner
4. WHEN quota is exceeded, THE Asset_Upload system SHALL block new uploads with upgrade prompt
5. THE system SHALL support different storage quotas per pricing plan
6. THE Dashboard settings SHALL display storage usage breakdown by file type

### Requirement 10: Database Schema

**User Story:** As a developer, I want a well-designed database schema for media assets, so that the system is performant and maintainable.

#### Acceptance Criteria

1. THE database SHALL include a `media_assets` table with columns: id, store_id, filename, original_filename, mime_type, size_bytes, width, height, cdn_url, folder_id, created_at, updated_at
2. THE database SHALL include a `media_folders` table with columns: id, store_id, name, parent_folder_id, created_at
3. THE database SHALL enforce RLS policies scoping assets to their store_id
4. THE database SHALL include indexes on store_id, folder_id, and created_at for query performance
5. THE database SHALL support soft-delete for assets with a deleted_at column
6. THE system SHALL track asset usage in a `media_asset_usages` junction table

## Non-Functional Requirements

### Performance
- Media Library grid SHALL load within 2 seconds for up to 1000 assets
- Image thumbnails SHALL be served at optimized sizes (150x150 for grid)
- Search results SHALL appear within 500ms of typing

### Security
- All uploads SHALL be scanned for malware
- Asset URLs SHALL be signed or use private CDN paths
- RLS SHALL prevent cross-store asset access

### Scalability
- System SHALL support stores with 10,000+ assets
- CDN SHALL handle global traffic without origin overload

## Dependencies

- Vercel Blob Storage or Cloudinary account
- Database migration for new tables
- Visual Editor field system updates

## Out of Scope (Future)

- AI-powered image tagging
- Image editing (crop, rotate) in browser
- Video transcoding
- Asset versioning/history
