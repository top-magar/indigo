/**
 * AI Services Types
 * 
 * Type definitions for AI services status and configuration
 */

export interface ServiceInfo {
  id: string
  name: string
  description: string
  status: 'active' | 'setup_required' | 'processing' | 'disabled' | 'error'
  provider: 'aws' | 'local'
  available: boolean
  features: string[]
  poweredBy?: string
  error?: string
}

export interface ServiceStatusResponse {
  success: boolean
  services: ServiceInfo[]
  error?: string
}

export interface ServiceUsageStats {
  serviceId: string
  serviceName?: string
  current?: number
  limit?: number
  percentage?: number
  unit?: string
  totalRequests?: number
  successfulRequests?: number
  failedRequests?: number
  averageResponseTime?: number
  lastUsed?: string
}

export interface ServiceConfigResponse {
  success: boolean
  config: ServiceConfig
  error?: string
}

export interface ServiceConfig {
  serviceId: string
  enabled: boolean
  provider: 'aws' | 'local'
  quota?: {
    limit: number
    period: 'daily' | 'monthly'
  }
  quotas?: {
    daily?: number
    monthly?: number
  }
  settings?: Record<string, unknown>
}

export interface UpdateServiceConfigRequest {
  serviceId: string
  enabled?: boolean
  quota?: {
    limit: number
    period: 'daily' | 'monthly'
  }
  settings?: Record<string, unknown>
}

export interface UpdateServiceConfigResponse {
  success: boolean
  config?: ServiceConfig
  error?: string
}

export interface ServiceConfigListResponse {
  success: boolean
  configs: ServiceConfig[]
  error?: string
}


export interface ServiceUsageResponse {
  success: boolean
  usage: ServiceUsageStats[]
  period?: {
    start: string
    end: string
  }
  error?: string
}
