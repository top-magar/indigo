/**
 * Visual Editor V2 - AI Page Generator
 * 
 * Generates complete e-commerce pages from natural language prompts
 * using AWS Bedrock (Claude).
 */

import { AIService } from '@/infrastructure/services';
import type { Page, PageType } from '../types/page';
import type { VisualElement } from '../types/element';
import type { DesignTokens } from '../types/tokens';
import type { ComponentDefinition } from '../types/component';
import { createPage } from '../types/page';
import { PAGE_GENERATION_PROMPT, SECTION_GENERATION_PROMPT } from './prompts/page-generation';

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
  designTokens: DesignTokens;
  
  // Available components
  availableComponents: ComponentDefinition[];
  
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
  designTokens: DesignTokens;
  availableComponents: ComponentDefinition[];
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
// AI PAGE GENERATOR
// ============================================================================

export class AIPageGenerator {
  private ai: AIService;

  constructor() {
    this.ai = new AIService();
  }

  /**
   * Generate a complete page from a natural language prompt
   */
  async generatePage(request: AIPageGenerationRequest): Promise<AIPageGenerationResponse> {
    try {
      // Build the system prompt with context
      const systemPrompt = this.buildPageSystemPrompt(request);
      
      // Build the user prompt
      const userPrompt = this.buildPageUserPrompt(request);

      // Call AI service
      const result = await this.ai.generateText(userPrompt, {
        tone: 'professional',
        maxTokens: 4000,
        temperature: 0.7,
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
      const systemPrompt = this.buildSectionSystemPrompt(request);
      const userPrompt = `Generate a ${request.sectionType || 'section'} based on: ${request.prompt}`;

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
   * Build the system prompt for page generation
   */
  private buildPageSystemPrompt(request: AIPageGenerationRequest): string {
    const componentList = request.availableComponents
      .map(c => `- ${c.name} (${c.category}): ${c.description}`)
      .join('\n');

    const tokensSummary = this.summarizeDesignTokens(request.designTokens);

    return PAGE_GENERATION_PROMPT
      .replace('{componentList}', componentList || 'No pre-built components available')
      .replace('{designTokens}', tokensSummary)
      .replace('{storeContext}', JSON.stringify(request.storeContext, null, 2));
  }

  /**
   * Build the user prompt for page generation
   */
  private buildPageUserPrompt(request: AIPageGenerationRequest): string {
    let prompt = request.prompt;

    if (request.pageType) {
      prompt = `Create a ${request.pageType} page: ${prompt}`;
    }

    if (request.productData) {
      prompt += `\n\nProduct Information:\n${JSON.stringify(request.productData, null, 2)}`;
    }

    prompt += `\n\nStore: ${request.storeContext.name} (${request.storeContext.industry})`;
    prompt += `\nTone: ${request.storeContext.tone}`;
    prompt += `\nTarget Audience: ${request.storeContext.targetAudience}`;

    return prompt;
  }

  /**
   * Build the system prompt for section generation
   */
  private buildSectionSystemPrompt(request: AISectionGenerationRequest): string {
    return SECTION_GENERATION_PROMPT
      .replace('{storeContext}', JSON.stringify(request.storeContext, null, 2));
  }

  /**
   * Summarize design tokens for the prompt
   */
  private summarizeDesignTokens(tokens: DesignTokens): string {
    return `
Colors:
- Brand Primary: ${tokens.colors.brand.primary}
- Brand Secondary: ${tokens.colors.brand.secondary}
- Background: ${tokens.colors.background.primary}
- Text Primary: ${tokens.colors.text.primary}
- Text Secondary: ${tokens.colors.text.secondary}

Typography:
- Heading Font: ${tokens.typography.fontFamilies.heading}
- Body Font: ${tokens.typography.fontFamilies.body}
- Base Size: ${tokens.typography.fontSizes.base}

Spacing: 4px base unit (use multiples: 4, 8, 12, 16, 24, 32, 48, 64)

Border Radius:
- Small: ${tokens.borderRadius.sm}
- Medium: ${tokens.borderRadius.md}
- Large: ${tokens.borderRadius.lg}
`;
  }

  /**
   * Parse the AI response into a Page object
   */
  private parsePageResponse(
    content: string, 
    tenantId: string
  ): { success: boolean; page?: Page; error?: string } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        // If no JSON, create a basic page structure from the text
        return this.createPageFromText(content, tenantId);
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Convert parsed JSON to Page structure
      const page = this.convertToPage(parsed, tenantId);

      return { success: true, page };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        success: false,
        error: 'Failed to parse AI response. Please try again.',
      };
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
    request: AIPageGenerationRequest
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

    // Validate all elements have required fields
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
}

// Export singleton instance
export const aiPageGenerator = new AIPageGenerator();
