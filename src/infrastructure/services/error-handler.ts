/**
 * Unified Error Handling & Retry Logic
 * 
 * Provides centralized error handling with:
 * - Error categorization
 * - Exponential backoff retry
 * - Circuit breaker pattern
 * - Consistent error responses
 */

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  INTERNAL_ERROR = 'internal_error',
  UNKNOWN = 'unknown',
}

export interface ServiceError extends Error {
  category: ErrorCategory;
  statusCode: number;
  retryable: boolean;
  originalError?: Error;
  context?: Record<string, unknown>;
}

export class ServiceErrorHandler {
  /**
   * Categorize an error based on its type and message
   */
  static categorize(error: unknown): ErrorCategory {
    if (!error) return ErrorCategory.UNKNOWN;

    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const errorName = error instanceof Error ? error.name : '';

    // AWS SDK errors
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
    if (errorName === 'ThrottlingException' || errorMessage.includes('throttl') || errorMessage.includes('rate limit')) {
      return ErrorCategory.RATE_LIMIT;
    }
    if (errorName === 'TimeoutError' || errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return ErrorCategory.TIMEOUT;
    }
    if (errorName === 'ServiceUnavailableException' || errorMessage.includes('service unavailable') || errorMessage.includes('503')) {
      return ErrorCategory.SERVICE_UNAVAILABLE;
    }
    if (errorMessage.includes('internal') || errorMessage.includes('500')) {
      return ErrorCategory.INTERNAL_ERROR;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine if an error should be retried
   */
  static isRetryable(error: ServiceError | Error): boolean {
    const category = error instanceof Error && 'category' in error 
      ? (error as ServiceError).category 
      : this.categorize(error);

    // Retry transient errors
    return [
      ErrorCategory.TIMEOUT,
      ErrorCategory.SERVICE_UNAVAILABLE,
      ErrorCategory.RATE_LIMIT,
      ErrorCategory.INTERNAL_ERROR,
    ].includes(category);
  }

  /**
   * Execute operation with exponential backoff retry
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      backoffMs?: number;
      backoffMultiplier?: number;
      onRetry?: (attempt: number, error: Error) => void;
    }
  ): Promise<T> {
    const {
      maxRetries = 3,
      backoffMs = 100,
      backoffMultiplier = 2,
      onRetry,
    } = options || {};

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry if not retryable or last attempt
        if (!this.isRetryable(lastError) || attempt === maxRetries) {
          throw lastError;
        }

        // Calculate backoff delay
        const delay = backoffMs * Math.pow(backoffMultiplier, attempt);
        
        // Call retry callback
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms:`, lastError.message);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Execute operation with circuit breaker pattern
   */
  static async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    key: string,
    options?: {
      failureThreshold?: number;
      resetTimeoutMs?: number;
      halfOpenRequests?: number;
    }
  ): Promise<T> {
    const {
      failureThreshold = 5,
      resetTimeoutMs = 60000, // 1 minute
      halfOpenRequests = 1,
    } = options || {};

    const state = CircuitBreakerState.get(key);

    // Check circuit state
    if (state.isOpen()) {
      if (state.shouldAttemptReset()) {
        state.halfOpen();
      } else {
        throw new Error(`Circuit breaker open for ${key}`);
      }
    }

    try {
      const result = await operation();
      state.recordSuccess();
      return result;
    } catch (error) {
      state.recordFailure();

      if (state.failures >= failureThreshold) {
        state.open(resetTimeoutMs);
        console.error(`[Circuit Breaker] Opened for ${key} after ${state.failures} failures`);
      }

      throw error;
    }
  }

  /**
   * Create a ServiceError from any error
   */
  static createServiceError(
    error: unknown,
    context?: Record<string, unknown>
  ): ServiceError {
    const category = this.categorize(error);
    const originalError = error instanceof Error ? error : new Error(String(error));

    const statusCodeMap: Record<ErrorCategory, number> = {
      [ErrorCategory.VALIDATION]: 400,
      [ErrorCategory.AUTHENTICATION]: 401,
      [ErrorCategory.AUTHORIZATION]: 403,
      [ErrorCategory.NOT_FOUND]: 404,
      [ErrorCategory.RATE_LIMIT]: 429,
      [ErrorCategory.TIMEOUT]: 408,
      [ErrorCategory.SERVICE_UNAVAILABLE]: 503,
      [ErrorCategory.INTERNAL_ERROR]: 500,
      [ErrorCategory.UNKNOWN]: 500,
    };

    const serviceError = originalError as ServiceError;
    serviceError.category = category;
    serviceError.statusCode = statusCodeMap[category];
    serviceError.retryable = this.isRetryable(originalError);
    serviceError.originalError = originalError;
    serviceError.context = context;

    return serviceError;
  }
}

/**
 * Circuit Breaker State Management
 */
class CircuitBreakerState {
  private static states = new Map<string, CircuitBreakerState>();

  failures = 0;
  successes = 0;
  state: 'closed' | 'open' | 'half-open' = 'closed';
  openedAt?: number;
  resetTimeout?: number;

  static get(key: string): CircuitBreakerState {
    if (!this.states.has(key)) {
      this.states.set(key, new CircuitBreakerState());
    }
    return this.states.get(key)!;
  }

  isOpen(): boolean {
    return this.state === 'open';
  }

  isClosed(): boolean {
    return this.state === 'closed';
  }

  isHalfOpen(): boolean {
    return this.state === 'half-open';
  }

  shouldAttemptReset(): boolean {
    if (!this.isOpen() || !this.openedAt || !this.resetTimeout) {
      return false;
    }
    return Date.now() - this.openedAt >= this.resetTimeout;
  }

  open(resetTimeoutMs: number): void {
    this.state = 'open';
    this.openedAt = Date.now();
    this.resetTimeout = resetTimeoutMs;
  }

  halfOpen(): void {
    this.state = 'half-open';
    this.failures = 0;
    this.successes = 0;
  }

  close(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.openedAt = undefined;
    this.resetTimeout = undefined;
  }

  recordSuccess(): void {
    this.successes++;
    if (this.isHalfOpen() && this.successes >= 1) {
      this.close();
    }
  }

  recordFailure(): void {
    this.failures++;
  }
}
