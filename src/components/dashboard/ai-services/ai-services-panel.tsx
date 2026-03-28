'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Search, 
  Sparkles, 
  Settings, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Bot,
  Cpu,
  BarChart3,
  RefreshCw,
  Loader2,
  TrendingUp,
  Zap,
  Play
} from 'lucide-react'
import type { ServiceInfo } from '@/types/ai-services'

interface IndigoService extends ServiceInfo {
  icon: React.ComponentType<{ className?: string }>
  actionLabel?: string
  actionUrl?: string
}

// Icon mapping for services
const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'indigo-ai': Sparkles,
  'indigo-search': Search,
  'indigo-recommendations': Brain,
  'indigo-insights': BarChart3,
  'indigo-content': Bot,
  'indigo-media': Cpu
}

// Map ServiceInfo to IndigoService with icons and action URLs
function mapServiceToIndigoService(service: ServiceInfo): IndigoService {
  const actionUrls: Record<string, string> = {
    'indigo-ai': '/dashboard/products?action=generate',
    'indigo-search': '/dashboard/products?view=search-analytics',
    'indigo-recommendations': '/dashboard/analytics/recommendations',
    'indigo-insights': '/dashboard/analytics/insights',
    'indigo-content': '/dashboard/products?action=translate',
    'indigo-media': '/dashboard/media?action=analyze'
  }

  const actionLabels: Record<string, string> = {
    'indigo-ai': 'Generate Content',
    'indigo-search': 'View Analytics',
    'indigo-recommendations': 'View Recommendations',
    'indigo-insights': 'View Insights',
    'indigo-content': 'Translate Content',
    'indigo-media': 'Analyze Images'
  }

  return {
    ...service,
    icon: SERVICE_ICONS[service.id] || Cpu,
    actionLabel: service.status === 'active' ? actionLabels[service.id] : 'Configure',
    actionUrl: service.status === 'active' ? actionUrls[service.id] : '/dashboard/settings/ai-services'
  }
}

function getStatusColor(status: ServiceInfo['status']) {
  switch (status) {
    case 'active':
      return 'bg-success/10 text-success'
    case 'processing':
      return 'bg-info/10 text-info'
    case 'setup_required':
      return 'bg-warning/10 text-warning'
    case 'disabled':
      return 'bg-muted text-muted-foreground'
    case 'error':
      return 'bg-destructive/10 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getStatusIcon(status: ServiceInfo['status']) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />
    case 'processing':
      return <Clock className="h-4 w-4" />
    case 'setup_required':
      return <AlertCircle className="h-4 w-4" />
    case 'disabled':
      return <Settings className="h-4 w-4" />
    case 'error':
      return <AlertCircle className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

function getStatusLabel(status: ServiceInfo['status']) {
  switch (status) {
    case 'active':
      return 'Active'
    case 'processing':
      return 'Processing'
    case 'setup_required':
      return 'Setup Required'
    case 'disabled':
      return 'Disabled'
    case 'error':
      return 'Error'
    default:
      return 'Unknown'
  }
}

export function AIServicesPanel() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [services, setServices] = useState<IndigoService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch services from API
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/ai-services/status')
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch services')
        }

        // Map ServiceInfo to IndigoService with icons and URLs
        const mappedServices = data.services.map(mapServiceToIndigoService)
        setServices(mappedServices)
      } catch (err) {
        console.error('Failed to fetch AI services:', err)
        setError(err instanceof Error ? err.message : 'Failed to load services')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const activeServices = services.filter(s => s.status === 'active').length
  const totalServices = services.length

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading AI services...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Failed to load services</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-[-0.28px] text-foreground">
            Indigo AI Services
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            AI-powered features to enhance your e-commerce platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {activeServices} of {totalServices} services active
              </p>
              <Progress 
                value={totalServices > 0 ? (activeServices / totalServices) * 100 : 0} 
                className="w-48"
              />
            </div>
            <Button size="sm"
              variant="outline"
              className="gap-2"
              asChild
            >
              <Link href="/dashboard/settings/ai-services">
                <Settings className="h-4 w-4" />
                Manage Services
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon
          const isSelected = selectedService === service.id

          return (
            <Card 
              key={service.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary/70 border-info/20' 
                  : 'hover:border-border'
              }`}
              onClick={() => setSelectedService(isSelected ? null : service.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-ds-teal-700/10">
                      <Icon className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-foreground">
                        {service.name}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`mt-1 gap-1 ${getStatusColor(service.status)}`}
                      >
                        {getStatusIcon(service.status)}
                        {getStatusLabel(service.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features */}
                {isSelected && (
                  <div className="mb-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        Features
                      </h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, index) => (
                          <li 
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Usage Stats (Mock data for now) */}
                    {service.status === 'active' && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">This month</span>
                          <span className="font-medium text-foreground">
                            {Math.floor(Math.random() * 1000) + 100} uses
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-success">
                          <TrendingUp className="h-3 w-3" />
                          <span>+{Math.floor(Math.random() * 30) + 10}% from last month</span>
                        </div>
                      </div>
                    )}

                    {service.poweredBy && (
                      <p className="text-xs text-muted-foreground pt-2 border-t">
                        Powered by {service.poweredBy}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {service.actionLabel && service.actionUrl && (
                    <Link href={service.actionUrl} className="flex-1">
                      <Button size="sm"
                        variant={service.status === 'active' ? 'default' : 'outline'}
                        className="w-full gap-2"
                      >
                        {service.status === 'active' ? (
                          <>
                            <Play className="h-3 w-3" />
                            {service.actionLabel}
                          </>
                        ) : (
                          <>
                            <Settings className="h-3 w-3" />
                            Configure
                          </>
                        )}
                      </Button>
                    </Link>
                  )}
                  {service.status === 'active' && (
                    <Link href="/dashboard/settings/ai-services">
                      <Button size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-foreground">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Jump directly to AI-powered features
              </CardDescription>
            </div>
            <Link href="/dashboard/settings/ai-services">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/products?action=generate">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 hover:bg-muted">
                <Sparkles className="h-4 w-4 text-info" />
                <span>Generate Content</span>
                <Zap className="h-3 w-3 ml-auto text-warning" />
              </Button>
            </Link>
            <Link href="/dashboard/analytics/recommendations">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 hover:bg-muted">
                <Brain className="h-4 w-4 text-ds-teal-700" />
                <span>View Recommendations</span>
              </Button>
            </Link>
            <Link href="/dashboard/analytics/insights">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 hover:bg-muted">
                <BarChart3 className="h-4 w-4 text-success" />
                <span>View Forecasts</span>
              </Button>
            </Link>
            <Link href="/dashboard/products?view=search-analytics">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 hover:bg-muted">
                <Search className="h-4 w-4 text-ds-blue-700" />
                <span>Search Analytics</span>
              </Button>
            </Link>
            <Link href="/dashboard/products?action=translate">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 hover:bg-muted">
                <Bot className="h-4 w-4 text-violet-400" />
                <span>Translate Content</span>
              </Button>
            </Link>
            <Link href="/dashboard/media?action=analyze">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 hover:bg-muted">
                <Cpu className="h-4 w-4 text-ds-purple-700" />
                <span>Analyze Images</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
