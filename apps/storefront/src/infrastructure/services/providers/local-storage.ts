/**
 * Local Storage Provider
 * 
 * Implements StorageProvider interface using local filesystem
 * Useful for development, testing, and fallback scenarios
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { StorageProvider, UploadOptions, UploadResult, StorageObject } from './types';

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private baseUrl: string;

  constructor(options?: { baseDir?: string; baseUrl?: string }) {
    this.baseDir = options?.baseDir || path.join(process.cwd(), 'public', 'uploads');
    this.baseUrl = options?.baseUrl || '/uploads';
  }

  /**
   * Upload file to local filesystem
   */
  async upload(file: Buffer | Uint8Array, options: UploadOptions): Promise<UploadResult> {
    try {
      // Generate key
      const key = this.generateKey(options.tenantId, options.filename, options.folder);
      const filePath = path.join(this.baseDir, key);

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write file
      await fs.writeFile(filePath, file);

      // Write metadata
      const metadataPath = `${filePath}.meta.json`;
      await fs.writeFile(
        metadataPath,
        JSON.stringify({
          tenantId: options.tenantId,
          filename: options.filename,
          contentType: options.contentType,
          folder: options.folder,
          metadata: options.metadata,
          uploadedAt: new Date().toISOString(),
        })
      );

      return {
        success: true,
        key,
        url: this.getUrl(key),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Delete file from local filesystem
   */
  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    const metadataPath = `${filePath}.meta.json`;

    try {
      // Delete file
      await fs.unlink(filePath);

      // Delete metadata (ignore if doesn't exist)
      try {
        await fs.unlink(metadataPath);
      } catch {
        // Metadata file might not exist
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Delete failed');
    }
  }

  /**
   * Get public URL for a file
   */
  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  /**
   * Get presigned URL (for local storage, just return regular URL)
   */
  async getPresignedUrl(key: string, expiresIn?: number): Promise<string> {
    // For local storage, we don't have presigned URLs
    // Just return the regular URL
    return this.getUrl(key);
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, key);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List files with prefix
   */
  async list(prefix: string, maxKeys: number = 100): Promise<StorageObject[]> {
    const dirPath = path.join(this.baseDir, prefix);
    const files: StorageObject[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (files.length >= maxKeys) break;

        // Skip metadata files
        if (entry.name.endsWith('.meta.json')) continue;

        if (entry.isFile()) {
          const filePath = path.join(dirPath, entry.name);
          const stats = await fs.stat(filePath);
          const key = path.join(prefix, entry.name);

          // Try to read metadata
          let contentType: string | undefined;
          try {
            const metadataPath = `${filePath}.meta.json`;
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(metadataContent);
            contentType = metadata.contentType;
          } catch {
            // Metadata not available
          }

          files.push({
            key,
            size: stats.size,
            lastModified: stats.mtime,
            contentType,
          });
        }
      }

      return files;
    } catch (error) {
      // Directory doesn't exist or other error
      return [];
    }
  }

  /**
   * Generate storage key
   */
  private generateKey(tenantId: string, filename: string, folder?: string): string {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const uniqueFilename = `${timestamp}-${randomSuffix}-${sanitizedFilename}`;

    return folder
      ? `tenants/${tenantId}/${folder}/${uniqueFilename}`
      : `tenants/${tenantId}/${uniqueFilename}`;
  }
}
