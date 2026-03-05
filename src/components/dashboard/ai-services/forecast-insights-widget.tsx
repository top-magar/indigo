'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Calendar,
  Brain,
  BarChart3
} from 'lucide-react'

interface ForecastInsight {
  id: string
  type: 'stock_out_warning' | 'reorder_suggestion' | 'overstock_alert' | 'seasonal_trend'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  productId?: string
  productName?: string
  actionLabel?: string
}

interface ForecastInsightsData {
  insights: ForecastInsight[]
}

function getPriorityColor(priority: ForecastInsight['priority']) {
  switch (priority) {
    case 'critical':
      return 'bg-destructive/10 text-destructive'
    case 'high':
      return 'bg-warning/10 text-warning'
    case 'medium':
      return 'bg-info/10 text-info'
    case 'low':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getInsightIcon(type: ForecastInsight['type']) {
  switch (type) {
    case 'stock_out_warning':
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    case 'reorder_suggestion':
      return <Package className="h-4 w-4 text-warning" />
    case 'seasonal_trend':
      return <Calendar className="h-4 w-4 text-success" />
    default:
      return <BarChart3 className="h-4 w-4 text-muted-foreground" />
  }
}

export function ForecastInsightsWidget() {
  const [data, setData] = useState<ForecastInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForecastInsights() {
      try {
        const response = await fetch('/api/inventory/forecast-insights')
        if (!response.ok) {
          throw new Error('Failed to fetch forecast insights')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights')
      } finally {
        setLoading(false)
      }
    }

    fetchForecastInsights()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-[-0.28px] text-foreground">
            Forecast Insights
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            AI-powered inventory predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-[-0.28px] text-foreground">
            Forecast Insights
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            AI-powered inventory predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-destructive">
              {error || 'Failed to load forecast insights'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const insights = data.insights || []
  const criticalInsights = insights.filter(i => i.priority === 'critical').length
  const highInsights = insights.filter(i => i.priority === 'high').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-[-0.28px] text-foreground">
              Forecast Insights
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-powered inventory predictions
            </CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-success" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <div className="mx-auto w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-medium text-foreground">
              All Good!
            </h3>
            <p className="text-sm text-muted-foreground">
              No critical inventory issues detected. Your stock levels look healthy.
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center gap-4 rounded-lg bg-muted p-3">
              <div className="text-center">
                <div className="stat-value text-destructive">
                  {criticalInsights}
                </div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="text-center">
                <div className="stat-value text-warning">
                  {highInsights}
                </div>
                <div className="text-xs text-muted-foreground">High Priority</div>
              </div>
              <div className="text-center">
                <div className="stat-value text-muted-foreground">
                  {insights.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Insights</div>
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div 
                  key={insight.id}
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
                >
                  <div className="mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground">
                        {insight.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getPriorityColor(insight.priority)}`}
                      >
                        {insight.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    
                    {insight.actionLabel && (
                      <Button size="sm"
                        variant="ghost" 
                        className="h-7 px-2 text-xs"
                      >
                        {insight.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View All Insights
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Brain className="h-3 w-3" />
            Upgrade to Canvas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}