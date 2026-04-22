'use server';

import { z } from 'zod';
import { createLogger } from "@/lib/logger";
const log = createLogger("actions:reviews");

import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { reviewsRepository } from '@/features/reviews/repositories/reviews';
import type { ReviewFilters } from '@/features/reviews/repositories/reviews';

export async function getReviews(filters?: ReviewFilters) {
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized', reviews: [] };
  }

  try {
    const reviews = await reviewsRepository.findAll(user.tenantId, filters);
    return { success: true, reviews };
  } catch (error) {
    log.error('[Reviews] Get all failed:', error);
    return { success: false, error: 'Failed to get reviews', reviews: [] };
  }
}

export async function getReviewStats() {
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized', stats: null };
  }

  try {
    const stats = await reviewsRepository.getOverallStats(user.tenantId);
    return { success: true, stats };
  } catch (error) {
    log.error('[Reviews] Stats failed:', error);
    return { success: false, error: 'Failed to get stats', stats: null };
  }
}

export async function getPendingReviewsCount() {
  const user = await getUser();
  if (!user?.tenantId) {
    return 0;
  }

  try {
    return await reviewsRepository.countPending(user.tenantId);
  } catch (error) {
    log.error('[Reviews] Count pending failed:', error);
    return 0;
  }
}

export async function approveReview(reviewId: string) {
  let validId: string;
  try { validId = z.string().uuid().parse(reviewId); } catch { return { success: false, error: 'Invalid review ID' }; }
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
  let validId: string;
  try { validId = z.string().uuid().parse(reviewId); } catch { return { success: false, error: 'Invalid review ID' }; }
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

export async function deleteReview(reviewId: string) {
  let validId: string;
  try { validId = z.string().uuid().parse(reviewId); } catch { return { success: false, error: 'Invalid review ID' }; }
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

export async function reanalyzeReview(reviewId: string) {
  let validId: string;
  try { validId = z.string().uuid().parse(reviewId); } catch { return { success: false, error: 'Invalid review ID' }; }
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const review = await reviewsRepository.analyzeAndUpdate(
      user.tenantId,
      validId
    );
    if (!review) {
      return { success: false, error: 'Review not found' };
    }
    revalidatePath('/dashboard/reviews');
    return { success: true, review };
  } catch (error) {
    log.error('[Reviews] Reanalyze failed:', error);
    return { success: false, error: 'Failed to reanalyze review' };
  }
}

export async function bulkApproveReviews(reviewIds: string[]) {
  const validIds = z.array(z.string().uuid()).min(1).parse(reviewIds);
  const user = await getUser();
  if (!user?.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  const tenantId = user.tenantId;

  try {
    await Promise.all(
      validIds.map((id) => reviewsRepository.approve(tenantId, id))
    );
    revalidatePath('/dashboard/reviews');
    return { success: true };
  } catch (error) {
    log.error('[Reviews] Bulk approve failed:', error);
    return { success: false, error: 'Failed to approve reviews' };
  }
}
