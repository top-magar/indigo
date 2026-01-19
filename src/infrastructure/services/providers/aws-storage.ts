/**
 * AWS Storage Provider
 * 
 * Implements StorageProvider interface using AWS S3
 * Wraps existing S3 implementation from src/infrastructure/aws/s3.ts
 */

import type { StorageProvider, UploadOptions, UploadResult, StorageObject } from './types';
import {
  uploadToS3,
  deleteFromS3,
  getCdnUrl,
  getPresignedDownloadUrl,
  fileExists,
  listTenantFiles,
} from '@/infrastructure/aws/s3';

export class AWSStorageProvider implements StorageProvider {
  /**
   * Upload file to S3
   */
  async upload(file: Buffer | Uint8Array, options: UploadOptions): Promise<UploadResult> {
    const result = await uploadToS3(file, options);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      key: result.key,
      url: result.cdnUrl || result.s3Url,
    };
  }

  /**
   * Delete file from S3
   */
  async delete(key: string): Promise<void> {
    const result = await deleteFromS3(key);

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete file');
    }
  }

  /**
   * Get CDN URL for a file
   */
  getUrl(key: string): string {
    return getCdnUrl(key);
  }

  /**
   * Get presigned URL for private file download
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const url = await getPresignedDownloadUrl(key, expiresIn);

    if (!url) {
      throw new Error('Failed to generate presigned URL');
    }

    return url;
  }

  /**
   * Check if file exists in S3
   */
  async exists(key: string): Promise<boolean> {
    return fileExists(key);
  }

  /**
   * List files for a tenant
   */
  async list(prefix: string, maxKeys: number = 100): Promise<StorageObject[]> {
    // Parse prefix to extract tenantId and folder
    // Expected format: "tenants/{tenantId}/{folder}/"
    const parts = prefix.split('/');
    
    if (parts.length < 2 || parts[0] !== 'tenants') {
      throw new Error('Invalid prefix format. Expected: tenants/{tenantId}/{folder}/');
    }

    const tenantId = parts[1];
    const folder = parts.length > 2 ? parts.slice(2).join('/').replace(/\/$/, '') : undefined;

    const files = await listTenantFiles(tenantId, folder, maxKeys);

    return files.map(file => ({
      key: file.key,
      size: file.size,
      lastModified: file.lastModified,
      contentType: undefined, // S3 list doesn't return content type
    }));
  }
}
