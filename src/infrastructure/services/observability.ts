/**
 * Service Observability Layer
 * 
 * Provides comprehensive logging, metrics, and tracing for all service operations
 */

import { ErrorCategory } from './error-handler';

export interface ServiceMetrics {
  operationName: string;
  provider: string;
  duration: number;
  success: boolean;
  errorCategory?: ErrorCategory;
  tenantId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface ServiceLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  operationName: string;
  provider: string;
  context?: Record<string, unknown>;
  timestamp: number;
}

export class ServiceObservability {
  private static metrics: ServiceMetrics[] = [];
  private static logs: ServiceLog[] = [];
  private static maxStoredMetrics = 1000;
  private static maxStoredLogs = 1000;
  
  // Circuit breaker state
  private static circuitBreakers = new Map<string, {
    failures: number;
    lastFailureTime: number;
    state: 'closed' | 'open' | 'half-open';
  }>();
  private static readonly CIRCUIT_BREAKER_THRESHOLD = 5; // failures before opening
  private static readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 60 seconds
  private static readonly CIRCUIT_BREAKER_RESET_TIMEOUT = 30000; // 30 seconds

  /**
   * Record a service metric
   */
  static recordMetric(metric: ServiceMetrics): void {
    // Add timestamp if not provided
    const fullMetric = {
      ...metric,
      timestamp: metric.timestamp || Date.now(),
    };

    // Store metric
    this.metrics.push(fullMetric);
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics.shift();
    }

    // Log metric
    const status = fullMetric.success ? '✓' : '✗';
    const duration = `${fullMetric.duration}ms`;
    const error = fullMetric.errorCategory ? ` [${fullMetric.errorCategory}]` : '';
    
    console.log(
      `[${fullMetric.provider}] ${status} ${fullMetric.operationName} (${duration})${error}`,
      fullMetric.metadata || {}
    );

