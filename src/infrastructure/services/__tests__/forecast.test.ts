/**
 * Forecast Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ForecastService } from '../forecast';
import { ServiceFactory } from '../factory';
import { LocalForecastProvider } from '../providers/local-forecast';

describe('ForecastService', () => {
  beforeEach(() => {
    // Register local provider for testing
    ServiceFactory.registerForecastProvider('local', new LocalForecastProvider());
    process.env.FORECAST_PROVIDER = 'local';
  });

  describe('forecast', () => {
    it('should generate demand forecast successfully', async () => {
      const service = new ForecastService();
      const result = await service.forecast(
        '550e8400-e29b-41d4-a716-446655440000',
        30,
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(result.success).toBe(true);
      expect(result.predictions).toBeDefined();
      expect(Array.isArray(result.predictions)).toBe(true);
    });

    it('should validate product ID', async () => {
      const service = new ForecastService();
      const result = await service.forecast('', 30, '550e8400-e29b-41d4-a716-446655440001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Product ID');
    });

    it('should validate product ID format', async () => {
      const service = new ForecastService();
      const result = await service.forecast('invalid-uuid', 30, '550e8400-e29b-41d4-a716-446655440001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid product ID');
    });

    it('should validate days range', async () => {
      const service = new ForecastService();
      const result = await service.forecast(
        '550e8400-e29b-41d4-a716-446655440000',
        0,
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Days');
    });

    it('should validate maximum days', async () => {
      const service = new ForecastService();
      const result = await service.forecast(
        '550e8400-e29b-41d4-a716-446655440000',
        366,
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('365');
    });

    it('should validate tenant ID', async () => {
      const service = new ForecastService();
      const result = await service.forecast(
        '550e8400-e29b-41d4-a716-446655440000',
        30,
        ''
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant ID');
    });

    it('should generate forecast for different time periods', async () => {
      const service = new ForecastService();
      
      // 7 days
      const result7 = await service.forecast(
        '550e8400-e29b-41d4-a716-446655440000',
        7,
        '550e8400-e29b-41d4-a716-446655440001'
      );
      expect(result7.success).toBe(true);
      expect(result7.predictions?.length).toBe(7);

      // 90 days
      const result90 = await service.forecast(
        '550e8400-e29b-41d4-a716-446655440000',
        90,
        '550e8400-e29b-41d4-a716-446655440001'
      );
      expect(result90.success).toBe(true);
      expect(result90.predictions?.length).toBe(90);
    });
  });

  describe('calculateStockOutRisk', () => {
    it('should calculate stock-out risk successfully', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk(
        [
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            productName: 'Wireless Keyboard',
            currentStock: 10,
            leadTimeDays: 7,
          },
          {
            productId: '550e8400-e29b-41d4-a716-446655440001',
            productName: 'Wireless Mouse',
            currentStock: 50,
            leadTimeDays: 5,
          },
        ],
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(true);
      expect(result.risks).toBeDefined();
      expect(Array.isArray(result.risks)).toBe(true);
      expect(result.risks?.length).toBe(2);
    });

    it('should validate empty products array', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk([], '550e8400-e29b-41d4-a716-446655440002');

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should validate maximum products', async () => {
      const service = new ForecastService();
      const products = Array.from({ length: 1001 }, (_, i) => ({
        productId: `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, '0')}`,
        productName: `Product ${i}`,
        currentStock: 10,
      }));
      const result = await service.calculateStockOutRisk(products, '550e8400-e29b-41d4-a716-446655440002');

      expect(result.success).toBe(false);
      expect(result.error).toContain('1000');
    });

    it('should validate product ID', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk(
        [
          {
            productId: '',
            productName: 'Product',
            currentStock: 10,
          },
        ],
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('product ID');
    });

    it('should validate product ID format', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk(
        [
          {
            productId: 'invalid-uuid',
            productName: 'Product',
            currentStock: 10,
          },
        ],
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid product ID');
    });

    it('should validate product name', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk(
        [
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            productName: '',
            currentStock: 10,
          },
        ],
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('product name');
    });

    it('should validate current stock', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk(
        [
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            productName: 'Product',
            currentStock: -1,
          },
        ],
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('stock');
    });

    it('should validate lead time days', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk(
        [
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            productName: 'Product',
            currentStock: 10,
            leadTimeDays: 366,
          },
        ],
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Lead time');
    });

    it('should validate tenant ID', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk(
        [
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            productName: 'Product',
            currentStock: 10,
          },
        ],
        ''
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant ID');
    });

    it('should handle products without lead time', async () => {
      const service = new ForecastService();
      const result = await service.calculateStockOutRisk(
        [
          {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            productName: 'Product',
            currentStock: 10,
          },
        ],
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(result.success).toBe(true);
      expect(result.risks).toBeDefined();
    });
  });

  describe('getSeasonalTrends', () => {
    it('should get seasonal trends successfully', async () => {
      const service = new ForecastService();
      const result = await service.getSeasonalTrends(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(result.success).toBe(true);
      expect(result.trends).toBeDefined();
      expect(Array.isArray(result.trends)).toBe(true);
    });

    it('should validate category ID', async () => {
      const service = new ForecastService();
      const result = await service.getSeasonalTrends('', '550e8400-e29b-41d4-a716-446655440001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Category ID');
    });

    it('should validate category ID format', async () => {
      const service = new ForecastService();
      const result = await service.getSeasonalTrends('invalid-uuid', '550e8400-e29b-41d4-a716-446655440001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid category ID');
    });

    it('should validate tenant ID', async () => {
      const service = new ForecastService();
      const result = await service.getSeasonalTrends(
        '550e8400-e29b-41d4-a716-446655440000',
        ''
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant ID');
    });

    it('should return trends with month and multiplier', async () => {
      const service = new ForecastService();
      const result = await service.getSeasonalTrends(
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001'
      );

      expect(result.success).toBe(true);
      if (result.trends && result.trends.length > 0) {
        const trend = result.trends[0];
        expect(trend).toHaveProperty('period');
        expect(trend).toHaveProperty('averageDemand');
        expect(trend).toHaveProperty('peakDemand');
        expect(trend).toHaveProperty('lowDemand');
        expect(typeof trend.period).toBe('string');
        expect(typeof trend.averageDemand).toBe('number');
        expect(typeof trend.peakDemand).toBe('number');
        expect(typeof trend.lowDemand).toBe('number');
      }
    });
  });

  describe('getProviderName', () => {
    it('should return provider name', () => {
      const service = new ForecastService();
      const providerName = service.getProviderName();

      expect(providerName).toBe('LocalForecastProvider');
    });
  });
});
