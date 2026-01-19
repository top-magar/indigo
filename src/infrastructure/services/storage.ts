/**
 * Storage Service
 * 
 * Unified storage interface with automatic provider selection,
 * error handling, retry logic, and observability
 */

import { ServiceFactory } from './factory';
import { ServiceErrorHandler } from './error-handler';
import { ServiceObservability } from './observability';
import { ServiceValidator } from './validation';
import type { StorageProvider, UploadOptions, UploadResult, StorageObject } from './providers/types';

export class StorageService {
  private provider: StorageProvider;

  constructor() {
    this.provider = ServiceFactory.getStorageProvider();
  }

  /**
   * Upload a file with validation, retry, and observability
   */
  async upload(
    file: Buffer | Uint8Array,
    options: UploadOptions
  ): Promise<UploadResult> {
    // Validate tenant ID
    const tenantValidation = ServiceValidator.validateTenantId(options.tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: tenantValidation.error };
    }

    // Validate file
    const fileValidation = ServiceValidator.validateUploadFile(file, {
      maxSizeBytes: 50 * 1024 * 1024, // 50MB
      minSizeBytes: 1,
    });
    if (!fileValidation.valid) {
      return { success: false, error: fileValidation.error };
    }

    // Validate content type
    const contentTypeValidation = ServiceValidator.validateContentType(options.contentType);
    if (!contentTypeValidation.valid) {
      return { success: false, error: contentTypeValidation.error };
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'upload',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.upload(file, options),
          {
            maxRetries: 3,
            backoffMs: 100,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Upload retry attempt ${attempt}`,
                'upload',
                this.provider.constructor.name,
                { error: error.message, tenantId: options.tenantId }
              );
            },
          }
        ),
        {
          tenantId: options.tenantId,
          metadata: {
            filename: options.filename,
            contentType: options.contentType,
            size: file.byteLength,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Upload failed after retries',
        'upload',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Delete a file with retry and observability
   */
  async delete(key: string): Promise<{ success: boolean; error?: string }> {
    if (!key || typeof key !== 'string') {
      return { success: false, error: 'Invalid key' };
    }

    try {
      await ServiceObservability.trackOperation(
        'delete',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.delete(key),
          { maxRetries: 2 }
        ),
        { metadata: { key } }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Delete failed',
        'delete',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error), key }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Get public URL for a file
   */
  getUrl(key: string): string {
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key');
    }

    return this.provider.getUrl(key);
  }

  /**
   * Get presigned URL for private file access
   */
  async getPresignedUrl(key: string, expiresIn?: number): Promise<string> {
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key');
    }

    if (expiresIn !== undefined && (expiresIn < 1 || expiresIn > 604800)) {
      throw new Error('Expiration must be between 1 second and 7 days');
    }

    try {
      return await ServiceObservability.trackOperation(
        'getPresignedUrl',
        this.provider.constructor.name,
        () => this.provider.getPresignedUrl(key, expiresIn),
        { metadata: { key, expiresIn } }
      );
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Failed to generate presigned URL',
        'getPresignedUrl',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error), key }
      );

      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    if (!key || typeof key !== 'string') {
      return false;
    }

    try {
      return await ServiceObservability.trackOperation(
        'exists',
        this.provider.constructor.name,
        () => this.provider.exists(key),
        { metadata: { key } }
      );
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Failed to check file existence',
        'exists',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error), key }
      );

      return false;
    }
  }

  /**
   * List files with pagination
   */
  async list(
    prefix: string,
    maxKeys: number = 100
  ): Promise<{ success: boolean; files?: StorageObject[]; error?: string }> {
    if (!prefix || typeof prefix !== 'string') {
      return { success: false, error: 'Invalid prefix' };
    }

    if (maxKeys < 1 || maxKeys > 1000) {
      return { success: false, error: 'maxKeys must be between 1 and 1000' };
    }

    try {
      const files = await ServiceObservability.trackOperation(
        'list',
        this.provider.constructor.name,
        () => this.provider.list(prefix, maxKeys),
        { metadata: { prefix, maxKeys } }
      );

      return { success: true, files };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Failed to list files',
        'list',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error), prefix }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list files',
      };
    }
  }

  /**
   * Get the current provider name
   */
  getProviderName(): string {
    return this.provider.constructor.name;
  }
}
