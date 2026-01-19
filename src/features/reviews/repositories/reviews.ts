import "server-only";
import { reviews, type SentimentType, type NewReview, type Review } from "@/db/schema/reviews";
import { products } from "@/db/schema/products";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { analyzeReview } from "@/infrastructure/aws/comprehend";

/**
 * Sentiment statistics for a product
 */
export interface SentimentStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
  averageRating: number;
  percentPositive: number;
  percentNegative: number;
  percentNeutral: number;
  percentMixed: number;
}

/**
 * Review with product info
 */
export interface ReviewWithProduct extends Review {
  productName?: string | null;
  productSlug?: string | null;
}

/**
 * Filter options for reviews
 */
export interface ReviewFilters {
  productId?: string;
  sentiment?: SentimentType;
  isApproved?: boolean;
  minRating?: number;
  maxRating?: number;
  limit?: number;
  offset?: number;
}

/**
 * Reviews Repository
 *
 * Handles CRUD operations for reviews with AWS Comprehend sentiment analysis
 */
export class ReviewsRepository {
  /**
   * Find all reviews for a tenant with optional filters
   */
  async findAll(
    tenantId: string,
    filters?: ReviewFilters
  ): Promise<ReviewWithProduct[]> {
    return withTenant(tenantId, async (tx) => {
      let query = tx
        .select({
          id: reviews.id,
          tenantId: reviews.tenantId,
          productId: reviews.productId,
          customerId: reviews.customerId,
          customerName: reviews.customerName,
          customerEmail: reviews.customerEmail,
          rating: reviews.rating,
          title: reviews.title,
          content: reviews.content,
          sentiment: reviews.sentiment,
          sentimentScores: reviews.sentimentScores,
          keyPhrases: reviews.keyPhrases,
          isVerified: reviews.isVerified,
          isApproved: reviews.isApproved,
          spamScore: reviews.spamScore,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
          productName: products.name,
          productSlug: products.slug,
        })
        .from(reviews)
        .leftJoin(products, eq(reviews.productId, products.id))
        .orderBy(desc(reviews.createdAt))
        .$dynamic();

      // Apply filters
      const conditions = [];

      if (filters?.productId) {
        conditions.push(eq(reviews.productId, filters.productId));
      }

      if (filters?.sentiment) {
        conditions.push(eq(reviews.sentiment, filters.sentiment));
      }

      if (filters?.isApproved !== undefined) {
        conditions.push(eq(reviews.isApproved, filters.isApproved));
      }

      if (filters?.minRating) {
        conditions.push(sql`${reviews.rating} >= ${filters.minRating}`);
      }

      if (filters?.maxRating) {
        conditions.push(sql`${reviews.rating} <= ${filters.maxRating}`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      return query;
    });
  }

  /**
   * Find reviews for a specific product
   */
  async findByProduct(
    tenantId: string,
    productId: string,
    options?: { approvedOnly?: boolean; limit?: number; offset?: number }
  ): Promise<Review[]> {
    return withTenant(tenantId, async (tx) => {
      const conditions = [eq(reviews.productId, productId)];

      if (options?.approvedOnly) {
        conditions.push(eq(reviews.isApproved, true));
      }

      let query = tx
        .select()
        .from(reviews)
        .where(and(...conditions))
        .orderBy(desc(reviews.createdAt))
        .$dynamic();

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.offset(options.offset);
      }

      return query;
    });
  }

  /**
   * Find a review by ID
   */
  async findById(tenantId: string, id: string): Promise<Review | null> {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx
        .select()
        .from(reviews)
        .where(eq(reviews.id, id))
        .limit(1);

      return result || null;
    });
  }

  /**
   * Create a new review and analyze sentiment with AWS Comprehend
   */
  async create(
    tenantId: string,
    data: Omit<NewReview, "id" | "tenantId" | "createdAt" | "updatedAt" | "sentiment" | "sentimentScores" | "keyPhrases" | "spamScore">
  ): Promise<Review> {
    // Analyze review content with AWS Comprehend
    const analysis = await analyzeReview(data.content);

    return withTenant(tenantId, async (tx) => {
      const [created] = await tx
        .insert(reviews)
        .values({
          ...data,
          tenantId,
          sentiment: analysis.sentiment.sentiment,
          sentimentScores: analysis.sentiment.scores,
          keyPhrases: analysis.keyPhrases.phrases.map((p) => p.text),
          spamScore: analysis.isSpam ? "100" : String(100 - analysis.qualityScore),
        })
        .returning();

      return created;
    });
  }

  /**
   * Create a review without sentiment analysis (for bulk imports)
   */
  async createWithoutAnalysis(
    tenantId: string,
    data: Omit<NewReview, "id" | "tenantId" | "createdAt" | "updatedAt">
  ): Promise<Review> {
    return withTenant(tenantId, async (tx) => {
      const [created] = await tx
        .insert(reviews)
        .values({
          ...data,
          tenantId,
        })
        .returning();

      return created;
    });
  }

  /**
   * Analyze an existing review with AWS Comprehend and update
   */
  async analyzeAndUpdate(tenantId: string, id: string): Promise<Review | null> {
    const review = await this.findById(tenantId, id);
    if (!review) return null;

    const analysis = await analyzeReview(review.content);

    return withTenant(tenantId, async (tx) => {
      const [updated] = await tx
        .update(reviews)
        .set({
          sentiment: analysis.sentiment.sentiment,
          sentimentScores: analysis.sentiment.scores,
          keyPhrases: analysis.keyPhrases.phrases.map((p) => p.text),
          spamScore: analysis.isSpam ? "100" : String(100 - analysis.qualityScore),
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, id))
        .returning();

      return updated || null;
    });
  }

  /**
   * Update review approval status
   */
  async approve(tenantId: string, id: string): Promise<Review | null> {
    return withTenant(tenantId, async (tx) => {
      const [updated] = await tx
        .update(reviews)
        .set({
          isApproved: true,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, id))
        .returning();

      return updated || null;
    });
  }

  /**
   * Reject a review (set isApproved to false)
   */
  async reject(tenantId: string, id: string): Promise<Review | null> {
    return withTenant(tenantId, async (tx) => {
      const [updated] = await tx
        .update(reviews)
        .set({
          isApproved: false,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, id))
        .returning();

      return updated || null;
    });
  }

  /**
   * Delete a review
   */
  async delete(tenantId: string, id: string): Promise<void> {
    await withTenant(tenantId, async (tx) => {
      await tx.delete(reviews).where(eq(reviews.id, id));
    });
  }

  /**
   * Get sentiment statistics for a product
   */
  async getSentimentStats(
    tenantId: string,
    productId: string
  ): Promise<SentimentStats> {
    return withTenant(tenantId, async (tx) => {
      const productReviews = await tx
        .select()
        .from(reviews)
        .where(
          and(eq(reviews.productId, productId), eq(reviews.isApproved, true))
        );

      const total = productReviews.length;

      if (total === 0) {
        return {
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          mixed: 0,
          averageRating: 0,
          percentPositive: 0,
          percentNegative: 0,
          percentNeutral: 0,
          percentMixed: 0,
        };
      }

      const positive = productReviews.filter(
        (r) => r.sentiment === "POSITIVE"
      ).length;
      const negative = productReviews.filter(
        (r) => r.sentiment === "NEGATIVE"
      ).length;
      const neutral = productReviews.filter(
        (r) => r.sentiment === "NEUTRAL"
      ).length;
      const mixed = productReviews.filter(
        (r) => r.sentiment === "MIXED"
      ).length;

      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / total;

      return {
        total,
        positive,
        negative,
        neutral,
        mixed,
        averageRating: Math.round(averageRating * 10) / 10,
        percentPositive: Math.round((positive / total) * 100),
        percentNegative: Math.round((negative / total) * 100),
        percentNeutral: Math.round((neutral / total) * 100),
        percentMixed: Math.round((mixed / total) * 100),
      };
    });
  }

  /**
   * Get overall sentiment stats for all products
   */
  async getOverallStats(tenantId: string): Promise<SentimentStats> {
    return withTenant(tenantId, async (tx) => {
      const allReviews = await tx
        .select()
        .from(reviews)
        .where(eq(reviews.isApproved, true));

      const total = allReviews.length;

      if (total === 0) {
        return {
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          mixed: 0,
          averageRating: 0,
          percentPositive: 0,
          percentNegative: 0,
          percentNeutral: 0,
          percentMixed: 0,
        };
      }

      const positive = allReviews.filter(
        (r) => r.sentiment === "POSITIVE"
      ).length;
      const negative = allReviews.filter(
        (r) => r.sentiment === "NEGATIVE"
      ).length;
      const neutral = allReviews.filter(
        (r) => r.sentiment === "NEUTRAL"
      ).length;
      const mixed = allReviews.filter((r) => r.sentiment === "MIXED").length;

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / total;

      return {
        total,
        positive,
        negative,
        neutral,
        mixed,
        averageRating: Math.round(averageRating * 10) / 10,
        percentPositive: Math.round((positive / total) * 100),
        percentNegative: Math.round((negative / total) * 100),
        percentNeutral: Math.round((neutral / total) * 100),
        percentMixed: Math.round((mixed / total) * 100),
      };
    });
  }

  /**
   * Count pending reviews (not yet approved)
   */
  async countPending(tenantId: string): Promise<number> {
    return withTenant(tenantId, async (tx) => {
      const [result] = await tx
        .select({ count: count() })
        .from(reviews)
        .where(eq(reviews.isApproved, false));

      return result?.count || 0;
    });
  }
}

// Singleton instance
export const reviewsRepository = new ReviewsRepository();
