/**
 * Visual Editor V2 - AI Page Generator (Client-Safe)
 * 
 * Client-side API client for AI page generation.
 * Actual AI processing happens server-side via API routes.
 */

import type { Page, PageType } from '../types/page';
import type { VisualElement } from '../types/element';
import type { DesignTokens } from '../types/tokens';
import type { ComponentDefinition } from '../types/component';

// ============================================================================
// TYPES
// ============================================================================

export interface StoreContext {
  name: string;
  industry: string;
  brandColors: string[];
  targetAudience: string;
  tone: 'professional' | 'casual' | 'luxury' | 'playful' | 'friendly';
  description?: string;
}

export interface ProductContext {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  features: string[];
  variants?: Array<{
    name: string;
    options: string[];
  }>;
  category?: string;
  tags?: string[];
}

export interface AIPageGenerationRequest {
  // User's natural language prompt
  prompt: string;
  
  // Page type hint
  pageType?: PageType;
  
  // Store context
  storeContext: StoreContext;
  
  // Design system context
  designTokens?: DesignTokens;
  
  // Available components
  availableComponents?: ComponentDefinition[];
  
  // Product data (if product page)
  productData?: ProductContext;
  
  // Reference pages for style consistency
  referencePages?: Page[];
  
  // Tenant ID
  tenantId: string;
}

export interface AIPageGenerationResponse {
  success: boolean;
  page?: Page;
  message?: string;
  suggestions?: string[];
  error?: string;
}

export interface AISectionGenerationRequest {
  prompt: string;
  sectionType?: string;
  storeContext: StoreContext;
  designTokens?: DesignTokens;
  availableComponents?: ComponentDefinition[];
  existingPage?: Page;
  tenantId: string;
}

export interface AISectionGenerationResponse {
  success: boolean;
  elements?: Record<string, VisualElement>;
  rootElementId?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// AI PAGE GENERATOR (Client-Safe API Client)
// ============================================================================

/**
 * Client-safe AI Page Generator
 * 
 * This class provides a client-side interface for AI page generation.
 * All actual AI processing happens server-side via API routes.
 */
export class AIPageGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/editor-v2/ai') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate a complete page from a natural language prompt
   */
  async generatePage(request: AIPageGenerationRequest): Promise<AIPageGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: data.success,
        page: data.page,
        message: data.message,
        suggestions: data.suggestions,
        error: data.error,
      };
    } catch (error) {
      console.error('AI page generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Generate a section to add to an existing page
   */
  async generateSection(request: AISectionGenerationRequest): Promise<AISectionGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: data.success,
        elements: data.elements,
        rootElementId: data.rootElementId,
        message: data.message,
        error: data.error,
      };
    } catch (error) {
      console.error('AI section generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

// Export singleton instance for client use
export const aiPageGenerator = new AIPageGenerator();
