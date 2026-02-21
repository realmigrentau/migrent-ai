-- ============================================================
-- Migration 018: Complete Support System
-- Tables: tickets, ticket_messages, ticket_tags, help_articles,
--         help_article_categories, support_events
-- ============================================================

-- ── 1. Help Article Categories ────────────────────────────────
CREATE TABLE IF NOT EXISTS help_article_categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,           -- e.g. "Getting Started"
  slug        TEXT NOT NULL UNIQUE,           -- e.g. "getting-started"
  description TEXT,
  icon        TEXT,                           -- lucide icon name
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed default categories
INSERT INTO help_article_categories (name, slug, description, icon, sort_order) VALUES
  ('Getting Started',       'getting-started',       'New to MigRent? Start here.',               'Rocket',       0),
  ('For Seekers',           'for-seekers',           'Tips and guides for renters.',               'Search',       1),
  ('For Owners',            'for-owners',            'Managing your listings and tenants.',        'Home',         2),
  ('Payments & Fees',       'payments-fees',         'Billing, refunds, and pricing.',             'CreditCard',   3),
  ('Safety & Verification', 'safety-verification',   'Identity checks and trust features.',        'ShieldCheck',  4),
  ('Technical Issues',      'technical-issues',      'Bugs, errors, and troubleshooting.',         'Bug',          5)
ON CONFLICT (slug) DO NOTHING;


-- ── 2. Help Articles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS help_articles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  category_id   UUID REFERENCES help_article_categories(id) ON DELETE SET NULL,
  body          TEXT NOT NULL,                 -- Markdown content
  audience      TEXT DEFAULT 'both' CHECK (audience IN ('seeker', 'owner', 'both')),
  published     BOOLEAN DEFAULT TRUE,
  view_count    INT DEFAULT 0,
  helpful_yes   INT DEFAULT 0,
  helpful_no    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_help_articles_slug ON help_articles(slug);


-- ── 3. Tickets ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable for guests
  email       TEXT,                           -- guest email (or user email copy)
  name        TEXT,                           -- guest name
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'pending_customer', 'pending_internal', 'resolved', 'closed')),
  priority    TEXT NOT NULL DEFAULT 'normal'
              CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category    TEXT DEFAULT 'feedback'
              CHECK (category IN ('billing', 'onboarding', 'verification', 'listings', 'trust_safety', 'bug', 'feedback')),
  source      TEXT NOT NULL DEFAULT 'in_app'
              CHECK (source IN ('in_app', 'email', 'contact_form')),
  subject     TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Metrics
  first_response_at TIMESTAMPTZ,
  resolved_at       TIMESTAMPTZ,
  -- Satisfaction
  csat_rating       INT CHECK (csat_rating BETWEEN 1 AND 5),
  csat_comment      TEXT,
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at DESC);


-- ── 4. Ticket Messages ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL DEFAULT 'user'
              CHECK (sender_type IN ('user', 'agent', 'system')),
  body        TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,          -- internal agent notes
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);


-- ── 5. Ticket Tags (many-to-many) ────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_tags (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ticket_tag_links (
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES ticket_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (ticket_id, tag_id)
);

-- Seed some default tags
INSERT INTO ticket_tags (name) VALUES
  ('first-timer'), ('international'), ('urgent-housing'), ('refund-request'),
  ('bug-confirmed'), ('feature-request'), ('escalated')
ON CONFLICT (name) DO NOTHING;


-- ── 6. Support Events (audit log) ────────────────────────────
CREATE TABLE IF NOT EXISTS support_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id   UUID REFERENCES tickets(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,                  -- 'status_change', 'priority_change', 'assigned', 'reply', 'csat_submitted', etc.
  old_value   TEXT,
  new_value   TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_events_ticket ON support_events(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_events_type ON support_events(event_type);


-- ── 7. Updated_at trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tickets_updated_at ON tickets;
CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS help_articles_updated_at ON help_articles;
CREATE TRIGGER help_articles_updated_at
  BEFORE UPDATE ON help_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 8. RLS Policies ──────────────────────────────────────────

-- Tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Users can see their own tickets
DROP POLICY IF EXISTS tickets_user_select ON tickets;
CREATE POLICY tickets_user_select ON tickets
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()::text::uuid
      AND role IN ('support_agent', 'admin')
    )
  );

-- Users can insert tickets (their own or as guest)
DROP POLICY IF EXISTS tickets_user_insert ON tickets;
CREATE POLICY tickets_user_insert ON tickets
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

-- Only agents/admins can update tickets
DROP POLICY IF EXISTS tickets_agent_update ON tickets;
CREATE POLICY tickets_agent_update ON tickets
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()::text::uuid
      AND role IN ('support_agent', 'admin')
    )
  );

-- Ticket Messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ticket_messages_select ON ticket_messages;
CREATE POLICY ticket_messages_select ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets t WHERE t.id = ticket_id
      AND (t.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid()::text::uuid
        AND role IN ('support_agent', 'admin')
      ))
    )
  );

DROP POLICY IF EXISTS ticket_messages_insert ON ticket_messages;
CREATE POLICY ticket_messages_insert ON ticket_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()::text::uuid
      AND role IN ('support_agent', 'admin')
    )
  );

-- Help Articles: public read, admin write
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS help_articles_public_read ON help_articles;
CREATE POLICY help_articles_public_read ON help_articles
  FOR SELECT USING (published = TRUE);

DROP POLICY IF EXISTS help_articles_admin_all ON help_articles;
CREATE POLICY help_articles_admin_all ON help_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()::text::uuid
      AND role IN ('support_agent', 'admin')
    )
  );

-- Help Article Categories: public read
ALTER TABLE help_article_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS help_categories_public_read ON help_article_categories;
CREATE POLICY help_categories_public_read ON help_article_categories
  FOR SELECT USING (TRUE);

-- Support Events: only agents can see
ALTER TABLE support_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS support_events_agent_select ON support_events;
CREATE POLICY support_events_agent_select ON support_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()::text::uuid
      AND role IN ('support_agent', 'admin')
    )
  );


-- ── 9. Grants ─────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON tickets TO authenticated;
GRANT SELECT, INSERT ON ticket_messages TO authenticated;
GRANT SELECT ON help_articles TO anon, authenticated;
GRANT SELECT ON help_article_categories TO anon, authenticated;
GRANT SELECT ON support_events TO authenticated;
GRANT SELECT ON ticket_tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON ticket_tag_links TO authenticated;

-- Service role (backend) gets full access
GRANT ALL ON tickets TO service_role;
GRANT ALL ON ticket_messages TO service_role;
GRANT ALL ON help_articles TO service_role;
GRANT ALL ON help_article_categories TO service_role;
GRANT ALL ON support_events TO service_role;
GRANT ALL ON ticket_tags TO service_role;
GRANT ALL ON ticket_tag_links TO service_role;
