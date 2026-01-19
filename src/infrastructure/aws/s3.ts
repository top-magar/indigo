/**
 * AWS S3 Service for Media Storage
 * 
 * Provides S3 upload/download with CloudFront CDN delivery
 * Alternative to Vercel Blob for media storage
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'indigo-media-assets';
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN || 'd1s07hm6t7mxic.cloudfront.net';

// Lazy-initialized S3 client
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined, // Uses default credential chain (IAM role, env vars, etc.)
    });
  }
  return s3Client;
}

export interface UploadOptions {
  tenantId: string;
  filename: string;
  contentType: string;
  folder?: string;
}

export interface UploadResult {
  success: boolean;
  key?: string;
  s3Url?: string;
  cdnUrl?: string;
  error?: string;
}

/**
 * Generate S3 key with tenant isolation
 */
function generateKey(tenantId: string, filename: string, folder?: string): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const uniqueFilename = `${timestamp}-${randomSuffix}-${sanitizedFilename}`;
  
  return folder
    ? `tenants/${tenantId}/${folder}/${uniqueFilename}`
    : `tenants/${tenantId}/${uniqueFilename}`;
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer | Uint8Array,
  options: UploadOptions
): Promise<UploadResult> {
  const { tenantId, filename, contentType, folder } = options;
  const key = generateKey(tenantId, filename, folder);

  try {
    const client = getS3Client();
    
    await client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: {
        'tenant-id': tenantId,
        'original-filename': filename,
      },
    }));

    return {
      success: true,
      key,
      s3Url: `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`,
      cdnUrl: `https://${CLOUDFRONT_DOMAIN}/${key}`,
    };
  } catch (error) {
    console.error('[S3] Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}


/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getS3Client();
    
    await client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));

    return { success: true };
  } catch (error) {
    console.error('[S3] Delete failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Generate presigned URL for direct upload (client-side uploads)
 */
export async function getPresignedUploadUrl(
  options: UploadOptions,
  expiresIn: number = 3600
): Promise<{ url: string; key: string } | { error: string }> {
  const { tenantId, filename, contentType, folder } = options;
  const key = generateKey(tenantId, filename, folder);

  try {
    const client = getS3Client();
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: {
        'tenant-id': tenantId,
        'original-filename': filename,
      },
    });

    const url = await getSignedUrl(client, command, { expiresIn });

    return { url, key };
  } catch (error) {
    console.error('[S3] Presigned URL generation failed:', error);
    return { error: error instanceof Error ? error.message : 'Failed to generate upload URL' };
  }
}

/**
 * Generate presigned URL for private file download
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const client = getS3Client();
    
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    return await getSignedUrl(client, command, { expiresIn });
  } catch (error) {
    console.error('[S3] Presigned download URL failed:', error);
    return null;
  }
}

/**
 * Check if file exists in S3
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const client = getS3Client();
    
    await client.send(new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));

    return true;
  } catch {
    return false;
  }
}

/**
 * List files for a tenant
 */
export async function listTenantFiles(
  tenantId: string,
  folder?: string,
  maxKeys: number = 100
): Promise<{ key: string; size: number; lastModified: Date }[]> {
  try {
    const client = getS3Client();
    const prefix = folder
      ? `tenants/${tenantId}/${folder}/`
      : `tenants/${tenantId}/`;

    const response = await client.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
      MaxKeys: maxKeys,
    }));

    return (response.Contents || []).map(item => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  } catch (error) {
    console.error('[S3] List files failed:', error);
    return [];
  }
}

/**
 * Get CDN URL for a key
 */
export function getCdnUrl(key: string): string {
  return `https://${CLOUDFRONT_DOMAIN}/${key}`;
}

/**
 * Extract key from CDN URL
 */
export function getKeyFromCdnUrl(cdnUrl: string): string | null {
  const match = cdnUrl.match(new RegExp(`https://${CLOUDFRONT_DOMAIN}/(.+)`));
  return match ? match[1] : null;
}
