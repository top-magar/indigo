/**
 * Template Service
 * CRUD operations for block and section templates
 * Uses localStorage for storage (can be migrated to database later)
 */

import type { BlockType } from "@/types/blocks";
import type {
  BlockTemplate,
  SectionTemplate,
  TemplateCategory,
  TemplateVisibility,
} from "./types";

// Storage keys
const BLOCK_TEMPLATES_KEY = "editor_block_templates";
const SECTION_TEMPLATES_KEY = "editor_section_templates";

// Filter options for querying templates
export interface TemplateFilters {
  category?: TemplateCategory;
  visibility?: TemplateVisibility;
  tags?: string[];
  createdBy?: string;
  tenantId?: string;
  blockType?: BlockType;
}

// Metadata for saving templates
export interface BlockTemplateMetadata {
  name: string;
  description?: string;
  thumbnail?: string;
  category: TemplateCategory;
  visibility: TemplateVisibility;
  tags?: string[];
  tenantId?: string;
}

// Block configuration for saving
export interface BlockConfig {
  type: BlockType;
  variant: string;
  settings: Record<string, unknown>;
}

/**
 * Generate a unique ID for templates
 */
function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get all block templates from storage
 */
export function getBlockTemplates(): BlockTemplate[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(BLOCK_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get all section templates from storage
 */
export function getSectionTemplates(): SectionTemplate[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(SECTION_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a block as a template
 */
export function saveBlockTemplate(
  block: BlockConfig,
  metadata: BlockTemplateMetadata,
  userId: string
): BlockTemplate {
  const template: BlockTemplate = {
    id: generateId(),
    name: metadata.name,
    description: metadata.description,
    thumbnail: metadata.thumbnail,
    category: metadata.category,
    blockType: block.type,
    variant: block.variant,
    settings: block.settings,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId,
    visibility: metadata.visibility,
    tenantId: metadata.tenantId,
    usageCount: 0,
    tags: metadata.tags || [],
  };

  const templates = getBlockTemplates();
  templates.push(template);
  localStorage.setItem(BLOCK_TEMPLATES_KEY, JSON.stringify(templates));

  return template;
}

/**
 * Delete a block template
 */
export function deleteBlockTemplate(templateId: string): boolean {
  const templates = getBlockTemplates();
  const filtered = templates.filter((t) => t.id !== templateId);
  
  if (filtered.length === templates.length) {
    return false;
  }

  localStorage.setItem(BLOCK_TEMPLATES_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Filter templates by criteria
 */
export function filterTemplates<T extends BlockTemplate | SectionTemplate>(
  templates: T[],
  filters: TemplateFilters
): T[] {
  return templates.filter((template) => {
    if (filters.category && template.category !== filters.category) {
      return false;
    }

    if (filters.visibility && template.visibility !== filters.visibility) {
      return false;
    }

    if (filters.tenantId && template.tenantId !== filters.tenantId) {
      return false;
    }

    if (filters.createdBy && template.createdBy !== filters.createdBy) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) =>
        template.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    if (
      filters.blockType &&
      "blockType" in template &&
      template.blockType !== filters.blockType
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Increment usage count for a template
 */
export function incrementUsageCount(templateId: string): void {
  const templates = getBlockTemplates();
  const template = templates.find((t) => t.id === templateId);
  
  if (template) {
    template.usageCount += 1;
    template.updatedAt = new Date();
    localStorage.setItem(BLOCK_TEMPLATES_KEY, JSON.stringify(templates));
  }
}

/**
 * Search templates by name or description
 */
export function searchTemplates<T extends BlockTemplate | SectionTemplate>(
  templates: T[],
  query: string
): T[] {
  const lowerQuery = query.toLowerCase();
  
  return templates.filter((template) => {
    const nameMatch = template.name.toLowerCase().includes(lowerQuery);
    const descMatch = template.description?.toLowerCase().includes(lowerQuery);
    const tagMatch = template.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );
    
    return nameMatch || descMatch || tagMatch;
  });
}
