-- Push notification subscriptions (FCM tokens)
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  fcm_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, fcm_token)
);

-- RLS: users can only manage their own tokens
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own tokens"
  ON notification_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tokens"
  ON notification_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON notification_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Service role (backend) can read all tokens for sending
-- (service_role bypasses RLS by default, so no extra policy needed)
