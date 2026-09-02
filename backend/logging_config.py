"""
Structured, redacted logging.

Every log line is JSON with a fixed set of keys, and the message text is
passed through a redactor that masks email addresses, bearer tokens, Stripe
keys and long hex/base64 blobs. Handlers never see the raw string, so a
careless f-string cannot leak a token into Render's log stream.
"""

from __future__ import annotations

import json
import logging
import re
import sys
from datetime import datetime, timezone

_PATTERNS = [
    (re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"), "<email>"),
    (re.compile(r"Bearer\s+[A-Za-z0-9._-]+", re.IGNORECASE), "Bearer <redacted>"),
    (re.compile(r"\b(sk|rk|pk)_(live|test)_[A-Za-z0-9]{8,}\b"), r"\1_\2_<redacted>"),
    (re.compile(r"\bwhsec_[A-Za-z0-9]{8,}\b"), "whsec_<redacted>"),
    (re.compile(r"\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b"), "<jwt>"),
    (re.compile(r"\b\+?61\s?4\d{2}\s?\d{3}\s?\d{3}\b"), "<phone>"),
    (re.compile(r"\b04\d{2}\s?\d{3}\s?\d{3}\b"), "<phone>"),
]


def redact(text: str) -> str:
    for pattern, replacement in _PATTERNS:
        text = pattern.sub(replacement, text)
    return text


class RedactingJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        try:
            message = record.getMessage()
        except Exception:
            message = str(record.msg)
        payload = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": redact(message),
        }
        if record.exc_info:
            payload["exc"] = redact(self.formatException(record.exc_info))
        for key in ("request_id", "route", "status_code"):
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        return json.dumps(payload, ensure_ascii=False)


def configure_logging(level: str = "INFO") -> None:
    root = logging.getLogger()
    for h in list(root.handlers):
        root.removeHandler(h)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(RedactingJsonFormatter())
    root.addHandler(handler)
    root.setLevel(level)
    # uvicorn's access log prints the raw path, which can carry a query
    # string; keep it but run it through the same formatter.
    for name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
        lg = logging.getLogger(name)
        lg.handlers = [handler]
        lg.propagate = False
