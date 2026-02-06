"""
Database configuration and client initialization.

Handles Supabase client creation with proper key selection and fallback logic.
"""

import os
import logging
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# Load environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()

# Validate required configuration
if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL environment variable is not set")

if not SUPABASE_ANON_KEY:
    raise RuntimeError("SUPABASE_ANON_KEY environment variable is not set")


def get_supabase() -> Client:
    """
    Get Supabase client with anon key.

    Use this for client-side operations where you want RLS policies to apply.

    Returns:
        Client: Supabase client using public/anon key
    """
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_supabase_admin() -> Client:
    """
    Get Supabase client with service role key for admin operations.

    Service role key has full database access and bypasses RLS policies.
    Falls back to anon key if service role key is not configured.

    Returns:
        Client: Supabase client with admin/service role credentials

    Raises:
        RuntimeError: If neither service role key nor anon key is available
    """
    # Try to use service role key first (admin access)
    if SUPABASE_SERVICE_ROLE_KEY:
        logger.debug("Using SUPABASE_SERVICE_ROLE_KEY for admin client")
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    # Fallback to anon key (will respect RLS policies)
    logger.warning(
        "SUPABASE_SERVICE_ROLE_KEY not set. Falling back to ANON_KEY. "
        "This may cause RLS policy issues with updates. "
        "Set SUPABASE_SERVICE_ROLE_KEY in environment for full admin access."
    )
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
