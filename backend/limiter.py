"""Rate limits (slowapi).

Counts live in a shared store when RATE_LIMIT_STORAGE_URI is set, for
example an Upstash Redis URL (rediss://default:<password>@<host>:6379), so
limits hold across deploys and across more than one instance
(MIGRENT_MASTER_AUDIT MIG-046). Without it, or if the store cannot be
reached, each process counts in its own memory as before: limits still
apply, but reset on every deploy.

The per-person key is the client address, which needs uvicorn's
--proxy-headers flag on Render (see Procfile); otherwise every request looks
like it came from Render's balancer and shares one bucket.
"""

import os

from slowapi import Limiter
from slowapi.util import get_remote_address

STORAGE_URI = os.environ.get("RATE_LIMIT_STORAGE_URI", "").strip()

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=STORAGE_URI or "memory://",
    # A store outage must not take the API down: fall back to memory.
    in_memory_fallback_enabled=bool(STORAGE_URI),
    swallow_errors=bool(STORAGE_URI),
    key_prefix="migrent",
)
