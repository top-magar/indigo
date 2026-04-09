'use server';

import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { reviewsRepository } from './repositories/reviews';
import { createLogger } from "@/lib/logger";
const log = createLogger("features:reviews");

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  content: string;
  customerName: string;
  customerEmail: string;
}

const createReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(5000),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email(),
});

export async function createReview(input: CreateReviewInput) {
  const parsed = createReviewSchema.parse(input);
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const review = await reviewsRepository.create(user.tenantId, {
      productId: parsed.productId,
      customerId: user.id,
      customerName: parsed.customerName,
      customerEmail: parsed.customerEmail,
      rating: parsed.rating,
      title: parsed.title,
      content: parsed.content,
      isVerified: false,
      isApproved: false,
    });

    revalidatePath(`/dashboard/products/${parsed.productId}`);
    revalidatePath(`/store/[slug]/products/${parsed.productId}`);

    return { success: true, review };
  } catch (error) {
    log.error('[Reviews] Create failed:', error);
    return { success: false, error: 'Failed to create review' };
  }
}

export async function getProductReviews(
  productId: string,
  options?: { approvedOnly?: boolean; limit?: number; offset?: number }
) {
  const validProductId = z.string().uuid().parse(productId);
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized', reviews: [] };
  }

  try {
    const reviews = await reviewsRepository.findByProduct(
      user.tenantId,
      validProductId,
      options
    );
    return { success: true, reviews };
  } catch (error) {
    log.error('[Reviews] Get failed:', error);
    return { success: false, error: 'Failed to get reviews', reviews: [] };
  }
}

export async function approveReview(reviewId: string) {
  const validId = z.string().uuid().parse(reviewId);
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await reviewsRepository.approve(user.tenantId, validId);
    revalidatePath('/dashboard/reviews');
    return { success: true };
  } catch (error) {
    log.error('[Reviews] Approve failed:', error);
    return { success: false, error: 'Failed to approve review' };
  }
}

export async function rejectReview(reviewId: string) {
  const validId = z.string().uuid().parse(reviewId);
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await reviewsRepository.reject(user.tenantId, validId);
    revalidatePath('/dashboard/reviews');
    return { success: true };
  } catch (error) {
    log.error('[Reviews] Reject failed:', error);
    return { success: false, error: 'Failed to reject review' };
  }
}

export async function getReviewStats(productId?: string) {
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized', stats: null };
  }

  try {
    const stats = productId
      ? await reviewsRepository.getSentimentStats(user.tenantId, productId)
      : await reviewsRepository.getOverallStats(user.tenantId);
    return { success: true, stats };
  } catch (error) {
    log.error('[Reviews] Stats failed:', error);
    return { success: false, error: 'Failed to get stats', stats: null };
  }
}

export async function deleteReview(reviewId: string) {
  const validId = z.string().uuid().parse(reviewId);
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await reviewsRepository.delete(user.tenantId, validId);
    revalidatePath('/dashboard/reviews');
    return { success: true };
  } catch (error) {
    log.error('[Reviews] Delete failed:', error);
    return { success: false, error: 'Failed to delete review' };
  }
}
