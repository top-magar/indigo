/**
 * Search Service
 * 
 * Unified search interface with automatic provider selection,
 * error handling, retry logic, and observability
 */

import { ServiceFactory } from './factory';
import { ServiceErrorHandler } from './error-handler';
import { ServiceObservability } from './observability';
import { ServiceValidator } from './validation';
import type { SearchProvider, SearchDocument, SearchQuery, SearchResults } from './providers/types';

export class SearchService {
  private provider: SearchProvider;

  constructor() {
    this.provider = ServiceFactory.getSearchProvider();
  }

  /**
   * Index a single document with validation, retry, and observability
   */
  async index(document: SearchDocument): Promise<{ success: boolean; error?: string }> {
    // Validate document
    if (!document || typeof document !== 'object') {
      return { success: false, error: 'Document is required' };
    }

    if (!document.id || typeof document.id !== 'string') {
      return { success: false, error: 'Document ID is required' };
    }

    if (!document.tenantId || typeof document.tenantId !== 'string') {
      return { success: false, error: 'Tenant ID is required' };
    }

    const tenantValidation = ServiceValidator.validateTenantId(document.tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
    }

    // Track and execute with retry
    try {
      await ServiceObservability.trackOperation(
        'index',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.index(document),
          {
            maxRetries: 2,
            backoffMs: 300,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Document index retry attempt ${attempt}`,
                'index',
                this.provider.constructor.name,
                { error: error.message, documentId: document.id }
              );
            },
          }
        ),
        {
          metadata: {
            documentId: document.id,
            tenantId: document.tenantId,
          },
        }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Document index failed after retries',
        'index',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to index document',
      };
    }
  }

  /**
   * Bulk index documents with validation and retry
   */
  async bulkIndex(documents: SearchDocument[]): Promise<{ success: boolean; error?: string }> {
    if (!Array.isArray(documents) || documents.length === 0) {
      return { success: false, error: 'Documents array is empty' };
    }

    if (documents.length > 1000) {
      return { success: false, error: 'Bulk index size exceeds maximum of 1000 documents' };
    }

    // Validate all documents
    for (const doc of documents) {
      if (!doc.id || !doc.tenantId) {
        return { success: false, error: 'All documents must have id and tenantId' };
      }

      const tenantValidation = ServiceValidator.validateTenantId(doc.tenantId);
      if (!tenantValidation.valid) {
        return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
      }
    }

    // Track and execute with retry
    try {
      await ServiceObservability.trackOperation(
        'bulkIndex',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.bulkIndex(documents),
          {
            maxRetries: 2,
            backoffMs: 500,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Bulk index retry attempt ${attempt}`,
                'bulkIndex',
                this.provider.constructor.name,
                { error: error.message, documentCount: documents.length }
              );
            },
          }
        ),
        {
          metadata: {
            documentCount: documents.length,
          },
        }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Bulk index failed after retries',
        'bulkIndex',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk index documents',
      };
    }
  }

  /**
   * Delete a document with validation and retry
   */
  async delete(documentId: string, tenantId: string): Promise<{ success: boolean; error?: string }> {
    // Validate inputs
    if (!documentId || typeof documentId !== 'string') {
      return { success: false, error: 'Document ID is required' };
    }

    if (!tenantId || typeof tenantId !== 'string') {
      return { success: false, error: 'Tenant ID is required' };
    }

    const tenantValidation = ServiceValidator.validateTenantId(tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
    }

    // Track and execute with retry
    try {
      await ServiceObservability.trackOperation(
        'delete',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.delete(documentId, tenantId),
          {
            maxRetries: 2,
            backoffMs: 300,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Document delete retry attempt ${attempt}`,
                'delete',
                this.provider.constructor.name,
                { error: error.message, documentId }
              );
            },
          }
        ),
        {
          metadata: {
            documentId,
            tenantId,
          },
        }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Document delete failed after retries',
        'delete',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete document',
      };
    }
  }

  /**
   * Search documents with validation, retry, and observability
   */
  async search<T = SearchDocument>(query: SearchQuery): Promise<SearchResults<T>> {
    // Validate query
    if (!query || typeof query !== 'object') {
      return { success: false, error: 'Query is required' };
    }

    if (!query.query || typeof query.query !== 'string') {
      return { success: false, error: 'Query string is required' };
    }

    const queryValidation = ServiceValidator.validateTextLength(query.query, 1000, 2);
    if (!queryValidation.valid) {
      return { success: false, error: `Invalid query: ${queryValidation.error}` };
    }

    if (!query.tenantId || typeof query.tenantId !== 'string') {
      return { success: false, error: 'Tenant ID is required' };
    }

    const tenantValidation = ServiceValidator.validateTenantId(query.tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
    }

    // Validate pagination
    if (query.page !== undefined && (query.page < 1 || query.page > 1000)) {
      return { success: false, error: 'Page must be between 1 and 1000' };
    }

    if (query.pageSize !== undefined && (query.pageSize < 1 || query.pageSize > 100)) {
      return { success: false, error: 'Page size must be between 1 and 100' };
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'search',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.search<T>(query),
          {
            maxRetries: 3,
            backoffMs: 200,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Search retry attempt ${attempt}`,
                'search',
                this.provider.constructor.name,
                { error: error.message, query: query.query }
              );
            },
          }
        ),
        {
          metadata: {
            query: query.query,
            tenantId: query.tenantId,
            page: query.page,
            pageSize: query.pageSize,
            hasFilters: !!query.filters,
            hasFacets: !!query.facets,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Search failed after retries',
        'search',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  /**
   * Get autocomplete suggestions with validation and retry
   */
  async autocomplete(query: string, tenantId: string, limit: number = 10): Promise<{ success: boolean; suggestions?: string[]; error?: string }> {
    // Validate inputs
    if (!query || typeof query !== 'string') {
      return { success: false, error: 'Query is required' };
    }

    const queryValidation = ServiceValidator.validateTextLength(query, 100, 1);
    if (!queryValidation.valid) {
      return { success: false, error: `Invalid query: ${queryValidation.error}` };
    }

    if (!tenantId || typeof tenantId !== 'string') {
      return { success: false, error: 'Tenant ID is required' };
    }

    const tenantValidation = ServiceValidator.validateTenantId(tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
    }

    if (limit < 1 || limit > 50) {
      return { success: false, error: 'Limit must be between 1 and 50' };
    }

    // Track and execute with retry
    try {
      const suggestions = await ServiceObservability.trackOperation(
        'autocomplete',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.autocomplete(query, tenantId, limit),
          {
            maxRetries: 3,
            backoffMs: 200,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Autocomplete retry attempt ${attempt}`,
                'autocomplete',
                this.provider.constructor.name,
                { error: error.message, query }
              );
            },
          }
        ),
        {
          metadata: {
            query,
            tenantId,
            limit,
          },
        }
      );

      return { success: true, suggestions };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Autocomplete failed after retries',
        'autocomplete',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Autocomplete failed',
      };
    }
  }

  /**
   * Create index for a tenant with validation and retry
   */
  async createIndex(tenantId: string): Promise<{ success: boolean; error?: string }> {
    // Validate tenant ID
    if (!tenantId || typeof tenantId !== 'string') {
      return { success: false, error: 'Tenant ID is required' };
    }

    const tenantValidation = ServiceValidator.validateTenantId(tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
    }

    // Track and execute with retry
    try {
      await ServiceObservability.trackOperation(
        'createIndex',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.createIndex(tenantId),
          {
            maxRetries: 2,
            backoffMs: 500,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Create index retry attempt ${attempt}`,
                'createIndex',
                this.provider.constructor.name,
                { error: error.message, tenantId }
              );
            },
          }
        ),
        {
          metadata: {
            tenantId,
          },
        }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Create index failed after retries',
        'createIndex',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create index',
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
