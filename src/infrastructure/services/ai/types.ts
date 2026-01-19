/**
 * Indigo AI Services - Common Types
 * 
 * These types define the public API for Indigo's AI-powered features.
 * The underlying AWS implementation details are abstracted away.
 */

// ============================================================================
// Common Result Types
// ============================================================================

export interface IndigoServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    processingTime?: number;
    provider?: string;
    modelVersion?: string;
  };
}

// ============================================================================
// Indigo AI (Content Generation) Types
// ============================================================================

export type ContentTone = 'professional' | 'casual' | 'luxury' | 'playful';
export type ContentLength = 'short' | 'medium' | 'long';

export interface GenerateDescriptionOptions {
  tone?: ContentTone;
  length?: ContentLength;
  keywords?: string[];
  targetAudience?: string;
}

export interface GeneratedContent {
  content: string;
  wordCount: number;
  suggestedKeywords?: string[];
}

export interface MarketingCopyOptions {
  channel: 'email' | 'social' | 'banner' | 'sms' | 'push';
  context?: string;
  callToAction?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface SupportResponseOptions {
  orderStatus?: string;
  productName?: string;
  conversationHistory?: string[];
  customerTier?: 'standard' | 'premium' | 'vip';
}

// ============================================================================
// Indigo Search Types
// ============================================================================

export interface SearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  vendor?: string;
  productType?: string;
  rating?: number;
  tags?: string[];
}

export interface SearchSort {
  field: 'relevance' | 'price' | 'name' | 'createdAt' | 'rating' | 'popularity';
  order: 'asc' | 'desc';
}

export interface SearchOptions {
  query: string;
  tenantId: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
  includeFacets?: boolean;
  includeHighlights?: boolean;
}

export interface SearchHit<T> {
  document: T;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface SearchFacet {
  field: string;
  values: Array<{ value: string; count: number }>;
}

export interface SearchResults<T> {
  hits: SearchHit<T>[];
  total: number;
  facets?: SearchFacet[];
  suggestions?: string[];
  queryTime?: number;
}

export interface AutocompleteResult {
  name: string;
  slug: string;
  image?: string;
  category?: string;
}

// ============================================================================
// Indigo Recommendations Types
// ============================================================================

export type RecommendationType = 
  | 'personalized'      // Based on user behavior
  | 'similar'           // Similar to a specific product
  | 'trending'          // Currently popular items
  | 'frequently-bought' // Often bought together
  | 'recently-viewed';  // User's recent views

export interface RecommendationOptions {
  type: RecommendationType;
  userId?: string;
  productId?: string;
  limit?: number;
  excludeIds?: string[];
  context?: Record<string, string>;
}

export interface RecommendedProduct {
  productId: string;
  score: number;
  reason?: string;
}

export interface RecommendationResults {
  recommendations: RecommendedProduct[];
  type: RecommendationType;
  generatedAt: string;
}

export type InteractionType = 
  | 'view' 
  | 'click' 
  | 'add-to-cart' 
  | 'purchase' 
  | 'wishlist-add'
  | 'search'
  | 'review';

export interface TrackInteractionOptions {
  userId: string;
  sessionId: string;
  type: InteractionType;
  productId: string;
  value?: number;
  metadata?: Record<string, string>;
}

// ============================================================================
// Indigo Insights Types
// ============================================================================

export type SentimentScore = 'positive' | 'negative' | 'neutral' | 'mixed';

export interface SentimentAnalysis {
  sentiment: SentimentScore;
  confidence: number;
  scores: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
}

export interface KeyPhrase {
  text: string;
  relevance: number;
}

export interface ReviewAnalysis {
  sentiment: SentimentAnalysis;
  keyPhrases: KeyPhrase[];
  topics: string[];
  qualityScore: number;
  isSpam: boolean;
  language: string;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  upperBound?: number;
  lowerBound?: number;
  confidence?: number;
}

export interface DemandForecast {
  productId: string;
  forecasts: ForecastPoint[];
  accuracy: number;
  insights: string[];
  generatedAt: string;
}

export interface ForecastOptions {
  productId: string;
  days?: number;
  includeConfidenceIntervals?: boolean;
}

// ============================================================================
// Indigo Content Types
// ============================================================================

export interface TranslationOptions {
  targetLanguage: string;
  context?: 'product' | 'marketing' | 'support' | 'general';
  preserveFormatting?: boolean;
}

export interface TranslatedContent {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TagSuggestion {
  tag: string;
  confidence: number;
  category?: string;
}

// ============================================================================
// Indigo Media Types
// ============================================================================

export interface ImageAnalysis {
  isSafe: boolean;
  moderationLabels?: Array<{ name: string; confidence: number }>;
  detectedLabels: Array<{ name: string; confidence: number; categories?: string[] }>;
  detectedText: Array<{ text: string; confidence: number }>;
  suggestedTags: string[];
  dominantColors?: string[];
}

export interface ImageModerationResult {
  isSafe: boolean;
  issues?: string[];
  confidence: number;
}

// ============================================================================
// Service Status Types
// ============================================================================

export interface ServiceStatus {
  name: string;
  enabled: boolean;
  healthy: boolean;
  lastChecked: string;
  features: string[];
}

export interface IndigoServicesStatus {
  ai: ServiceStatus;
  search: ServiceStatus;
  recommendations: ServiceStatus;
  insights: ServiceStatus;
  content: ServiceStatus;
  media: ServiceStatus;
}
