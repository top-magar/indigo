/**
 * Local Search Provider
 * 
 * Mock search provider for local development and testing
 * Uses in-memory storage with simple string matching
 */

import type { SearchProvider, SearchDocument, SearchQuery, SearchResults, SearchHit } from './types';

export class LocalSearchProvider implements SearchProvider {
  private static documents: Map<string, Map<string, SearchDocument>> = new Map();

  /**
   * Index a single document (stores in memory)
   */
  async index(document: SearchDocument): Promise<void> {
    const tenantDocs = LocalSearchProvider.documents.get(document.tenantId) || new Map();
    tenantDocs.set(document.id, { ...document });
    LocalSearchProvider.documents.set(document.tenantId, tenantDocs);

    console.log(`[LocalSearchProvider] Indexed document: ${document.id} for tenant: ${document.tenantId}`);
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(documents: SearchDocument[]): Promise<void> {
    for (const doc of documents) {
      await this.index(doc);
    }

    console.log(`[LocalSearchProvider] Bulk indexed ${documents.length} documents`);
  }

  /**
   * Delete a document
   */
  async delete(documentId: string, tenantId: string): Promise<void> {
    const tenantDocs = LocalSearchProvider.documents.get(tenantId);
    if (tenantDocs) {
      tenantDocs.delete(documentId);
      console.log(`[LocalSearchProvider] Deleted document: ${documentId} for tenant: ${tenantId}`);
    }
  }

  /**
   * Search documents with simple string matching
   */
  async search<T = SearchDocument>(query: SearchQuery): Promise<SearchResults<T>> {
    const tenantDocs = LocalSearchProvider.documents.get(query.tenantId);
    
    if (!tenantDocs || tenantDocs.size === 0) {
      return {
        success: true,
        hits: [],
        total: 0,
      };
    }

    const queryLower = query.query.toLowerCase();
    const hits: SearchHit<T>[] = [];

    // Simple search: match query against searchable fields
    for (const doc of tenantDocs.values()) {
      let score = 0;
      const highlights: Record<string, string[]> = {};

      // Search in common fields
      const searchableFields = ['name', 'description', 'sku', 'vendor', 'productType'];
      
      for (const field of searchableFields) {
        const value = doc[field];
        if (typeof value === 'string') {
          const valueLower = value.toLowerCase();
          if (valueLower.includes(queryLower)) {
            score += field === 'name' ? 3 : 1; // Name matches are more important
            
            if (query.highlight) {
              // Simple highlight: show the matching portion
              const index = valueLower.indexOf(queryLower);
              const start = Math.max(0, index - 20);
              const end = Math.min(value.length, index + queryLower.length + 20);
              highlights[field] = [value.substring(start, end)];
            }
          }
        }
      }

      // Search in tags array
      if (Array.isArray(doc.tags)) {
        for (const tag of doc.tags) {
          if (typeof tag === 'string' && tag.toLowerCase().includes(queryLower)) {
            score += 1;
          }
        }
      }

      // Apply filters
      if (query.filters && score > 0) {
        let passesFilters = true;

        for (const [key, value] of Object.entries(query.filters)) {
          if (value !== undefined && doc[key] !== value) {
            passesFilters = false;
            break;
          }
        }

        if (!passesFilters) {
          score = 0;
        }
      }

      if (score > 0) {
        hits.push({
          document: doc as unknown as T,
          score,
          highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
        });
      }
    }

    // Sort by score (descending)
    hits.sort((a, b) => b.score - a.score);

    // Apply sorting if specified
    if (query.sort && hits.length > 0) {
      hits.sort((a, b) => {
        const aVal = (a.document as SearchDocument)[query.sort!.field];
        const bVal = (b.document as SearchDocument)[query.sort!.field];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return query.sort!.order === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return query.sort!.order === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        
        return 0;
      });
    }

    // Apply pagination
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedHits = hits.slice(start, end);

    // Calculate facets if requested
    let facets: Record<string, Array<{ value: string; count: number }>> | undefined;
    
    if (query.facets && query.facets.length > 0) {
      facets = {};
      
      for (const facetField of query.facets) {
        const facetCounts = new Map<string, number>();
        
        for (const hit of hits) {
          const doc = hit.document as SearchDocument;
          const value = doc[facetField];
          
          if (value !== undefined && value !== null) {
            const key = String(value);
            facetCounts.set(key, (facetCounts.get(key) || 0) + 1);
          }
        }
        
        facets[facetField] = Array.from(facetCounts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
      }
    }

    return {
      success: true,
      hits: paginatedHits,
      total: hits.length,
      facets,
    };
  }

  /**
   * Get autocomplete suggestions
   */
  async autocomplete(query: string, tenantId: string, limit: number = 10): Promise<string[]> {
    const tenantDocs = LocalSearchProvider.documents.get(tenantId);
    
    if (!tenantDocs || tenantDocs.size === 0) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    for (const doc of tenantDocs.values()) {
      // Check name field
      if (doc.name && typeof doc.name === 'string') {
        const name = doc.name as string;
        if (name.toLowerCase().startsWith(queryLower)) {
          suggestions.add(name);
        }
      }

      if (suggestions.size >= limit) {
        break;
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Create index (no-op for local provider)
   */
  async createIndex(tenantId: string): Promise<void> {
    if (!LocalSearchProvider.documents.has(tenantId)) {
      LocalSearchProvider.documents.set(tenantId, new Map());
    }
    console.log(`[LocalSearchProvider] Created index for tenant: ${tenantId}`);
  }

  /**
   * Delete index
   */
  async deleteIndex(tenantId: string): Promise<void> {
    LocalSearchProvider.documents.delete(tenantId);
    console.log(`[LocalSearchProvider] Deleted index for tenant: ${tenantId}`);
  }

  /**
   * Get all documents for a tenant (for testing)
   */
  static getDocuments(tenantId: string): SearchDocument[] {
    const tenantDocs = LocalSearchProvider.documents.get(tenantId);
    return tenantDocs ? Array.from(tenantDocs.values()) : [];
  }

  /**
   * Get document by ID (for testing)
   */
  static getDocument(tenantId: string, documentId: string): SearchDocument | undefined {
    const tenantDocs = LocalSearchProvider.documents.get(tenantId);
    return tenantDocs?.get(documentId);
  }

  /**
   * Clear all documents (for testing)
   */
  static clearAll(): void {
    LocalSearchProvider.documents.clear();
  }

  /**
   * Clear documents for a tenant (for testing)
   */
  static clearTenant(tenantId: string): void {
    LocalSearchProvider.documents.delete(tenantId);
  }
}
