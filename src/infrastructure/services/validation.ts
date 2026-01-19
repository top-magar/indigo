/**
 * Request Validation Layer
 * 
 * Validates inputs before service operations to prevent errors and improve security
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class ServiceValidator {
  /**
   * Validate file upload
   */
  static validateUploadFile(
    file: Buffer | Uint8Array,
    options?: {
      maxSizeBytes?: number;
      minSizeBytes?: number;
      allowedMimeTypes?: string[];
    }
  ): ValidationResult {
    const {
      maxSizeBytes = 50 * 1024 * 1024, // 50MB default
      minSizeBytes = 1, // 1 byte minimum
      allowedMimeTypes,
    } = options || {};

    // Check size
    if (file.byteLength > maxSizeBytes) {
      return {
        valid: false,
        error: `File size ${this.formatBytes(file.byteLength)} exceeds maximum of ${this.formatBytes(maxSizeBytes)}`,
      };
    }

    if (file.byteLength < minSizeBytes) {
      return {
        valid: false,
        error: `File size ${this.formatBytes(file.byteLength)} is below minimum of ${this.formatBytes(minSizeBytes)}`,
      };
    }

    // Check MIME type (if provided)
    if (allowedMimeTypes && allowedMimeTypes.length > 0) {
      // Note: MIME type checking from buffer requires additional logic
      // This is a placeholder - implement with file-type library if needed
      // For now, we'll skip MIME validation
    }

    return { valid: true };
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    // Check length
    if (email.length > 254) {
      return { valid: false, error: 'Email exceeds maximum length of 254 characters' };
    }

    return { valid: true };
  }

  /**
   * Validate search query
   */
  static validateSearchQuery(query: string): ValidationResult {
    if (!query || typeof query !== 'string') {
      return { valid: false, error: 'Search query is required' };
    }

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return { valid: false, error: 'Search query must be at least 2 characters' };
    }

    if (trimmed.length > 1000) {
      return { valid: false, error: 'Search query exceeds maximum length of 1000 characters' };
    }

    return { valid: true };
  }

  /**
   * Validate text length
   */
  static validateTextLength(
    text: string,
    maxLength: number,
    minLength: number = 0
  ): ValidationResult {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Text is required' };
    }

    if (text.length < minLength) {
      return { valid: false, error: `Text must be at least ${minLength} characters` };
    }

    if (text.length > maxLength) {
      return { valid: false, error: `Text exceeds maximum length of ${maxLength} characters` };
    }

    return { valid: true };
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string): ValidationResult {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL is required' };
    }

    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Validate tenant ID
   */
  static validateTenantId(tenantId: string): ValidationResult {
    if (!tenantId || typeof tenantId !== 'string') {
      return { valid: false, error: 'Tenant ID is required' };
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return { valid: false, error: 'Invalid tenant ID format (must be UUID)' };
    }

    return { valid: true };
  }

  /**
   * Validate UUID (v4 format)
   */
  static validateUUID(uuid: string): ValidationResult {
    if (!uuid || typeof uuid !== 'string') {
      return { valid: false, error: 'UUID is required' };
    }

    // UUID v4 format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return { valid: false, error: 'Invalid UUID format (expected v4)' };
    }

    return { valid: true };
  }

  /**
   * Validate product ID
   */
  static validateProductId(productId: string): ValidationResult {
    if (!productId || typeof productId !== 'string') {
      return { valid: false, error: 'Product ID is required' };
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      return { valid: false, error: 'Invalid product ID format (must be UUID)' };
    }

    return { valid: true };
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(
    page: number,
    pageSize: number,
    maxPageSize: number = 100
  ): ValidationResult {
    if (!Number.isInteger(page) || page < 1) {
      return { valid: false, error: 'Page must be a positive integer' };
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      return { valid: false, error: 'Page size must be a positive integer' };
    }

    if (pageSize > maxPageSize) {
      return { valid: false, error: `Page size exceeds maximum of ${maxPageSize}` };
    }

    return { valid: true };
  }

  /**
   * Validate price range
   */
  static validatePriceRange(minPrice?: number, maxPrice?: number): ValidationResult {
    if (minPrice !== undefined && (typeof minPrice !== 'number' || minPrice < 0)) {
      return { valid: false, error: 'Minimum price must be a non-negative number' };
    }

    if (maxPrice !== undefined && (typeof maxPrice !== 'number' || maxPrice < 0)) {
      return { valid: false, error: 'Maximum price must be a non-negative number' };
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return { valid: false, error: 'Minimum price cannot exceed maximum price' };
    }

    return { valid: true };
  }

  /**
   * Validate language code
   */
  static validateLanguageCode(languageCode: string): ValidationResult {
    if (!languageCode || typeof languageCode !== 'string') {
      return { valid: false, error: 'Language code is required' };
    }

    // ISO 639-1 (2-letter) or ISO 639-3 (3-letter) codes
    const languageRegex = /^[a-z]{2,3}(-[A-Z]{2})?$/;
    if (!languageRegex.test(languageCode)) {
      return { valid: false, error: 'Invalid language code format (e.g., en, en-US, es, fr)' };
    }

    return { valid: true };
  }

  /**
   * Validate content type
   */
  static validateContentType(contentType: string, allowedTypes?: string[]): ValidationResult {
    if (!contentType || typeof contentType !== 'string') {
      return { valid: false, error: 'Content type is required' };
    }

    // Basic MIME type format
    const mimeRegex = /^[a-z]+\/[a-z0-9\-\+\.]+$/i;
    if (!mimeRegex.test(contentType)) {
      return { valid: false, error: 'Invalid content type format' };
    }

    if (allowedTypes && !allowedTypes.includes(contentType)) {
      return {
        valid: false,
        error: `Content type ${contentType} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Format bytes for human-readable display
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
