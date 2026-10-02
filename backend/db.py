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


# ---------------------------------------------------------------------------
# Connection reuse
#
# The database is in Sydney and the API runs a long way from it, so every
# new HTTPS connection costs several round trips before a query even starts.
# This module used to build a brand-new client (and so a new connection) on
# every call, which is most of why every request took a second or more.
#
# The service-role client below is created once per process and shared.
# That is safe because nothing signs in on it: it only runs PostgREST
# queries, storage calls and stateless auth.admin calls, none of which change
# the client's own session. The anon client is still created fresh on every
# call, because the sign-up, sign-in and magic-link routes DO sign in on it,
# and a shared client would then carry one person's session into another
# person's request.
#
# PostgREST's HTTP client (HTTP/2) closes idle connections after 5 seconds
# by default, so a quiet minute meant a fresh handshake again. It is kept
# open for a minute instead.
# ---------------------------------------------------------------------------

import threading

import httpx
from postgrest._sync import client as _postgrest_sync_client
from postgrest.utils import SyncClient as _PostgrestSyncClient

KEEPALIVE_SECONDS = 60.0


def _create_session(self, base_url, headers, timeout, verify=True, proxy=None):
    return _PostgrestSyncClient(
        base_url=base_url,
        headers=headers,
        timeout=timeout,
        verify=verify,
        proxy=proxy,
        follow_redirects=True,
        http2=True,
        limits=httpx.Limits(max_connections=100, max_keepalive_connections=20, keepalive_expiry=KEEPALIVE_SECONDS),
    )


_postgrest_sync_client.SyncPostgrestClient.create_session = _create_session


def _keep_auth_connection_open(client) -> None:
    """Give the shared client's auth API the same long-lived connection.

    Token checks that cannot be done locally (admin requests, older tokens)
    ask Supabase Auth over this client. Its default HTTP client drops idle
    connections after 5 seconds, so most checks paid for a new connection
    to Sydney (about half a second from the API) on top of the answer.
    """
    auth = getattr(client, "auth", None)
    if auth is None or not hasattr(auth, "_http_client"):
        return
    from gotrue.http_clients import SyncClient as _GoTrueSyncClient

    auth._http_client = _GoTrueSyncClient(
        verify=True,
        follow_redirects=True,
        http2=True,
        limits=httpx.Limits(max_connections=100, max_keepalive_connections=20, keepalive_expiry=KEEPALIVE_SECONDS),
    )


_admin_client: "Client | None" = None
_admin_lock = threading.Lock()


def get_supabase() -> Client:
    """
    Get a NEW Supabase client with the anon key.

    Always a fresh client: the auth routes sign in on it, and a signed-in
    client must never be shared between requests.

    Returns:
        Client: Supabase client using public/anon key
    """
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_supabase_admin() -> Client:
    """
    Get the shared Supabase client with the service role key.

    Service role key has full database access and bypasses RLS policies.
    Falls back to anon key if service role key is not configured.

    Never sign in on this client (see the note at the top of this section).

    Returns:
        Client: Supabase client with admin/service role credentials
    """
    global _admin_client
    client = _admin_client
    if client is not None:
        return client
    with _admin_lock:
        if _admin_client is None:
            if SUPABASE_SERVICE_ROLE_KEY:
                logger.debug("Using SUPABASE_SERVICE_ROLE_KEY for admin client")
                _admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            else:
                # Fallback to anon key (will respect RLS policies)
                logger.warning(
                    "SUPABASE_SERVICE_ROLE_KEY not set. Falling back to ANON_KEY. "
                    "This may cause RLS policy issues with updates. "
                    "Set SUPABASE_SERVICE_ROLE_KEY in environment for full admin access."
                )
                _admin_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
            _keep_auth_connection_open(_admin_client)
        return _admin_client


# ---------------------------------------------------------------------------
# Keeping the connections warm
#
# Keepalive only helps while requests keep coming. On a quiet site most
# requests arrive after the connections to Sydney have gone idle and closed,
# so each one paid for fresh connections first. A background thread touches
# the database and Auth every KEEP_WARM_SECONDS (well inside the keepalive
# window) so a real request always finds them open, and refreshes the
# token-signing keys before they expire so no request waits on that either.
#
# Each touch is a one-row read and a health check: a few thousand tiny
# requests a day. KEEP_WARM_SECONDS=0 turns it off.
# ---------------------------------------------------------------------------

KEEP_WARM_SECONDS = float(os.environ.get("KEEP_WARM_SECONDS", "25") or 0)
JWKS_REFRESH_SECONDS = 30 * 60

_warm_thread: "threading.Thread | None" = None


def _warm_once(refresh_keys: bool) -> None:
    client = get_supabase_admin()
    try:
        client.table("listings").select("id").limit(1).execute()
    except Exception:
        logger.debug("keep-warm: database touch failed", exc_info=True)
    try:
        client.auth._request("GET", "health")
    except Exception:
        logger.debug("keep-warm: auth touch failed", exc_info=True)
    if refresh_keys:
        try:
            from auth_utils import refresh_signing_keys

            refresh_signing_keys()
        except Exception:
            logger.debug("keep-warm: signing key refresh failed", exc_info=True)


def start_keep_warm() -> None:
    """Start the keep-warm thread once per process (no-op when disabled)."""
    global _warm_thread
    if KEEP_WARM_SECONDS <= 0 or _warm_thread is not None:
        return

    def loop():
        import time

        last_keys = 0.0
        while True:
            now = time.monotonic()
            refresh = now - last_keys >= JWKS_REFRESH_SECONDS
            _warm_once(refresh)
            if refresh:
                last_keys = now
            time.sleep(KEEP_WARM_SECONDS)

    _warm_thread = threading.Thread(target=loop, name="keep-warm", daemon=True)
    _warm_thread.start()
