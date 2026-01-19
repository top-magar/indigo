'use server';

import { getSession } from '@/infrastructure/auth/session';
import { revalidatePath } from 'next/cache';
import { reviewsRepository } from './repositories/reviews';

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  content: string;
  customerName: string;
  customerEmail: string;
}

export async function createReview(input: CreateReviewInput) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const review = await reviewsRepository.create(session.user.tenantId, {
      productId: input.productId,
      customerId: session.user.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      rating: input.rating,
      title: input.title,
      content: input.content,
      isVerified: false,
      isApproved: false,
    });

    revalidatePath(`/dashboard/products/${input.productId}`);
    revalidatePath(`/store/[slug]/products/${input.productId}`);

    return { success: true, review };
  } catch (error) {
    console.error('[Reviews] Create failed:', error);
    return { success: false, error: 'Failed to create review' };
  }
}

export async function getProductReviews(
  productId: string,
  options?: { approvedOnly?: boolean; limit?: number; offset?: number }
) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized', reviews: [] };
  }

  try {
    const reviews = await reviewsRepository.findByProduct(
      session.user.tenantId,
      productId,
      options
    );
    return { success: true, reviews };
  } catch (error) {
    console.error('[Reviews] Get failed:', error);
    return { success: false, error: 'Failed to get reviews', reviews: [] };
  }
}

export async function approveReview(reviewId: string) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await reviewsRepository.approve(session.user.tenantId, reviewId);
    revalidatePath('/dashboard/reviews');
    return { success: true };
  } catch (error) {
    console.error('[Reviews] Approve failed:', error);
    return { success: false, error: 'Failed to approve review' };
  }
}

export async function rejectReview(reviewId: string) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await reviewsRepository.reject(session.user.tenantId, reviewId);
    revalidatePath('/dashboard/reviews');
    return { success: true };
  } catch (error) {
    console.error('[Reviews] Reject failed:', error);
    return { success: false, error: 'Failed to reject review' };
  }
}

export async function getReviewStats(productId?: string) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized', stats: null };
  }

  try {
    const stats = productId
      ? await reviewsRepository.getSentimentStats(session.user.tenantId, productId)
      : await reviewsRepository.getOverallStats(session.user.tenantId);
    return { success: true, stats };
  } catch (error) {
    console.error('[Reviews] Stats failed:', error);
    return { success: false, error: 'Failed to get stats', stats: null };
  }
}

export async function deleteReview(reviewId: string) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await reviewsRepository.delete(session.user.tenantId, reviewId);
    revalidatePath('/dashboard/reviews');
    return { success: true };
  } catch (error) {
    console.error('[Reviews] Delete failed:', error);
    return { success: false, error: 'Failed to delete review' };
  }
}
