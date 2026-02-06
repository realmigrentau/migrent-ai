import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def get_supabase() -> Client:
    """Get Supabase client with anon key (for authenticated requests)."""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_supabase_admin() -> Client:
    """Get Supabase client with service role key (for admin operations)."""
    if not SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL must be set")

    # Service role key is required for proper admin operations
    # If not available, warn and fall back to anon key (with RLS restrictions)
    if not SUPABASE_SERVICE_ROLE_KEY:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning("SUPABASE_SERVICE_ROLE_KEY not set. Falling back to ANON_KEY. This may cause RLS issues with updates.")

    key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set")

    return create_client(SUPABASE_URL, key)
