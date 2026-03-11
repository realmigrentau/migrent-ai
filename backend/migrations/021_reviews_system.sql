-- 021: Reviews system - dual-sided reviews for trust building
-- Supports seeker-rates-owner/listing and owner-rates-seeker

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  reviewed_user_id uuid NOT NULL,
  listing_id uuid,
  review_type text NOT NULL CHECK (review_type IN ('seeker_to_owner', 'owner_to_seeker')),
  -- Core rating
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  -- Migrant-specific extras (seeker reviewing owner/listing)
  migrant_friendliness integer CHECK (migrant_friendliness >= 1 AND migrant_friendliness <= 5),
  communication_language text,
  -- Owner reviewing seeker
  reliability_rating integer CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  cleanliness_rating integer CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  payment_rating integer CHECK (payment_rating >= 1 AND payment_rating <= 5),
  -- Photos
  photos text[] DEFAULT '{}',
  -- Moderation
  flagged boolean DEFAULT false,
  flag_reason text,
  moderated boolean DEFAULT false,
  moderated_at timestamptz,
  moderated_by uuid,
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- One review per deal per reviewer
  UNIQUE(deal_id, reviewer_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_deal_id ON reviews(deal_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-flagged reviews
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (flagged = false OR flagged IS NULL);

-- Authenticated users can insert their own reviews
CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id::text);

-- Users can update their own reviews (within edit window)
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (auth.uid()::text = reviewer_id::text);

-- Grant access
GRANT SELECT ON reviews TO anon;
GRANT SELECT, INSERT, UPDATE ON reviews TO authenticated;

-- Materialized view for listing rating stats (fast aggregation)
CREATE OR REPLACE VIEW listing_review_stats AS
SELECT
  listing_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as avg_rating,
  ROUND(AVG(migrant_friendliness)::numeric, 1) as avg_migrant_friendliness,
  COUNT(*) FILTER (WHERE rating >= 4) as positive_count
FROM reviews
WHERE flagged = false AND listing_id IS NOT NULL
GROUP BY listing_id;

-- View for user rating stats
CREATE OR REPLACE VIEW user_review_stats AS
SELECT
  reviewed_user_id,
  review_type,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as avg_rating
FROM reviews
WHERE flagged = false
GROUP BY reviewed_user_id, review_type;

GRANT SELECT ON listing_review_stats TO anon, authenticated;
GRANT SELECT ON user_review_stats TO anon, authenticated;
