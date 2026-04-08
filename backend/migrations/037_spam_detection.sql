-- Migration 037: Spam Detection and Founder Approval Workflow
-- Adds spam scoring, extended moderation statuses, and moderation events audit trail

-- 1. Extend moderation_status to support spam workflow states
-- Drop the old CHECK constraint and add the new one
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_moderation_status_check;

ALTER TABLE listings
  ADD CONSTRAINT listings_moderation_status_check
    CHECK (moderation_status IN (
      'pending_approval',
      'approved',
      'rejected',
      'changes_requested',
      'flagged',
      'hidden',
      'delete_requested',
      'deleted'
    ));

-- 2. Add spam detection columns to listings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS spam_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spam_reasons jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS flagged_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS delete_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS delete_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS content_hash text;

-- 3. Create moderation_events table for full audit trail
CREATE TABLE IF NOT EXISTS moderation_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL,
  actor_id uuid REFERENCES profiles(id),
  actor_type text NOT NULL DEFAULT 'system' CHECK (actor_type IN ('system', 'admin', 'owner')),
  event_type text NOT NULL CHECK (event_type IN (
    'spam_scan',
    'flagged',
    'hidden',
    'approved',
    'rejected',
    'changes_requested',
    'delete_requested',
    'delete_approved',
    'unflagged',
    'owner_edited',
    'score_updated'
  )),
  old_status text,
  new_status text,
  spam_score integer,
  reasons jsonb DEFAULT '[]',
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 4. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_listings_spam_score ON listings(spam_score DESC);
CREATE INDEX IF NOT EXISTS idx_listings_flagged_at ON listings(flagged_at);
CREATE INDEX IF NOT EXISTS idx_listings_content_hash ON listings(content_hash);
CREATE INDEX IF NOT EXISTS idx_moderation_events_listing_id ON moderation_events(listing_id);
CREATE INDEX IF NOT EXISTS idx_moderation_events_created_at ON moderation_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_events_event_type ON moderation_events(event_type);

-- 5. Extend admin_audit_log action constraint
ALTER TABLE admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_action_check;

ALTER TABLE admin_audit_log
  ADD CONSTRAINT admin_audit_log_action_check
    CHECK (action IN (
      'approve', 'reject', 'request_changes',
      'suspend_user', 'unsuspend_user',
      'flag', 'hide', 'unflag',
      'request_delete', 'confirm_delete'
    ));

-- 6. RLS for moderation_events
ALTER TABLE moderation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage moderation events"
  ON moderation_events FOR ALL
  USING (true)
  WITH CHECK (true);
