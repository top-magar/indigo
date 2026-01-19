/**
 * Provider-Agnostic Service Interfaces
 * 
 * Defines interfaces for all service providers to enable switching between
 * AWS, Google Cloud, Azure, or local implementations
 */

// ============================================================================
// Storage Provider
// ============================================================================

export interface UploadOptions {
  tenantId: string;
  filename: string;
  contentType: string;
  folder?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface StorageObject {
  key: string;
  size: number;
  lastModified: Date;
  contentType?: string;
}

export interface StorageProvider {
  upload(file: Buffer | Uint8Array, options: UploadOptions): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
  list(prefix: string, maxKeys?: number): Promise<StorageObject[]>;
}

// ============================================================================
// Email Provider
// ============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<EmailResult>;
  verify(email: string): Promise<void>;
  isVerified(email: string): Promise<boolean>;
  listVerified(): Promise<string[]>;
}

// ============================================================================
// AI Provider
// ============================================================================

export interface AIOptions {
  tone?: 'professional' | 'casual' | 'luxury' | 'playful';
  length?: 'short' | 'medium' | 'long';
  temperature?: number;
  maxTokens?: number;
  includeKeywords?: string[];
}

export interface AIResult {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface ImageAnalysisOptions {
  detectLabels?: boolean;
  detectText?: boolean;
  moderateContent?: boolean;
  maxLabels?: number;
  minConfidence?: number;
}

export interface ImageAnalysis {
  success: boolean;
  labels?: Array<{ name: string; confidence: number }>;
  text?: Array<{ text: string; confidence: number }>;
  moderation?: {
    isSafe: boolean;
    violations: Array<{ name: string; confidence: number }>;
  };
  error?: string;
}

export interface TextExtractionResult {
  success: boolean;
  text?: string;
  blocks?: Array<{
    text: string;
    type: 'LINE' | 'WORD' | 'TABLE' | 'FORM';
    confidence: number;
  }>;
  error?: string;
}

export interface SentimentResult {
  success: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  scores?: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  error?: string;
}

export interface TranslationResult {
  success: boolean;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  error?: string;
}

export interface SpeechOptions {
  voiceId?: string;
  languageCode?: string;
  format?: 'mp3' | 'ogg' | 'pcm';
  sampleRate?: number;
}

export interface AudioResult {
  success: boolean;
  audioData?: Buffer;
  contentType?: string;
  error?: string;
}

export interface AIProvider {
  // Text generation
  generateText(prompt: string, options?: AIOptions): Promise<AIResult>;
  
  // Image analysis
  analyzeImage(image: Buffer | string, options?: ImageAnalysisOptions): Promise<ImageAnalysis>;
  
  // Document processing
  extractText(document: Buffer | string): Promise<TextExtractionResult>;
  
  // NLP
  analyzeSentiment(text: string): Promise<SentimentResult>;
  extractKeyPhrases(text: string): Promise<{ phrases: Array<{ text: string; score: number }> }>;
  
  // Translation
  translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult>;
  
  // Speech
  synthesizeSpeech(text: string, options?: SpeechOptions): Promise<AudioResult>;
}

// ============================================================================
// Search Provider
// ============================================================================

export interface SearchDocument {
  id: string;
  tenantId: string;
  [key: string]: unknown;
}

export interface SearchQuery {
  query: string;
  tenantId: string;
  filters?: Record<string, unknown>;
  facets?: string[];
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  page?: number;
  pageSize?: number;
  highlight?: boolean;
}

export interface SearchHit<T> {
  document: T;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface SearchResults<T = SearchDocument> {
  success: boolean;
  hits?: SearchHit<T>[];
  total?: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
  error?: string;
}

export interface SearchProvider {
  // Indexing
  index(document: SearchDocument): Promise<void>;
  bulkIndex(documents: SearchDocument[]): Promise<void>;
  delete(documentId: string, tenantId: string): Promise<void>;
  
  // Searching
  search<T = SearchDocument>(query: SearchQuery): Promise<SearchResults<T>>;
  autocomplete(query: string, tenantId: string, limit?: number): Promise<string[]>;
  
  // Index management
  createIndex(tenantId: string): Promise<void>;
  deleteIndex(tenantId: string): Promise<void>;
}

// ============================================================================
// Recommendation Provider
// ============================================================================

export interface RecommendationOptions {
  numResults?: number;
  context?: Record<string, string>;
  filterValues?: Record<string, string[]>;
}

export interface Recommendation {
  itemId: string;
  score: number;
  reason?: string;
}

export interface SimilarItemsOptions {
  numResults?: number;
  filterValues?: Record<string, string[]>;
}

export interface RankedItem {
  itemId: string;
  rank: number;
  score: number;
}

export interface RecommendationProvider {
  // Get recommendations
  getRecommendations(userId: string, options?: RecommendationOptions): Promise<Recommendation[]>;
  getSimilarItems(itemId: string, options?: SimilarItemsOptions): Promise<Recommendation[]>;
  rankItems(userId: string, itemIds: string[]): Promise<RankedItem[]>;
  
  // Track interactions
  trackInteraction(
    userId: string,
    itemId: string,
    eventType: string,
    sessionId?: string,
    properties?: Record<string, string>
  ): Promise<void>;
  
  // Metadata updates
  updateUserMetadata(userId: string, metadata: Record<string, string>): Promise<void>;
  updateItemMetadata(itemId: string, metadata: Record<string, string>): Promise<void>;
}

// ============================================================================
// Forecast Provider
// ============================================================================

export interface ForecastResult {
  success: boolean;
  predictions?: Array<{
    date: string;
    value: number;
    confidence?: {
      lower: number;
      upper: number;
    };
  }>;
  error?: string;
}

export interface StockOutRisk {
  productId: string;
  productName: string;
  currentStock: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  daysUntilStockOut?: number;
  recommendedReorderQuantity?: number;
}

export interface SeasonalTrend {
  period: string;
  averageDemand: number;
  peakDemand: number;
  lowDemand: number;
}

export interface ForecastProvider {
  // Forecasting
  forecast(productId: string, days: number, tenantId: string): Promise<ForecastResult>;
  
  // Risk analysis
  calculateStockOutRisk(
    products: Array<{
      productId: string;
      productName: string;
      currentStock: number;
      leadTimeDays?: number;
    }>,
    tenantId: string
  ): Promise<StockOutRisk[]>;
  
  // Trends
  getSeasonalTrends(categoryId: string, tenantId: string): Promise<SeasonalTrend[]>;
}
