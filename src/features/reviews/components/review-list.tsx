"use client";

import { useState } from "react";
import { Filter, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReviewCard } from "./review-card";
import type { Review, SentimentType } from "@/db/schema/reviews";

interface ReviewListProps {
  reviews: Array<Review & { productName?: string; productSlug?: string }>;
  showProduct?: boolean;
  className?: string;
}

type SentimentFilter = SentimentType | "ALL";
type RatingFilter = "ALL" | "5" | "4" | "3" | "2" | "1";
type ApprovalFilter = "ALL" | "APPROVED" | "PENDING";

/**
 * ReviewList - Display a filterable list of reviews
 *
 * Features:
 * - Filter by sentiment (Positive, Negative, Neutral, Mixed)
 * - Filter by rating (1-5 stars)
 * - Filter by approval status
 */
export function ReviewList({
  reviews,
  showProduct = false,
  className,
}: ReviewListProps) {
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("ALL");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("ALL");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("ALL");

  // Apply filters
  const filteredReviews = reviews.filter((review) => {
    // Sentiment filter
    if (sentimentFilter !== "ALL" && review.sentiment !== sentimentFilter) {
      return false;
    }

    // Rating filter
    if (ratingFilter !== "ALL" && review.rating !== parseInt(ratingFilter)) {
      return false;
    }

    // Approval filter
    if (approvalFilter === "APPROVED" && !review.isApproved) {
      return false;
    }
    if (approvalFilter === "PENDING" && review.isApproved) {
      return false;
    }

    return true;
  });

  // Count by sentiment for filter badges
  const sentimentCounts = {
    POSITIVE: reviews.filter((r) => r.sentiment === "POSITIVE").length,
    NEGATIVE: reviews.filter((r) => r.sentiment === "NEGATIVE").length,
    NEUTRAL: reviews.filter((r) => r.sentiment === "NEUTRAL").length,
    MIXED: reviews.filter((r) => r.sentiment === "MIXED").length,
  };

  return (
    <div className={className}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-[var(--ds-gray-600)]">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Sentiment filter */}
        <Select
          value={sentimentFilter}
          onValueChange={(value) => setSentimentFilter(value as SentimentFilter)}
        >
          <SelectTrigger className="w-[160px] h-8">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Sentiments</SelectItem>
            <SelectItem value="POSITIVE">
              Positive ({sentimentCounts.POSITIVE})
            </SelectItem>
            <SelectItem value="NEGATIVE">
              Negative ({sentimentCounts.NEGATIVE})
            </SelectItem>
            <SelectItem value="NEUTRAL">
              Neutral ({sentimentCounts.NEUTRAL})
            </SelectItem>
            <SelectItem value="MIXED">
              Mixed ({sentimentCounts.MIXED})
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Rating filter */}
        <Select
          value={ratingFilter}
          onValueChange={(value) => setRatingFilter(value as RatingFilter)}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        {/* Approval filter */}
        <Select
          value={approvalFilter}
          onValueChange={(value) => setApprovalFilter(value as ApprovalFilter)}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {(sentimentFilter !== "ALL" ||
          ratingFilter !== "ALL" ||
          approvalFilter !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSentimentFilter("ALL");
              setRatingFilter("ALL");
              setApprovalFilter("ALL");
            }}
            className="text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)]"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--ds-gray-600)]">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </p>
        <div className="flex items-center gap-1 text-sm text-[var(--ds-gray-600)]">
          <SortDesc className="h-4 w-4" />
          <span>Most recent</span>
        </div>
      </div>

      {/* Reviews list */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showProduct={showProduct}
              productName={review.productName}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-[var(--ds-gray-600)]">
            No reviews match your filters
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSentimentFilter("ALL");
              setRatingFilter("ALL");
              setApprovalFilter("ALL");
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
