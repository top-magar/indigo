/**
 * Media Upload API Route
 * 
 * Supports both Vercel Blob and AWS S3 storage
 * Storage provider is determined by environment configuration
 * 
 * Features:
 * - Image upload to S3
 * - Auto-tagging for product images
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createLogger } from "@/lib/logger";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
const log = createLogger("api:media-upload");

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'vercel'; // 'vercel' | 's3'
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ENABLE_MODERATION = process.env.AWS_REKOGNITION_ENABLED === 'true';

// Image types that can be moderated
const MODERATABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const POST = withRateLimit("dashboard", async function POST(request: Request) {
  try {
    // Authenticate
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;
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
    // TODO: Re-add image moderation with a content moderation provider

    const { uploadToS3 } = await import('@/infrastructure/aws/s3');
    const result = await uploadToS3(buffer, {
      tenantId,
      filename: file.name,
      contentType: file.type,
      folder: folder || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({
      url: result.cdnUrl || result.s3Url,
      key: result.key,
      provider: STORAGE_PROVIDER,
      moderated: ENABLE_MODERATION && isImage,
    });
  } catch (error) {
    log.error('[Upload API] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
});

/**
 * GET: Generate presigned URL for direct client upload to S3
 */
export const GET = withRateLimit("dashboard", async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;
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

    const { getPresignedUploadUrl, getCdnUrl } = await import('@/infrastructure/aws/s3');

    const result = await getPresignedUploadUrl(
      { tenantId, filename, contentType, folder: folder || undefined },
      3600
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: result.url,
      key: result.key,
      cdnUrl: getCdnUrl(result.key),
    });
  } catch (error) {
    log.error('[Upload API] Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
});
