'use client';

import { useState } from 'react';
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
import type { Review } from '@/db/schema/reviews';

// Mock data for demonstration
const mockReviews: Review[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    productId: 'prod-1',
    customerId: 'cust-1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    rating: 5,
    title: 'Excellent product!',
    content: 'This product exceeded my expectations. The quality is outstanding and delivery was fast. Highly recommend to anyone looking for a reliable solution.',
    sentiment: 'POSITIVE',
    sentimentScores: { positive: 0.95, negative: 0.01, neutral: 0.02, mixed: 0.02 },
    keyPhrases: ['excellent product', 'outstanding quality', 'fast delivery'],
    isVerified: true,
    isApproved: true,
    spamScore: '5',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    productId: 'prod-2',
    customerId: 'cust-2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    rating: 2,
    title: 'Disappointed with quality',
    content: 'The product arrived damaged and customer service was unhelpful. Would not recommend.',
    sentiment: 'NEGATIVE',
    sentimentScores: { positive: 0.05, negative: 0.85, neutral: 0.05, mixed: 0.05 },
    keyPhrases: ['arrived damaged', 'unhelpful customer service'],
    isVerified: true,
    isApproved: false,
    spamScore: '10',
    createdAt: new Date('2026-01-09'),
    updatedAt: new Date('2026-01-09'),
  },
  {
    id: '3',
    tenantId: 'tenant-1',
    productId: 'prod-1',
    customerId: 'cust-3',
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    rating: 4,
    title: 'Good but could be better',
    content: 'Overall a solid product. Some features work great while others need improvement. Price is fair for what you get.',
    sentiment: 'MIXED',
    sentimentScores: { positive: 0.40, negative: 0.20, neutral: 0.15, mixed: 0.25 },
    keyPhrases: ['solid product', 'fair price', 'needs improvement'],
    isVerified: false,
    isApproved: false,
    spamScore: '15',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-01-08'),
  },
];

const mockStats = {
  total: 156,
  positive: 98,
  negative: 23,
  neutral: 20,
  mixed: 15,
  averageRating: 4.2,
};

export function ReviewsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const filteredReviews = mockReviews.filter((review) => {
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

  const pendingCount = mockReviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ds-gray-1000)]">Reviews</h1>
          <p className="text-sm text-[var(--ds-gray-600)]">
            Manage customer reviews with AI-powered sentiment analysis
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--ds-gray-600)]">Total Reviews</p>
                <p className="text-2xl font-semibold text-[var(--ds-gray-1000)]">
                  {mockStats.total}
                </p>
              </div>
              <Star className="h-8 w-8 text-[var(--ds-amber-500)]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--ds-gray-600)]">Avg Rating</p>
                <p className="text-2xl font-semibold text-[var(--ds-gray-1000)]">
                  {mockStats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(mockStats.averageRating)
                        ? 'fill-[var(--ds-amber-500)] text-[var(--ds-amber-500)]'
                        : 'text-[var(--ds-gray-300)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--ds-gray-600)]">Positive</p>
                <p className="text-2xl font-semibold text-[var(--ds-green-700)]">
                  {mockStats.positive}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-[var(--ds-green-600)]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--ds-gray-600)]">Negative</p>
                <p className="text-2xl font-semibold text-[var(--ds-red-700)]">
                  {mockStats.negative}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-[var(--ds-red-600)]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--ds-gray-600)]">Pending</p>
                <p className="text-2xl font-semibold text-[var(--ds-amber-700)]">
                  {pendingCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-[var(--ds-amber-600)]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ds-gray-500)]" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="POSITIVE">Positive</SelectItem>
                    <SelectItem value="NEUTRAL">Neutral</SelectItem>
                    <SelectItem value="MIXED">Mixed</SelectItem>
                    <SelectItem value="NEGATIVE">Negative</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
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
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {mockReviews.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2 bg-[var(--ds-amber-100)] text-[var(--ds-amber-800)]">
                  {pendingCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="flagged">
                Flagged
                <Badge variant="secondary" className="ml-2 bg-[var(--ds-red-100)] text-[var(--ds-red-800)]">
                  1
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-[var(--ds-gray-600)]">No reviews found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => console.log('Approve', review.id)}
                    onReject={() => console.log('Reject', review.id)}
                    onDelete={() => console.log('Delete', review.id)}
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
                    onApprove={() => console.log('Approve', review.id)}
                    onReject={() => console.log('Reject', review.id)}
                    onDelete={() => console.log('Delete', review.id)}
                  />
                ))}
            </TabsContent>

            <TabsContent value="flagged" className="space-y-4">
              {filteredReviews
                .filter((r) => Number(r.spamScore) > 50)
                .map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => console.log('Approve', review.id)}
                    onReject={() => console.log('Reject', review.id)}
                    onDelete={() => console.log('Delete', review.id)}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ReviewSentimentSummary stats={mockStats} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <CheckCircle className="mr-2 h-4 w-4 text-[var(--ds-green-600)]" />
                Approve All Pending
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-analyze Sentiment
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4 text-[var(--ds-amber-600)]" />
                Review Flagged Items
              </Button>
            </CardContent>
          </Card>

          {/* Sentiment Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sentiment Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--ds-green-600)]" />
                <span className="text-sm text-[var(--ds-gray-700)]">Positive - Happy customers</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-[var(--ds-gray-500)]" />
                <span className="text-sm text-[var(--ds-gray-700)]">Neutral - Factual feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--ds-amber-600)]" />
                <span className="text-sm text-[var(--ds-gray-700)]">Mixed - Both pros and cons</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-[var(--ds-red-600)]" />
                <span className="text-sm text-[var(--ds-gray-700)]">Negative - Needs attention</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
