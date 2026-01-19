'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  RefreshCw,
  ChevronRight,
  Calendar,
  ShoppingCart,
} from 'lucide-react';

import { cn } from '@/shared/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/geist/progress';

interface ForecastInsight {
  id: string;
  type: 'stock_out_warning' | 'reorder_suggestion' | 'overstock_alert' | 'seasonal_trend';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  productId?: string;
  productName?: string;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

interface ForecastInsightsProps {
  tenantId: string;
  className?: string;
  maxInsights?: number;
  onAction?: (insight: ForecastInsight) => void;
}

const priorityColors = {
  critical: 'bg-[var(--ds-red-100)] text-[var(--ds-red-900)] border-[var(--ds-red-300)]',
  high: 'bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)] border-[var(--ds-amber-300)]',
  medium: 'bg-[var(--ds-blue-100)] text-[var(--ds-blue-900)] border-[var(--ds-blue-300)]',
  low: 'bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)] border-[var(--ds-gray-300)]',
};

const typeIcons = {
  stock_out_warning: AlertTriangle,
  reorder_suggestion: ShoppingCart,
  overstock_alert: Package,
  seasonal_trend: TrendingUp,
};

export function ForecastInsights({
  tenantId,
  className,
  maxInsights = 5,
  onAction,
}: ForecastInsightsProps) {
  const [insights, setInsights] = useState<ForecastInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/inventory/forecast-insights?tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Failed to fetch forecast insights:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [tenantId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInsights();
  };

  const handleDismiss = (insightId: string) => {
    setInsights(prev => prev.filter(i => i.id !== insightId));
  };

  const displayedInsights = insights.slice(0, maxInsights);
  const criticalCount = insights.filter(i => i.priority === 'critical').length;
  const highCount = insights.filter(i => i.priority === 'high').length;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ds-blue-100)]">
              <TrendingUp className="h-4 w-4 text-[var(--ds-blue-700)]" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
                Inventory Forecast
              </CardTitle>
              <p className="text-xs text-[var(--ds-gray-600)]">
                AI-powered demand predictions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)] text-xs">
                {highCount} high
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayedInsights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-10 w-10 text-[var(--ds-gray-400)] mb-3" />
            <p className="text-sm text-[var(--ds-gray-600)]">
              No inventory alerts at this time
            </p>
            <p className="text-xs text-[var(--ds-gray-500)] mt-1">
              Your stock levels look healthy
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedInsights.map((insight, index) => {
              const Icon = typeIcons[insight.type];
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'rounded-lg border p-3',
                    priorityColors[insight.priority]
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">
                          {insight.title}
                        </h4>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-xs mt-1 opacity-80">
                        {insight.description}
                      </p>
                      {insight.metadata && (
                        <div className="flex items-center gap-4 mt-2 text-xs opacity-70">
                          {insight.metadata.currentStock !== undefined && (
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {insight.metadata.currentStock as number} in stock
                            </span>
                          )}
                          {insight.metadata.daysUntilStockOut !== undefined && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {insight.metadata.daysUntilStockOut as number} days left
                            </span>
                          )}
                        </div>
                      )}
                      {insight.actionLabel && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-2 text-xs"
                          onClick={() => onAction?.(insight)}
                        >
                          {insight.actionLabel}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      onClick={() => handleDismiss(insight.id)}
                    >
                      ×
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {insights.length > maxInsights && (
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View all {insights.length} insights
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
