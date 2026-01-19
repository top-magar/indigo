'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/geist/progress';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface SentimentStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
  averageRating: number;
}

interface ReviewSentimentSummaryProps {
  stats: SentimentStats;
}

export function ReviewSentimentSummary({ stats }: ReviewSentimentSummaryProps) {
  const { total, positive, negative, neutral, mixed, averageRating } = stats;

  const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0;
  const mixedPercent = total > 0 ? Math.round((mixed / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Rating */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--ds-gray-600)]">Average Rating</span>
          <span className="text-2xl font-semibold text-[var(--ds-gray-900)]">
            {averageRating.toFixed(1)} / 5
          </span>
        </div>

        {/* Total Reviews */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--ds-gray-600)]">Total Reviews</span>
          <span className="text-lg font-medium text-[var(--ds-gray-900)]">{total}</span>
        </div>

        {/* Sentiment Breakdown */}
        <div className="space-y-3 pt-2">
          {/* Positive */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--ds-green-600)]" />
                <span className="text-[var(--ds-gray-700)]">Positive</span>
              </div>
              <span className="font-medium text-[var(--ds-green-700)]">
                {positive} ({positivePercent}%)
              </span>
            </div>
            <Progress value={positivePercent} className="h-2 bg-[var(--ds-gray-200)]" />
          </div>

          {/* Neutral */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-[var(--ds-gray-500)]" />
                <span className="text-[var(--ds-gray-700)]">Neutral</span>
              </div>
              <span className="font-medium text-[var(--ds-gray-600)]">
                {neutral} ({neutralPercent}%)
              </span>
            </div>
            <Progress value={neutralPercent} className="h-2 bg-[var(--ds-gray-200)]" />
          </div>

          {/* Mixed */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--ds-amber-600)]" />
                <span className="text-[var(--ds-gray-700)]">Mixed</span>
              </div>
              <span className="font-medium text-[var(--ds-amber-700)]">
                {mixed} ({mixedPercent}%)
              </span>
            </div>
            <Progress value={mixedPercent} className="h-2 bg-[var(--ds-gray-200)]" />
          </div>

          {/* Negative */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-[var(--ds-red-600)]" />
                <span className="text-[var(--ds-gray-700)]">Negative</span>
              </div>
              <span className="font-medium text-[var(--ds-red-700)]">
                {negative} ({negativePercent}%)
              </span>
            </div>
            <Progress value={negativePercent} className="h-2 bg-[var(--ds-gray-200)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
