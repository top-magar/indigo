/**
 * AWS Forecast Provider
 * 
 * ⚠️ DEPRECATION NOTICE: AWS Forecast is no longer available to new customers (as of July 29, 2024)
 * 
 * This provider implements ForecastProvider interface with automatic fallback:
 * 1. SageMaker Canvas (RECOMMENDED) - Professional ML forecasting for new customers
 * 2. AWS Forecast (LEGACY) - Only for existing customers with active Forecast resources
 * 3. Local algorithms (FALLBACK) - Free alternative for development/testing
 * 
 * Environment Variables:
 * - AWS_SAGEMAKER_CANVAS_ENABLED=true - Enable Canvas (recommended for production)
 * - AWS_FORECAST_ENABLED=true - Enable legacy Forecast (existing customers only)
 * - If neither is enabled, falls back to local algorithms
 * 
 * Migration Recommendation:
 * - New deployments: Use SageMaker Canvas
 * - Existing Forecast users: Plan migration to Canvas within 12 months
 * - Development: Use local provider (FORECAST_PROVIDER=local)
 * 
 * Wraps existing forecast implementation from src/infrastructure/aws/forecast.ts
 * which automatically prioritizes Canvas over legacy Forecast.
 */

import type { ForecastProvider, ForecastResult, StockOutRisk, SeasonalTrend } from './types';
import {
  queryDemandForecast,
  calculateStockOutRisk as calculateAWSStockOutRisk,
  getSeasonalTrends as getAWSSeasonalTrends,
  type HistoricalSalesData,
} from '@/infrastructure/aws/forecast';

export class AWSForecastProvider implements ForecastProvider {
  /**
   * Generate demand forecast for a product
   */
  async forecast(productId: string, days: number, tenantId: string): Promise<ForecastResult> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const result = await queryDemandForecast(productId, {
      endDate: endDate.toISOString().split('T')[0],
    });

    if (!result.success || !result.forecast) {
      return {
        success: false,
        error: result.error || 'Failed to generate forecast',
      };
    }

    // Convert forecast format
    const predictions = result.forecast.forecasts.map(point => ({
      date: point.timestamp,
      value: point.value,
      confidence: point.p10 && point.p90 ? {
        lower: point.p10,
        upper: point.p90,
      } : undefined,
    }));

    return {
      success: true,
      predictions,
    };
  }

  /**
   * Calculate stock-out risk for products
   */
  async calculateStockOutRisk(
    products: Array<{
      productId: string;
      productName: string;
      currentStock: number;
      leadTimeDays?: number;
    }>,
    tenantId: string
  ): Promise<StockOutRisk[]> {
    // Convert to AWS forecast format
    const awsProducts = products.map(p => ({
      productId: p.productId,
      productName: p.productName,
      currentStock: p.currentStock,
      leadTimeDays: p.leadTimeDays,
    }));

    const result = await calculateAWSStockOutRisk(awsProducts);

    if (!result.success || !result.risks) {
      throw new Error('Failed to calculate stock-out risk');
    }

    // Convert AWS format to provider format
    return result.risks.map(risk => ({
      productId: risk.productId,
      productName: risk.productName || '',
      currentStock: risk.currentStock,
      // Map 'critical' to 'high' since StockOutRisk only supports low/medium/high
      riskLevel: risk.riskLevel === 'critical' ? 'high' : risk.riskLevel as 'low' | 'medium' | 'high',
      riskScore: this.mapRiskLevelToScore(risk.riskLevel),
      daysUntilStockOut: risk.predictedDaysUntilStockOut,
      recommendedReorderQuantity: risk.recommendedReorderQuantity,
    }));
  }

  /**
   * Get seasonal trends for a category
   */
  async getSeasonalTrends(categoryId: string, tenantId: string): Promise<SeasonalTrend[]> {
    const result = await getAWSSeasonalTrends(categoryId);

    if (!result.success || !result.trends) {
      throw new Error('Failed to get seasonal trends');
    }

    // Convert AWS format to provider format
    return result.trends.map(trend => ({
      period: trend.monthName,
      averageDemand: trend.demandIndex,
      peakDemand: trend.isHighSeason ? trend.demandIndex * 1.2 : trend.demandIndex,
      lowDemand: trend.demandIndex * 0.8,
    }));
  }

  /**
   * Map risk level to numeric score
   */
  private mapRiskLevelToScore(riskLevel: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (riskLevel) {
      case 'low':
        return 0.25;
      case 'medium':
        return 0.5;
      case 'high':
        return 0.75;
      case 'critical':
        return 1.0;
      default:
        return 0.5;
    }
  }
}
