import { pgTable, uuid, text, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

/**
 * Store layout section structure for visual editor
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F004)
 * @see IMPLEMENTATION-PLAN.md Section 2.1.2
 */
export interface StoreLayoutSection {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: string[];
  order?: number;
  visible?: boolean;
}

/**
 * Global styles for store theming
 * 
 * @see DESIGN-SYSTEM.md Section 4.2 (TenantTheme)
 */
export interface StoreGlobalStyles {
  colors?: {
    primary?: string;
    primaryForeground?: string;
    secondary?: string;
    secondaryForeground?: string;
    accent?: string;
    accentForeground?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    mutedForeground?: string;
    border?: string;
    ring?: string;
  };
  typography?: {
    fontFamily?: string;
    headingFontFamily?: string;
    baseFontSize?: string;
  };
  borderRadius?: "none" | "sm" | "md" | "lg" | "full";
}

/**
 * Complete store layout structure
 */
export interface StoreLayout {
  sections: StoreLayoutSection[];
  globalStyles?: StoreGlobalStyles;
  version?: number;
}

/**
 * Store page types
 */
export type StorePageType = 
  | "home" 
  | "product" 
  | "category" 
  | "checkout" 
  | "cart"
  | "about"
  | "contact"
  | "faq"
  | "global_styles";

/**
 * Store configurations table - Tenant-scoped
 * Stores visual editor layouts per page type
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 9.2 (F004)
 * @see IMPLEMENTATION-PLAN.md Section 2.1.2
 * 
 * RLS Policy: tenant_id = current_setting('app.current_tenant')::uuid
 */
export const storeConfigs = pgTable("store_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  
  // Page identification
  pageType: text("page_type").notNull().$type<StorePageType>(),
  
  // Layout data (JSONB for flexibility)
  layout: jsonb("layout").default({}).$type<StoreLayout>(),
  
  // Publishing state
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  
  // Draft support - stores unpublished changes
  draftLayout: jsonb("draft_layout").$type<StoreLayout>(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantPageIdx: index("store_configs_tenant_page_idx").on(table.tenantId, table.pageType),
}));
