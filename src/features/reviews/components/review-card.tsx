"use client";

import { Star, ThumbsUp, ThumbsDown, AlertCircle, Minus, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/shared/utils";
import type { Review } from "@/db/schema/reviews";

export interface ReviewCardProps {
  review: Review;
  showProduct?: boolean;
  productName?: string;
  className?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
}

/**
 * Get sentiment badge variant and icon based on sentiment type
 */
function getSentimentConfig(sentiment: string | null) {
  switch (sentiment) {
    case "POSITIVE":
      return {
        variant: "geist-green-subtle" as const,
        icon: ThumbsUp,
        label: "Positive",
        colorClass: "text-[var(--ds-green-700)]",
      };
    case "NEGATIVE":
      return {
        variant: "geist-red-subtle" as const,
        icon: ThumbsDown,
        label: "Negative",
        colorClass: "text-[var(--ds-red-700)]",
      };
    case "MIXED":
      return {
        variant: "geist-amber-subtle" as const,
        icon: AlertCircle,
        label: "Mixed",
        colorClass: "text-[var(--ds-amber-700)]",
      };
    default:
      return {
        variant: "geist-gray-subtle" as const,
        icon: Minus,
        label: "Neutral",
        colorClass: "text-[var(--ds-gray-600)]",
      };
  }
}

/**
 * Render star rating
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating
              ? "fill-[var(--ds-amber-500)] text-[var(--ds-amber-500)]"
              : "fill-none text-[var(--ds-gray-300)]"
          )}
        />
      ))}
    </div>
  );
}

/**
 * ReviewCard - Display a single review with sentiment badge
 *
 * Uses Geist design system with OKLCH colors:
 * - Green for positive sentiment
 * - Red for negative sentiment
 * - Amber for mixed sentiment
 * - Gray for neutral sentiment
 */
export function ReviewCard({
  review,
  showProduct = false,
  productName,
  className,
  onApprove,
  onReject,
  onDelete,
}: ReviewCardProps) {
  const sentimentConfig = getSentimentConfig(review.sentiment);
  const SentimentIcon = sentimentConfig.icon;

  // Get initials for avatar
  const initials = review.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Format date
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(review.createdAt));

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* Customer info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)] text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--ds-gray-900)]">
                  {review.customerName}
                </span>
                {review.isVerified && (
                  <Badge
                    variant="geist-green-subtle"
                    size="sm"
                    className="gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--ds-gray-600)]">
                <span>{formattedDate}</span>
                {showProduct && productName && (
                  <>
                    <span>•</span>
                    <span>{productName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sentiment badge */}
          <Badge variant={sentimentConfig.variant} size="sm" className="gap-1">
            <SentimentIcon className="h-3 w-3" />
            {sentimentConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Rating and title */}
        <div className="space-y-1">
          <StarRating rating={review.rating} />
          {review.title && (
            <h4 className="text-sm font-medium text-[var(--ds-gray-900)]">
              {review.title}
            </h4>
          )}
        </div>

        {/* Review content */}
        <p className="text-sm text-[var(--ds-gray-800)] leading-relaxed">
          {review.content}
        </p>

        {/* Key phrases */}
        {review.keyPhrases && review.keyPhrases.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {review.keyPhrases.slice(0, 5).map((phrase, index) => (
              <Badge
                key={index}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                {phrase}
              </Badge>
            ))}
          </div>
        )}

        {/* Moderation status */}
        {!review.isApproved && (
          <div className="flex items-center gap-2 pt-2 text-xs text-[var(--ds-amber-700)]">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Pending moderation</span>
          </div>
        )}
      </CardContent>

      {/* Action buttons */}
      {(onApprove || onReject || onDelete) && (
        <CardFooter className="border-t border-[var(--ds-gray-200)] pt-3">
          <div className="flex items-center gap-2">
            {!review.isApproved && onApprove && (
              <Button
                variant="outline"
                size="sm"
                onClick={onApprove}
                className="text-[var(--ds-green-700)] hover:bg-[var(--ds-green-100)]"
              >
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Approve
              </Button>
            )}
            {!review.isApproved && onReject && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReject}
                className="text-[var(--ds-red-700)] hover:bg-[var(--ds-red-100)]"
              >
                <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
                Reject
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="ml-auto text-[var(--ds-gray-600)] hover:text-[var(--ds-red-700)]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
