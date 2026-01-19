/**
 * AWS Infrastructure Services
 * 
 * Exports all AWS service integrations:
 * 
 * Phase 1 (Foundation):
 * - S3: Media storage with CloudFront CDN
 * - SES: Transactional emails
 * - Rekognition: Image moderation and analysis
 * - Bedrock: AI content generation
 * - Comprehend: Sentiment analysis and NLP
 * - Translate: Multi-language translation
 * - Polly: Text-to-speech for accessibility
 * - Textract: Document/invoice processing
 * 
 * Phase 2 (Personalization):
 * - Personalize: Product recommendations
 * - OpenSearch: Advanced full-text search
 * - Forecast: Inventory demand prediction
 */

// Phase 1 Services
export * from './s3';
export * from './ses';
export * from './rekognition';
export * from './bedrock';
export * from './comprehend';
export * from './translate';
export * from './polly';
export * from './textract';

// Phase 2 Services
export * from './personalize';
export * from './opensearch';
export * from './forecast';

// Governance & Operations
export * from './wellarchitected';

// AWS Configuration
export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  s3: {
    bucket: process.env.AWS_S3_BUCKET || 'indigo-media-assets',
    cloudfrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN || 'd1s07hm6t7mxic.cloudfront.net',
  },
  ses: {
    region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'us-east-1',
    fromEmail: process.env.AWS_SES_FROM_EMAIL || 'noreply@indigo.store',
  },
  rekognition: {
    enabled: process.env.AWS_REKOGNITION_ENABLED === 'true',
  },
  bedrock: {
    modelId: process.env.AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
    region: process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  comprehend: {
    enabled: process.env.AWS_COMPREHEND_ENABLED === 'true',
    region: process.env.AWS_COMPREHEND_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  translate: {
    enabled: process.env.AWS_TRANSLATE_ENABLED === 'true',
    region: process.env.AWS_TRANSLATE_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  polly: {
    enabled: process.env.AWS_POLLY_ENABLED === 'true',
    region: process.env.AWS_POLLY_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  textract: {
    enabled: process.env.AWS_TEXTRACT_ENABLED === 'true',
    region: process.env.AWS_TEXTRACT_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  // Phase 2 Services
  personalize: {
    enabled: process.env.AWS_PERSONALIZE_ENABLED === 'true',
    campaignArn: process.env.AWS_PERSONALIZE_CAMPAIGN_ARN,
    trackingId: process.env.AWS_PERSONALIZE_TRACKING_ID,
    region: process.env.AWS_PERSONALIZE_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  opensearch: {
    enabled: process.env.AWS_OPENSEARCH_ENABLED === 'true',
    domainEndpoint: process.env.AWS_OPENSEARCH_DOMAIN_ENDPOINT,
    indexPrefix: process.env.AWS_OPENSEARCH_INDEX_PREFIX || 'indigo',
    region: process.env.AWS_OPENSEARCH_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  forecast: {
    enabled: process.env.AWS_FORECAST_ENABLED === 'true',
    forecastArn: process.env.AWS_FORECAST_ARN,
    predictorArn: process.env.AWS_FORECAST_PREDICTOR_ARN,
    region: process.env.AWS_FORECAST_REGION || process.env.AWS_REGION || 'us-east-1',
  },
  // Governance & Operations
  wellArchitected: {
    enabled: process.env.AWS_WELLARCHITECTED_ENABLED === 'true',
    workloadId: process.env.AWS_WELLARCHITECTED_WORKLOAD_ID,
    reviewOwner: process.env.AWS_WELLARCHITECTED_REVIEW_OWNER || 'platform-team@indigo.com',
    region: process.env.AWS_WELLARCHITECTED_REGION || process.env.AWS_REGION || 'us-east-1',
  },
};
