-- Cross-device magic link login tokens
-- These are temporary tokens that allow a user to verify on one device
-- (e.g. phone) and auto-login on another device (e.g. laptop).
-- Tokens expire after 5 minutes and are deleted after use.

CREATE TABLE IF NOT EXISTS cross_device_tokens (
  polling_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS — this table is only accessed via the service role key from the backend
ALTER TABLE cross_device_tokens DISABLE ROW LEVEL SECURITY;

-- Auto-cleanup: delete expired tokens (runs on every insert/update via trigger)
CREATE OR REPLACE FUNCTION cleanup_expired_cross_device_tokens()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM cross_device_tokens WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cleanup_cross_device_tokens ON cross_device_tokens;
CREATE TRIGGER trg_cleanup_cross_device_tokens
  AFTER INSERT ON cross_device_tokens
  EXECUTE FUNCTION cleanup_expired_cross_device_tokens();
