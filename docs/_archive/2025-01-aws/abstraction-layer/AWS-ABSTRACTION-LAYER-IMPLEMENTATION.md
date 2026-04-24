# AWS Abstraction Layer Implementation Guide

## Overview

This guide provides a blueprint for implementing a unified abstraction layer that will:
- Centralize error handling and retry logic
- Enable provider switching (AWS ↔ alternatives)
- Improve observability and monitoring
- Simplify testing and mocking
- Reduce code duplication

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  (Features, API routes, components)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Service Abstraction Layer                       │
│  (Provider-agnostic interfaces)                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ StorageService│  │ EmailService │  │ AIService       │  │
│  │ SearchService │  │ RecommendService                   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│           Cross-Cutting Concerns Layer                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Error Handler│  │ Retry Logic  │  │ Circuit Breaker  │  │
│  │ Validation   │  │ Caching      │  │ Rate Limiting    │  │
│  │ Observability│  │ Metrics      │  │ Tracing          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Provider Implementation Layer                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ AWS Provider │  │ Vercel Blob  │  │ Local Provider   │  │
│  │ (S3, SES)    │  │ (Storage)    │  │ (Fallback)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Core Abstractions

### 1. Error Handling & Retry Logic

**File**: `src/infrastructure/services/error-handler.ts`

```typescript
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
  static categorize(error: unknown): ErrorCategory {
    // Categorize AWS errors
  }

  static isRetryable(error: ServiceError): boolean {
    // Determine if error should be retried
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      backoffMs?: number;
      backoffMultiplier?: number;
    }
  ): Promise<T> {
    // Implement exponential backoff retry logic
  }

  static async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    key: string,
    options?: {
      failureThreshold?: number;
      resetTimeoutMs?: number;
    }
  ): Promise<T> {
    // Implement circuit breaker pattern
  }
}
```

### 2. Provider-Agnostic Interfaces

**File**: `src/infrastructure/services/providers/types.ts`

```typescript
// Storage Provider
export interface StorageProvider {
  upload(file: Buffer | Uint8Array, options: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
  list(prefix: string, maxKeys?: number): Promise<StorageObject[]>;
}

// Email Provider
export interface EmailProvider {
  send(options: SendEmailOptions): Promise<EmailResult>;
  verify(email: string): Promise<void>;
  isVerified(email: string): Promise<boolean>;
  listVerified(): Promise<string[]>;
}

// AI Provider
export interface AIProvider {
  generateText(prompt: string, options?: AIOptions): Promise<AIResult>;
  analyzeImage(image: Buffer | string, options?: ImageAnalysisOptions): Promise<ImageAnalysis>;
  extractText(document: Buffer | string): Promise<TextExtractionResult>;
  analyzeSentiment(text: string): Promise<SentimentResult>;
  translateText(text: string, targetLanguage: string): Promise<TranslationResult>;
  synthesizeSpeech(text: string, options?: SpeechOptions): Promise<AudioResult>;
}

// Search Provider
export interface SearchProvider {
  index(document: SearchDocument): Promise<void>;
  bulkIndex(documents: SearchDocument[]): Promise<void>;
  delete(documentId: string): Promise<void>;
  search(query: SearchQuery): Promise<SearchResults>;
  autocomplete(query: string, limit?: number): Promise<string[]>;
}

// Recommendation Provider
export interface RecommendationProvider {
  getRecommendations(userId: string, options?: RecommendationOptions): Promise<Recommendation[]>;
  getSimilarItems(itemId: string, options?: SimilarItemsOptions): Promise<Recommendation[]>;
  trackInteraction(userId: string, itemId: string, eventType: string): Promise<void>;
  rankItems(userId: string, itemIds: string[]): Promise<RankedItem[]>;
}

// Forecast Provider
export interface ForecastProvider {
  forecast(productId: string, days: number): Promise<ForecastResult>;
  calculateStockOutRisk(products: Product[]): Promise<StockOutRisk[]>;
  getSeasonalTrends(categoryId: string): Promise<SeasonalTrend[]>;
}
```

### 3. Service Factory

**File**: `src/infrastructure/services/factory.ts`

```typescript
export class ServiceFactory {
  private static providers: Map<string, unknown> = new Map();

  static registerProvider(name: string, provider: unknown): void {
    this.providers.set(name, provider);
  }

  static getStorageProvider(): StorageProvider {
    const provider = process.env.STORAGE_PROVIDER || 'aws';
    return this.providers.get(provider) as StorageProvider;
  }

  static getEmailProvider(): EmailProvider {
    const provider = process.env.EMAIL_PROVIDER || 'aws';
    return this.providers.get(provider) as EmailProvider;
  }

  static getAIProvider(): AIProvider {
    const provider = process.env.AI_PROVIDER || 'aws';
    return this.providers.get(provider) as AIProvider;
  }

  static getSearchProvider(): SearchProvider {
    const provider = process.env.SEARCH_PROVIDER || 'opensearch';
    return this.providers.get(provider) as SearchProvider;
  }

  static getRecommendationProvider(): RecommendationProvider {
    const provider = process.env.RECOMMENDATION_PROVIDER || 'personalize';
    return this.providers.get(provider) as RecommendationProvider;
  }

  static getForecastProvider(): ForecastProvider {
    const provider = process.env.FORECAST_PROVIDER || 'local';
    return this.providers.get(provider) as ForecastProvider;
  }
}
```

