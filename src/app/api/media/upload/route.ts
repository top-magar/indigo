import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  validateFile,
  DEFAULT_STORAGE_QUOTA,
  type MediaAsset,
} from "@/lib/media/types";

/**
 * POST /api/media/upload
 * Upload a media asset to Vercel Blob and save metadata
 * Uses API route instead of Server Action to handle larger files
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!userData?.tenant_id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenantId = userData.tenant_id;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Check storage quota
    const { data: usageData } = await supabase
      .from("media_assets")
      .select("size_bytes")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null);

    const usedBytes = usageData?.reduce((sum, asset) => sum + (asset.size_bytes || 0), 0) || 0;
    
    if (usedBytes + file.size > DEFAULT_STORAGE_QUOTA) {
      return NextResponse.json(
        { success: false, error: "Storage quota exceeded. Please upgrade your plan or delete unused files." },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`media/${tenantId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

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
        width: null,
        height: null,
        blob_url: blob.url,
        cdn_url: blob.url,
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup blob on database error
      const { del } = await import("@vercel/blob");
      await del(blob.url);
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    revalidatePath("/dashboard/media");

    // Transform snake_case to camelCase for client
    const transformedAsset: MediaAsset = {
      id: asset.id,
      tenantId: asset.tenant_id,
      folderId: asset.folder_id,
      filename: asset.filename,
      originalFilename: asset.original_filename,
      mimeType: asset.mime_type,
      sizeBytes: asset.size_bytes,
      width: asset.width,
      height: asset.height,
      blobUrl: asset.blob_url,
      cdnUrl: asset.cdn_url,
      thumbnailUrl: asset.thumbnail_url,
      altText: asset.alt_text,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
      deletedAt: asset.deleted_at,
    };

    return NextResponse.json({ 
      success: true, 
      asset: transformedAsset 
    });
  } catch (error) {
    console.error("Upload asset error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to upload asset" },
      { status: 500 }
    );
  }
}

// Route segment config for larger file uploads
// In App Router, body parsing is handled automatically for formData
export const maxDuration = 60; // Allow up to 60 seconds for large uploads
