-- Migration 013: Create blocked_users table + fix reports table for profile reports

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- RLS for blocked_users
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blocks" ON blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert their own blocks" ON blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" ON blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);

GRANT SELECT, INSERT, DELETE ON blocked_users TO authenticated;

-- Add item_type and item_id columns to reports if they don't exist
ALTER TABLE reports ADD COLUMN IF NOT EXISTS item_type text DEFAULT 'listing';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS item_id text;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);
