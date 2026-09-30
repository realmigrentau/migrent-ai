-- 044_admin_panel_password.sql
-- The Admin panel in Migrent Hub has its own password, on top of signing in.
--
-- Additive and idempotent. Safe to run before or after the backend that
-- uses it: until the backend is deployed nothing reads the new table, and
-- the audit constraint only gains values.

-- ══════════════════════════════════════════════════════════════
-- 1. The admin panel password (one row, a salted PBKDF2 hash)
-- ══════════════════════════════════════════════════════════════
-- Never the password itself. Read and written only by the backend under the
-- service role (backend/admin_panel.py); RLS on with no policies and no
-- grants, so the browser cannot see even the hash.

CREATE TABLE IF NOT EXISTS public.admin_panel_settings (
  id            smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash text NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.admin_panel_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_panel_settings FROM anon, authenticated;


-- ══════════════════════════════════════════════════════════════
-- 2. Audit: unlocking, wrong passwords, lockouts, password changes
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_action_check;
ALTER TABLE public.admin_audit_log ADD CONSTRAINT admin_audit_log_action_check
  CHECK (action IN (
    'approve', 'reject', 'request_changes', 'suspend_user', 'unsuspend_user',
    'flag', 'hide', 'unflag', 'request_delete', 'confirm_delete',
    'pause', 'unpause', 'approve_id', 'reject_id',
    'finalise_application', 'stop_application', 'request_application_corrections',
    'view_as_start', 'view_as_end',
    'assign_report', 'resolve_report', 'dismiss_report', 'change_role',
    'admin_panel_unlock', 'admin_panel_failed', 'admin_panel_lockout', 'admin_panel_password_changed'
  ));
-- Target types are unchanged (these entries target the admin's own 'user').
