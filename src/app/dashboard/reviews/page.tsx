import { Suspense } from 'react';
import { ReviewsClient } from './reviews-client';
import { Skeleton } from '@/components/ui/skeleton';
import { getReviews, getReviewStats } from './actions';

export const metadata = {
  title: 'Reviews | Dashboard',
  description: 'Manage customer reviews and sentiment analysis',
};

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

async function ReviewsData() {
  const [reviewsResult, statsResult] = await Promise.all([
    getReviews(),
    getReviewStats(),
  ]);

  return (
    <ReviewsClient
      initialReviews={reviewsResult.reviews}
      initialStats={statsResult.stats}
    />
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <ReviewsData />
    </Suspense>
  );
}
