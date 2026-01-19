import { Suspense } from 'react';
import { ReviewsClient } from './reviews-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Reviews | Dashboard',
  description: 'Manage customer reviews and sentiment analysis',
};

function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <ReviewsClient />
    </Suspense>
  );
}
