'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Brain, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Eye,
  Settings
} from 'lucide-react'

interface RecommendationMetric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

interface RecommendationsData {
  status: 'active' | 'training' | 'setup_required'
  metrics: {
    clickThroughRate: string
    conversionRate: string
    revenueImpact: string
    recommendationsServed: string
  }
  activeUsers: number
  recommendationClicks: number
  trends?: {
    clickThroughRate: string
    conversionRate: string
    revenueImpact: string
    recommendationsServed: string
    activeUsers: string
    recommendationClicks: string
  }
}

function getTrendIcon(trend: RecommendationMetric['trend']) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-[var(--ds-green-600)]" />
    case 'down':
      return <TrendingUp className="h-3 w-3 rotate-180 text-[var(--ds-red-600)]" />
    default:
      return null
  }
}

function getTrendColor(trend: RecommendationMetric['trend']) {
  switch (trend) {
    case 'up':
      return 'text-[var(--ds-green-600)]'
    case 'down':
      return 'text-[var(--ds-red-600)]'
    default:
      return 'text-[var(--ds-gray-600)]'
  }
}

export function RecommendationsWidget() {
  const [data, setData] = useState<RecommendationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendationsData() {
      try {
        const response = await fetch('/api/recommendations/metrics')
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendationsData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--ds-gray-900)]">
            Personalized Recommendations
          </CardTitle>
          <CardDescription className="text-[var(--ds-gray-600)]">
            Amazon Personalize performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[var(--ds-gray-900)]">
            Personalized Recommendations
          </CardTitle>
          <CardDescription className="text-[var(--ds-gray-600)]">
            Amazon Personalize performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-[var(--ds-red-600)]">
              {error || 'Failed to load recommendations data'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const metrics: RecommendationMetric[] = [
    {
      label: 'Click-through Rate',
      value: data.metrics.clickThroughRate,
      change: data.trends?.clickThroughRate || '0%',
      trend: (data.trends?.clickThroughRate || '').startsWith('+') ? 'up' : 'down'
    },
    {
      label: 'Conversion Rate',
      value: data.metrics.conversionRate,
      change: data.trends?.conversionRate || '0%',
      trend: (data.trends?.conversionRate || '').startsWith('+') ? 'up' : 'down'
    },
    {
      label: 'Revenue Impact',
      value: data.metrics.revenueImpact,
      change: data.trends?.revenueImpact || '0%',
      trend: (data.trends?.revenueImpact || '').startsWith('+') ? 'up' : 'down'
    },
    {
      label: 'Recommendations Served',
      value: data.metrics.recommendationsServed,
      change: data.trends?.recommendationsServed || '0%',
      trend: (data.trends?.recommendationsServed || '').startsWith('+') ? 'up' : 'down'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-[var(--ds-gray-900)]">
              Personalized Recommendations
            </CardTitle>
            <CardDescription className="text-[var(--ds-gray-600)]">
              Amazon Personalize performance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`gap-1 ${
                data.status === 'active' 
                  ? 'bg-[var(--ds-green-100)] text-[var(--ds-green-800)]'
                  : data.status === 'training'
                  ? 'bg-[var(--ds-blue-100)] text-[var(--ds-blue-800)]'
                  : 'bg-[var(--ds-amber-100)] text-[var(--ds-amber-800)]'
              }`}
            >
              <Brain className="h-3 w-3" />
              {data.status === 'active' ? 'Active' : 
               data.status === 'training' ? 'Training' : 'Setup Required'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.status === 'setup_required' ? (
          // Setup Required State
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-lg bg-[var(--ds-amber-100)] flex items-center justify-center">
              <Settings className="h-6 w-6 text-[var(--ds-amber-600)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--ds-gray-900)] mb-1">
                Setup Amazon Personalize
              </h3>
              <p className="text-sm text-[var(--ds-gray-600)] mb-4">
                Enable AI-powered recommendations to increase sales and improve customer experience.
              </p>
              <Button className="gap-2">
                <Brain className="h-4 w-4" />
                Complete Setup
              </Button>
            </div>
          </div>
        ) : (
          // Active State - Show Metrics
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <div 
                  key={index}
                  className="space-y-1 p-3 rounded-lg bg-[var(--ds-gray-100)]"
                >
                  <div className="text-xs font-medium text-[var(--ds-gray-600)]">
                    {metric.label}
                  </div>
                  <div className="text-lg font-semibold text-[var(--ds-gray-900)]">
                    {metric.value}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                    {metric.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--ds-gray-200)]">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-[var(--ds-blue-600)]" />
                <div>
                  <div className="text-sm font-medium text-[var(--ds-gray-900)]">
                    Active Users
                  </div>
                  <div className="text-xs text-[var(--ds-gray-600)]">
                    Getting recommendations
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[var(--ds-gray-900)]">
                  {data.activeUsers.toLocaleString()}
                </div>
                <div className="text-xs text-[var(--ds-green-600)]">
                  {data.trends?.activeUsers || '+0%'} this week
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--ds-gray-200)]">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-4 w-4 text-[var(--ds-green-600)]" />
                <div>
                  <div className="text-sm font-medium text-[var(--ds-gray-900)]">
                    Recommendation Clicks
                  </div>
                  <div className="text-xs text-[var(--ds-gray-600)]">
                    Products clicked from recommendations
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-[var(--ds-gray-900)]">
                  {data.recommendationClicks.toLocaleString()}
                </div>
                <div className="text-xs text-[var(--ds-green-600)]">
                  {data.trends?.recommendationClicks || '+0%'} this week
                </div>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--ds-gray-200)]">
          <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="h-3 w-3" />
            View Analytics
          </Button>
          
          {data.status !== 'setup_required' && (
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-3 w-3" />
              Configure
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}