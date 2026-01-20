/**
 * Visual Editor V2 - AI Page Generator (Server-Side)
 * 
 * Server-side AI page generation using AWS Bedrock.
 * This file should only be imported in API routes (server-side).
 */

import 'server-only';
import { AIService } from '@/infrastructure/services';
import type { Page, PageType } from '../types/page';
import type { VisualElement } from '../types/element';
import { createPage } from '../types/page';
import type {
  StoreContext,
  ProductContext,
  AIPageGenerationRequest,
  AIPageGenerationResponse,
  AISectionGenerationRequest,
  AISectionGenerationResponse,
} from './page-generator';

// Re-export types for convenience
export type {
  StoreContext,
  ProductContext,
  AIPageGenerationRequest,
  AIPageGenerationResponse,
  AISectionGenerationRequest,
  AISectionGenerationResponse,
};

// ============================================================================
// SERVER-SIDE AI PAGE GENERATOR
// ============================================================================

export class AIPageGeneratorServer {
  private ai: AIService;

  constructor() {
    this.ai = new AIService();
  }

  /**
   * Generate a complete page from a natural language prompt
   */
  async generatePage(request: AIPageGenerationRequest): Promise<AIPageGenerationResponse> {
    try {
      // Build the user prompt
      const userPrompt = this.buildPageUserPrompt(request);

      // Call AI service with higher token limit for complete JSON
      const result = await this.ai.generateText(userPrompt, {
        tone: 'professional',
        maxTokens: 3000,
        temperature: 0.5, // Lower temperature for more consistent JSON output
      });

      if (!result.success || !result.content) {
        return {
          success: false,
          error: result.error || 'Failed to generate page',
        };
      }

      // Parse the AI response
      const parsed = this.parsePageResponse(result.content, request.tenantId);
      
      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error,
        };
      }

      // Validate and fix the generated page
      const validated = this.validateAndFixPage(parsed.page!, request);

