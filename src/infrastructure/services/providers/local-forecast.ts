/**
 * Local Forecast Provider
 * 
 * Mock forecast provider for local development and testing
 * Uses simple algorithms for demand forecasting
 */

import type { ForecastProvider, ForecastResult, StockOutRisk, SeasonalTrend } from './types';

export class LocalForecastProvider implements ForecastProvider {
  /**
   * Generate demand forecast using simple moving average and trend analysis
   */
  async forecast(productId: string, days: number, tenantId: string): Promise<ForecastResult> {
    // Generate mock historical data (last 90 days)
    const historicalData = this.generateMockHistoricalData(90);

    // Calculate trend
    const trend = this.calculateTrend(historicalData);

    // Calculate moving average
    const movingAverage = this.calculateMovingAverage(historicalData, 7);
    const recentAverage = movingAverage[movingAverage.length - 1] || 10;

    // Detect seasonality
    const seasonalFactors = this.detectSeasonality(historicalData);

    // Generate forecast
    const predictions: Array<{
      date: string;
      value: number;
      confidence?: { lower: number; upper: number };
    }> = [];

    const startDate = new Date();

    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(startDate);
      forecastDate.setDate(forecastDate.getDate() + i);

      // Apply seasonal factor
      const month = forecastDate.getMonth();
      const seasonalFactor = seasonalFactors[month] || 1.0;

      // Base forecast with trend
      const baseForecast = recentAverage + (trend.slope * i);
      const seasonalForecast = baseForecast * seasonalFactor;

      // Add uncertainty bands (±20% for confidence intervals)
      const value = Math.max(0, Math.round(seasonalForecast));
      const lower = Math.max(0, Math.round(value * 0.8));
      const upper = Math.round(value * 1.2);

      predictions.push({
        date: forecastDate.toISOString().split('T')[0],
        value,
        confidence: { lower, upper },
      });
    }

    console.log(`[LocalForecastProvider] Generated ${days}-day forecast for product: ${productId}`);

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
    const risks: StockOutRisk[] = [];

    for (const product of products) {
      // Generate forecast for the product
      const forecastResult = await this.forecast(product.productId, 30, tenantId);

      if (!forecastResult.success || !forecastResult.predictions) {
        // If forecast fails, use simple estimation
        risks.push({
          productId: product.productId,
          productName: product.productName,
          currentStock: product.currentStock,
          riskLevel: product.currentStock <= 0 ? 'critical' : 'low',
          riskScore: product.currentStock <= 0 ? 1.0 : 0.25,
          daysUntilStockOut: product.currentStock > 0 ? 999 : 0,
        });
        continue;
      }

      // Calculate average daily demand from forecast
      const totalDemand = forecastResult.predictions.reduce((sum, p) => sum + p.value, 0);
      const averageDailyDemand = totalDemand / forecastResult.predictions.length;

      // Calculate days until stock-out
      let cumulativeDemand = 0;
      let daysUntilStockOut = 30;

      for (let i = 0; i < forecastResult.predictions.length; i++) {
        cumulativeDemand += forecastResult.predictions[i].value;
        if (cumulativeDemand >= product.currentStock) {
          daysUntilStockOut = i + 1;
          break;
        }
      }

      // Determine risk level
      const leadTime = product.leadTimeDays || 7;
      let riskLevel: StockOutRisk['riskLevel'];
      let riskScore: number;

      if (daysUntilStockOut <= leadTime) {
        riskLevel = 'critical';
        riskScore = 1.0;
      } else if (daysUntilStockOut <= leadTime * 2) {
        riskLevel = 'high';
        riskScore = 0.75;
      } else if (daysUntilStockOut <= leadTime * 3) {
        riskLevel = 'medium';
        riskScore = 0.5;
      } else {
        riskLevel = 'low';
        riskScore = 0.25;
      }

      // Calculate recommended reorder quantity
      const safetyStock = Math.ceil(averageDailyDemand * leadTime * 1.5);
      const recommendedReorderQuantity = Math.ceil(averageDailyDemand * 30) + safetyStock;

      risks.push({
        productId: product.productId,
        productName: product.productName,
        currentStock: product.currentStock,
        riskLevel,
        riskScore,
        daysUntilStockOut,
        recommendedReorderQuantity,
      });
    }

