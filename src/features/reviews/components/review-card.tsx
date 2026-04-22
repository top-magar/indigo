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
        variant: "secondary" as const,
        icon: ThumbsUp,
        label: "Positive",
        colorClass: "text-emerald-600",
      };
    case "NEGATIVE":
      return {
        variant: "destructive" as const,
        icon: ThumbsDown,
        label: "Negative",
        colorClass: "text-destructive",
      };
    case "MIXED":
      return {
        variant: "secondary" as const,
        icon: AlertCircle,
        label: "Mixed",
        colorClass: "text-amber-500",
      };
    default:
      return {
        variant: "secondary" as const,
        icon: Minus,
        label: "Neutral",
        colorClass: "text-muted-foreground",
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
            "size-4",
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-border"
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
            <Avatar className="size-10">
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {review.customerName}
                </span>
                {review.isVerified && (
                  <Badge
                    variant="secondary"
                   
                    className="gap-1"
                  >
                    <CheckCircle className="size-3.5" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
          <Badge variant={sentimentConfig.variant} className="gap-1">
            <SentimentIcon className="size-3.5" />
            {sentimentConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Rating and title */}
        <div className="space-y-1">
          <StarRating rating={review.rating} />
          {review.title && (
            <h4 className="text-sm font-medium text-foreground">
              {review.title}
            </h4>
          )}
        </div>

        {/* Review content */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.content}
        </p>

        {/* Key phrases */}
        {review.keyPhrases && review.keyPhrases.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {review.keyPhrases.slice(0, 5).map((phrase, index) => (
              <Badge
                key={index}
                variant="secondary"
               
                className="text-xs"
              >
                {phrase}
              </Badge>
            ))}
          </div>
        )}

        {/* Moderation status */}
        {!review.isApproved && (
          <div className="flex items-center gap-2 pt-2 text-xs text-amber-500">
            <AlertCircle className="size-3.5" />
            <span>Pending moderation</span>
          </div>
        )}
      </CardContent>

      {/* Action buttons */}
      {(onApprove || onReject || onDelete) && (
        <CardFooter className="border-t border-border pt-3">
          <div className="flex items-center gap-2">
            {!review.isApproved && onApprove && (
              <Button
                variant="outline"
               
                onClick={onApprove}
                className="text-emerald-600 hover:bg-emerald-50"
              >
                <CheckCircle className="mr-1.5 size-3.5" />
                Approve
              </Button>
            )}
            {!review.isApproved && onReject && (
              <Button
                variant="outline"
               
                onClick={onReject}
                className="text-destructive hover:bg-destructive/10"
              >
                <ThumbsDown className="mr-1.5 size-3.5" />
                Reject
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
               
                onClick={onDelete}
                className="ml-auto text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
