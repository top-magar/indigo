"use server";

import { put, del } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  validateFile,
  type ListAssetsParams,
  type PaginatedAssets,
  type StorageUsage,
  type BulkOperationResult,
  DEFAULT_STORAGE_QUOTA,
  ALLOWED_MIME_TYPES,
} from "@/lib/media/types";
import type { MediaAsset, MediaFolder } from "@/db/schema/media";

/**
 * Transform snake_case database row to camelCase MediaAsset
 */
function transformAsset(row: Record<string, unknown>): MediaAsset {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    folderId: row.folder_id as string | null,
    filename: row.filename as string,
    originalFilename: row.original_filename as string,
    mimeType: row.mime_type as string,
    sizeBytes: row.size_bytes as number,
    width: row.width as number | null,
    height: row.height as number | null,
    blobUrl: row.blob_url as string,
    cdnUrl: row.cdn_url as string,
    thumbnailUrl: row.thumbnail_url as string | null,
    altText: row.alt_text as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    deletedAt: row.deleted_at ? new Date(row.deleted_at as string) : null,
  };
}

/**
 * Transform snake_case database row to camelCase MediaFolder
 */
function transformFolder(row: Record<string, unknown>): MediaFolder {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    name: row.name as string,
    parentFolderId: row.parent_folder_id as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

/**
 * Get authenticated tenant context
 */
async function getAuthenticatedTenant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!userData?.tenant_id) {
    redirect("/auth/login");
  }

  return { supabase, tenantId: userData.tenant_id };
}

/**
 * Upload a media asset to Vercel Blob and save metadata
 */