    // Sort by risk level (critical first)
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    risks.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

    console.log(`[LocalForecastProvider] Calculated stock-out risk for ${products.length} products`);

    return risks;
  }

  /**
   * Get seasonal trends (returns typical e-commerce pattern)
   */
  async getSeasonalTrends(categoryId: string, tenantId: string): Promise<SeasonalTrend[]> {
    // Typical e-commerce seasonal pattern
    const monthlyPatterns = [
      { month: 1, name: 'January', factor: 0.8 },
      { month: 2, name: 'February', factor: 0.75 },
      { month: 3, name: 'March', factor: 0.85 },
      { month: 4, name: 'April', factor: 0.9 },
      { month: 5, name: 'May', factor: 0.95 },
      { month: 6, name: 'June', factor: 0.9 },
      { month: 7, name: 'July', factor: 0.85 },
      { month: 8, name: 'August', factor: 0.9 },
      { month: 9, name: 'September', factor: 1.0 },
      { month: 10, name: 'October', factor: 1.1 },
      { month: 11, name: 'November', factor: 1.4 },
      { month: 12, name: 'December', factor: 1.5 },
    ];

    const baselineDemand = 100; // Baseline units per month

    const trends: SeasonalTrend[] = monthlyPatterns.map(pattern => ({
      period: pattern.name,
      averageDemand: Math.round(baselineDemand * pattern.factor),
      peakDemand: Math.round(baselineDemand * pattern.factor * 1.3),
      lowDemand: Math.round(baselineDemand * pattern.factor * 0.7),
    }));

    console.log(`[LocalForecastProvider] Generated seasonal trends for category: ${categoryId}`);

    return trends;
  }

  /**
   * Generate mock historical sales data
   */
  private generateMockHistoricalData(days: number): number[] {
    const data: number[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      // Simulate seasonal patterns and random variation
      const seasonalFactor = 1 + 0.3 * Math.sin((i / 365) * 2 * Math.PI);
      const weeklyFactor = date.getDay() === 0 || date.getDay() === 6 ? 1.2 : 1.0; // Weekend boost
      const randomFactor = 0.8 + Math.random() * 0.4; // ±20% variation

      const baseQuantity = 10; // Base daily sales
      const quantity = Math.round(baseQuantity * seasonalFactor * weeklyFactor * randomFactor);

      data.push(quantity);
    }

    return data;
  }

  /**
   * Calculate simple moving average
   */
  private calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = data.slice(start, i + 1);
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      result.push(average);
    }
    return result;
  }

  /**
   * Calculate linear trend
   */
  private calculateTrend(data: number[]): { slope: number; intercept: number } {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: data[0] || 0 };

    const xSum = (n * (n - 1)) / 2; // Sum of 0, 1, 2, ..., n-1
    const ySum = data.reduce((sum, val) => sum + val, 0);
    const xySum = data.reduce((sum, val, i) => sum + val * i, 0);
    const xxSum = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    return { slope, intercept };
  }

  /**
   * Detect seasonal patterns (simplified)
   */
  private detectSeasonality(data: number[]): Record<number, number> {
    // For mock data, return typical e-commerce pattern
    return {
      0: 0.8,   // January
      1: 0.75,  // February
      2: 0.85,  // March
      3: 0.9,   // April
      4: 0.95,  // May
      5: 0.9,   // June
      6: 0.85,  // July
      7: 0.9,   // August
      8: 1.0,   // September
      9: 1.1,   // October
      10: 1.4,  // November
      11: 1.5,  // December
    };
  }
}
