/**
 * AI Services Configuration API Route
 * 
 * GET /api/ai-services/config - Get service configurations
 * POST /api/ai-services/config - Update service configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import type { 
  ServiceConfigResponse, 
  ServiceConfig, 
  UpdateServiceConfigRequest,
  UpdateServiceConfigResponse 
} from '@/types/ai-services';

export const dynamic = 'force-dynamic';

// In-memory storage for demo purposes
// TODO: Replace with database storage
const serviceConfigs: Map<string, ServiceConfig> = new Map([
  ['indigo-ai', {
    serviceId: 'indigo-ai',
    enabled: true,
    provider: (process.env.AI_PROVIDER as 'aws' | 'local') || 'local',
    quota: {
      limit: 2000,
      period: 'monthly'
    },
    settings: {
      defaultModel: 'claude-3-haiku',
      temperature: 0.7,
      maxTokens: 500
    }
  }],
  ['indigo-search', {
    serviceId: 'indigo-search',
    enabled: true,
    provider: (process.env.SEARCH_PROVIDER as 'aws' | 'local') || 'local',
    quota: {
      limit: 20000,
      period: 'monthly'
    },
    settings: {
      typoTolerance: true,
      maxResults: 50
    }
  }],
  ['indigo-recommendations', {
    serviceId: 'indigo-recommendations',
    enabled: true,
    provider: (process.env.RECOMMENDATION_PROVIDER as 'aws' | 'local') || 'local',
    quota: {
      limit: 10000,
      period: 'monthly'
    },
    settings: {
      minConfidence: 0.5,
      maxRecommendations: 10
    }
  }],
  ['indigo-insights', {
    serviceId: 'indigo-insights',
    enabled: true,
    provider: (process.env.FORECAST_PROVIDER as 'aws' | 'local') || 'local',
    quota: {
      limit: 1000,
      period: 'monthly'
    },
    settings: {
      forecastDays: 30,
      confidenceLevel: 0.95
    }
  }],
  ['indigo-content', {
    serviceId: 'indigo-content',
    enabled: true,
    provider: (process.env.AI_PROVIDER as 'aws' | 'local') || 'local',
    quota: {
      limit: 5000,
      period: 'monthly'
    },
    settings: {
      autoDetectLanguage: true,
      preserveFormatting: true
    }
  }],
  ['indigo-media', {
    serviceId: 'indigo-media',
    enabled: true,
    provider: (process.env.AI_PROVIDER as 'aws' | 'local') || 'local',
    quota: {
      limit: 1000,
      period: 'monthly'
    },
    settings: {
      minConfidence: 80,
      moderationEnabled: true
    }
  }]
]);

export async function GET() {
  try {
    const configs = Array.from(serviceConfigs.values());

    const response: ServiceConfigResponse = {
      success: true,
      configs
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching AI services config:', error);
    
    const response: ServiceConfigResponse = {
      success: false,
      configs: [],
      error: error instanceof Error ? error.message : 'Failed to fetch service configuration'
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateServiceConfigRequest = await request.json();

    // Validate request
    if (!body.serviceId) {
      const response: UpdateServiceConfigResponse = {
        success: false,
        error: 'Service ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if service exists
    const existingConfig = serviceConfigs.get(body.serviceId);
    if (!existingConfig) {
      const response: UpdateServiceConfigResponse = {
        success: false,
        error: `Service "${body.serviceId}" not found`
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update configuration
    const updatedConfig: ServiceConfig = {
      ...existingConfig,
      ...(body.enabled !== undefined && { enabled: body.enabled }),
      ...(body.quota && { quota: body.quota }),
      ...(body.settings && { settings: { ...existingConfig.settings, ...body.settings } })
    };

    serviceConfigs.set(body.serviceId, updatedConfig);

    const response: UpdateServiceConfigResponse = {
      success: true,
      config: updatedConfig
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating AI service config:', error);
    
    const response: UpdateServiceConfigResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service configuration'
    };

    return NextResponse.json(response, { status: 500 });
  }
}