### 4. Observability Layer

**File**: `src/infrastructure/services/observability.ts`

```typescript
export interface ServiceMetrics {
  operationName: string;
  provider: string;
  duration: number;
  success: boolean;
  errorCategory?: ErrorCategory;
  tenantId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class ServiceObservability {
  static recordMetric(metric: ServiceMetrics): void {
    // Send to observability backend (DataDog, New Relic, etc.)
    console.log(`[${metric.provider}] ${metric.operationName}`, {
      duration: metric.duration,
      success: metric.success,
      error: metric.errorCategory,
    });
  }

  static async trackOperation<T>(
    operationName: string,
    provider: string,
    operation: () => Promise<T>,
    context?: { tenantId?: string; userId?: string }
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await operation();
      this.recordMetric({
        operationName,
        provider,
        duration: Date.now() - startTime,
        success: true,
        ...context,
      });
      return result;
    } catch (error) {
      this.recordMetric({
        operationName,
        provider,
        duration: Date.now() - startTime,
        success: false,
        errorCategory: ServiceErrorHandler.categorize(error),
        ...context,
      });
      throw error;
    }
  }
}
```

### 5. Request Validation

**File**: `src/infrastructure/services/validation.ts`

```typescript
export class ServiceValidator {
  static validateUploadFile(file: Buffer | Uint8Array, options: {
    maxSizeBytes?: number;
    allowedMimeTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = options.maxSizeBytes || 50 * 1024 * 1024; // 50MB default
    
    if (file.byteLength > maxSize) {
      return { valid: false, error: `File exceeds max size of ${maxSize} bytes` };
    }
    
    return { valid: true };
  }

  static validateEmail(email: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
  }

  static validateSearchQuery(query: string): { valid: boolean; error?: string } {
    if (query.length < 2) {
      return { valid: false, error: 'Query must be at least 2 characters' };
    }
    if (query.length > 1000) {
      return { valid: false, error: 'Query exceeds max length of 1000 characters' };
    }
    return { valid: true };
  }

  static validateTextLength(text: string, maxLength: number): { valid: boolean; error?: string } {
    if (text.length > maxLength) {
      return { valid: false, error: `Text exceeds max length of ${maxLength}` };
    }
    return { valid: true };
  }
}
```

## Phase 2: Service Implementations

### 1. Storage Service

**File**: `src/infrastructure/services/storage.ts`

```typescript
export class StorageService {
  private provider: StorageProvider;

  constructor() {
    this.provider = ServiceFactory.getStorageProvider();
  }

  async upload(
    file: Buffer | Uint8Array,
    options: UploadOptions
  ): Promise<UploadResult> {
    // Validate
    const validation = ServiceValidator.validateUploadFile(file, {
      maxSizeBytes: 50 * 1024 * 1024,
    });
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Track and execute with retry
    return ServiceObservability.trackOperation(
      'upload',
      this.provider.constructor.name,
      () => ServiceErrorHandler.withRetry(
        () => this.provider.upload(file, options),
        { maxRetries: 3 }
      ),
      { tenantId: options.tenantId }
    );
  }

  async delete(key: string): Promise<void> {
    return ServiceObservability.trackOperation(
      'delete',
      this.provider.constructor.name,
      () => ServiceErrorHandler.withRetry(
        () => this.provider.delete(key),
        { maxRetries: 2 }
      )
    );
  }

  getUrl(key: string): string {
    return this.provider.getUrl(key);
  }

  async getPresignedUrl(key: string, expiresIn?: number): Promise<string> {
    return this.provider.getPresignedUrl(key, expiresIn);
  }
}
```

### 2. Email Service

**File**: `src/infrastructure/services/email.ts`

```typescript
export class EmailService {
  private provider: EmailProvider;

  constructor() {
    this.provider = ServiceFactory.getEmailProvider();
  }

  async send(options: SendEmailOptions): Promise<EmailResult> {
    // Validate
    const toEmails = Array.isArray(options.to) ? options.to : [options.to];
    for (const email of toEmails) {
      const validation = ServiceValidator.validateEmail(email);
      if (!validation.valid) {
        throw new Error(`Invalid recipient: ${validation.error}`);
      }
    }

    // Track and execute with retry
    return ServiceObservability.trackOperation(
      'send_email',
      this.provider.constructor.name,
      () => ServiceErrorHandler.withRetry(
        () => this.provider.send(options),
        { maxRetries: 3 }
      )
    );
  }

  async verify(email: string): Promise<void> {
    const validation = ServiceValidator.validateEmail(email);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return this.provider.verify(email);
  }
}
```

### 3. AI Service

