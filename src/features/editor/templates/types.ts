/**
 * Template Library Type Definitions
 * Save and reuse custom block configurations
 */

import type { BlockType } from "@/types/blocks";

// Template category
export type TemplateCategory =
  | "hero"
  | "product"
  | "testimonial"
  | "cta"
  | "feature"
  | "pricing"
  | "faq"
  | "contact"
  | "footer"
  | "custom";

// Template visibility
export type TemplateVisibility = "private" | "team" | "public";

// Block template definition
export interface BlockTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category: TemplateCategory;
  blockType: BlockType;
  variant: string;
  settings: Record<string, unknown>;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  // Visibility
  visibility: TemplateVisibility;
  tenantId?: string;
  // Usage tracking
  usageCount: number;
  // Tags for search
  tags: string[];
}

// Section template (multiple blocks)
export interface SectionTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category: TemplateCategory;
  blocks: Array<{
    type: BlockType;
    variant: string;
    settings: Record<string, unknown>;
    order: number;
  }>;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  visibility: TemplateVisibility;
  tenantId?: string;
  usageCount: number;
  tags: string[];
}
