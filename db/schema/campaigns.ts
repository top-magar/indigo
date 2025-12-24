import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, index, numeric } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export type CampaignType = "email" | "sms" | "push";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed";

export const campaigns = pgTable("campaigns", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    name: text("name").notNull(),
    type: text("type").$type<CampaignType>().notNull().default("email"),
    status: text("status").$type<CampaignStatus>().notNull().default("draft"),
    subject: text("subject"),
    previewText: text("preview_text"),
    fromName: text("from_name"),
    fromEmail: text("from_email"),
    replyTo: text("reply_to"),
    content: text("content"), // HTML content
    contentJson: jsonb("content_json"), // JSON for editor state
    templateId: uuid("template_id"),
    segmentId: text("segment_id"), // 'all', 'new', 'returning', 'vip', or custom segment ID
    segmentName: text("segment_name"),
    scheduledAt: timestamp("scheduled_at"),
    sentAt: timestamp("sent_at"),
    recipientsCount: integer("recipients_count").notNull().default(0),
    deliveredCount: integer("delivered_count").notNull().default(0),
    openedCount: integer("opened_count").notNull().default(0),
    clickedCount: integer("clicked_count").notNull().default(0),
    bouncedCount: integer("bounced_count").notNull().default(0),
    unsubscribedCount: integer("unsubscribed_count").notNull().default(0),
    revenueGenerated: numeric("revenue_generated", { precision: 10, scale: 2 }).notNull().default("0"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("campaigns_tenant_idx").on(table.tenantId),
    statusIdx: index("campaigns_status_idx").on(table.tenantId, table.status),
    scheduledIdx: index("campaigns_scheduled_idx").on(table.scheduledAt),
}));

// Track individual email sends for analytics
export const campaignRecipients = pgTable("campaign_recipients", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    campaignId: uuid("campaign_id").references(() => campaigns.id).notNull(),
    customerId: uuid("customer_id"),
    email: text("email").notNull(),
    status: text("status").$type<"pending" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "unsubscribed">().notNull().default("pending"),
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    openedAt: timestamp("opened_at"),
    clickedAt: timestamp("clicked_at"),
    bouncedAt: timestamp("bounced_at"),
    unsubscribedAt: timestamp("unsubscribed_at"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
    campaignIdx: index("campaign_recipients_campaign_idx").on(table.campaignId),
    customerIdx: index("campaign_recipients_customer_idx").on(table.customerId),
    emailIdx: index("campaign_recipients_email_idx").on(table.email),
}));

// Customer segments for targeting
export const customerSegments = pgTable("customer_segments", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").$type<"static" | "dynamic">().notNull().default("dynamic"),
    conditions: jsonb("conditions").$type<SegmentCondition[]>(),
    customerCount: integer("customer_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    tenantIdx: index("customer_segments_tenant_idx").on(table.tenantId),
}));

// Type for segment conditions
export interface SegmentCondition {
    field: "total_spent" | "orders_count" | "last_order_date" | "created_at" | "accepts_marketing" | "tags";
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_contains" | "is_empty" | "is_not_empty";
    value: string | number | boolean;
}