**File**: `src/infrastructure/services/ai.ts`

```typescript
export class AIService {
  private provider: AIProvider;

  constructor() {
    this.provider = ServiceFactory.getAIProvider();
  }

  async generateText(prompt: string, options?: AIOptions): Promise<string> {
    // Validate
    const validation = ServiceValidator.validateTextLength(prompt, 10000);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Track and execute with retry + circuit breaker
    const result = await ServiceObservability.trackOperation(
      'generate_text',
      this.provider.constructor.name,
      () => ServiceErrorHandler.withCircuitBreaker(
        () => ServiceErrorHandler.withRetry(
          () => this.provider.generateText(prompt, options),
          { maxRetries: 2 }
        ),
        'ai_generate_text'
      )
    );

    return result.content || '';
  }

  async analyzeImage(image: Buffer | string, options?: ImageAnalysisOptions): Promise<ImageAnalysis> {
    return ServiceObservability.trackOperation(
      'analyze_image',
      this.provider.constructor.name,
      () => ServiceErrorHandler.withRetry(
        () => this.provider.analyzeImage(image, options),
        { maxRetries: 2 }
      )
    );
  }
}
```

## Phase 3: Provider Implementations

### AWS Provider Implementation

**File**: `src/infrastructure/services/providers/aws-storage.ts`

```typescript
export class AWSStorageProvider implements StorageProvider {
  async upload(file: Buffer | Uint8Array, options: UploadOptions): Promise<UploadResult> {
    // Use existing S3 implementation
    return uploadToS3(file, options);
  }

  async delete(key: string): Promise<void> {
    const result = await deleteFromS3(key);
    if (!result.success) {
      throw new Error(result.error);
    }
  }

  getUrl(key: string): string {
    return getCdnUrl(key);
  }

  async getPresignedUrl(key: string, expiresIn?: number): Promise<string> {
    const result = await getPresignedDownloadUrl(key, expiresIn);
    if (!result) {
      throw new Error('Failed to generate presigned URL');
    }
    return result;
  }

  async exists(key: string): Promise<boolean> {
    return fileExists(key);
  }

  async list(prefix: string, maxKeys?: number): Promise<StorageObject[]> {
    const files = await listTenantFiles(prefix.split('/')[1], prefix.split('/')[2], maxKeys);
    return files.map(f => ({
      key: f.key,
      size: f.size,
      lastModified: f.lastModified,
    }));
  }
}
```

## Phase 4: Integration

### Update Application Code

**Before**:
```typescript
import { uploadToS3 } from '@/infrastructure/aws/s3';

export async function uploadMedia(file: Buffer, tenantId: string) {
  const result = await uploadToS3(file, { tenantId, filename: 'media.jpg' });
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.cdnUrl;
}
```

**After**:
```typescript
import { StorageService } from '@/infrastructure/services/storage';

export async function uploadMedia(file: Buffer, tenantId: string) {
  const storage = new StorageService();
  const result = await storage.upload(file, { 
    tenantId, 
    filename: 'media.jpg' 
  });
  return storage.getUrl(result.key);
}
```

## Implementation Roadmap

### Week 1: Foundation
- [ ] Create error handling layer
- [ ] Define provider interfaces
- [ ] Create service factory
- [ ] Add observability layer

### Week 2: Core Services
- [ ] Implement StorageService
- [ ] Implement EmailService
- [ ] Implement AIService
- [ ] Add request validation

### Week 3: Provider Implementations
- [ ] AWS provider implementations
- [ ] Local/fallback providers
- [ ] Alternative provider stubs (Vercel, Google Cloud)

### Week 4: Integration & Testing
- [ ] Update application code
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Performance testing

## Testing Strategy

### Unit Tests
```typescript
describe('StorageService', () => {
  it('should upload file with retry on transient error', async () => {
    // Mock provider with transient failure
    // Verify retry logic works
  });

  it('should validate file size before upload', async () => {
    // Test validation
  });

  it('should track metrics for successful upload', async () => {
    // Verify observability
  });
});
```

### Integration Tests
```typescript
describe('StorageService with AWS Provider', () => {
  it('should upload to S3 and return CDN URL', async () => {
    // Test with real AWS (or moto)
  });

  it('should handle AWS errors gracefully', async () => {
    // Test error handling
  });
});
```

## Migration Checklist

- [ ] Error handling layer implemented
- [ ] Provider interfaces defined
- [ ] Service factory created
- [ ] Observability layer added
- [ ] AWS providers implemented
- [ ] Local/fallback providers implemented
- [ ] Application code updated
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] Performance verified
- [ ] Cost tracking enabled
- [ ] Monitoring alerts configured

## Benefits

✅ **Flexibility**: Switch providers without code changes
✅ **Resilience**: Unified error handling and retry logic
✅ **Observability**: Comprehensive metrics and logging
✅ **Testability**: Easy to mock and test
✅ **Maintainability**: Reduced code duplication
✅ **Scalability**: Easier to add new services
✅ **Cost Control**: Better visibility into usage
