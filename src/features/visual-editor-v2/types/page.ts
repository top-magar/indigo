/**
 * Visual Editor V2 - Page Types
 * 
 * Page structure and configuration for the visual editor.
 */

import type { VisualElement, Breakpoint } from './element';

// ============================================================================
// PAGE TYPES
// ============================================================================

export type PageType = 
  | 'home'
  | 'product'
  | 'collection'
  | 'about'
  | 'contact'
  | 'blog'
  | 'blog-post'
  | 'cart'
  | 'checkout'
  | 'account'
  | 'custom';

// ============================================================================
// SEO CONFIGURATION
// ============================================================================

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: Record<string, unknown>;
}

export const DEFAULT_SEO: SEOConfig = {
  title: '',
  description: '',
};

// ============================================================================
// PAGE SETTINGS
// ============================================================================

export interface PageSettings {
  // Canvas settings
  width: number;           // Default page width (e.g., 1440)
  backgroundColor: string;
  
  // Favicon
  favicon?: string;
  
  // Custom code injection
  customCode?: {
    head?: string;         // Injected in <head>
    bodyStart?: string;    // Injected at start of <body>
    bodyEnd?: string;      // Injected at end of <body>
  };
  
  // Page behavior
  scrollBehavior?: 'auto' | 'smooth';
  
  // Password protection
  passwordProtected?: boolean;
  password?: string;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  width: 1440,
  backgroundColor: 'var(--ds-background)',
};

// ============================================================================
// PAGE
// ============================================================================

export interface Page {
  id: string;
  tenantId: string;
  
  // Basic info
  name: string;
  slug: string;
  type: PageType;
  
  // Element tree
  rootElementId: string;
  elements: Record<string, VisualElement>;
  
  // Settings
  settings: PageSettings;
  
  // SEO
  seo: SEOConfig;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Versioning
  version: number;
  
  // Template info (if created from template)
  templateId?: string;
  
  // Thumbnail for page list
  thumbnail?: string;
}

// ============================================================================
// PAGE TEMPLATE
// ============================================================================

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  type: PageType;
  category: 'starter' | 'ecommerce' | 'marketing' | 'content' | 'custom';
  
  // Template content
  rootElementId: string;
  elements: Record<string, VisualElement>;
  settings: PageSettings;
  
  // Preview
  thumbnail: string;
  previewUrl?: string;
  
  // Metadata
  tags: string[];
  industry?: string;
  
  // Usage stats
  usageCount: number;
  
  // Source
  source: 'system' | 'ai-generated' | 'user-created';
  createdAt: Date;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

import { createFrameElement, generateElementId } from './element';

export function createPage(
  tenantId: string,
  name: string,
  type: PageType = 'custom',
  overrides: Partial<Page> = {}
): Page {
  const rootElement = createFrameElement({
    name: 'Page',
    layout: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    size: {
      width: 'fill',
      height: 'auto',
      minHeight: 100,
    },
    styles: {
      background: {
        type: 'solid',
        color: 'var(--ds-background)',
      },
    },
  });

  return {
    id: `page-${Date.now()}`,
    tenantId,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    type,
    rootElementId: rootElement.id,
    elements: {
      [rootElement.id]: rootElement,
    },
    settings: { ...DEFAULT_PAGE_SETTINGS },
    seo: { ...DEFAULT_SEO, title: name },
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    ...overrides,
  };
}

export function createPageFromTemplate(
  tenantId: string,
  template: PageTemplate,
  name: string,
  slug: string
): Page {
  // Deep clone elements with new IDs
  const idMap = new Map<string, string>();
  const newElements: Record<string, VisualElement> = {};
  
  // First pass: create new IDs
  for (const [oldId, element] of Object.entries(template.elements)) {
    const newId = generateElementId(element.type);
    idMap.set(oldId, newId);
  }
  
  // Second pass: clone elements with updated references
  for (const [oldId, element] of Object.entries(template.elements)) {
    const newId = idMap.get(oldId)!;
    newElements[newId] = {
      ...element,
      id: newId,
      parentId: element.parentId ? idMap.get(element.parentId) || null : null,
      children: element.children.map(childId => idMap.get(childId) || childId),
    };
  }
  
  const newRootId = idMap.get(template.rootElementId)!;
  
  return {
    id: `page-${Date.now()}`,
    tenantId,
    name,
    slug,
    type: template.type,
    rootElementId: newRootId,
    elements: newElements,
    settings: { ...template.settings },
    seo: { ...DEFAULT_SEO, title: name },
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    templateId: template.id,
  };
}
