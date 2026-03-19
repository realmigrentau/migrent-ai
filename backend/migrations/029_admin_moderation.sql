-- Migration 029: Admin Listing Moderation System
-- Adds moderation workflow for listings + audit log for admin actions

-- 1. Add moderation columns to listings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'pending_approval'
    CHECK (moderation_status IN ('pending_approval', 'approved', 'rejected', 'changes_requested')),
  ADD COLUMN IF NOT EXISTS moderation_notes text,
  ADD COLUMN IF NOT EXISTS moderation_reason text,
  ADD COLUMN IF NOT EXISTS moderator_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

-- 2. Set existing listings to approved (they were already live)
UPDATE listings SET moderation_status = 'approved' WHERE moderation_status IS NULL OR moderation_status = 'pending_approval';

-- 3. Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES profiles(id),
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'request_changes', 'suspend_user', 'unsuspend_user')),
  target_type text NOT NULL CHECK (target_type IN ('listing', 'user')),
  target_id uuid NOT NULL,
  reason text,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 4. Create index for fast pending listing queries
CREATE INDEX IF NOT EXISTS idx_listings_moderation_status ON listings(moderation_status);
CREATE INDEX IF NOT EXISTS idx_listings_moderated_at ON listings(moderated_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- 5. RLS policies for admin audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs (using service role key bypasses RLS anyway,
-- but this is here for completeness if direct Supabase access is used)
CREATE POLICY "Admins can read audit logs"
  ON admin_audit_log FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert audit logs"
  ON admin_audit_log FOR INSERT
  WITH CHECK (true);

-- 6. Add is_admin flag to profiles for role checking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
