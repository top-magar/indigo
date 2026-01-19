/**
 * Media Upload API Route
 * 
 * Supports both Vercel Blob and AWS S3 storage
 * Storage provider is determined by environment configuration
 * 
 * Features:
 * - Automatic image moderation via AWS Rekognition
 * - Auto-tagging for product images
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/infrastructure/auth/session';
import { StorageService, AIService } from '@/infrastructure/services';

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'vercel'; // 'vercel' | 's3'
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ENABLE_MODERATION = process.env.AWS_REKOGNITION_ENABLED === 'true';

// Image types that can be moderated
const MODERATABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;
    const skipModeration = formData.get('skipModeration') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isImage = MODERATABLE_TYPES.includes(file.type);

    // Moderate image before upload (if enabled and applicable)
    let moderationResult = null;
    let suggestedTags: string[] = [];

    if (ENABLE_MODERATION && isImage && !skipModeration) {
      try {
        const aiService = new AIService();
        
        // Convert buffer to data URL for moderation
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        // Moderate and extract labels
        const analysis = await aiService.analyzeImage(dataUrl, {
          detectLabels: true,
          moderateContent: true,
          maxLabels: 10,
          minConfidence: 80,
        });
        
        if (analysis.moderation && !analysis.moderation.isSafe) {
          console.warn('[Upload API] Image flagged by moderation:', analysis.moderation.violations);
          return NextResponse.json({
            error: 'Image flagged for review',
            moderationLabels: analysis.moderation.violations.map(v => v.name),
            requiresReview: true,
          }, { status: 422 });
        }

        // Extract labels for auto-tagging
        suggestedTags = (analysis.labels || [])
          .filter(l => l.confidence > 80)
          .map(l => l.name.toLowerCase())
          .slice(0, 10);
      } catch (moderationError) {
        console.error('[Upload API] Moderation error (continuing):', moderationError);
        // Continue with upload even if moderation fails
      }
    }

    // Use StorageService for upload
    const storageService = new StorageService();
    const result = await storageService.upload(
      buffer,
      {
        tenantId,
        filename: file.name,
        contentType: file.type,
        folder: folder || undefined,
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      url: result.url,
      key: result.key,
      provider: STORAGE_PROVIDER,
      moderated: ENABLE_MODERATION && isImage,
      suggestedTags: suggestedTags.length > 0 ? suggestedTags : undefined,
    });
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

/**
 * GET: Generate presigned URL for direct client upload to S3
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const contentType = searchParams.get('contentType');
    const folder = searchParams.get('folder');

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }

    const storageService = new StorageService();
    
    // Generate a unique key for the file
    const key = folder 
      ? `${tenantId}/${folder}/${Date.now()}-${filename}`
      : `${tenantId}/${Date.now()}-${filename}`;
    
    const uploadUrl = await storageService.getPresignedUrl(key, 3600); // 1 hour
    const cdnUrl = storageService.getUrl(key);

    return NextResponse.json({
      uploadUrl,
      key,
      cdnUrl,
    });
  } catch (error) {
    console.error('[Upload API] Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
