/**
 * Forecast Service
 * 
 * Unified forecasting interface with automatic provider selection,
 * error handling, retry logic, and observability
 */

import { ServiceFactory } from './factory';
import { ServiceErrorHandler } from './error-handler';
import { ServiceObservability } from './observability';
import { ServiceValidator } from './validation';
import type { ForecastProvider, ForecastResult, StockOutRisk, SeasonalTrend } from './providers/types';

export class ForecastService {
  private provider: ForecastProvider;

  constructor() {
    this.provider = ServiceFactory.getForecastProvider();
  }

  /**
   * Generate demand forecast with validation, retry, and observability
   */
  async forecast(
    productId: string,
    days: number,
    tenantId: string
  ): Promise<ForecastResult> {
    // Validate product ID
    if (!productId || typeof productId !== 'string') {
      return { success: false, error: 'Product ID is required' };
    }

    const productIdValidation = ServiceValidator.validateUUID(productId);
    if (!productIdValidation.valid) {
      return { success: false, error: `Invalid product ID: ${productIdValidation.error}` };
    }

    // Validate days
    if (typeof days !== 'number' || days < 1 || days > 365) {
      return { success: false, error: 'Days must be between 1 and 365' };
    }

    // Validate tenant ID
    if (!tenantId || typeof tenantId !== 'string') {
      return { success: false, error: 'Tenant ID is required' };
    }

    const tenantValidation = ServiceValidator.validateTenantId(tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'forecast',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.forecast(productId, days, tenantId),
          {
            maxRetries: 2,
            backoffMs: 500,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Forecast retry attempt ${attempt}`,
                'forecast',
                this.provider.constructor.name,
                { error: error.message, productId, days }
              );
            },
          }
        ),
        {
          metadata: {
            productId,
            days,
            tenantId,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Forecast failed after retries',
        'forecast',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate forecast',
      };
    }
  }

  /**
   * Calculate stock-out risk with validation, retry, and observability
   */
  async calculateStockOutRisk(
    products: Array<{
      productId: string;
      productName: string;
      currentStock: number;
      leadTimeDays?: number;
    }>,
    tenantId: string
  ): Promise<{ success: boolean; risks?: StockOutRisk[]; error?: string }> {
    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return { success: false, error: 'Products array is required and cannot be empty' };
    }

    if (products.length > 1000) {
      return { success: false, error: 'Cannot analyze more than 1000 products at once' };
    }

    // Validate each product
    for (const product of products) {
      if (!product.productId || typeof product.productId !== 'string') {
        return { success: false, error: 'All products must have a valid product ID' };
      }

      const productIdValidation = ServiceValidator.validateUUID(product.productId);
      if (!productIdValidation.valid) {
        return { success: false, error: `Invalid product ID: ${productIdValidation.error}` };
      }

      if (!product.productName || typeof product.productName !== 'string') {
        return { success: false, error: 'All products must have a product name' };
      }

      if (typeof product.currentStock !== 'number' || product.currentStock < 0) {
        return { success: false, error: 'Current stock must be a non-negative number' };
      }

      if (product.leadTimeDays !== undefined && (product.leadTimeDays < 0 || product.leadTimeDays > 365)) {
        return { success: false, error: 'Lead time days must be between 0 and 365' };
      }
    }

    // Validate tenant ID
    if (!tenantId || typeof tenantId !== 'string') {
      return { success: false, error: 'Tenant ID is required' };
    }

    const tenantValidation = ServiceValidator.validateTenantId(tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
    }

    // Track and execute with retry
    try {
      const risks = await ServiceObservability.trackOperation(
        'calculateStockOutRisk',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.calculateStockOutRisk(products, tenantId),
          {
            maxRetries: 2,
            backoffMs: 500,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Calculate stock-out risk retry attempt ${attempt}`,
                'calculateStockOutRisk',
                this.provider.constructor.name,
                { error: error.message, productCount: products.length }
              );
            },
          }
        ),
        {
          metadata: {
            productCount: products.length,
            tenantId,
          },
        }
      );

      return { success: true, risks };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Calculate stock-out risk failed after retries',
        'calculateStockOutRisk',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate stock-out risk',
      };
    }
  }

  /**
   * Get seasonal trends with validation, retry, and observability
   */
  async getSeasonalTrends(
    categoryId: string,
    tenantId: string
  ): Promise<{ success: boolean; trends?: SeasonalTrend[]; error?: string }> {
    // Validate category ID
    if (!categoryId || typeof categoryId !== 'string') {
      return { success: false, error: 'Category ID is required' };
    }

    const categoryIdValidation = ServiceValidator.validateUUID(categoryId);
    if (!categoryIdValidation.valid) {
      return { success: false, error: `Invalid category ID: ${categoryIdValidation.error}` };
    }

    // Validate tenant ID
    if (!tenantId || typeof tenantId !== 'string') {
      return { success: false, error: 'Tenant ID is required' };
    }

    const tenantValidation = ServiceValidator.validateTenantId(tenantId);
    if (!tenantValidation.valid) {
      return { success: false, error: `Invalid tenant ID: ${tenantValidation.error}` };
    }

    // Track and execute with retry
    try {
      const trends = await ServiceObservability.trackOperation(
        'getSeasonalTrends',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.getSeasonalTrends(categoryId, tenantId),
          {
            maxRetries: 2,
            backoffMs: 300,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Get seasonal trends retry attempt ${attempt}`,
                'getSeasonalTrends',
                this.provider.constructor.name,
                { error: error.message, categoryId }
              );
            },
          }
        ),
        {
          metadata: {
            categoryId,
            tenantId,
          },
        }
      );

      return { success: true, trends };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Get seasonal trends failed after retries',
        'getSeasonalTrends',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get seasonal trends',
      };
    }
  }

  /**
   * Get the current provider name
   */
  getProviderName(): string {
    return this.provider.constructor.name;
  }
}
