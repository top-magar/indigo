'use server';

import { getSession } from '@/infrastructure/auth/session';
import { revalidatePath } from 'next/cache';
import { reviewsRepository } from '@/features/reviews/repositories/reviews';
import type { ReviewFilters } from '@/features/reviews/repositories/reviews';

export async function getReviews(filters?: ReviewFilters) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized', reviews: [] };
  }

  try {
    const reviews = await reviewsRepository.findAll(session.user.tenantId, filters);
    return { success: true, reviews };
  } catch (error) {
    console.error('[Reviews] Get all failed:', error);
    return { success: false, error: 'Failed to get reviews', reviews: [] };
  }
}

export async function getReviewStats() {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized', stats: null };
  }

  try {
    const stats = await reviewsRepository.getOverallStats(session.user.tenantId);
    return { success: true, stats };
  } catch (error) {
    console.error('[Reviews] Stats failed:', error);
    return { success: false, error: 'Failed to get stats', stats: null };
  }
}

export async function getPendingReviewsCount() {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return 0;
  }

  try {
    return await reviewsRepository.countPending(session.user.tenantId);
  } catch (error) {
    console.error('[Reviews] Count pending failed:', error);
    return 0;
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

export async function reanalyzeReview(reviewId: string) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const review = await reviewsRepository.analyzeAndUpdate(
      session.user.tenantId,
      reviewId
    );
    if (!review) {
      return { success: false, error: 'Review not found' };
    }
    revalidatePath('/dashboard/reviews');
    return { success: true, review };
  } catch (error) {
    console.error('[Reviews] Reanalyze failed:', error);
    return { success: false, error: 'Failed to reanalyze review' };
  }
}

export async function bulkApproveReviews(reviewIds: string[]) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  const tenantId = session.user.tenantId;

  try {
    await Promise.all(
      reviewIds.map((id) => reviewsRepository.approve(tenantId, id))
    );
    revalidatePath('/dashboard/reviews');
    return { success: true };
  } catch (error) {
    console.error('[Reviews] Bulk approve failed:', error);
    return { success: false, error: 'Failed to approve reviews' };
  }
}
