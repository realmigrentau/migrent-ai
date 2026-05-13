-- Migration 038: Assistant query logs
-- Captures every question asked to the in-app support assistant so the team
-- can find content gaps, bad answers, and missing Help Center articles.

CREATE TABLE IF NOT EXISTS assistant_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  query text NOT NULL,
  top_article_id text,
  confidence text CHECK (confidence IN ('high', 'medium', 'low', 'none')),
  helpful boolean,
  safety_flag boolean DEFAULT false,
  legal_flag boolean DEFAULT false,
  emergency_flag boolean DEFAULT false,
  escalated boolean DEFAULT false,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_logs_created_at ON assistant_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_confidence ON assistant_logs (confidence);
CREATE INDEX IF NOT EXISTS idx_assistant_logs_helpful ON assistant_logs (helpful);

-- RLS: insert is public (anonymous users may use the assistant); read is service-role only.
ALTER TABLE assistant_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log assistant queries" ON assistant_logs;
CREATE POLICY "Anyone can log assistant queries"
  ON assistant_logs
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role reads assistant logs" ON assistant_logs;
CREATE POLICY "Service role reads assistant logs"
  ON assistant_logs
  FOR SELECT
  USING (auth.role() = 'service_role');