export async function uploadAsset(
  formData: FormData
): Promise<{ success: boolean; asset?: MediaAsset; error?: string }> {
  try {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check storage quota
    const usage = await getStorageUsage();
    if (usage.usedBytes + file.size > usage.quotaBytes) {
      return {
        success: false,
        error: "Storage quota exceeded. Please upgrade your plan or delete unused files.",
      };
    }

    // Upload to Vercel Blob
    const blob = await put(`media/${tenantId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Get image dimensions if applicable
    let width: number | null = null;
    let height: number | null = null;

    if (file.type.startsWith("image/")) {
      try {
        const dimensions = await getImageDimensions(blob.url);
        width = dimensions.width;
        height = dimensions.height;
      } catch {
        // Dimensions extraction failed, continue without them
        console.warn("Failed to extract image dimensions");
      }
    }

    // Generate thumbnail URL for images
    const thumbnailUrl = file.type.startsWith("image/")
      ? `${blob.url}?w=150&h=150&fit=cover`
      : null;

    // Remove file extension for display name
    const filename = file.name.replace(/\.[^/.]+$/, "");

    // Save to database
    const { data: asset, error: dbError } = await supabase
      .from("media_assets")
      .insert({
        tenant_id: tenantId,
        folder_id: folderId || null,
        filename,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        width,
        height,
        blob_url: blob.url,
        cdn_url: blob.url, // Vercel Blob URLs are already CDN
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup blob on database error
      await del(blob.url);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    revalidatePath("/dashboard/media");

    return { success: true, asset: transformAsset(asset) };
  } catch (error) {
    console.error("Upload asset error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload asset",
    };
  }
}

/**
 * Get image dimensions from URL
 */
async function getImageDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  // For server-side, we'd need to fetch and parse the image
  // For now, return placeholder - dimensions will be extracted client-side
  // In production, use sharp or similar library
  return { width: 0, height: 0 };
}

/**
 * List media assets with pagination, search, and filters
 */
export async function getAssets(
  params: ListAssetsParams = {}
): Promise<PaginatedAssets> {
  const { supabase, tenantId } = await getAuthenticatedTenant();

  const {
    folderId,
    search,
    fileType = "all",
    sort = "newest",
    cursor,
    limit = 50,
  } = params;

  let query = supabase
    .from("media_assets")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .is("deleted_at", null);

  // Filter by folder
  // folderId === undefined means show ALL files (no folder filter)
  // folderId === null means show only root files (no folder assigned)
  // folderId === "some-id" means show files in that specific folder
  if (folderId === null) {
    // Show all files - no folder filter applied
    // This is the "All Files" view
  } else if (folderId) {
    query = query.eq("folder_id", folderId);
  }

  // Search by filename
  if (search) {
    query = query.ilike("filename", `%${search}%`);
  }

  // Filter by file type
  if (fileType === "images") {
    query = query.like("mime_type", "image/%");
  } else if (fileType === "videos") {
    query = query.like("mime_type", "video/%");
  } else if (fileType === "documents") {
    query = query.eq("mime_type", "application/pdf");
  }

  // Sort
  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "name_asc":
      query = query.order("filename", { ascending: true });
      break;
    case "name_desc":
      query = query.order("filename", { ascending: false });
      break;
    case "size_asc":
      query = query.order("size_bytes", { ascending: true });
      break;
    case "size_desc":
      query = query.order("size_bytes", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Pagination
  if (cursor) {
    query = query.gt("id", cursor);
  }
  query = query.limit(limit);

  const { data: assets, error, count } = await query;


  if (error) {
    console.error("Get assets error:", error);
    return { assets: [], hasMore: false, total: 0 };
  }

  const hasMore = (assets?.length || 0) === limit;
  const nextCursor = hasMore ? assets?.[assets.length - 1]?.id : undefined;

  return {
    assets: (assets || []).map(transformAsset),
    nextCursor,
    hasMore,
    total: count || 0,
  };
}

/**
 * Get a single asset by ID
 */
export async function getAsset(
  assetId: string
): Promise<{ asset?: MediaAsset; error?: string }> {
  const { supabase, tenantId } = await getAuthenticatedTenant();

  const { data: asset, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("id", assetId)
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { asset: transformAsset(asset) };
}

/**
 * Update asset metadata (filename, alt text)
 */
export async function updateAsset(
  assetId: string,
  updates: { filename?: string; altText?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const updateData: Record<string, unknown> = {};
    if (updates.filename !== undefined) {
      updateData.filename = updates.filename;
    }
    if (updates.altText !== undefined) {
      updateData.alt_text = updates.altText;
    }

    const { error } = await supabase
      .from("media_assets")
      .update(updateData)
      .eq("id", assetId)
      .eq("tenant_id", tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update asset",
    };
  }
}

/**
 * Soft delete an asset
 */
export async function deleteAsset(
  assetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Get asset to delete from blob storage
    const { data: asset, error: fetchError } = await supabase
      .from("media_assets")
      .select("blob_url")
      .eq("id", assetId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !asset) {
      return { success: false, error: "Asset not found" };
    }

    // Delete from Vercel Blob
    try {
      await del(asset.blob_url);
    } catch (blobError) {
      console.warn("Failed to delete blob:", blobError);
      // Continue with soft delete even if blob deletion fails
    }

    // Soft delete in database
    const { error } = await supabase
      .from("media_assets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", assetId)
      .eq("tenant_id", tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete asset",
    };
  }
}

/**
 * Get storage usage for the current tenant
 */
export async function getStorageUsage(): Promise<StorageUsage> {
  const { supabase, tenantId } = await getAuthenticatedTenant();

  const { data, error } = await supabase
    .from("media_assets")
    .select("size_bytes")
    .eq("tenant_id", tenantId)
    .is("deleted_at", null);

  if (error) {
    console.error("Get storage usage error:", error);
    return {
      usedBytes: 0,
      quotaBytes: DEFAULT_STORAGE_QUOTA,
      assetCount: 0,
      percentUsed: 0,
    };
  }

  const usedBytes = data?.reduce((sum, asset) => sum + (asset.size_bytes || 0), 0) || 0;
  const assetCount = data?.length || 0;

  return {
    usedBytes,
    quotaBytes: DEFAULT_STORAGE_QUOTA,
    assetCount,
    percentUsed: Math.round((usedBytes / DEFAULT_STORAGE_QUOTA) * 100),
  };
}

// ============================================================================
// FOLDER ACTIONS
// ============================================================================

/**
 * Get all folders for the current tenant
 */
export async function getFolders(): Promise<MediaFolder[]> {
  const { supabase, tenantId } = await getAuthenticatedTenant();

  const { data: folders, error } = await supabase
    .from("media_folders")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Get folders error:", error);
    return [];
  }

  return (folders || []).map(transformFolder);
}

/**
 * Create a new folder
 */
export async function createFolder(
  name: string,
  parentFolderId?: string | null
): Promise<{ success: boolean; folder?: MediaFolder; error?: string }> {
  try {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data: folder, error } = await supabase
      .from("media_folders")
      .insert({
        tenant_id: tenantId,
        name,
        parent_folder_id: parentFolderId || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A folder with this name already exists" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/media");
    return { success: true, folder: transformFolder(folder) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create folder",
    };
  }
}

/**
 * Rename a folder
 */
export async function renameFolder(
  folderId: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
      .from("media_folders")
      .update({ name: newName })
      .eq("id", folderId)
      .eq("tenant_id", tenantId);

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "A folder with this name already exists" };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to rename folder",
    };
  }
}

/**
 * Delete a folder (moves contents to parent or root)
 */
export async function deleteFolder(
  folderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    // Get folder to find parent
    const { data: folder, error: fetchError } = await supabase
      .from("media_folders")
      .select("parent_folder_id")
      .eq("id", folderId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !folder) {
      return { success: false, error: "Folder not found" };
    }

    // Move assets to parent folder (or root)
    await supabase
      .from("media_assets")
      .update({ folder_id: folder.parent_folder_id })
      .eq("folder_id", folderId)
      .eq("tenant_id", tenantId);

    // Move child folders to parent
    await supabase
      .from("media_folders")
      .update({ parent_folder_id: folder.parent_folder_id })
      .eq("parent_folder_id", folderId)
      .eq("tenant_id", tenantId);

    // Delete the folder
    const { error } = await supabase
      .from("media_folders")
      .delete()
      .eq("id", folderId)
      .eq("tenant_id", tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete folder",
    };
  }
}

/**
 * Move assets to a different folder
 */
export async function moveAssets(
  assetIds: string[],
  targetFolderId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
      .from("media_assets")
      .update({ folder_id: targetFolderId })
      .in("id", assetIds)
      .eq("tenant_id", tenantId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/media");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move assets",
    };
  }
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

/**
 * Bulk delete assets
 */
export async function bulkDeleteAssets(
  assetIds: string[]
): Promise<BulkOperationResult> {
  const { supabase, tenantId } = await getAuthenticatedTenant();

  const success: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  for (const assetId of assetIds) {
    try {
      // Get asset blob URL
      const { data: asset } = await supabase
        .from("media_assets")
        .select("blob_url")
        .eq("id", assetId)
        .eq("tenant_id", tenantId)
        .single();

      if (asset) {
        // Delete from blob storage
        try {
          await del(asset.blob_url);
        } catch {
          // Continue even if blob deletion fails
        }

        // Soft delete in database
        const { error } = await supabase
          .from("media_assets")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", assetId)
          .eq("tenant_id", tenantId);

        if (error) {
          failed.push({ id: assetId, error: error.message });
        } else {
          success.push(assetId);
        }
      } else {
        failed.push({ id: assetId, error: "Asset not found" });
      }
    } catch (error) {
      failed.push({
        id: assetId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  revalidatePath("/dashboard/media");
  return { success, failed };
}

/**
 * Bulk move assets to folder
 */
export async function bulkMoveAssets(
  assetIds: string[],
  targetFolderId: string | null
): Promise<BulkOperationResult> {
  const { supabase, tenantId } = await getAuthenticatedTenant();

  const { error } = await supabase
    .from("media_assets")
    .update({ folder_id: targetFolderId })
    .in("id", assetIds)
    .eq("tenant_id", tenantId);

  if (error) {
    return {
      success: [],
      failed: assetIds.map((id) => ({ id, error: error.message })),
    };
  }

  revalidatePath("/dashboard/media");
  return { success: assetIds, failed: [] };
}
