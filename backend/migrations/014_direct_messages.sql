-- Migration 014: Allow direct messages without listing_id + add attachments support

-- Allow messages without a listing (direct messages from profile)
ALTER TABLE messages ALTER COLUMN listing_id DROP NOT NULL;

-- Add attachment support
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type text;

-- Add message_html for rich text (bold, highlight, etc.)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_html text;

-- Index for direct messages (no listing)
CREATE INDEX IF NOT EXISTS idx_messages_direct ON messages(sender_id, receiver_id) WHERE listing_id IS NULL;
