-- 041_real_response_stats.sql
-- Batch 4: replace invented trust metrics with measured ones.
--
-- Run AFTER 039 and 040. Safe to re-run.
--
-- profiles.response_rate defaults to 100 and response_time to the literal
-- string 'within 24h'. Nothing ever computed either one. The frontend then
-- made it worse: hooks/useUserProfile.ts derived a "response rate" purely from
-- how old the account was, so any profile six months old was shown to renters
-- as "100% response rate, replies within an hour" whether or not that host had
-- ever answered a single message.
--
-- Renters use those numbers to decide who to trust with a bond. They are now
-- measured from real message history, and where there is not enough history
-- the view returns NULL so the UI can say so instead of inventing a figure.


-- ══════════════════════════════════════════════════════════════
-- 1. Measure replies from the messages table
-- ══════════════════════════════════════════════════════════════
-- A "conversation" is one other person messaging one recipient. The recipient
-- responded if they ever sent a message back to that person afterwards.
-- Response time is the median gap between first inbound and first reply.

CREATE OR REPLACE VIEW public.user_response_stats AS
WITH first_inbound AS (
  SELECT receiver_id AS user_id,
         sender_id   AS counterparty_id,
         MIN(created_at) AS first_in
    FROM public.messages
   GROUP BY receiver_id, sender_id
),
first_reply AS (
  SELECT m.sender_id   AS user_id,
         m.receiver_id AS counterparty_id,
         MIN(m.created_at) AS first_out
    FROM public.messages m
    JOIN first_inbound fi
      ON fi.user_id = m.sender_id
     AND fi.counterparty_id = m.receiver_id
   WHERE m.created_at > fi.first_in
   GROUP BY m.sender_id, m.receiver_id
)
SELECT fi.user_id,
       COUNT(*) AS conversations,
       COUNT(fr.first_out) AS replied,
       ROUND(100.0 * COUNT(fr.first_out) / NULLIF(COUNT(*), 0)) AS response_rate,
       PERCENTILE_CONT(0.5) WITHIN GROUP (
         ORDER BY EXTRACT(EPOCH FROM (fr.first_out - fi.first_in)) / 3600.0
       ) FILTER (WHERE fr.first_out IS NOT NULL) AS median_reply_hours
  FROM first_inbound fi
  LEFT JOIN first_reply fr
    ON fr.user_id = fi.user_id
   AND fr.counterparty_id = fi.counterparty_id
 GROUP BY fi.user_id;

ALTER VIEW public.user_response_stats SET (security_invoker = false);
GRANT SELECT ON public.user_response_stats TO anon, authenticated;


-- ══════════════════════════════════════════════════════════════
-- 2. Fold the measured values into public_profiles
-- ══════════════════════════════════════════════════════════════
-- Same column list as 039 plus the measured stats. response_rate and
-- response_time are NULL until a host has had at least three separate people
-- message them, which is the point at which a percentage means anything.

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
  SELECT p.id,
         p.name,
         p.preferred_name,
         p.about_me,
         p.bio,
         p.custom_pfp,
         p.occupation,
         p.work,
         p.location,
         p.interests,
         p.lifestyle,
         p.badges,
         p.languages,
         p.most_useless_skill,
         p.profile_photos,
         p.social_twitter,
         p.social_facebook,
         p.social_linkedin,
         p.role,
         p.verified,
         p.is_verified,
         p.identity_verified,
         p.verified_date,
         p.verification_method,
         p.average_rating,
         p.reviews_count,
         p.months_hosting,
         p.rooms_owned,
         p.properties_owned,
         p.created_at,
         -- Measured, not stored. NULL means "not enough data to say".
         CASE WHEN s.conversations >= 3 THEN s.response_rate END AS response_rate,
         CASE WHEN s.conversations >= 3 THEN s.median_reply_hours END AS median_reply_hours,
         COALESCE(s.conversations, 0) AS response_sample_size
    FROM public.profiles p
    LEFT JOIN public.user_response_stats s ON s.user_id = p.id;

ALTER VIEW public.public_profiles SET (security_invoker = false);
GRANT SELECT ON public.public_profiles TO anon, authenticated;


-- ══════════════════════════════════════════════════════════════
-- 3. Stop the stored columns being mistaken for real data
-- ══════════════════════════════════════════════════════════════
-- Left in place rather than dropped, because dropping a column is not
-- reversible and nothing depends on them any more. The comment is so the next
-- person does not wire them back up.

COMMENT ON COLUMN public.profiles.response_rate IS
  'DEPRECATED, never computed. Read public_profiles.response_rate instead, which is measured from message history.';
COMMENT ON COLUMN public.profiles.response_time IS
  'DEPRECATED, never computed; defaulted to the literal string ''within 24h''. Read public_profiles.median_reply_hours instead.';


-- ══════════════════════════════════════════════════════════════
-- 4. Suburb statistic provenance
-- ══════════════════════════════════════════════════════════════
-- safety_score, vacancy_rate, migrant_pct and the demographic splits are
-- published as authoritative on 16 suburb pages with no source and no date.
-- These columns let the pages cite where a number came from and when, which
-- is both the honest thing and what makes the pages credible in search.

ALTER TABLE public.suburbs
  ADD COLUMN IF NOT EXISTS data_source text,
  ADD COLUMN IF NOT EXISTS data_as_at  date;

COMMENT ON COLUMN public.suburbs.data_source IS
  'Where these figures came from, e.g. "ABS Census 2021" or "SQM Research". Shown on the suburb page.';
COMMENT ON COLUMN public.suburbs.data_as_at IS
  'The date the figures were current. Shown on the suburb page.';


-- ══════════════════════════════════════════════════════════════
-- 5. Verification
-- ══════════════════════════════════════════════════════════════
-- Expect NULL response_rate for anyone with fewer than 3 conversations:
--   SELECT id, response_rate, response_sample_size FROM public_profiles LIMIT 10;
--
-- Expect the view to exist and be readable by anon:
--   SELECT COUNT(*) FROM public.user_response_stats;
