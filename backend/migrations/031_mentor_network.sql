-- 031: Mentor Network - local guides for new arrivals
-- Mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suburb text NOT NULL,
  postcode int,
  languages text[] DEFAULT '{}',
  bio text,
  specialties text[] DEFAULT '{}',
  availability_slots jsonb DEFAULT '[]',
  hourly_rate int DEFAULT 2500, -- cents AUD (default $25)
  stripe_account_id text,
  stripe_onboarding_complete boolean DEFAULT false,
  rating float DEFAULT 0,
  review_count int DEFAULT 0,
  verified boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Mentor sessions (bookings between seekers and mentors)
CREATE TABLE IF NOT EXISTS mentor_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suburb text NOT NULL,
  preferred_language text,
  session_type text DEFAULT 'video_call', -- video_call, in_person, chat
  status text DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED, PAID, COMPLETED, CANCELLED
  amount int NOT NULL, -- cents AUD
  platform_fee int NOT NULL, -- cents AUD (30%)
  mentor_payout int NOT NULL, -- cents AUD (70%)
  stripe_session_id text,
  scheduled_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mentor reviews
CREATE TABLE IF NOT EXISTS mentor_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id uuid NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES mentor_sessions(id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mentors_suburb ON mentors(suburb);
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON mentors(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor ON mentor_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_seeker ON mentor_sessions(seeker_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentor ON mentor_reviews(mentor_id);

-- RLS policies
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_reviews ENABLE ROW LEVEL SECURITY;

-- Mentors: anyone can read active mentors, users can manage their own
CREATE POLICY "Anyone can view active mentors"
  ON mentors FOR SELECT
  USING (active = true);

CREATE POLICY "Users can insert their own mentor profile"
  ON mentors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mentor profile"
  ON mentors FOR UPDATE
  USING (auth.uid() = user_id);

-- Mentor sessions: participants can view their own
CREATE POLICY "Mentors can view their sessions"
  ON mentor_sessions FOR SELECT
  USING (
    seeker_id = auth.uid() OR
    mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
  );

CREATE POLICY "Seekers can create sessions"
  ON mentor_sessions FOR INSERT
  WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Participants can update sessions"
  ON mentor_sessions FOR UPDATE
  USING (
    seeker_id = auth.uid() OR
    mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
  );

-- Reviews: anyone can read, seekers who completed sessions can write
CREATE POLICY "Anyone can view reviews"
  ON mentor_reviews FOR SELECT
  USING (true);

CREATE POLICY "Seekers can write reviews"
  ON mentor_reviews FOR INSERT
  WITH CHECK (auth.uid() = seeker_id);

-- Service role bypass for all tables
CREATE POLICY "Service role full access mentors"
  ON mentors FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access mentor_sessions"
  ON mentor_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access mentor_reviews"
  ON mentor_reviews FOR ALL
  USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_mentor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mentors_updated_at
  BEFORE UPDATE ON mentors
  FOR EACH ROW EXECUTE FUNCTION update_mentor_updated_at();

CREATE TRIGGER mentor_sessions_updated_at
  BEFORE UPDATE ON mentor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_mentor_updated_at();
