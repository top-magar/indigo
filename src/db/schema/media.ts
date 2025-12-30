import {
  pgTable,
  uuid,
  text,
  timestamp,
  bigint,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";

/**
 * Media folders for organizing assets
 * Supports nested folders up to 3 levels deep
 */
export const mediaFolders = pgTable(
  "media_folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    parentFolderId: uuid("parent_folder_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index("media_folders_tenant_idx").on(table.tenantId),
    parentIdx: index("media_folders_parent_idx").on(table.parentFolderId),
    uniqueFolderName: unique("media_folders_unique_name").on(
      table.tenantId,
      table.parentFolderId,
      table.name
    ),
  })
);

/**
 * Media assets - images, videos, and documents
 * Stored in Vercel Blob with CDN delivery
 */
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    folderId: uuid("folder_id").references(() => mediaFolders.id, {
      onDelete: "set null",
    }),

    // File info
    filename: text("filename").notNull(), // Display name (editable)
    originalFilename: text("original_filename").notNull(), // Original upload name
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),

    // Image dimensions (null for non-images)
    width: integer("width"),
    height: integer("height"),

    // Storage URLs
    blobUrl: text("blob_url").notNull(), // Vercel Blob storage URL
    cdnUrl: text("cdn_url").notNull(), // Public CDN URL
    thumbnailUrl: text("thumbnail_url"), // Generated thumbnail

    // Metadata
    altText: text("alt_text"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // Soft delete
  },
  (table) => ({
    tenantIdx: index("media_assets_tenant_idx").on(table.tenantId),
    folderIdx: index("media_assets_folder_idx").on(table.folderId),
    createdIdx: index("media_assets_created_idx").on(table.createdAt),
    mimeTypeIdx: index("media_assets_mime_type_idx").on(table.mimeType),
  })
);

/**
 * Track where media assets are used
 * Enables "in use" warnings before deletion
 */
export const mediaAssetUsages = pgTable(
  "media_asset_usages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .references(() => mediaAssets.id, { onDelete: "cascade" })
      .notNull(),
    entityType: text("entity_type").notNull(), // 'product', 'block', 'category', 'store'
    entityId: uuid("entity_id").notNull(),
    fieldName: text("field_name"), // Which field uses this asset
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    assetIdx: index("media_usages_asset_idx").on(table.assetId),
    entityIdx: index("media_usages_entity_idx").on(
      table.entityType,
      table.entityId
    ),
  })
);

// Relations
export const mediaFoldersRelations = relations(mediaFolders, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [mediaFolders.tenantId],
    references: [tenants.id],
  }),
  parentFolder: one(mediaFolders, {
    fields: [mediaFolders.parentFolderId],
    references: [mediaFolders.id],
    relationName: "folderHierarchy",
  }),
  childFolders: many(mediaFolders, {
    relationName: "folderHierarchy",
  }),
  assets: many(mediaAssets),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [mediaAssets.tenantId],
    references: [tenants.id],
  }),
  folder: one(mediaFolders, {
    fields: [mediaAssets.folderId],
    references: [mediaFolders.id],
  }),
  usages: many(mediaAssetUsages),
}));

export const mediaAssetUsagesRelations = relations(mediaAssetUsages, ({ one }) => ({
  asset: one(mediaAssets, {
    fields: [mediaAssetUsages.assetId],
    references: [mediaAssets.id],
  }),
}));

// Type exports for use in application code
export type MediaFolder = typeof mediaFolders.$inferSelect;
export type NewMediaFolder = typeof mediaFolders.$inferInsert;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;
export type MediaAssetUsage = typeof mediaAssetUsages.$inferSelect;
export type NewMediaAssetUsage = typeof mediaAssetUsages.$inferInsert;
