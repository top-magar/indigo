-- Reviews table for customer product reviews with AWS Comprehend sentiment analysis
-- Migration: 045-reviews.sql

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Customer info (stored separately for guest reviews)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    
    -- AWS Comprehend sentiment analysis
    sentiment VARCHAR(20) DEFAULT 'NEUTRAL' CHECK (sentiment IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED')),
    sentiment_scores JSONB DEFAULT '{}',
    key_phrases TEXT[] DEFAULT '{}',
    
    -- Moderation
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    spam_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS reviews_tenant_product_idx ON reviews(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS reviews_tenant_customer_idx ON reviews(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS reviews_sentiment_idx ON reviews(tenant_id, sentiment);
CREATE INDEX IF NOT EXISTS reviews_approved_idx ON reviews(tenant_id, is_approved);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(tenant_id, rating);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(tenant_id, created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tenants can only see their own reviews
CREATE POLICY reviews_tenant_isolation ON reviews
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Service role can access all reviews
CREATE POLICY reviews_service_role ON reviews
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Public can read approved reviews (for storefront)
CREATE POLICY reviews_public_read ON reviews
    FOR SELECT
    TO anon
    USING (is_approved = true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at_trigger
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Add comment
COMMENT ON TABLE reviews IS 'Customer product reviews with AWS Comprehend sentiment analysis';
COMMENT ON COLUMN reviews.sentiment IS 'Sentiment from AWS Comprehend: POSITIVE, NEGATIVE, NEUTRAL, MIXED';
COMMENT ON COLUMN reviews.sentiment_scores IS 'Confidence scores for each sentiment type from AWS Comprehend';
COMMENT ON COLUMN reviews.key_phrases IS 'Key phrases extracted by AWS Comprehend';
COMMENT ON COLUMN reviews.spam_score IS 'Spam likelihood score (0-100), higher = more likely spam';
