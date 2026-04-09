import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  index,
  varchar,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { products } from "./products";
import { customers } from "./customers";

/**
 * Sentiment types from AWS Comprehend
 */
export type SentimentType = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";

/**
 * Sentiment scores from AWS Comprehend
 */
export interface SentimentScores {
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
}

/**
 * Reviews table for customer product reviews with sentiment analysis
 *
 * @see AWS Comprehend integration at src/infrastructure/aws/comprehend.ts
 */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),

    // Customer info (stored separately for guest reviews)
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),

    // Review content
    rating: integer("rating").notNull(), // 1-5 stars
    title: varchar("title", { length: 255 }),
    content: text("content").notNull(),

    // AWS Comprehend sentiment analysis
    sentiment: varchar("sentiment", { length: 20 })
      .default("NEUTRAL")
      .$type<SentimentType>(),
    sentimentScores: jsonb("sentiment_scores")
      .default({})
      .$type<SentimentScores>(),
    keyPhrases: text("key_phrases").array().default([]),

    // Moderation
    isVerified: boolean("is_verified").default(false), // Verified purchase
    isApproved: boolean("is_approved").default(false), // Moderation status
    spamScore: decimal("spam_score", { precision: 5, scale: 2 }).default("0"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantProductIdx: index("reviews_tenant_product_idx").on(
      table.tenantId,
      table.productId
    ),
    tenantCustomerIdx: index("reviews_tenant_customer_idx").on(
      table.tenantId,
      table.customerId
    ),
    sentimentIdx: index("reviews_sentiment_idx").on(
      table.tenantId,
      table.sentiment
    ),
    approvedIdx: index("reviews_approved_idx").on(
      table.tenantId,
      table.isApproved
    ),
    ratingIdx: index("reviews_rating_idx").on(table.tenantId, table.rating),
  })
);

/**
 * Type for inserting a new review
 */
export type NewReview = typeof reviews.$inferInsert;

/**
 * Type for selecting a review
 */
export type Review = typeof reviews.$inferSelect;
