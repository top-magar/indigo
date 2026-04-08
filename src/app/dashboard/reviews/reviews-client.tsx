'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { ReviewCard } from '@/features/reviews/components/review-card';
import { ReviewSentimentSummary } from '@/features/reviews/components/review-sentiment-summary';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
import type { Review } from '@/db/schema/reviews';
import type { SentimentStats } from '@/features/reviews/repositories/reviews';
import {
  approveReview,
  rejectReview,
  deleteReview,
  bulkApproveReviews,
} from './actions';

interface ReviewsClientProps {
  initialReviews: Review[];
  initialStats: SentimentStats | null;
}

const emptyStats: SentimentStats = {
  total: 0, positive: 0, negative: 0, neutral: 0, mixed: 0,
  averageRating: 0, percentPositive: 0, percentNegative: 0,
  percentNeutral: 0, percentMixed: 0,
};

export function ReviewsClient({ initialReviews, initialStats }: ReviewsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const stats = initialStats || emptyStats;
  const reviews = initialReviews;

  const handleRefresh = () => {
    startTransition(() => router.refresh());
  };

  const handleApprove = (reviewId: string) => {
    startTransition(async () => {
      const result = await approveReview(reviewId);
      if (result.success) {
        toast.success('Review approved');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to approve');
      }
    });
  };

  const handleReject = (reviewId: string) => {
    startTransition(async () => {
      const result = await rejectReview(reviewId);
      if (result.success) {
        toast.success('Review rejected');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to reject');
      }
    });
  };

  const handleDelete = (reviewId: string) => {
    startTransition(async () => {
      const result = await deleteReview(reviewId);
      if (result.success) {
        toast.success('Review deleted');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    });
  };

  const handleBulkApprove = () => {
    const pendingIds = reviews.filter((r) => !r.isApproved).map((r) => r.id);
    if (pendingIds.length === 0) return;
    startTransition(async () => {
      const result = await bulkApproveReviews(pendingIds);
      if (result.success) {
        toast.success(`${pendingIds.length} reviews approved`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to approve');
      }
    });
  };

  const filteredReviews = reviews.filter((review) => {
    if (sentimentFilter !== 'all' && review.sentiment !== sentimentFilter) {
      return false;
    }
    if (statusFilter === 'pending' && review.isApproved) {
      return false;
    }
    if (statusFilter === 'approved' && !review.isApproved) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        review.customerName.toLowerCase().includes(query) ||
        review.content.toLowerCase().includes(query) ||
        review.title?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const flaggedCount = reviews.filter((r) => Number(r.spamScore) > 50).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.4px]">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer reviews with AI-powered sentiment analysis
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Reviews</p>
                <p className="stat-value">
                  {stats.total}
                </p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center"><Star className="h-5 w-5 text-warning" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Avg Rating</p>
                <p className="stat-value">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(stats.averageRating)
                        ? 'fill-warning text-warning'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Positive</p>
                <p className="stat-value text-success">
                  {stats.positive}
                </p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-success" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Negative</p>
                <p className="stat-value text-destructive">
                  {stats.negative}
                </p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-destructive" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Pending</p>
                <p className="stat-value text-warning">
                  {pendingCount}
                </p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label="Search reviews" placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="w-full sm:w-40" aria-label="Filter by sentiment">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiment</SelectItem>
                    <SelectItem value="POSITIVE">Positive</SelectItem>
                    <SelectItem value="NEGATIVE">Negative</SelectItem>
                    <SelectItem value="NEUTRAL">Neutral</SelectItem>
                    <SelectItem value="MIXED">Mixed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge className="ml-2">
                  {filteredReviews.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge className="ml-2 bg-warning/10 text-warning">
                  {pendingCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="flagged">
                Flagged
                <Badge className="ml-2 bg-destructive/10 text-destructive">
                  {flaggedCount}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <EmptyState
                      icon={Star}
                      title="No reviews yet"
                      description="Reviews will appear here when customers leave feedback"
                      size="sm"
                      className="py-8"
                    />
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => handleApprove(review.id)}
                    onReject={() => handleReject(review.id)}
                    onDelete={() => handleDelete(review.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {filteredReviews
                .filter((r) => !r.isApproved)
                .map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => handleApprove(review.id)}
                    onReject={() => handleReject(review.id)}
                    onDelete={() => handleDelete(review.id)}
                  />
                ))}
              {pendingCount === 0 && (
                <Card>
                  <CardContent className="p-4">
                    <EmptyState icon={CheckCircle} title="All reviews have been moderated" size="sm" className="py-8" />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="flagged" className="space-y-4">
              {filteredReviews
                .filter((r) => Number(r.spamScore) > 50)
                .map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => handleApprove(review.id)}
                    onReject={() => handleReject(review.id)}
                    onDelete={() => handleDelete(review.id)}
                  />
                ))}
              {flaggedCount === 0 && (
                <Card>
                  <CardContent className="p-4">
                    <EmptyState icon={CheckCircle} title="No flagged reviews" size="sm" className="py-8" />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ReviewSentimentSummary stats={stats} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handleBulkApprove}
                disabled={isPending || pendingCount === 0}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-success" />
                Approve All Pending ({pendingCount})
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handleRefresh}
                disabled={isPending}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-analyze Sentiment
              </Button>
            </CardContent>
          </Card>

          {/* Sentiment Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sentiment Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">Positive - Happy customers</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Neutral - Factual feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">Mixed - Both pros and cons</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Negative - Needs attention</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
