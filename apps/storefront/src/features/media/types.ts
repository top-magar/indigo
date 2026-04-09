/**
 * Media Library Type Definitions
 * 
 * These types extend the Drizzle schema types with additional
 * application-specific types for the media library feature.
 */

import type {
  MediaAsset as DbMediaAsset,
  MediaFolder as DbMediaFolder,
  MediaAssetUsage as DbMediaAssetUsage,
} from "@/db/schema/media";

// Re-export database types
export type { MediaAsset, MediaFolder, MediaAssetUsage } from "@/db/schema/media";

/**
 * Allowed MIME types for upload
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

export const ALLOWED_DOCUMENT_TYPES = ["application/pdf"] as const;

export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * Maximum file size in bytes (10MB)
 * Note: This must match the serverActions.bodySizeLimit in next.config.ts
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * File type categories for filtering
 */
export type FileTypeFilter = "all" | "images" | "videos" | "documents";

/**
 * Sort options for asset listing
 */
export type AssetSortOption =
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "size_asc"
  | "size_desc";

/**
 * Date range filter options
 */
export type DateRangeFilter =
  | "all"
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "last90days"
  | "custom";

/**
 * File size range filter options
 */
export type SizeRangeFilter =
  | "all"
  | "under1mb"
  | "1to5mb"
  | "5to10mb"
  | "over10mb";

/**
 * Complete media filters state
 */
export interface MediaFiltersState {
  fileType: FileTypeFilter;
  sort: AssetSortOption;
  dateRange: DateRangeFilter;
  sizeRange: SizeRangeFilter;
  customDateFrom?: Date;
  customDateTo?: Date;
}

/**
 * View mode for the media library
 */
export type ViewMode = "grid" | "list";

/**
 * Upload status for individual files
 */
export type UploadStatus = "pending" | "uploading" | "complete" | "error";

/**
 * Single file being uploaded
 */
export interface UploadingFile {
  id: string;
  file: File;
  progress: number; // 0-100
  status: UploadStatus;
  error?: string;
  asset?: DbMediaAsset; // Populated on success
}

/**
 * Overall upload state
 */
export interface UploadState {
  files: UploadingFile[];
  isUploading: boolean;
  totalProgress: number; // 0-100 average across all files
}

/**
 * Media asset with folder info (for display)
 */
export interface MediaAssetWithFolder extends DbMediaAsset {
  folder?: DbMediaFolder | null;
}

/**
 * Media asset with usage info (for details panel)
 */
export interface MediaAssetWithUsages extends DbMediaAsset {
  usages: DbMediaAssetUsage[];
}

/**
 * Folder with nested structure (for tree view)
 */
export interface MediaFolderTree extends DbMediaFolder {
  children: MediaFolderTree[];
  assetCount?: number;
}

/**
 * Query parameters for listing assets
 */
export interface ListAssetsParams {
  folderId?: string | null; // null = root folder
  search?: string;
  fileType?: FileTypeFilter;
  sort?: AssetSortOption;
  cursor?: string; // For pagination
  limit?: number;
}

/**
 * Paginated response for assets
 */
export interface PaginatedAssets {
  assets: DbMediaAsset[];
  nextCursor?: string;
  hasMore: boolean;
  total: number;
}

/**
 * Storage usage info
 */
export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  assetCount: number;
  percentUsed: number;
}

/**
 * Default storage quota (5GB)
 */
export const DEFAULT_STORAGE_QUOTA = 5 * 1024 * 1024 * 1024;

/**
 * Media picker selection mode
 */
export type SelectionMode = "single" | "multiple";

/**
 * Media picker props
 */
export interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (assets: DbMediaAsset[]) => void;
  mode?: SelectionMode;
  accept?: AllowedMimeType[]; // Filter by mime types
  maxSelection?: number; // For multiple mode
}

/**
 * Bulk operation types
 */
export type BulkOperation = "move" | "delete" | "download";

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  success: string[]; // IDs that succeeded
  failed: Array<{ id: string; error: string }>; // IDs that failed with reason
}

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Validation result for file upload
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file for upload
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported`,
    };
  }

  return { valid: true };
}

/**
 * Get file type category from mime type
 */
export function getFileTypeCategory(
  mimeType: string
): "image" | "video" | "document" | "unknown" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  
  // Document types: PDF, Office documents, text files
  const documentMimeTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/rtf",
    "text/plain",
    "text/csv",
  ];
  
  if (documentMimeTypes.includes(mimeType)) return "document";
  
  return "unknown";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get thumbnail URL with size parameters
 */
export function getThumbnailUrl(
  cdnUrl: string,
  width: number = 150,
  height: number = 150
): string {
  // Vercel Blob supports image optimization via query params
  const url = new URL(cdnUrl);
  url.searchParams.set("w", width.toString());
  url.searchParams.set("h", height.toString());
  url.searchParams.set("fit", "cover");
  return url.toString();
}