    // Send to external observability platform (DataDog, New Relic, etc.)
    // TODO: Implement external metrics export
    this.exportMetric(fullMetric);
  }

  /**
   * Track an operation with automatic metrics collection
   */
  static async trackOperation<T>(
    operationName: string,
    provider: string,
    operation: () => Promise<T>,
    context?: { tenantId?: string; userId?: string; metadata?: Record<string, unknown> }
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      
      this.recordMetric({
        operationName,
        provider,
        duration: Date.now() - startTime,
        success: true,
        tenantId: context?.tenantId,
        userId: context?.userId,
        metadata: context?.metadata,
        timestamp: startTime,
      });
      
      return result;
    } catch (error) {
      const errorCategory = this.categorizeError(error);
      
      this.recordMetric({
        operationName,
        provider,
        duration: Date.now() - startTime,
        success: false,
        errorCategory,
        tenantId: context?.tenantId,
        userId: context?.userId,
        metadata: {
          ...context?.metadata,
          error: error instanceof Error ? error.message : String(error),
        },
        timestamp: startTime,
      });
      
      throw error;
    }
  }

  /**
   * Log a service event
   */
  static log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    operationName: string,
    provider: string,
    context?: Record<string, unknown>
  ): void {
    const log: ServiceLog = {
      level,
      message,
      operationName,
      provider,
      context,
      timestamp: Date.now(),
    };

    // Store log
    this.logs.push(log);
    if (this.logs.length > this.maxStoredLogs) {
      this.logs.shift();
    }

    // Console log
    const logFn = console[level] || console.log;
    logFn(`[${provider}] ${message}`, context || {});

    // Send to external logging platform
    // TODO: Implement external log export
    this.exportLog(log);
  }

  /**
   * Get metrics for a specific operation
   */
  static getMetrics(filters?: {
    operationName?: string;
    provider?: string;
    tenantId?: string;
    startTime?: number;
    endTime?: number;
  }): ServiceMetrics[] {
    let filtered = this.metrics;

    if (filters?.operationName) {
      filtered = filtered.filter(m => m.operationName === filters.operationName);
    }
    if (filters?.provider) {
      filtered = filtered.filter(m => m.provider === filters.provider);
    }
    if (filters?.tenantId) {
      filtered = filtered.filter(m => m.tenantId === filters.tenantId);
    }
    if (filters?.startTime) {
      filtered = filtered.filter(m => m.timestamp >= filters.startTime!);
    }
    if (filters?.endTime) {
      filtered = filtered.filter(m => m.timestamp <= filters.endTime!);
    }

    return filtered;
  }

  /**
   * Get aggregated metrics
   */
  static getAggregatedMetrics(filters?: {
    operationName?: string;
    provider?: string;
    tenantId?: string;
    startTime?: number;
    endTime?: number;
  }): {
    totalOperations: number;
    successRate: number;
    averageDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    errorsByCategory: Record<ErrorCategory, number>;
  } {
    const metrics = this.getMetrics(filters);

    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        averageDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
        errorsByCategory: {} as Record<ErrorCategory, number>,
      };
    }

    const successCount = metrics.filter(m => m.success).length;
    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    
    const errorsByCategory = metrics
      .filter(m => !m.success && m.errorCategory)
      .reduce((acc, m) => {
        const category = m.errorCategory!;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<ErrorCategory, number>);

    return {
      totalOperations: metrics.length,
      successRate: (successCount / metrics.length) * 100,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50Duration: durations[Math.floor(durations.length * 0.5)],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)],
      errorsByCategory,
    };
  }

  /**
   * Clear stored metrics and logs
   */
  static clear(): void {
    this.metrics = [];
    this.logs = [];
  }

  /**
   * Circuit breaker wrapper for expensive operations
   * Prevents cascading failures by temporarily blocking requests after repeated failures
   */
  static async withCircuitBreaker<T>(
    operationKey: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const breaker = this.circuitBreakers.get(operationKey) || {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed' as const,
    };

    // Check if circuit is open
    if (breaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
      
      if (timeSinceLastFailure < this.CIRCUIT_BREAKER_TIMEOUT) {
        throw new Error(`Circuit breaker open for ${operationKey}. Try again later.`);
      }
      
      // Move to half-open state
      breaker.state = 'half-open';
      this.circuitBreakers.set(operationKey, breaker);
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (breaker.state === 'half-open' || breaker.failures > 0) {
        breaker.failures = 0;
        breaker.state = 'closed';
        this.circuitBreakers.set(operationKey, breaker);
      }
      
      return result;
    } catch (error) {
      // Failure - increment counter
      breaker.failures++;
      breaker.lastFailureTime = Date.now();
      
      if (breaker.failures >= this.CIRCUIT_BREAKER_THRESHOLD) {
        breaker.state = 'open';
        this.log(
          'warn',
          `Circuit breaker opened for ${operationKey} after ${breaker.failures} failures`,
          'circuit-breaker',
          'ServiceObservability'
        );
      }
      
      this.circuitBreakers.set(operationKey, breaker);
      throw error;
    }
  }

  /**
   * Get circuit breaker status
   */
  static getCircuitBreakerStatus(operationKey: string): {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    lastFailureTime: number;
  } | null {
    return this.circuitBreakers.get(operationKey) || null;
  }

  /**
   * Reset circuit breaker
   */
  static resetCircuitBreaker(operationKey: string): void {
    this.circuitBreakers.delete(operationKey);
  }

  /**
   * Export metric to external platform
   */
  private static exportMetric(metric: ServiceMetrics): void {
    // TODO: Implement export to DataDog, New Relic, CloudWatch, etc.
    // Example: datadog.increment('service.operation', 1, { provider: metric.provider });
  }

  /**
   * Export log to external platform
   */
  private static exportLog(log: ServiceLog): void {
    // TODO: Implement export to external logging platform
    // Example: winston.log(log.level, log.message, log.context);
  }

  /**
   * Categorize error for metrics
   */
  private static categorizeError(error: unknown): ErrorCategory {
    if (!error) return ErrorCategory.UNKNOWN;

    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const errorName = error instanceof Error ? error.name : '';

    if (errorName === 'ValidationException' || errorMessage.includes('validation')) {
      return ErrorCategory.VALIDATION;
    }
    if (errorName === 'UnauthorizedException' || errorMessage.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (errorName === 'AccessDeniedException' || errorMessage.includes('access denied')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (errorName === 'ResourceNotFoundException' || errorMessage.includes('not found')) {
      return ErrorCategory.NOT_FOUND;
    }
    if (errorName === 'ThrottlingException' || errorMessage.includes('throttl')) {
      return ErrorCategory.RATE_LIMIT;
    }
    if (errorName === 'TimeoutError' || errorMessage.includes('timeout')) {
      return ErrorCategory.TIMEOUT;
    }
    if (errorName === 'ServiceUnavailableException' || errorMessage.includes('service unavailable')) {
      return ErrorCategory.SERVICE_UNAVAILABLE;
    }
    if (errorMessage.includes('internal') || errorMessage.includes('500')) {
      return ErrorCategory.INTERNAL_ERROR;
    }

    return ErrorCategory.UNKNOWN;
  }
}
