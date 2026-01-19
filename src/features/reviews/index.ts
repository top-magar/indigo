/**
 * Reviews Feature Module
 * 
 * Provides customer review management with AWS Comprehend sentiment analysis
 */

export * from './actions';
export { reviewsRepository } from './repositories/reviews';
export type { SentimentStats, ReviewWithProduct, ReviewFilters } from './repositories/reviews';
export { ReviewCard } from './components/review-card';
export type { ReviewCardProps } from './components/review-card';
export { ReviewList } from './components/review-list';
export { ReviewSentimentSummary } from './components/review-sentiment-summary';
