"""
Database configuration and client initialization.

Handles Supabase client creation with proper key selection and fallback logic.
"""

import os
import logging
from supabase import ClientOptions, create_client, Client

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
# The default HTTP clients close idle connections after 5 seconds, so a quiet
# minute meant a fresh handshake again. The shared client is given one HTTP/2
# connection pool, kept open for a minute, that its database, storage and
# auth calls all use. Token checks that cannot be done locally (admin
# requests, older tokens) ask Supabase Auth over it too, so they no longer pay
# for a new connection to Sydney (about half a second from the API) each time.
#
# The pool is handed over through ClientOptions(httpx_client=...), the
# library's supported setting. Older versions had none, so this module used
# to patch postgrest and gotrue internals, which supabase 2.33 removed.
# ---------------------------------------------------------------------------

import threading

import httpx

KEEPALIVE_SECONDS = 60.0


def _shared_http_client() -> httpx.Client:
    return httpx.Client(
        follow_redirects=True,
        http2=True,
        timeout=httpx.Timeout(30.0, connect=10.0),
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
            options = ClientOptions(httpx_client=_shared_http_client())
            if SUPABASE_SERVICE_ROLE_KEY:
                logger.debug("Using SUPABASE_SERVICE_ROLE_KEY for admin client")
                _admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options)
            else:
                # Fallback to anon key (will respect RLS policies)
                logger.warning(
                    "SUPABASE_SERVICE_ROLE_KEY not set. Falling back to ANON_KEY. "
                    "This may cause RLS policy issues with updates. "
                    "Set SUPABASE_SERVICE_ROLE_KEY in environment for full admin access."
                )
                _admin_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY, options)
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
# Each touch is the suspended-accounts read search needs anyway (see
# listing_lifecycle) and an Auth health check: a few thousand tiny requests a
# day. KEEP_WARM_SECONDS=0 turns it off.
# ---------------------------------------------------------------------------

KEEP_WARM_SECONDS = float(os.environ.get("KEEP_WARM_SECONDS", "25") or 0)
JWKS_REFRESH_SECONDS = 30 * 60

_warm_thread: "threading.Thread | None" = None


def _warm_once(refresh_keys: bool) -> None:
    client = get_supabase_admin()
    try:
        # A real read every search needs, so it doubles as the database
        # touch: public search then always finds the list fresh.
        from listing_lifecycle import suspended_owner_ids

        suspended_owner_ids(refresh=True)
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


# ---------------------------------------------------------------------------
# Search words inside a PostgREST filter
#
# .or_("suburb.ilike.%{term}%,city.ilike.%{term}%") is filter syntax, not a
# value: a comma or bracket in the term starts a new condition. On the
# public search (as the service role, on the full listings table) a term like
# "x%,address.like.12 Smith*,city.ilike.%x" added its own condition, so a
# listing appeared or not depending on its private street address, exact
# position or owner. Repeating that reads them out one character at a time.
#
# Every term that goes into an .or_() string passes through here first. Only
# letters, digits, spaces and . @ + ' - _ survive: enough for any suburb,
# name or email address, and none of them can start a condition (that takes
# a comma, a bracket or a quote). The * and % wildcards go too, and the
# length is capped. An empty result means "do not filter on it".
# ---------------------------------------------------------------------------

import re as _re

_FILTER_UNSAFE = _re.compile(r"[^\w\s.@+'\-]", _re.UNICODE)


def filter_term(value: object, max_length: int = 80) -> str:
    text = _FILTER_UNSAFE.sub(" ", str(value or ""))
    return " ".join(text.split())[:max_length].strip()
