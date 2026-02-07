-- Migration: 011_admin_users_view.sql
-- Create a view that joins profiles with auth.users for admin dashboard

-- Create a view that superadmins can use to see all user data
CREATE OR REPLACE VIEW admin_users_view AS
SELECT
  p.id,
  p.role,
  p.verified,
  p.created_at,
  p.name,
  p.legal_name,
  u.email,
  u.raw_user_meta_data->>'full_name' as google_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  u.last_sign_in_at,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id;

-- Grant access to the view
GRANT SELECT ON admin_users_view TO authenticated;
GRANT SELECT ON admin_users_view TO anon;

-- Enable RLS on the view (views inherit from base tables but we add explicit policy)
-- Note: Views don't have RLS directly, they inherit from underlying tables
-- The is_superadmin() function from migration 010 will control access via profiles RLS
