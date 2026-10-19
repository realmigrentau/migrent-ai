"""Rate limits (slowapi).

Counts live in a shared store when RATE_LIMIT_STORAGE_URI is set, for
example an Upstash Redis URL (rediss://default:<password>@<host>:6379), so
limits hold across deploys and across more than one instance
(MIGRENT_MASTER_AUDIT MIG-046). Without it, or if the store cannot be
reached, each process counts in its own memory as before: limits still
apply, but reset on every deploy.

Every endpoint has a limit. Routes with their own @limiter.limit keep it;
every other route gets DEFAULT_LIMIT through default_limit, an app-wide
dependency (main.py). It runs after routing, so it sees the real endpoint
however routers are nested; slowapi's own middleware looks the route up in
app.routes and finds nothing once FastAPI keeps included routers nested
(0.140+), which would quietly leave those routes unlimited.
Routes that must never be limited (the Stripe webhook, health checks) are
marked @limiter.exempt.

Who is "one person" (client_ip)
-------------------------------
uvicorn runs with --proxy-headers --forwarded-allow-ips="*" (Procfile), and
with "*" it takes the LEFTMOST X-Forwarded-For entry as the client address.
That entry is whatever the caller typed: on 2026-10-19 sending a different
made-up X-Forwarded-For with each request let 66 searches through a 60 a
minute limit, so every limit (sign-in, codes, contact form) could be skipped.

client_ip never reads request.client.host for that reason. It uses, in order:
  1. RATE_LIMIT_IP_HEADER (default CF-Connecting-IP). Render's edge is
     Cloudflare, which overwrites this header with the address that actually
     connected, so a caller cannot choose it.
  2. The RIGHTMOST X-Forwarded-For entry: the one added by the nearest proxy,
     not by the caller.
  3. The socket address, for local runs and tests.
IPv6 addresses are counted per /64, the block one household or phone gets,
so rotating through addresses in one block does not reset the count.
"""

from __future__ import annotations

import ipaddress
import os
from typing import Optional

from slowapi import Limiter
from starlette.requests import Request

STORAGE_URI = os.environ.get("RATE_LIMIT_STORAGE_URI", "").strip()
# Generous: one Hub screen makes a handful of calls, and a university or
# office can put many people behind one address.
DEFAULT_LIMIT = os.environ.get("RATE_LIMIT_DEFAULT", "600/minute").strip() or "600/minute"
TRUSTED_IP_HEADER = os.environ.get("RATE_LIMIT_IP_HEADER", "cf-connecting-ip").strip().lower()


def _normalise(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    try:
        ip = ipaddress.ip_address(value.strip().split("%")[0])
    except ValueError:
        return None
    if ip.version == 6:
        if ip.ipv4_mapped:
            return str(ip.ipv4_mapped)
        return str(ipaddress.ip_network(f"{ip}/64", strict=False))
    return str(ip)


def client_ip(request) -> str:
    """The address rate limits and audit records attribute a request to."""
    headers = request.headers
    if TRUSTED_IP_HEADER:
        trusted = _normalise(headers.get(TRUSTED_IP_HEADER))
        if trusted:
            return trusted
    forwarded = [part.strip() for part in headers.get("x-forwarded-for", "").split(",") if part.strip()]
    if forwarded:
        nearest = _normalise(forwarded[-1])
        if nearest:
            return nearest
    peer = request.client.host if request.client else None
    return _normalise(peer) or peer or "unknown"


limiter = Limiter(
    key_func=client_ip,
    default_limits=[DEFAULT_LIMIT],
    storage_uri=STORAGE_URI or "memory://",
    # A store outage must not take the API down: fall back to memory.
    in_memory_fallback_enabled=bool(STORAGE_URI),
    swallow_errors=bool(STORAGE_URI),
    key_prefix="migrent",
    headers_enabled=False,
)


def default_limit(request: Request) -> None:
    """App-wide dependency: DEFAULT_LIMIT for routes without their own limit."""
    endpoint = request.scope.get("endpoint")
    if endpoint is None or not limiter.enabled:
        return
    name = f"{endpoint.__module__}.{endpoint.__name__}"
    if name in limiter._route_limits or name in limiter._exempt_routes:
        return
    # in_middleware=True: check the application and default limits only.
    limiter._check_request_limit(request, endpoint, True)
