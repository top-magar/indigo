/**
 * AI Services Status API Route
 * 
 * GET /api/ai-services/status
 * Returns real-time status of all AI services
 */

import { NextResponse } from 'next/server';
import type { ServiceStatusResponse, ServiceInfo } from '@/types/ai-services';
import { initializeServiceProviders, isInitialized } from '@/infrastructure/services/init';

export async function GET() {
  try {
    // Ensure providers are initialized
    if (!isInitialized()) {
      await initializeServiceProviders();
    }

    const services: ServiceInfo[] = [];

    // Check AI Service (Content Generation)
    try {
      // Dynamically import to avoid initialization issues with Cache Components
      const { AIService } = await import('@/infrastructure/services');
      const aiService = new AIService();
      const providerName = aiService.getProviderName();
      const isAWS = providerName.includes('AWS');
      
      services.push({
        id: 'indigo-ai',
        name: 'Indigo AI',
        description: 'AI-powered content generation for products and marketing',
        status: 'active',
        provider: isAWS ? 'aws' : 'local',
        available: true,
        features: [
          'Product descriptions',
          'Marketing copy',
          'SEO optimization',
          'Multi-language content'
        ],
        poweredBy: isAWS ? 'AWS Bedrock' : 'Local Mock'
      });
    } catch (error) {
      services.push({
        id: 'indigo-ai',
        name: 'Indigo AI',
        description: 'AI-powered content generation for products and marketing',
        status: 'error',
        provider: 'local',
        available: false,
        error: error instanceof Error ? error.message : 'Service unavailable',
        features: [
          'Product descriptions',
          'Marketing copy',
          'SEO optimization',
          'Multi-language content'
        ]
      });
    }

    // Check Search Service
    try {
      const { SearchService } = await import('@/infrastructure/services');
      const searchService = new SearchService();
      const providerName = searchService.getProviderName();
      const isAWS = providerName.includes('AWS');
      
      services.push({
        id: 'indigo-search',
        name: 'Indigo Search',
        description: 'Intelligent product search with autocomplete and filtering',
        status: 'active',
        provider: isAWS ? 'aws' : 'local',
        available: true,
        features: [
          'Full-text search with typo tolerance',
          'Autocomplete suggestions',
          'Faceted filtering',
          'Search analytics'
        ],
        poweredBy: isAWS ? 'AWS OpenSearch' : 'Local Database'
      });
    } catch (error) {
      services.push({
        id: 'indigo-search',
        name: 'Indigo Search',
        description: 'Intelligent product search with autocomplete and filtering',
        status: 'error',
        provider: 'local',
        available: false,
        error: error instanceof Error ? error.message : 'Service unavailable',
        features: [
          'Full-text search with typo tolerance',
          'Autocomplete suggestions',
          'Faceted filtering',
          'Search analytics'
        ]
      });
    }

    // Check Recommendation Service
    try {
      const { RecommendationService } = await import('@/infrastructure/services');
      const recommendationService = new RecommendationService();
      const providerName = recommendationService.getProviderName();
      const isAWS = providerName.includes('AWS');
      
      services.push({
        id: 'indigo-recommendations',
        name: 'Indigo Recommendations',
        description: 'Personalized product recommendations based on user behavior',
        status: 'active',
        provider: isAWS ? 'aws' : 'local',
        available: true,
        features: [
          'Personalized product recommendations',
          'Similar items suggestions',
          'User behavior tracking',
          'Real-time recommendations'
        ],
        poweredBy: isAWS ? 'AWS Personalize' : 'Local Collaborative Filtering'
      });
    } catch (error) {
      services.push({
        id: 'indigo-recommendations',
        name: 'Indigo Recommendations',
        description: 'Personalized product recommendations based on user behavior',
        status: 'error',
        provider: 'local',
        available: false,
        error: error instanceof Error ? error.message : 'Service unavailable',
        features: [
          'Personalized product recommendations',
          'Similar items suggestions',
          'User behavior tracking',
          'Real-time recommendations'
        ]
      });
    }

    // Check Forecast Service (Insights)
    try {
      const { ForecastService } = await import('@/infrastructure/services');
      const forecastService = new ForecastService();
      const providerName = forecastService.getProviderName();
      const isAWS = providerName.includes('AWS');
      
      services.push({
        id: 'indigo-insights',
        name: 'Indigo Insights',
        description: 'AI analytics, sentiment analysis, and demand forecasting',
        status: 'active',
        provider: isAWS ? 'aws' : 'local',
        available: true,
        features: [
          'Review sentiment analysis',
          'Demand forecasting',
          'Stock-out predictions',
          'Seasonal trend analysis'
        ],
        poweredBy: isAWS ? 'AWS Comprehend + SageMaker' : 'Local Statistical Models'
      });
    } catch (error) {
      services.push({
        id: 'indigo-insights',
        name: 'Indigo Insights',
        description: 'AI analytics, sentiment analysis, and demand forecasting',
        status: 'error',
        provider: 'local',
        available: false,
        error: error instanceof Error ? error.message : 'Service unavailable',
        features: [
          'Review sentiment analysis',
          'Demand forecasting',
          'Stock-out predictions',
          'Seasonal trend analysis'
        ]
      });
    }

    // Add Content (Translation) Service
    services.push({
      id: 'indigo-content',
      name: 'Indigo Content',
      description: 'Translation and localization for global commerce',
      status: 'active',
      provider: process.env.AI_PROVIDER === 'aws' ? 'aws' : 'local',
      available: true,
      features: [
        'Content translation',
        'Language detection',
        'SEO meta generation',
        'Keyword suggestions'
      ],
      poweredBy: process.env.AI_PROVIDER === 'aws' ? 'AWS Translate + Bedrock' : 'Local Mock'
    });

    // Add Media (Image Analysis) Service
    services.push({
      id: 'indigo-media',
      name: 'Indigo Media',
      description: 'Image analysis, moderation, and auto-tagging',
      status: 'active',
      provider: process.env.AI_PROVIDER === 'aws' ? 'aws' : 'local',
      available: true,
      features: [
        'Content moderation',
        'Auto-tagging from images',
        'Text extraction (OCR)',
        'Image validation'
      ],
      poweredBy: process.env.AI_PROVIDER === 'aws' ? 'AWS Rekognition' : 'Local Mock'
    });

    const response: ServiceStatusResponse = {
      success: true,
      services
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching AI services status:', error);
    
    const response: ServiceStatusResponse = {
      success: false,
      services: [],
      error: error instanceof Error ? error.message : 'Failed to fetch service status'
    };

    return NextResponse.json(response, { status: 500 });
  }
}
