-- 026: Suburbs table for suburb report pages
-- Stores suburb-level statistics for SEO suburb pages

CREATE TABLE IF NOT EXISTS suburbs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NSW',
  median_rent_room INTEGER NOT NULL,
  vacancy_rate NUMERIC(4,2) NOT NULL,
  safety_score NUMERIC(3,1) NOT NULL,
  migrant_pct NUMERIC(4,1) NOT NULL,
  top_nationalities JSONB DEFAULT '[]'::jsonb,
  nearest_stations JSONB DEFAULT '[]'::jsonb,
  transport_score NUMERIC(3,1),
  walkability_score NUMERIC(3,1),
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  description TEXT,
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  rent_trend JSONB DEFAULT '[]'::jsonb,
  demographics JSONB DEFAULT '{}'::jsonb,
  faq JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_suburbs_slug ON suburbs(slug);

-- RLS: public read access
ALTER TABLE suburbs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suburbs_public_read" ON suburbs
  FOR SELECT
  USING (true);

-- Seed Kellyville data
INSERT INTO suburbs (
  slug, name, state, median_rent_room, vacancy_rate, safety_score,
  migrant_pct, top_nationalities, nearest_stations, transport_score,
  walkability_score, latitude, longitude, description, pros, cons,
  rent_trend, demographics, faq
) VALUES (
  'kellyville', 'Kellyville', 'NSW', 245, 2.1, 8.2,
  28, '["India", "China", "Philippines", "Sri Lanka", "Nepal"]'::jsonb,
  '[{"name": "Kellyville", "line": "Metro Northwest", "walk_min": 12}, {"name": "Rouse Hill", "line": "Metro Northwest", "walk_min": 18}]'::jsonb,
  7.8, 6.5, -33.7103, 150.9556,
  'Kellyville is a fast-growing suburb in the Hills District of Sydney, popular with migrants and families. With the new Metro Northwest line, it offers excellent connectivity to the CBD while maintaining a suburban feel with modern estates and amenities.',
  '["Near Rouse Hill Metro - direct train to CBD in 40min", "New estates with modern, well-maintained rooms", "Strong Indian and South Asian community", "Multiple grocery stores including Indian and Asian options", "Safe, family-friendly neighbourhood", "Good schools and parks nearby"]'::jsonb,
  '["Peak hour trains can be crowded", "Limited nightlife and entertainment", "Car helpful for some errands", "Further from beach suburbs"]'::jsonb,
  '[{"month": "Oct 2025", "rent": 235}, {"month": "Nov 2025", "rent": 238}, {"month": "Dec 2025", "rent": 240}, {"month": "Jan 2026", "rent": 242}, {"month": "Feb 2026", "rent": 244}, {"month": "Mar 2026", "rent": 245}]'::jsonb,
  '{"overseas_born_pct": 28, "india_pct": 12, "china_pct": 8, "philippines_pct": 3, "sri_lanka_pct": 2, "nepal_pct": 1.5, "median_age": 34, "avg_household_size": 3.2}'::jsonb,
  '[{"q": "What is the average room rent in Kellyville?", "a": "The median room rent in Kellyville is $245 per week as of March 2026, making it an affordable option compared to inner-city suburbs."}, {"q": "Is Kellyville safe for migrants and students?", "a": "Kellyville has a safety score of 8.2/10 based on NSW crime data. It is a family-friendly suburb with low crime rates and a strong community feel."}, {"q": "How do I get to the city from Kellyville?", "a": "Kellyville Station on the Metro Northwest line connects you to Chatswood and the CBD. The journey to Chatswood takes about 25 minutes and you can transfer to the T1 line for the CBD."}, {"q": "What rights do I have as a tenant in NSW?", "a": "Under NSW rental law, tenants have the right to a written lease, bond protection through NSW Fair Trading, minimum notice periods for rent increases (60 days), and protection against unfair evictions. Visit fairtrading.nsw.gov.au for full details."}, {"q": "Are there Indian grocery stores near Kellyville?", "a": "Yes, there are several Indian and Asian grocery stores in the Hills District. Grosco Indian Grocery in Rouse Hill and Indian stores in Castle Hill are within a 10-15 minute drive."}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  median_rent_room = EXCLUDED.median_rent_room,
  vacancy_rate = EXCLUDED.vacancy_rate,
  safety_score = EXCLUDED.safety_score,
  updated_at = now();