      return {
        success: true,
        page: validated.page,
        message: 'Page generated successfully',
        suggestions: validated.suggestions,
      };
    } catch (error) {
      console.error('AI page generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate a section to add to an existing page
   */
  async generateSection(request: AISectionGenerationRequest): Promise<AISectionGenerationResponse> {
    try {
      const userPrompt = `Generate a ${request.sectionType || 'section'} based on: ${request.prompt}

Store Context:
${JSON.stringify(request.storeContext, null, 2)}

Return a JSON object with:
- elements: Record<string, VisualElement> - the generated elements
- rootElementId: string - the ID of the root element of this section`;

      const result = await this.ai.generateText(userPrompt, {
        tone: 'professional',
        maxTokens: 2000,
        temperature: 0.7,
      });

      if (!result.success || !result.content) {
        return {
          success: false,
          error: result.error || 'Failed to generate section',
        };
      }

      const parsed = this.parseSectionResponse(result.content);
      
      return {
        success: parsed.success,
        elements: parsed.elements,
        rootElementId: parsed.rootElementId,
        message: parsed.success ? 'Section generated successfully' : undefined,
        error: parsed.error,
      };
    } catch (error) {
      console.error('AI section generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build the user prompt for page generation
   */
  private buildPageUserPrompt(request: AIPageGenerationRequest): string {
    // Keep prompt very concise to maximize response space
    return `Create a simple e-commerce page as JSON for: ${request.prompt}

Store: ${request.storeContext.name}

IMPORTANT: Use visible backgrounds for sections. Example backgrounds:
- Hero: "var(--ds-gray-100)" or "#f5f5f5"
- Features: "white" or "#ffffff"  
- Products: "var(--ds-gray-50)" or "#fafafa"
- CTA: "var(--ds-gray-900)" with white text

Return ONLY this JSON structure (no markdown, no explanation):
{"name":"Page","type":"home","rootElementId":"root","elements":{"root":{"id":"root","type":"frame","name":"Page","layout":{"display":"flex","flexDirection":"column"},"position":{"type":"relative","constraints":{"horizontal":"left","vertical":"top"}},"size":{"width":"fill","height":"auto"},"styles":{},"parentId":null,"children":["hero"],"breakpointOverrides":{},"interactions":[],"locked":false,"hidden":false,"collapsed":false},"hero":{"id":"hero","type":"frame","name":"Hero","layout":{"display":"flex","flexDirection":"column","alignItems":"center","gap":16},"position":{"type":"relative","constraints":{"horizontal":"left","vertical":"top"}},"size":{"width":"fill","height":400},"styles":{"padding":[64,24,64,24],"background":{"type":"solid","color":"#f5f5f5"}},"parentId":"root","children":["title","btn"],"breakpointOverrides":{},"interactions":[],"locked":false,"hidden":false,"collapsed":false},"title":{"id":"title","type":"text","name":"Title","layout":{"display":"block"},"position":{"type":"relative","constraints":{"horizontal":"left","vertical":"top"}},"size":{"width":"auto","height":"auto"},"styles":{"typography":{"fontSize":48,"fontWeight":700,"textAlign":"center","color":"#111"}},"content":{"type":"text","text":"Welcome to Our Store"},"parentId":"hero","children":[],"breakpointOverrides":{},"interactions":[],"locked":false,"hidden":false,"collapsed":false},"btn":{"id":"btn","type":"button","name":"Shop Now","layout":{"display":"block"},"position":{"type":"relative","constraints":{"horizontal":"left","vertical":"top"}},"size":{"width":"auto","height":"auto"},"styles":{"padding":[12,24,12,24],"background":{"type":"solid","color":"#111"},"borderRadius":6,"typography":{"fontSize":16,"fontWeight":500,"color":"#fff"}},"content":{"type":"text","text":"Shop Now"},"parentId":"hero","children":[],"breakpointOverrides":{},"interactions":[],"locked":false,"hidden":false,"collapsed":false}},"settings":{"width":1440},"seo":{"title":"Page","description":"Description"}}

Create 2-3 sections with visible backgrounds and relevant content. Use short IDs. Output ONLY valid JSON.`;
  }

  /**
   * Parse the AI response into a Page object
   */
  private parsePageResponse(
    content: string, 
    tenantId: string
  ): { success: boolean; page?: Page; error?: string } {
    try {
      // Log the raw content for debugging
      console.log('[AI Page Generator] Raw AI response length:', content.length);
      
      // Try multiple patterns to extract JSON
      let jsonStr: string | null = null;
      
      // Pattern 1: JSON in code block
      const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      
      // Pattern 2: Raw JSON object (find the outermost braces)
      if (!jsonStr) {
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = content.substring(firstBrace, lastBrace + 1);
        }
      }
      
      if (!jsonStr) {
        console.log('[AI Page Generator] No JSON found, creating page from text');
        return this.createPageFromText(content, tenantId);
      }

      // Try to parse the JSON
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (parseError) {
        console.log('[AI Page Generator] JSON parse failed, trying to fix common issues');
        // Try to fix common JSON issues (trailing commas, etc.)
        const fixedJson = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/'/g, '"');
        try {
          parsed = JSON.parse(fixedJson);
        } catch {
          console.log('[AI Page Generator] JSON still invalid, creating page from text');
          return this.createPageFromText(content, tenantId);
        }
      }

      // Convert parsed JSON to Page structure
      const page = this.convertToPage(parsed, tenantId);
      console.log('[AI Page Generator] Successfully parsed page with', Object.keys(page.elements).length, 'elements');

      return { success: true, page };
    } catch (error) {
      console.error('[AI Page Generator] Failed to parse AI response:', error);
      // Always fall back to creating a page from text instead of failing
      return this.createPageFromText(content, tenantId);
    }
  }

  /**
   * Parse section response
   */
  private parseSectionResponse(content: string): {
    success: boolean;
    elements?: Record<string, VisualElement>;
    rootElementId?: string;
    error?: string;
  } {
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        return { success: false, error: 'No valid JSON in response' };
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        success: true,
        elements: parsed.elements,
        rootElementId: parsed.rootElementId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse section response',
      };
    }
  }

  /**
   * Create a basic page from text content (fallback)
   */
  private createPageFromText(
    content: string, 
    tenantId: string
  ): { success: boolean; page?: Page; error?: string } {
    // Create a simple page with the content as text
    const page = createPage(tenantId, 'AI Generated Page', 'custom');
    
    // Add a text element with the content
    const textElement: VisualElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: 'Content',
      layout: { display: 'block' },
      position: { type: 'relative', constraints: { horizontal: 'left', vertical: 'top' } },
      size: { width: 'fill', height: 'auto' },
      styles: {
        padding: 24,
        typography: { fontSize: 16, lineHeight: 1.6 },
      },
      content: { type: 'text', text: content },
      parentId: page.rootElementId,
      children: [],
      breakpointOverrides: {},
      interactions: [],
      locked: false,
      hidden: false,
      collapsed: false,
    };

    page.elements[textElement.id] = textElement;
    page.elements[page.rootElementId].children.push(textElement.id);

    return { success: true, page };
  }

  /**
   * Convert parsed JSON to Page structure
   */
  private convertToPage(parsed: Record<string, unknown>, tenantId: string): Page {
    const page = createPage(
      tenantId,
      (parsed.name as string) || 'AI Generated Page',
      (parsed.type as PageType) || 'custom'
    );

    // If parsed has elements, use them
    if (parsed.elements && typeof parsed.elements === 'object') {
      page.elements = parsed.elements as Record<string, VisualElement>;
    }

    if (parsed.rootElementId) {
      page.rootElementId = parsed.rootElementId as string;
    }

    if (parsed.settings) {
      page.settings = { ...page.settings, ...(parsed.settings as object) };
    }

    if (parsed.seo) {
      page.seo = { ...page.seo, ...(parsed.seo as object) };
    }

    return page;
  }

  /**
   * Validate and fix the generated page
   */
  private validateAndFixPage(
    page: Page, 
    _request: AIPageGenerationRequest
  ): { page: Page; suggestions: string[] } {
    const suggestions: string[] = [];

    // Ensure root element exists
    if (!page.elements[page.rootElementId]) {
      suggestions.push('Root element was missing, created default');
      // Create default root
      page.elements[page.rootElementId] = {
        id: page.rootElementId,
        type: 'frame',
        name: 'Page',
        layout: { display: 'flex', flexDirection: 'column' },
        position: { type: 'relative', constraints: { horizontal: 'left', vertical: 'top' } },
        size: { width: 'fill', height: 'auto' },
        styles: {},
        parentId: null,
        children: [],
        breakpointOverrides: {},
        interactions: [],
        locked: false,
        hidden: false,
        collapsed: false,
      };
    }

    // Validate all elements have required fields and normalize styles
    for (const [id, element] of Object.entries(page.elements)) {
      if (!element.id) element.id = id;
      if (!element.type) element.type = 'frame';
      if (!element.name) element.name = element.type;
      if (!element.layout) element.layout = { display: 'block' };
      if (!element.position) element.position = { type: 'relative', constraints: { horizontal: 'left', vertical: 'top' } };
      if (!element.size) element.size = { width: 'auto', height: 'auto' };
      if (!element.styles) element.styles = {};
      if (!element.children) element.children = [];
      if (!element.breakpointOverrides) element.breakpointOverrides = {};
      if (!element.interactions) element.interactions = [];

      // Normalize styles for visibility
      this.normalizeElementStyles(element);
    }

    // Validate parent-child relationships
    for (const element of Object.values(page.elements)) {
      if (element.parentId && !page.elements[element.parentId]) {
        element.parentId = page.rootElementId;
        suggestions.push(`Fixed orphaned element: ${element.name}`);
      }
    }

    // Add SEO suggestions
    if (!page.seo.title) {
      page.seo.title = page.name;
      suggestions.push('Added page title for SEO');
    }

    if (!page.seo.description) {
      suggestions.push('Consider adding a meta description for better SEO');
    }

    return { page, suggestions };
  }

  /**
   * Normalize element styles to ensure visibility
   */
  private normalizeElementStyles(element: VisualElement): void {
    const styles = element.styles as Record<string, unknown>;
    
    // Handle direct backgroundColor property (some AI responses use this)
    if (styles.backgroundColor && !element.styles.background) {
      element.styles.background = { 
        type: 'solid', 
        color: styles.backgroundColor as string 
      };
    }

    // Handle direct color property for text
    if (styles.color && !element.styles.typography?.color) {
      if (!element.styles.typography) {
        element.styles.typography = {};
      }
      element.styles.typography.color = styles.color as string;
    }

    // Ensure frames have visible backgrounds (except root)
    if (element.type === 'frame' && element.parentId !== null) {
      if (!element.styles.background) {
        // Add subtle background for non-root frames
        element.styles.background = { type: 'solid', color: '#ffffff' };
      }
    }

    // Ensure text elements have color
    if (element.type === 'text') {
      if (!element.styles.typography) {
        element.styles.typography = {};
      }
      if (!element.styles.typography.color) {
        element.styles.typography.color = '#111111';
      }
      if (!element.styles.typography.fontSize) {
        element.styles.typography.fontSize = 16;
      }
    }

    // Ensure buttons have proper styling
    if (element.type === 'button') {
      if (!element.styles.background) {
        element.styles.background = { type: 'solid', color: '#111111' };
      }
      if (!element.styles.typography) {
        element.styles.typography = {};
      }
      if (!element.styles.typography.color) {
        element.styles.typography.color = '#ffffff';
      }
      if (!element.styles.typography.fontSize) {
        element.styles.typography.fontSize = 16;
      }
      if (!element.styles.typography.fontWeight) {
        element.styles.typography.fontWeight = 500;
      }
      if (!element.styles.padding) {
        element.styles.padding = [12, 24, 12, 24];
      }
      if (!element.styles.borderRadius) {
        element.styles.borderRadius = 6;
      }
    }

    // Ensure images have placeholder if no src
    if (element.type === 'image' && element.content?.type === 'image') {
      if (!element.content.src) {
        element.content.src = 'https://placehold.co/400x300/f5f5f5/666666?text=Image';
        element.content.alt = element.content.alt || 'Placeholder image';
      }
    }
  }
}

// Lazy singleton instance for server use
let _aiPageGeneratorServer: AIPageGeneratorServer | null = null;

export function getAIPageGeneratorServer(): AIPageGeneratorServer {
  if (!_aiPageGeneratorServer) {
    _aiPageGeneratorServer = new AIPageGeneratorServer();
  }
  return _aiPageGeneratorServer;
}

// For backwards compatibility - but prefer using getAIPageGeneratorServer()
export const aiPageGeneratorServer = {
  generatePage: async (request: AIPageGenerationRequest) => getAIPageGeneratorServer().generatePage(request),
  generateSection: async (request: AISectionGenerationRequest) => getAIPageGeneratorServer().generateSection(request),
};
