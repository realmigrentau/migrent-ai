"""
Run independent database reads at the same time.

The API is a long way from the database, so every query costs a network
round trip. A handler that needs five unrelated things used to wait for
them one after another; `run_parallel` starts them together over the shared
HTTP/2 connection (see db.py) and returns their results in order.

Each call gets its own short-lived pool sized to the work, so a parallel
call can never wait on a slot held by another request. Exceptions are
re-raised in the caller, first failing function first, exactly as if the
functions had run in sequence.
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from typing import Any, Callable


def run_parallel(*fns: Callable[[], Any]) -> list[Any]:
    if len(fns) <= 1:
        return [fn() for fn in fns]
    with ThreadPoolExecutor(max_workers=len(fns), thread_name_prefix="parallel") as pool:
        futures = [pool.submit(fn) for fn in fns]
        return [f.result() for f in futures]
